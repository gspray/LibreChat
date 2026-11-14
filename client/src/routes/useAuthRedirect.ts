import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildLoginRedirectUrl } from 'librechat-data-provider';
import { useAuthContext } from '~/hooks';

export default function useAuthRedirect() {
  const { user, roles, isAuthenticated, isAuthReady } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthReady || isAuthenticated) {
      return;
    }
    const timeout = setTimeout(() => {
      navigate(buildLoginRedirectUrl(location.pathname, location.search, location.hash), {
        replace: true,
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAuthReady, isAuthenticated, navigate, location]);

  return {
    user,
    roles,
    isAuthenticated,
  };
}
