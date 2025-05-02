import { Link, useLocation } from 'react-router-dom';
import ApiArticle from 'types/ApiArticle';
import { stripQuotes, url } from 'utils';

type ArticleCardProps = {
  article: ApiArticle;
};

const ArticleCard = ({ article }: ArticleCardProps) => {
  const { pathname } = useLocation();
  const isProfilePage = pathname === '/profile';

  return (
    <Link
      to={
        article.status === 'draft'
          ? `/draft/${article.id}`
          : `/article/${article.id}`
      }
      className="articleCard bg-gradient-to-bl from-blue-800"
    >
      {article.is_premium && (
        <div className="absolute right-5 top-5 z-10 flex h-[26px] w-[25px] items-center justify-center rounded-full bg-white">
          <img src="/src/assets/images/premium-icon.svg" />
        </div>
      )}

      {isProfilePage && (
        <Link
          to={
            article.status === 'draft'
              ? `/draft/${article.id}`
              : `/article/${article.id}/edit`
          }
          className="absolute bottom-5 right-5 z-10"
        >
          <img className="" src={'/src/assets/images/edit-pen.svg'} />
        </Link>
      )}

      {article.cover_url && (
        <div className="articleCard__imgBox">
          <img src={url(article.cover_url)} alt="article-cover" />
        </div>
      )}

      <div className="articleCard__body">
        <div className="tag--articleCard">
          {article.tags?.[0]?.name || 'Uncategorized'}
        </div>
        <div className="cardContent cardContent--articleCard">
          <p className="cardContent__date">
            {new Date(article.created_at).toDateString()}
          </p>
          <h3 className="cardContent__title line-clamp-2">
            {stripQuotes(article.title).length > 0 ? article.title : 'Untitled'}
          </h3>
          <p className="cardContent__author">By: {article.author.name}</p>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
