import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/types';

export class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    ApiResponse.created(res, result, 'User registered successfully');
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    ApiResponse.success(res, result, 'Login successful');
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.refreshToken(req.body.refreshToken);
    ApiResponse.success(res, result, 'Token refreshed successfully');
  };

  public logout = async (_req: Request, res: Response): Promise<void> => {
    ApiResponse.success(res, { loggedOut: true }, 'Logged out successfully');
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.forgotPassword(req.body.email);
    ApiResponse.success(res, result, 'Password reset initiated');
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword);
    ApiResponse.success(res, result, 'Password reset successful');
  };

  public getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await authService.getCurrentUser(req.user!.userId);
    ApiResponse.success(res, result, 'Current user profile retrieved');
  };
}

export const authController = new AuthController();
