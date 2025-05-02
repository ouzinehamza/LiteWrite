import {
  QueryCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BasicReactQuery from 'routes/BasicReactQuery';
import Root from 'routes/Root';
import Layout, { LayoutWithoutContainer } from './Layout';
import { MantineProvider } from '@mantine/core';
import ProtectedRoute from 'features/authentication/ProtectedRoute';
import ErrorPage from 'routes/ErrorElement';
import ArticlesPage from 'routes/ArticlesPage';
import ViewArticle from 'routes/ViewArticle';
import { notifications, Notifications } from '@mantine/notifications';
import loaderArticles, {
  loaderAuthorArticles
} from 'features/articles/server/loaderArticles';
import loaderViewArticle from 'features/articles/server/loaderViewArticle';
import loaderMe from 'features/authentication/server/loaderMe';
import ProfilePage from 'routes/ProfilePage';
import { isAxiosError } from 'axios';
import EditProfilePage from 'routes/EditProfilePage';
import CreateArticlePage from 'routes/CreateArticlePage';
import AuthFormProvider from 'features/authentication/context/AuthFormContext';
import SubscriptionsPage from 'features/profile/subscriptions/Subscription';
import loaderPaymentHistory from 'features/profile/subscriptions/server/loaderPaymentHistory';
import loaderSubscriptionPlans from 'features/profile/subscriptions/server/loaderSubscriptionPlans';
import ArticleDraft from 'routes/ArticleDraft';
import DraftLayout from 'features/articles/DraftLayout';
import EditArticle from 'routes/EditArticle';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        // We don't want to show error notification if user is not logged in
        return;
      }
      notifications.show({
        title: 'Error',
        message: `Something went wrong: ${error.message}`,
        color: 'red'
      });
    }
  })
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    loader: loaderMe(queryClient),
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            path: '/',
            element: <Root />
          },
          {
            path: '/basic-react-query',
            element: <BasicReactQuery />
          },
          {
            path: '/articles',
            element: <ArticlesPage />,
            loader: loaderArticles(queryClient)
          },
          {
            path: '/article',
            element: <CreateArticlePage />,
            loader: async (route) => {
              const id = new URL(route.request.url).searchParams.get('id');

              if (!id) return null;

              return loaderViewArticle(parseInt(id, 10), queryClient);
            }
          },
          {
            path: '/profile',
            element: (
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            ),
            loader: async () => {
              try {
                return loaderAuthorArticles(queryClient);
              } catch (error) {
                return null;
              }
            }
          },
          {
            path: '/profile/subscription',
            element: (
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            ),
            loader: async () => {
              try {
                const subscriptionPlans =
                  await loaderSubscriptionPlans(queryClient)();
                const paymentHistory =
                  await loaderPaymentHistory(queryClient)();
                return { subscriptionPlans, paymentHistory };
              } catch (error) {
                return null;
              }
            }
          },
          {
            path: '/profile/edit',
            element: (
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            )
          }
        ]
      }
    ]
  },
  {
    element: <LayoutWithoutContainer />,
    errorElement: <ErrorPage />,
    loader: loaderMe(queryClient),
    children: [
      {
        errorElement: <ErrorPage />,
        path: '/article/:id',
        element: <ViewArticle />,
        loader: async (route) => {
          if (!route.params.id) return null;

          return loaderViewArticle(parseInt(route.params.id, 10), queryClient);
        }
      },
      {
        path: '/article/:id/edit',
        element: (
          <ProtectedRoute>
            <EditArticle />
          </ProtectedRoute>
        ),
        loader: async (route) => {
          if (!route.params.id) return null;

          return loaderViewArticle(parseInt(route.params.id, 10), queryClient);
        }
      },
      {
        path: '/draft',
        element: (
          <ProtectedRoute>
            <DraftLayout>
              <></>
            </DraftLayout>
          </ProtectedRoute>
        ),
        loader: async (route) => {
          const drafts = await loaderAuthorArticles(queryClient)(route);

          return { drafts };
        }
      },
      {
        path: '/draft/:id',
        element: (
          <ProtectedRoute>
            <ArticleDraft />
          </ProtectedRoute>
        ),
        loader: async (route) => {
          const drafts = loaderArticles(queryClient)();
          const id = route.params.id;

          if (!id) throw new Error('Draft not found');

          const draft = await loaderViewArticle(
            parseInt(id, 10),
            queryClient
          )();

          return { drafts, draft };
        }
      },
      {
        path: '/draft/:id/preview',
        element: (
          <ProtectedRoute>
            <ViewArticle />
          </ProtectedRoute>
        ),
        loader: async (route) => {
          const drafts = loaderArticles(queryClient)();
          const id = route.params.id;

          if (!id) throw new Error('Draft not found');

          const draft = await loaderViewArticle(
            parseInt(id, 10),
            queryClient
          )();

          return { drafts, draft };
        }
      }
    ]
  }
]);

function App() {
  return (
    <StrictMode>
      <MantineProvider forceColorScheme="dark">
        <Notifications position="bottom-right" />
        <QueryClientProvider client={queryClient}>
          <AuthFormProvider>
            <RouterProvider router={router} />
          </AuthFormProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}

export default App;
