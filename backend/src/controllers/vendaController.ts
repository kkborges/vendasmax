import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const criarVenda = async (req: Request, res: Response) => {
  try {
    const {
      containerId,
      itens,
      clienteNome,
      clienteBloco,
      clienteApto,
      clienteContato,
      modoOffline,
      observacao,
    } = req.body;

    if (!containerId || !itens || itens.length === 0) {
      throw new AppError('Container e itens são obrigatórios', 400);
    }

    // Verificar container
    const container = await prisma.container.findUnique({
      where: { id: containerId },
    });

    if (!container) {
      throw new AppError('Container não encontrado', 404);
    }

    // Calcular valor total e validar estoque
    let valorTotal = 0;
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      });

      if (!produto) {
        throw new AppError(`Produto ${item.produtoId} não encontrado`, 404);
      }

      // Verificar estoque no container
      const estoque = await prisma.containerEstoque.findFirst({
        where: {
          containerId,
          produtoId: item.produtoId,
        },
      });

      if (!estoque || estoque.quantidade < item.quantidade) {
        throw new AppError(
          `Estoque insuficiente para o produto ${produto.nome}`,
          400
        );
      }

      valorTotal += Number(produto.valorVenda) * item.quantidade;
    }

    // Gerar número da venda
    const numeroVenda = `V${Date.now()}`;

    // Criar venda
    const venda = await prisma.venda.create({
      data: {
        containerId,
        numeroVenda,
        valorTotal,
        status: 'PENDENTE',
        modoOffline: modoOffline || false,
        sincronizada: !modoOffline,
        clienteNome,
        clienteBloco,
        clienteApto,
        clienteContato,
        observacao,
      },
    });

    // Criar itens da venda e atualizar estoque
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      });

      await prisma.vendaItem.create({
        data: {
          vendaId: venda.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: produto!.valorVenda,
          valorTotal: Number(produto!.valorVenda) * item.quantidade,
          desconto: item.desconto || 0,
        },
      });

      // Atualizar estoque do container
      await prisma.containerEstoque.updateMany({
        where: {
          containerId,
          produtoId: item.produtoId,
        },
        data: {
          quantidade: {
            decrement: item.quantidade,
          },
        },
      });

      // Registrar movimentação
      await prisma.movimentacaoEstoque.create({
        data: {
          produtoId: item.produtoId,
          tipo: 'SAIDA',
          quantidade: item.quantidade,
          origem: containerId,
          observacao: `Venda ${numeroVenda}`,
        },
      });
    }

    // Log
    await prisma.logVenda.create({
      data: {
        vendaId: venda.id,
        tipo: 'CRIACAO',
        mensagem: modoOffline
          ? 'Venda criada em modo offline'
          : 'Venda criada',
      },
    });

    logger.info(`Venda criada: ${numeroVenda} - R$ ${valorTotal}`);

    res.status(201).json({
      mensagem: 'Venda criada com sucesso',
      venda: {
        ...venda,
        itens: await prisma.vendaItem.findMany({
          where: { vendaId: venda.id },
          include: { produto: true },
        }),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const sincronizarVendas = async (req: Request, res: Response) => {
  try {
    const { vendas } = req.body;

    if (!vendas || !Array.isArray(vendas)) {
      throw new AppError('Lista de vendas inválida', 400);
    }

    const vendasSincronizadas = [];
    const erros = [];

    for (const vendaOffline of vendas) {
      try {
        // Verificar se venda já foi sincronizada
        const vendaExistente = await prisma.venda.findUnique({
          where: { numeroVenda: vendaOffline.numeroVenda },
        });

        if (vendaExistente) {
          vendasSincronizadas.push({
            numeroVenda: vendaOffline.numeroVenda,
            status: 'JA_SINCRONIZADA',
          });
          continue;
        }

        // Criar venda
        await criarVenda(
          {
            body: {
              ...vendaOffline,
              sincronizada: true,
            },
          } as any,
          {
            status: () => ({
              json: () => {},
            }),
          } as any
        );

        vendasSincronizadas.push({
          numeroVenda: vendaOffline.numeroVenda,
          status: 'SINCRONIZADA',
        });
      } catch (error: any) {
        erros.push({
          numeroVenda: vendaOffline.numeroVenda,
          erro: error.message,
        });
      }
    }

    logger.info(
      `Sincronização concluída: ${vendasSincronizadas.length} vendas, ${erros.length} erros`
    );

    res.json({
      mensagem: 'Sincronização concluída',
      vendasSincronizadas,
      erros,
    });
  } catch (error) {
    throw error;
  }
};

export const listarVendas = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      containerId = '',
      status = '',
      dataInicio = '',
      dataFim = '',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (containerId) {
      where.containerId = String(containerId);
    }

    if (status) {
      where.status = String(status);
    }

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) {
        where.createdAt.gte = new Date(String(dataInicio));
      }
      if (dataFim) {
        where.createdAt.lte = new Date(String(dataFim));
      }
    }

    const [vendas, total] = await Promise.all([
      prisma.venda.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          container: {
            include: {
              condominio: true,
            },
          },
          itens: {
            include: {
              produto: true,
            },
          },
          pagamentos: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.venda.count({ where }),
    ]);

    res.json({
      vendas,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    throw error;
  }
};

export const buscarVenda = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const venda = await prisma.venda.findUnique({
      where: { id },
      include: {
        container: {
          include: {
            condominio: true,
          },
        },
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        pagamentos: {
          include: {
            historico: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!venda) {
      throw new AppError('Venda não encontrada', 404);
    }

    res.json(venda);
  } catch (error) {
    throw error;
  }
};

export const atualizarStatusVenda = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, observacao } = req.body;

    if (!status) {
      throw new AppError('Status é obrigatório', 400);
    }

    const venda = await prisma.venda.update({
      where: { id },
      data: { status },
    });

    // Log
    await prisma.logVenda.create({
      data: {
        vendaId: venda.id,
        tipo: 'ATUALIZACAO_STATUS',
        mensagem: `Status alterado para ${status}`,
        dados: observacao,
      },
    });

    logger.info(`Status da venda ${venda.numeroVenda} alterado para ${status}`);

    res.json({
      mensagem: 'Status atualizado com sucesso',
      venda,
    });
  } catch (error) {
    throw error;
  }
};

export const cancelarVenda = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const venda = await prisma.venda.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!venda) {
      throw new AppError('Venda não encontrada', 404);
    }

    if (venda.status === 'CANCELADO') {
      throw new AppError('Venda já está cancelada', 400);
    }

    // Reverter estoque
    for (const item of venda.itens) {
      await prisma.containerEstoque.updateMany({
        where: {
          containerId: venda.containerId,
          produtoId: item.produtoId,
        },
        data: {
          quantidade: {
            increment: item.quantidade,
          },
        },
      });

      // Registrar movimentação
      await prisma.movimentacaoEstoque.create({
        data: {
          produtoId: item.produtoId,
          tipo: 'ENTRADA',
          quantidade: item.quantidade,
          destino: venda.containerId,
          observacao: `Cancelamento da venda ${venda.numeroVenda}`,
        },
      });
    }

    // Atualizar status
    await prisma.venda.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    // Log
    await prisma.logVenda.create({
      data: {
        vendaId: venda.id,
        tipo: 'CANCELAMENTO',
        mensagem: 'Venda cancelada',
        dados: motivo,
      },
    });

    logger.info(`Venda cancelada: ${venda.numeroVenda} - Motivo: ${motivo}`);

    res.json({ mensagem: 'Venda cancelada e estoque revertido com sucesso' });
  } catch (error) {
    throw error;
  }
};
