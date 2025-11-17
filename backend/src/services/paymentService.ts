import Stripe from 'stripe';
import mercadopago from 'mercadopago';
import prisma from '../config/database';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';

// Configurar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export interface PaymentData {
  vendaId: string;
  metodoPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO';
  gateway?: 'STRIPE' | 'MERCADOPAGO' | 'MAQUININHA';
  valorPago: number;
  cardToken?: string;
  maquininhaId?: string;
}

export const processarPagamento = async (
  dados: PaymentData,
  tentativa: number = 1
): Promise<any> => {
  const maxTentativas = 3;

  try {
    // Buscar venda
    const venda = await prisma.venda.findUnique({
      where: { id: dados.vendaId },
    });

    if (!venda) {
      throw new AppError('Venda não encontrada', 404);
    }

    // Criar registro de pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        vendaId: dados.vendaId,
        metodoPagamento: dados.metodoPagamento,
        gateway: dados.gateway,
        valorPago: dados.valorPago,
        status: 'PROCESSANDO',
        tentativas: tentativa,
        maquininha: dados.maquininhaId,
      },
    });

    let resultado: any = null;

    try {
      // Processar de acordo com o gateway
      if (dados.gateway === 'STRIPE') {
        resultado = await processarPagamentoStripe(dados, pagamento.id);
      } else if (dados.gateway === 'MERCADOPAGO') {
        resultado = await processarPagamentoMercadoPago(dados, pagamento.id);
      } else if (dados.gateway === 'MAQUININHA') {
        resultado = await processarPagamentoMaquininha(dados, pagamento.id);
      } else if (dados.metodoPagamento === 'DINHEIRO') {
        // Pagamento em dinheiro não precisa processar
        resultado = { status: 'APROVADO' };
      }

      // Atualizar pagamento
      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: {
          status: resultado.status === 'APROVADO' ? 'APROVADO' : 'RECUSADO',
          transactionId: resultado.transactionId,
          pixQrCode: resultado.pixQrCode,
          pixQrCodeUrl: resultado.pixQrCodeUrl,
        },
      });

      // Registrar histórico
      await prisma.pagamentoHistorico.create({
        data: {
          pagamentoId: pagamento.id,
          tentativa,
          status: resultado.status,
          mensagem: resultado.mensagem,
        },
      });

      // Se aprovado, atualizar venda
      if (resultado.status === 'APROVADO') {
        await prisma.venda.update({
          where: { id: dados.vendaId },
          data: { status: 'PAGO' },
        });

        await prisma.logVenda.create({
          data: {
            vendaId: dados.vendaId,
            tipo: 'PAGAMENTO',
            mensagem: 'Pagamento aprovado',
            dados: JSON.stringify(resultado),
          },
        });
      }

      logger.info(`Pagamento processado: ${pagamento.id} - ${resultado.status}`);

      return {
        sucesso: resultado.status === 'APROVADO',
        pagamento,
        resultado,
      };
    } catch (error: any) {
      // Registrar erro
      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: {
          status: 'ERRO',
          erroMensagem: error.message,
        },
      });

      await prisma.pagamentoHistorico.create({
        data: {
          pagamentoId: pagamento.id,
          tentativa,
          status: 'ERRO',
          erro: error.message,
        },
      });

      // Tentar novamente se não atingiu o máximo
      if (tentativa < maxTentativas) {
        logger.warn(
          `Tentativa ${tentativa} falhou, tentando novamente... Erro: ${error.message}`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * tentativa)
        ); // Delay exponencial
        return processarPagamento(dados, tentativa + 1);
      }

      // Se atingiu máximo de tentativas
      await prisma.logVenda.create({
        data: {
          vendaId: dados.vendaId,
          tipo: 'ERRO_PAGAMENTO',
          mensagem: `Falha após ${maxTentativas} tentativas`,
          dados: error.message,
        },
      });

      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const processarPagamentoStripe = async (
  dados: PaymentData,
  pagamentoId: string
): Promise<any> => {
  try {
    if (dados.metodoPagamento === 'PIX') {
      // Criar sessão PIX no Stripe (via checkout ou payment intent)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(dados.valorPago * 100), // Converter para centavos
        currency: 'brl',
        payment_method_types: ['card'], // Stripe não suporta PIX diretamente
        metadata: {
          vendaId: dados.vendaId,
          pagamentoId,
        },
      });

      return {
        status: 'PENDENTE',
        transactionId: paymentIntent.id,
        mensagem: 'PIX pendente de pagamento',
      };
    } else {
      // Processar cartão
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(dados.valorPago * 100),
        currency: 'brl',
        payment_method: dados.cardToken,
        confirm: true,
        metadata: {
          vendaId: dados.vendaId,
          pagamentoId,
        },
        return_url: process.env.API_URL + '/api/pagamentos/stripe/callback',
      });

      return {
        status: paymentIntent.status === 'succeeded' ? 'APROVADO' : 'RECUSADO',
        transactionId: paymentIntent.id,
        mensagem:
          paymentIntent.status === 'succeeded'
            ? 'Pagamento aprovado'
            : 'Pagamento recusado',
      };
    }
  } catch (error: any) {
    logger.error('Erro ao processar pagamento Stripe:', error);
    throw new AppError(error.message || 'Erro ao processar pagamento', 500);
  }
};

