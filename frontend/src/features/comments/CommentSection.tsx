import React, { useState, useEffect } from 'react';
import { Avatar, Button, Pagination, TextInput, Tooltip } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import useArticleComments from 'features/articles/server/useArticleComments';
import useCreateComment from 'features/articles/server/useCreateComment';
import useUpdateComment from 'features/articles/server/useUpdateComment';
import useGetUserDrafts from 'features/articles/server/useGetUserDrafts';
import useGetMe from 'features/authentication/server/useGetMe';
import { useDebouncedCallback } from '@mantine/hooks';
import { z } from 'zod';
import DraftsAccordion from './DraftsAccordion';
import Comment from './Comment';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthFormContext } from 'features/authentication/context/AuthFormContext';

const commentFormSchema = z.object({
  content: z.string().min(1, { message: 'Comment cannot be empty' })
});

type CommentFormSchema = z.infer<typeof commentFormSchema>;

const CommentSection = ({ articleId }: { articleId: number }) => {
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const { setIsOpen, setCurrentForm } = useAuthFormContext();

  const [draftId, setDraftId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: comments } = useArticleComments(articleId, {
    page: currentPage
  });

  const form = useForm<CommentFormSchema>({
    initialValues: {
      content: ''
    },
    validate: zodResolver(commentFormSchema)
  });

  const { mutate: createComment } = useCreateComment(articleId);
  const { mutate: updateComment } = useUpdateComment(
    draftId as number,
    articleId
  );
  const { data: draftsData } = useGetUserDrafts(articleId, user ? user.id : 0);
  const latestDraft = draftsData ? draftsData[0] : null;

  const [undoRedoIndex, setUndoRedoIndex] = useState<number | null>(null);

  // Auto-save draft function with debounce
  const saveDraft = useDebouncedCallback((content: string) => {
    if (!draftId) {
      createComment(
        { content, status: 'draft' },
        {
          onSuccess: (data) => {
            setDraftId(Number(data.id));
            queryClient.invalidateQueries({
              queryKey: ['user-drafts', articleId, user?.id]
            });
          }
        }
      );
    } else {
      updateComment({ content, status: 'draft' });
    }
  }, 1500);

  // Handle input changes with auto-save
  const handleChange = (content: string) => {
    form.setFieldValue('content', content);
    saveDraft(content);
  };

  // Handle form submission
  const handleSubmit = (values: CommentFormSchema) => {
    updateComment({ ...values, status: 'published' });
    form.reset();
  };

  // Restore content from a draft or history
  const handleRestore = (content: string, id: number) => {
    form.setFieldValue('content', content);
    setDraftId(id);
  };

  // Restore draft on Undo
  const handleUndo = () => {
    if (latestDraft && latestDraft.histories.length > 0) {
      const index =
        undoRedoIndex !== null
          ? undoRedoIndex - 1
          : latestDraft.histories.length - 1;
      setUndoRedoIndex(index);
      form.setFieldValue('content', latestDraft.histories[index].content);
    }
  };

  // Restore draft on Redo
  const handleRedo = () => {
    if (
      latestDraft &&
      latestDraft.histories.length > 0 &&
      undoRedoIndex !== null &&
      undoRedoIndex < latestDraft.histories.length
    ) {
      const index = undoRedoIndex + 1;

      if (index === latestDraft.histories.length) {
        form.setFieldValue('content', latestDraft.content);
      } else {
        form.setFieldValue('content', latestDraft.histories[index].content);
      }

      setUndoRedoIndex(index);
    }
  };

  const initializeDraft = () => {
    if (draftsData && draftsData.length > 0) {
      const existingDraft = draftsData[0]; // Use the single draft
      setDraftId(existingDraft.id);
      form.setFieldValue('content', existingDraft.content); // Fallback to draft content
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    initializeDraft();
  }, [draftsData]);

  return (
    <div className="comments">
      <div className="containerSmall--comments">
        <h3>Comments:</h3>

        {user && (
          <DraftsAccordion onRestore={handleRestore} articleId={articleId} />
        )}

        <div className="comment--form">
          {user && (
            <Avatar src={user?.avatar} name={user?.name} alt="author avatar" />
          )}

          <form
            onSubmit={form.onSubmit(handleSubmit)}
            className="comment__form"
          >
            <TextInput
              withAsterisk
              placeholder="Write your comment..."
              key={form.key('content')}
              {...form.getInputProps('content')}
              onChange={(e) => handleChange(e.target.value)}
            />
            <Button
              radius={'xl'}
              size={'xs'}
              type={user ? 'submit' : 'button'}
              onClick={() => {
                if (user) return;
                setIsOpen(true);
                setCurrentForm('login');
              }}
            >
              {user ? 'Send' : 'Login to comment'}
            </Button>
          </form>

          {latestDraft && (
            <div className="flex gap-2">
              <Tooltip label="Undo">
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  disabled={
                    (latestDraft && latestDraft.histories.length == 0) ||
                    undoRedoIndex === 0
                  }
                  styles={{ root: { width: '80px' } }}
                >
                  Undo
                </Button>
              </Tooltip>
              <Tooltip label="Redo">
                <Button
                  onClick={handleRedo}
                  variant="outline"
                  disabled={
                    latestDraft
                      ? latestDraft.histories.length == 0 ||
                        undoRedoIndex === latestDraft.histories.length
                      : true
                  }
                  styles={{ root: { width: '80px' } }}
                >
                  Redo
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        {user?.has_active_subscription &&
          comments?.data.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
      </div>

      {user?.has_active_subscription &&
        comments?.data &&
        comments.data.length && (
          <div className="my-4 flex justify-center">
            <Pagination
              value={currentPage}
              total={Number(comments.last_page)}
              onChange={handlePageChange}
            />
          </div>
        )}
    </div>
  );
};

export default CommentSection;
