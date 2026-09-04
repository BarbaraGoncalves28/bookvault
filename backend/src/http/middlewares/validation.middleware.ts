import type { RequestHandler } from 'express';

export function validateRequestBody(validator: (body: unknown) => void): RequestHandler {
  return (request, _response, next) => {
    validator(request.body);
    return next();
  };
}
