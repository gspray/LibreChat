/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Live Talk host adapter. Uses Speak Core's public API only.
 */
(function attachLessonCaddieLiveTalk(windowObject) {
  'use strict';

  const SpeakCore = windowObject.SpeakCore;
  const root = windowObject.document;
  const nativeFetch = windowObject.fetch.bind(windowObject);
  let config = { enabled: false };
  let active = null;
  let accessToken = '';
  let composerButton = null;

  function clean(value) {
    return String(value || '').trim();
  }

  function rememberAuthHeader(value) {
    const text = String(value || '').trim();
    const match = text.match(/^Bearer\s+(\S+)/i);
    if (match) accessToken = match[1];
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

  function setStatus(bar, state, text) {
    bar.dataset.state = state;
    const status = bar.querySelector('.lc-live-talk-status');
    if (status) status.textContent = text;
    const talking = isTalkingState(state);
    const control = ensureComposerControl();
    if (!control) return;
    control.dataset.kind = talking ? 'stop' : 'start';
    control.disabled = !config.enabled;
    control.setAttribute('aria-pressed', talking ? 'true' : 'false');
    control.setAttribute('aria-label', talking ? 'Stop Live Talk' : 'Live Talk');
    control.title = talking ? 'Stop Live Talk' : 'Live Talk';
  }

  async function api(path, options) {
    const token = accessToken || (await waitForAccessToken());
    if (!token) {
      throw new Error('Live Talk is waiting for Chat sign-in.');
    }
    const response = await nativeFetch(path, {
      credentials: 'include',
      ...options,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options?.body ? { 'content-type': 'application/json' } : {}),
        ...(options?.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || 'Live Talk request failed.');
      error.code = payload.error;
      throw error;
    }
    return payload;
  }

  async function persist(sessionId, body) {
    try {
      await api(liveTalkPath(`/live-talk/session/${sessionId}/transcript`), {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      setStatus(ensureBar(), 'error', error.message || 'Could not save the voice turn.');
    }
  }

  function findMicButton() {
    const surface = root.querySelector('[data-testid="composer-surface"]');
    const form = surface?.closest('form') || root.querySelector('[data-chat-pane] form');
    if (!form) return null;
    const buttons = Array.from(form.querySelectorAll('button'));
    return (
      buttons.find((button) => /micr/i.test(button.getAttribute('aria-label') || '')) ||
      buttons.find((button) => button.querySelector('svg.lucide-mic'))
    );
  }

  function ensureComposerControl() {
    let button = composerButton;
    if (!button) {
      button = root.createElement('button');
      button.type = 'button';
      button.className = 'lc-live-talk-composer-btn';
      button.dataset.kind = 'start';
      button.setAttribute('aria-label', 'Live Talk');
      button.title = 'Live Talk';
      button.innerHTML =
        '<svg data-icon="start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>' +
        '<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>' +
        '</svg>' +
        '<svg data-icon="stop" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<rect x="6" y="6" width="12" height="12" rx="1"></rect>' +
        '</svg>';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const bar = ensureBar();
        if (isTalkingState(bar.dataset.state)) {
          void stopCall(bar, 'stop');
        } else {
          void startCall(bar);
        }
      });
      composerButton = button;
    }
    const mic = findMicButton();
    if (mic && mic.parentNode && button.nextElementSibling !== mic) {
      mic.parentNode.insertBefore(button, mic);
    }
    button.hidden = !config.enabled;
    return button;
  }

  function ensureBar() {
    let bar = root.querySelector('.lc-live-talk');
    if (!bar) {
      bar = root.createElement('div');
      bar.className = 'lc-live-talk';
      bar.innerHTML = '<span class="lc-live-talk-status">Live Talk is available.</span>';
    }
    const host = root.body;
    if (host && bar.parentNode !== host) {
      host.insertBefore(bar, host.firstChild);
    }
    return bar;
  }

  async function stopCall(bar, reason) {
    const current = active;
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
    if (current?.sessionId) {
      try {
        await api(liveTalkPath(`/live-talk/session/${current.sessionId}/stop`), {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      } catch (_) {
        /* session may already be gone */
      }
    }
    if (reason !== 'restart' && reason !== 'failed') {
      setStatus(bar, 'idle', 'Live Talk stopped. You can keep typing in this thread.');
    }
  }

  async function startCall(bar) {
    if (
      !SpeakCore?.createSpeakRealtimeSession ||
      !SpeakCore.createOpenAIRealtimeFunctionCallBridge
    ) {
      setStatus(bar, 'error', 'Voice engine is not loaded. Reload Chat and try again.');
      return;
    }
    const conversationId = conversationIdFromLocation() || 'new';
    await stopCall(bar, 'restart');
    setStatus(bar, 'connecting', 'Connecting…');
    let sessionId = '';
    const session = SpeakCore.createSpeakRealtimeSession({
      provider: 'openai-realtime',
      conversationBehavior: { interruption: 'enabled' },
      bootstrapCall: async ({ sdp }) => {
        const created = await api(liveTalkPath('/live-talk/session'), {
          method: 'POST',
          body: JSON.stringify({ conversationId, sdp }),
        });
        sessionId = created.sessionId;
        return created.sdp;
      },
    });
    const bridge = SpeakCore.createOpenAIRealtimeFunctionCallBridge({
      conversationBehavior: { interruption: 'enabled' },
      invokeTool: async (call) => {
        setStatus(bar, 'tool', `Looking up ${call.name}…`);
        const payload = await api(liveTalkPath(`/live-talk/session/${sessionId}/tool`), {
          method: 'POST',
          body: JSON.stringify({
            name: call.name,
            arguments: call.arguments,
            callId: call.callId,
          }),
        });
        return payload.result;
      },
    });
    bridge.attach(session);
    session.onEvent((event) => {
      const providerEvent = event.detail?.providerEvent || event.detail?.event?.type || '';
      const transcript = clean(
        event.detail?.event?.transcript || event.detail?.transcript || event.detail?.text,
      );
      if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED) {
        setStatus(bar, 'listening', 'Listening…');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_AUDIO_START) {
        setStatus(bar, 'responding', 'Responding…');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.USER_SPEECH_START) {
        setStatus(bar, 'listening', 'Listening…');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_FAILED) {
        setStatus(bar, 'error', event.detail?.message || 'Could not connect Live Talk.');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.INPUT_TRANSCRIPT && transcript && sessionId) {
        void persist(sessionId, {
          role: 'user',
          text: transcript,
          providerItemId: clean(event.detail?.event?.item_id),
        });
      }
      if (
        (providerEvent === 'response.audio_transcript.done' ||
          providerEvent === 'response.output_audio_transcript.done') &&
        transcript &&
        sessionId
      ) {
        void persist(sessionId, {
          role: 'assistant',
          text: transcript,
          providerItemId: clean(event.detail?.event?.item_id || event.detail?.event?.response_id),
          interrupted: false,
        });
      }
      if (
        event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_INTERRUPTED &&
        sessionId &&
        transcript
      ) {
        void persist(sessionId, {
          role: 'assistant',
          text: transcript,
          interrupted: true,
          providerItemId: `interrupted:${clean(event.detail?.event?.response_id)}`,
        });
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
    } catch (error) {
      setStatus(bar, 'error', error.message || 'Microphone or voice session failed.');
      await stopCall(bar, 'failed');
    }
  }

  function syncBar() {
    const bar = ensureBar();
    const visible = Boolean(config.enabled);
    bar.dataset.visible = visible ? 'true' : 'false';
    ensureComposerControl();
    if (!visible) {
      if (active) void stopCall(bar, 'thread_change');
      return;
    }
    if (!active) {
      setStatus(bar, 'idle', 'Live Talk is available.');
      return;
    }
    const currentText = bar.querySelector('.lc-live-talk-status')?.textContent || 'Listening…';
    setStatus(bar, bar.dataset.state || 'listening', currentText);
  }

  function watchThreadChanges() {
    windowObject.addEventListener('beforeunload', () => {
      if (active) void stopCall(ensureBar(), 'unload');
    });
  }

  async function start() {
    if (isSsoPath()) {
      return;
    }
    patchAuthCapture();
    try {
      config = await api(liveTalkPath('/live-talk/config'));
    } catch (_) {
      config = { enabled: false };
    }
    syncBar();
    watchThreadChanges();
    if (root.body) {
      let placeTimer = 0;
      new windowObject.MutationObserver(() => {
        if (!config.enabled) return;
        const barMissing = !root.body.contains(root.querySelector('.lc-live-talk'));
        const control = composerButton;
        const mic = findMicButton();
        const controlMisplaced = Boolean(mic) && (!control || control.nextElementSibling !== mic);
        if (!barMissing && !controlMisplaced) return;
        if (placeTimer) return;
        placeTimer = windowObject.setTimeout(() => {
          placeTimer = 0;
          syncBar();
        }, 50);
      }).observe(root.body, { childList: true, subtree: true });
    }
  }

  if (root.readyState === 'loading') {
    root.addEventListener('DOMContentLoaded', () => void start(), { once: true });
  } else {
    void start();
  }
})(window);
