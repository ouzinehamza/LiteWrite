import { QueryClient } from '@tanstack/react-query';
import { buildQueryOptions } from './useSubscriptionPlans';

const loaderSubscriptionPlans = (queryClient: QueryClient) => async () => {
  const data = await queryClient.ensureQueryData(buildQueryOptions());
  return data;
};

export default loaderSubscriptionPlans;
