import { Badge, Button, Card, Drawer, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PublishSuccessModal from './PublishSuccessModal';
import useArticleHistory from './server/useArticleHistory';
import { ApiArticleVersion } from 'types/ApiArticle';
import { formatDate } from 'date-fns';
import { useDisclosure } from '@mantine/hooks';
import RestoreRevisionModal from './RestoreRevisionModal';
import { cssAppliedContent } from 'utils';

const RevisionCard = ({
  article,
  openRevisionModal
}: {
  article: ApiArticleVersion;
  openRevisionModal: () => void;
}) => {
  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="md"
      className="brightness-90 transition-all duration-150 hover:cursor-pointer hover:brightness-75"
      withBorder
      my={16}
      onClick={() => {
        openRevisionModal();
      }}
    >
      <Stack gap={4} mb="xs">
        <Text lineClamp={1} variant="gradient" fw={1000}>
          {formatDate(article.created_at, 'MMMM dd, yyyy hh:mm')}
        </Text>
      </Stack>
      <Text size="sm" c="dimmed" lineClamp={3}>
        <div
          dangerouslySetInnerHTML={{
            __html: cssAppliedContent(article.content)
          }}
        />
      </Text>
    </Card>
  );
};

const RevisionsSidePane = ({
  isOpen,
  close,
  onHistorySelect
}: {
  isOpen: boolean;
  close: () => void;
  onHistorySelect: (articleVersion: ApiArticleVersion) => void;
}) => {
  const { id } = useParams();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useArticleHistory(Number(id));

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [opened, { open: openRevisionModal, close: closeRevisionModal }] =
    useDisclosure();

  const [currentVersion, setCurrentVersion] = useState<ApiArticleVersion>();

  const handleVersionRestore = (version: ApiArticleVersion) => {
    onHistorySelect(version);
    closeRevisionModal();
  };

  return (
    <>
      {id && (
        <PublishSuccessModal
          isOpen={openSuccessModal}
          close={() => setOpenSuccessModal(false)}
          articleId={Number(id)}
        />
      )}

      {currentVersion && (
        <RestoreRevisionModal
          isOpen={opened}
          close={closeRevisionModal}
          articleVersion={currentVersion}
          handleSelectVersion={() => handleVersionRestore(currentVersion)}
        />
      )}

      <Drawer
        offset={8}
        radius="md"
        position="right"
        opened={isOpen}
        onClose={() => close()}
        title="Version history"
      >
        {isLoading ? (
          <Badge>Loading...</Badge>
        ) : error ? (
          <Badge color="red">Error loading revisions</Badge>
        ) : (
          <>
            {data?.pages.map((page) =>
              page.data.map((draft) => {
                return (
                  <>
                    <RevisionCard
                      key={draft.created_at}
                      article={draft}
                      openRevisionModal={() => {
                        setCurrentVersion(draft);
                        openRevisionModal();
                      }}
                    />
                  </>
                );
              })
            )}
            {hasNextPage && (
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                fullWidth
                mt="md"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load More'}
              </Button>
            )}
          </>
        )}
      </Drawer>
    </>
  );
};

export default RevisionsSidePane;
