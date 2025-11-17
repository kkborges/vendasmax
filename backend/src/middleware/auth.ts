import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  return next();
};

export const operadorOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['ADMIN', 'OPERADOR'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  return next();
};
