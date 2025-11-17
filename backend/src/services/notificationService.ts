import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import prisma from '../config/database';
import logger from '../config/logger';

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Configurar Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface NotificacaoData {
  tipo: 'ESTOQUE_MINIMO' | 'PRODUTO_VENCENDO' | 'PAGAMENTO_PENDENTE' | 'SERVICO_OFFLINE' | 'ERRO_SISTEMA';
  titulo: string;
  mensagem: string;
  condominioId?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
}

export const enviarNotificacao = async (dados: NotificacaoData): Promise<void> => {
  try {
    // Criar registro de notificação
    const notificacao = await prisma.notificacao.create({
      data: {
        tipo: dados.tipo,
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        condominioId: dados.condominioId,
        email: dados.email,
        telefone: dados.telefone,
        whatsapp: dados.whatsapp,
      },
    });

    // Enviar notificações
    const resultados = await Promise.allSettled([
      dados.email ? enviarEmail(dados) : Promise.resolve(),
      dados.telefone ? enviarSMS(dados) : Promise.resolve(),
      dados.whatsapp ? enviarWhatsApp(dados) : Promise.resolve(),
    ]);

    // Verificar se alguma enviou com sucesso
    const algumaSucesso = resultados.some(
      (r) => r.status === 'fulfilled'
    );

    // Atualizar registro
    await prisma.notificacao.update({
      where: { id: notificacao.id },
      data: {
        enviada: algumaSucesso,
        enviadaEm: algumaSucesso ? new Date() : undefined,
        erro: algumaSucesso
          ? undefined
          : 'Falha ao enviar todas as notificações',
      },
    });

    logger.info(`Notificação enviada: ${dados.titulo}`);
  } catch (error: any) {
    logger.error('Erro ao enviar notificação:', error);
  }
};

const enviarEmail = async (dados: NotificacaoData): Promise<void> => {
  try {
    if (!dados.email) return;

    await sgMail.send({
      to: dados.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@vendasmax.com.br',
        name: process.env.SENDGRID_FROM_NAME || 'VendasMax',
      },
      subject: dados.titulo,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">${dados.titulo}</h2>
          <p style="color: #666; line-height: 1.6;">${dados.mensagem}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Esta é uma notificação automática do sistema VendasMax.
          </p>
        </div>
      `,
    });

    logger.info(`Email enviado para: ${dados.email}`);
  } catch (error: any) {
    logger.error('Erro ao enviar email:', error);
    throw error;
  }
};

const enviarSMS = async (dados: NotificacaoData): Promise<void> => {
  try {
    if (!dados.telefone) return;

    await twilioClient.messages.create({
      body: `${dados.titulo}\n\n${dados.mensagem}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: dados.telefone,
    });

    logger.info(`SMS enviado para: ${dados.telefone}`);
  } catch (error: any) {
    logger.error('Erro ao enviar SMS:', error);
    throw error;
  }
};

const enviarWhatsApp = async (dados: NotificacaoData): Promise<void> => {
  try {
    if (!dados.whatsapp) return;

    await twilioClient.messages.create({
      body: `*${dados.titulo}*\n\n${dados.mensagem}`,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${dados.whatsapp}`,
    });

    logger.info(`WhatsApp enviado para: ${dados.whatsapp}`);
  } catch (error: any) {
    logger.error('Erro ao enviar WhatsApp:', error);
    throw error;
  }
};

// Função para verificar estoque mínimo
export const verificarEstoqueMinimo = async (): Promise<void> => {
  try {
    const estoquesBaixos = await prisma.containerEstoque.findMany({
      where: {
        quantidade: {
          lte: prisma.produto.fields.estoqueMinimo,
        },
      },
      include: {
        produto: true,
        container: {
          include: {
            condominio: true,
          },
        },
      },
    });

    for (const estoque of estoquesBaixos) {
      await enviarNotificacao({
        tipo: 'ESTOQUE_MINIMO',
        titulo: 'Alerta de Estoque Mínimo',
        mensagem: `O produto "${estoque.produto.nome}" no container "${estoque.container.localizacao}" do condomínio "${estoque.container.condominio.nome}" atingiu o estoque mínimo.\n\nQuantidade atual: ${estoque.quantidade}\nEstoque mínimo: ${estoque.produto.estoqueMinimo}`,
        condominioId: estoque.container.condominioId,
        email: process.env.NOTIFICATION_EMAIL,
        telefone: process.env.NOTIFICATION_PHONE,
        whatsapp: process.env.NOTIFICATION_WHATSAPP,
      });
    }

    logger.info(
      `Verificação de estoque concluída: ${estoquesBaixos.length} alertas enviados`
    );
  } catch (error) {
    logger.error('Erro ao verificar estoque mínimo:', error);
  }
};

// Função para verificar produtos próximos do vencimento
export const verificarProdutosVencendo = async (): Promise<void> => {
  try {
    const diasAntes = Number(process.env.STOCK_ALERT_DAYS_BEFORE_EXPIRY) || 3;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + diasAntes);

    const produtosVencendo = await prisma.containerEstoque.findMany({
      where: {
        dataValidade: {
          lte: dataLimite,
          gte: new Date(),
        },
      },
      include: {
        produto: true,
        container: {
          include: {
            condominio: true,
          },
        },
      },
    });

    for (const estoque of produtosVencendo) {
      const diasRestantes = Math.ceil(
        (estoque.dataValidade!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await enviarNotificacao({
        tipo: 'PRODUTO_VENCENDO',
        titulo: 'Alerta de Produto Próximo ao Vencimento',
        mensagem: `O produto "${estoque.produto.nome}" no container "${estoque.container.localizacao}" do condomínio "${estoque.container.condominio.nome}" está próximo do vencimento.\n\nData de validade: ${estoque.dataValidade?.toLocaleDateString('pt-BR')}\nDias restantes: ${diasRestantes}\nQuantidade: ${estoque.quantidade}`,
        condominioId: estoque.container.condominioId,
        email: process.env.NOTIFICATION_EMAIL,
        telefone: process.env.NOTIFICATION_PHONE,
        whatsapp: process.env.NOTIFICATION_WHATSAPP,
      });
    }

    logger.info(
      `Verificação de validade concluída: ${produtosVencendo.length} alertas enviados`
    );
  } catch (error) {
    logger.error('Erro ao verificar produtos vencendo:', error);
  }
};

// Função para notificar serviços offline
export const notificarServicoOffline = async (
  containerId: string,
  servico: string,
  status: string
): Promise<void> => {
  try {
    const container = await prisma.container.findUnique({
      where: { id: containerId },
      include: { condominio: true },
    });

    if (!container) return;

    await enviarNotificacao({
      tipo: 'SERVICO_OFFLINE',
      titulo: 'Alerta de Serviço Offline',
      mensagem: `O serviço "${servico}" no container "${container.localizacao}" do condomínio "${container.condominio.nome}" está com status: ${status}.\n\nPor favor, verifique a conexão e tente novamente.`,
      condominioId: container.condominioId,
      email: process.env.NOTIFICATION_EMAIL,
      telefone: process.env.NOTIFICATION_PHONE,
      whatsapp: process.env.NOTIFICATION_WHATSAPP,
    });
  } catch (error) {
    logger.error('Erro ao notificar serviço offline:', error);
  }
};
