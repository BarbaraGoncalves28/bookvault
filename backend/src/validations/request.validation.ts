import { AppError } from '../shared/errors/app-error';

export type ValidationSchema = Record<string, (value: unknown, body: Record<string, unknown>) => void>;

export function validateBody(body: unknown, schema: ValidationSchema) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be an object.', 400);
  }

  const data = body as Record<string, unknown>;

  Object.entries(schema).forEach(([field, validator]) => {
    validator(data[field], data);
  });
}

export function requiredString(field: string, maxLength: number) {
  return (value: unknown) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new AppError(`${field} is required.`, 400);
    }

    if (value.trim().length > maxLength) {
      throw new AppError(`${field} must have at most ${maxLength} characters.`, 400);
    }
  };
}

export function optionalString(field: string, maxLength: number) {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value !== 'string') {
      throw new AppError(`${field} must be a string.`, 400);
    }

    if (value.trim().length > maxLength) {
      throw new AppError(`${field} must have at most ${maxLength} characters.`, 400);
    }
  };
}

export function optionalInteger(field: string, options: { min?: number; max?: number } = {}) {
  return (value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new AppError(`${field} must be an integer.`, 400);
    }

    if (options.min !== undefined && value < options.min) {
      throw new AppError(`${field} must be greater than or equal to ${options.min}.`, 400);
    }

    if (options.max !== undefined && value > options.max) {
      throw new AppError(`${field} must be less than or equal to ${options.max}.`, 400);
    }
  };
}

export function optionalBoolean(field: string) {
  return (value: unknown) => {
    if (value !== undefined && typeof value !== 'boolean') {
      throw new AppError(`${field} must be a boolean.`, 400);
    }
  };
}

export function optionalDateString(field: string) {
  return (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (typeof value !== 'string' || Number.isNaN(new Date(value).getTime())) {
      throw new AppError(`${field} must be a valid ISO date string.`, 400);
    }
  };
}
