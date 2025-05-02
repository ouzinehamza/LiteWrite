import { Avatar, Container, Tooltip } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import Footer from 'components/Footer';
import PremiumBanner from 'components/PremiumBanner';
import AuthorArticles from 'features/articles/AuthorArticles';
import PremiumArticleBanner from 'features/articles/PremiumArticleBanner';
import useArticle from 'features/articles/server/useArticle';
import useGetMe from 'features/authentication/server/useGetMe';
import CommentSection from 'features/comments/CommentSection';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cssAppliedContent } from 'utils';

const ViewArticle = () => {
  const { id } = useParams();
  const { data: user } = useGetMe();
  const {
    data: article,
    isLoading,
    error,
    refetch: refetchArticle
  } = useArticle(parseInt(id!, 10));

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);

  useEffect(() => {
    refetchArticle();
  }, [refetchArticle, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !article) {
    throw new Error('Article not found');
  }

  const isUserLoggedIn = !!user;
  const hasActiveSubscription = user && user.has_active_subscription;

  const shouldRestrictAccess =
    article.is_premium && (!isUserLoggedIn || !hasActiveSubscription);

  return (
    <div ref={targetRef}>
      <Container className="mb-4 mt-24">
        <main>
          {article.cover_url ? (
            <img
              className="max-h-96 min-w-full rounded-lg object-cover"
              src={article.cover_url}
              alt="Article image"
            />
          ) : (
            <div className="min-h-96 rounded-lg bg-gradient-to-bl from-blue-800"></div>
          )}

          <div className="grid md:grid-cols-4">
            <section className="col-span-3">
              <div className="flex items-center gap-2 pt-4">
                {article.is_premium && (
                  <div className="flex h-[26px] w-[25px] items-center justify-center rounded-full bg-white">
                    <img
                      className=""
                      src="/src/assets/images/premium-icon.svg"
                    />
                  </div>
                )}
                {article.tags ? (
                  <div className="flex items-center gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="tag">
                        {tag.name}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <Tooltip
                        label={article.tags
                          .slice(3)
                          .map((tag) => tag.name)
                          .join(', ')}
                      >
                        <span className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-xs text-black transition-all duration-150 hover:bg-gray-300">
                          +{article.tags.length - 3}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                ) : (
                  <span className="tag">Uncategorized</span>
                )}

                <Link
                  to={'/articles'}
                  className="cursor-pointer p-1 text-sm transition-all duration-150 hover:underline"
                >
                  {' '}
                  {'<-'} Back to blog
                </Link>
              </div>
              <div className="divider my-4 !w-full"></div>

              <div className="space-y-16">
                <div
                  dangerouslySetInnerHTML={{
                    __html: cssAppliedContent(article.content)
                  }}
                />

                {shouldRestrictAccess && <PremiumArticleBanner />}
              </div>
            </section>
            <section className="space-y-6 px-8 pt-4">
              <div>
                <p className="mb-2 text-[#989898]">Article author:</p>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={article.author.avatar}
                    name={article.author.name}
                    alt="author avatar"
                  />

                  <p className="text-lg font-bold">{article.author.name}</p>
                </div>
              </div>

              <div>
                <p className="text-[#989898]">Posted by author:</p>
                <AuthorArticles
                  articleId={Number(id)}
                  authorId={article.author.id}
                />
              </div>

              <div>
                <p className="text-[#989898]">Share on social media:</p>
                <ul className="flex gap-2">
                  <li className="">
                    <a href="#">
                      <img
                        src="/src/assets/images/facebook-logo.svg"
                        alt="Facebook logo"
                      />
                    </a>
                  </li>
                  <li className="">
                    <a href="#">
                      <img
                        src="/src/assets/images/twitter-logo.svg"
                        alt="Twitter logo"
                      />
                    </a>
                  </li>
                  <li className="">
                    <a href="#">
                      <img
                        src="/src/assets/images/pinterest-logo.svg"
                        alt="Pinterest logo"
                      />
                    </a>
                  </li>
                  <li className="">
                    <a href="#">
                      <img
                        src="/src/assets/images/behance-logo.svg"
                        alt="Behance logo"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </Container>

      {id && <CommentSection articleId={parseInt(id, 10)} />}
      <PremiumBanner />
      <Footer />
    </div>
  );
};

export default ViewArticle;
