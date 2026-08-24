import { Router } from 'express';
import { assetsController } from './assets.controller';
import { validateRequest } from '../../middleware/validate';
import { createAssetSchema, assetQuerySchema } from './assets.schema';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get('/', validateRequest({ query: assetQuerySchema }), asyncHandler(assetsController.listAssets));
router.get('/holdings', asyncHandler(assetsController.getHoldings));
router.get('/allocation', asyncHandler(assetsController.getAllocation));
router.get('/performance', asyncHandler(assetsController.getPerformance));
router.get('/:id', asyncHandler(assetsController.getAssetById));

// Protected write operations
router.post(
  '/mint',
  authenticate,
  authorize(['Administrator', 'Engineer', 'Manager']),
  validateRequest({ body: createAssetSchema }),
  asyncHandler(assetsController.mintAsset)
);

router.post('/:id/favorite', asyncHandler(assetsController.toggleFavorite));

router.delete(
  '/:id',
  authenticate,
  authorize(['Administrator']),
  asyncHandler(assetsController.deleteAsset)
);

export default router;
