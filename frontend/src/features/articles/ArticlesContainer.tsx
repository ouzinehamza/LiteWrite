import './style.scss';
import ArticlesList from './ArticlesList';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput } from '@mantine/core';
import ArticlesFilter from './ArticlesFilter';
import { useSearchParams } from 'react-router-dom';
import { useScrollIntoView } from '@mantine/hooks';

const ArticlesContainer = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTagFilter = searchParams.get('tag');

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

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

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);

  return (
    <main ref={targetRef}>
      <section className="articlesHero">
        <div className="container--articlesHero h-[190px] md:h-[258px]">
          <h1>Articles</h1>
        </div>
      </section>

      <section className="mx-auto my-[60px]">
        <div className="container flex flex-col items-center justify-center">
          <div className="articlesListHeading">
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
          </div>

          <ArticlesList searchParams={{ search: searchKeyword }} />
        </div>
      </section>
    </main>
  );
};

export default ArticlesContainer;
