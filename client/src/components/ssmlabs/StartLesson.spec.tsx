import { render, screen } from '@testing-library/react';
import type { TStartupConfig } from 'librechat-data-provider';
import StartLesson from './StartLesson';

jest.mock('~/hooks', () => ({ useLocalize: () => () => 'Start Lesson' }));

function config(startLessonUrl?: string): TStartupConfig {
  return { interface: { startLessonUrl } } as TStartupConfig;
}

describe('Start Lesson', () => {
  it('keeps deployments without a configured app link unchanged', () => {
    render(<StartLesson startupConfig={config()} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('offers an accessible app link instead of submitting the chat form', () => {
    render(
      <StartLesson
        startupConfig={config('https://lessoncaddie.ssmlabs.com/app?view=start-lesson')}
      />,
    );
    const link = screen.getByRole('link', { name: 'Start Lesson' });
    expect(link).toHaveAttribute('href', 'https://lessoncaddie.ssmlabs.com/app?view=start-lesson');
    expect(link).not.toHaveAttribute('target');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each(['javascript:alert(1)', 'data:text/html,hello', '/app', 'invalid'])(
    'does not render an unsafe or invalid app URL: %s',
    (url) => {
      render(<StartLesson startupConfig={config(url)} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    },
  );
});
