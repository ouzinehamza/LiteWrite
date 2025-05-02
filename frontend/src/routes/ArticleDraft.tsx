import { Button, Loader, Textarea } from '@mantine/core';
import DraftLayout from 'features/articles/DraftLayout';
import useArticle from 'features/articles/server/useArticle';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { RichTextEditor } from 'components/RichTextEditor';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import useUpdateArticle from 'features/articles/server/useUpdateArticle';
import DraftMenu from 'features/articles/DraftMenu';
import ArticleEditSidePane from 'features/articles/ArticleEditSidePane';
import { useQueryClient } from '@tanstack/react-query';
import { ImImage } from 'react-icons/im';
import { stripQuotes } from 'utils';
import { MAX_FILE_SIZE } from 'utils/constants';
import { notifications } from '@mantine/notifications';
import { BiCloudUpload } from 'react-icons/bi';
import RevisionsSidePane from 'features/articles/RevisionsSidePane';
import { ApiArticleVersion } from 'types/ApiArticle';
import CoverImageEdit from 'features/articles/CoverImageEdit';

const ArticleDraft = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: draft } = useArticle(Number(id));
  const { mutate: updateDraft, isPending: isUpdating } = useUpdateArticle(
    Number(id)
  );

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<string>('');
  const [coverImage, setCoverImage] = useState<File>();
  const [openPublishPane, handlersPublishPane] = useDisclosure(false);
  const [openVersionsPane, handlersVersionsPane] = useDisclosure(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedDraftUpdate = useDebouncedCallback(() => {
    updateDraft(
      {
        title:
          titleRef.current?.value === '' ? '""' : titleRef.current?.value || '',
        content: contentRef.current === '' ? '""' : contentRef.current,
        cover: coverImage
      },
      {
        onSuccess: () => {
          setCoverImage(undefined);
          queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
      }
    );
  }, 1500);

  const handleTitleChange = () => {
    debouncedDraftUpdate();
  };

  const handleContent = (value: string) => {
    contentRef.current = value;
    debouncedDraftUpdate();
  };

  const onHistorySelect = (article: ApiArticleVersion) => {
    if (titleRef.current) titleRef.current.value = article.title;
    contentRef.current = article.content;
    debouncedDraftUpdate();
    // Trigger a re-render to update the RichTextEditor
    forceUpdate();
  };

  useEffect(() => {
    if (draft) {
      if (titleRef.current) titleRef.current.value = stripQuotes(draft.title);
      contentRef.current = stripQuotes(draft.content);
      // Trigger a re-render to update the RichTextEditor
      forceUpdate();
    }
  }, [draft]);

  // Force update function
  const [, updateState] = useState({});
  const forceUpdate = () => updateState({});

  return (
    <DraftLayout>
      <div className="space-y-4 px-8">
        <div className="flex justify-between gap-4">
          {!draft?.cover_url ? (
            <Button
              radius={'xl'}
              variant="subtle"
              leftSection={<ImImage />}
              className="transition-all duration-150"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isUpdating}
            >
              <span>Add cover</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <span className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-600/50 px-2 py-1 text-sm">
              <BiCloudUpload className="size-4" />
              {isUpdating ? (
                <span>
                  Saving <Loader size={'xs'} />
                </span>
              ) : (
                'Saved'
              )}
            </span>

            <DraftMenu
              openRevisionPanel={handlersVersionsPane.open}
              draftId={Number(draft?.id)}
            />
            <Button
              variant="outline"
              onClick={handlersPublishPane.open}
              className="transition-all duration-150"
            >
              Publish
            </Button>
          </div>
        </div>
        <div className="mx-auto">
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size > MAX_FILE_SIZE) {
                  notifications.show({
                    message: 'Maximum file size is 5MB',
                    position: 'top-center'
                  });
                }
                if (file && file.type.startsWith('image/')) {
                  setCoverImage(file);
                  debouncedDraftUpdate();
                } else {
                  // Handle invalid file type
                  alert('Please select an image file');
                  // Clear the input
                  e.target.value = '';
                }
              }}
              accept="image/*"
              className="hidden"
            />

            {draft?.cover_url && (
              <CoverImageEdit
                coverUrl={draft.cover_url}
                articleId={Number(id)}
              />
            )}

            <Textarea
              placeholder="Article title ..."
              ref={titleRef}
              onChange={handleTitleChange}
              styles={{
                input: {
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }
              }}
              rows={1}
            />

            {draft?.content && (
              <RichTextEditor
                value={contentRef.current}
                onChange={(value) => handleContent(value)}
              />
            )}
          </div>
        </div>
      </div>

      <ArticleEditSidePane
        isOpen={openPublishPane}
        close={handlersPublishPane.close}
        articleStatus="draft"
        draftId={Number(id)}
      />

      <RevisionsSidePane
        isOpen={openVersionsPane}
        close={handlersVersionsPane.close}
        onHistorySelect={onHistorySelect}
      />
    </DraftLayout>
  );
};

export default ArticleDraft;
