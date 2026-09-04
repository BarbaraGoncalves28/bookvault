export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserGenreStat {
  genre: string;
  count: number;
  percentage: number;
}

export interface UserStats {
  totalBooks: number;
  completedBooks: number;
  readingBooks: number;
  toReadBooks: number;
  abandonedBooks: number;
  favoriteBooks: number;

  pagesRead: number;
  totalPages: number;

  yearlyCompletedBooks: number;
  annualReadingGoal: number;

  averageRating: number;

  genres: UserGenreStat[];
}

export interface UpdateProfilePayload {
  name: string;
}

export interface UpdateAvatarPayload {
  avatarUrl: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}