import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import LessonCaddieHeader from '~/components/ssmlabs/LessonCaddieHeader';
import { useGetStartupConfig } from '~/data-provider';

export default function BrandedStandalone({ children }: { children?: ReactNode }) {
  const { data: startupConfig } = useGetStartupConfig();
  return (
    <div className="flex min-h-dvh flex-col">
      <LessonCaddieHeader startupConfig={startupConfig} />
      <div className="min-h-0 flex-1">{children ?? <Outlet />}</div>
    </div>
  );
}
