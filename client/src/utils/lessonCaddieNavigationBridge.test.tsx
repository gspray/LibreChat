import {
  handleShellMessage,
  installLessonCaddieNavigationBridge,
  onToolResult,
  parseNavigationResult,
  resetLessonCaddieNavigationBridgeForTests,
} from './lessonCaddieNavigationBridge';

const RESULT = {
  type: 'lessoncaddie.navigation',
  version: 1,
  destination: 'start-lesson',
  params: {},
  requestId: 'req-live-1',
  deepLink: 'https://lessoncaddie.ssmlabs.com/app?view=start-lesson',
};

describe('lessonCaddieNavigationBridge', () => {
  const originalParent = window.parent;

  beforeEach(() => {
    resetLessonCaddieNavigationBridgeForTests();
    (window as any).__LESSONCADDIE_NAV__ = {
      allowedOrigins: ['https://lessoncaddie.ssmlabs.com', 'http://127.0.0.1:3021'],
      homeUrl: 'https://lessoncaddie.ssmlabs.com/app',
    };
    Object.defineProperty(window, 'parent', { configurable: true, value: originalParent });
  });

  it('parses a structured MCP navigation result and rejects other JSON', () => {
    expect(parseNavigationResult(JSON.stringify(RESULT))?.destination).toBe('start-lesson');
    expect(parseNavigationResult('{"ok":true}')).toBeNull();
    expect(parseNavigationResult('not-json')).toBeNull();
  });

  it('does not navigate historical or incomplete tool results', () => {
    const posted: unknown[] = [];
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage: (data: unknown) => posted.push(data) },
    });
    handleShellMessage({
      origin: 'https://lessoncaddie.ssmlabs.com',
      data: {
        source: 'lessoncaddie-shell',
        type: 'surface',
        surface: 'assistant',
        capabilities: { appNavigationBridge: true },
      },
    } as MessageEvent);
    expect(
      onToolResult({
        functionName: 'open_app_screen_mcp_lessoncaddie-instructor',
        output: JSON.stringify(RESULT),
        isLast: true,
        sawSubmitting: false,
      }),
    ).toBe(false);
    expect(
      onToolResult({
        functionName: 'open_app_screen_mcp_lessoncaddie-instructor',
        output: JSON.stringify(RESULT),
        isLast: true,
        sawSubmitting: true,
        hasError: true,
      }),
    ).toBe(false);
    expect(posted).toEqual([]);
  });

  it('does not postMessage for unknown clients without a bridge capability', () => {
    const posted: unknown[] = [];
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage: (data: unknown) => posted.push(data) },
    });
    handleShellMessage({
      origin: 'https://lessoncaddie.ssmlabs.com',
      data: { source: 'lessoncaddie-shell', type: 'surface', surface: 'assistant' },
    } as MessageEvent);
    expect(
      onToolResult({
        functionName: 'open_app_screen_mcp_lessoncaddie-instructor',
        output: JSON.stringify(RESULT),
        sawSubmitting: true,
      }),
    ).toBe(false);
    expect(posted).toEqual([]);
  });

  it('posts from a live turn even when the tool part is not last', () => {
    const posted: unknown[] = [];
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage: (data: unknown, origin: string) => posted.push({ data, origin }) },
    });
    handleShellMessage({
      origin: 'https://lessoncaddie.ssmlabs.com',
      data: {
        source: 'lessoncaddie-shell',
        type: 'surface',
        surface: 'assistant',
        capabilities: { appNavigationBridge: true },
      },
    } as MessageEvent);
    expect(
      onToolResult({
        functionName: 'open_app_screen_mcp_lessoncaddie-instructor',
        output: JSON.stringify(RESULT),
        isLast: false,
        sawSubmitting: true,
      }),
    ).toBe(true);
    expect(posted).toHaveLength(1);
  });

  it('posts once to the LessonCaddie shell and ignores duplicates', () => {
    const posted: unknown[] = [];
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage: (data: unknown, origin: string) => posted.push({ data, origin }) },
    });
    installLessonCaddieNavigationBridge();
    handleShellMessage({
      origin: 'https://lessoncaddie.ssmlabs.com',
      data: {
        source: 'lessoncaddie-shell',
        type: 'surface',
        surface: 'assistant',
        capabilities: { appNavigationBridge: true },
      },
    } as MessageEvent);
    const notice = {
      functionName: 'open_app_screen_mcp_lessoncaddie-instructor',
      output: JSON.stringify(RESULT),
      isLast: true,
      sawSubmitting: true,
    };
    expect(onToolResult(notice)).toBe(true);
    expect(onToolResult(notice)).toBe(false);
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      origin: 'https://lessoncaddie.ssmlabs.com',
      data: {
        source: 'lessoncaddie-assistant',
        type: 'navigate',
        destination: 'start-lesson',
        requestId: 'req-live-1',
      },
    });
  });
});
