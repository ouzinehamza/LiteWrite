import React from 'react';
import ApiArticle from '../../types/ApiArticle';
import useGetArticles from '../articles/server/useGetArticles';
import { Link } from 'react-router-dom';

const FeaturedNewsCard = ({ article }: { article: ApiArticle }) => {
  return (
    <Link
      to={`/article/${article.id}`}
      className="featuredCard rounded-lg bg-gradient-to-bl from-blue-800"
    >
      {article.cover_url && (
        <img className="featuredCard__image" src={article.cover_url} />
      )}
      <div className="featuredCard__overlay" />
      <div className="featuredCard__content">
        {article.is_premium && (
          <div className="premiumFlag--featuredCard">
            <img className="" src="/src/assets/images/premium-icon.svg" />
          </div>
        )}

        <div className="tag--featuredCard">Featured</div>

        <div className="cardContent--featuredCard">
          <p className="cardContent__date">
            {new Date(article.created_at).toDateString()}
          </p>
          <h3 className="cardContent__title">{article.title}</h3>
          <p className="cardContent__author">By: {article.author.name}</p>
        </div>
      </div>
    </Link>
  );
};

const FeaturedNews = () => {
  const { data: articles } = useGetArticles({
    page: 1,
    perPage: 3,
    filter: { tags: 'featured', status: 'published' }
  });

  return (
    <section className="featuredNews">
      <div className="container--featuredNews">
        <div className="featuredNews__heading flex items-center justify-between">
          <h2>Featured news</h2>
          <Link to={'/articles?tag=featured'}>All featured news</Link>
        </div>

        <div className="featuredCardsList">
          {articles?.data.map((article) => {
            return <FeaturedNewsCard key={article.id} article={article} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;
