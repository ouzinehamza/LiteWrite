import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from 'utils/axios';

const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
};

export default useDeleteUser;
