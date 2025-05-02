import { queryOptions, useQuery } from '@tanstack/react-query';
import ApiPaginatedRequestParams from 'types/ApiPaginatedRequestParams';
import { fetchPaymentHistory } from 'utils/axios';

export const buildQueryOptions = (searchParams: ApiPaginatedRequestParams) => {
  return queryOptions({
    queryKey: ['payment-history', searchParams],
    queryFn: () => fetchPaymentHistory(searchParams),
    staleTime: 1000 * 20
  });
};

const usePaymentHistory = (searchParams: ApiPaginatedRequestParams) => {
  const { data, isLoading, error, refetch } = useQuery(
    buildQueryOptions(searchParams)
  );

  return { data, isLoading, error, refetch };
};

export default usePaymentHistory;
