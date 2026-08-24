import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { CryptoUtil } from '../shared/utils/crypto';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError';

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = CryptoUtil.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error: any) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'Administrator') {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    return next();
  };
};
