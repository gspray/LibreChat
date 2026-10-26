import { SystemRoles } from 'librechat-data-provider';
import { useGetStartupConfig } from '~/data-provider';
import { useAuthContext } from './AuthContext';

type StartupConfigWithHideToolActivity = {
  hideToolActivity?: boolean;
};

export default function useHideToolActivity(): boolean {
  const { user } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const hide = (startupConfig as StartupConfigWithHideToolActivity | undefined)?.hideToolActivity === true;
  if (!hide) {
    return false;
  }
  return user?.role !== SystemRoles.ADMIN;
}
