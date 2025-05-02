import { useQuery } from '@tanstack/react-query';
import { fetchCommentDrafts } from 'utils/axios';

const useGetCommentDrafts = (commentId: number) => {
  return useQuery({
    queryKey: ['comment-drafts', commentId],
    queryFn: () => fetchCommentDrafts(commentId),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
};

export default useGetCommentDrafts;
