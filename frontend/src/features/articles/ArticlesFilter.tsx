import React from 'react';
import useTags from './server/useTags';
import { classNames } from 'utils';

type ArticleFilterProps = {
  currentFilter: string | null;
  setCurrentFilter: (filter: string | null) => void;
};

const ArticlesFilter = ({
  currentFilter,
  setCurrentFilter
}: ArticleFilterProps) => {
  const { data: tags } = useTags();

  return (
    <nav className="w-2/4">
      <ul className="listTabs">
        <li
          onClick={() => {
            setCurrentFilter(null);
          }}
          className={classNames(currentFilter ? 'tag--tab' : 'tag--tabActive')}
        >
          All
        </li>
        {tags?.map((tag) => {
          return (
            <li
              key={tag.id}
              onClick={() => {
                setCurrentFilter(tag.name.toLowerCase());
              }}
              className={classNames(
                currentFilter?.toLowerCase() === tag.name.toLowerCase()
                  ? 'tag--tabActive'
                  : 'tag--tab'
              )}
            >
              {tag.name}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ArticlesFilter;
