import React from 'react';
import useRemoveCoverPhoto from './server/useRemoveCoverPhoto';
import { Button } from '@mantine/core';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { url } from 'utils';

const CoverImageEdit = ({
  coverUrl,
  articleId
}: {
  coverUrl: string;
  articleId: number;
}) => {
  const { mutate: removeCoverPhoto } = useRemoveCoverPhoto(Number(articleId));

  return (
    <div className="h-1/5">
      <Button
        variant="filled"
        style={{ backgroundColor: '#d1d5db' }}
        className="bg-g absolute left-[90%] top-14"
        onClick={() => removeCoverPhoto()}
      >
        <RiDeleteBin6Line className="text-xl text-primary" />
      </Button>

      <img
        src={url(coverUrl)}
        alt="cover-image"
        className="max-h-96 min-w-full rounded-lg object-cover"
      />
    </div>
  );
};
export default CoverImageEdit;
