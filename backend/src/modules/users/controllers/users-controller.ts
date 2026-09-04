import { Request, Response } from 'express';

import {
  changePasswordSchema,
  updateAvatarSchema,
  updateProfileSchema,
  updateReadingGoalSchema,
} from '../schemas/users-schemas';

import { UsersService } from '../services/users-service';

const usersService = new UsersService();

export class UsersController {
  async getProfile(
    request: Request,
    response: Response,
  ) {
    const userId = request.user!.id;

    const user = await usersService.getProfile(userId);

    return response.json(user);
  }

  async updateProfile(
    request: Request,
    response: Response,
  ) {
    const userId = request.user!.id;

    const data = updateProfileSchema.parse(request.body);

    const user = await usersService.updateProfile(
      userId,
      data,
    );

    return response.json(user);
  }

  async updateAvatar(
    request: Request,
    response: Response,
  ) {
    const userId = request.user!.id;

    const data = updateAvatarSchema.parse(request.body);

    const user = await usersService.updateAvatar(
      userId,
      data,
    );

    return response.json(user);
  }

  async getStats(
    request: Request,
    response: Response,
  ) {
    const userId = request.user!.id;

    const stats = await usersService.getStats(userId);

    return response.json(stats);
  }

  async updateReadingGoal(
  request: Request,
  response: Response,
) {
  const userId = request.user!.id;

  const data =
    updateReadingGoalSchema.parse(
      request.body,
    );

  const readingGoal =
    await usersService.updateReadingGoal(
      userId,
      data.goal,
    );

  return response.json(readingGoal);
}
  
  async changePassword(
    request: Request,
    response: Response,
  ) {
    const userId = request.user!.id;

    const data = changePasswordSchema.parse(request.body);

    await usersService.changePassword(
      userId,
      data,
    );

    return response.status(204).send();
  }

  async deleteAccount(
    request: Request,
    response: Response,
  ) {
    const userId = request.user!.id;

    await usersService.deleteAccount(userId);

    return response.status(204).send();
  }
}