import { useQueryClient } from '@tanstack/react-query';
import { buildQueryOptions } from './useGetMe';
import { logout as logoutRequest } from 'utils/axios';

const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = () => {
    logoutRequest().then(() => {
      localStorage.removeItem('token');
      queryClient.resetQueries({ queryKey: buildQueryOptions().queryKey });
    });
  };

  return logout;
};

export default useLogout;
