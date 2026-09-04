import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'A senha atual é obrigatória.'),

  newPassword: z
    .string()
    .min(8, 'A nova senha deve ter pelo menos 8 caracteres.')
    .max(72, 'A nova senha deve ter no máximo 72 caracteres.'),
});

export const updateReadingGoalSchema = z.object({
  goal: z
    .number()
    .int()
    .min(1, 'A meta deve ser de pelo menos 1 livro.')
    .max(1000, 'A meta não pode ultrapassar 1000 livros.'),
});