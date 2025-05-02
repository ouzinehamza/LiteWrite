import {
  Badge,
  Button,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text
} from '@mantine/core';
import { formatDate } from 'date-fns';
import { ApiArticleVersion } from 'types/ApiArticle';
import { cssAppliedContent } from 'utils';

type Props = {
  isOpen: boolean;
  close: () => void;
  articleVersion: ApiArticleVersion;
  handleSelectVersion: () => void;
};

const RestoreRevisionModal = ({
  articleVersion,
  isOpen,
  close,
  handleSelectVersion
}: Props) => {
  return (
    <Modal
      opened={isOpen}
      radius="md"
      onClose={close}
      centered
      size="xl"
      title={`Version ${formatDate(
        articleVersion.created_at,
        'dd MMM, yyyy hh:mm'
      )}`}
    >
      <Stack gap={4} mb="xs">
        <Text lineClamp={1} variant="gradient" fw={1000}>
          {articleVersion.title}
        </Text>
        <Group>
          <Badge color="teal" variant="dot">
            Created:{' '}
            {formatDate(articleVersion.created_at, 'dd MMM, yyyy hh:mm')}
          </Badge>
        </Group>
      </Stack>
      <ScrollArea h={300} my={10}>
        <Text size="sm" c="dimmed">
          <div
            dangerouslySetInnerHTML={{
              __html: cssAppliedContent(articleVersion.content)
            }}
          />
        </Text>
      </ScrollArea>
      <Group justify="space-between">
        <Button variant="filled" color="red" onClick={handleSelectVersion}>
          Restore this version
        </Button>
        <Button variant="filled" color="blue" onClick={close}>
          Back
        </Button>
      </Group>
    </Modal>
  );
};

export default RestoreRevisionModal;
