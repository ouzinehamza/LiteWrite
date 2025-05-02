import React, { useState } from 'react';
import ArticlesFilter from './ArticlesFilter';
import ArticlesList from './ArticlesList';
import useGetMe from 'features/authentication/server/useGetMe';
import { useSearchParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { TextInput } from '@mantine/core';
import ApiArticle from 'types/ApiArticle';

const AuthorArticlesList = ({
  articleStatus
}: {
  articleStatus: ApiArticle['status'];
}) => {
  const { data: user } = useGetMe();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTagFilter = searchParams.get('tag');

  const searchKeyWordForm = useForm<{ searchKeyword: string }>({
    initialValues: {
      searchKeyword: ''
    }
  });

  const handleSearchKeywordForm = ({
    searchKeyword
  }: {
    searchKeyword: string;
  }) => {
    setSearchKeyword(searchKeyword);
  };
  return (
    <div className="py-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-1 self-start">
        <form
          className="searchArticlesForm w-2/5"
          onSubmit={searchKeyWordForm.onSubmit(handleSearchKeywordForm)}
        >
          <TextInput
            {...searchKeyWordForm.getInputProps('searchKeyword')}
            placeholder="Search by keyword..."
            mr="sm"
            radius="xl"
          />
        </form>

        {articleStatus === 'published' && (
          <ArticlesFilter
            currentFilter={currentTagFilter}
            setCurrentFilter={(tag) =>
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set('tag', tag ? tag.toLowerCase() : '');
                return newParams;
              })
            }
          />
        )}
      </div>
      <ArticlesList
        searchParams={{
          filter: { authorId: user?.id, status: articleStatus },
          search: searchKeyword
        }}
      />
    </div>
  );
};

export default AuthorArticlesList;
