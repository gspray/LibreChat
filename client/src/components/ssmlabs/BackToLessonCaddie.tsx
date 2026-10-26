import { useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, TooltipAnchor } from '@librechat/client';
import type { TStartupConfig } from 'librechat-data-provider';
import useDrawerViewport from '~/hooks/Nav/useDrawerViewport';

type LessonCaddieStartup = TStartupConfig & {
  lessonCaddie?: {
    homeUrl?: string;
    allowedOrigins?: string[];
    storageKey?: string;
  };
};

const QUERY_KEYS = ['returnUrl', 'lessoncaddieReturn'] as const;
const DEFAULT_STORAGE_KEY = 'ssmlabs.lessoncaddie.returnUrl';

function parseAbsoluteUrl(value: string) {
  const candidate = value.trim();
  if (!candidate || candidate.length > 2048 || !/^https?:\/\//i.test(candidate)) {
    return null;
  }
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function isLocalHttpHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function sanitizeReturnUrl(candidate: string | undefined, allowedOrigins: string[]) {
  const url = parseAbsoluteUrl(candidate || '');
  if (!url || url.username || url.password) {
    return '';
  }
  const allowed =
    url.protocol === 'https:'
      ? allowedOrigins.includes(url.origin)
      : url.protocol === 'http:' &&
        isLocalHttpHost(url.hostname) &&
        allowedOrigins.includes(url.origin);
  return allowed ? url.toString() : '';
}

function readQueryReturnValue() {
  const params = new URLSearchParams(window.location.search);
  for (const key of QUERY_KEYS) {
    const value = params.get(key)?.trim();
    if (value) {
      return value;
    }
  }
  return '';
}

export default function BackToLessonCaddie({
  startupConfig,
}: {
  startupConfig?: LessonCaddieStartup;
}) {
  const isSmallScreen = useDrawerViewport();
  const lessonCaddie = startupConfig?.lessonCaddie;
  const allowedOrigins = Array.isArray(lessonCaddie?.allowedOrigins)
    ? lessonCaddie.allowedOrigins.filter((origin) => typeof origin === 'string' && origin.trim())
    : [];
  const storageKey = lessonCaddie?.storageKey?.trim() || DEFAULT_STORAGE_KEY;
  const homeUrl = sanitizeReturnUrl(lessonCaddie?.homeUrl, allowedOrigins);

  const href = useMemo(() => {
    if (!homeUrl) {
      return '';
    }
    const fromQuery = sanitizeReturnUrl(readQueryReturnValue(), allowedOrigins);
    if (fromQuery) {
      try {
        sessionStorage.setItem(storageKey, fromQuery);
      } catch {
        /* navigation still uses the query URL */
      }
      return fromQuery;
    }
    try {
      const stored = sanitizeReturnUrl(sessionStorage.getItem(storageKey) || '', allowedOrigins);
      if (stored) {
        return stored;
      }
    } catch {
      /* fall through to home */
    }
    return homeUrl;
  }, [allowedOrigins, homeUrl, storageKey]);

  useEffect(() => {
    const fromQuery = sanitizeReturnUrl(readQueryReturnValue(), allowedOrigins);
    if (!fromQuery) {
      return;
    }
    try {
      sessionStorage.setItem(storageKey, fromQuery);
    } catch {
      /* ignore */
    }
  }, [allowedOrigins, storageKey]);

  if (!href) {
    return null;
  }

  const label = 'Back to LessonCaddie';
  return (
    <TooltipAnchor
      description={label}
      render={
        <Button asChild size={isSmallScreen ? 'icon' : 'sm'} variant="header-action">
          <a
            href={href}
            data-testid="back-to-lessoncaddie"
            aria-label={label}
            className="inline-flex items-center gap-1 no-underline"
          >
            {isSmallScreen ? (
              <ArrowLeft className="icon-md" aria-hidden="true" />
            ) : (
              <span>← Back to LessonCaddie</span>
            )}
          </a>
        </Button>
      }
    />
  );
}
