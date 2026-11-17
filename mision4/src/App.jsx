import BookForm from './components/BookForm.jsx';
import BookList from './components/BookList.jsx';

export default function App() {
  return (
    <main>
      <header className="sign">
        <span className="sign-eyebrow">Est. 2026 · Sala de lectura</span>
        <h1>Club de lectura</h1>
        <p>Registra los libros que lees y consulta la biblioteca compartida.</p>
      </header>
      <div className="layout">
        <BookForm />
        <BookList />
      </div>
      <footer className="footer">Silencio, por favor · Se está leyendo</footer>
    </main>
  );
}
