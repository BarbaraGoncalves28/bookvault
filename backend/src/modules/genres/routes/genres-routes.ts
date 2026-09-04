import { Router } from 'express';

import { GenresController } from '../controllers/genres.controller';
import { asyncHandler } from '../../../shared/utils/async-handler';

const genresController = new GenresController();

export const genresRoutes = Router();

genresRoutes.get(
  '/',
  asyncHandler(genresController.list),
);

genresRoutes.get(
  '/:id',
  asyncHandler(genresController.show),
);