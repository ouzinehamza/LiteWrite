import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { UpdateArticlePayload } from 'types/ArticleFormData';
import { updateArticle } from 'utils/axios';

const useUpdateArticle = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateArticlePayload) => updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', id] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        notifications.show({
          message: error.response?.data.message,
          position: 'bottom-center',
          color: 'red'
        });
      }
    }
  });
};

export default useUpdateArticle;
