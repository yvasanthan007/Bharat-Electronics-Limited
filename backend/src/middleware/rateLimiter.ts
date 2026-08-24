import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';
import { ApiResponse } from '../shared/utils/response';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many requests from this IP, please try again after 15 minutes',
      429
    );
  },
});

// Strict rate limiter for Authentication endpoints (login, register, reset-password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many authentication attempts. For security reasons, please try again in 15 minutes',
      429
    );
  },
});
