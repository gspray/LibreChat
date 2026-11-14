import type { JSX } from 'react/jsx-runtime';
import type { SVGProps } from 'react';

export default function CaddieIcon({
  size,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }): JSX.Element {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" {...props}>
      <image href="/assets/caddie.png" width="64" height="64" />
    </svg>
  );
}
