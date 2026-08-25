import { Router } from 'express';
import { DIDController } from './did.controller';
import { authMiddleware, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();
const didController = new DIDController();

// Authentication endpoints
router.post('/challenge', didController.requestChallenge);
router.post('/verify', didController.verifyChallenge);

// Admin provisioning endpoints
router.post('/admin/users/:userId/did', authMiddleware, requireAdmin, didController.provisionDID);
router.get('/admin/users/:userId/did', authMiddleware, didController.getUserDID);
router.post('/admin/users/:userId/did/deactivate', authMiddleware, requireAdmin, didController.deactivateDID);

export default router;
