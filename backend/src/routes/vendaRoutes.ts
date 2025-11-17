import { Router } from 'express';
import * as vendaController from '../controllers/vendaController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', vendaController.listarVendas);
router.get('/:id', vendaController.buscarVenda);
router.post('/', vendaController.criarVenda);
router.post('/sincronizar', vendaController.sincronizarVendas);
router.patch('/:id/status', vendaController.atualizarStatusVenda);
router.post('/:id/cancelar', vendaController.cancelarVenda);

export default router;
