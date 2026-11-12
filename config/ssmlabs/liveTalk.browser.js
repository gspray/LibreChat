/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Live Talk host adapter. Uses Speak Core's public API only.
 */
(function attachLessonCaddieLiveTalk(windowObject) {
  'use strict';

  const SpeakCore = windowObject.SpeakCore;
  const root = windowObject.document;
  const nativeFetch = windowObject.fetch.bind(windowObject);
  const LOG_PREFIX = '[ssmlabs-live-talk]';
  const ASSISTANT_MESSAGE_SOURCE = 'lessoncaddie-assistant';
  const SHELL_MESSAGE_SOURCE = 'lessoncaddie-shell';
  const DEFAULT_PARENT_ORIGINS = [
    'https://lessoncaddie.ssmlabs.com',
    'http://127.0.0.1:3021',
    'http://localhost:3021',
  ];
  let config = { enabled: false };
  let active = null;
  let accessToken = '';
  let ui = { state: 'idle', text: '' };
  let pendingShellAction = '';

  function clean(value) {
    return String(value || '').trim();
  }

  function liveTalkLog(stage, data) {
    try {
      windowObject.console.info(LOG_PREFIX, stage, data || {});
    } catch (_) {
      /* ignore console failures */
    }
  }

  function liveTalkWarn(stage, data) {
    try {
      windowObject.console.warn(LOG_PREFIX, stage, data || {});
    } catch (_) {
      /* ignore console failures */
    }
  }

  function liveTalkError(stage, data) {
    try {
      windowObject.console.error(LOG_PREFIX, stage, data || {});
    } catch (_) {
      /* ignore console failures */
    }
  }

  function summarizeError(error, extra) {
    const debug = error?.debug && typeof error.debug === 'object' ? error.debug : null;
    return {
      name: error?.name || '',
      message: error?.message || String(error || ''),
      code: error?.code || '',
      status: error?.status || '',
      openaiStatus: debug?.openaiStatus || '',
      openaiBody: debug?.openaiBody || '',
      debug,
      ...(extra || {}),
    };
  }

  function summarizeEvent(event) {
    const detail = event?.detail && typeof event.detail === 'object' ? event.detail : {};
    return {
      type: event?.type || '',
      name: detail.name || '',
      message: detail.message || '',
      providerEvent: detail.providerEvent || detail.event?.type || '',
      state: detail.state || '',
      connectionState: detail.connectionState || '',
      dataChannelState: detail.dataChannelState || '',
      iceConnectionState: detail.iceConnectionState || '',
    };
  }

  function rememberAuthHeader(value) {
    const text = String(value || '').trim();
    const match = text.match(/^Bearer\s+(\S+)/i);
    if (match && !accessToken) {
      accessToken = match[1];
      liveTalkLog('auth.captured', { chars: accessToken.length });
    } else if (match) {
      accessToken = match[1];
    }
  }

  function patchAuthCapture() {
    const proto = windowObject.XMLHttpRequest?.prototype;
    if (proto && !proto.__lcLiveTalkAuth) {
      const original = proto.setRequestHeader;
      proto.setRequestHeader = function setRequestHeader(name, value) {
        if (String(name).toLowerCase() === 'authorization') rememberAuthHeader(value);
        return original.apply(this, arguments);
      };
      proto.__lcLiveTalkAuth = true;
    }
  }

  function isSsoPath() {
    return String(windowObject.location?.pathname || '').includes('/sso/');
  }

  async function waitForAccessToken() {
    patchAuthCapture();
    for (let attempt = 0; attempt < 40 && !accessToken; attempt += 1) {
      await new Promise((resolve) => windowObject.setTimeout(resolve, 250));
    }
    liveTalkLog('auth.wait', {
      present: Boolean(accessToken),
      chars: accessToken.length,
    });
    return accessToken;
  }

  function chatBasePath() {
    try {
      const href = root.querySelector('base')?.getAttribute('href') || '/';
      const pathname = new URL(href, windowObject.location.origin).pathname;
      return pathname.replace(/\/$/, '');
    } catch (_) {
      return '';
    }
  }

  function liveTalkPath(path) {
    return `${chatBasePath()}${path}`;
  }

  function allowedParentOrigins() {
    const extra = windowObject.__LESSONCADDIE_NAV__?.allowedOrigins;
    const listed = Array.isArray(extra) ? extra.map(clean).filter(Boolean) : [];
    return [...new Set([...DEFAULT_PARENT_ORIGINS, ...listed])];
  }

  function isAllowedParentOrigin(origin) {
    return allowedParentOrigins().includes(clean(origin));
  }

  function postStatus() {
    if (windowObject.parent === windowObject) return;
    try {
      windowObject.parent.postMessage(
        {
          source: ASSISTANT_MESSAGE_SOURCE,
          type: 'live-talk-status',
          version: 1,
          enabled: Boolean(config.enabled),
          state: ui.state,
          text: ui.text,
        },
        '*',
      );
    } catch (_) {
      /* parent may be gone */
    }
  }

  function conversationIdFromLocation() {
    const match = String(windowObject.location?.pathname || '').match(/\/c\/([^/]+)/);
    const id = match ? decodeURIComponent(match[1]) : '';
    if (!id || id === 'new') return '';
    return id;
  }

  function isTalkingState(state) {
    return (
      state === 'connecting' || state === 'listening' || state === 'responding' || state === 'tool'
    );
  }

  function setStatus(_bar, state, text) {
    ui.state = String(state || 'idle');
    ui.text = String(text || '');
    postStatus();
  }

  async function api(path, options) {
    const method = String(options?.method || 'GET').toUpperCase();
    const token = accessToken || (await waitForAccessToken());
    if (!token) {
      const error = new Error('Live Talk is waiting for Chat sign-in.');
      error.code = 'auth_missing';
      liveTalkError('api.auth-missing', { method, path });
      throw error;
    }
    liveTalkLog('api.request', { method, path, tokenChars: token.length });
    let response;
    try {
      response = await nativeFetch(path, {
        credentials: 'include',
        ...options,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options?.body ? { 'content-type': 'application/json' } : {}),
          ...(options?.headers || {}),
        },
      });
    } catch (error) {
      liveTalkError('api.network', summarizeError(error, { method, path }));
      throw error;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || 'Live Talk request failed.');
      error.code = payload.error || `http_${response.status}`;
      error.status = response.status;
      error.debug = payload.debug || payload;
      liveTalkError(
        'api.failed',
        summarizeError(error, { method, path, httpStatus: response.status }),
      );
      throw error;
    }
    liveTalkLog('api.ok', {
      method,
      path,
      status: response.status,
      keys: payload && typeof payload === 'object' ? Object.keys(payload) : [],
    });
    return payload;
  }

  function ensureBar() {
    return { dataset: ui };
  }

  async function stopCall(bar, reason) {
    const current = active;
    liveTalkLog('stop', { reason: String(reason || ''), sessionId: current?.sessionId || '' });
    active = null;
    try {
      current?.session?.cancel?.(reason);
    } catch (_) {
      /* already closed */
    }
    try {
      current?.session?.stop?.(reason);
    } catch (_) {
      /* already closed */
    }
    try {
      current?.bridge?.detach?.();
    } catch (_) {
      /* ignore */
    }
    liveTalkAudioElements().forEach((audio) => {
      try {
        audio.pause?.();
        audio.srcObject = null;
        audio.remove();
      } catch (_) {
        /* ignore */
      }
    });
    if (current?.sessionId) {
      try {
        await api(liveTalkPath(`/live-talk/session/${current.sessionId}/stop`), {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      } catch (error) {
        liveTalkWarn('stop.server', summarizeError(error, { sessionId: current.sessionId }));
      }
    }
    if (reason !== 'restart' && reason !== 'failed') {
      setStatus(bar, 'idle', 'Live Talk stopped.');
    }
  }

  function liveTalkAudioElements() {
    return Array.from(root.querySelectorAll('audio[data-lc-live-talk="true"]'));
  }

  function createLiveTalkAudioElement() {
    const audio = root.createElement('audio');
    audio.autoplay = true;
    audio.playsInline = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('data-lc-live-talk', 'true');
    audio.hidden = true;
    (root.body || root.documentElement).appendChild(audio);
    audio.addEventListener('pause', () => {
      liveTalkWarn('playback.paused', {
        paused: audio.paused,
        ended: audio.ended,
        readyState: audio.readyState,
        hasSrcObject: Boolean(audio.srcObject),
      });
    });
    return audio;
  }

  function diagnosePlayback(reason) {
    const audios = liveTalkAudioElements();
    liveTalkLog('playback.elements', {
      reason: String(reason || ''),
      count: audios.length,
      items: audios.map((audio) => ({
        autoplay: Boolean(audio.autoplay),
        paused: Boolean(audio.paused),
        muted: Boolean(audio.muted),
        readyState: audio.readyState,
        hasSrcObject: Boolean(audio.srcObject),
      })),
    });
    audios.forEach((audio, index) => {
      const play = audio.play?.();
      if (play && typeof play.then === 'function') {
        play.then(
          () => liveTalkLog('playback.play-ok', { reason, index }),
          (error) =>
            liveTalkError('playback.play-blocked', summarizeError(error, { reason, index })),
        );
      }
    });
  }

  function watchPeer(session) {
    [500, 1500, 4000].forEach((ms) => {
      windowObject.setTimeout(() => {
        if (active?.session !== session) return;
        try {
          liveTalkLog(`peer.snapshot.${ms}ms`, session.snapshot?.() || {});
        } catch (error) {
          liveTalkWarn('peer.snapshot-failed', summarizeError(error, { ms }));
        }
      }, ms);
    });
  }

  async function startCall(bar) {
    liveTalkLog('start.clicked', {
      href: String(windowObject.location?.href || ''),
      framed: windowObject.parent !== windowObject,
      speakCore: Boolean(SpeakCore),
      sessionApi: Boolean(SpeakCore?.createSpeakRealtimeSession),
      bridgeApi: Boolean(SpeakCore?.createOpenAIRealtimeFunctionCallBridge),
      mediaDevices: Boolean(windowObject.navigator?.mediaDevices?.getUserMedia),
    });
    if (
      !SpeakCore?.createSpeakRealtimeSession ||
      !SpeakCore.createOpenAIRealtimeFunctionCallBridge
    ) {
      liveTalkError('start.engine-missing', {
        speakCoreKeys: SpeakCore ? Object.keys(SpeakCore) : [],
      });
      setStatus(bar, 'error', 'Voice engine is not loaded. Reload Chat and try again.');
      return;
    }
    const conversationId = conversationIdFromLocation() || 'new';
    liveTalkLog('start.conversation', { conversationId });
    await stopCall(bar, 'restart');
    setStatus(bar, 'connecting', 'Connecting…');
    let sessionId = '';
    const session = SpeakCore.createSpeakRealtimeSession({
      provider: 'openai-realtime',
      holdInput: true,
      conversationBehavior: { interruption: 'disabled' },
      createAudioElement: createLiveTalkAudioElement,
      bootstrapCall: async ({ sdp }) => {
        liveTalkLog('bootstrap.offer', {
          conversationId,
          sdpChars: String(sdp || '').length,
        });
        const created = await api(liveTalkPath('/live-talk/session'), {
          method: 'POST',
          body: JSON.stringify({ conversationId, sdp }),
        });
        sessionId = created.sessionId;
        liveTalkLog('bootstrap.answer', {
          sessionId,
          conversationId: created.conversationId || conversationId,
          sdpChars: String(created.sdp || '').length,
          toolCount: Array.isArray(created.tools) ? created.tools.length : 0,
        });
        return created.sdp;
      },
    });
    const bridge = SpeakCore.createOpenAIRealtimeFunctionCallBridge({
      holdInput: true,
      conversationBehavior: { interruption: 'disabled' },
      invokeTool: async (call) => {
        liveTalkLog('tool.invoke', { name: call.name, callId: call.callId || '', sessionId });
        setStatus(bar, 'tool', `Looking up ${call.name}…`);
        const payload = await api(liveTalkPath(`/live-talk/session/${sessionId}/tool`), {
          method: 'POST',
          body: JSON.stringify({
            name: call.name,
            arguments: call.arguments,
            callId: call.callId,
          }),
        });
        const result = payload.result;
        if (call.name === 'open_app_screen') {
          const overlay = windowObject.LessonCaddieNavigationOverlay;
          const opened = overlay?.onPayload?.(result);
          liveTalkLog('tool.navigate', {
            opened: Boolean(opened),
            destination: result?.destination || result?.structuredContent?.destination || '',
          });
        }
        return result;
      },
    });
    bridge.attach(session);
    session.onEvent((event) => {
      const providerEvent = event.detail?.providerEvent || event.detail?.event?.type || '';
      const transcript = clean(
        event.detail?.event?.transcript || event.detail?.transcript || event.detail?.text,
      );
      const interesting =
        event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED ||
        event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED ||
        event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CLOSED ||
        event.type === SpeakCore.SpeakRealtimeEvent.CONNECTION_STATE ||
        event.type === SpeakCore.SpeakRealtimeEvent.TOOL_ERROR;
      if (interesting || event.detail?.message) {
        (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED ? liveTalkError : liveTalkLog)(
          'realtime.event',
          summarizeEvent(event),
        );
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED) {
        setStatus(bar, 'listening', 'Listening…');
        diagnosePlayback('connected');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_AUDIO_START) {
        const alreadyResponding = bar.dataset.state === 'responding';
        if (!alreadyResponding) {
          setStatus(bar, 'responding', 'Responding…');
          diagnosePlayback(providerEvent || 'assistant-audio');
        }
      }
      if (
        event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE ||
        event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_INTERRUPTED ||
        providerEvent === 'output_audio_buffer.stopped' ||
        providerEvent === 'output_audio_buffer.cleared' ||
        providerEvent === 'response.done'
      ) {
        try {
          session.setMuted?.(false);
        } catch (_) {
          /* keep listening even if mute release throws */
        }
        if (isTalkingState(bar.dataset.state) && bar.dataset.state !== 'tool') {
          setStatus(bar, 'listening', 'Listening…');
        }
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.USER_SPEECH_START) {
        setStatus(bar, 'listening', 'Listening…');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED) {
        const failed = summarizeError(
          { message: event.detail?.message, name: event.detail?.name, code: event.detail?.code },
          summarizeEvent(event),
        );
        liveTalkError('session.failed', failed);
        setStatus(
          bar,
          'error',
          event.detail?.message || event.detail?.name || 'Could not connect Live Talk.',
        );
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.INPUT_TRANSCRIPT && transcript) {
        liveTalkLog('transcript.heard', { chars: transcript.length });
      }
    });
    active = {
      session,
      bridge,
      get sessionId() {
        return sessionId;
      },
    };
    try {
      await session.start();
      liveTalkLog('session.started', session.snapshot?.() || { sessionId });
      watchPeer(session);
    } catch (error) {
      liveTalkError(
        'session.start-threw',
        summarizeError(error, {
          conversationId,
          sessionId,
          snapshot: session.snapshot?.() || null,
        }),
      );
      setStatus(
        bar,
        'error',
        [error.name, error.message].filter(Boolean).join(': ') ||
          'Microphone or voice session failed.',
      );
      await stopCall(bar, 'failed');
    }
  }

  function syncBar() {
    const bar = ensureBar();
    if (!config.enabled) {
      if (active) void stopCall(bar, 'disabled');
      setStatus(bar, 'idle', '');
      return;
    }
    if (!active) {
      setStatus(bar, 'idle', 'Live Talk is available.');
      return;
    }
    setStatus(bar, ui.state || 'listening', ui.text || 'Listening…');
  }

  async function applyShellAction(action) {
    const bar = ensureBar();
    if (action === 'stop' || (action === 'toggle' && isTalkingState(ui.state))) {
      pendingShellAction = '';
      if (active) await stopCall(bar, 'stop');
      return;
    }
    if (!config.enabled) {
      pendingShellAction = action;
      return;
    }
    pendingShellAction = '';
    if (!isTalkingState(ui.state)) {
      await startCall(bar);
    }
  }

  function onShellMessage(event) {
    if (event.source !== windowObject.parent) return;
    if (!isAllowedParentOrigin(event.origin)) return;
    const data = event.data;
    if (!data || data.source !== SHELL_MESSAGE_SOURCE || data.type !== 'live-talk') return;
    const action = clean(data.action);
    if (!['start', 'stop', 'toggle'].includes(action)) return;
    liveTalkLog('shell.command', { action });
    void applyShellAction(action);
  }

  function watchThreadChanges() {
    windowObject.addEventListener('message', onShellMessage);
    windowObject.addEventListener('beforeunload', () => {
      if (active) void stopCall(ensureBar(), 'unload');
    });
  }

  async function start() {
    liveTalkLog('overlay.boot', {
      href: String(windowObject.location?.href || ''),
      pathname: String(windowObject.location?.pathname || ''),
      framed: windowObject.parent !== windowObject,
      ssoPath: isSsoPath(),
      basePath: chatBasePath(),
      speakCore: Boolean(SpeakCore),
      speakCoreKeys: SpeakCore ? Object.keys(SpeakCore) : [],
    });
    if (isSsoPath()) {
      liveTalkWarn('overlay.skip-sso', {});
      return;
    }
    watchThreadChanges();
    patchAuthCapture();
    try {
      config = await api(liveTalkPath('/live-talk/config'));
      liveTalkLog('overlay.config', {
        enabled: Boolean(config.enabled),
        agentId: config.agentId || '',
        mcpServer: config.mcpServer || '',
        speakCoreRevision: config.speakCoreRevision || '',
      });
    } catch (error) {
      liveTalkError(
        'overlay.config-failed',
        summarizeError(error, { path: liveTalkPath('/live-talk/config') }),
      );
      config = { enabled: false };
    }
    syncBar();
    liveTalkLog('overlay.chrome', { host: 'shell-fab' });
    if (pendingShellAction) {
      void applyShellAction(pendingShellAction);
    }
  }

  void start().catch((error) => {
    liveTalkError('overlay.start-threw', summarizeError(error));
  });
})(window);
