import { Router, Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/response';
import { dbManager } from '../../database/prisma';
import { cache } from '../../config/redis';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  ApiResponse.success(
    res,
    {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      service: 'BEL Trust Platform Enterprise Backend',
      version: '1.0.0',
      database: dbManager.getStatus(),
      cache: cache.getStatus(),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      },
    },
    'Service is healthy and fully operational'
  );
});

router.get('/live', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

router.get('/ready', async (_req: Request, res: Response) => {
  res.status(200).json({ ready: true, message: 'All dependencies initialized' });
});

export default router;
