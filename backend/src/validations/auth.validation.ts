import { AppError } from '../shared/errors/app-error';

import { requiredString, validateBody } from './request.validation';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function registerName(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('Preencha todos os campos.', 400);
  }

  if (value.trim().length > 120) {
    throw new AppError('O nome é muito longo.', 400);
  }
}

function email(value: unknown) {
  if (
    typeof value !== 'string' ||
    !emailRegex.test(value.trim())
  ) {
    throw new AppError('Dados inválidos. Tente novamente.', 400);
  }
}

function password(value: unknown) {
  if (
    typeof value !== 'string' ||
    value.length < 8
  ) {
    throw new AppError(
      'A senha deve ter pelo menos 8 caracteres.',
      400,
    );
  }
}

export function validateRegisterBody(body: unknown) {
  validateBody(body, {
    name: registerName,
    email,
    password,
  });
}

export function validateLoginBody(body: unknown) {
  validateBody(body, {
    email,
    password: requiredString('password', 255, 'A senha é obrigatória.'),
  });
}