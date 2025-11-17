import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const listarContainers = async (req: Request, res: Response) => {
  try {
    const { condominioId } = req.query;

    const where = condominioId ? { condominioId: String(condominioId) } : {};

    const containers = await prisma.container.findMany({
      where,
      include: {
        condominio: true,
        estoque: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ containers });
  } catch (error) {
    throw error;
  }
};

export const buscarContainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const container = await prisma.container.findUnique({
      where: { id },
      include: {
        condominio: true,
        estoque: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    if (!container) {
      throw new AppError('Container não encontrado', 404);
    }

    res.json(container);
  } catch (error) {
    throw error;
  }
};

export const criarContainer = async (req: Request, res: Response) => {
  try {
    const { condominioId, localizacao, bloco, espaco } = req.body;

    if (!condominioId || !localizacao) {
      throw new AppError('Condomínio e localização são obrigatórios', 400);
    }

    // Verificar se condomínio existe
    const condominio = await prisma.condominio.findUnique({
      where: { id: condominioId },
    });

    if (!condominio) {
      throw new AppError('Condomínio não encontrado', 404);
    }

    const container = await prisma.container.create({
      data: {
        condominioId,
        localizacao,
        bloco,
        espaco,
      },
    });

    logger.info(`Container criado: ${container.localizacao} - ${condominio.nome}`);

    res.status(201).json({
      mensagem: 'Container criado com sucesso',
      container,
    });
  } catch (error) {
    throw error;
  }
};

export const atualizarContainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const containerExistente = await prisma.container.findUnique({
      where: { id },
    });

    if (!containerExistente) {
      throw new AppError('Container não encontrado', 404);
    }

    const container = await prisma.container.update({
      where: { id },
      data: dados,
    });

    logger.info(`Container atualizado: ${container.localizacao}`);

    res.json({
      mensagem: 'Container atualizado com sucesso',
      container,
    });
  } catch (error) {
    throw error;
  }
};

export const deletarContainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const container = await prisma.container.findUnique({
      where: { id },
      include: {
        condominio: {
          include: {
            containers: true,
          },
        },
      },
    });

    if (!container) {
      throw new AppError('Container não encontrado', 404);
    }

    // Validar regra de negócio: condomínio deve ter pelo menos 1 container
    if (
      container.condominio.containers.length <= 1 &&
      !container.condominio.contratoRescindido
    ) {
      throw new AppError(
        'O condomínio deve ter pelo menos 1 container ativo, a menos que o contrato esteja rescindido',
        400
      );
    }

    await prisma.container.delete({
      where: { id },
    });

    logger.info(`Container deletado: ${container.localizacao}`);

    res.json({ mensagem: 'Container deletado com sucesso' });
  } catch (error) {
    throw error;
  }
};

export const buscarEstoqueContainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const estoque = await prisma.containerEstoque.findMany({
      where: { containerId: id },
      include: {
        produto: {
          include: {
            categoria: true,
          },
        },
      },
      orderBy: {
        produto: {
          nome: 'asc',
        },
      },
    });

    res.json({ estoque });
  } catch (error) {
    throw error;
  }
};

export const atualizarEstoqueContainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { produtoId, quantidade, dataValidade, lote } = req.body;

    if (!produtoId || quantidade === undefined) {
      throw new AppError('Produto e quantidade são obrigatórios', 400);
    }

    // Verificar se produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }

    // Buscar estoque existente
    const estoqueExistente = await prisma.containerEstoque.findFirst({
      where: {
        containerId: id,
        produtoId,
        lote: lote || null,
      },
    });

    let estoque;
    if (estoqueExistente) {
      // Atualizar estoque existente
      estoque = await prisma.containerEstoque.update({
        where: { id: estoqueExistente.id },
        data: {
          quantidade,
          dataValidade: dataValidade ? new Date(dataValidade) : undefined,
        },
      });
    } else {
      // Criar novo registro de estoque
      estoque = await prisma.containerEstoque.create({
        data: {
          containerId: id,
          produtoId,
          quantidade,
          dataValidade: dataValidade ? new Date(dataValidade) : null,
          lote,
        },
      });
    }

    logger.info(`Estoque atualizado - Container: ${id}, Produto: ${produto.nome}`);

    res.json({
      mensagem: 'Estoque atualizado com sucesso',
      estoque,
    });
  } catch (error) {
    throw error;
  }
};
