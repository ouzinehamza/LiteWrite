import { Menu, Button } from '@mantine/core';
import { PiCaretDownLight } from 'react-icons/pi';
import { useDisclosure } from '@mantine/hooks';
import DeleteArticleDraftModal from './DeleteArticleDraftModal';

const DraftMenu = ({
  draftId,
  openRevisionPanel
}: {
  draftId: number;
  openRevisionPanel: () => void;
}) => {
  const [opened, { close, open }] = useDisclosure();

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          radius={'lg'}
          variant="subtle"
          className="transition-all duration-150"
        >
          <PiCaretDownLight />
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={openRevisionPanel}>Revision history</Menu.Item>

        <Menu.Label>Danger zone</Menu.Label>

        <Menu.Item color="red" onClick={() => open()}>
          Delete draft
        </Menu.Item>
      </Menu.Dropdown>
      <DeleteArticleDraftModal
        isOpen={opened}
        closeModal={close}
        articleId={draftId}
      />
    </Menu>
  );
};

export default DraftMenu;
