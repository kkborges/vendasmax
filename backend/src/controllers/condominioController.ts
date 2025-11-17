import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const listarCondominios = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { nome: { contains: String(search), mode: 'insensitive' as const } },
            { cnpj: { contains: String(search) } },
          ],
        }
      : {};

    const [condominios, total] = await Promise.all([
      prisma.condominio.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          containers: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.condominio.count({ where }),
    ]);

    res.json({
      condominios: condominios.map(c => ({ ...c, senha: undefined })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    throw error;
  }
};

export const buscarCondominio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const condominio = await prisma.condominio.findUnique({
      where: { id },
      include: {
        containers: {
          include: {
            estoque: {
              include: {
                produto: true,
              },
            },
          },
        },
      },
    });

    if (!condominio) {
      throw new AppError('Condomínio não encontrado', 404);
    }

    res.json({ ...condominio, senha: undefined });
  } catch (error) {
    throw error;
  }
};

export const criarCondominio = async (req: Request, res: Response) => {
  try {
    const {
      cnpj,
      nome,
      rua,
      cep,
      bairro,
      cidade,
      estado,
      totalBlocos,
      totalApartamentos,
      usuario,
      senha,
      containers,
    } = req.body;

    // Validação básica
    if (!cnpj || !nome || !rua || !cep || !bairro || !cidade || !estado) {
      throw new AppError('Dados incompletos', 400);
    }

    // Verificar se CNPJ já existe
    const condominioExistente = await prisma.condominio.findUnique({
      where: { cnpj },
    });

    if (condominioExistente) {
      throw new AppError('CNPJ já cadastrado', 400);
    }

    // Hash da senha se fornecida
    let senhaHash;
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    // Criar condomínio
    const condominio = await prisma.condominio.create({
      data: {
        cnpj,
        nome,
        rua,
        cep,
        bairro,
        cidade,
        estado,
        totalBlocos: totalBlocos || 1,
        totalApartamentos: totalApartamentos || 10,
        usuario,
        senha: senhaHash,
      },
    });

    // Criar pelo menos 1 container
    const containersData = containers && containers.length > 0
      ? containers
      : [{ localizacao: 'Container Principal', bloco: 'A', espaco: 'Térreo' }];

    for (const containerData of containersData) {
      await prisma.container.create({
        data: {
          condominioId: condominio.id,
          localizacao: containerData.localizacao,
          bloco: containerData.bloco,
          espaco: containerData.espaco,
        },
      });
    }

    logger.info(`Condomínio criado: ${condominio.nome}`);

    res.status(201).json({
      mensagem: 'Condomínio criado com sucesso',
      condominio: { ...condominio, senha: undefined },
    });
  } catch (error) {
    throw error;
  }
};

export const atualizarCondominio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const condominioExistente = await prisma.condominio.findUnique({
      where: { id },
    });

    if (!condominioExistente) {
      throw new AppError('Condomínio não encontrado', 404);
    }

    // Se atualizar senha, fazer hash
    if (dados.senha) {
      dados.senha = await bcrypt.hash(dados.senha, 10);
    }

    const condominio = await prisma.condominio.update({
      where: { id },
      data: dados,
    });

    logger.info(`Condomínio atualizado: ${condominio.nome}`);

    res.json({
      mensagem: 'Condomínio atualizado com sucesso',
      condominio: { ...condominio, senha: undefined },
    });
  } catch (error) {
    throw error;
  }
};

export const deletarCondominio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const condominio = await prisma.condominio.findUnique({
      where: { id },
      include: { containers: true },
    });

    if (!condominio) {
      throw new AppError('Condomínio não encontrado', 404);
    }

    // Verificar se possui containers (validação de negócio)
    if (condominio.containers.length > 0) {
      throw new AppError(
        'Não é possível excluir condomínio com containers. Exclua os containers primeiro ou marque o contrato como rescindido.',
        400
      );
    }

    await prisma.condominio.delete({
      where: { id },
    });

    logger.info(`Condomínio deletado: ${condominio.nome}`);

    res.json({ mensagem: 'Condomínio deletado com sucesso' });
  } catch (error) {
    throw error;
  }
};

export const rescindir Contrato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const condominio = await prisma.condominio.update({
      where: { id },
      data: {
        contratoRescindido: true,
        ativo: false,
      },
    });

    logger.info(`Contrato rescindido: ${condominio.nome}`);

    res.json({
      mensagem: 'Contrato rescindido com sucesso',
      condominio: { ...condominio, senha: undefined },
    });
  } catch (error) {
    throw error;
  }
};
