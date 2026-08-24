import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/environment';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { NotFoundError } from './shared/errors/AppError';

export const createApp = (): Application => {
  const app: Application = express();

  // Trust reverse proxy (e.g. Nginx, Docker)
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Allows Swagger UI inline scripts
  }));

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin || config.cors.origin.includes(origin) || config.isDevelopment) {
          return callback(null, true);
        }
        return callback(new Error('CORS origin blocked by BEL security policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Compression
  app.use(compression());

  // Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging with Morgan & Winston
  if (!config.isTest) {
    app.use(
      morgan(':method :url :status :res[content-length] - :response-time ms', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      })
    );
  }

  // Rate Limiting
  app.use('/api/', apiLimiter);

  // Swagger OpenAPI Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BEL Trust Platform API Docs',
  }));

  // Swagger Raw JSON Schema
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Mount API v1 Routes
  app.use('/api/v1', routes);

  // Root Welcome Endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'Bharat Electronics Limited (BEL) Trust Platform API',
      status: 'ONLINE',
      documentation: '/api/docs',
      apiVersion: 'v1',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 Route Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl} - Route not found on BEL API Gateway`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
