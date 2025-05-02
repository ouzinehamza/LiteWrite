import { useMutation, useQueryClient } from '@tanstack/react-query';
import useGetMe from 'features/authentication/server/useGetMe';
import { updateArticleComment } from 'utils/axios';

const useUpdateComment = (commentId: number, articleId: number) => {
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  return useMutation({
    mutationFn: (data: { content: string; status: 'draft' | 'published' }) =>
      updateArticleComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-drafts', articleId, user?.id]
      });

      queryClient.invalidateQueries({
        queryKey: ['article-comments', articleId]
      });
    }
  });
};

export default useUpdateComment;
