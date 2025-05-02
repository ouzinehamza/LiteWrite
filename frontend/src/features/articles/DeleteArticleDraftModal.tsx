import { Button, Modal } from '@mantine/core';
import useDeleteArticle from './server/useDeleteArticle';

const DeleteArticleDraftModal = ({
  articleId,
  isOpen,
  closeModal
}: {
  articleId: number;
  isOpen: boolean;
  closeModal: () => void;
}) => {
  const { mutate: deleteArticle, isPending } = useDeleteArticle(articleId);

  const handleDelete = () => {
    deleteArticle(undefined, {
      onSettled: () => {
        window.location.href = '/draft';
      }
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={closeModal}
      title="Delete draft"
      styles={{
        title: {
          fontWeight: 'bold !important'
        }
      }}
    >
      <p className="mb-4 text-center text-lg">
        Are you sure you want to delete this article draft? This operation is
        irreversible.
      </p>
      <Button
        variant="primary"
        onClick={() => handleDelete()}
        className="float-right mb-4"
        loading={isPending}
      >
        Continue
      </Button>
    </Modal>
  );
};

export default DeleteArticleDraftModal;
