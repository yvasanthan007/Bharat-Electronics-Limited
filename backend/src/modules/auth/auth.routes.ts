import { Router } from 'express';
import { AuthController } from './auth.controller';
// import { validateRequest } from '../../middleware/validateRequest';
// import { authSchema } from './auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
