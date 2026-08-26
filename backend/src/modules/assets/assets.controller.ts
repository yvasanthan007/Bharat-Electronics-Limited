import { Request, Response } from 'express';
import { assetsService } from './assets.service';
import { ApiResponse } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../../shared/types';

export class AssetsController {
  public listAssets = async (req: Request, res: Response): Promise<void> => {
    const { assets, total, page, limit } = await assetsService.listAssets(req.query as any);
    ApiResponse.paginated(res, assets, page, limit, total, 'Digital assets retrieved successfully');
  };

  public getHoldings = async (_req: Request, res: Response): Promise<void> => {
    const summary = await assetsService.getHoldingsSummary();
    ApiResponse.success(res, summary, 'Holdings summary retrieved');
  };

  public getAllocation = async (_req: Request, res: Response): Promise<void> => {
    const allocation = await assetsService.getAllocation();
    ApiResponse.success(res, allocation, 'Portfolio allocation retrieved');
  };

  public getPerformance = async (req: Request, res: Response): Promise<void> => {
    const performance = await assetsService.getPerformance(req.query.period as string);
    ApiResponse.success(res, performance, 'Performance metrics retrieved');
  };

  public getAssetById = async (req: Request, res: Response): Promise<void> => {
    const asset = await assetsService.getAssetById(req.params.id as string);
    ApiResponse.success(res, asset, 'Digital asset details retrieved');
  };

  public mintAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const asset = await assetsService.mintAsset(req.body, req.user?.userId);
    ApiResponse.created(res, asset, 'Asset minted successfully on blockchain');
  };

  public toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    const result = await assetsService.toggleFavorite(req.params.id as string);
    ApiResponse.success(res, result, 'Asset watchlist status updated');
  };

  public deleteAsset = async (req: Request, res: Response): Promise<void> => {
    const result = await assetsService.deleteAsset(req.params.id as string);
    ApiResponse.success(res, result, 'Asset burned / deleted successfully');
  };
}

export const assetsController = new AssetsController();
