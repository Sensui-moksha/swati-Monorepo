import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

const logFormat = process.env.NODE_ENV === 'production'
  ? combine(timestamp(), errors({ stack: true }), json())
  : combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      printf(({ level, message, timestamp, stack, correlationId }) => {
        return `${timestamp} ${level}: ${correlationId ? `[${correlationId}] ` : ''}${message} ${stack || ''}`;
      })
    );

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'swathi-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    })
  );
  logger.add(
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    })
  );
}
