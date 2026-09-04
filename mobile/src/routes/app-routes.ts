export const appRoutes = {
  auth: {
    login: '/login',
    register: '/register',
  },
  private: {
    home: '/',
    books: '/books',
    bookDetails: (bookId: string) => `/books/${bookId}`,
    newBook: '/books/new',
    editBook: (bookId: string) => `/books/${bookId}/edit`,
    profile: '/profile',
  },
} as const;
