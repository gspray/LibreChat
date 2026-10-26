import LessonCaddieHeader from '~/components/ssmlabs/LessonCaddieHeader';
import { AuthContextProvider } from '~/hooks/AuthContext';
import { useGetStartupConfig } from '~/data-provider';
import ShareView from '~/components/Share/ShareView';

function BrandedShareView() {
  const { data: startupConfig } = useGetStartupConfig();
  return (
    <div className="flex h-dvh flex-col">
      <LessonCaddieHeader startupConfig={startupConfig} />
      <div className="min-h-0 flex-1">
        <ShareView />
      </div>
    </div>
  );
}

export default function ShareRoute() {
  return (
    <AuthContextProvider authConfig={{ loginRedirect: '/login', optional: true }}>
      <BrandedShareView />
    </AuthContextProvider>
  );
}
