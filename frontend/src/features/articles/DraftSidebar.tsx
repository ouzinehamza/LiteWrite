import {
  Link,
  Navigate,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import { classNames } from 'utils';
import {
  Button,
  Divider,
  Loader,
  Skeleton,
  Text,
  TextInput
} from '@mantine/core';
import { FaSearchLocation } from 'react-icons/fa';
import useGetMe from 'features/authentication/server/useGetMe';
import { BiBookAdd } from 'react-icons/bi';
import useCreateArticle from './server/useCreateArticle';
import ApiArticle from 'types/ApiArticle';
import ApiPaginatedResponse from 'types/ApiPaginatedResponse';
import useInfiniteArticles from './server/useInfiniteArticles';
import { useState } from 'react';
import { useDebouncedCallback } from '@mantine/hooks';

const DraftSidebar = () => {
  const { data: user } = useGetMe();
  const { drafts: draftsFromLoader } = useLoaderData() as {
    drafts: ApiPaginatedResponse<ApiArticle>;
  };
  const [searchKeyword, setSearchKeyword] = useState('');

  const {
    data: drafts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteArticles({
    search: searchKeyword,
    filter: { status: 'draft', authorId: user?.id },
    sort: { updated_at: 'desc' }
  });
  const params = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentDraftId = params.id;

  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateArticle();

  const debouncedSearchInput = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKeyword(e.target.value);
    },
    1500
  );

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

  if (!isLoading && !drafts) {
    return <Loader />;
  }

  if (['/draft', '/draft/'].includes(pathname)) {
    if (draftsFromLoader.data.length > 0) {
      return <Navigate to={`/draft/${draftsFromLoader.data[0].id}`} />;
    }
  }

  return (
    <div className="sticky col-span-1 min-h-svh space-y-6 overflow-hidden border-r border-r-[#424242] px-3 py-4 md:left-0 md:top-0">
      <TextInput
        placeholder="Search drafts"
        leftSection={<FaSearchLocation />}
        // value={searchKeyword}
        onChange={(e) => debouncedSearchInput(e)}
      />
      <Button
        variant="subtle"
        leftSection={<BiBookAdd />}
        className="!flex !w-full !justify-start"
        onClick={() => handleCreateDraft()}
        loading={isCreatingDraft}
      >
        New draft
      </Button>
      <Divider my={'md'} />
      <div className="h-[calc(100vh-150px)] overflow-y-auto">
        {searchKeyword && (
          <Text mb={'sm'} className="!text-sm !text-gray-400">
            SHOWING RESULTS FOR: {searchKeyword}
          </Text>
        )}
        <ul className="flex flex-col gap-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} height={30} radius="md" />
              ))
            : drafts?.pages.map((page) =>
                page.data.map((draft) => {
                  return (
                    <li
                      key={draft.id}
                      className={classNames(
                        currentDraftId === draft.id.toString() &&
                          'bg-gray-600/50',
                        'cursor-pointer rounded-md p-2 transition-all duration-150 hover:bg-gray-600/50'
                      )}
                    >
                      <Link to={`/draft/${draft.id}`} className="block">
                        {draft.title !== '""' ? draft.title : 'Untitled'}
                      </Link>
                    </li>
                  );
                })
              )}
        </ul>
        {hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            fullWidth
            mt="md"
            variant="outline"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DraftSidebar;
