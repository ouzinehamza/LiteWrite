import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from 'utils/axios';

const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
};

export default useUpdateProfile;
