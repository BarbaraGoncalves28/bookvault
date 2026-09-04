import { BooksListScreen } from '../../../screens/books/books-list-screen';

export default function ReadingRoute() {
  return <BooksListScreen title="Lendo" filters={{ status: 'READING' }} />;
}
