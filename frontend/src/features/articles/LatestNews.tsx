import React, { useState } from 'react';
import useGetArticles from './server/useGetArticles';
import ArticlesFilter from './ArticlesFilter';
import ArticleCard from './ArticleCard';
import { Link } from 'react-router-dom';

const LatestNews = () => {
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const { data: articles } = useGetArticles({
    page: 1,
    perPage: 4,
    filter: { tags: tagFilter ?? undefined, status: 'published' }
  });

  return (
    <section className="latestNews">
      <div className="container--latestNews">
        <div className="latestNews__header">
          <div className="latestNews__heading">
            <h3>Latest news</h3>
            <div className="divider--latestNews" />
            <p>Today&apos;s Top Stories Hot Off the Wire</p>
          </div>
          <ArticlesFilter
            currentFilter={tagFilter}
            setCurrentFilter={setTagFilter}
          />
        </div>
        <div className="articlesList">
          {articles?.data.map((article) => {
            return <ArticleCard key={article.id} article={article} />;
          })}
        </div>
        <div className="latestNews__link">
          <Link to="/articles" className="button--latestNews">
            News page
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
