import { Button } from '@mantine/core';
import { useAuthFormContext } from 'features/authentication/context/AuthFormContext';
import useGetMe from 'features/authentication/server/useGetMe';
import { CurrentFormType } from 'features/authentication/types/form';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumArticleBanner = () => {
  const { setIsOpen, setCurrentForm } = useAuthFormContext();
  const { data: user } = useGetMe();
  const navigate = useNavigate();

  const openAuthForm = (form: CurrentFormType) => {
    setIsOpen(true);
    setCurrentForm(form);
  };

  const handleNavigationToSubscription = () => {
    navigate('/profile/subscription');
  };

  return (
    <div className="relative flex flex-col gap-4 bg-black px-4 py-2 text-center">
      <p className="text-md absolute left-[35%] top-[-10%] rounded-md border bg-white p-1 font-bold text-black md:left-[38%] md:w-1/4">
        Premium article
      </p>
      <p className="md:text-l mt-6 p-2">
        This article is available to premium members only. If you are a premium
        member already, you can log in to view the content. If not, you can
        become a premium user today by registering.{' '}
      </p>
      {!user ? (
        <section className="mb-6 flex justify-center gap-2">
          <Button
            radius={'lg'}
            className="!w-2/3 text-black md:!w-1/4"
            onClick={() => openAuthForm('login')}
          >
            Login
          </Button>
          <Button
            radius={'lg'}
            className="!w-2/3 text-black md:!w-1/4"
            onClick={() => openAuthForm('register')}
          >
            Register
          </Button>
        </section>
      ) : (
        <section className="mb-6 flex justify-center gap-2">
          <Button
            radius={'lg'}
            className="!w-2/3 text-black md:!w-1/4"
            onClick={() => handleNavigationToSubscription()}
          >
            Subscribe
          </Button>
        </section>
      )}
    </div>
  );
};

export default PremiumArticleBanner;
