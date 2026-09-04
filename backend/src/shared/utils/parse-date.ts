import { AppError } from '../errors/app-error';

export function parseOptionalDate(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(`${field} must be a valid ISO date string.`, 400);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${field} must be a valid ISO date string.`, 400);
  }

  return date;
}
