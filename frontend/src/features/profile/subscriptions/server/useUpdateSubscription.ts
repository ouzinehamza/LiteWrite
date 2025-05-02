import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSubscription } from 'utils/axios';

const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    }
  });
};

export default useUpdateSubscription;
