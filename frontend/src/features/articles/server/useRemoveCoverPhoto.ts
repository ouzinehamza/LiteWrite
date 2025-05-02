import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCoverPhoto } from 'utils/axios';

const useRemoveCoverPhoto = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeCoverPhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', id] });
    }
  });
};

export default useRemoveCoverPhoto;
