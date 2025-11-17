import { Router } from 'express';
import authRoutes from './authRoutes';
import condominioRoutes from './condominioRoutes';
import containerRoutes from './containerRoutes';
import produtoRoutes from './produtoRoutes';
import vendaRoutes from './vendaRoutes';
import pagamentoRoutes from './pagamentoRoutes';
import relatorioRoutes from './relatorioRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas da API
router.use('/auth', authRoutes);
router.use('/condominios', condominioRoutes);
router.use('/containers', containerRoutes);
router.use('/produtos', produtoRoutes);
router.use('/vendas', vendaRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/relatorios', relatorioRoutes);

export default router;
