import { Router } from 'express';
import * as relatorioController from '../controllers/relatorioController';
import { authMiddleware, operadorOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(operadorOrAdmin);

router.get('/dashboard', relatorioController.dashboard);
router.get('/vendas', relatorioController.relatorioVendas);
router.get('/estoque', relatorioController.relatorioEstoque);
router.get('/financeiro', relatorioController.relatorioFinanceiro);

export default router;
