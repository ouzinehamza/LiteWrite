import { Button, Loader, Textarea } from '@mantine/core';
import useArticle from 'features/articles/server/useArticle';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { RichTextEditor } from 'components/RichTextEditor';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import useUpdateArticle from 'features/articles/server/useUpdateArticle';
import ArticleEditSidePane from 'features/articles/ArticleEditSidePane';
import { ImImage } from 'react-icons/im';
import { stripQuotes } from 'utils';
import { MAX_FILE_SIZE } from 'utils/constants';
import { notifications } from '@mantine/notifications';
import { BiCloudUpload } from 'react-icons/bi';
import ArticleEditMenu from 'features/articles/ArticleEditMenu';
import EditArticleLayout from 'features/articles/EditArticleLayout';
import CoverImageEdit from 'features/articles/CoverImageEdit';

const EditArticle = () => {
  const { id } = useParams();
  const { data: article } = useArticle(Number(id));
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle(
    Number(id)
  );

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<string>('');
  const [coverImage, setCoverImage] = useState<File>();
  const [openPublishPane, handlersPublishPane] = useDisclosure(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedArticleUpdate = useDebouncedCallback(() => {
    updateArticle(
      {
        title:
          titleRef.current?.value === '' ? '""' : titleRef.current?.value || '',
        content: contentRef.current === '' ? '""' : contentRef.current,
        cover: coverImage
      },
      {
        onSuccess: () => {
          setCoverImage(undefined);
        }
      }
    );
  }, 1500);

  const handleTitleChange = () => {
    debouncedArticleUpdate();
  };

  const handleContent = (value: string) => {
    contentRef.current = value;
    debouncedArticleUpdate();
  };

  useEffect(() => {
    if (article) {
      if (titleRef.current) titleRef.current.value = stripQuotes(article.title);
      contentRef.current = stripQuotes(article.content);
      // Trigger a re-render to update the RichTextEditor
      forceUpdate();
    }
  }, [article]);

  // Force update function
  const [, updateState] = useState({});
  const forceUpdate = () => updateState({});
  return (
    <EditArticleLayout>
      <div className="space-y-4 px-8">
        <div className="flex justify-between gap-4">
          {!article?.cover_url ? (
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

            <ArticleEditMenu articleId={Number(id)} />
            <Button
              variant="outline"
              onClick={handlersPublishPane.open}
              className="transition-all duration-150"
            >
              Update
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
                  debouncedArticleUpdate();
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

            {article?.cover_url && (
              <CoverImageEdit
                coverUrl={article.cover_url}
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

            {article?.content && (
              <RichTextEditor
                value={contentRef.current}
                onChange={(value) => handleContent(value)}
              />
            )}
          </div>
        </div>
      </div>

      {article && (
        <ArticleEditSidePane
          isOpen={openPublishPane}
          close={handlersPublishPane.close}
          inputProps={{
            preSelectedTags: article.tags?.map((tag) => ({
              id: tag.id,
              name: tag.name
            })),
            isPremium: article.is_premium
          }}
          articleStatus="published"
          draftId={article.id}
        />
      )}
    </EditArticleLayout>
  );
};

export default EditArticle;
