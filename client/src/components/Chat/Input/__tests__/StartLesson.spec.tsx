import { render, screen } from '@testing-library/react';
import { useGetStartupConfig } from '~/data-provider';
import StartLesson from '../StartLesson';

jest.mock('~/data-provider', () => ({ useGetStartupConfig: jest.fn() }));
jest.mock('~/hooks', () => ({ useLocalize: () => () => 'Start Lesson' }));

const startup = useGetStartupConfig as jest.Mock;

function configure(startLessonUrl?: string) {
  startup.mockReturnValue({ data: { interface: { startLessonUrl } } });
}

describe('Start Lesson', () => {
  it('keeps deployments without a configured app link unchanged', () => {
    configure();
    render(<StartLesson />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('offers an accessible app link instead of submitting the chat form', () => {
    configure('https://lessoncaddie.ssmlabs.com/app?view=start-lesson');
    render(<StartLesson />);
    const link = screen.getByRole('link', { name: 'Start Lesson' });
    expect(link).toHaveAttribute('href', 'https://lessoncaddie.ssmlabs.com/app?view=start-lesson');
    expect(link).not.toHaveAttribute('target');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each(['javascript:alert(1)', 'data:text/html,hello', '/app', 'invalid'])(
    'does not render an unsafe or invalid app URL: %s',
    (url) => {
      configure(url);
      render(<StartLesson />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    },
  );
});
