import { Router } from 'express';
import * as containerController from '../controllers/containerController';
import { authMiddleware, operadorOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', containerController.listarContainers);
router.get('/:id', containerController.buscarContainer);
router.get('/:id/estoque', containerController.buscarEstoqueContainer);

// Rotas que modificam dados requerem permissão
router.post('/', operadorOrAdmin, containerController.criarContainer);
router.put('/:id', operadorOrAdmin, containerController.atualizarContainer);
router.delete('/:id', operadorOrAdmin, containerController.deletarContainer);
router.put('/:id/estoque', operadorOrAdmin, containerController.atualizarEstoqueContainer);

export default router;
