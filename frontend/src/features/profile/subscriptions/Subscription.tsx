import { Link, useLoaderData } from 'react-router-dom';
import PaymentHistory from './PaymentHistory';
import SubscriptionForm from './SubscriptionForm';
import { url } from 'utils';
import useGetMe from 'features/authentication/server/useGetMe';
import ApiUser from 'types/ApiUser';
import {
  ApiPaymentHistory,
  ApiSubscriptionPlan
} from 'types/ApiSubscriptionPlans';
import ApiPaginatedResponse from 'types/ApiPaginatedResponse';
import CancelSubscription from './CancelSubscription';
import { Avatar } from '@mantine/core';

const SubscriptionHero = ({ avatar, name }: ApiUser) => {
  return (
    <section className="profileHero">
      <div className="container--profileHero">
        <div className="profileHero__left">
          <h1>Edit Subscription</h1>
          <ul>
            <li>
              <Link to="/profile/edit">Edit profile -&gt;</Link>
            </li>
            <li>
              <Link to="/profile">&lt;- Back to profile</Link>
            </li>
          </ul>
        </div>
        <div className="profileHeroImage">
          <Avatar
            className="profileHeroImage__image"
            src={url(avatar || '')}
            name={name}
            alt={`profile_image_${name}`}
          />
        </div>
      </div>
    </section>
  );
};

const SubscriptionsPage = () => {
  // as this is inside a protected route, the user exists.
  const { data: user, isLoading } = useGetMe();

  const { subscriptionPlans, paymentHistory } = useLoaderData() as {
    subscriptionPlans: ApiSubscriptionPlan[];
    paymentHistory: ApiPaginatedResponse<ApiPaymentHistory>;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <main>
      {/* As we're in a protected route, the user must exist */}
      <SubscriptionHero {...user!} />
      <SubscriptionForm
        subscriptionPlans={subscriptionPlans}
        userId={user!.id}
      />
      {user?.has_active_subscription && <CancelSubscription />}
      <PaymentHistory
        initialPaymentHistory={paymentHistory}
        key={paymentHistory.data.length} // Forces re-render when data changes
      />
    </main>
  );
};

export default SubscriptionsPage;
