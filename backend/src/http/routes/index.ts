import { Router } from 'express';

import { authRoutes } from './auth.routes';
import { booksRoutes } from './books.routes';
import { usersRoutes } from '../../modules/users/routes/users-routes';
import { genresRoutes } from '../../modules/genres/routes/genres-routes';

export const routes = Router();

routes.get('/health', (_request, response) => {
  return response.status(200).json({
    status: 'ok',
    service: 'bookvault-api',
  });
});

routes.use('/auth', authRoutes);
routes.use('/books', booksRoutes);
routes.use('/users', usersRoutes);
routes.use('/genres', genresRoutes);