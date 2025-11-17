import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Login
router.post('/login/admin', authController.loginAdmin);
router.post('/login/condominio', authController.loginCondominio);

// Registro (apenas admin pode criar novos usuários)
router.post('/registro', authMiddleware, adminOnly, authController.registro);

export default router;
