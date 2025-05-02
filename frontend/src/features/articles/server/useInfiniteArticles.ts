import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { getArticles } from 'utils/axios';
import SearchParams from '../types/SearchParams';

export const buildQueryOptions = (searchParams: SearchParams) => {
  return infiniteQueryOptions({
    queryKey: ['articles', searchParams],
    queryFn: ({ pageParam = 1 }) =>
      getArticles({ ...searchParams, page: pageParam }),
    staleTime: 1000 * 20,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    }
  });
};

const useInfiniteArticles = (searchParams: SearchParams) => {
  return useInfiniteQuery(buildQueryOptions(searchParams));
};

export default useInfiniteArticles;
