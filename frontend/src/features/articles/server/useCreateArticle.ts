import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createArticle } from 'utils/axios';

const useCreateArticle = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  return mutation;
};

export default useCreateArticle;
