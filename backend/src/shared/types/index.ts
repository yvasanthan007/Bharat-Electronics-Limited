import { Request } from 'express';
import { TokenPayload } from '../utils/crypto';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}
