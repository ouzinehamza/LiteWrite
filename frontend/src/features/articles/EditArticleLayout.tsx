import { useScrollIntoView } from '@mantine/hooks';
import { useEffect } from 'react';

const EditArticleLayout = ({ children }: { children: React.ReactNode }) => {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);
  return (
    <main ref={targetRef} className="fixed inset-0 overflow-hidden pt-20">
      <div className="flex h-full max-w-screen-2xl justify-center xl:mx-auto">
        <div className="h-screen w-4/5 overflow-y-auto py-2">{children}</div>
      </div>
    </main>
  );
};

export default EditArticleLayout;
