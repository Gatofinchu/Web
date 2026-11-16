import { useBooks } from '../queries.js';

export default function BookList() {
  const { data, isPending, isError, error, isFetching, refetch } = useBooks();

  if (isPending) {
    return (
      <section className="card">
        <p role="status">Cargando biblioteca…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="card">
        <p role="alert" className="error">
          No se pudo cargar la biblioteca: {error.message}
        </p>
        <button type="button" onClick={() => refetch()}>
          Reintentar
        </button>
      </section>
    );
  }

  const { books, discarded } = data;

  return (
    <section className="card" aria-labelledby="library-title">
      <h2 id="library-title">Biblioteca ({books.length})</h2>

      {isFetching && <p role="status">Actualizando…</p>}

      {discarded > 0 && (
        <p role="alert" className="warning">
          Se descartaron {discarded} registros con datos no válidos.
        </p>
      )}

      {books.length === 0 ? (
        <p>Aún no hay libros. Registra el primero.</p>
      ) : (
        <ul className="book-list">
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> · {book.author} · {book.category} ({book.year})
              <span className="stars" aria-label={`${book.rating} de 5 estrellas`}>
                {' '}
                {'★'.repeat(book.rating)}
              </span>
              {book.notes && <p className="notes">{book.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
