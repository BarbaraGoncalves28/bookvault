import { BooksListScreen } from '../../../screens/books/books-list-screen';

export default function CompletedRoute() {
  return <BooksListScreen title="Lidos" filters={{ status: 'COMPLETED' }} />;
}
