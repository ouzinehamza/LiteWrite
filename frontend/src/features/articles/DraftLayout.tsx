import React, { useEffect } from 'react';
import DraftSidebar from './DraftSidebar';
import { useScrollIntoView } from '@mantine/hooks';

const DraftLayout = ({ children }: { children: React.ReactNode }) => {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);
  return (
    <main ref={targetRef} className="fixed inset-0 overflow-hidden pt-20">
      <div className="grid max-w-screen-2xl grid-cols-4 overflow-hidden xl:mx-auto">
        <DraftSidebar />

        <div className="col-span-3 h-screen overflow-y-auto py-2">
          {children}
        </div>
      </div>
    </main>
  );
};

export default DraftLayout;
