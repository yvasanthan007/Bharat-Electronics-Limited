import { Router } from 'express';
import { DIDController } from './did.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const didController = new DIDController();

router.post('/create', didController.createDID);
router.get('/me', authMiddleware, didController.getMyDID);
router.post('/challenge', didController.challenge);
router.post('/authenticate', didController.authenticate);
router.post('/verify', didController.verify);
router.post('/revoke', didController.revoke);
router.get('/', didController.getAllDIDs);
router.get('/:did', didController.getDID);

export default router;
