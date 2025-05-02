import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { fetchArticleHistory } from 'utils/axios';

export const buildQueryOptions = (articleId: number) => {
  return infiniteQueryOptions({
    queryKey: ['articles', 'history', articleId],
    queryFn: ({ pageParam = 1 }) =>
      fetchArticleHistory({
        id: articleId,
        page: pageParam,
        sort: { updated_at: 'desc' }
      }),
    staleTime: 1000 * 20,
    enabled: !!articleId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    }
  });
};

const useArticleHistory = (articleId: number) => {
  return useInfiniteQuery(buildQueryOptions(articleId));
};

export default useArticleHistory;
