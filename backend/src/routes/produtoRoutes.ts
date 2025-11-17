import { Router } from 'express';
import * as produtoController from '../controllers/produtoController';
import { authMiddleware, operadorOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Rotas de produtos
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.buscarProduto);
router.get('/codigo/:codigo', produtoController.buscarPorCodigoBarras);

// Rotas que modificam dados requerem permissão
router.post('/', operadorOrAdmin, produtoController.criarProduto);
router.put('/:id', operadorOrAdmin, produtoController.atualizarProduto);
router.delete('/:id', operadorOrAdmin, produtoController.deletarProduto);

// Rotas de categorias
router.get('/categorias/listar', produtoController.listarCategorias);
router.post('/categorias', operadorOrAdmin, produtoController.criarCategoria);
router.put('/categorias/:id', operadorOrAdmin, produtoController.atualizarCategoria);
router.delete('/categorias/:id', operadorOrAdmin, produtoController.deletarCategoria);

export default router;
