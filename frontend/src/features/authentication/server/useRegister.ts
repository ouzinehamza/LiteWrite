import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from 'utils/axios';

const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);

      // we want to re fetch the me query to get the new user data, since we got authenticated
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
};

export default useRegister;
