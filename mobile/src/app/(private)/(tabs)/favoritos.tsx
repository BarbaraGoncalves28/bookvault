import { BooksListScreen } from '../../../screens/books/books-list-screen';

export default function FavoritesRoute() {
  return <BooksListScreen title="Favoritos" filters={{ favorite: true }} />;
}
