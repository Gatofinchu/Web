import BookForm from './components/BookForm.jsx';
import BookList from './components/BookList.jsx';

export default function App() {
  return (
    <main>
      <header>
        <h1>Club de lectura</h1>
        <p>Registra los libros que lees y consulta la biblioteca compartida.</p>
      </header>
      <div className="layout">
        <BookForm />
        <BookList />
      </div>
    </main>
  );
}
