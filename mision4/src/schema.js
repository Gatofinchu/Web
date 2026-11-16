import { z } from 'zod';

export const CATEGORIES = ['Novela', 'Ensayo', 'Poesía', 'Ciencia', 'Infantil'];

// ISBN-13: 13 dígitos que empiezan por 978 o 979 y cumplen el dígito de control.
const isValidIsbn13 = (value) => {
  const digits = value.replace(/[-\s]/g, '');
  if (!/^97[89]\d{10}$/.test(digits)) return false;
  const sum = [...digits].reduce(
    (acc, digit, index) => acc + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return sum % 10 === 0;
};

// Los <select> y <input type="number"> devuelven '' cuando están vacíos.
// Lo convertimos en undefined para que el mensaje sea "obligatorio", no "menor que".
const emptyToUndefined = (value) => (value === '' ? undefined : value);

export const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'El título necesita al menos 2 caracteres')
    .max(120, 'El título no puede superar los 120 caracteres'),
  author: z
    .string()
    .trim()
    .min(3, 'Escribe el nombre completo del autor'),
  isbn: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidIsbn13(value), 'ISBN-13 no válido: revisa los dígitos'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Elige una categoría' }),
  }),
  year: z.preprocess(
    emptyToUndefined,
    z
      .coerce.number({ invalid_type_error: 'Indica el año de publicación' })
      .int('El año debe ser un número entero')
      .min(1450, 'El año es demasiado antiguo')
      .max(new Date().getFullYear(), 'El año no puede ser futuro'),
  ),
  rating: z.preprocess(
    emptyToUndefined,
    z
      .coerce.number({ invalid_type_error: 'Elige una valoración' })
      .int('La valoración debe ser un número entero')
      .min(1, 'La valoración mínima es 1 estrella')
      .max(5, 'La valoración máxima es 5 estrellas'),
  ),
  notes: z
    .string()
    .trim()
    .max(300, 'Las notas no pueden superar los 300 caracteres'),
});

// Lo que devuelve el "servidor": el libro validado más su identificador y fecha.
export const bookRecordSchema = bookSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});
