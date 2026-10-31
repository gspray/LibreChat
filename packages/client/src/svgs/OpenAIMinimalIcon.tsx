import { JSX } from 'react/jsx-runtime';
import CaddieIcon from './CaddieIcon';

export default function OpenAIMinimalIcon({
  className = 'h-4 w-4',
}: {
  className?: string | undefined;
}): JSX.Element {
  return <CaddieIcon className={className} />;
}
