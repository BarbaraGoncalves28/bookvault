import type { Request, Response } from 'express';

import { GenresService } from '../services/genres.service';

export class GenresController {
  constructor(
    private readonly genresService = new GenresService(),
  ) {}

  list = async (_request: Request, response: Response) => {
    const genres = await this.genresService.list();

    return response.status(200).json(genres);
  };

  show = async (request: Request, response: Response) => {
  const { id } = request.params;

  if (typeof id !== 'string') {
    return response.status(400).json({
      message: 'Genre id is required.',
    });
  }

  const genre = await this.genresService.findById(id);

  return response.status(200).json(genre);
};
}