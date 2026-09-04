import { Router } from 'express';

import { BooksController } from '../controllers/books.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { validateRequestBody } from '../middlewares/validation.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { validateCreateBookBody, validateUpdateBookBody } from '../../validations/book.validation';

const booksController = new BooksController();

export const booksRoutes = Router();

booksRoutes.use(ensureAuthenticated);

booksRoutes.post('/', validateRequestBody(validateCreateBookBody), asyncHandler(booksController.create));
booksRoutes.get('/', asyncHandler(booksController.list));
booksRoutes.get('/:id', asyncHandler(booksController.show));
booksRoutes.put('/:id', validateRequestBody(validateUpdateBookBody), asyncHandler(booksController.update));
booksRoutes.patch('/:id', validateRequestBody(validateUpdateBookBody), asyncHandler(booksController.update));
booksRoutes.patch('/:id/favorite', asyncHandler(booksController.favorite));
booksRoutes.patch('/:id/unfavorite', asyncHandler(booksController.unfavorite));
booksRoutes.delete('/:id', asyncHandler(booksController.delete));
