import { useQuery } from '@tanstack/react-query';
import { fetchUsersCommentDrafts } from 'utils/axios';

const useGetUserDrafts = (articleId: number, userId: number) => {
  return useQuery({
    queryKey: ['user-drafts', articleId, userId],
    queryFn: () => fetchUsersCommentDrafts(articleId, userId),
    enabled: !!userId && !!articleId
  });
};

export default useGetUserDrafts;
