import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema, CATEGORIES } from '../schema.js';
import { useCreateBook } from '../queries.js';

const EMPTY_VALUES = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  year: '',
  rating: '',
  notes: '',
};

function Field({ name, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <p id={`${name}-error`} className="error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function BookForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onTouched',
  });

  const { mutate, isPending, isSuccess, isError, error } = useCreateBook();

  const onSubmit = (values) => {
    mutate(values, {
      onSuccess: () => reset(EMPTY_VALUES),
    });
  };

  // Vincula cada input con su mensaje de error para lectores de pantalla.
  const a11y = (name) => ({
    id: name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form className="card ticket" noValidate onSubmit={handleSubmit(onSubmit)}>
      <span className="card-eyebrow">Ficha de lectura</span>
      <h2>Registrar un libro</h2>

      <Field name="title" label="Título" error={errors.title}>
        <input type="text" {...register('title')} {...a11y('title')} />
      </Field>

      <Field name="author" label="Autor" error={errors.author}>
        <input type="text" {...register('author')} {...a11y('author')} />
      </Field>

      <Field name="isbn" label="ISBN-13 (opcional)" error={errors.isbn}>
        <input type="text" inputMode="numeric" placeholder="978-84-376-0494-7" {...register('isbn')} {...a11y('isbn')} />
      </Field>

      <Field name="category" label="Categoría" error={errors.category}>
        <select {...register('category')} {...a11y('category')}>
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field name="year" label="Año de publicación" error={errors.year}>
        <input type="number" {...register('year')} {...a11y('year')} />
      </Field>

      <Field name="rating" label="Valoración" error={errors.rating}>
        <select {...register('rating')} {...a11y('rating')}>
          <option value="">Elige una valoración</option>
          {[1, 2, 3, 4, 5].map((stars) => (
            <option key={stars} value={stars}>
              {stars} {stars === 1 ? 'estrella' : 'estrellas'}
            </option>
          ))}
        </select>
      </Field>

      <Field name="notes" label="Notas (opcional)" error={errors.notes}>
        <textarea rows={3} {...register('notes')} {...a11y('notes')} />
      </Field>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Guardando…' : 'Guardar libro'}
      </button>

      {isSuccess && <p role="status">Libro guardado correctamente.</p>}
      {isError && (
        <p role="alert" className="error">
          {error.message}
        </p>
      )}
    </form>
  );
}
