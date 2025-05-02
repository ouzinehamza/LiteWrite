import { Button, Drawer, Switch, TextInput } from '@mantine/core';
import ArticleTagInput from './ArticleTagInput';
import { useEffect, useState } from 'react';
import { Tag } from 'types/ApiTag';
import useUpdateArticle from './server/useUpdateArticle';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublishSuccessModal from './PublishSuccessModal';
import { useQueryClient } from '@tanstack/react-query';
import ApiArticle from 'types/ApiArticle';
import useGetMe from 'features/authentication/server/useGetMe';

type InputProps = {
  preSelectedTags?: Tag[];
  isPremium?: boolean;
};

type ArticleEditSidePaneProps = {
  isOpen: boolean;
  close: () => void;
  inputProps?: InputProps;
  articleStatus: ApiArticle['status'];
  draftId: ApiArticle['id'];
};

const ArticleEditSidePane = ({
  isOpen,
  inputProps,
  articleStatus,
  close,
  draftId
}: ArticleEditSidePaneProps) => {
  const { data: user } = useGetMe();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const { mutate: updateArticle, isPending: isPublishing } = useUpdateArticle(
    Number(id)
  );

  const handlePublish = () => {
    // tags that didn't exist in the original article tag list
    const selectedTagIds = selectedTags.map((tag) => tag.id);
    const addedTags = selectedTagIds.filter(
      (id) => !inputProps?.preSelectedTags?.map((tag) => tag.id).includes(id)
    );

    // tags that exists in the original article tag list but don't exist anymore
    const removedTags =
      inputProps?.preSelectedTags
        ?.map((tag) => tag.id)
        .filter((id) => !selectedTagIds.includes(id)) ?? [];

    updateArticle(
      {
        added_tags: addedTags,
        removed_tags: removedTags,
        is_premium: isPremium,
        status: 'published'
      },
      {
        onSuccess: () => {
          setOpenSuccessModal(true);
          close();
          queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
      }
    );
  };

  useEffect(() => {
    setSelectedTags(inputProps?.preSelectedTags ?? []);
    setIsPremium(inputProps?.isPremium ?? false);
  }, [inputProps]);

  return (
    <>
      {id && (
        <PublishSuccessModal
          isOpen={openSuccessModal}
          close={() => {
            setOpenSuccessModal(false);
            articleStatus === 'draft' && navigate('/draft');
          }}
          articleId={Number(id)}
        />
      )}
      <Drawer
        offset={8}
        radius="md"
        position="right"
        opened={isOpen}
        onClose={() => close()}
        title={
          articleStatus === 'published' ? 'Article settings' : 'Draft settings'
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-sm text-gray-200">Select tags</span>
              <ArticleTagInput
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>

            {user?.has_active_subscription && (
              <div>
                <Switch
                  className="py-6"
                  checked={isPremium}
                  labelPosition="left"
                  label="Is this a premium article?"
                  onChange={() => setIsPremium((prev) => !prev)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handlePublish()} loading={isPublishing}>
              Publish
            </Button>
            <Link to={`/draft/${draftId}/preview`}>
              <Button variant="outline">Preview</Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ArticleEditSidePane;
