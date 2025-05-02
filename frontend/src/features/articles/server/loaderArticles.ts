import { QueryClient } from '@tanstack/react-query';
import { buildQueryOptions } from './useGetArticles';
import { buildQueryOptions as buildQueryOptionsForGetMe } from 'features/authentication/server/useGetMe';
import { LoaderFunctionArgs } from 'react-router-dom';

const loaderArticles = (queryClient: QueryClient) => async () => {
  const data = await queryClient.ensureQueryData(
    buildQueryOptions({
      page: 1,
      filter: { status: 'published' }
    })
  );
  return data;
};

export const loaderAuthorArticles =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const isDraftPage = request.url.includes('/draft');

    const user = await queryClient.ensureQueryData(buildQueryOptionsForGetMe());

    const data = await queryClient.ensureQueryData(
      buildQueryOptions({
        filter: {
          authorId: user.id,
          status: isDraftPage ? 'draft' : 'published'
        },
        sort: { updated_at: 'desc' }
      })
    );

    return data;
  };

export default loaderArticles;
