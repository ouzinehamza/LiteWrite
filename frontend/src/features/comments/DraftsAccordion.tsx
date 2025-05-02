import React from 'react';
import { Accordion, Button, Text } from '@mantine/core';
import useGetUserDrafts from 'features/articles/server/useGetUserDrafts';
import useGetMe from 'features/authentication/server/useGetMe';

type DraftsAccordionProps = {
  articleId: number;
  onRestore: (content: string, id: number) => void; // Function to restore draft content
};

const DraftsAccordion = ({ onRestore, articleId }: DraftsAccordionProps) => {
  const { data: user } = useGetMe(); // Fetch the logged-in user
  const userId = user?.id ?? 0;

  const {
    data: drafts,
    isLoading,
    isError
  } = useGetUserDrafts(articleId, userId);

  if (isLoading) {
    return <Text>Loading drafts...</Text>;
  }

  if (isError || !drafts || drafts.length === 0) {
    return <></>;
  }

  return (
    <Accordion>
      {drafts.map((draft) => (
        <Accordion.Item key={draft.id} value={`draft-${draft.id}`}>
          <Accordion.Control>
            <Text>Draft: {draft.content.substring(0, 50)}...</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" mb="sm">
              Draft Content:
            </Text>
            <Text mb="sm">{draft.content}</Text>

            <Text size="sm" mt="sm">
              History Versions:
            </Text>
            {draft.histories.length > 0 ? (
              draft.histories.map((history) => (
                <div key={history.id} style={{ marginBottom: '10px' }}>
                  <Text>{history.content}</Text>
                  <Button
                    size="xs"
                    onClick={() => onRestore(history.content, draft.id)}
                    style={{ marginTop: '5px' }}
                  >
                    Restore
                  </Button>
                </div>
              ))
            ) : (
              <Text size="xs" color="dimmed">
                No history versions available for this draft.
              </Text>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default DraftsAccordion;
