import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message = 'Request successful',
    statusCode = 200,
    meta?: any
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  public static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Data retrieved successfully'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    return this.success(res, data, message, 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }

  public static error(
    res: Response,
    message = 'An unexpected error occurred',
    statusCode = 500,
    errors?: any[]
  ): Response {
    const payload: ApiResponsePayload = {
      success: false,
      message,
      ...(errors && errors.length > 0 && { errors }),
    };
    return res.status(statusCode).json(payload);
  }
}
