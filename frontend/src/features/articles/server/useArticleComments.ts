import { queryOptions, useQuery } from '@tanstack/react-query';
import ApiPaginatedRequestParams from 'types/ApiPaginatedRequestParams';
import { fetchArticleComments } from 'utils/axios';

export const buildQueryOptions = (
  articleId: number,
  searchParams?: ApiPaginatedRequestParams
) => {
  return queryOptions({
    queryKey: ['article-comments', articleId, searchParams],
    queryFn: () => fetchArticleComments(articleId, searchParams),
    enabled: !!articleId
  });
};

const useArticleComments = (
  articleId: number,
  searchParams?: ApiPaginatedRequestParams
) => {
  const { data, isLoading, error } = useQuery(
    buildQueryOptions(articleId, searchParams)
  );

  return { data, isLoading, error };
};

export default useArticleComments;
