import { Button } from '@mantine/core';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AuthFormModal from 'features/authentication/AuthFormModal';
import useLogout from 'features/authentication/server/useLogout';
import { classNames } from 'utils';
import { useAuthFormContext } from 'features/authentication/context/AuthFormContext';
import PremiumBanner from './PremiumBanner';
import Footer from './Footer';
import useNewAuth from 'features/authentication/server/useNewAuth';
import IsAuthorizedRequestStatus from 'features/authentication/types/IsAuthorizedRequestStatus';
import { useScrollIntoView } from '@mantine/hooks';
import { useEffect } from 'react';

const NavigationBar = () => {
  const { setIsOpen } = useAuthFormContext();

  const logout = useLogout();
  const isAuthorized = useNewAuth();

  const { pathname } = useLocation();

  return (
    <header className="header">
      <div className="container--header">
        <Link to="/" className="header__logo">
          Thought<span>Canvas</span>
        </Link>
        {/* add ".nav--active" modifier to trigger mobile nav */}
        <nav className="nav">
          <ul className="nav__list">
            <li>
              <Link
                to="/"
                className={classNames(
                  'nav__link',
                  pathname === '/' && '!text-[#2cbcff]'
                )}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/articles"
                className={classNames(
                  'nav__link',
                  pathname === '/articles' && '!text-[#2cbcff]'
                )}
              >
                Articles
              </Link>
            </li>
            {isAuthorized === IsAuthorizedRequestStatus.AUTHORIZED ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className={classNames(
                      'nav__link',
                      pathname === '/profile' && '!text-[#2cbcff]'
                    )}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Button variant="filled" color="red" onClick={logout}>
                    Log out
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <Button
                  variant="filled"
                  color="green"
                  onClick={() => setIsOpen(true)}
                >
                  Sign In
                </Button>
              </li>
            )}
          </ul>
          <div className="nav__toggle nav__toggle--active">
            <img
              className="nav__open"
              src="/src/assets/images/menu-icon.svg"
              alt="Menu icon"
            />
            <img
              className="nav__close"
              src="/src/assets/images/close-icon.svg"
              alt="Menu icon"
            />
          </div>
        </nav>
      </div>
    </header>
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="">{children}</div>;
};

const Layout = () => {
  return (
    <div>
      <NavigationBar />
      <Container>
        <AuthFormModal />
        <Outlet />
        <PremiumBanner />
        <Footer />
      </Container>
    </div>
  );
};

export const LayoutWithoutContainer = () => {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();

  useEffect(() => {
    scrollIntoView({
      alignment: 'start'
    });
  }, [scrollIntoView]);
  return (
    <div ref={targetRef}>
      <NavigationBar />
      <AuthFormModal />
      <Outlet />
    </div>
  );
};

export default Layout;
