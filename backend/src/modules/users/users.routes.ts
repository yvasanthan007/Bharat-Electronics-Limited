import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  userQuerySchema,
} from './users.schema';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

// Protect all user management routes
router.use(authenticate);

router.get(
  '/',
  authorize(['Administrator', 'Auditor', 'Manager']),
  validateRequest({ query: userQuerySchema }),
  asyncHandler(usersController.listUsers)
);

router.get(
  '/:id',
  authorize(['Administrator', 'Auditor', 'Manager']),
  asyncHandler(usersController.getUserById)
);

router.post(
  '/',
  authorize(['Administrator']),
  validateRequest({ body: createUserSchema }),
  asyncHandler(usersController.createUser)
);

router.put(
  '/:id',
  authorize(['Administrator']),
  validateRequest({ body: updateUserSchema }),
  asyncHandler(usersController.updateUser)
);

router.post(
  '/:id/assign-role',
  authorize(['Administrator']),
  validateRequest({ body: assignRoleSchema }),
  asyncHandler(usersController.assignRole)
);

router.delete(
  '/:id',
  authorize(['Administrator']),
  asyncHandler(usersController.deleteUser)
);

export default router;
