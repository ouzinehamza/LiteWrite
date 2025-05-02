import { Button, Modal } from '@mantine/core';
import useDeleteUser from 'features/authentication/server/useDeleteUser';

const DeleteProfileModal = ({
  userId,
  isOpen,
  closeModal
}: {
  userId: number;
  isOpen: boolean;
  closeModal: () => void;
}) => {
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const handleDelete = () => {
    deleteUser(userId, {
      onSettled: () => {
        window.location.href = '/';
      }
    });
  };

  return (
    <Modal opened={isOpen} onClose={closeModal}>
      <h1 className="mb-4 text-center text-lg font-bold">Delete profile</h1>
      <p className="mb-4 text-center text-lg">
        Are you sure you want to delete your account? This operation is
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

export default DeleteProfileModal;
