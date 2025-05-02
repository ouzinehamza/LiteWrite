import { Button, Modal } from '@mantine/core';
import useDeleteArticle from './server/useDeleteArticle';

const DeleteArticleModal = ({
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
        window.location.href = '/articles';
      }
    });
  };

  return (
    <Modal
      title="Delete article"
      opened={isOpen}
      onClose={closeModal}
      styles={{
        title: {
          fontWeight: 'bold'
        }
      }}
    >
      <p className="mb-4 text-left text-lg">
        Are you sure you want to delete this article? This operation is
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

export default DeleteArticleModal;
