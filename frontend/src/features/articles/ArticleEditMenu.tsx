import { Menu, Button } from '@mantine/core';
import { PiCaretDownLight } from 'react-icons/pi';
import { useDisclosure } from '@mantine/hooks';
import DeleteArticleModal from './DeleteArticleModal';

const ArticleEditMenu = ({ articleId }: { articleId: number }) => {
  const [opened, { close, open }] = useDisclosure();

  return (
    <Menu shadow="md" width={200}>
      <DeleteArticleModal
        isOpen={opened}
        closeModal={close}
        articleId={articleId}
      />
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
        <Menu.Item color="red" onClick={() => open()}>
          Delete article
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ArticleEditMenu;
