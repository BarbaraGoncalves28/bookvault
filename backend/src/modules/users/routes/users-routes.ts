import { Router } from 'express';

import { UsersController } from '../controllers/users-controller';

import { ensureAuthenticated } from '../../../http/middlewares/auth.middleware';

const usersRoutes = Router();

const usersController = new UsersController();

usersRoutes.use(ensureAuthenticated);

usersRoutes.get(
  '/me',
  usersController.getProfile.bind(usersController),
);

usersRoutes.patch(
  '/me',
  usersController.updateProfile.bind(usersController),
);

usersRoutes.patch(
  '/me/avatar',
  usersController.updateAvatar.bind(usersController),
);

usersRoutes.get(
  '/me/stats',
  usersController.getStats.bind(usersController),
);

usersRoutes.patch(
  '/me/reading-goal',
  usersController.updateReadingGoal.bind(usersController),
);

usersRoutes.patch(
  '/me/password',
  usersController.changePassword.bind(usersController),
);

usersRoutes.delete(
  '/me',
  usersController.deleteAccount.bind(usersController),
);

export { usersRoutes };