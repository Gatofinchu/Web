import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBook, fetchBooks } from './api.js';

export const bookKeys = {
  all: ['books'],
  list: () => ['books', 'list'],
};

export function useBooks() {
  return useQuery({
    queryKey: bookKeys.list(),
    queryFn: fetchBooks,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBook,
    // Tras guardar, invalidamos toda la familia "books" para que la lista se vuelva a pedir.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  });
}
