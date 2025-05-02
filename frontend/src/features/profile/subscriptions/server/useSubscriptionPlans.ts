import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchSubscriptionPlans } from 'utils/axios';

export const buildQueryOptions = () => {
  return queryOptions({
    queryKey: ['subscription-plans'],
    queryFn: () => fetchSubscriptionPlans(),
    staleTime: 1000 * 20
  });
};

const useSubscriptionPlans = () => {
  const { data, isLoading, error } = useQuery(buildQueryOptions());

  return { data, isLoading, error };
};

export default useSubscriptionPlans;
