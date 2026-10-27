import type { TStartupConfig } from 'librechat-data-provider';
import BackToLessonCaddie from './BackToLessonCaddie';
import StartLesson from './StartLesson';
import { useLocalize } from '~/hooks';

export default function LessonCaddieHeader({ startupConfig }: { startupConfig?: TStartupConfig }) {
  const localize = useLocalize();
  return (
    <header className="border-border-light bg-surface-canvas text-text-primary flex h-[3.25rem] shrink-0 items-center gap-2 border-b px-2">
      <BackToLessonCaddie startupConfig={startupConfig} />
      <StartLesson startupConfig={startupConfig} />
      <span className="truncate text-base font-semibold">
        {localize('com_ui_lessoncaddie_title')}
      </span>
    </header>
  );
}
