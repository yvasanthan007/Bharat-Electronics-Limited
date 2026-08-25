import { Router } from 'express';
import { UsersController } from './users.controller';
// import { authMiddleware } from '../../middleware/auth';

const router = Router();
const usersController = new UsersController();

// TODO: apply authMiddleware below
router.get('/me', usersController.getMe);
router.put('/me', usersController.updateProfile);
router.get('/', usersController.getAllUsers);

export default router;
