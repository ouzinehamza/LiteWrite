import { QueryClient } from '@tanstack/react-query';
import { buildQueryOptions } from './usePaymentHistory';

const loaderPaymentHistory = (queryClient: QueryClient) => async () => {
  const data = await queryClient.ensureQueryData(
    buildQueryOptions({ page: 1, perPage: 5 })
  );
  return data;
};

export default loaderPaymentHistory;
