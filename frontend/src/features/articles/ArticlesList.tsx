import useGetArticles from './server/useGetArticles';
import SearchParams from './types/SearchParams';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import { Text } from '@mantine/core';

interface ArticlesListProps {
  searchParams: SearchParams;
}

type SortDir = 'asc' | 'desc';

const ArticlesList = ({ searchParams }: ArticlesListProps) => {
  const [urlSearchParams] = useSearchParams();

  const [sortDirection, setSortDirection] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(
    searchParams.page ? searchParams.page : 1
  );

  const { data, isLoading, error } = useGetArticles({
    ...searchParams,
    page: currentPage,
    sort: { created_at: sortDirection },
    filter: {
      ...searchParams.filter,
      tags: urlSearchParams.get('tag') ?? undefined,
      status: searchParams.filter?.status ?? 'published'
    }
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (data?.data.length === 0) {
    return (
      <Text classNames={{ root: 'mx-auto text-center' }} my={'xl'}>
        No articles found
      </Text>
    );
  }

  if (error) {
    return <div>Error in results</div>;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <div className="articlesListSort">
        <p>
          Showing <span>{data?.data.length}</span> / <span>{data?.total}</span>
        </p>

        <div>
          <label htmlFor="sort">Sort by:</label>
          <select
            name="sort"
            id="sort"
            value={sortDirection}
            onChange={(e) => {
              setSortDirection(e.target.value as SortDir);
            }}
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>
      </div>

      <div className="articlesList">
        {data?.data.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <nav className="pagination">
        <ul className="pagination__list">
          {Array.from(
            { length: data?.last_page as number },
            (_, index) => index + 1
          ).map((page) => (
            <li
              className={`pagination__item ${
                currentPage === page ? 'pagination__item--active' : ''
              }`}
              key={page}
              onClick={() => handlePageChange(page)}
            >
              <span>{page}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ArticlesList;
