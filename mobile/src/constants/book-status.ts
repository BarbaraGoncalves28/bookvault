import type { BookStatus } from '../types/book';

export const bookStatusLabels: Record<BookStatus, string> = {
  TO_READ: 'Quero ler',
  READING: 'Lendo',
  COMPLETED: 'Lido',
};

export const bookStatusOptions = Object.entries(
  bookStatusLabels,
).map(([value, label]) => ({
  value: value as BookStatus,
  label,
}));