import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createArticleComment } from 'utils/axios';

const useCreateComment = (articleId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; status: 'draft' | 'published' }) =>
      createArticleComment(articleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['article-comments', articleId]
      });
    }
  });
};

export default useCreateComment;
