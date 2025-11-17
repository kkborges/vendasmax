import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_FILE || 'logs/app.log';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'vendasmax-backend' },
  transports: [
    new winston.transports.File({ filename: logDir }),
    new winston.transports.File({
      filename: path.dirname(logDir) + '/error.log',
      level: 'error'
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
