import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error' as never, (e: any) => {
  logger.error(`[Prisma ERRS] ${e.message}`);
});

prisma.$on('warn' as never, (e: any) => {
  logger.warn(`[Prisma WARN] ${e.message}`);
});

prisma.$on('query' as never, (e: any) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`[Prisma QRY] ${e.query} -- ${e.duration}ms`);
  }
});
