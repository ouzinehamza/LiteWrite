import { useScrollIntoView } from '@mantine/hooks';
import './Root.scss';
import FeaturedNews from 'features/articles/FeaturedNews';
import LatestNews from 'features/articles/LatestNews';
import { useEffect } from 'react';

const Root = () => {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);
  return (
    <main ref={targetRef}>
      <section className="hero">
        <article className="container--hero">
          <h1>
            Your Ideas, <span>Our Platform</span>
          </h1>
          <div className="divider" />
          <p>
            Unleash your creativity and share your knowledge with the world.
            Publish diverse articles, from tech insights to lifestyle tips, and
            reach a global audience of eager readers.
          </p>
        </article>
      </section>

      <FeaturedNews />

      <LatestNews />
    </main>
  );
};

export default Root;
