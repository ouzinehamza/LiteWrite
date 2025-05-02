import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchArticle } from 'utils/axios';

export const buildQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['articles', id],
    queryFn: () => fetchArticle(id),
    staleTime: 1000 * 20,
    enabled: !!id
  });
};

const useArticle = (id: number) => {
  const { data, isLoading, error, refetch } = useQuery(buildQueryOptions(id));

  return { data, isLoading, error, refetch };
};

export default useArticle;
