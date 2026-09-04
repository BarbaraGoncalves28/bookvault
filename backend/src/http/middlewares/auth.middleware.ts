import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import type { JwtPayload } from '../../shared/types/auth';

function getTokenFromRequest(
  request: Parameters<RequestHandler>[0],
): string | null {
  const authorization =
    request.headers.authorization;

  if (authorization) {
    const [scheme, token] =
      authorization.split(' ');

    if (
      scheme === 'Bearer' &&
      token
    ) {
      return token;
    }
  }

  const cookieHeader =
    request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim());

  const authCookie = cookies.find(
    (cookie) => {
      return cookie.startsWith(
        `${env.cookieName}=`,
      );
    },
  );

  if (!authCookie) {
    return null;
  }

  return authCookie.substring(
    `${env.cookieName}=`.length,
  );
}

export const ensureAuthenticated: RequestHandler = (
  request,
  _response,
  next,
) => {
  const token =
    getTokenFromRequest(request);

  if (!token) {
    throw new AppError(
      'Authentication required.',
      401,
    );
  }

  try {
    const decoded =
      jwt.verify(
        token,
        env.jwtSecret,
      ) as JwtPayload;

    request.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    return next();
  } catch {
    throw new AppError(
      'Authentication token is invalid or expired.',
      401,
    );
  }
};