import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteArticle } from 'utils/axios';

const useDeleteArticle = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`articles-${id}`] });
    }
  });
};

export default useDeleteArticle;
