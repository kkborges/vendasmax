import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw new AppError('Email e senha são obrigatórios', 400);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.ativo) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    });

    logger.info(`Login realizado: ${usuario.email}`);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const loginCondominio = async (req: Request, res: Response) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      throw new AppError('Usuário e senha são obrigatórios', 400);
    }

    const condominio = await prisma.condominio.findFirst({
      where: { usuario },
      include: { containers: true },
    });

    if (!condominio || !condominio.ativo || condominio.contratoRescindido) {
      throw new AppError('Credenciais inválidas ou contrato rescindido', 401);
    }

    if (!condominio.senha) {
      throw new AppError('Condomínio sem senha configurada', 401);
    }

    const senhaValida = await bcrypt.compare(senha, condominio.senha);

    if (!senhaValida) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = generateToken({
      id: condominio.id,
      email: condominio.usuario,
      role: 'VENDEDOR',
    });

    logger.info(`Login condomínio realizado: ${condominio.nome}`);

    res.json({
      token,
      condominio: {
        id: condominio.id,
        nome: condominio.nome,
        containers: condominio.containers.map(c => ({
          id: c.id,
          localizacao: c.localizacao,
          bloco: c.bloco,
        })),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const registro = async (req: Request, res: Response) => {
  try {
    const { email, senha, nome, role } = req.body;

    if (!email || !senha || !nome) {
      throw new AppError('Email, senha e nome são obrigatórios', 400);
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new AppError('Email já cadastrado', 400);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaHash,
        nome,
        role: role || 'OPERADOR',
      },
    });

    logger.info(`Novo usuário registrado: ${usuario.email}`);

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
      },
    });
  } catch (error) {
    throw error;
  }
};
