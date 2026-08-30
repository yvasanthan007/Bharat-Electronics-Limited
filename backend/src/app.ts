import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';
import router from './routes/index';

const app: Express = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);

// Request logger
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Swagger docs — available at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BEL Dashboard API Docs',
}));

// API routes
app.use('/api/v1', router);
app.use('/api', router);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler (must be last)
app.use(errorHandler);

export const createApp = (): Express => app;
export { app };
export default app;
