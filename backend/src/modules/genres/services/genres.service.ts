import { AppError } from '../../../shared/errors/app-error';
import { GenresRepository } from '../repositories/genres.repository';

export class GenresService {
  constructor(
    private readonly genresRepository = new GenresRepository(),
  ) {}

  async list() {
    return this.genresRepository.findAll();
  }

  async findById(id: string) {
    const genre = await this.genresRepository.findById(id);

    if (!genre) {
      throw new AppError('Genre not found.', 404);
    }

    return genre;
  }
}