import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { ApiResponse } from '../../shared/utils/response';

export class DashboardController {
  public getSummary = async (_req: Request, res: Response): Promise<void> => {
    const data = await dashboardService.getSummary();
    ApiResponse.success(res, data, 'Dashboard summary metrics retrieved');
  };

  public getCharts = async (_req: Request, res: Response): Promise<void> => {
    const data = await dashboardService.getCharts();
    ApiResponse.success(res, data, 'Dashboard chart analytics retrieved');
  };

  public getActivity = async (_req: Request, res: Response): Promise<void> => {
    const data = await dashboardService.getRecentActivity();
    ApiResponse.success(res, data, 'Recent ledger activity retrieved');
  };

  public getBlockchainStatus = async (_req: Request, res: Response): Promise<void> => {
    const data = await dashboardService.getBlockchainStatus();
    ApiResponse.success(res, data, 'Blockchain node status retrieved');
  };
}

export const dashboardController = new DashboardController();
