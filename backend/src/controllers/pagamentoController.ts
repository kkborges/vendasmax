import { Request, Response } from 'express';
import { processarPagamento, verificarStatusPagamentoPIX } from '../services/paymentService';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const criarPagamento = async (req: Request, res: Response) => {
  try {
    const resultado = await processarPagamento(req.body);

    res.status(201).json({
      mensagem: resultado.sucesso
        ? 'Pagamento processado com sucesso'
        : 'Pagamento recusado ou pendente',
      ...resultado,
    });
  } catch (error) {
    throw error;
  }
};

export const verificarPagamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resultado = await verificarStatusPagamentoPIX(id);

    res.json(resultado);
  } catch (error) {
    throw error;
  }
};

export const listarPagamentos = async (req: Request, res: Response) => {
  try {
    const { vendaId, status } = req.query;

    const where: any = {};

    if (vendaId) {
      where.vendaId = String(vendaId);
    }

    if (status) {
      where.status = String(status);
    }

    const pagamentos = await prisma.pagamento.findMany({
      where,
      include: {
        venda: true,
        historico: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ pagamentos });
  } catch (error) {
    throw error;
  }
};

export const webhookStripe = async (req: Request, res: Response) => {
  try {
    // Processar webhook do Stripe
    const event = req.body;

    logger.info('Webhook Stripe recebido:', event.type);

    // Aqui você processaria os diferentes tipos de eventos do Stripe
    // payment_intent.succeeded, payment_intent.payment_failed, etc.

    res.json({ received: true });
  } catch (error) {
    throw error;
  }
};

export const webhookMercadoPago = async (req: Request, res: Response) => {
  try {
    // Processar webhook do Mercado Pago
    const event = req.body;

    logger.info('Webhook Mercado Pago recebido:', event.type);

    // Aqui você processaria os diferentes tipos de eventos do Mercado Pago

    res.json({ received: true });
  } catch (error) {
    throw error;
  }
};
