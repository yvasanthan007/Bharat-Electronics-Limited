import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './database';

const PORT = env.PORT || 4000;

async function bootstrap() {
  try {
    // Try to connect to DB
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database via Prisma');

    const server = app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT} in ${env.NODE_ENV} mode`);
    });

    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
