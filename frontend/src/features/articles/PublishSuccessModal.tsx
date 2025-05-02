import { Button, Modal } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IoShareSocial } from 'react-icons/io5';
import { Link } from 'react-router-dom';

const PublishSuccessModal = ({
  articleId,
  isOpen,
  close
}: {
  articleId: number;
  isOpen: boolean;
  close: () => void;
}) => {
  const { copy } = useClipboard();

  const handleClick = () => {
    copy(`http://localhost/article/${articleId}`);
    notifications.show({ message: 'Copied to clipboard' });
  };

  return (
    <Modal opened={isOpen} onClose={close} centered>
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-xl font-bold">Congrats 🎉</h1>
        <p className="text-center text-lg">
          Congrats! Your article has published
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" className="">
            <Link to={`/article/${articleId}`}>View article</Link>
          </Button>
          <Button
            variant="subtle"
            onClick={handleClick}
            rightSection={<IoShareSocial />}
          >
            Share
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PublishSuccessModal;
