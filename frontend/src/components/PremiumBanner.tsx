import { Tooltip } from '@mantine/core';
import { useAuthFormContext } from 'features/authentication/context/AuthFormContext';
import useGetMe from 'features/authentication/server/useGetMe';
import { CurrentFormType } from 'features/authentication/types/form';
import { Link } from 'react-router-dom';

const PremiumBanner = () => {
  const { data: user } = useGetMe();
  const { setIsOpen, setCurrentForm } = useAuthFormContext();

  const openAuthForm = (form: CurrentFormType) => {
    setIsOpen(true);
    setCurrentForm(form);
  };

  return (
    <section className="premiumBanner">
      <div className="container--premiumBanner text-sm">
        <h3 className="premiumBanner__title">
          Start <span>premium</span> membership
        </h3>
        <p className="premiumBanner__text">
          Unlock exclusive benefits with our Premium Membership, including
          ad-free browsing, priority support, and early access to new features.
          Join today to elevate your experience and enjoy unlimited access to
          premium content and personalized insights.
        </p>
        {!user ? (
          <Tooltip label="You need to be logged in" withArrow>
            <button
              className="button--premiumBanner cursor-pointer transition-all duration-150"
              onClick={() => openAuthForm('login')}
            >
              Login to start premium
            </button>
          </Tooltip>
        ) : user?.has_active_subscription ? (
          <Tooltip label="Navigate to subscription page" withArrow>
            <Link
              to="/profile/subscription"
              className="button--premiumBanner cursor-pointer transition-all duration-150"
            >
              You&#39;re a premium subscriber
            </Link>
          </Tooltip>
        ) : (
          <Tooltip label="Navigate to subscription page" withArrow>
            <Link
              to="/profile/subscription"
              className="button--premiumBanner cursor-pointer transition-all duration-150"
            >
              Start premium
            </Link>
          </Tooltip>
        )}
      </div>
    </section>
  );
};

export default PremiumBanner;
