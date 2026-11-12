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
  let pendingLiveVoice = null;
  let pendingGreeting = '';
  let greetingLine = 'Good morning.';
  let liveTalkSpec = '';
  let greetingPending = false;
  let greetingFallbackUsed = false;
  let readyTimer = 0;
  let liveVoiceSettings = {
    waitForYou: 'patient',
    allowInterrupt: false,
    ignoreBackgroundNoise: true,
    muteMicWhileSheTalks: true,
    voice: 'marin',
  };

  function normalizeLiveVoiceSettings(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const waitForYou = ['patient', 'balanced', 'fast'].includes(
      String(src.waitForYou || '')
        .trim()
        .toLowerCase(),
    )
      ? String(src.waitForYou).trim().toLowerCase()
      : 'patient';
    const voiceRaw = String(src.voice || '')
      .trim()
      .toLowerCase();
    const voices = ['marin', 'cedar', 'shimmer', 'verse', 'alloy'];
    return {
      waitForYou,
      allowInterrupt: src.allowInterrupt === true,
      ignoreBackgroundNoise: src.ignoreBackgroundNoise !== false,
      muteMicWhileSheTalks: src.muteMicWhileSheTalks !== false,
      voice: voices.includes(voiceRaw) ? voiceRaw : 'marin',
    };
  }

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

  const WRITE_TOOLS = {
    add_student: true,
    update_student: true,
    delete_student: true,
    delete_students_by_filter: true,
    create_mock_student: true,
    create_lesson: true,
    create_mock_lesson: true,
    create_mock_lessons: true,
    move_lesson: true,
    update_lesson_details: true,
    delete_lesson: true,
    delete_lessons_by_filter: true,
    generate_lesson_summary: true,
    update_lesson_summary_draft: true,
    share_lesson_summary: true,
    attach_library_media: true,
    create_notice: true,
    delete_notice: true,
    create_playbook_system: true,
    update_playbook_system: true,
    delete_playbook_system: true,
    create_playbook_practice: true,
    update_playbook_practice: true,
    delete_playbook_practice: true,
    update_lesson_charges: true,
    set_assistant_conversation_starters: true,
  };

  function recordIdsFromToolResult(result) {
    let src = {};
    if (result?.structuredContent && typeof result.structuredContent === 'object') {
      src = result.structuredContent;
    } else if (result && typeof result === 'object') {
      src = result;
    }
    const lessonIds = Array.isArray(src.lessonIds) ? src.lessonIds.map(clean).filter(Boolean) : [];
    return {
      contactId: clean(src.contactId || src.relationshipRecordId) || undefined,
      lessonId: clean(src.lessonId) || lessonIds[0] || undefined,
      lessonIds: lessonIds.length ? lessonIds : undefined,
      noticeId: clean(src.noticeId) || undefined,
      systemId: clean(src.systemId) || undefined,
      practiceId: clean(src.practiceId) || undefined,
    };
  }

  function postAppDataChanged(toolName, result) {
    const name = clean(toolName);
    if (!WRITE_TOOLS[name]) return;
    if (windowObject.parent === windowObject) return;
    const ids = recordIdsFromToolResult(result);
    try {
      windowObject.parent.postMessage(
        {
          source: ASSISTANT_MESSAGE_SOURCE,
          type: 'data-changed',
          version: 1,
          toolName: name,
          ...ids,
        },
        '*',
      );
    } catch (_) {
      /* parent may be gone */
    }
    liveTalkLog('app.data-changed', { toolName: name, keys: Object.keys(ids) });
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

  function liveTalkSpecFromLocation() {
    try {
      return new URL(windowObject.location.href).searchParams.get('spec') || '';
    } catch (_) {
      return '';
    }
  }

  function rememberLiveTalkSpec(value) {
    const spec = clean(value);
    if (spec === 'student-caddie' || spec === 'instructor-assistant') {
      liveTalkSpec = spec;
    }
    return liveTalkSpec;
  }

  function resolveLiveTalkSpec() {
    rememberLiveTalkSpec(liveTalkSpecFromLocation());
    if (liveTalkSpec) return liveTalkSpec;
    try {
      const title = String(windowObject.document?.title || '');
      const heading = String(windowObject.document?.querySelector?.('h1')?.textContent || '');
      if (/student caddie/i.test(`${title} ${heading}`)) return 'student-caddie';
    } catch (_) {
      /* title may be unavailable */
    }
    return '';
  }

  function isTalkingState(state) {
    return (
      state === 'connecting' ||
      state === 'greeting' ||
      state === 'listening' ||
      state === 'responding' ||
      state === 'tool'
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => windowObject.setTimeout(resolve, ms));
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
    greetingPending = false;
    windowObject.clearTimeout(readyTimer);
    readyTimer = 0;
    if (reason !== 'restart' && reason !== 'failed') {
      setStatus(bar, 'idle', 'Live Talk stopped.');
    }
  }

  function finishGreeting(reason) {
    if (!greetingPending) return;
    greetingPending = false;
    greetingFallbackUsed = false;
    windowObject.clearTimeout(readyTimer);
    readyTimer = 0;
    try {
      active?.session?.setMuted?.(false);
    } catch (_) {
      /* user must be able to speak after the greeting */
    }
    if (isTalkingState(ui.state)) {
      setStatus(ensureBar(), 'listening', 'Ready — go ahead');
    }
    liveTalkLog('greeting.done', { reason: String(reason || '') });
  }

  async function sendWhenChannelOpen(session, event) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        session.sendEvent(event);
        return true;
      } catch (error) {
        if (error?.code === 'SPEAK_REALTIME_CLOSED') throw error;
        if (error?.code !== 'SPEAK_REALTIME_CHANNEL_CLOSED') throw error;
        await sleep(100);
      }
    }
    return false;
  }

  async function speakGreeting(session) {
    greetingPending = true;
    greetingFallbackUsed = false;
    setStatus(ensureBar(), 'greeting', 'Starting…');
    const line = greetingLine || 'Good morning.';
    const greetingResponse = {
      type: 'response.create',
      response: {
        tool_choice: 'none',
        instructions: `Speak only this greeting, then wait silently. Do not call tools. Do not ask a question. Say exactly: ${line}`,
      },
    };
    try {
      const started = await sendWhenChannelOpen(session, greetingResponse);
      if (!started) {
        liveTalkWarn('greeting.send-failed', { line, snapshot: session.snapshot?.() || {} });
        finishGreeting('send-failed');
        return;
      }
      liveTalkLog('greeting.sent', { line });
    } catch (error) {
      liveTalkWarn('greeting.send-failed', summarizeError(error));
      finishGreeting('send-failed');
      return;
    }
    windowObject.clearTimeout(readyTimer);
    readyTimer = windowObject.setTimeout(() => finishGreeting('timeout'), 8000);
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
    const spec = resolveLiveTalkSpec();
    liveTalkLog('start.conversation', { conversationId, spec });
    await stopCall(bar, 'restart');
    setStatus(bar, 'connecting', 'Connecting…');
    let sessionId = '';
    const voice = normalizeLiveVoiceSettings(liveVoiceSettings);
    const session = SpeakCore.createSpeakRealtimeSession({
      provider: 'openai-realtime',
      holdInput: voice.muteMicWhileSheTalks,
      conversationBehavior: { interruption: voice.allowInterrupt ? 'enabled' : 'disabled' },
      createAudioElement: createLiveTalkAudioElement,
      bootstrapCall: async ({ sdp }) => {
        liveTalkLog('bootstrap.offer', {
          conversationId,
          sdpChars: String(sdp || '').length,
          waitForYou: voice.waitForYou,
          allowInterrupt: voice.allowInterrupt,
        });
        const created = await api(liveTalkPath('/live-talk/session'), {
          method: 'POST',
          body: JSON.stringify({ conversationId, sdp, liveVoice: voice, spec }),
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
      holdInput: voice.muteMicWhileSheTalks,
      conversationBehavior: { interruption: voice.allowInterrupt ? 'enabled' : 'disabled' },
      invokeTool: async (call) => {
        liveTalkLog('tool.invoke', { name: call.name, callId: call.callId || '', sessionId });
        if (greetingPending || ui.state === 'connecting' || ui.state === 'greeting') {
          liveTalkLog('tool.ignored-while-starting', { name: call.name });
          return {
            ok: false,
            error: 'Live Talk is still starting. Do not call tools until the user speaks.',
          };
        }
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
        postAppDataChanged(call.name, result);
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
      if (
        event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECT_START ||
        event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED
      ) {
        try {
          session.setMuted?.(true);
        } catch (_) {
          /* mic may not exist yet */
        }
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.SESSION_CONNECTED) {
        setStatus(bar, 'connecting', 'Connecting…');
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_AUDIO_START) {
        try {
          session.setMuted?.(true);
        } catch (_) {
          /* holdInput still covers echo */
        }
        if (greetingPending) {
          setStatus(bar, 'greeting', 'Starting…');
          diagnosePlayback(providerEvent || 'greeting-audio');
        } else {
          const alreadyResponding = bar.dataset.state === 'responding';
          if (!alreadyResponding) {
            setStatus(bar, 'responding', 'Responding…');
            diagnosePlayback(providerEvent || 'assistant-audio');
          }
        }
      }
      if (
        event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE ||
        providerEvent === 'response.done'
      ) {
        if (greetingPending) {
          finishGreeting(providerEvent || event.type);
        } else {
          try {
            session.setMuted?.(false);
          } catch (_) {
            /* keep listening even if mute release throws */
          }
          if (isTalkingState(bar.dataset.state) && bar.dataset.state !== 'tool') {
            setStatus(bar, 'listening', 'Listening…');
          }
        }
      }
      if (
        !greetingPending &&
        (event.type === SpeakCore.SpeakRealtimeEvent.ASSISTANT_INTERRUPTED ||
          providerEvent === 'output_audio_buffer.stopped' ||
          providerEvent === 'output_audio_buffer.cleared')
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
      if (providerEvent === 'error' && greetingPending && !greetingFallbackUsed) {
        greetingFallbackUsed = true;
        liveTalkWarn('greeting.provider-error', summarizeEvent(event));
        try {
          session.sendEvent({ type: 'response.create' });
        } catch (error) {
          liveTalkWarn('greeting.fallback-failed', summarizeError(error));
        }
      }
      if (event.type === SpeakCore.SpeakRealtimeEvent.USER_SPEECH_START) {
        if (greetingPending) return;
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
    greetingPending = true;
    try {
      await session.start();
      try {
        session.setMuted?.(true);
      } catch (_) {
        /* mute until greeting finishes */
      }
      liveTalkLog('session.started', session.snapshot?.() || { sessionId });
      watchPeer(session);
      if (active?.session === session) {
        await speakGreeting(session);
      }
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

  async function applyShellAction(action, settings, greeting) {
    if (settings) {
      liveVoiceSettings = normalizeLiveVoiceSettings(settings);
    }
    const line = clean(greeting);
    if (line) greetingLine = line;
    const bar = ensureBar();
    if (action === 'stop' || (action === 'toggle' && isTalkingState(ui.state))) {
      pendingShellAction = '';
      pendingLiveVoice = null;
      pendingGreeting = '';
      if (active) await stopCall(bar, 'stop');
      return;
    }
    if (!config.enabled) {
      pendingShellAction = action;
      pendingLiveVoice = settings || pendingLiveVoice;
      pendingGreeting = line || pendingGreeting;
      return;
    }
    pendingShellAction = '';
    pendingLiveVoice = null;
    pendingGreeting = '';
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
    rememberLiveTalkSpec(data.spec);
    liveTalkLog('shell.command', {
      action,
      spec: liveTalkSpec || resolveLiveTalkSpec(),
      waitForYou: data.liveVoice?.waitForYou || '',
      greeting: Boolean(clean(data.greeting)),
    });
    void applyShellAction(action, data.liveVoice, data.greeting);
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
      void applyShellAction(pendingShellAction, pendingLiveVoice, pendingGreeting);
    }
  }

  void start().catch((error) => {
    liveTalkError('overlay.start-threw', summarizeError(error));
  });
})(window);
