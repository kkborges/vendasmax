import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const listarProdutos = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', categoriaId = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { ativo: true };

    if (search) {
      where.OR = [
        { nome: { contains: String(search), mode: 'insensitive' as const } },
        { descricao: { contains: String(search), mode: 'insensitive' as const } },
        { codigoBarras: { contains: String(search) } },
      ];
    }

    if (categoriaId) {
      where.categoriaId = String(categoriaId);
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          categoria: true,
          estoqueGeral: true,
        },
        orderBy: { nome: 'asc' },
      }),
      prisma.produto.count({ where }),
    ]);

    res.json({
      produtos,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    throw error;
  }
};

export const buscarProduto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        estoqueGeral: true,
        estoqueContainers: {
          include: {
            container: {
              include: {
                condominio: true,
              },
            },
          },
        },
      },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }

    res.json(produto);
  } catch (error) {
    throw error;
  }
};

export const buscarPorCodigoBarras = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    const produto = await prisma.produto.findFirst({
      where: {
        OR: [
          { codigoBarras: codigo },
          { qrCode: codigo },
        ],
      },
      include: {
        categoria: true,
        estoqueGeral: true,
      },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }

    res.json(produto);
  } catch (error) {
    throw error;
  }
};

export const criarProduto = async (req: Request, res: Response) => {
  try {
    const {
      categoriaId,
      nome,
      descricao,
      codigoBarras,
      qrCode,
      foto,
      estoqueMinimo,
      valorCompra,
      valorVenda,
      unidade,
      estoqueInicial,
    } = req.body;

    if (!categoriaId || !nome || !valorCompra || !valorVenda) {
      throw new AppError('Dados incompletos', 400);
    }

    // Verificar se categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new AppError('Categoria não encontrada', 404);
    }

    // Verificar código de barras único
    if (codigoBarras) {
      const produtoExistente = await prisma.produto.findUnique({
        where: { codigoBarras },
      });

      if (produtoExistente) {
        throw new AppError('Código de barras já cadastrado', 400);
      }
    }

    // Criar produto
    const produto = await prisma.produto.create({
      data: {
        categoriaId,
        nome,
        descricao,
        codigoBarras,
        qrCode,
        foto,
        estoqueMinimo: estoqueMinimo || 10,
        valorCompra,
        valorVenda,
        unidade: unidade || 'UN',
      },
      include: {
        categoria: true,
      },
    });

    // Criar estoque geral
    await prisma.estoqueGeral.create({
      data: {
        produtoId: produto.id,
        quantidade: estoqueInicial || 0,
      },
    });

    logger.info(`Produto criado: ${produto.nome}`);

    res.status(201).json({
      mensagem: 'Produto criado com sucesso',
      produto,
    });
  } catch (error) {
    throw error;
  }
};

export const atualizarProduto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const produtoExistente = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      throw new AppError('Produto não encontrado', 404);
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: dados,
      include: {
        categoria: true,
        estoqueGeral: true,
      },
    });

    logger.info(`Produto atualizado: ${produto.nome}`);

    res.json({
      mensagem: 'Produto atualizado com sucesso',
      produto,
    });
  } catch (error) {
    throw error;
  }
};

export const deletarProduto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }

    // Soft delete (desativar ao invés de deletar)
    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });

    logger.info(`Produto desativado: ${produto.nome}`);

    res.json({ mensagem: 'Produto desativado com sucesso' });
  } catch (error) {
    throw error;
  }
};

// Categorias

export const listarCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      include: {
        _count: {
          select: { produtos: true },
        },
      },
      orderBy: { nome: 'asc' },
    });

    res.json({ categorias });
  } catch (error) {
    throw error;
  }
};

export const criarCategoria = async (req: Request, res: Response) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      throw new AppError('Nome é obrigatório', 400);
    }

    const categoria = await prisma.categoria.create({
      data: { nome, descricao },
    });

    logger.info(`Categoria criada: ${categoria.nome}`);

    res.status(201).json({
      mensagem: 'Categoria criada com sucesso',
      categoria,
    });
  } catch (error) {
    throw error;
  }
};

export const atualizarCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const categoria = await prisma.categoria.update({
      where: { id },
      data: dados,
    });

    logger.info(`Categoria atualizada: ${categoria.nome}`);

    res.json({
      mensagem: 'Categoria atualizada com sucesso',
      categoria,
    });
  } catch (error) {
    throw error;
  }
};

export const deletarCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se existem produtos nesta categoria
    const produtos = await prisma.produto.count({
      where: { categoriaId: id },
    });

    if (produtos > 0) {
      throw new AppError('Não é possível excluir categoria com produtos vinculados', 400);
    }

    await prisma.categoria.delete({
      where: { id },
    });

    logger.info(`Categoria deletada: ${id}`);

    res.json({ mensagem: 'Categoria deletada com sucesso' });
  } catch (error) {
    throw error;
  }
};
