import winston from 'winston';
import { config } from './environment';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom log format for readable console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: config.isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.isProduction ? json() : combine(colorize(), consoleFormat)
  ),
  defaultMeta: { service: 'bel-trust-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});
