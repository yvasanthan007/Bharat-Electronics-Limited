import { Router } from 'express';
import { AssetsController } from './assets.controller';

const router = Router();
const assetsController = new AssetsController();

router.get('/', assetsController.getAllAssets);
router.get('/portfolio', assetsController.getPortfolio);
router.get('/:id', assetsController.getAssetById);

export default router;
