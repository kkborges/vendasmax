import { Router } from 'express';
import * as condominioController from '../controllers/condominioController';
import { authMiddleware, operadorOrAdmin } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);
router.use(operadorOrAdmin);

router.get('/', condominioController.listarCondominios);
router.get('/:id', condominioController.buscarCondominio);
router.post('/', condominioController.criarCondominio);
router.put('/:id', condominioController.atualizarCondominio);
router.delete('/:id', condominioController.deletarCondominio);
router.patch('/:id/rescindir', condominioController.rescindirContrato);

export default router;
