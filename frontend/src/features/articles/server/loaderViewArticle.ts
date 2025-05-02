import { QueryClient } from '@tanstack/react-query';
import { buildQueryOptions } from './useArticle';

const loaderViewArticle =
  (id: number, queryClient: QueryClient) => async () => {
    const data = await queryClient.ensureQueryData(buildQueryOptions(id));

    return data;
  };

export default loaderViewArticle;
