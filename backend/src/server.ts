import { createApp } from './app';
import { config } from './config/environment';
import { logger } from './config/logger';
import { dbManager } from './database/prisma';

const app = createApp();

const startServer = async () => {
  try {
    // Check Database connection
    await dbManager.connect();

    const server = app.listen(config.port, () => {
      logger.info('====================================================');
      logger.info(`🛡️  BEL Trust Platform Backend API is RUNNING`);
      logger.info(`🌐  Port: ${config.port} | Mode: ${config.env}`);
      logger.info(`📄  API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`⚡  API Endpoint:      http://localhost:${config.port}/api/v1`);
      logger.info(`🏥  Health Check:      http://localhost:${config.port}/api/v1/health`);
      logger.info('====================================================');
    });

    // Graceful Shutdown Signals
    const handleShutdown = async (signal: string) => {
      logger.info(`${signal} signal received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await dbManager.disconnect();
        logger.info('Process terminated cleanly');
        process.exit(0);
      });

      // Force shutdown if taking too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error: any) {
    logger.error('Failed to start BEL Trust Platform Backend', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
