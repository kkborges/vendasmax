import { Router } from 'express';
import * as pagamentoController from '../controllers/pagamentoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Webhooks não precisam de autenticação (verificar assinatura no controller)
router.post('/webhook/stripe', pagamentoController.webhookStripe);
router.post('/webhook/mercadopago', pagamentoController.webhookMercadoPago);

// Rotas protegidas
router.use(authMiddleware);

router.post('/', pagamentoController.criarPagamento);
router.get('/', pagamentoController.listarPagamentos);
router.get('/:id/verificar', pagamentoController.verificarPagamento);

export default router;
