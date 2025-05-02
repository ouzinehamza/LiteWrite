import React from 'react';
import useGetArticles from './server/useGetArticles';
import { Link } from 'react-router-dom';

const AuthorArticles = ({
  articleId,
  authorId
}: {
  articleId: number;
  authorId: number;
}) => {
  const { data: authorArticles } = useGetArticles({
    filter: { authorId: authorId, status: 'published' }
  });
  return (
    <section>
      <ul className="space-y-2">
        {authorArticles?.data.map((article) => {
          if (article.id === Number(articleId)) return null;
          return (
            <li
              key={article.id}
              className="cursor-pointer text-lg font-bold transition-all duration-150 hover:text-primary hover:underline"
            >
              <Link to={`/article/${article.id}`}>{article.title}</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default AuthorArticles;