const processarPagamentoMercadoPago = async (
  dados: PaymentData,
  pagamentoId: string
): Promise<any> => {
  try {
    if (dados.metodoPagamento === 'PIX') {
      // Criar pagamento PIX
      const payment = await mercadopago.payment.create({
        transaction_amount: dados.valorPago,
        description: `Venda ${dados.vendaId}`,
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@email.com', // Ideal seria receber do cliente
        },
        metadata: {
          venda_id: dados.vendaId,
          pagamento_id: pagamentoId,
        },
      });

      return {
        status: 'PENDENTE',
        transactionId: payment.body.id.toString(),
        pixQrCode: payment.body.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeUrl:
          payment.body.point_of_interaction?.transaction_data?.qr_code_base64,
        mensagem: 'PIX gerado com sucesso',
      };
    } else {
      // Processar cartão
      const payment = await mercadopago.payment.create({
        transaction_amount: dados.valorPago,
        token: dados.cardToken,
        description: `Venda ${dados.vendaId}`,
        installments: 1,
        payment_method_id: dados.metodoPagamento === 'CREDITO' ? 'credit_card' : 'debit_card',
        payer: {
          email: 'cliente@email.com',
        },
        metadata: {
          venda_id: dados.vendaId,
          pagamento_id: pagamentoId,
        },
      });

      return {
        status: payment.body.status === 'approved' ? 'APROVADO' : 'RECUSADO',
        transactionId: payment.body.id.toString(),
        mensagem: payment.body.status_detail || 'Pagamento processado',
      };
    }
  } catch (error: any) {
    logger.error('Erro ao processar pagamento Mercado Pago:', error);
    throw new AppError(error.message || 'Erro ao processar pagamento', 500);
  }
};

const processarPagamentoMaquininha = async (
  dados: PaymentData,
  pagamentoId: string
): Promise<any> => {
  // Aqui você implementaria a integração com a API da maquininha
  // Como cada maquininha tem sua própria API, este é um exemplo genérico
  try {
    logger.info(`Processando pagamento na maquininha: ${dados.maquininhaId}`);

    // Simulação - em produção, você faria uma chamada à API da maquininha
    // Exemplo: PagSeguro, Stone, Cielo, etc.

    // Por enquanto, retornar sucesso simulado
    return {
      status: 'APROVADO',
      transactionId: `MAQ_${Date.now()}`,
      mensagem: 'Pagamento aprovado na maquininha',
    };
  } catch (error: any) {
    logger.error('Erro ao processar pagamento na maquininha:', error);
    throw new AppError(error.message || 'Erro ao processar pagamento', 500);
  }
};

export const verificarStatusPagamentoPIX = async (
  pagamentoId: string
): Promise<any> => {
  try {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id: pagamentoId },
    });

    if (!pagamento || !pagamento.transactionId) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    let status = pagamento.status;

    if (pagamento.gateway === 'MERCADOPAGO') {
      const payment = await mercadopago.payment.get(
        Number(pagamento.transactionId)
      );
      status = payment.body.status === 'approved' ? 'APROVADO' : pagamento.status;

      if (status === 'APROVADO') {
        await prisma.pagamento.update({
          where: { id: pagamentoId },
          data: { status: 'APROVADO' },
        });

        await prisma.venda.update({
          where: { id: pagamento.vendaId },
          data: { status: 'PAGO' },
        });
      }
    }

    return { status };
  } catch (error) {
    throw error;
  }
};
