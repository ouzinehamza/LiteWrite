import './ProfileContainer.scss';
import useGetMe from 'features/authentication/server/useGetMe';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { url } from 'utils';
import { Avatar, Button, Tabs } from '@mantine/core';
import useCreateArticle from 'features/articles/server/useCreateArticle';
import AuthorArticlesList from 'features/articles/AuthorArticlesList';
import { useScrollIntoView } from '@mantine/hooks';
import { useEffect } from 'react';

const ARTICLE_TAB_QUERY_PARAM = 'articleTab' as const;

const ProfileContainer = () => {
  const { data: user } = useGetMe();
  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateArticle();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);

  const handleCreateDraft = () => {
    createDraft(
      {
        title: '""',
        content: '""',
        status: 'draft'
      },
      {
        onSuccess: (data) => {
          navigate(`/draft/${data.id}`);
        }
      }
    );
  };

  return (
    <main ref={targetRef}>
      <section className="profileHero">
        <div className="container--profileHero mt-12">
          <div className="profileHero__left">
            <h1>
              Welcome, <span> {user?.name} </span>
            </h1>
            <ul>
              <li>
                <Link to="/profile/edit">Edit profile -&gt;</Link>
              </li>
              <li>
                <Link to="/profile/subscription">Edit subscription -&gt;</Link>
              </li>
            </ul>
          </div>
          <div className="profileHeroImage">
            <Avatar
              className="profileHeroImage__image"
              src={url(user?.avatar || '')}
              name={user?.name}
              alt={`profile_image_${user?.name}`}
            />
          </div>
        </div>
      </section>

      <section className="articlesPageList">
        <div className="container flex flex-col items-center justify-center gap-10">
          <Button
            onClick={() => handleCreateDraft()}
            className="self-start"
            disabled={isCreatingDraft}
            loading={isCreatingDraft}
          >
            Create article
          </Button>

          <div className="w-full">
            <Tabs
              value={searchParams.get(ARTICLE_TAB_QUERY_PARAM) ?? 'published'}
              className="!flex !flex-col !gap-1"
              onChange={(tabName) =>
                setSearchParams((prev) => {
                  const newParams = new URLSearchParams(prev);
                  newParams.set(ARTICLE_TAB_QUERY_PARAM, tabName ?? '');
                  return newParams;
                })
              }
            >
              <Tabs.List>
                <Tabs.Tab value="published">Published</Tabs.Tab>
                <Tabs.Tab value="draft">Draft</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="published">
                <AuthorArticlesList articleStatus={'published'} />
              </Tabs.Panel>

              <Tabs.Panel value="draft">
                <AuthorArticlesList articleStatus={'draft'} />
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfileContainer;
