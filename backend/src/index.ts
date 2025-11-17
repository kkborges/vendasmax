import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './config/logger';
import prisma from './config/database';
import redis from './config/redis';
import {
  verificarEstoqueMinimo,
  verificarProdutosVencendo,
} from './services/notificationService';

// Carregar variáveis de ambiente
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(compression());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Rotas
app.use('/api', routes);

// Health check raiz
app.get('/', (req, res) => {
  res.json({
    message: 'VendasMax API',
    version: '1.0.0',
    status: 'running',
  });
});

// Handlers de erro
app.use(notFoundHandler);
app.use(errorHandler);

// Cron jobs
const setupCronJobs = () => {
  // Verificar estoque mínimo a cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Executando verificação de estoque mínimo...');
    await verificarEstoqueMinimo();
  });

  // Verificar produtos vencendo a cada 12 horas
  cron.schedule('0 */12 * * *', async () => {
    logger.info('Executando verificação de produtos vencendo...');
    await verificarProdutosVencendo();
  });

  logger.info('Cron jobs configurados');
};

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await prisma.$connect();
    logger.info('✅ Conexão com PostgreSQL estabelecida');

    // Testar conexão com Redis
    await redis.ping();
    logger.info('✅ Conexão com Redis estabelecida');

    // Configurar cron jobs
    setupCronJobs();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Encerrando servidor...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Encerrando servidor...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

// Iniciar
startServer();

export default app;
