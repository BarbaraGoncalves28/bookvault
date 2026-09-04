import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { validateRequestBody } from '../middlewares/validation.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  validateLoginBody,
  validateRegisterBody,
} from '../../validations/auth.validation';

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post(
  '/register',
  validateRequestBody(validateRegisterBody),
  asyncHandler(authController.register),
);

authRoutes.post(
  '/login',
  validateRequestBody(validateLoginBody),
  asyncHandler(authController.login),
);

authRoutes.get(
  '/me',
  ensureAuthenticated,
  asyncHandler(authController.profile),
);

authRoutes.post(
  '/logout',
  asyncHandler(authController.logout),
);