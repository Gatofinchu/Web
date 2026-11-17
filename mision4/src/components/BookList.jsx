import { useBooks, useInjectCorruptBook } from '../queries.js';

export default function BookList() {
  const { data, isPending, isError, error, isFetching, refetch } = useBooks();
  const injectCorrupt = useInjectCorruptBook();

  if (isPending) {
    return (
      <section className="card shelf-panel">
        <p role="status">Cargando biblioteca…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="card shelf-panel">
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
    <section className="card shelf-panel" aria-labelledby="library-title">
      <span className="card-eyebrow">Estantería compartida</span>
      <h2 id="library-title">
        Biblioteca <span className="count">{books.length}</span>
      </h2>

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
            <li key={book.id} className="book" data-category={book.category}>
              {/* Portada decorativa: el color depende de la categoría */}
              <div className="book-cover" aria-hidden="true">
                <span>{book.title.charAt(0)}</span>
              </div>
              <div className="book-info">
                <strong>{book.title}</strong>
                <span className="book-author">{book.author}</span>
                <span className="book-meta">
                  <span className="tag">{book.category}</span> {book.year}
                </span>
                <span className="stars" aria-label={`${book.rating} de 5 estrellas`}>
                  {'★'.repeat(book.rating)}
                  <span className="stars-empty" aria-hidden="true">
                    {'★'.repeat(5 - book.rating)}
                  </span>
                </span>
                {book.notes && <p className="notes">“{book.notes}”</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="secondary"
        onClick={() => injectCorrupt.mutate()}
        disabled={injectCorrupt.isPending}
      >
        Demo bonus: inyectar un registro corrupto
      </button>
    </section>
  );
}
