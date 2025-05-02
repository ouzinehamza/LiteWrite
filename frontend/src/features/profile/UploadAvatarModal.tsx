import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useUpdateProfile from 'features/authentication/server/useUpdateProfile';
import React from 'react';

type UploadAvatarModalProps = {
  userId: number;
  isOpen: boolean;
  image: File;
  closeModal: () => void;
};

const UploadAvatarModal = ({
  userId,
  isOpen,
  image,
  closeModal
}: UploadAvatarModalProps) => {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleUpload = () => {
    updateProfile(
      { userId, data: { avatar: image } },
      {
        onSettled: () => {
          closeModal();
          notifications.show({
            message: 'Avatar uploaded successfully'
          });
        }
      }
    );
  };
  return (
    <Modal opened={isOpen} onClose={closeModal}>
      <h1 className="mb-4 text-center text-lg font-bold">Upload user avatar</h1>
      <img
        src={URL.createObjectURL(image)}
        alt="avatar-to-upload"
        className="mb-4 w-full"
      />
      <Button
        variant="primary"
        onClick={() => handleUpload()}
        className="float-right mb-4"
        loading={isPending}
      >
        Set as profile avatar
      </Button>
    </Modal>
  );
};

export default UploadAvatarModal;
