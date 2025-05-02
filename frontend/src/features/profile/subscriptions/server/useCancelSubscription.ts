import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelSubscriptionPlans } from 'utils/axios';

const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscriptionPlans,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
};

export default useUpdateSubscription;
