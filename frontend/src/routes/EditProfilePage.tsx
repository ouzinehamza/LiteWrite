import { Avatar, Button } from '@mantine/core';
import { useDisclosure, useScrollIntoView } from '@mantine/hooks';
import useGetMe from 'features/authentication/server/useGetMe';
import DeleteProfileModal from 'features/profile/DeleteProfileModal';
import UpdateProfileForm from 'features/profile/UpdateProfileForm';
import UploadAvatarModal from 'features/profile/UploadAvatarModal';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { url } from 'utils';

const EditProfilePage = () => {
  const { data: user } = useGetMe();
  const [image, setImage] = useState<File | undefined>();

  const [opened, { close, open }] = useDisclosure();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    inputFileRef.current?.click();
  };

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);

  return (
    <main ref={targetRef}>
      {user && (
        <DeleteProfileModal
          isOpen={opened}
          closeModal={close}
          userId={user?.id}
        />
      )}

      {user && image && (
        <UploadAvatarModal
          userId={user.id}
          image={image}
          isOpen={!!image}
          closeModal={() => {
            setImage(undefined);
          }}
        />
      )}
      <section className="profileHero">
        <div className="container--profileHero">
          <div className="profileHero__left">
            <h1>
              Welcome, <span> {user?.name} </span>
            </h1>
            <ul>
              <li>
                <Link to="/profile">&lt;- Back to profile</Link>
              </li>
              <li>
                <Link to="/profile/subscription">Edit subscription -&gt;</Link>
              </li>
            </ul>
          </div>
          <div className="profileHeroImage">
            <Avatar
              className="profileHeroImage__image"
              src={url(user?.avatar || '')}
              name={user?.name}
              alt={`profile_image_${user?.name}`}
            />
            <img
              className="profileHeroImage__changeImage"
              src="/src/assets/images/edit-pen.svg"
              alt="edit-pen"
              onClick={() => handleFileSelect()}
            />

            <input
              ref={inputFileRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  setImage(file);
                } else {
                  // Handle invalid file type
                  alert('Please select an image file');
                  // Clear the input
                  e.target.value = '';
                }
              }}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </section>

      <section className="container !mt-8 flex w-full flex-col items-center gap-4">
        <UpdateProfileForm />
        <Button
          variant={'subtle'}
          className="mx-auto !w-2/4"
          color="red"
          onClick={() => open()}
        >
          Delete profile
        </Button>
      </section>
    </main>
  );
};

export default EditProfilePage;
