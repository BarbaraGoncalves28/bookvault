import { BooksListScreen } from '../../../screens/books/books-list-screen';

export default function ToReadRoute() {
  return <BooksListScreen title="Quero ler" filters={{ status: 'TO_READ' }} />;
}
