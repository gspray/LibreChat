import { Button } from '@librechat/client';
import type { TStartupConfig } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';

/** A plain app link: starting a lesson never sends a chat message or invokes an MCP tool. */
export default function StartLesson({ startupConfig }: { startupConfig?: TStartupConfig }) {
  const localize = useLocalize();
  const href = startupConfig?.interface?.startLessonUrl;
  if (!href) {
    return null;
  }
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }
  } catch {
    return null;
  }

  return (
    <Button asChild variant="destructive" size="sm">
      <a href={href} onClick={(event) => event.stopPropagation()}>
        {localize('com_ui_start_lesson')}
      </a>
    </Button>
  );
}
