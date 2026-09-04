import type { Request, Response } from 'express';

import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import { AuthService } from '../../modules/auth/services/auth.service';

const authService = new AuthService();

export class AuthController {
  register = async (
    request: Request,
    response: Response,
  ) => {
    const result = await authService.register(
      request.body,
    );

    this.setAuthCookie(response, result.token);

    return response.status(201).json({
      user: result.user,
      token: this.shouldReturnToken(request)
        ? result.token
        : undefined,
    });
  };

  login = async (
    request: Request,
    response: Response,
  ) => {
    const result = await authService.login(
      request.body,
    );

    this.setAuthCookie(response, result.token);

    return response.status(200).json({
      user: result.user,
      token: this.shouldReturnToken(request)
        ? result.token
        : undefined,
    });
  };

  profile = async (
    request: Request,
    response: Response,
  ) => {
    if (!request.user) {
      throw new AppError(
        'Authentication required.',
        401,
      );
    }

    const user =
      await authService.getProfile(
        request.user.id,
      );

    return response.status(200).json(user);
  };

  logout = async (
    _request: Request,
    response: Response,
  ) => {
    response.clearCookie(
      env.cookieName,
      {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: 'lax',
        path: '/',
      },
    );

    return response.status(204).send();
  };

  private setAuthCookie(
    response: Response,
    token: string,
  ) {
    response.cookie(
      env.cookieName,
      token,
      {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: 'lax',
        path: '/',
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      },
    );
  }

  private shouldReturnToken(
    request: Request,
  ) {
    return (
      request.headers[
        'x-client-platform'
      ] !== 'web'
    );
  }
}