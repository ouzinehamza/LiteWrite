import React, { useState } from 'react';
import useTags from './server/useTags';
import { TextInput } from '@mantine/core';

type Tag = {
  id: number;
  name: string;
};

type Props = {
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
};

const ArticleTagInput: React.FC<Props> = ({
  selectedTags,
  setSelectedTags
}) => {
  const { data: tags } = useTags();
  const [searchTerm, setSearchTerm] = useState('');
  // const [showTagSearch, setShowTagSearch] = useState(false);

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  const filteredTags = tags?.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTags.some((t) => t.id === tag.id)
  );

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex size-fit items-center rounded-full bg-gray-700/50 px-2 py-1 text-sm font-medium text-gray-300"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              type="button"
              className="ml-1 inline-flex size-4 items-center justify-center rounded-full text-black hover:bg-gray-400 hover:text-gray-500 focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}

        {/* {!showTagSearch && (
          <button
            type="button"
            className="bg-white px-2 py-1 text-sm font-medium text-black focus:outline-none"
            onClick={() => {
              setShowTagSearch(true);
            }}
          >
            + Add new tag
          </button>
        )} */}
      </div>

      {
        <div>
          <div className="space-y-2">
            <TextInput
              type="text"
              placeholder="Search tags..."
              className="text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex max-h-48 flex-row flex-wrap gap-2 overflow-y-auto rounded-md border border-gray-300 bg-gray-600 px-3 py-2 shadow-sm">
              {filteredTags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex size-fit items-center rounded-full bg-gray-700/50 px-2 py-1 text-sm font-medium text-gray-300"
                >
                  {tag.name}
                  <button
                    onClick={() => handleAddTag(tag)}
                    className="ml-1 inline-flex size-4 items-center justify-center rounded-full text-black hover:bg-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    +
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default ArticleTagInput;
