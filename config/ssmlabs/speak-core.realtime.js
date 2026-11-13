/* Pinned @spray/speak-core 0.2.21 / 36581f2 for Live Talk trial. Do not edit by hand. */
'use strict';
var SpeakCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    CANONICAL_SPEAK_MIC_AUDIO_CONSTRAINTS: () => CANONICAL_SPEAK_MIC_AUDIO_CONSTRAINTS,
    FIXED_PARAGRAPH: () => FIXED_PARAGRAPH,
    LONG_REPLY: () => LONG_REPLY,
    SPEAK_CORE_VERSION: () => SPEAK_CORE_VERSION,
    SPEAK_GARBLED_GIVE_UP_LINE: () => SPEAK_GARBLED_GIVE_UP_LINE,
    SPEAK_GOODBYE_LINE: () => SPEAK_GOODBYE_LINE,
    SPEAK_LISTEN_AGAIN_LINE: () => SPEAK_LISTEN_AGAIN_LINE,
    SpeakConversationInterruption: () => SpeakConversationInterruption,
    SpeakConversationTurnTaking: () => SpeakConversationTurnTaking,
    SpeakDiagnosticType: () => SpeakDiagnosticType,
    SpeakEvent: () => SpeakEvent,
    SpeakPhase: () => SpeakPhase,
    SpeakReadyState: () => SpeakReadyState,
    SpeakRealtimeEvent: () => SpeakRealtimeEvent,
    SpeakRealtimeProvider: () => SpeakRealtimeProvider,
    SpeakRealtimeSessionState: () => SpeakRealtimeSessionState,
    SpeakRecordPolicy: () => SpeakRecordPolicy,
    SpeakRecordPolicyKeys: () => SpeakRecordPolicyKeys,
    SpeakRecoveryPolicy: () => SpeakRecoveryPolicy,
    SpeakSessionKind: () => SpeakSessionKind,
    SpeakTimeouts: () => SpeakTimeouts,
    VoiceTurnConfidenceBand: () => VoiceTurnConfidenceBand,
    VoiceTurnRejectionReason: () => VoiceTurnRejectionReason,
    VoiceTurnStatus: () => VoiceTurnStatus,
    acquireSpeakMicStream: () => acquireSpeakMicStream,
    clampVoiceTurnConfidence: () => clampVoiceTurnConfidence,
    classifyListenEnd: () => classifyListenEnd,
    classifyVoiceTurn: () => classifyVoiceTurn,
    createDiagnostic: () => createDiagnostic,
    createElevenLabsRealtimeSession: () => createElevenLabsRealtimeSession,
    createFakeRealtimeSession: () => createFakeRealtimeSession,
    createFakeSpeakAdapters: () => createFakeTurnAdapters,
    createFakeSpeakMedia: () => createFakeSpeakMedia,
    createFakeTurnAdapters: () => createFakeTurnAdapters,
    createInitialSpeakState: () => createInitialSpeakState,
    createOpenAIRealtimeFunctionCallBridge: () => createOpenAIRealtimeFunctionCallBridge,
    createOpenAIRealtimeWebRTCSession: () => createOpenAIRealtimeWebRTCSession,
    createRealtimeEvent: () => createRealtimeEvent,
    createSpeakController: () => createSpeakController,
    createSpeakMedia: () => createSpeakMedia,
    createSpeakMicPrewarm: () => createSpeakMicPrewarm,
    createSpeakRealtimeSession: () => createSpeakRealtimeSession,
    createVoiceTurn: () => createVoiceTurn,
    createVoiceTurnId: () => createVoiceTurnId,
    decideWeakTranscriptRecovery: () => decideWeakTranscriptRecovery,
    detectLanguagePolicyViolation: () => detectLanguagePolicyViolation,
    elevenLabsTurnConfigFromConversationBehavior: () =>
      elevenLabsTurnConfigFromConversationBehavior,
    estimateVoiceTurnConfidence: () => estimateVoiceTurnConfidence,
    extractStopIntent: () => extractStopIntent,
    getCanonicalSpeakMicConstraints: () => getCanonicalSpeakMicConstraints,
    isAmbientRoomEnergy: () => isAmbientRoomEnergy,
    isCommandSession: () => isCommandSession,
    isLikelyPlaybackEcho: () => isLikelyPlaybackEcho,
    isListenAgainPrompt: () => isListenAgainPrompt,
    isLowEnergySpeech: () => isLowEnergySpeech,
    isRealtimeProvider: () => isRealtimeProvider,
    isSpeakActive: () => isSpeakActive,
    isSpeakTerminal: () => isSpeakTerminal,
    isStopIntent: () => isStopIntent,
    isUsableVoiceTurn: () => isUsableVoiceTurn,
    isWeakTranscript: () => isWeakTranscript,
    mergeEarlyAnswer: () => mergeEarlyAnswer,
    mergeSpeakRecordPolicy: () => mergeSpeakRecordPolicy,
    mergeSpeakRecoveryPolicy: () => mergeSpeakRecoveryPolicy,
    mergeSpeakTimeouts: () => mergeSpeakTimeouts,
    normalizeSpeakConversationBehavior: () => normalizeSpeakConversationBehavior,
    normalizeSpeakRealtimeProvider: () => normalizeSpeakRealtimeProvider,
    normalizeSpeakSessionKind: () => normalizeSpeakSessionKind,
    normalizeVoiceTurnTranscript: () => normalizeVoiceTurnTranscript,
    numberWord: () => numberWord,
    reduceSpeak: () => reduceSpeak,
    rememberVoiceTurnDedupeKey: () => rememberVoiceTurnDedupeKey,
    resolveSpeakGetUserMedia: () => resolveSpeakGetUserMedia,
    shouldHoldRealtimeInput: () => shouldHoldRealtimeInput,
    shouldSkipPlayback: () => shouldSkipPlayback,
    speakConversationBehaviorsEqual: () => speakConversationBehaviorsEqual,
    speakReadyState: () => speakReadyState,
    speakRecordPolicyOverridesFromQuery: () => speakRecordPolicyOverridesFromQuery,
    startBrowserSpeechRecognition: () => startBrowserSpeechRecognition,
    submitOpenAIRealtimeToolOutput: () => submitOpenAIRealtimeToolOutput,
    trimPlaybackEcho: () => trimPlaybackEcho,
    voiceTurnConfidenceBandFromScore: () => voiceTurnConfidenceBandFromScore,
    voiceTurnDedupeKey: () => voiceTurnDedupeKey,
  });

  // src/machine/phases.js
  var SpeakPhase = Object.freeze({
    IDLE: 'idle',
    READY: 'ready',
    SPEAKING: 'speaking',
    LISTENING: 'listening',
    TRANSCRIBING: 'transcribing',
    SUBMITTING: 'submitting',
    WAITING: 'waiting',
    PAUSED: 'paused',
    ERROR: 'error',
  });
  var SpeakSessionKind = Object.freeze({
    /** Optional opening speech, then listen → transcribe → reply → listen. */
    CONVERSATION: 'conversation',
    /** Listen immediately. No opening speech. */
    COMMAND: 'command',
  });
  var ACTIVE = /* @__PURE__ */ new Set([
    SpeakPhase.READY,
    SpeakPhase.SPEAKING,
    SpeakPhase.LISTENING,
    SpeakPhase.TRANSCRIBING,
    SpeakPhase.SUBMITTING,
    SpeakPhase.WAITING,
    SpeakPhase.PAUSED,
    SpeakPhase.ERROR,
  ]);
  function normalizeSpeakSessionKind(kind) {
    return kind === SpeakSessionKind.COMMAND
      ? SpeakSessionKind.COMMAND
      : SpeakSessionKind.CONVERSATION;
  }
  function isCommandSession(state) {
    return normalizeSpeakSessionKind(state?.sessionKind) === SpeakSessionKind.COMMAND;
  }
  function shouldSkipPlayback(state) {
    return state?.hear === false;
  }
  function isSpeakActive(phase) {
    return ACTIVE.has(phase);
  }
  function isSpeakTerminal(phase) {
    return phase === SpeakPhase.IDLE;
  }
  var SpeakReadyState = Object.freeze({
    READY: 'ready',
    DISABLED: 'disabled',
    IDLE: 'idle',
  });
  function speakReadyState(phase) {
    if (phase === SpeakPhase.LISTENING) return SpeakReadyState.READY;
    if (phase === SpeakPhase.ERROR || phase === SpeakPhase.PAUSED) {
      return SpeakReadyState.DISABLED;
    }
    return SpeakReadyState.IDLE;
  }

  // src/machine/events.js
  var SpeakEvent = Object.freeze({
    START_SESSION: 'START_SESSION',
    START: 'START',
    PLAYBACK_STARTED: 'PLAYBACK_STARTED',
    PLAYBACK_FINISHED: 'PLAYBACK_FINISHED',
    INTERRUPT: 'INTERRUPT',
    HEARING_CHANGED: 'HEARING_CHANGED',
    RECORDING_STARTED: 'RECORDING_STARTED',
    RECORDING_FINISHED: 'RECORDING_FINISHED',
    TRANSCRIPTION_SUCCEEDED: 'TRANSCRIPTION_SUCCEEDED',
    TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
    SUBMISSION_SUCCEEDED: 'SUBMISSION_SUCCEEDED',
    SUBMISSION_FAILED: 'SUBMISSION_FAILED',
    RESPONSE_RECEIVED: 'RESPONSE_RECEIVED',
    PAUSE: 'PAUSE',
    RESUME: 'RESUME',
    STOP: 'STOP',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    RETRY: 'RETRY',
    CLEAR_ERROR: 'CLEAR_ERROR',
    LISTEN_AGAIN: 'LISTEN_AGAIN',
    /** Speak a recovery line without pretending transcription/submission succeeded. */
    RECOVER_WITH_SPEECH: 'RECOVER_WITH_SPEECH',
    /** Speak a farewell/recovery line, then the controller ends the session. */
    END_WITH_SPEECH: 'END_WITH_SPEECH',
    SET_HEAR: 'SET_HEAR',
  });

  // src/machine/state.js
  function createInitialSpeakState(overrides = {}) {
    return {
      phase: SpeakPhase.IDLE,
      sessionKind: SpeakSessionKind.CONVERSATION,
      sessionId: '',
      lastSpokenMessageId: '',
      pendingSpeakMessageId: '',
      lastSpokenText: '',
      hearingSpeech: false,
      hear: true,
      errorMessage: '',
      errorCategory: '',
      pauseReturnPhase: '',
      runToken: 0,
      ...overrides,
    };
  }

  // src/machine/reduce.js
  function withPhase(state, phase, patch = {}) {
    const next = { ...state, phase, ...patch };
    if (phase !== SpeakPhase.LISTENING && patch.hearingSpeech == null) {
      next.hearingSpeech = false;
    }
    return next;
  }
  function resolveHear(state, event) {
    if (event && Object.prototype.hasOwnProperty.call(event, 'hear')) {
      return event.hear !== false;
    }
    return state.hear !== false;
  }
  function reduceSpeak(state, event) {
    const type = event?.type;
    if (!type) return state;
    switch (type) {
      case SpeakEvent.START_SESSION:
        if (state.phase !== SpeakPhase.IDLE) {
          return state;
        }
        return withPhase(state, SpeakPhase.READY, {
          sessionId: String(event.sessionId || state.sessionId || ''),
          errorMessage: '',
          errorCategory: '',
          runToken: (state.runToken || 0) + 1,
          lastSpokenMessageId: '',
          pendingSpeakMessageId: '',
          lastSpokenText: '',
          pauseReturnPhase: '',
          hearingSpeech: false,
          hear: resolveHear(state, event),
        });
      case SpeakEvent.START: {
        if (state.phase !== SpeakPhase.READY && state.phase !== SpeakPhase.ERROR) {
          return state;
        }
        const hearOff = shouldSkipPlayback(state);
        const skipOpening = event.skipOpening === true;
        const speakNow = event.speakNow === true;
        if (hearOff || (!speakNow && (isCommandSession(state) || skipOpening))) {
          return withPhase(state, SpeakPhase.LISTENING, {
            errorMessage: '',
            errorCategory: '',
            pendingSpeakMessageId: '',
            hearingSpeech: false,
          });
        }
        return withPhase(state, SpeakPhase.SPEAKING, {
          errorMessage: '',
          errorCategory: '',
          pendingSpeakMessageId: String(event.messageId || ''),
          lastSpokenText: event.text == null ? state.lastSpokenText : String(event.text || ''),
        });
      }
      case SpeakEvent.PLAYBACK_STARTED:
        if (state.phase !== SpeakPhase.SPEAKING) return state;
        return withPhase(state, SpeakPhase.SPEAKING, {
          pendingSpeakMessageId: String(event.messageId || state.pendingSpeakMessageId || ''),
        });
      case SpeakEvent.PLAYBACK_FINISHED: {
        if (state.phase !== SpeakPhase.SPEAKING) return state;
        const spokenId = String(event.messageId || state.pendingSpeakMessageId || '');
        const spokenText = event.text == null ? state.lastSpokenText : String(event.text || '');
        return withPhase(state, SpeakPhase.LISTENING, {
          lastSpokenMessageId: spokenId || state.lastSpokenMessageId,
          lastSpokenText: spokenText,
          pendingSpeakMessageId: '',
        });
      }
      case SpeakEvent.INTERRUPT:
        if (state.phase !== SpeakPhase.SPEAKING) return state;
        return withPhase(state, SpeakPhase.LISTENING, {
          pendingSpeakMessageId: '',
          hearingSpeech: false,
        });
      case SpeakEvent.HEARING_CHANGED:
        if (state.phase !== SpeakPhase.LISTENING) return state;
        return { ...state, hearingSpeech: Boolean(event.hearing) };
      case SpeakEvent.RECORDING_STARTED:
        if (state.phase !== SpeakPhase.LISTENING) return state;
        return state;
      case SpeakEvent.RECORDING_FINISHED:
        if (state.phase !== SpeakPhase.LISTENING) return state;
        return withPhase(state, SpeakPhase.TRANSCRIBING);
      case SpeakEvent.TRANSCRIPTION_SUCCEEDED:
        if (state.phase !== SpeakPhase.TRANSCRIBING) return state;
        return withPhase(state, SpeakPhase.SUBMITTING);
      case SpeakEvent.LISTEN_AGAIN:
        if (
          state.phase !== SpeakPhase.TRANSCRIBING &&
          state.phase !== SpeakPhase.LISTENING &&
          state.phase !== SpeakPhase.ERROR &&
          state.phase !== SpeakPhase.SUBMITTING &&
          state.phase !== SpeakPhase.WAITING
        ) {
          return state;
        }
        return withPhase(state, SpeakPhase.LISTENING, {
          errorMessage: String(event.message || ''),
          errorCategory: String(event.category || ''),
          hearingSpeech: false,
        });
      case SpeakEvent.RECOVER_WITH_SPEECH:
      case SpeakEvent.END_WITH_SPEECH: {
        if (
          state.phase !== SpeakPhase.TRANSCRIBING &&
          state.phase !== SpeakPhase.SUBMITTING &&
          state.phase !== SpeakPhase.WAITING
        ) {
          return state;
        }
        const line = event.text == null ? String(event.message || '') : String(event.text || '');
        if (shouldSkipPlayback(state) || event.speak === false) {
          return withPhase(state, SpeakPhase.LISTENING, {
            errorMessage: String(event.message || line),
            errorCategory: String(event.category || ''),
            pendingSpeakMessageId: '',
            hearingSpeech: false,
          });
        }
        return withPhase(state, SpeakPhase.SPEAKING, {
          errorMessage: String(event.message || line),
          errorCategory: String(event.category || ''),
          pendingSpeakMessageId: String(event.messageId || ''),
          lastSpokenText: line,
        });
      }
      case SpeakEvent.TRANSCRIPTION_FAILED:
        if (state.phase !== SpeakPhase.TRANSCRIBING && state.phase !== SpeakPhase.LISTENING) {
          return state;
        }
        return withPhase(state, SpeakPhase.ERROR, {
          errorMessage: String(event.message || 'I couldn\u2019t hear a response. Try again.'),
          errorCategory: String(event.category || 'transcription'),
        });
      case SpeakEvent.SUBMISSION_SUCCEEDED:
        if (state.phase !== SpeakPhase.SUBMITTING) return state;
        return withPhase(state, SpeakPhase.WAITING);
      case SpeakEvent.SUBMISSION_FAILED:
        if (state.phase !== SpeakPhase.SUBMITTING && state.phase !== SpeakPhase.WAITING) {
          return state;
        }
        return withPhase(state, SpeakPhase.ERROR, {
          errorMessage: String(event.message || 'The reply could not be generated. Try again.'),
          errorCategory: String(event.category || 'submission'),
        });
      case SpeakEvent.SET_HEAR:
        return { ...state, hear: event.hear !== false };
      case SpeakEvent.RESPONSE_RECEIVED:
        if (state.phase !== SpeakPhase.WAITING) return state;
        if (shouldSkipPlayback(state) || event.speak === false) {
          return withPhase(state, SpeakPhase.LISTENING, {
            pendingSpeakMessageId: '',
            lastSpokenMessageId: String(event.messageId || state.lastSpokenMessageId || ''),
            lastSpokenText: event.text == null ? state.lastSpokenText : String(event.text || ''),
          });
        }
        return withPhase(state, SpeakPhase.SPEAKING, {
          pendingSpeakMessageId: String(event.messageId || ''),
          lastSpokenText: event.text == null ? state.lastSpokenText : String(event.text || ''),
        });
      case SpeakEvent.PAUSE: {
        if (
          state.phase !== SpeakPhase.SPEAKING &&
          state.phase !== SpeakPhase.LISTENING &&
          state.phase !== SpeakPhase.WAITING &&
          state.phase !== SpeakPhase.SUBMITTING &&
          state.phase !== SpeakPhase.TRANSCRIBING &&
          state.phase !== SpeakPhase.READY
        ) {
          return state;
        }
        return withPhase(state, SpeakPhase.PAUSED, {
          pauseReturnPhase: state.phase,
          pendingSpeakMessageId: '',
        });
      }
      case SpeakEvent.RESUME:
        if (state.phase !== SpeakPhase.PAUSED) return state;
        if (event.listen === true) {
          return withPhase(state, SpeakPhase.LISTENING, {
            pauseReturnPhase: '',
            hearingSpeech: false,
            pendingSpeakMessageId: '',
          });
        }
        return withPhase(state, SpeakPhase.READY, {
          pauseReturnPhase: '',
        });
      case SpeakEvent.PERMISSION_DENIED:
        return withPhase(state, SpeakPhase.ERROR, {
          errorMessage: String(
            event.message || 'Microphone access is off. Allow access to continue by voice.',
          ),
          errorCategory: 'permission',
        });
      case SpeakEvent.RETRY:
        if (state.phase !== SpeakPhase.ERROR) return state;
        return withPhase(state, SpeakPhase.READY, {
          errorMessage: '',
          errorCategory: '',
        });
      case SpeakEvent.STOP:
        if (state.phase === SpeakPhase.IDLE) return state;
        return withPhase(state, SpeakPhase.IDLE, {
          errorMessage: '',
          errorCategory: '',
          pendingSpeakMessageId: '',
          pauseReturnPhase: '',
          hearingSpeech: false,
          runToken: (state.runToken || 0) + 1,
        });
      case SpeakEvent.CLEAR_ERROR:
        if (state.phase !== SpeakPhase.ERROR) return state;
        return withPhase(state, SpeakPhase.READY, {
          errorMessage: '',
          errorCategory: '',
        });
      default:
        return state;
    }
  }

  // src/playback/audioPlayer.js
  function primeMobileAudioElement(audio) {
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    audio.preload = 'auto';
  }
  function createAudioPlayer({
    onIdle,
    onPlaying,
    onPlaybackError,
    getAudioContext = null,
    outputGain = 1,
    /** When true, skip Web Audio TTS playback even if getAudioContext is set (mic graph may still exist). */
    preferHtmlAudio = false,
  } = {}) {
    const gain = Math.max(0, Math.min(1, Number(outputGain) || 1));
    const htmlOnly = Boolean(preferHtmlAudio);
    const queue = [];
    let playing = false;
    let abortController = null;
    let sharedAudio = null;
    let suppressIdle = false;
    let chunksPlayed = 0;
    let lastPlaybackError = null;
    let drainPromise = null;
    let idleWaiters = [];
    const getAudio = () => {
      if (!sharedAudio) {
        sharedAudio = new Audio();
        primeMobileAudioElement(sharedAudio);
        sharedAudio.volume = gain;
      }
      return sharedAudio;
    };
    const notifyIdle = () => {
      if (!queue.length && !playing) {
        onIdle?.();
        const waiters = idleWaiters;
        idleWaiters = [];
        waiters.forEach((resolve) => resolve());
      }
    };
    const stop = () => {
      suppressIdle = true;
      abortController?.abort();
      abortController = null;
      const audio = sharedAudio;
      if (audio) {
        try {
          audio.pause();
        } catch (_) {}
        try {
          audio.currentTime = 0;
          audio.removeAttribute('src');
          audio.load();
        } catch (_) {}
      }
      queue.length = 0;
      playing = false;
      drainPromise = null;
      const waiters = idleWaiters;
      idleWaiters = [];
      waiters.forEach((resolve) => resolve());
      suppressIdle = false;
    };
    const PLAY_TIMEOUT_MS = 12e3;
    const PLAY_TIMEOUT_PAD_MS = 4e3;
    function playbackTimeoutMs(durationSec) {
      const fromDuration = Math.ceil(Number(durationSec) * 1e3) + PLAY_TIMEOUT_PAD_MS;
      if (!Number.isFinite(fromDuration) || fromDuration <= 0) return PLAY_TIMEOUT_MS;
      return Math.max(PLAY_TIMEOUT_MS, fromDuration);
    }
    const playViaWebAudio = async (blob, signal, trimTailMs = 0) => {
      const ctx = typeof getAudioContext === 'function' ? getAudioContext() : null;
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (_) {}
      }
      if (ctx.state !== 'running') return false;
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await Promise.race([
          ctx.decodeAudioData(arrayBuffer.slice(0)),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Audio decode timed out')), 8e3);
          }),
        ]);
        return new Promise((resolve, reject) => {
          if (signal?.aborted) {
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
            return;
          }
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          const gainNode = ctx.createGain();
          gainNode.gain.value = gain;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          let started = false;
          const cleanup = () => {
            signal?.removeEventListener('abort', onAbort);
            try {
              source.disconnect();
            } catch (_) {}
            try {
              gainNode.disconnect();
            } catch (_) {}
          };
          const onAbort = () => {
            cleanup();
            try {
              source.stop(0);
            } catch (_) {}
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
          };
          signal?.addEventListener('abort', onAbort, { once: true });
          const trimSec = Math.max(0, Number(trimTailMs) || 0) / 1e3;
          const endAt = Math.max(0.05, audioBuffer.duration - trimSec);
          const timeoutMs = playbackTimeoutMs(endAt);
          let timeoutId = setTimeout(() => {
            cleanup();
            try {
              source.stop(0);
            } catch (_) {}
            const err = new Error('Audio playback timed out');
            if (started) err.alreadyStarted = true;
            reject(err);
          }, timeoutMs);
          source.onended = () => {
            clearTimeout(timeoutId);
            cleanup();
            resolve(true);
          };
          try {
            source.start(0);
            started = true;
            if (trimSec > 0 && endAt < audioBuffer.duration) {
              source.stop(endAt);
            }
          } catch (err) {
            clearTimeout(timeoutId);
            cleanup();
            reject(err);
          }
        });
      } catch (_) {
        return false;
      }
    };
    const playHtmlAudio = (blob, signal, trimTailMs = 0) =>
      new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
          return;
        }
        if (!blob?.size) {
          reject(new Error('Audio playback failed (empty blob)'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const audio = new Audio();
        primeMobileAudioElement(audio);
        audio.volume = gain;
        let settled = false;
        let timeoutId = null;
        const finish = (fn, value) => {
          if (settled) return;
          settled = true;
          fn(value);
        };
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          URL.revokeObjectURL(url);
          audio.onended = null;
          audio.onerror = null;
          audio.onloadedmetadata = null;
          try {
            audio.pause();
          } catch (_) {}
          try {
            audio.removeAttribute('src');
            audio.load();
          } catch (_) {}
        };
        const armTimeout = (durationSec) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            cleanup();
            finish(reject, new Error('Audio playback timed out'));
          }, playbackTimeoutMs(durationSec));
        };
        const onAbort = () => {
          cleanup();
          finish(reject, Object.assign(new Error('aborted'), { name: 'AbortError' }));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
        armTimeout(null);
        let trimTimer = null;
        const finishPlayback = () => {
          signal?.removeEventListener('abort', onAbort);
          cleanup();
          chunksPlayed += 1;
          finish(resolve);
        };
        audio.onloadedmetadata = () => {
          if (settled) return;
          const dur = Number(audio.duration);
          if (Number.isFinite(dur) && dur > 0) {
            armTimeout(dur);
            const trimSec = Math.max(0, Number(trimTailMs) || 0) / 1e3;
            if (trimSec > 0 && dur > trimSec + 0.05) {
              trimTimer = setTimeout(
                () => {
                  trimTimer = null;
                  finishPlayback();
                },
                Math.max(0, (dur - trimSec) * 1e3),
              );
            }
          }
        };
        audio.onended = () => {
          if (trimTimer) clearTimeout(trimTimer);
          finishPlayback();
        };
        audio.onerror = () => {
          if (trimTimer) clearTimeout(trimTimer);
          signal?.removeEventListener('abort', onAbort);
          const code = audio.error?.code ?? null;
          cleanup();
          finish(
            reject,
            new Error(
              code ? `Audio playback failed (media error ${code})` : 'Audio playback failed',
            ),
          );
        };
        audio.src = url;
        audio.play().catch((err) => {
          if (trimTimer) clearTimeout(trimTimer);
          signal?.removeEventListener('abort', onAbort);
          cleanup();
          finish(reject, err);
        });
      });
    const playBlob = (blob, signal, trimTailMs = 0) =>
      new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
          return;
        }
        if (!htmlOnly && typeof getAudioContext === 'function') {
          playViaWebAudio(blob, signal, trimTailMs)
            .then((ok) => {
              if (ok) {
                chunksPlayed += 1;
                resolve();
                return;
              }
              playHtmlAudio(blob, signal, trimTailMs).then(resolve).catch(reject);
            })
            .catch((err) => {
              if (err?.name === 'AbortError') {
                reject(err);
                return;
              }
              if (err?.alreadyStarted) {
                chunksPlayed += 1;
                resolve();
                return;
              }
              playHtmlAudio(blob, signal, trimTailMs).then(resolve).catch(reject);
            });
          return;
        }
        playHtmlAudio(blob, signal, trimTailMs).then(resolve).catch(reject);
      });
    const drain = async () => {
      if (playing) return drainPromise;
      playing = true;
      onPlaying?.();
      abortController = new AbortController();
      const { signal } = abortController;
      drainPromise = (async () => {
        try {
          while (queue.length && !signal.aborted) {
            const item = queue.shift();
            const blob = item?.blob || item;
            const trimTailMs = Number(item?.trimTailMs) || 0;
            if (!blob) continue;
            try {
              await playBlob(blob, signal, trimTailMs);
              lastPlaybackError = null;
            } catch (err) {
              if (err?.name === 'AbortError') break;
              lastPlaybackError = err;
              onPlaybackError?.(err);
              queue.length = 0;
              break;
            }
          }
        } finally {
          playing = false;
          abortController = null;
          drainPromise = null;
          if (!queue.length && !suppressIdle) notifyIdle();
          suppressIdle = false;
        }
      })();
      return drainPromise;
    };
    const primeFromUserGesture = () => {
      const audio = getAudio();
      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(() => {
              try {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
              } catch (_) {}
            })
            .catch(() => {});
        }
      } catch (_) {}
    };
    return {
      primeFromUserGesture,
      async unlock() {
        primeFromUserGesture();
        const audio = getAudio();
        await Promise.race([
          (async () => {
            try {
              await audio.play();
              audio.pause();
              audio.removeAttribute('src');
              audio.load();
            } catch (_) {}
          })(),
          new Promise((resolve) => {
            setTimeout(resolve, 400);
          }),
        ]);
      },
      enqueueBase64(base64, mime = 'audio/mpeg', opts = {}) {
        if (!base64) return Promise.resolve();
        const trimTailMs = Number(opts.trimTailMs) || 0;
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
        queue.push({ blob: new Blob([bytes], { type: mime }), trimTailMs });
        return drain().catch((err) => {
          lastPlaybackError = err;
        });
      },
      whenIdle() {
        if (!playing && queue.length === 0) return Promise.resolve();
        return new Promise((resolve) => {
          idleWaiters.push(resolve);
        });
      },
      stop,
      get isPlaying() {
        return playing || queue.length > 0;
      },
      get chunksPlayed() {
        return chunksPlayed;
      },
      get lastPlaybackError() {
        return lastPlaybackError;
      },
      resetTurnStats() {
        chunksPlayed = 0;
        lastPlaybackError = null;
      },
    };
  }

  // src/speech/speechDetector.js
  var DEFAULTS = {
    speechRms: 0.028,
    silenceRms: 0.018,
    speechOnsetMs: 200,
    /** `0` disables pause-as-done (tap / soft-limit / max end the turn). */
    silenceAfterSpeechMs: 0,
    minRecordMs: 1200,
    maxRecordMs: 45e3,
    softMaxActiveSpeechMs: 0,
    softPauseMs: 1500,
    softGraceMs: 45e3,
    floorMin: 3e-3,
    floorMax: 0.08,
    /** First milliseconds: learn ambient; do not lock speech yet. */
    calibrateMs: 250,
  };
  function clampNoiseFloor(value, floorMin = DEFAULTS.floorMin, floorMax = DEFAULTS.floorMax) {
    const n = Number(value);
    if (!Number.isFinite(n)) return floorMin;
    return Math.min(floorMax, Math.max(floorMin, n));
  }
  function speakThresholds(noiseFloor, opts = {}) {
    const speechRms = Number(opts.speechRms) > 0 ? Number(opts.speechRms) : DEFAULTS.speechRms;
    const floorMin = Number(opts.floorMin) > 0 ? Number(opts.floorMin) : DEFAULTS.floorMin;
    const floorMax = Number(opts.floorMax) > 0 ? Number(opts.floorMax) : DEFAULTS.floorMax;
    const floor = clampNoiseFloor(noiseFloor, floorMin, floorMax);
    if (speechRms > DEFAULTS.speechRms) {
      return { floor, speech: speechRms };
    }
    const speech = Math.max(speechRms, floor + Math.max(0.014, floor * 0.35));
    return { floor, speech };
  }
  function isStillSpeakingRms(rms, opts = {}) {
    const level = Number(rms) || 0;
    const speech = Number(opts.speech) || 0;
    const silence = Number(opts.silenceRms) > 0 ? Number(opts.silenceRms) : DEFAULTS.silenceRms;
    const peak = Number(opts.peakSpeechRms) || 0;
    const speechRatio =
      Number(opts.stillSpeakingSpeechRatio) > 0 ? Number(opts.stillSpeakingSpeechRatio) : 0.42;
    const peakRatio = Number(opts.stillSpeakingPeakRatio);
    const baseContinue = Math.max(silence * 2.2, speech * speechRatio);
    const peakContinue =
      Number.isFinite(peakRatio) && peakRatio > 0 && peak > speech * 1.02 ? peak * peakRatio : 0;
    const continueAt = peakContinue > 0 ? Math.max(baseContinue, peakContinue) : baseContinue;
    return level >= continueAt;
  }
  function mixNoiseFloor(prev, rms, dtMs, opts = {}) {
    const heardSpeech = Boolean(opts.heardSpeech);
    const peakSpeechRms = Number(opts.peakSpeechRms) || 0;
    const floorMin = Number(opts.floorMin) > 0 ? Number(opts.floorMin) : DEFAULTS.floorMin;
    const floorMax = Number(opts.floorMax) > 0 ? Number(opts.floorMax) : DEFAULTS.floorMax;
    const sample = Number(rms);
    let floor = clampNoiseFloor(prev, floorMin, floorMax);
    if (!Number.isFinite(sample) || sample < 0) return floor;
    if (sample < floor) {
      floor = sample;
    } else {
      const tau = heardSpeech ? 900 : 280;
      const dt = Math.max(0, Number(dtMs) || 0);
      const alpha = 1 - Math.exp(-dt / tau);
      floor += (sample - floor) * alpha;
    }
    floor = clampNoiseFloor(floor, floorMin, floorMax);
    if (peakSpeechRms > (Number(opts.speechRms) || DEFAULTS.speechRms)) {
      floor = Math.min(floor, peakSpeechRms * 0.48);
    }
    return floor;
  }
  function createSpeechEndDetector(opts) {
    const cfg = { ...DEFAULTS, ...opts };
    const {
      getRms,
      onSpeechEnd,
      onNoSpeech,
      onPhaseChange,
      onWatch,
      watchMs = 2e3,
      speechRms,
      silenceRms,
      speechOnsetMs,
      silenceAfterSpeechMs,
      minRecordMs,
      minSpeechMs = 0,
      maxRecordMs,
      softMaxActiveSpeechMs = 0,
      softPauseMs = DEFAULTS.softPauseMs,
      softGraceMs = DEFAULTS.softGraceMs,
      noSpeechHangupMs = 0,
      graceMs = 0,
      calibrateMs,
      floorMin,
      floorMax,
      seedSpeech = false,
      stillSpeakingSpeechRatio,
      stillSpeakingPeakRatio,
    } = cfg;
    const pauseAfterSpeechMs = Number(silenceAfterSpeechMs) > 0 ? Number(silenceAfterSpeechMs) : 0;
    const softMaxMs = Number(softMaxActiveSpeechMs) > 0 ? Number(softMaxActiveSpeechMs) : 0;
    const softPauseNeedMs = Number(softPauseMs) > 0 ? Number(softPauseMs) : DEFAULTS.softPauseMs;
    const softGraceNeedMs = Number(softGraceMs) > 0 ? Number(softGraceMs) : DEFAULTS.softGraceMs;
    const nowMs =
      typeof opts.nowMs === 'function'
        ? opts.nowMs
        : () =>
            typeof performance !== 'undefined' && typeof performance.now === 'function'
              ? performance.now()
              : Date.now();
    const requestFrame =
      typeof opts.requestFrame === 'function'
        ? opts.requestFrame
        : (cb) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(cb) : 0);
    const cancelFrame =
      typeof opts.cancelFrame === 'function'
        ? opts.cancelFrame
        : (id) => {
            if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
          };
    let running = false;
    let rafId = 0;
    let speechOnsetSince = null;
    let heardSpeech = false;
    let speechHeldMs = 0;
    let lastSpeechTickAt = 0;
    let silenceSince = null;
    let recordStartedAt = 0;
    let lastTickAt = 0;
    let paused = false;
    let noSpeechFired = false;
    let noiseFloor = Number(cfg.silenceRms) > 0 ? Number(cfg.silenceRms) : DEFAULTS.silenceRms;
    let peakSpeechRms = 0;
    let peakListenRms = 0;
    let lastRms = 0;
    let lastSpeechThreshold = 0;
    let lastStillSpeaking = false;
    let endReason = '';
    let lastWatchAt = 0;
    let softLimitReached = false;
    let softLimitAt = 0;
    const setPhase = (phase) => {
      if (typeof onPhaseChange === 'function') onPhaseChange(phase);
    };
    const snapshot = () => {
      const now = nowMs();
      return {
        endReason,
        heardSpeech,
        lastRms,
        speechThreshold: lastSpeechThreshold,
        stillSpeaking: lastStillSpeaking,
        peakSpeechRms,
        peakListenRms,
        noiseFloor,
        speechHeldMs,
        activeSpeechMs: speechHeldMs,
        softLimitReached,
        silenceMs: silenceSince ? Math.max(0, now - silenceSince) : 0,
        listenMs: recordStartedAt ? Math.max(0, now - recordStartedAt) : 0,
      };
    };
    const markSoftLimitIfNeeded = (now) => {
      if (softLimitReached || softMaxMs <= 0) return;
      if (speechHeldMs < softMaxMs) return;
      softLimitReached = true;
      softLimitAt = now;
    };
    const finish = (reason, phase, cb) => {
      endReason = reason;
      running = false;
      setPhase(phase);
      cb?.();
    };
    const maybeWatch = (now) => {
      const interval = Number(watchMs) > 0 ? Number(watchMs) : 2e3;
      if (typeof onWatch !== 'function' || interval <= 0) return;
      if (now - lastWatchAt < interval) return;
      lastWatchAt = now;
      try {
        onWatch(snapshot());
      } catch (_) {}
    };
    const tick = () => {
      if (!running || paused) return;
      const rms = Number(getRms()) || 0;
      const now = nowMs();
      const dt = lastTickAt ? now - lastTickAt : 16;
      lastTickAt = now;
      noiseFloor = mixNoiseFloor(noiseFloor, rms, dt, {
        heardSpeech,
        peakSpeechRms,
        speechRms,
        floorMin,
        floorMax,
      });
      peakListenRms = Math.max(peakListenRms, rms);
      const { speech } = speakThresholds(noiseFloor, { speechRms, floorMin, floorMax });
      const stillSpeaking = isStillSpeakingRms(rms, {
        speech,
        peakSpeechRms,
        silenceRms,
        stillSpeakingSpeechRatio: cfg.stillSpeakingSpeechRatio,
        stillSpeakingPeakRatio: cfg.stillSpeakingPeakRatio,
      });
      lastRms = rms;
      lastSpeechThreshold = speech;
      lastStillSpeaking = stillSpeaking;
      const inGuard =
        now - recordStartedAt < Math.max(Number(graceMs) || 0, Number(calibrateMs) || 0);
      if (inGuard) {
        rafId = requestFrame(tick);
        return;
      }
      maybeWatch(now);
      if (
        !heardSpeech &&
        !noSpeechFired &&
        noSpeechHangupMs > 0 &&
        typeof onNoSpeech === 'function' &&
        now - recordStartedAt >= noSpeechHangupMs
      ) {
        noSpeechFired = true;
        finish('no_speech', 'no-speech', onNoSpeech);
        return;
      }
      if (!heardSpeech && rms >= speech) {
        if (speechOnsetSince === null) speechOnsetSince = now;
        if (now - speechOnsetSince >= speechOnsetMs) {
          heardSpeech = true;
          lastSpeechTickAt = now;
          peakSpeechRms = Math.max(peakSpeechRms, rms);
          silenceSince = null;
          setPhase('speaking');
        }
      } else if (heardSpeech && stillSpeaking) {
        speechOnsetSince = null;
        if (lastSpeechTickAt) {
          speechHeldMs += now - lastSpeechTickAt;
        }
        lastSpeechTickAt = now;
        peakSpeechRms = Math.max(peakSpeechRms, rms);
        silenceSince = null;
        markSoftLimitIfNeeded(now);
        setPhase('speaking');
      } else {
        speechOnsetSince = null;
        lastSpeechTickAt = 0;
        if (heardSpeech && speechHeldMs < minSpeechMs) {
          heardSpeech = false;
          speechHeldMs = 0;
          peakSpeechRms = 0;
          silenceSince = null;
          softLimitReached = false;
          softLimitAt = 0;
          setPhase('listening');
        } else if (heardSpeech) {
          if (silenceSince === null) silenceSince = now;
          const elapsed = now - recordStartedAt;
          const silentFor = now - silenceSince;
          markSoftLimitIfNeeded(now);
          if (softLimitReached && elapsed >= minRecordMs && silentFor >= softPauseNeedMs) {
            finish('soft_limit_pause', 'saved', onSpeechEnd);
            return;
          }
          if (pauseAfterSpeechMs > 0 && elapsed >= minRecordMs && silentFor >= pauseAfterSpeechMs) {
            finish('pause', 'saved', onSpeechEnd);
            return;
          }
          setPhase('listening');
        } else {
          setPhase('listening');
        }
      }
      if (softLimitReached && softLimitAt > 0 && now - softLimitAt >= softGraceNeedMs) {
        finish('soft_limit_grace', 'saved', onSpeechEnd);
        return;
      }
      if (now - recordStartedAt >= maxRecordMs) {
        finish('max', 'saved', onSpeechEnd);
        return;
      }
      rafId = requestFrame(tick);
    };
    return {
      start() {
        running = true;
        paused = false;
        heardSpeech = Boolean(seedSpeech);
        noSpeechFired = false;
        speechHeldMs = heardSpeech ? Math.max(Number(minSpeechMs) || 0, 1) : 0;
        lastSpeechTickAt = heardSpeech ? nowMs() : 0;
        speechOnsetSince = null;
        silenceSince = null;
        peakSpeechRms = 0;
        peakListenRms = 0;
        lastRms = 0;
        lastSpeechThreshold = 0;
        lastStillSpeaking = false;
        endReason = '';
        softLimitReached = false;
        softLimitAt = 0;
        lastWatchAt = 0;
        noiseFloor = Number(cfg.silenceRms) > 0 ? Number(cfg.silenceRms) : DEFAULTS.silenceRms;
        recordStartedAt = nowMs();
        lastTickAt = recordStartedAt;
        lastWatchAt = recordStartedAt;
        setPhase(heardSpeech ? 'speaking' : 'listening');
        cancelFrame(rafId);
        rafId = requestFrame(tick);
      },
      stop() {
        running = false;
        paused = false;
        cancelFrame(rafId);
      },
      pause() {
        paused = true;
        cancelFrame(rafId);
        setPhase('paused');
      },
      resume() {
        if (!running) return;
        paused = false;
        lastTickAt = nowMs();
        rafId = requestFrame(tick);
        setPhase(heardSpeech ? 'speaking' : 'listening');
      },
      get heardSpeech() {
        return heardSpeech;
      },
      get noiseFloor() {
        return noiseFloor;
      },
      get peakSpeechRms() {
        return peakSpeechRms;
      },
      get peakListenRms() {
        return peakListenRms;
      },
      get speechHeldMs() {
        return speechHeldMs;
      },
      get endReason() {
        return endReason;
      },
      snapshot,
    };
  }

  // src/policies/listenEnd.js
  function classifyListenEnd(stats = {}, policy = {}) {
    const reason = String(stats.endReason || '').trim();
    const held = Number(stats.speechHeldMs) || 0;
    const peak = Number(stats.peakSpeechRms) || 0;
    const listenPeak = Number(stats.peakListenRms) || 0;
    const last = Number(stats.lastRms) || 0;
    const speech =
      Number(stats.speechThreshold) > 0
        ? Number(stats.speechThreshold)
        : Number(policy.SPEECH_RMS) || 0.028;
    const silenceNeed =
      Number(policy.SILENCE_AFTER_SPEECH_MS) > 0 ? Number(policy.SILENCE_AFTER_SPEECH_MS) : 1600;
    const silenceMs = Number(stats.silenceMs) || 0;
    const listenMs = Number(stats.listenMs) || 0;
    const pauseAsDone =
      Number(policy.SILENCE_AFTER_SPEECH_MS) > 0 || Number(policy.silenceAfterSpeechMs) > 0;
    if (reason === 'watch') {
      if (stats.heardSpeech && stats.stillSpeaking && listenMs > silenceNeed) {
        return {
          verdict: 'holding',
          hint: 'RMS still counts as speech \u2014 pause timer is not running',
        };
      }
      if (stats.heardSpeech && !stats.stillSpeaking) {
        if (!pauseAsDone) {
          return {
            verdict: 'waiting_tap',
            hint: 'speech ended; waiting for host Done talking',
          };
        }
        return {
          verdict: 'waiting_silence',
          hint: `pause timer ${Math.round(silenceMs)}ms / ${Math.round(silenceNeed)}ms`,
        };
      }
      return {
        verdict: 'waiting_lock',
        hint:
          listenPeak >= speech * 0.7
            ? 'energy present but VAD has not locked speech'
            : 'listening, no speech lock',
      };
    }
    if (reason === 'max') {
      return { verdict: 'stuck_open', hint: 'listen hit maxRecordMs without a pause' };
    }
    if (reason === 'soft_limit_pause') {
      return {
        verdict: 'soft_limit_pause',
        hint: 'natural pause after soft active-speech boundary',
      };
    }
    if (reason === 'soft_limit_grace') {
      return {
        verdict: 'soft_limit_grace',
        hint: 'soft boundary grace expired without a usable pause',
      };
    }
    if (reason === 'no_speech') {
      if (listenPeak >= speech * 0.7) {
        return {
          verdict: 'missed_lock',
          hint: 'hangup with mic energy but VAD never locked speech',
        };
      }
      return { verdict: 'quiet_hangup', hint: 'no speech lock' };
    }
    if (reason === 'stop') {
      return { verdict: 'tap_done', hint: 'host stopped the recorder' };
    }
    if (reason === 'pause') {
      if (held < 500 && peak >= speech) {
        return { verdict: 'early_pause', hint: 'pause after a very short lock' };
      }
      if (last >= speech * 0.85) {
        return {
          verdict: 'early_pause',
          hint: 'ended while RMS was still near the speech bar',
        };
      }
      if (held > 8e3 && silenceMs < silenceNeed * 0.5) {
        return {
          verdict: 'early_pause',
          hint: 'long speech cut with little measured silence',
        };
      }
      return { verdict: 'ok_pause', hint: 'pause after speech' };
    }
    return { verdict: 'unknown', hint: reason || 'no end reason' };
  }

  // src/policies/timeouts.js
  var SpeakTimeouts = Object.freeze({
    SUBMIT_MS: 9e4,
    SPEAK_UNIT_MS: 25e3,
    SPEAK_TURN_MS: 9e4,
    THINKING_WATCHDOG_MS: 100,
  });
  var SpeakRecordPolicy = Object.freeze({
    MAX_RECORD_MS: 45e3,
    NO_SPEECH_HANGUP_MS: 2e4,
    /**
     * Pause-as-done after a held lock. `0` disables (authors tap Done).
     * Soft-limit pause uses SOFT_PAUSE_MS instead once SOFT_MAX_ACTIVE_SPEECH_MS is reached.
     */
    SILENCE_AFTER_SPEECH_MS: 0,
    COMMAND_SILENCE_AFTER_SPEECH_MS: 0,
    /**
     * Soft turn boundary (active speech ms). `0` disables.
     * After this much held speech, end on the next natural pause (SOFT_PAUSE_MS)
     * or force-end after SOFT_GRACE_MS so ambient cannot hold forever.
     */
    SOFT_MAX_ACTIVE_SPEECH_MS: 0,
    /** Natural pause required after soft max before ending the capture. */
    SOFT_PAUSE_MS: 1500,
    /** Wall-clock grace after soft max if no usable pause arrives. */
    SOFT_GRACE_MS: 45e3,
    SPEECH_ONSET_MS: 80,
    /** Discard brief VAD spikes; pause-as-done only after a held lock. */
    MIN_SPEECH_MS: 180,
    /** Command / Ask — allow short field answers to finish on pause. */
    COMMAND_MIN_SPEECH_MS: 180,
    MIN_RECORD_MS: 500,
    RECORDER_WARMUP_MS: 120,
    CALIBRATE_MS: 250,
    LISTEN_GRACE_MS: 650,
    /** Shorter guard after assistant TTS (echo tail already gone). */
    POST_TTS_LISTEN_GRACE_MS: 80,
    /** Trim the last stretch of spoken audio so listen can start sooner. */
    PLAYBACK_TAIL_TRIM_MS: 550,
    SPEECH_RMS: 0.028,
    SILENCE_RMS: 0.018,
    /** While locked, RMS at or above this fraction of start-speech keeps the turn open. */
    STILL_SPEAKING_SPEECH_RATIO: 0.42,
    /**
     * After real speech, also require RMS to stay above this fraction of peakSpeechRms
     * so room tone below the author's voice can end the turn. `0` disables the peak arm.
     */
    STILL_SPEAKING_PEAK_RATIO: 0.24,
    /**
     * After a listen, reject “speech” whose peak never cleared the room by this
     * much (hosts raise for noisy homes). `0` keeps the isLowEnergySpeech default.
     */
    MIN_PEAK_ABOVE_FLOOR: 0,
    /**
     * Absolute minimum peak RMS to accept a turn. `0` derives from SPEECH_RMS.
     */
    MIN_PEAK_SPEECH_RMS: 0,
    /**
     * Duplex turns AEC off so early answers are captured; speaker bleed into the
     * mic is loud. Barge must sit above that bleed (see bleed margin + grace).
     */
    BARGE_IN_RMS: 0.08,
    BARGE_IN_ONSET_MS: 280,
    BARGE_IN_GRACE_MS: 550,
    /** Extra headroom above learned TTS→mic bleed before barge fires. */
    BARGE_IN_BLEED_MARGIN: 0.05,
    /**
     * Keep mic live during TTS so the user can interrupt and start answering
     * before playback finishes (duplex / barge-in). Set `0` / `false` to mute
     * the mic while playing (half-duplex).
     */
    DUPLEX: 1,
    /**
     * When truthy, prefer server STT over browser live captions when encoded
     * audio exists (phone Safari often lacks live captions during record).
     */
    PREFER_STT_WITH_AUDIO: 0,
  });
  var SpeakRecordPolicyKeys = Object.freeze(Object.keys(SpeakRecordPolicy));
  function snakeToCamel(key) {
    return String(key)
      .toLowerCase()
      .replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
  }
  var RECORD_POLICY_ALIASES = Object.freeze(
    (() => {
      const map = /* @__PURE__ */ Object.create(null);
      for (const key of SpeakRecordPolicyKeys) {
        map[key] = key;
        map[key.toLowerCase()] = key;
        map[snakeToCamel(key)] = key;
      }
      map.duplex = 'DUPLEX';
      map.bargeRms = 'BARGE_IN_RMS';
      map.bargeOnsetMs = 'BARGE_IN_ONSET_MS';
      map.bargeGraceMs = 'BARGE_IN_GRACE_MS';
      map.bleedMargin = 'BARGE_IN_BLEED_MARGIN';
      map.postTtsGraceMs = 'POST_TTS_LISTEN_GRACE_MS';
      map.playbackTailTrimMs = 'PLAYBACK_TAIL_TRIM_MS';
      map.recorderWarmupMs = 'RECORDER_WARMUP_MS';
      map.softMaxActiveSpeechMs = 'SOFT_MAX_ACTIVE_SPEECH_MS';
      map.softPauseMs = 'SOFT_PAUSE_MS';
      map.softGraceMs = 'SOFT_GRACE_MS';
      return map;
    })(),
  );
  function resolveRecordPolicyKey(rawKey) {
    const k = String(rawKey || '');
    if (!k) return null;
    if (k.startsWith('rp.')) return resolveRecordPolicyKey(k.slice(3));
    return RECORD_POLICY_ALIASES[k] || RECORD_POLICY_ALIASES[k.toLowerCase()] || null;
  }
  function speakRecordPolicyOverridesFromQuery(input) {
    const out = /* @__PURE__ */ Object.create(null);
    if (input == null || input === '') return out;
    const assign = (rawKey, rawVal) => {
      if (rawVal == null || rawVal === '') return;
      const key = resolveRecordPolicyKey(rawKey);
      if (!key) return;
      out[key] = rawVal;
    };
    if (typeof input === 'string' || input instanceof URLSearchParams) {
      const params =
        typeof input === 'string'
          ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
          : input;
      for (const [k, v] of params.entries()) assign(k, v);
      return out;
    }
    if (typeof input === 'object') {
      for (const [k, v] of Object.entries(input)) assign(k, v);
    }
    return out;
  }
  function mergeSpeakPolicy(defaults, overrides) {
    const next = { ...defaults };
    if (!overrides || typeof overrides !== 'object') return Object.freeze(next);
    for (const key of Object.keys(defaults)) {
      if (overrides[key] == null || overrides[key] === '') continue;
      if (key === 'DUPLEX') {
        next[key] =
          overrides[key] === false || overrides[key] === 0 || overrides[key] === '0' ? 0 : 1;
        continue;
      }
      const n = Number(overrides[key]);
      if (Number.isFinite(n)) next[key] = n;
    }
    return Object.freeze(next);
  }
  function mergeSpeakTimeouts(overrides) {
    return mergeSpeakPolicy(SpeakTimeouts, overrides);
  }
  function mergeSpeakRecordPolicy(overrides) {
    return mergeSpeakPolicy(SpeakRecordPolicy, speakRecordPolicyOverridesFromQuery(overrides));
  }

  // src/policies/bargeIn.js
  var SPEAK_BARGE_IN_RMS = SpeakRecordPolicy.BARGE_IN_RMS;
  var SPEAK_BARGE_IN_ONSET_MS = SpeakRecordPolicy.BARGE_IN_ONSET_MS;
  var SPEAK_BARGE_IN_GRACE_MS = SpeakRecordPolicy.BARGE_IN_GRACE_MS;
  var SPEAK_BARGE_IN_BLEED_MARGIN = SpeakRecordPolicy.BARGE_IN_BLEED_MARGIN;
  function startBargeInMonitor(opts) {
    const nowMs =
      opts.nowMs ||
      (() =>
        typeof performance !== 'undefined' && typeof performance.now === 'function'
          ? performance.now()
          : Date.now());
    const requestFrame =
      opts.requestFrame ||
      ((cb) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(cb) : 0));
    const cancelFrame =
      opts.cancelFrame ||
      ((id) => {
        if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
      });
    const rmsThreshold = Number.isFinite(Number(opts.rmsThreshold))
      ? Number(opts.rmsThreshold)
      : SPEAK_BARGE_IN_RMS;
    const onsetMs = Number.isFinite(Number(opts.onsetMs))
      ? Number(opts.onsetMs)
      : SPEAK_BARGE_IN_ONSET_MS;
    const graceMs = Number.isFinite(Number(opts.graceMs))
      ? Number(opts.graceMs)
      : SPEAK_BARGE_IN_GRACE_MS;
    const bleedMargin = Number.isFinite(Number(opts.bleedMargin))
      ? Number(opts.bleedMargin)
      : SPEAK_BARGE_IN_BLEED_MARGIN;
    let raf = 0;
    let speakingSince = null;
    let loudPeakRms = 0;
    let bleedFloor = 0;
    const startedAt = nowMs();
    let stopped = false;
    const stop = () => {
      stopped = true;
      if (raf) cancelFrame(raf);
      raf = 0;
      speakingSince = null;
    };
    const effectiveThreshold = () => Math.max(rmsThreshold, bleedFloor + bleedMargin);
    const tick = () => {
      if (stopped) return;
      if (!opts.isStillMonitoring()) {
        stop();
        return;
      }
      const now = nowMs();
      const rms = Number(opts.readRms()) || 0;
      const inGrace = now - startedAt < graceMs;
      if (inGrace) {
        bleedFloor = Math.max(bleedFloor, rms);
        raf = requestFrame(tick);
        return;
      }
      if (speakingSince === null) {
        if (rms > bleedFloor) {
          bleedFloor = bleedFloor * 0.82 + rms * 0.18;
        } else {
          bleedFloor = bleedFloor * 0.96 + rms * 0.04;
        }
      }
      const threshold = effectiveThreshold();
      if (rms >= threshold) {
        loudPeakRms = Math.max(loudPeakRms, rms);
        if (speakingSince === null) speakingSince = now;
        const heldMs = now - speakingSince;
        if (heldMs >= onsetMs) {
          const detail = {
            rms,
            peakRms: loudPeakRms,
            onsetHeldMs: Math.round(heldMs),
            sinceMonitorMs: Math.round(now - startedAt),
            graceMs,
            onsetMs,
            rmsThreshold,
            bleedFloor: Number(bleedFloor.toFixed(4)),
            bleedMargin,
            effectiveThreshold: Number(threshold.toFixed(4)),
          };
          stop();
          try {
            opts.onBargeIn(detail);
          } catch (_) {}
          return;
        }
      } else {
        speakingSince = null;
      }
      raf = requestFrame(tick);
    };
    raf = requestFrame(tick);
    return { stop };
  }

  // src/playback/cues.js
  function prefersReducedMotion() {
    try {
      return Boolean(
        typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      );
    } catch {
      return false;
    }
  }
  function playHaptic(pattern = 12) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {}
  }
  var CUE = Object.freeze({
    listen: { freq: 880, freqEnd: 880, dur: 0.13, gain: 0.08, haptic: 12 },
    captured: { freq: 587, freqEnd: 880, dur: 0.18, gain: 0.12, haptic: [12, 40, 16] },
    quit: { freq: 660, freqEnd: 380, dur: 0.14, gain: 0.055, haptic: 10 },
  });
  async function playSpeakCue(kind, ctx) {
    const spec = CUE[kind] || CUE.listen;
    playHaptic(spec.haptic);
    if (prefersReducedMotion() || !ctx) return;
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(spec.freq, ctx.currentTime);
      if (spec.freqEnd !== spec.freq) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, spec.freqEnd),
          ctx.currentTime + spec.dur,
        );
      }
      gain.gain.setValueAtTime(spec.gain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + spec.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + spec.dur + 0.02);
      await new Promise((r) => {
        setTimeout(r, Math.ceil((spec.dur + 0.04) * 1e3));
      });
    } catch {}
  }

  // src/media/micConstraints.js
  var CANONICAL_SPEAK_MIC_AUDIO_CONSTRAINTS = Object.freeze({
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });
  function getCanonicalSpeakMicConstraints(overrides = {}) {
    const audioOverrides =
      overrides?.audio && typeof overrides.audio === 'object' ? overrides.audio : {};
    return {
      audio: {
        ...CANONICAL_SPEAK_MIC_AUDIO_CONSTRAINTS,
        ...audioOverrides,
      },
    };
  }
  function resolveSpeakGetUserMedia(getUserMedia) {
    if (typeof getUserMedia === 'function') {
      return getUserMedia;
    }
    const bound = globalThis.navigator?.mediaDevices?.getUserMedia?.bind(
      globalThis.navigator?.mediaDevices,
    );
    if (typeof bound !== 'function') {
      throw new TypeError('getUserMedia is unavailable');
    }
    return bound;
  }
  async function acquireSpeakMicStream(getUserMedia, overrides = {}) {
    const gUM = resolveSpeakGetUserMedia(getUserMedia);
    return gUM(getCanonicalSpeakMicConstraints(overrides));
  }
  function createSpeakMicPrewarm(options = {}) {
    let prewarmedStream = null;
    let prewarmPromise = null;
    function stopStream(stream) {
      try {
        stream?.getTracks?.().forEach((track) => {
          try {
            track.stop();
          } catch (_) {}
        });
      } catch (_) {}
    }
    return {
      async prewarm() {
        if (prewarmedStream) {
          return prewarmedStream;
        }
        if (prewarmPromise) {
          return prewarmPromise;
        }
        prewarmPromise = acquireSpeakMicStream(options.getUserMedia, options.overrides)
          .then((stream) => {
            prewarmedStream = stream;
            return stream;
          })
          .catch((error) => {
            prewarmPromise = null;
            throw error;
          });
        return prewarmPromise;
      },
      takeStream() {
        const stream = prewarmedStream;
        prewarmedStream = null;
        prewarmPromise = null;
        return stream || null;
      },
      discard() {
        if (prewarmedStream) {
          stopStream(prewarmedStream);
        }
        prewarmedStream = null;
        prewarmPromise = null;
      },
      hasStream() {
        return Boolean(prewarmedStream);
      },
    };
  }

  // src/media/createSpeakMedia.js
  var SPEAK_MAX_RECORD_MS = SpeakRecordPolicy.MAX_RECORD_MS;
  var SPEAK_NO_SPEECH_HANGUP_MS = SpeakRecordPolicy.NO_SPEECH_HANGUP_MS;
  var SPEAK_SILENCE_AFTER_SPEECH_MS = SpeakRecordPolicy.SILENCE_AFTER_SPEECH_MS;
  var SPEAK_COMMAND_SILENCE_AFTER_SPEECH_MS = SpeakRecordPolicy.COMMAND_SILENCE_AFTER_SPEECH_MS;
  var SPEAK_SPEECH_ONSET_MS = SpeakRecordPolicy.SPEECH_ONSET_MS;
  var SPEAK_MIN_SPEECH_MS = SpeakRecordPolicy.MIN_SPEECH_MS;
  var SPEAK_MIN_RECORD_MS = SpeakRecordPolicy.MIN_RECORD_MS;
  var SPEAK_RECORDER_WARMUP_MS = SpeakRecordPolicy.RECORDER_WARMUP_MS;
  function isAppleSpeakCaptureHost() {
    if (typeof navigator === 'undefined') return false;
    const ua = String(navigator.userAgent || '');
    if (/iPhone|iPad|iPod/i.test(ua)) return true;
    return /Macintosh/i.test(ua) && Number(navigator.maxTouchPoints) > 1;
  }
  function pickRecorderMime() {
    if (typeof MediaRecorder === 'undefined') return '';
    const apple = isAppleSpeakCaptureHost();
    const types = apple
      ? ['audio/mp4', 'audio/aac', 'audio/mpeg']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    for (const t of types) {
      try {
        if (MediaRecorder.isTypeSupported(t)) return t;
      } catch (_) {}
    }
    return '';
  }
  function recorderTimesliceMs() {
    return isAppleSpeakCaptureHost() ? 0 : 250;
  }
  function resolveRecordedAudioMime(blob, recorder, fallback = '') {
    const fromBlob = String(blob?.type || '')
      .trim()
      .split(';')[0]
      .trim();
    if (fromBlob && fromBlob !== 'application/octet-stream') return fromBlob;
    const fromRecorder = String(recorder?.mimeType || '')
      .trim()
      .split(';')[0]
      .trim();
    if (fromRecorder) return fromRecorder;
    const picked = pickRecorderMime();
    if (picked) return picked.split(';')[0].trim();
    if (isAppleSpeakCaptureHost()) return 'audio/mp4';
    return fallback || 'audio/webm';
  }
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        const i = result.indexOf(',');
        resolve(i >= 0 ? result.slice(i + 1) : result);
      };
      reader.onerror = () => reject(reader.error || new Error('Could not read audio.'));
      reader.readAsDataURL(blob);
    });
  }
  function waitForEventOrTimeout(target, eventName, ms) {
    return new Promise((resolve) => {
      let settled = false;
      let timer = 0;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        try {
          target?.removeEventListener?.(eventName, onEvent);
        } catch (_) {}
        resolve();
      };
      const onEvent = () => finish();
      try {
        target.addEventListener(eventName, onEvent);
      } catch (_) {
        resolve();
        return;
      }
      timer = setTimeout(finish, ms);
    });
  }
  function pickNum(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  function createSpeakMedia(opts = {}) {
    const policy = mergeSpeakRecordPolicy(opts.recordPolicy);
    const onTelemetry = typeof opts.onTelemetry === 'function' ? opts.onTelemetry : null;
    let mediaStream = null;
    let recorderStream = null;
    let audioContext = null;
    let analyser = null;
    let micSource = null;
    let mediaRecorder = null;
    let recordChunks = [];
    let speechDetector = null;
    let lastListenStats = null;
    let bargeInHandle = null;
    let destroyed = false;
    let micEpoch = 0;
    let utteranceResolve = null;
    let armStartedAt = 0;
    let firstChunkAt = 0;
    let armedBytes = 0;
    let duplexTalkover = false;
    let recordingWaitResolve = null;
    function nowMs() {
      return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    }
    function emitTelemetry(event, detail = {}) {
      if (!onTelemetry) return;
      try {
        onTelemetry({ event: String(event || ''), ...detail, t: Math.round(nowMs()) });
      } catch (_) {}
    }
    function resolveRecordingWait() {
      const resolve = recordingWaitResolve;
      recordingWaitResolve = null;
      try {
        resolve?.();
      } catch (_) {}
    }
    function armedSnapshot(extra = {}) {
      return {
        recording: mediaRecorder?.state === 'recording',
        chunkCount: recordChunks.length,
        bytes: armedBytes,
        armedMs: armStartedAt ? Math.round(nowMs() - armStartedAt) : 0,
        firstChunkMs: armStartedAt && firstChunkAt ? Math.round(firstChunkAt - armStartedAt) : null,
        muted: isPlaybackMutingMic(),
        duplex: duplexEnabled(),
        duplexTalkover,
        ...extra,
      };
    }
    async function applyEchoCancellation(enabled) {
      const streams = [mediaStream, recorderStream].filter(Boolean);
      for (const stream of streams) {
        const tracks = stream.getAudioTracks?.() || [];
        for (const track of tracks) {
          try {
            await track.applyConstraints({
              echoCancellation: Boolean(enabled),
              noiseSuppression: true,
              autoGainControl: true,
            });
          } catch (_) {}
        }
      }
    }
    async function setDuplexTalkover(active) {
      const next = Boolean(active) && duplexEnabled();
      if (next === duplexTalkover) return;
      duplexTalkover = next;
      await applyEchoCancellation(!duplexTalkover);
      emitTelemetry('duplex_talkover', armedSnapshot({ echoCancellation: !duplexTalkover }));
    }
    function resolveUtterance() {
      const resolve = utteranceResolve;
      utteranceResolve = null;
      resolve?.();
    }
    function stopLiveRecorder() {
      const rec = mediaRecorder;
      if (!rec || rec.state === 'inactive') return false;
      try {
        if (typeof rec.requestData === 'function' && !isAppleSpeakCaptureHost()) {
          rec.requestData();
        }
        rec.stop();
        return true;
      } catch (_) {
        return false;
      }
    }
    function captureListenStats(fallbackReason = '') {
      if (!speechDetector || typeof speechDetector.snapshot !== 'function') {
        return lastListenStats;
      }
      const snap = { ...speechDetector.snapshot() };
      if (!snap.endReason && fallbackReason) snap.endReason = fallbackReason;
      lastListenStats = snap;
      return lastListenStats;
    }
    function listenStatsPayload(extra = {}) {
      const stats = lastListenStats || extra;
      const classified = classifyListenEnd(stats, policy);
      return { ...stats, ...classified, ...extra };
    }
    function forceFinishRecording() {
      captureListenStats('stop');
      if (speechDetector) {
        try {
          speechDetector.stop();
        } catch (_) {}
        speechDetector = null;
      }
      const stopped = stopLiveRecorder();
      if (!stopped) {
        try {
          mediaRecorder?.onstop?.();
        } catch (_) {}
        resolveRecordingWait();
        resolveUtterance();
        return;
      }
      setTimeout(() => {
        resolveRecordingWait();
      }, 600);
    }
    const playbackGain = Math.max(0, Math.min(1, Number(opts.playbackGain) || 1));
    const audioPlayer = createAudioPlayer({
      onPlaying: opts.onPlaying,
      onIdle: opts.onIdle,
      onPlaybackError: opts.onPlaybackError,
      getAudioContext: () => audioContext,
      outputGain: playbackGain,
      preferHtmlAudio: Boolean(opts.preferHtmlAudio),
    });
    async function ensureAudioContext() {
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContext();
      }
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (_) {}
      }
      return audioContext;
    }
    async function ensureMic() {
      if (destroyed) throw micTornDownError();
      if (mediaStream?.active) {
        await ensureAudioContext();
        return mediaStream;
      }
      if (mediaStream) {
        stopStreamTracks(mediaStream);
        mediaStream = null;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        const err = new Error('This browser does not support microphone recording.');
        err.category = 'unsupported';
        throw err;
      }
      const epoch = micEpoch;
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(getCanonicalSpeakMicConstraints());
      } catch (err) {
        const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
        const next = new Error(
          denied
            ? 'Microphone access is off. Allow access to continue by voice.'
            : 'No microphone available. Check your device.',
        );
        next.category = denied ? 'permission' : 'microphone';
        next.cause = err;
        throw next;
      }
      if (destroyed || epoch !== micEpoch) {
        stopStreamTracks(stream);
        throw micTornDownError();
      }
      mediaStream = stream;
      await ensureAudioContext();
      if (destroyed || epoch !== micEpoch) {
        stopStreamTracks(mediaStream);
        mediaStream = null;
        throw micTornDownError();
      }
      connectMicAnalyser();
      return mediaStream;
    }
    function connectMicAnalyser() {
      if (!mediaStream || !audioContext) return;
      if (micSource) {
        try {
          micSource.disconnect();
        } catch (_) {}
        micSource = null;
      }
      micSource = audioContext.createMediaStreamSource(mediaStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      micSource.connect(analyser);
    }
    function stopStreamTracks(stream) {
      if (!stream) return;
      try {
        stream.getTracks?.().forEach((t) => {
          try {
            t.stop();
          } catch (_) {}
        });
      } catch (_) {}
    }
    function releaseRecorderStream() {
      if (!recorderStream) return;
      if (recorderStream !== mediaStream) {
        stopStreamTracks(recorderStream);
      }
      recorderStream = null;
    }
    function micTornDownError() {
      return Object.assign(new Error('Voice media torn down'), { category: 'ended' });
    }
    function assertMicEpoch(epoch) {
      if (destroyed || epoch !== micEpoch) throw micTornDownError();
    }
    function readMicRms() {
      if (isPlaybackMutingMic()) return 0;
      if (!analyser) return 0;
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / data.length);
    }
    let playbackMuteDepth = 0;
    let externalPlaybackActive = false;
    function duplexEnabled() {
      return policy.DUPLEX !== 0 && policy.DUPLEX !== false;
    }
    function isPlaybackMutingMic() {
      return playbackMuteDepth > 0;
    }
    function syncMicInputEnabled() {
      const enabled = !isPlaybackMutingMic();
      for (const stream of [mediaStream, recorderStream]) {
        stream?.getAudioTracks?.().forEach((t) => {
          try {
            t.enabled = enabled;
          } catch (_) {}
        });
      }
    }
    function pushPlaybackMute() {
      playbackMuteDepth += 1;
      syncMicInputEnabled();
    }
    function popPlaybackMute() {
      playbackMuteDepth = Math.max(0, playbackMuteDepth - 1);
      syncMicInputEnabled();
    }
    function clearPlaybackMute() {
      playbackMuteDepth = 0;
      syncMicInputEnabled();
    }
    function isBargePlaybackActive() {
      return Boolean(audioPlayer.isPlaying) || externalPlaybackActive;
    }
    function stopBargeIn() {
      try {
        bargeInHandle?.stop();
      } catch (_) {}
      bargeInHandle = null;
    }
    function releaseMic() {
      micEpoch += 1;
      duplexTalkover = false;
      stopBargeIn();
      if (speechDetector) {
        speechDetector.stop();
        speechDetector = null;
      }
      const recorder = mediaRecorder;
      mediaRecorder = null;
      if (recorder && recorder.state !== 'inactive') {
        try {
          if (typeof recorder.requestData === 'function' && !isAppleSpeakCaptureHost()) {
            recorder.requestData();
          }
          recorder.stop();
        } catch (_) {}
      }
      releaseRecorderStream();
      recordChunks = [];
      armedBytes = 0;
      firstChunkAt = 0;
      armStartedAt = 0;
      resolveUtterance();
      resolveRecordingWait();
      if (micSource) {
        try {
          micSource.disconnect();
        } catch (_) {}
        micSource = null;
      }
      analyser = null;
      stopStreamTracks(mediaStream);
      mediaStream = null;
      if (audioContext && audioContext.state !== 'closed') {
        try {
          void audioContext.close();
        } catch (_) {}
      }
      audioContext = null;
      emitTelemetry('mic_released', { micEpoch });
    }
    async function armRecording() {
      if (destroyed) throw micTornDownError();
      const epoch = micEpoch;
      emitTelemetry('arm_start', armedSnapshot());
      await ensureMic();
      assertMicEpoch(epoch);
      syncMicInputEnabled();
      connectMicAnalyser();
      if (mediaRecorder?.state === 'recording') {
        emitTelemetry('arm_already', armedSnapshot());
        return;
      }
      const mimeType = pickRecorderMime();
      recordChunks = [];
      armedBytes = 0;
      firstChunkAt = 0;
      armStartedAt = nowMs();
      releaseRecorderStream();
      assertMicEpoch(epoch);
      if (!mediaStream) throw micTornDownError();
      recorderStream = typeof mediaStream.clone === 'function' ? mediaStream.clone() : mediaStream;
      if (duplexTalkover) {
        await applyEchoCancellation(false);
        assertMicEpoch(epoch);
      }
      syncMicInputEnabled();
      mediaRecorder = mimeType
        ? new MediaRecorder(recorderStream, { mimeType })
        : new MediaRecorder(recorderStream);
      mediaRecorder.ondataavailable = (e) => {
        if (!e.data?.size) return;
        recordChunks.push(e.data);
        armedBytes += e.data.size;
        if (!firstChunkAt) {
          firstChunkAt = nowMs();
          emitTelemetry('first_chunk', armedSnapshot({ chunkBytes: e.data.size }));
        }
      };
      mediaRecorder.onerror = () => resolveUtterance();
      const timeslice = recorderTimesliceMs();
      if (timeslice > 0) mediaRecorder.start(timeslice);
      else mediaRecorder.start();
      await waitForEventOrTimeout(
        mediaRecorder,
        'dataavailable',
        timeslice > 0 ? policy.RECORDER_WARMUP_MS : 80,
      );
      if (epoch !== micEpoch) {
        try {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        } catch (_) {}
        mediaRecorder = null;
        releaseRecorderStream();
        throw micTornDownError();
      }
      emitTelemetry('arm_ready', armedSnapshot({ warmupMs: policy.RECORDER_WARMUP_MS }));
    }
    async function playCue(kind) {
      try {
        const ctx = await ensureAudioContext();
        await playSpeakCue(kind || 'listen', ctx);
      } catch (_) {}
    }
    return {
      get isPlaying() {
        return audioPlayer.isPlaying;
      },
      get isRecording() {
        return mediaRecorder?.state === 'recording';
      },
      get isMicMutedForPlayback() {
        return isPlaybackMutingMic();
      },
      get duplex() {
        return duplexEnabled();
      },
      getRecordPolicy() {
        return policy;
      },
      setBargePlaybackActive(active) {
        externalPlaybackActive = Boolean(active);
      },
      setDuplexTalkover,
      async unlockFromGesture() {
        await ensureAudioContext();
        await audioPlayer.unlock();
      },
      async ensureMicPermission() {
        await ensureMic();
      },
      async playBase64(base64, mime = 'audio/mpeg', opts2 = {}) {
        const forceMute = opts2.muteMic === true;
        const useDuplex = duplexEnabled() && !forceMute;
        const run = async () => {
          await ensureAudioContext();
          if (useDuplex) {
            clearPlaybackMute();
            syncMicInputEnabled();
            await setDuplexTalkover(true);
          }
          audioPlayer.resetTurnStats();
          await audioPlayer.enqueueBase64(base64, mime, opts2);
        };
        if (useDuplex) return run();
        return this.whilePlaybackMuted(run);
      },
      async whilePlaybackMuted(fn) {
        if (duplexEnabled()) {
          clearPlaybackMute();
          syncMicInputEnabled();
          return fn();
        }
        pushPlaybackMute();
        try {
          return await fn();
        } finally {
          popPlaybackMute();
        }
      },
      stopPlayback() {
        audioPlayer.stop();
        externalPlaybackActive = false;
        stopBargeIn();
        clearPlaybackMute();
      },
      stopBargeInMonitor() {
        stopBargeIn();
      },
      startBargeInMonitor(onBargeIn, bargeOpts = {}) {
        stopBargeIn();
        if (!analyser) return;
        bargeInHandle = startBargeInMonitor({
          readRms: readMicRms,
          isStillMonitoring: () => {
            if (destroyed) return false;
            if (typeof bargeOpts.isStillMonitoring === 'function') {
              return bargeOpts.isStillMonitoring();
            }
            return isBargePlaybackActive();
          },
          rmsThreshold: pickNum(bargeOpts.rmsThreshold, policy.BARGE_IN_RMS),
          onsetMs: pickNum(bargeOpts.onsetMs, policy.BARGE_IN_ONSET_MS),
          graceMs: pickNum(bargeOpts.graceMs, policy.BARGE_IN_GRACE_MS),
          bleedMargin: pickNum(bargeOpts.bleedMargin, policy.BARGE_IN_BLEED_MARGIN),
          onBargeIn: (detail = {}) => {
            emitTelemetry('barge', armedSnapshot(detail));
            onBargeIn?.(detail);
          },
        });
      },
      getArmedSnapshot() {
        return armedSnapshot();
      },
      /** Live VAD / soft-limit snapshot for host UI (null when not listening). */
      getListenSnapshot() {
        if (!speechDetector || typeof speechDetector.snapshot !== 'function') {
          return lastListenStats || null;
        }
        try {
          return { ...speechDetector.snapshot() };
        } catch (_) {
          return lastListenStats || null;
        }
      },
      /** Drop buffered TTS bleed but keep the recorder warm when possible. */
      resetArmedBuffer() {
        const before = armedSnapshot({ reason: 'reset' });
        recordChunks = [];
        armedBytes = 0;
        firstChunkAt = 0;
        emitTelemetry('reset_armed', before);
      },
      async startRecording({
        onPhaseChange,
        onNoSpeech,
        onCaptureEnded,
        silenceAfterSpeechMs,
        speechOnsetMs,
        minSpeechMs,
        minRecordMs,
        maxRecordMs,
        softMaxActiveSpeechMs,
        softPauseMs,
        softGraceMs,
        noSpeechHangupMs,
        calibrateMs,
        speechRms,
        silenceRms,
        skipListenCue = false,
        graceMs,
        preserveChunks = false,
        seedSpeech = false,
      } = {}) {
        const alreadyRecording = mediaRecorder?.state === 'recording';
        const preserved = Boolean(preserveChunks) && alreadyRecording;
        lastListenStats = null;
        emitTelemetry(
          'listen_start',
          armedSnapshot({
            preserveChunks: Boolean(preserveChunks),
            preserved,
            seedSpeech: Boolean(seedSpeech),
            graceMs: pickNum(graceMs, policy.LISTEN_GRACE_MS),
            calibrateMs: pickNum(calibrateMs, policy.CALIBRATE_MS),
          }),
        );
        if (preserved) {
          syncMicInputEnabled();
        } else {
          if (!duplexEnabled()) clearPlaybackMute();
          if (alreadyRecording && recordChunks.length) {
            emitTelemetry('listen_clear_bleed', armedSnapshot());
            recordChunks = [];
            armedBytes = 0;
            firstChunkAt = 0;
          }
          void setDuplexTalkover(false);
          await armRecording();
          syncMicInputEnabled();
        }
        if (!skipListenCue) {
          try {
            void playCue('listen');
          } catch (_) {}
        }
        const rec = mediaRecorder;
        const mimeType = resolveRecordedAudioMime(null, rec, pickRecorderMime());
        if (!rec) return null;
        if (speechDetector) {
          speechDetector.stop();
          speechDetector = null;
        }
        const stopped = new Promise((resolve) => {
          const done = () => {
            if (recordingWaitResolve === done) recordingWaitResolve = null;
            resolve();
          };
          recordingWaitResolve = done;
          rec.onstop = done;
          rec.onerror = done;
          if (rec.state === 'inactive') done();
        });
        const silenceMs = pickNum(silenceAfterSpeechMs, policy.SILENCE_AFTER_SPEECH_MS);
        const listenGraceMs = pickNum(graceMs, policy.LISTEN_GRACE_MS);
        speechDetector = createSpeechEndDetector({
          getRms: readMicRms,
          onPhaseChange,
          maxRecordMs: pickNum(maxRecordMs, policy.MAX_RECORD_MS),
          noSpeechHangupMs: pickNum(noSpeechHangupMs, policy.NO_SPEECH_HANGUP_MS),
          silenceAfterSpeechMs: silenceMs,
          softMaxActiveSpeechMs: pickNum(softMaxActiveSpeechMs, policy.SOFT_MAX_ACTIVE_SPEECH_MS),
          softPauseMs: pickNum(softPauseMs, policy.SOFT_PAUSE_MS),
          softGraceMs: pickNum(softGraceMs, policy.SOFT_GRACE_MS),
          graceMs: listenGraceMs,
          calibrateMs: pickNum(calibrateMs, policy.CALIBRATE_MS),
          speechRms: pickNum(speechRms, policy.SPEECH_RMS),
          silenceRms: pickNum(silenceRms, policy.SILENCE_RMS),
          stillSpeakingSpeechRatio: policy.STILL_SPEAKING_SPEECH_RATIO,
          stillSpeakingPeakRatio: policy.STILL_SPEAKING_PEAK_RATIO,
          speechOnsetMs: pickNum(speechOnsetMs, policy.SPEECH_ONSET_MS),
          minSpeechMs: pickNum(minSpeechMs, policy.MIN_SPEECH_MS),
          minRecordMs: pickNum(minRecordMs, policy.MIN_RECORD_MS),
          seedSpeech: Boolean(seedSpeech),
          onWatch: (snap) => {
            emitTelemetry(
              'listen_watch',
              listenStatsPayload({
                ...snap,
                endReason: 'watch',
              }),
            );
          },
          onSpeechEnd: () => {
            const reason = String(speechDetector?.endReason || '').trim() || 'pause';
            captureListenStats(reason);
            if (!stopLiveRecorder()) {
              try {
                rec.onstop?.();
              } catch (_) {}
              resolveRecordingWait();
            }
          },
          onNoSpeech: () => {
            captureListenStats('no_speech');
            recordChunks = [];
            if (!stopLiveRecorder()) {
              try {
                rec.onstop?.();
              } catch (_) {}
              resolveRecordingWait();
            }
            onNoSpeech?.();
          },
        });
        speechDetector.start();
        await stopped;
        if (isAppleSpeakCaptureHost() && rec) {
          await waitForEventOrTimeout(rec, 'dataavailable', 500);
        }
        recordingWaitResolve = null;
        captureListenStats('stop');
        if (speechDetector) {
          speechDetector.stop();
          speechDetector = null;
        }
        const listenStats = listenStatsPayload();
        if (mediaRecorder === rec) mediaRecorder = null;
        releaseRecorderStream();
        if (mediaStream?.active) {
          connectMicAnalyser();
          void setDuplexTalkover(false);
        }
        if (typeof onCaptureEnded === 'function') {
          try {
            onCaptureEnded({ ...listenStats });
          } catch (_) {}
        }
        const chunks = [...recordChunks];
        recordChunks = [];
        const bytes = armedBytes;
        armedBytes = 0;
        const armedMs = armStartedAt ? Math.round(nowMs() - armStartedAt) : 0;
        armStartedAt = 0;
        firstChunkAt = 0;
        const resolvedMime = resolveRecordedAudioMime(chunks[0], rec, mimeType);
        if (!chunks.length) {
          emitTelemetry('listen_empty', {
            preserved,
            bytes: 0,
            armedMs,
            mimeType: resolvedMime,
            ...listenStats,
          });
          return {
            audioBase64: '',
            mimeType: resolvedMime,
            noSpeech: true,
            ...listenStats,
          };
        }
        const blob = new Blob(chunks, { type: resolvedMime });
        const audioBase64 = await blobToBase64(blob);
        emitTelemetry('listen_stop', {
          preserved,
          chunkCount: chunks.length,
          bytes: blob.size || bytes,
          armedMs,
          mimeType: resolvedMime,
          base64Chars: audioBase64?.length || 0,
          ...listenStats,
        });
        return {
          audioBase64,
          mimeType: resolvedMime,
          ...listenStats,
        };
      },
      stopRecording({ discard = false } = {}) {
        emitTelemetry('stop_recording', armedSnapshot({ discard: Boolean(discard) }));
        if (discard) {
          recordChunks = [];
          armedBytes = 0;
          firstChunkAt = 0;
          emitTelemetry('listen_discard', armedSnapshot());
        }
        forceFinishRecording();
      },
      getMicRms: readMicRms,
      playCue,
      armRecording,
      releaseMic,
      destroy() {
        destroyed = true;
        externalPlaybackActive = false;
        stopBargeIn();
        audioPlayer.stop();
        releaseMic();
      },
    };
  }

  // src/policies/transcriptQuality.js
  var SPEAK_LISTEN_AGAIN_LINE = "Sorry, I didn't catch that. Try once more.";
  var SPEAK_GOODBYE_LINE = 'Okay, goodbye. Touch Speak to talk.';
  var SPEAK_GARBLED_GIVE_UP_LINE = SPEAK_GOODBYE_LINE;
  function normalizeTranscriptForCompare(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/["""`']/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function normalizeStopIntent(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/["""`]/g, '')
      .replace(/[^\p{L}\p{N}\s']/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function isNoiseToken(token) {
    const t = String(token || '');
    if (!t) return false;
    if (t.length >= 6 && /^(.)\1+$/.test(t)) return true;
    if (t.length >= 6 && /^[.\-…]+$/.test(t)) return true;
    const letters = t.replace(/[^a-z]/gi, '');
    if (letters.length >= 6 && !/[aeiouy]/i.test(letters)) return true;
    return false;
  }
  function stemNoiseWord(token) {
    return String(token || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '')
      .replace(/(.)\1+$/g, '$1');
  }
  function isRepetitiveFillerTranscript(normalized) {
    const tokens = String(normalized || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length < 3) return false;
    const stems = tokens.map(stemNoiseWord).filter(Boolean);
    if (stems.length < 3) return false;
    const counts = /* @__PURE__ */ new Map();
    for (const stem of stems) {
      counts.set(stem, (counts.get(stem) || 0) + 1);
    }
    const max = Math.max(...counts.values());
    if (max >= 3 && max / stems.length >= 0.6) return true;
    if (counts.size <= 2 && max >= 2 && stems.length >= 3) return true;
    return false;
  }
  var AMBIENT_HALLUCINATION = new RegExp(
    '^(?:thanks?\\s+for\\s+watching|thank\\s+you\\s+for\\s+watching|thank\\s+you|thanks|i\\s+love\\s+you|you\\s+share|subscribe(?:\\s+please)?|bye(?:\\s+bye)?|good\\s*bye|hi|hello|hey|silence|blank\\s+audio|inaudible|\\[silence\\]|\\.{2,}|\u2026+)$',
    'i',
  );
  function isAmbientRoomEnergy(meta = {}, opts = {}) {
    if (!meta || typeof meta !== 'object') return false;
    const silence = Number(opts.silenceRms) > 0 ? Number(opts.silenceRms) : 0.018;
    const floor = Number(meta.noiseFloor);
    const peak = Number(meta.peakListenRms || meta.peakRms || meta.peakSpeechRms);
    if (Number.isFinite(floor) && floor >= silence) return true;
    if (Number.isFinite(peak) && peak >= silence) return true;
    return false;
  }
  function isLowEnergySpeech(meta = {}, opts = {}) {
    const peak = Number(meta?.peakSpeechRms);
    if (!Number.isFinite(peak) || peak <= 0) return false;
    const floor = Number(meta?.noiseFloor);
    const speechRms = Number(opts.speechRms) > 0 ? Number(opts.speechRms) : 0.028;
    const minAboveFloor = Number.isFinite(Number(opts.minAboveFloor))
      ? Number(opts.minAboveFloor)
      : 0.022;
    const minPeak = Number(opts.minPeakRms) > 0 ? Number(opts.minPeakRms) : speechRms * 1.35;
    if (Number.isFinite(floor) && minAboveFloor > 0 && peak < floor + minAboveFloor) return true;
    if (peak < minPeak) return true;
    return false;
  }
  function isWeakTranscript(text) {
    const t = String(text || '').trim();
    if (!t) return true;
    if (t.length < 3) return true;
    const normalized = t
      .replace(/["""`']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (normalized.length < 3) return true;
    const bare = normalized
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (isListenAgainPrompt(normalized) || isListenAgainPrompt(bare)) return true;
    if (/^(um+|uh+|mm+|hmm+|ah+|eh+|oh+|er+|huh)([.,!?…]*|$)/i.test(normalized)) return true;
    if (AMBIENT_HALLUCINATION.test(bare)) return true;
    if (
      /^(i('m| am|m)?\s+(just\s+)?thinking|thinking([.]{2,}|…)?|you('re| are|re)\s+(on\s+)?mute)$/i.test(
        bare,
      )
    ) {
      return true;
    }
    if (isRepetitiveFillerTranscript(normalized) || isRepetitiveFillerTranscript(bare)) return true;
    const compact = bare.replace(/\s+/g, '') || normalized.replace(/\s+/g, '');
    if (compact.length >= 6 && /^(.)\1+$/.test(compact)) return true;
    if (/^[.\-…\s]+$/.test(normalized)) return true;
    const letterCount = (normalized.match(/\p{L}/gu) || []).length;
    if (normalized.length >= 6 && letterCount / normalized.length < 0.35) return true;
    const tokens = bare.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length && tokens.every(isNoiseToken)) return true;
    if (tokens.some((tok) => tok.length >= 8 && isNoiseToken(tok))) return true;
    return false;
  }
  function isStopIntent(text) {
    let s = normalizeStopIntent(text);
    if (!s) return false;
    s = s
      .replace(/^(ok|okay|alright|all right)\s+/i, '')
      .replace(/^please\s+/i, '')
      .replace(/\s+(please|thanks|thank you)$/i, '')
      .replace(/^please\s+/i, '')
      .trim();
    if (!s) return false;
    const phrases = /* @__PURE__ */ new Set([
      'goodbye',
      'good bye',
      'bye',
      'bye bye',
      'see you',
      'see ya',
      'talk later',
      'catch you later',
      'stop',
      'stop talking',
      'stop listening',
      'quit',
      'exit',
      'hang up',
      'cancel',
      "i'm done",
      'i am done',
      "we're done",
      'we are done',
      "that's all",
      'that is all',
      "that'll be all",
      'that will be all',
      "that's it",
      'that is it',
      'end conversation',
      'end the conversation',
      'end session',
      'end the session',
      'end call',
      'end the call',
    ]);
    return phrases.has(s);
  }
  function isListenAgainPrompt(text, retryLine = SPEAK_LISTEN_AGAIN_LINE) {
    const n = normalizeTranscriptForCompare(text);
    if (!n) return false;
    const target = normalizeTranscriptForCompare(retryLine || SPEAK_LISTEN_AGAIN_LINE);
    if (n === target) return true;
    if (n.length >= 12 && (target.includes(n) || n.includes(target))) return true;
    if (n.length <= 80 && /sorry/.test(n) && /catch that/.test(n)) return true;
    if (n.length <= 80 && /sorry/.test(n) && /try once more/.test(n)) return true;
    if (
      n.length <= 96 &&
      /sorry/.test(n) &&
      /(?:did not get that|didnt get that|catch that)/.test(n)
    ) {
      return true;
    }
    if (n.length <= 96 && /sorry/.test(n) && /try again/.test(n)) return true;
    return false;
  }
  function extractStopIntent(text, lastAssistantText = '', matchStop) {
    const match = typeof matchStop === 'function' ? matchStop : isStopIntent;
    const customMatch = typeof matchStop === 'function' && matchStop !== isStopIntent;
    const raw = String(text || '').trim();
    if (!raw) return '';
    const assistant = String(lastAssistantText || '').trim();
    if (assistant) {
      const rawN = normalizeTranscriptForCompare(raw);
      const asstN = normalizeTranscriptForCompare(assistant);
      if (rawN && asstN && (rawN === asstN || (asstN.includes(rawN) && rawN.length >= 6))) {
        return '';
      }
    }
    if (match(raw)) {
      return (
        normalizeStopIntent(raw)
          .replace(/^(ok|okay|alright|all right)\s+/i, '')
          .replace(/^please\s+/i, '')
          .replace(/\s+(please|thanks|thank you)$/i, '')
          .replace(/^please\s+/i, '')
          .trim() || 'stop'
      );
    }
    if (assistant) {
      const trimmed = trimPlaybackEcho(raw, assistant);
      if (trimmed && match(trimmed)) {
        return extractStopIntent(trimmed, '', matchStop);
      }
    }
    if (customMatch) return '';
    let s = normalizeStopIntent(raw);
    if (!s) return '';
    s = s
      .replace(/^(ok|okay|alright|all right)\s+/i, '')
      .replace(/^please\s+/i, '')
      .replace(/\s+(please|thanks|thank you)$/i, '')
      .replace(/^please\s+/i, '')
      .trim();
    const phrases = [
      'catch you later',
      'talk later',
      'stop talking',
      'stop listening',
      'end the conversation',
      'end conversation',
      'end the session',
      'end session',
      'end the call',
      'end call',
      'good bye',
      'bye bye',
      'see you',
      'see ya',
      'hang up',
      "that'll be all",
      'that will be all',
      "that's all",
      'that is all',
      "that's it",
      'that is it',
      "i'm done",
      'i am done',
      "we're done",
      'we are done',
      'goodbye',
      'cancel',
      'quit',
      'exit',
      'stop',
      'bye',
    ];
    const spokenNorm = assistant ? normalizeTranscriptForCompare(assistant) : '';
    const assistantStop = assistant ? normalizeStopIntent(assistant) : '';
    for (const phrase of phrases) {
      if (s === phrase) return phrase;
      if (!s.endsWith(` ${phrase}`)) continue;
      const before = s.slice(0, -(phrase.length + 1)).trim();
      if (!before) return phrase;
      if (
        assistantStop &&
        (assistantStop === phrase ||
          assistantStop.endsWith(` ${phrase}`) ||
          assistantStop.includes(` ${phrase} `) ||
          assistantStop.startsWith(`${phrase} `))
      ) {
        continue;
      }
      const beforeNorm = normalizeTranscriptForCompare(before);
      if (
        spokenNorm &&
        (isLikelyPlaybackEcho(before, assistant) ||
          spokenNorm.includes(beforeNorm) ||
          beforeNorm.includes(spokenNorm.slice(0, Math.min(spokenNorm.length, beforeNorm.length))))
      ) {
        return phrase;
      }
      if (
        before.split(/\s+/).length <= 2 &&
        before.length <= 12 &&
        !/^(you|he|she|they|we)\s+said$/i.test(before)
      ) {
        return phrase;
      }
    }
    return '';
  }
  function isLikelyPlaybackEcho(userText, lastAssistantText) {
    const user = normalizeTranscriptForCompare(userText);
    const spoken = normalizeTranscriptForCompare(lastAssistantText);
    if (!user || !spoken || user.length < 18) return false;
    if (
      spoken.includes(user) ||
      user.includes(spoken.slice(0, Math.min(spoken.length, user.length + 12)))
    ) {
      return true;
    }
    const userTokens = user.split(' ').filter((w) => w.length > 3);
    if (userTokens.length < 4) return false;
    const spokenSet = new Set(spoken.split(' ').filter((w) => w.length > 3));
    let overlap = 0;
    for (const token of userTokens) {
      if (spokenSet.has(token)) overlap += 1;
    }
    return overlap / userTokens.length >= 0.72;
  }
  function trimPlaybackEcho(userText, lastAssistantText) {
    const user = normalizeTranscriptForCompare(userText);
    const spoken = normalizeTranscriptForCompare(lastAssistantText);
    if (!user || !spoken) return '';
    if (user === spoken) return '';
    if (spoken.includes(user) && user.length <= spoken.length) return '';
    if (user.startsWith(spoken)) {
      return user.slice(spoken.length).trim();
    }
    if (user.includes(spoken)) {
      return user.replace(spoken, ' ').replace(/\s+/g, ' ').trim();
    }
    const spokenTokens = spoken.split(' ').filter(Boolean);
    const userTokens = user.split(' ').filter(Boolean);
    let i = 0;
    while (i < spokenTokens.length && i < userTokens.length && spokenTokens[i] === userTokens[i]) {
      i += 1;
    }
    if (i >= 4 && i < userTokens.length) {
      return userTokens.slice(i).join(' ');
    }
    return '';
  }
  function mergeEarlyAnswer(liveText, sttText, lastAssistantText = '') {
    const rawLive = String(liveText || '').trim();
    const rawStt = String(sttText || '').trim();
    const assistant = String(lastAssistantText || '').trim();
    const clean2 = (text) => {
      const t = String(text || '').trim();
      if (!t) return '';
      if (assistant && isLikelyPlaybackEcho(t, assistant)) {
        return trimPlaybackEcho(t, assistant);
      }
      const trimmed = assistant ? trimPlaybackEcho(t, assistant) : '';
      return trimmed || t;
    };
    const live = clean2(rawLive);
    const stt = clean2(rawStt);
    if (!live) return stt;
    if (!stt) return live;
    const nl = normalizeTranscriptForCompare(live);
    const ns = normalizeTranscriptForCompare(stt);
    if (!nl) return stt;
    if (!ns) return live;
    if (ns.includes(nl)) return stt;
    if (nl.includes(ns)) return live;
    const liveWords = nl.split(' ').filter(Boolean);
    const sttWords = ns.split(' ').filter(Boolean);
    let overlap = 0;
    for (let k = Math.min(liveWords.length, sttWords.length); k >= 1; k -= 1) {
      if (liveWords.slice(-k).join(' ') === sttWords.slice(0, k).join(' ')) {
        overlap = k;
        break;
      }
    }
    if (overlap > 0 && overlap < liveWords.length) {
      const head = liveWords.slice(0, liveWords.length - overlap).join(' ');
      return `${head} ${stt}`.replace(/\s+/g, ' ').trim();
    }
    if (liveWords.length && !sttWords.includes(liveWords[0])) {
      return `${live} ${stt}`.replace(/\s+/g, ' ').trim();
    }
    return live.length >= stt.length ? live : stt;
  }

  // src/policies/recoveryPolicy.js
  var SpeakRecoveryPolicy = Object.freeze({
    weakTranscriptMaxAttempts: 2,
    retryLine: SPEAK_LISTEN_AGAIN_LINE,
    giveUpLine: SPEAK_GOODBYE_LINE,
    giveUpEndsSession: true,
    missLine: 'I missed that \u2014 try once more.',
    /** When false, weak transcripts re-listen silently (no spoken retry / give-up speech). */
    spokenWeakRetry: true,
  });
  function mergeSpeakRecoveryPolicy(overrides) {
    const next = { ...SpeakRecoveryPolicy };
    if (!overrides || typeof overrides !== 'object') return Object.freeze(next);
    if (overrides.weakTranscript && typeof overrides.weakTranscript === 'object') {
      const nested = overrides.weakTranscript;
      if (nested.maxAttempts != null) next.weakTranscriptMaxAttempts = nested.maxAttempts;
      if (nested.retryLine != null) next.retryLine = nested.retryLine;
      if (nested.giveUpLine != null) next.giveUpLine = nested.giveUpLine;
      if (nested.response != null) next.retryLine = nested.response;
      if (nested.giveUpEndsSession != null)
        next.giveUpEndsSession = nested.giveUpEndsSession !== false;
    }
    for (const key of Object.keys(SpeakRecoveryPolicy)) {
      if (overrides[key] == null || overrides[key] === '') continue;
      if (key === 'weakTranscriptMaxAttempts') {
        const n = Number(overrides[key]);
        if (Number.isFinite(n) && n >= 1) next[key] = n;
        continue;
      }
      if (key === 'giveUpEndsSession' || key === 'spokenWeakRetry') {
        next[key] = overrides[key] !== false;
        continue;
      }
      next[key] = String(overrides[key]);
    }
    return Object.freeze(next);
  }
  function decideWeakTranscriptRecovery({
    speakSorry = false,
    consecutiveStrikes = 0,
    policy = SpeakRecoveryPolicy,
  } = {}) {
    const merged = mergeSpeakRecoveryPolicy(policy);
    if (!speakSorry) {
      return {
        action: 'silent',
        line: merged.retryLine,
        strikes: consecutiveStrikes,
      };
    }
    const strikes = consecutiveStrikes + 1;
    if (strikes >= merged.weakTranscriptMaxAttempts) {
      return {
        action: 'give_up',
        line: merged.giveUpLine,
        strikes,
      };
    }
    return {
      action: 'retry_speech',
      line: merged.retryLine,
      strikes,
    };
  }

  // src/diagnostics/types.js
  var SpeakDiagnosticType = Object.freeze({
    TRANSITION: 'transition',
    ERROR: 'error',
    RECOVERY: 'recovery',
    TIMING: 'timing',
    RECORDING: 'recording',
    PLAYBACK: 'playback',
    HEAR: 'hear',
    VISIBILITY: 'visibility',
    WATCHDOG: 'watchdog',
    STALE: 'stale',
    SESSION: 'session',
  });
  function createDiagnostic(partial = {}) {
    return {
      type: String(partial.type || SpeakDiagnosticType.SESSION),
      timestamp: Number(partial.timestamp) || Date.now(),
      sessionId: String(partial.sessionId || ''),
      runToken: Number(partial.runToken) || 0,
      previousPhase: partial.previousPhase == null ? '' : String(partial.previousPhase),
      event: partial.event == null ? '' : String(partial.event),
      nextPhase: partial.nextPhase == null ? '' : String(partial.nextPhase),
      detail: partial.detail && typeof partial.detail === 'object' ? { ...partial.detail } : {},
    };
  }

  // src/controller/duplexTurn.js
  function createDuplexTurn() {
    return {
      preserveRecordingAcrossBarge: false,
      bargeLatch: false,
      capturedStopIntent: '',
      finishListenForStopIntent: false,
      earlyLiveSpeech: null,
      turn: null,
      playbackRate: void 0,
      startTurn({ question, messageId }) {
        this.bargeLatch = false;
        this.turn = {
          question: String(question || ''),
          messageId: String(messageId || ''),
          questionStartedAt: Date.now(),
          barged: false,
          bargeAt: null,
          bargeDetail: {},
          listenStartedAt: null,
          recordFinishedAt: null,
        };
        return this.turn;
      },
      noteBarge(detail = {}) {
        this.bargeLatch = true;
        if (!this.turn) return;
        this.turn.barged = true;
        this.turn.bargeAt = Date.now();
        this.turn.bargeDetail = { ...detail };
      },
      noteListen() {
        if (this.turn) this.turn.listenStartedAt = Date.now();
      },
      noteRecordEnd() {
        if (this.turn) this.turn.recordFinishedAt = Date.now();
      },
      consumePreserve() {
        const keep = this.preserveRecordingAcrossBarge;
        this.preserveRecordingAcrossBarge = false;
        return keep;
      },
      clearTurn() {
        this.turn = null;
      },
      resetSessionFlags() {
        this.preserveRecordingAcrossBarge = false;
        this.bargeLatch = false;
        this.capturedStopIntent = '';
        this.finishListenForStopIntent = false;
        this.earlyLiveSpeech = null;
        this.playbackRate = void 0;
      },
    };
  }

  // src/controller/liveSpeech.js
  function createLiveSpeech(ctx) {
    function trackLiveSpeech(handle) {
      if (!handle || typeof handle.stop !== 'function') return handle;
      ctx.liveSpeechHandles.add(handle);
      const innerStop = handle.stop.bind(handle);
      handle.stop = async (...args) => {
        ctx.liveSpeechHandles.delete(handle);
        return innerStop(...args);
      };
      return handle;
    }
    function abortAllLiveSpeech() {
      ctx.duplex.earlyLiveSpeech = null;
      const handles = [...ctx.liveSpeechHandles];
      ctx.liveSpeechHandles.clear();
      for (const handle of handles) {
        try {
          void handle.stop?.();
        } catch (_) {}
      }
    }
    function beginLiveSpeech(token) {
      if (!ctx.startLiveSpeech) return null;
      let stopIntentCut = false;
      const handle = ctx.startLiveSpeech({
        onLiveTranscript(text, info = {}) {
          if (stopIntentCut || ctx.isStale(token) || ctx.disposed) return;
          const phase = ctx.state.phase;
          if (phase !== SpeakPhase.LISTENING && phase !== SpeakPhase.SPEAKING) return;
          if (phase === SpeakPhase.SPEAKING && ctx.lastSpokenText) {
            const rawN = String(text || '')
              .toLowerCase()
              .replace(/["""`']/g, '')
              .replace(/[^\p{L}\p{N}\s]/gu, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            const spokenN = String(ctx.lastSpokenText || '')
              .toLowerCase()
              .replace(/["""`']/g, '')
              .replace(/[^\p{L}\p{N}\s]/gu, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (rawN && spokenN && spokenN.includes(rawN)) {
              return;
            }
          }
          const extracted = extractStopIntent(text, ctx.lastSpokenText, ctx.isStopIntent);
          if (!extracted) return;
          stopIntentCut = true;
          ctx.duplex.capturedStopIntent = extracted;
          ctx.emitDiag({
            type: SpeakDiagnosticType.RECORDING,
            event: 'STOP_INTENT_LIVE',
            detail: {
              text: extracted,
              raw: String(text || '').slice(0, 120),
              isFinal: info?.isFinal !== false,
              phase,
            },
          });
          if (phase === SpeakPhase.SPEAKING) {
            ctx.duplex.bargeLatch = true;
            ctx.duplex.finishListenForStopIntent = true;
            if (ctx.recordPolicy.DUPLEX !== 0 && ctx.recordPolicy.DUPLEX !== false) {
              ctx.duplex.preserveRecordingAcrossBarge = true;
            }
            ctx.cancelActiveTurnTransport('stop_intent');
            try {
              ctx.media.stopPlayback();
            } catch (_) {}
            ctx.duplex.noteBarge({ via: 'stop_intent', text: extracted });
            ctx.dispatch({ type: SpeakEvent.INTERRUPT });
            ctx.emitDiag({
              type: SpeakDiagnosticType.PLAYBACK,
              event: SpeakEvent.INTERRUPT,
              detail: {
                via: 'stop_intent',
                duplex: true,
                preserve: true,
                question: ctx.lastSpokenText || '',
                text: extracted,
              },
            });
            return;
          }
          try {
            ctx.media.stopRecording({ discard: false });
          } catch (_) {}
        },
      });
      return trackLiveSpeech(handle);
    }
    return { trackLiveSpeech, abortAllLiveSpeech, beginLiveSpeech };
  }

  // src/controller/recovery.js
  function createRecovery(ctx) {
    async function dispatchListenAgain(message, category) {
      ctx.emitDiag({
        type: SpeakDiagnosticType.RECOVERY,
        event: SpeakEvent.LISTEN_AGAIN,
        detail: { category: category || '', message: message || '', spoken: false },
      });
      ctx.dispatch({
        type: SpeakEvent.LISTEN_AGAIN,
        message: message || ctx.recoveryPolicy.retryLine,
        category: category || '',
      });
      return true;
    }
    async function speakListenAgain(message, category) {
      const line =
        String(message || ctx.recoveryPolicy.retryLine).trim() || ctx.recoveryPolicy.retryLine;
      ctx.lastError = line;
      const spoken = ctx.state.hear !== false;
      ctx.emitDiag({
        type: SpeakDiagnosticType.RECOVERY,
        event: SpeakEvent.LISTEN_AGAIN,
        detail: {
          category: category || '',
          message: line,
          spoken,
        },
      });
      if (!spoken) {
        ctx.dispatch({
          type: SpeakEvent.LISTEN_AGAIN,
          message: line,
          category: category || '',
        });
        return true;
      }
      ctx.dispatch({
        type: SpeakEvent.RECOVER_WITH_SPEECH,
        messageId: `listen-again-${Date.now()}`,
        text: line,
        message: line,
        category: category || '',
        speak: true,
      });
      return true;
    }
    async function speakGarbledGiveUp(category) {
      const line = ctx.recoveryPolicy.giveUpLine;
      ctx.lastError = line;
      const spoken = ctx.state.hear !== false;
      ctx.emitDiag({
        type: SpeakDiagnosticType.RECOVERY,
        event: 'GARBLED_GIVE_UP',
        detail: {
          category: category || '',
          message: line,
          spoken,
          strikes: ctx.recoveryPolicy.weakTranscriptMaxAttempts,
        },
      });
      if (!spoken) {
        ctx.pendingEndSession = false;
        ctx.dispatch({
          type: SpeakEvent.LISTEN_AGAIN,
          message: line,
          category: category || 'garbled_give_up',
        });
        if (ctx.recoveryPolicy.giveUpEndsSession) {
          ctx.stopSession({ playQuitCue: true });
        }
        return true;
      }
      if (!ctx.recoveryPolicy.giveUpEndsSession) {
        return speakListenAgain(line, category || 'garbled_give_up');
      }
      ctx.lastResponse = line;
      ctx.pendingEndSession = true;
      ctx.dispatch({
        type: SpeakEvent.END_WITH_SPEECH,
        messageId: `garbled-end-${Date.now()}`,
        text: line,
        message: line,
        category: category || 'garbled_give_up',
        speak: true,
      });
      return true;
    }
    function shouldSpeakSorryForTranscript(
      transcript,
      { heardSpeech = false, noSpeech = false } = {},
    ) {
      if (noSpeech || !heardSpeech) return false;
      const t = String(transcript || '').trim();
      if (isListenAgainPrompt(t, ctx.recoveryPolicy.retryLine)) return false;
      return isWeakTranscript(t);
    }
    async function recoverMiss(category, { speakSorry = false } = {}) {
      if (ctx.finishFlushEndIfRequested?.()) return true;
      const allowSpoken = ctx.recoveryPolicy.spokenWeakRetry !== false;
      const decision = decideWeakTranscriptRecovery({
        speakSorry: allowSpoken && speakSorry,
        consecutiveStrikes: ctx.consecutiveGarbledStrikes,
        policy: ctx.recoveryPolicy,
      });
      if (decision.action === 'silent') {
        ctx.lastError = decision.line;
        return dispatchListenAgain(decision.line, category || 'no_speech');
      }
      ctx.consecutiveGarbledStrikes = decision.strikes;
      if (decision.action === 'give_up') {
        ctx.consecutiveGarbledStrikes = 0;
        return speakGarbledGiveUp(category);
      }
      return speakListenAgain(decision.line, category);
    }
    return {
      dispatchListenAgain,
      speakListenAgain,
      speakGarbledGiveUp,
      shouldSpeakSorryForTranscript,
      recoverMiss,
    };
  }

  // src/policies/speakUnits.js
  function splitSpeakUnits(text) {
    const clean2 = String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean2) return [];
    const parts = clean2.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
    if (!parts || parts.length <= 1) return [clean2];
    const units = [];
    let buf = '';
    for (const raw of parts) {
      const part = String(raw || '').trim();
      if (!part) continue;
      if (buf && (buf.length < 28 || part.length < 12)) {
        buf = `${buf} ${part}`.trim();
        if (buf.length >= 40 || /[.!?]$/.test(part)) {
          units.push(buf);
          buf = '';
        }
        continue;
      }
      if (buf) units.push(buf);
      buf = part;
    }
    if (buf) units.push(buf);
    return units.length ? units : [clean2];
  }

  // src/controller/util.js
  function isAbortError(err) {
    return err?.name === 'AbortError' || err?.category === 'ended';
  }
  function raceTimeout(promise, ms, label, timers) {
    const setT = timers?.setTimeout || setTimeout;
    const clearT = timers?.clearTimeout || clearTimeout;
    let timer = null;
    return Promise.race([
      Promise.resolve(promise).finally(() => {
        if (timer) clearT(timer);
      }),
      new Promise((_, reject) => {
        timer = setT(() => {
          reject(Object.assign(new Error(`${label} timed out`), { category: `${label}_timeout` }));
        }, ms);
      }),
    ]);
  }

  // src/controller/speaking.js
  function createSpeaking(ctx) {
    function abortSpeechWarm() {
      try {
        ctx.warmAbort?.abort();
      } catch (_) {}
      ctx.warmAbort = null;
      ctx.warmPromise = null;
      ctx.prefetchedSpeech = null;
    }
    function beginSpeechWarm() {
      const opening = ctx.resolveAssistantSpeech?.();
      const text = String(opening?.text || '').trim();
      if (!text) {
        ctx.warmPromise = Promise.resolve(null);
        return ctx.warmPromise;
      }
      const messageId = String(opening?.id || text.slice(0, 40) || `msg-${Date.now()}`);
      const units = splitSpeakUnits(text);
      const firstUnit = units[0] || text;
      if (ctx.prefetchedSpeech?.messageId === messageId && ctx.prefetchedSpeech.tts) {
        ctx.warmPromise = Promise.resolve(ctx.prefetchedSpeech);
        return ctx.warmPromise;
      }
      abortSpeechWarm();
      ctx.warmAbort = new AbortController();
      const { signal } = ctx.warmAbort;
      ctx.warmPromise = ctx
        .synthesizeSpeech(firstUnit, { signal })
        .then((tts) => {
          if (signal.aborted) return null;
          ctx.prefetchedSpeech = { messageId, unitIndex: 0, tts };
          ctx.emitDiag({
            type: SpeakDiagnosticType.PLAYBACK,
            event: 'TTS_PREFETCH_READY',
            detail: { messageId, units: units.length },
          });
          return ctx.prefetchedSpeech;
        })
        .catch((err) => {
          if (isAbortError(err)) return null;
          ctx.emitDiag({
            type: SpeakDiagnosticType.ERROR,
            event: 'TTS_PREFETCH_FAILED',
            detail: { category: 'tts' },
          });
          return null;
        });
      return ctx.warmPromise;
    }
    async function resolveWarmedSpeech() {
      if (ctx.prefetchedSpeech?.tts) return ctx.prefetchedSpeech;
      if (!ctx.warmPromise) beginSpeechWarm();
      const warmed = await ctx.warmPromise;
      return warmed || ctx.prefetchedSpeech;
    }
    async function speakCurrentText(token, { text, messageId, playbackRate } = {}) {
      const spokenText = String(text || '').trim();
      const id = String(messageId || spokenText.slice(0, 40) || `msg-${Date.now()}`);
      let settled = false;
      let barged = false;
      ctx.duplex.bargeLatch = false;
      const isRecoverySpeak =
        id.startsWith('listen-again') || id.startsWith('garbled-end') || id.startsWith('ask-end');
      const duplex =
        !isRecoverySpeak &&
        !ctx.pendingEndSession &&
        ctx.recordPolicy.DUPLEX !== 0 &&
        ctx.recordPolicy.DUPLEX !== false;
      if (spokenText) ctx.lastSpokenText = spokenText;
      const rate = playbackRate ?? ctx.duplex.playbackRate;
      const leaveSpeaking = (reason = 'finished') => {
        if (settled) return;
        settled = true;
        try {
          ctx.media.stopBargeInMonitor?.();
        } catch (_) {}
        if (ctx.pendingEndSession) {
          ctx.pendingEndSession = false;
          ctx.abortAllLiveSpeech();
          try {
            void ctx.media.setDuplexTalkover?.(false);
          } catch (_) {}
          try {
            ctx.media.resetArmedBuffer?.();
          } catch (_) {}
          ctx.duplex.preserveRecordingAcrossBarge = false;
          ctx.lastSpokenText = spokenText;
          ctx.emitDiag({
            type: SpeakDiagnosticType.SESSION,
            event: 'SESSION_ENDED',
            detail: {
              endSession: true,
              spokeFarewell: true,
              reason: String(reason || 'finished'),
            },
          });
          ctx.stopSession({ playQuitCue: false });
          return;
        }
        if (ctx.isStale(token) || ctx.state.phase !== SpeakPhase.SPEAKING) return;
        if (!barged && !ctx.duplex.bargeLatch) {
          try {
            ctx.media.resetArmedBuffer?.();
          } catch (_) {}
          ctx.duplex.preserveRecordingAcrossBarge = false;
          ctx.abortAllLiveSpeech();
          try {
            void ctx.media.setDuplexTalkover?.(false);
          } catch (_) {}
        }
        ctx.lastSpokenText = spokenText;
        ctx.dispatch({
          type: SpeakEvent.PLAYBACK_FINISHED,
          messageId: id,
          text: spokenText,
        });
        ctx.emitDiag({
          type: SpeakDiagnosticType.PLAYBACK,
          event: SpeakEvent.PLAYBACK_FINISHED,
          detail: {
            messageId: id,
            reason: String(reason || 'finished'),
            question: spokenText,
            barged: Boolean(barged || ctx.duplex.bargeLatch),
            msSpoken:
              ctx.duplex.turn?.questionStartedAt != null
                ? Math.round(Date.now() - ctx.duplex.turn.questionStartedAt)
                : null,
          },
        });
      };
      if (!spokenText || shouldSkipPlayback(ctx.state)) {
        leaveSpeaking('skip');
        return;
      }
      if (ctx.state.lastSpokenMessageId && ctx.state.lastSpokenMessageId === id) {
        leaveSpeaking('already_spoken');
        return;
      }
      ctx.duplex.startTurn({ question: spokenText, messageId: id });
      ctx.emitDiag({
        type: SpeakDiagnosticType.PLAYBACK,
        event: 'QUESTION_START',
        detail: {
          question: spokenText,
          messageId: id,
          duplex: Boolean(duplex),
        },
      });
      ctx.dispatch({ type: SpeakEvent.PLAYBACK_STARTED, messageId: id });
      if (ctx.isStale(token)) return;
      const units = splitSpeakUnits(spokenText);
      ctx.emitDiag({
        type: SpeakDiagnosticType.PLAYBACK,
        event: 'SENTENCE_STREAM_START',
        detail: { messageId: id, units: units.length, question: spokenText },
      });
      try {
        await raceTimeout(
          (async () => {
            await ctx.media.unlockFromGesture();
            if (duplex) {
              try {
                await ctx.media.ensureMicPermission?.();
                try {
                  await ctx.media.setDuplexTalkover?.(true);
                } catch (_) {}
                void ctx.media.armRecording?.().catch(() => {});
                if (ctx.startLiveSpeech && !ctx.duplex.earlyLiveSpeech) {
                  ctx.duplex.earlyLiveSpeech = ctx.beginLiveSpeech(token);
                  ctx.emitDiag({
                    type: SpeakDiagnosticType.RECORDING,
                    event: 'EARLY_LIVE_START',
                    detail: { question: spokenText },
                  });
                }
              } catch (_) {}
            }
            const onBargeIn = (bargeDetail = {}) => {
              if (barged) return;
              barged = true;
              ctx.duplex.bargeLatch = true;
              settled = true;
              if (duplex) ctx.duplex.preserveRecordingAcrossBarge = true;
              ctx.cancelActiveTurnTransport('barge_in');
              ctx.media.stopPlayback();
              const armed =
                typeof ctx.media.getArmedSnapshot === 'function'
                  ? ctx.media.getArmedSnapshot()
                  : {};
              ctx.duplex.noteBarge(bargeDetail);
              ctx.dispatch({ type: SpeakEvent.INTERRUPT });
              ctx.emitDiag({
                type: SpeakDiagnosticType.PLAYBACK,
                event: SpeakEvent.INTERRUPT,
                detail: {
                  via: 'barge_in',
                  duplex: Boolean(duplex),
                  preserve: Boolean(duplex),
                  question: spokenText,
                  msToBarge:
                    ctx.duplex.turn?.questionStartedAt != null
                      ? Math.round(Date.now() - ctx.duplex.turn.questionStartedAt)
                      : null,
                  ...armed,
                  ...bargeDetail,
                },
              });
            };
            ctx.media.startBargeInMonitor?.(onBargeIn, {
              rmsThreshold: ctx.recordPolicy.BARGE_IN_RMS,
              onsetMs: ctx.recordPolicy.BARGE_IN_ONSET_MS,
              graceMs: ctx.recordPolicy.BARGE_IN_GRACE_MS,
              bleedMargin: ctx.recordPolicy.BARGE_IN_BLEED_MARGIN,
            });
            const takePrefetch = (unitIndex) => {
              if (
                ctx.prefetchedSpeech &&
                ctx.prefetchedSpeech.messageId === id &&
                ctx.prefetchedSpeech.unitIndex === unitIndex &&
                ctx.prefetchedSpeech.tts
              ) {
                const tts = ctx.prefetchedSpeech.tts;
                ctx.prefetchedSpeech = null;
                ctx.warmPromise = null;
                return Promise.resolve(tts);
              }
              return null;
            };
            const synthUnit = (unitIndex) => {
              const unit = units[unitIndex];
              if (!unit) return Promise.resolve(null);
              const pre = takePrefetch(unitIndex);
              if (pre) return pre;
              const ttsStarted = Date.now();
              return raceTimeout(
                ctx
                  .synthesizeSpeech(unit, { signal: ctx.loopAbort?.signal })
                  .then((tts) => {
                    ctx.lastDurations.ttsMs = Date.now() - ttsStarted;
                    return tts;
                  })
                  .catch((err) => {
                    if (isAbortError(err)) return null;
                    throw err;
                  }),
                ctx.timeouts.SPEAK_UNIT_MS,
                'tts',
                ctx.timers,
              ).catch((err) => {
                if (isAbortError(err)) return null;
                ctx.emitDiag({
                  type: SpeakDiagnosticType.ERROR,
                  event: 'TTS_FAILED',
                  detail: { category: err?.category || 'tts', unitIndex },
                });
                return null;
              });
            };
            let nextSynth = synthUnit(0);
            for (let i = 0; i < units.length; i += 1) {
              if (ctx.isStale(token) || barged || ctx.state.phase !== SpeakPhase.SPEAKING) {
                return;
              }
              const tts = await (nextSynth || synthUnit(i));
              nextSynth = i + 1 < units.length ? synthUnit(i + 1) : null;
              if (ctx.isStale(token) || barged || !tts || ctx.state.phase !== SpeakPhase.SPEAKING) {
                if (barged || ctx.state.phase === SpeakPhase.LISTENING) return;
                break;
              }
              const playStarted = Date.now();
              const isLastUnit = i === units.length - 1;
              const playOpts = {};
              if (isLastUnit && !isRecoverySpeak) {
                playOpts.trimTailMs = ctx.recordPolicy.PLAYBACK_TAIL_TRIM_MS;
              }
              if (Number.isFinite(Number(rate)) && Number(rate) > 0) playOpts.rate = Number(rate);
              ctx.emitDiag({
                type: SpeakDiagnosticType.PLAYBACK,
                event: 'TTS_PLAY',
                detail: {
                  messageId: id,
                  recovery: isRecoverySpeak,
                  unitIndex: i,
                  chars: String(units[i] || '').length,
                  preview: String(units[i] || '').slice(0, 80),
                  trimTailMs: playOpts.trimTailMs || 0,
                },
              });
              const playPromise = raceTimeout(
                ctx.media.playBase64(
                  tts.base64,
                  tts.mime || tts.mimeType || 'audio/mpeg',
                  Object.keys(playOpts).length ? playOpts : void 0,
                ),
                ctx.timeouts.SPEAK_UNIT_MS,
                'playback',
                ctx.timers,
              );
              if (isLastUnit && ctx.state.phase === SpeakPhase.SPEAKING && !duplex) {
                void ctx.media.armRecording?.().catch(() => {});
              }
              await playPromise;
              ctx.lastDurations.playbackMs = Date.now() - playStarted;
              if (ctx.isStale(token) || barged || ctx.state.phase === SpeakPhase.LISTENING) {
                return;
              }
            }
            if (ctx.isStale(token) || barged || ctx.state.phase === SpeakPhase.LISTENING) {
              return;
            }
            if (ctx.state.phase === SpeakPhase.SPEAKING) {
              leaveSpeaking('finished');
            }
          })(),
          ctx.timeouts.SPEAK_TURN_MS,
          'speak_turn',
          ctx.timers,
        );
      } catch (err) {
        ctx.prefetchedSpeech = null;
        try {
          ctx.media.stopPlayback();
        } catch (_) {}
        if (isAbortError(err) || ctx.isStale(token)) {
          leaveSpeaking(isAbortError(err) ? 'aborted' : 'stale');
          return;
        }
        if (ctx.state.phase === SpeakPhase.LISTENING) return;
        ctx.lastError = err?.message || 'tts';
        ctx.emitDiag({
          type: SpeakDiagnosticType.ERROR,
          event: 'TTS_FAILED',
          detail: { category: err?.category || 'tts' },
        });
        leaveSpeaking(err?.category || 'tts_error');
      } finally {
        try {
          ctx.media.stopBargeInMonitor?.();
        } catch (_) {}
        leaveSpeaking('finally');
      }
    }
    async function speakCurrentAssistant(token) {
      const opening = ctx.resolveAssistantSpeech?.();
      const pendingId = ctx.state.pendingSpeakMessageId;
      const fromPending = pendingId ? String(ctx.state.lastSpokenText || '').trim() : '';
      const text = String(fromPending || ctx.lastResponse || opening?.text || '').trim();
      const messageId = String(
        pendingId || opening?.id || text.slice(0, 40) || `msg-${Date.now()}`,
      );
      await speakCurrentText(token, { text, messageId });
    }
    return {
      abortSpeechWarm,
      beginSpeechWarm,
      resolveWarmedSpeech,
      speakCurrentText,
      speakCurrentAssistant,
    };
  }

  // src/controller/listening.js
  function createListening(ctx) {
    function emitDuplexCutoff(partial = {}) {
      const duplexTurn = ctx.duplex.turn;
      if (!duplexTurn) return;
      const q0 = duplexTurn.questionStartedAt;
      ctx.emitDiag({
        type: SpeakDiagnosticType.TIMING,
        event: 'TURN_CUTOFF',
        detail: {
          question: duplexTurn.question,
          messageId: duplexTurn.messageId,
          barged: Boolean(duplexTurn.barged),
          msToBarge: duplexTurn.bargeAt != null ? Math.round(duplexTurn.bargeAt - q0) : null,
          msToListen:
            duplexTurn.listenStartedAt != null ? Math.round(duplexTurn.listenStartedAt - q0) : null,
          msToRecordEnd:
            duplexTurn.recordFinishedAt != null
              ? Math.round(duplexTurn.recordFinishedAt - q0)
              : null,
          msToTranscript:
            partial.transcriptAt != null ? Math.round(partial.transcriptAt - q0) : null,
          bargeDetail: duplexTurn.bargeDetail || {},
          ...partial,
        },
      });
    }
    async function listenAndSubmit(token) {
      if (ctx.isStale(token) || ctx.state.phase !== SpeakPhase.LISTENING) return;
      if (ctx.pendingMicError) {
        const err = ctx.pendingMicError;
        ctx.pendingMicError = null;
        if (err?.category === 'permission') {
          ctx.lastError = err.message || 'permission';
          ctx.dispatch({ type: SpeakEvent.PERMISSION_DENIED, message: err.message });
          ctx.emitDiag({
            type: SpeakDiagnosticType.ERROR,
            event: SpeakEvent.PERMISSION_DENIED,
            detail: { category: 'permission' },
          });
          return;
        }
        ctx.lastError = err?.message || 'microphone';
        await ctx.dispatchListenAgain(
          err?.message || ctx.recoveryPolicy.missLine,
          err?.category || 'microphone',
        );
        return;
      }
      const epochAtListen = ctx.mediaEpoch;
      let audio = null;
      let liveSpeech = null;
      let preserveChunks = false;
      let listenHadSpeech = false;
      let endedNoSpeech = false;
      let captureEndReason = '';
      let captureEndedEarly = false;
      try {
        await ctx.media.ensureMicPermission();
        if (
          ctx.mediaEpoch !== epochAtListen ||
          ctx.isStale(token) ||
          ctx.state.phase !== SpeakPhase.LISTENING
        ) {
          return;
        }
        ctx.dispatch({ type: SpeakEvent.RECORDING_STARTED });
        if (ctx.duplex.earlyLiveSpeech) {
          liveSpeech = ctx.duplex.earlyLiveSpeech;
          ctx.duplex.earlyLiveSpeech = null;
        } else if (ctx.startLiveSpeech) {
          liveSpeech = ctx.beginLiveSpeech(token);
        }
        const afterAssistantSpeech = ctx.commandSession || Boolean(ctx.state.lastSpokenMessageId);
        preserveChunks = ctx.duplex.consumePreserve();
        ctx.duplex.noteListen();
        ctx.emitDiag({
          type: SpeakDiagnosticType.RECORDING,
          event: SpeakEvent.RECORDING_STARTED,
          detail: {
            preserveChunks: Boolean(preserveChunks),
            question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
            barged: Boolean(ctx.duplex.turn?.barged),
            msToListen:
              ctx.duplex.turn?.questionStartedAt != null
                ? Math.round(Date.now() - ctx.duplex.turn.questionStartedAt)
                : null,
            ...(typeof ctx.media.getArmedSnapshot === 'function'
              ? ctx.media.getArmedSnapshot()
              : {}),
          },
        });
        const recordingPromise = ctx.media.startRecording({
          skipListenCue: afterAssistantSpeech || preserveChunks,
          preserveChunks,
          seedSpeech: preserveChunks,
          silenceAfterSpeechMs: ctx.commandSession
            ? ctx.recordPolicy.COMMAND_SILENCE_AFTER_SPEECH_MS
            : ctx.recordPolicy.SILENCE_AFTER_SPEECH_MS,
          speechOnsetMs: ctx.recordPolicy.SPEECH_ONSET_MS,
          minSpeechMs: ctx.commandSession
            ? ctx.recordPolicy.COMMAND_MIN_SPEECH_MS
            : ctx.recordPolicy.MIN_SPEECH_MS,
          minRecordMs: ctx.recordPolicy.MIN_RECORD_MS,
          maxRecordMs: ctx.recordPolicy.MAX_RECORD_MS,
          softMaxActiveSpeechMs: ctx.recordPolicy.SOFT_MAX_ACTIVE_SPEECH_MS,
          softPauseMs: ctx.recordPolicy.SOFT_PAUSE_MS,
          softGraceMs: ctx.recordPolicy.SOFT_GRACE_MS,
          noSpeechHangupMs: ctx.recordPolicy.NO_SPEECH_HANGUP_MS,
          calibrateMs: preserveChunks
            ? 0
            : afterAssistantSpeech
              ? Math.min(ctx.recordPolicy.CALIBRATE_MS, ctx.recordPolicy.POST_TTS_LISTEN_GRACE_MS)
              : ctx.recordPolicy.CALIBRATE_MS,
          speechRms: ctx.recordPolicy.SPEECH_RMS,
          silenceRms: ctx.recordPolicy.SILENCE_RMS,
          graceMs: preserveChunks
            ? 0
            : afterAssistantSpeech
              ? ctx.recordPolicy.POST_TTS_LISTEN_GRACE_MS
              : ctx.recordPolicy.LISTEN_GRACE_MS,
          onPhaseChange: (phase) => {
            if (phase === 'speaking') listenHadSpeech = true;
            ctx.dispatch({
              type: SpeakEvent.HEARING_CHANGED,
              hearing: phase === 'speaking',
            });
          },
          onNoSpeech: () => {
            endedNoSpeech = true;
          },
          onCaptureEnded: (stats = {}) => {
            if (stats?.endReason) captureEndReason = String(stats.endReason).trim();
            if (
              captureEndedEarly ||
              ctx.mediaEpoch !== epochAtListen ||
              ctx.isStale(token) ||
              ctx.state.phase !== SpeakPhase.LISTENING
            ) {
              return;
            }
            captureEndedEarly = true;
            ctx.duplex.noteRecordEnd();
            ctx.dispatch({ type: SpeakEvent.RECORDING_FINISHED });
            ctx.emitDiag({
              type: SpeakDiagnosticType.RECORDING,
              event: SpeakEvent.RECORDING_FINISHED,
              detail: {
                early: true,
                preserveChunks: Boolean(preserveChunks),
                hasAudio: null,
                audioBytes: null,
                question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
                barged: Boolean(ctx.duplex.turn?.barged),
                msToRecordEnd:
                  ctx.duplex.turn?.questionStartedAt != null
                    ? Math.round(Date.now() - ctx.duplex.turn.questionStartedAt)
                    : null,
                endReason: stats.endReason || '',
                heardSpeech: Boolean(listenHadSpeech || stats.heardSpeech),
                lastRms: stats.lastRms,
                speechThreshold: stats.speechThreshold,
                stillSpeaking: stats.stillSpeaking,
                peakSpeechRms: stats.peakSpeechRms,
                peakListenRms: stats.peakListenRms,
                noiseFloor: stats.noiseFloor,
                speechHeldMs: stats.speechHeldMs,
                activeSpeechMs: stats.activeSpeechMs ?? stats.speechHeldMs,
                softLimitReached: Boolean(stats.softLimitReached),
                silenceMs: stats.silenceMs,
                listenMs: stats.listenMs,
                verdict: stats.verdict,
                hint: stats.hint,
                noSpeech: Boolean(stats.noSpeech || endedNoSpeech),
              },
            });
          },
        });
        if (ctx.duplex.finishListenForStopIntent || ctx.duplex.capturedStopIntent) {
          ctx.duplex.finishListenForStopIntent = false;
          queueMicrotask(() => {
            try {
              ctx.media.stopRecording({ discard: false });
            } catch (_) {}
          });
        }
        audio = await recordingPromise;
      } catch (err) {
        try {
          await liveSpeech?.stop?.();
        } catch (_) {}
        if (isAbortError(err) || ctx.isStale(token) || ctx.mediaEpoch !== epochAtListen) return;
        if (err?.category === 'permission') {
          ctx.lastError = err.message || 'permission';
          ctx.dispatch({ type: SpeakEvent.PERMISSION_DENIED, message: err.message });
          ctx.emitDiag({
            type: SpeakDiagnosticType.ERROR,
            event: SpeakEvent.PERMISSION_DENIED,
            detail: { category: 'permission' },
          });
          return;
        }
        ctx.lastError = err?.message || 'recording';
        await ctx.dispatchListenAgain(ctx.recoveryPolicy.missLine, err?.category || 'recording');
        return;
      }
      if (
        ctx.mediaEpoch !== epochAtListen ||
        ctx.isStale(token) ||
        ctx.state.phase === SpeakPhase.PAUSED ||
        ctx.state.phase === SpeakPhase.IDLE ||
        (ctx.state.phase !== SpeakPhase.LISTENING && ctx.state.phase !== SpeakPhase.TRANSCRIBING)
      ) {
        try {
          await liveSpeech?.stop?.();
        } catch (_) {}
        return;
      }
      const audioBytes = audio?.audioBase64 ? Math.round((audio.audioBase64.length * 3) / 4) : 0;
      if (!captureEndedEarly) {
        ctx.duplex.noteRecordEnd();
        ctx.dispatch({ type: SpeakEvent.RECORDING_FINISHED });
      }
      ctx.emitDiag({
        type: SpeakDiagnosticType.RECORDING,
        event: SpeakEvent.RECORDING_FINISHED,
        detail: {
          early: false,
          preserveChunks: Boolean(preserveChunks),
          hasAudio: Boolean(audio?.audioBase64),
          audioBytes,
          question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
          barged: Boolean(ctx.duplex.turn?.barged),
          msToRecordEnd:
            ctx.duplex.turn?.questionStartedAt != null
              ? Math.round(Date.now() - ctx.duplex.turn.questionStartedAt)
              : null,
          endReason: audio?.endReason || '',
          heardSpeech: Boolean(listenHadSpeech || audio?.heardSpeech),
          lastRms: audio?.lastRms,
          speechThreshold: audio?.speechThreshold,
          stillSpeaking: audio?.stillSpeaking,
          peakSpeechRms: audio?.peakSpeechRms,
          peakListenRms: audio?.peakListenRms,
          noiseFloor: audio?.noiseFloor,
          speechHeldMs: audio?.speechHeldMs,
          activeSpeechMs: audio?.activeSpeechMs ?? audio?.speechHeldMs,
          softLimitReached: Boolean(audio?.softLimitReached),
          silenceMs: audio?.silenceMs,
          listenMs: audio?.listenMs,
          verdict: audio?.verdict,
          hint: audio?.hint,
          noSpeech: Boolean(audio?.noSpeech || endedNoSpeech),
        },
      });
      const liveTranscript = liveSpeech ? await liveSpeech.stop() : '';
      if (!audio?.audioBase64 && !String(liveTranscript || '').trim()) {
        ctx.lastError = 'empty transcript';
        emitDuplexCutoff({
          stuck: endedNoSpeech ? 'no_speech' : 'empty_audio',
          liveTranscript: '',
          bargeTranscript: '',
          answerRest: '',
          finalTranscript: '',
          transcriptAt: Date.now(),
          peakSpeechRms: audio?.peakSpeechRms,
          noiseFloor: audio?.noiseFloor,
        });
        const ambient = isAmbientRoomEnergy(audio, { silenceRms: ctx.recordPolicy.SILENCE_RMS });
        await ctx.recoverMiss(endedNoSpeech ? 'no_speech' : 'empty', {
          speakSorry:
            ctx.recoveryPolicy.spokenWeakRetry !== false &&
            ((Boolean(listenHadSpeech) && !endedNoSpeech) || ambient),
        });
        return;
      }
      const manualDone = String(audio?.endReason || captureEndReason || '').trim() === 'stop';
      if (
        !manualDone &&
        isLowEnergySpeech(audio, {
          speechRms: ctx.recordPolicy.SPEECH_RMS,
          ...(() => {
            const margin = Number(ctx.recordPolicy.MIN_PEAK_ABOVE_FLOOR);
            return Number.isFinite(margin) && margin !== 0 ? { minAboveFloor: margin } : {};
          })(),
          ...(ctx.recordPolicy.MIN_PEAK_SPEECH_RMS > 0
            ? { minPeakRms: Number(ctx.recordPolicy.MIN_PEAK_SPEECH_RMS) }
            : {}),
        })
      ) {
        ctx.lastError = 'low energy ambient';
        emitDuplexCutoff({
          stuck: 'low_energy',
          liveTranscript: String(liveTranscript || '').trim(),
          bargeTranscript: '',
          answerRest: '',
          finalTranscript: '',
          transcriptAt: Date.now(),
          peakSpeechRms: audio?.peakSpeechRms,
          noiseFloor: audio?.noiseFloor,
        });
        await ctx.recoverMiss('low_energy', {
          speakSorry: ctx.recoveryPolicy.spokenWeakRetry !== false,
        });
        return;
      }
      try {
        void ctx.media.playCue?.('captured');
      } catch (_) {}
      let transcript = '';
      let transcriptSource = '';
      let bargeTranscript = '';
      let answerRest = '';
      try {
        const sttStarted = Date.now();
        const liveText = String(liveTranscript || '').trim();
        const stopPhrase =
          extractStopIntent(
            liveText,
            ctx.lastSpokenText || ctx.duplex.turn?.question || '',
            ctx.isStopIntent,
          ) || String(ctx.duplex.capturedStopIntent || '').trim();
        ctx.duplex.capturedStopIntent = '';
        const preferPreservedStt = preserveChunks && Boolean(audio?.audioBase64);
        const preferServerStt = Boolean(
          ctx.recordPolicy.PREFER_STT_WITH_AUDIO && audio?.audioBase64,
        );
        const liveTextOk =
          liveText &&
          !isWeakTranscript(liveText) &&
          !isListenAgainPrompt(liveText, ctx.recoveryPolicy.retryLine);
        if (stopPhrase) {
          transcript = stopPhrase;
          bargeTranscript = liveText || stopPhrase;
          answerRest = transcript;
          transcriptSource = 'live_stop_intent';
          listenHadSpeech = true;
        } else if (preferPreservedStt) {
          const result = await ctx.transcribeAudio(audio, { signal: ctx.loopAbort?.signal });
          const sttText = String(typeof result === 'string' ? result : result?.text || '').trim();
          bargeTranscript = sttText;
          const merged = mergeEarlyAnswer(
            liveText,
            sttText,
            ctx.lastSpokenText || ctx.duplex.turn?.question || '',
          );
          transcript = merged || sttText;
          answerRest = transcript;
          transcriptSource =
            liveText && merged && merged !== sttText ? 'stt_preserved+live_merge' : 'stt_preserved';
        } else if (preferServerStt) {
          let sttText = '';
          try {
            const result = await ctx.transcribeAudio(audio, { signal: ctx.loopAbort?.signal });
            sttText = String(typeof result === 'string' ? result : result?.text || '').trim();
          } catch (sttErr) {
            if (!liveTextOk) throw sttErr;
          }
          if (
            sttText &&
            !isWeakTranscript(sttText) &&
            !isListenAgainPrompt(sttText, ctx.recoveryPolicy.retryLine)
          ) {
            transcript = sttText;
            bargeTranscript = sttText;
            answerRest = sttText;
            transcriptSource = 'stt_preferred';
          } else if (liveTextOk) {
            transcript = liveText;
            bargeTranscript = liveText;
            answerRest = liveText;
            transcriptSource = sttText ? 'live_stt_fallback' : 'live';
          } else {
            transcript = sttText;
            bargeTranscript = sttText;
            answerRest = sttText;
            transcriptSource = 'stt_preferred';
          }
        } else if (liveTextOk) {
          transcript = liveText;
          bargeTranscript = liveText;
          answerRest = transcript;
          transcriptSource = 'live';
        } else {
          const result = await ctx.transcribeAudio(audio, { signal: ctx.loopAbort?.signal });
          transcript = String(typeof result === 'string' ? result : result?.text || '').trim();
          bargeTranscript = transcript;
          answerRest = transcript;
          transcriptSource = 'stt';
        }
        ctx.lastDurations.sttMs = Date.now() - sttStarted;
        ctx.emitDiag({
          type: SpeakDiagnosticType.RECORDING,
          event: 'TRANSCRIPT_SOURCE',
          detail: {
            source: transcriptSource,
            preserveChunks: Boolean(preserveChunks),
            liveChars: liveText.length,
            transcriptChars: transcript.length,
            audioBytes,
            question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
            bargeTranscript: bargeTranscript.slice(0, 200),
            liveTranscript: liveText.slice(0, 200),
            sttMs: ctx.lastDurations.sttMs,
            msToTranscript:
              ctx.duplex.turn?.questionStartedAt != null
                ? Math.round(Date.now() - ctx.duplex.turn.questionStartedAt)
                : null,
          },
        });
      } catch (err) {
        if (isAbortError(err) || ctx.isStale(token)) {
          if (ctx.finishFlushEndIfRequested?.()) return;
          return;
        }
        const liveFallback = String(liveTranscript || '').trim();
        const liveFallbackOk =
          liveFallback &&
          !isWeakTranscript(liveFallback) &&
          !isListenAgainPrompt(liveFallback, ctx.recoveryPolicy.retryLine);
        if ((ctx.flushEndAfterTurn || manualDone) && liveFallbackOk) {
          transcript = liveFallback;
          bargeTranscript = liveFallback;
          answerRest = liveFallback;
          transcriptSource = manualDone ? 'live_manual_done_fallback' : 'live_flush_fallback';
          ctx.emitDiag({
            type: SpeakDiagnosticType.RECORDING,
            event: 'TRANSCRIPT_SOURCE',
            detail: {
              source: transcriptSource,
              liveChars: liveFallback.length,
              manualDone: Boolean(manualDone),
              sttError: String(err?.message || 'transcription').slice(0, 120),
            },
          });
        } else {
          ctx.lastError = err?.message || 'transcription';
          emitDuplexCutoff({
            stuck: 'transcription',
            liveTranscript: liveFallback,
            bargeTranscript,
            answerRest: '',
            finalTranscript: '',
            transcriptAt: Date.now(),
            sttMs: ctx.lastDurations.sttMs,
          });
          if (ctx.finishFlushEndIfRequested?.()) return;
          await ctx.speakListenAgain(ctx.recoveryPolicy.retryLine, 'transcription');
          return;
        }
      }
      if (ctx.isStale(token)) return;
      ctx.lastTranscript = transcript;
      if (ctx.lastSpokenText && isLikelyPlaybackEcho(transcript, ctx.lastSpokenText)) {
        const trimmed = trimPlaybackEcho(transcript, ctx.lastSpokenText);
        const liveText = String(liveTranscript || '').trim();
        if (trimmed && !isWeakTranscript(trimmed)) {
          answerRest = trimmed;
          transcript = trimmed;
          transcriptSource = `${transcriptSource || 'stt'}+trim_echo`;
          ctx.emitDiag({
            type: SpeakDiagnosticType.RECORDING,
            event: 'TRANSCRIPT_SOURCE',
            detail: {
              source: transcriptSource,
              preserveChunks: Boolean(preserveChunks),
              question: ctx.lastSpokenText,
              bargeTranscript: bargeTranscript.slice(0, 200),
              answerRest: answerRest.slice(0, 200),
              transcriptPreview: transcript.slice(0, 80),
            },
          });
        } else if (
          liveText &&
          !isWeakTranscript(liveText) &&
          !isLikelyPlaybackEcho(liveText, ctx.lastSpokenText)
        ) {
          answerRest = liveText;
          transcript = liveText;
          transcriptSource = 'live_echo_fallback';
          ctx.emitDiag({
            type: SpeakDiagnosticType.RECORDING,
            event: 'TRANSCRIPT_SOURCE',
            detail: {
              source: transcriptSource,
              preserveChunks: Boolean(preserveChunks),
              question: ctx.lastSpokenText,
              bargeTranscript: bargeTranscript.slice(0, 200),
              answerRest: answerRest.slice(0, 200),
              livePreview: liveText.slice(0, 80),
              transcriptPreview: transcript.slice(0, 80),
            },
          });
        } else {
          ctx.lastError = 'playback echo';
          emitDuplexCutoff({
            stuck: 'playback_echo',
            source: transcriptSource,
            question: ctx.lastSpokenText,
            bargeTranscript,
            liveTranscript: liveText,
            answerRest: trimmed || '',
            finalTranscript: '',
            transcriptAt: Date.now(),
            sttMs: ctx.lastDurations.sttMs,
          });
          await ctx.recoverMiss('playback_echo', { speakSorry: false });
          return;
        }
      }
      ctx.lastTranscript = transcript;
      if (
        !transcript ||
        isWeakTranscript(transcript) ||
        isListenAgainPrompt(transcript, ctx.recoveryPolicy.retryLine)
      ) {
        const recoveryEcho = isListenAgainPrompt(transcript, ctx.recoveryPolicy.retryLine);
        ctx.lastError = recoveryEcho ? 'recovery echo' : 'empty transcript';
        emitDuplexCutoff({
          stuck: recoveryEcho ? 'recovery_echo' : endedNoSpeech ? 'no_speech' : 'empty_transcript',
          source: transcriptSource,
          question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
          bargeTranscript,
          liveTranscript: String(liveTranscript || '').trim(),
          answerRest,
          finalTranscript: transcript,
          transcriptAt: Date.now(),
          sttMs: ctx.lastDurations.sttMs,
        });
        await ctx.recoverMiss(
          recoveryEcho ? 'recovery_echo' : endedNoSpeech ? 'no_speech' : 'empty',
          {
            speakSorry: ctx.shouldSpeakSorryForTranscript(transcript, {
              heardSpeech: listenHadSpeech,
              noSpeech: endedNoSpeech,
            }),
          },
        );
        return;
      }
      emitDuplexCutoff({
        stuck: '',
        source: transcriptSource,
        question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
        bargeTranscript,
        liveTranscript: String(liveTranscript || '').trim(),
        answerRest: answerRest || transcript,
        finalTranscript: transcript,
        transcriptAt: Date.now(),
        sttMs: ctx.lastDurations.sttMs,
        audioBytes,
        preserveChunks: Boolean(preserveChunks),
      });
      ctx.duplex.clearTurn();
      ctx.consecutiveGarbledStrikes = 0;
      ctx.dispatch({ type: SpeakEvent.TRANSCRIPTION_SUCCEEDED });
      ctx.submitSerial += 1;
      const submitKey = `${token}:${ctx.submitSerial}`;
      if (ctx.submittedKeys.has(submitKey)) return;
      ctx.submittedKeys.add(submitKey);
      try {
        const sendStarted = Date.now();
        const result = await raceTimeout(
          ctx.sendTurn(transcript, { signal: ctx.loopAbort?.signal }),
          ctx.timeouts.SUBMIT_MS,
          'submission',
          ctx.timers,
        );
        ctx.lastDurations.sendMs = Date.now() - sendStarted;
        ctx.emitDiag({
          type: SpeakDiagnosticType.TIMING,
          event: 'TURN_TIMING',
          detail: { ...ctx.lastDurations },
        });
        let replyText = String(typeof result === 'string' ? result : result?.text || '').trim();
        let messageId = String(
          typeof result === 'object' && result?.id ? result.id : `reply-${ctx.submitSerial}`,
        );
        let endSession = typeof result === 'object' && result?.endSession === true;
        let forcedStopEnd = false;
        if (
          !endSession &&
          (transcriptSource === 'live_stop_intent' || ctx.isStopIntent(transcript))
        ) {
          replyText = ctx.recoveryPolicy.giveUpLine;
          messageId = `ask-end-${Date.now()}`;
          endSession = true;
          forcedStopEnd = true;
        }
        if (ctx.flushEndAfterTurn) {
          endSession = true;
        }
        ctx.lastResponse = replyText;
        if (ctx.isStale(token)) {
          ctx.emitDiag({
            type: SpeakDiagnosticType.STALE,
            event: 'LATE_SEND_TURN',
            detail: { messageId },
          });
          return;
        }
        ctx.dispatch({ type: SpeakEvent.SUBMISSION_SUCCEEDED });
        const flushEndCue = ctx.flushEndPlayQuitCue !== false;
        if (!replyText) {
          ctx.lastError = 'empty response';
          ctx.emitDiag({
            type: SpeakDiagnosticType.RECOVERY,
            event: SpeakEvent.RESPONSE_RECEIVED,
            detail: { category: 'empty_reply' },
          });
          ctx.dispatch({
            type: SpeakEvent.RESPONSE_RECEIVED,
            messageId,
            text: '',
            speak: false,
          });
          if (endSession) {
            ctx.pendingEndSession = false;
            ctx.flushEndAfterTurn = false;
            ctx.emitDiag({
              type: SpeakDiagnosticType.SESSION,
              event: 'SESSION_ENDED',
              detail: { endSession: true, spokeFarewell: false, flushEnd: true },
            });
            ctx.stopSession({ playQuitCue: flushEndCue });
          }
          return;
        }
        let speak = ctx.state.hear !== false;
        if (typeof result === 'object' && result?.speak === false && !forcedStopEnd) speak = false;
        ctx.dispatch({
          type: SpeakEvent.RESPONSE_RECEIVED,
          messageId,
          text: replyText,
          speak,
        });
        if (speak && ctx.state.phase === SpeakPhase.SPEAKING) {
          ctx.lastSpokenText = replyText;
        }
        if (endSession) {
          if (speak && ctx.state.phase === SpeakPhase.SPEAKING) {
            ctx.pendingEndSession = true;
            ctx.flushEndAfterTurn = false;
          } else {
            ctx.pendingEndSession = false;
            ctx.flushEndAfterTurn = false;
            ctx.emitDiag({
              type: SpeakDiagnosticType.SESSION,
              event: 'SESSION_ENDED',
              detail: { endSession: true, spokeFarewell: false, flushEnd: true },
            });
            ctx.stopSession({ playQuitCue: flushEndCue });
          }
        }
      } catch (err) {
        if (isAbortError(err) || ctx.isStale(token)) {
          ctx.emitDiag({
            type: SpeakDiagnosticType.STALE,
            event: 'SEND_TURN_ABORTED',
            detail: { category: err?.category || 'aborted' },
          });
          if (
            !ctx.sessionStopping &&
            !ctx.isStale(token) &&
            (ctx.state.phase === SpeakPhase.SUBMITTING ||
              ctx.state.phase === SpeakPhase.WAITING ||
              ctx.state.phase === SpeakPhase.TRANSCRIBING)
          ) {
            await ctx.dispatchListenAgain(ctx.recoveryPolicy.missLine, 'aborted');
          }
          return;
        }
        ctx.submittedKeys.delete(submitKey);
        ctx.lastError = err?.message || 'submission';
        await ctx.dispatchListenAgain(
          err?.message || 'The reply could not be generated. Try again.',
          err?.category || 'submission',
        );
        ctx.emitDiag({
          type: SpeakDiagnosticType.ERROR,
          event: SpeakEvent.SUBMISSION_FAILED,
          detail: { category: err?.category || 'submission' },
        });
      }
    }
    return { listenAndSubmit, emitDuplexCutoff };
  }

  // src/controller/createSpeakController.js
  function createSpeakController(deps) {
    if (typeof deps?.sendTurn !== 'function') {
      throw new Error('createSpeakController requires sendTurn');
    }
    if (typeof deps?.transcribeAudio !== 'function') {
      throw new Error('createSpeakController requires transcribeAudio');
    }
    if (typeof deps?.synthesizeSpeech !== 'function') {
      throw new Error('createSpeakController requires synthesizeSpeech');
    }
    const sessionKind = normalizeSpeakSessionKind(deps.sessionKind);
    const commandSession = sessionKind === SpeakSessionKind.COMMAND;
    const timeouts = mergeSpeakTimeouts(deps.timeouts);
    const recordPolicy = mergeSpeakRecordPolicy(deps.recordPolicy);
    const recoveryPolicy = mergeSpeakRecoveryPolicy(deps.recoveryPolicy);
    const timers = deps.timers || {};
    const setT = timers.setTimeout || setTimeout;
    const media = deps.media || createSpeakMedia({ recordPolicy });
    const getOpeningSpeech =
      typeof deps.getOpeningSpeech === 'function' ? deps.getOpeningSpeech : () => null;
    const onDiagnostic = deps.onDiagnostic;
    const initialHear = deps.hear === false ? false : deps.hear === true ? true : void 0;
    const ctx = {
      sessionKind,
      commandSession,
      timeouts,
      recordPolicy,
      recoveryPolicy,
      timers,
      setT,
      media,
      sessionStopping: false,
      synthesizeSpeech: deps.synthesizeSpeech,
      transcribeAudio: deps.transcribeAudio,
      sendTurn: deps.sendTurn,
      startLiveSpeech: typeof deps.startLiveSpeech === 'function' ? deps.startLiveSpeech : null,
      isStopIntent: typeof deps.isStopIntent === 'function' ? deps.isStopIntent : isStopIntent,
      state: createInitialSpeakState({
        sessionKind,
        ...(initialHear === void 0 ? {} : { hear: initialHear }),
      }),
      loopAbort: null,
      loopPromise: null,
      startInFlight: false,
      disposed: false,
      mediaEpoch: 0,
      submittedKeys: /* @__PURE__ */ new Set(),
      submitSerial: 0,
      lastSpokenText: '',
      lastTranscript: '',
      lastResponse: '',
      lastError: '',
      lastDurations: {
        sttMs: null,
        sendMs: null,
        ttsMs: null,
        playbackMs: null,
        readyMs: null,
        speakToListenMs: null,
      },
      pendingMicError: null,
      prefetchedSpeech: null,
      warmAbort: null,
      warmPromise: null,
      pendingEndSession: false,
      /** Author End Conversation: finish the live utterance, then stop. */
      flushEndAfterTurn: false,
      flushEndPlayQuitCue: true,
      consecutiveGarbledStrikes: 0,
      pendingAssistantSpeech: null,
      liveSpeechHandles: /* @__PURE__ */ new Set(),
      duplex: createDuplexTurn(),
      runStartedAt: null,
      readyMeasuredRunToken: null,
      speakEnteredAt: null,
    };
    function resolveAssistantSpeech() {
      if (ctx.pendingAssistantSpeech) return ctx.pendingAssistantSpeech;
      return getOpeningSpeech?.();
    }
    ctx.resolveAssistantSpeech = resolveAssistantSpeech;
    const recordReadyLatency = (fromPhase) => {
      if (ctx.runStartedAt == null || ctx.readyMeasuredRunToken === ctx.state.runToken) return;
      const readyMs = Date.now() - ctx.runStartedAt;
      ctx.readyMeasuredRunToken = ctx.state.runToken;
      ctx.lastDurations.readyMs = readyMs;
      emitDiag({
        type: SpeakDiagnosticType.TIMING,
        event: 'READY_LATENCY',
        detail: { readyMs, fromPhase: String(fromPhase || '') },
      });
    };
    const recordSpeakToListen = (fromPhase) => {
      if (ctx.speakEnteredAt == null) return;
      const speakToListenMs = Date.now() - ctx.speakEnteredAt;
      ctx.speakEnteredAt = null;
      ctx.lastDurations.speakToListenMs = speakToListenMs;
      emitDiag({
        type: SpeakDiagnosticType.TIMING,
        event: 'SPEAK_TO_LISTEN',
        detail: {
          speakToListenMs,
          playbackMs: ctx.lastDurations.playbackMs,
          ttsMs: ctx.lastDurations.ttsMs,
          fromPhase: String(fromPhase || ''),
        },
      });
    };
    function emitDiag(partial) {
      const event = createDiagnostic({
        sessionId: ctx.state.sessionId,
        runToken: ctx.state.runToken,
        previousPhase: ctx.state.phase,
        nextPhase: ctx.state.phase,
        ...partial,
      });
      try {
        onDiagnostic?.(event);
      } catch (_) {}
      return event;
    }
    ctx.emitDiag = emitDiag;
    function emit(next) {
      ctx.state = next;
      try {
        deps.onStateChange?.(ctx.state);
      } catch (_) {}
    }
    function dispatch(event) {
      if (event?.type === SpeakEvent.START) {
        ctx.runStartedAt = Date.now();
        ctx.readyMeasuredRunToken = null;
        ctx.speakEnteredAt = null;
        ctx.lastDurations.readyMs = null;
        ctx.lastDurations.speakToListenMs = null;
      }
      const prev = ctx.state;
      const next = reduceSpeak(ctx.state, event);
      if (next !== prev) {
        const phaseChanged = prev.phase !== next.phase;
        if (phaseChanged) {
          if (next.phase === SpeakPhase.LISTENING) {
            recordSpeakToListen(prev.phase);
            recordReadyLatency(prev.phase);
          } else if (next.phase === SpeakPhase.SPEAKING && prev.phase !== SpeakPhase.SPEAKING) {
            ctx.speakEnteredAt = Date.now();
          }
        }
        emit(next);
        if (phaseChanged) {
          emitDiag({
            type: SpeakDiagnosticType.TRANSITION,
            previousPhase: prev.phase,
            event: event?.type || '',
            nextPhase: next.phase,
            detail: {
              hear: next.hear !== false,
              sessionKind: next.sessionKind,
              runToken: next.runToken,
            },
          });
        }
      }
      return next;
    }
    ctx.dispatch = dispatch;
    function isStale(token) {
      return ctx.disposed || token !== ctx.state.runToken || ctx.state.phase === SpeakPhase.IDLE;
    }
    ctx.isStale = isStale;
    const live = createLiveSpeech(ctx);
    ctx.trackLiveSpeech = live.trackLiveSpeech;
    ctx.abortAllLiveSpeech = live.abortAllLiveSpeech;
    ctx.beginLiveSpeech = live.beginLiveSpeech;
    const speaking = createSpeaking(ctx);
    ctx.abortSpeechWarm = speaking.abortSpeechWarm;
    ctx.beginSpeechWarm = speaking.beginSpeechWarm;
    ctx.resolveWarmedSpeech = speaking.resolveWarmedSpeech;
    ctx.speakCurrentText = speaking.speakCurrentText;
    ctx.speakCurrentAssistant = speaking.speakCurrentAssistant;
    const recovery = createRecovery(ctx);
    ctx.dispatchListenAgain = recovery.dispatchListenAgain;
    ctx.speakListenAgain = recovery.speakListenAgain;
    ctx.recoverMiss = recovery.recoverMiss;
    ctx.shouldSpeakSorryForTranscript = recovery.shouldSpeakSorryForTranscript;
    const listening = createListening(ctx);
    ctx.listenAndSubmit = listening.listenAndSubmit;
    function abortMediaSoft({ releaseMic = false } = {}) {
      ctx.mediaEpoch += 1;
      speaking.abortSpeechWarm();
      ctx.pendingMicError = null;
      live.abortAllLiveSpeech();
      try {
        void media.setDuplexTalkover?.(false);
      } catch (_) {}
      try {
        media.stopPlayback();
      } catch (_) {}
      try {
        media.stopRecording({ discard: true });
      } catch (_) {}
      if (releaseMic) {
        try {
          media.releaseMic?.();
        } catch (_) {}
      }
      try {
        ctx.loopAbort?.abort();
      } catch (_) {}
      ctx.loopAbort = new AbortController();
    }
    function abortAndReleaseMic() {
      abortMediaSoft({ releaseMic: true });
    }
    function stopSession({ playQuitCue = true } = {}) {
      ctx.sessionStopping = true;
      ctx.pendingEndSession = false;
      ctx.flushEndAfterTurn = false;
      ctx.flushEndPlayQuitCue = true;
      ctx.consecutiveGarbledStrikes = 0;
      ctx.pendingAssistantSpeech = null;
      ctx.duplex.resetSessionFlags();
      ctx.duplex.clearTurn();
      abortAndReleaseMic();
      if (playQuitCue) {
        try {
          void media.playCue?.('quit');
        } catch (_) {}
      }
      dispatch({ type: SpeakEvent.STOP });
      ctx.sessionStopping = false;
      emitDiag({
        type: SpeakDiagnosticType.SESSION,
        event: SpeakEvent.STOP,
        detail: {},
      });
    }
    ctx.stopSession = stopSession;
    function finishFlushEndIfRequested() {
      if (!ctx.flushEndAfterTurn) return false;
      const playQuitCue = ctx.flushEndPlayQuitCue !== false;
      ctx.flushEndAfterTurn = false;
      ctx.flushEndPlayQuitCue = true;
      ctx.pendingEndSession = false;
      emitDiag({
        type: SpeakDiagnosticType.SESSION,
        event: 'SESSION_ENDED',
        detail: { endSession: true, flushEnd: true, spokeFarewell: false },
      });
      stopSession({ playQuitCue });
      return true;
    }
    ctx.finishFlushEndIfRequested = finishFlushEndIfRequested;
    function cancelActiveTurnTransport(reason = 'barge_in') {
      try {
        ctx.loopAbort?.abort();
      } catch (_) {}
      ctx.loopAbort = new AbortController();
      emitDiag({
        type: SpeakDiagnosticType.PLAYBACK,
        event: 'ACTIVE_TURN_CANCELED',
        detail: { reason: String(reason || 'barge_in') },
      });
    }
    ctx.cancelActiveTurnTransport = cancelActiveTurnTransport;
    async function runLoop(token) {
      while (!isStale(token)) {
        const phase = ctx.state.phase;
        if (phase === SpeakPhase.SPEAKING) {
          await speaking.speakCurrentAssistant(token);
          if (ctx.pendingEndSession && !isStale(token)) {
            ctx.pendingEndSession = false;
            emitDiag({
              type: SpeakDiagnosticType.SESSION,
              event: 'SESSION_ENDED',
              detail: { endSession: true, spokeFarewell: true },
            });
            stopSession({ playQuitCue: false });
            break;
          }
          if (!isStale(token) && ctx.state.phase === SpeakPhase.SPEAKING) {
            emitDiag({
              type: SpeakDiagnosticType.WATCHDOG,
              event: 'SPEAKING_WATCHDOG',
              detail: { runToken: token },
            });
            dispatch({
              type: SpeakEvent.PLAYBACK_FINISHED,
              messageId: ctx.state.pendingSpeakMessageId || 'watchdog',
            });
          }
          continue;
        }
        if (phase === SpeakPhase.LISTENING) {
          await listening.listenAndSubmit(token);
          continue;
        }
        if (
          phase === SpeakPhase.TRANSCRIBING ||
          phase === SpeakPhase.SUBMITTING ||
          phase === SpeakPhase.WAITING
        ) {
          emitDiag({
            type: SpeakDiagnosticType.WATCHDOG,
            event: 'THINKING_WATCHDOG',
            detail: { phase, runToken: token },
          });
          await new Promise((resolve) => {
            setT(resolve, timeouts.THINKING_WATCHDOG_MS);
          });
          if (isStale(token) || ctx.state.phase !== phase) continue;
          await recovery.dispatchListenAgain(recoveryPolicy.missLine, 'thinking_watchdog');
          continue;
        }
        if (phase === SpeakPhase.ERROR && ctx.state.errorCategory !== 'permission') {
          emitDiag({
            type: SpeakDiagnosticType.WATCHDOG,
            event: 'ERROR_WATCHDOG',
            detail: { phase, runToken: token },
          });
          const ok = await recovery.dispatchListenAgain(recoveryPolicy.missLine, 'error_watchdog');
          if (!ok) break;
          continue;
        }
        break;
      }
    }
    function startLoopIfNeeded() {
      if (ctx.loopPromise) return;
      const token = ctx.state.runToken;
      ctx.loopPromise = runLoop(token).finally(() => {
        ctx.loopPromise = null;
      });
    }
    function onDocumentVisibilityChange() {
      if (ctx.disposed) return;
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible') {
        if (ctx.state.phase === SpeakPhase.PAUSED) {
          api.resumeAfterBackground();
        }
        return;
      }
      if (document.visibilityState !== 'hidden') return;
      if (
        ctx.state.phase !== SpeakPhase.SPEAKING &&
        ctx.state.phase !== SpeakPhase.LISTENING &&
        ctx.state.phase !== SpeakPhase.WAITING &&
        ctx.state.phase !== SpeakPhase.SUBMITTING &&
        ctx.state.phase !== SpeakPhase.TRANSCRIBING &&
        ctx.state.phase !== SpeakPhase.READY
      ) {
        return;
      }
      speaking.abortSpeechWarm();
      abortMediaSoft();
      dispatch({ type: SpeakEvent.PAUSE });
      emitDiag({
        type: SpeakDiagnosticType.VISIBILITY,
        event: SpeakEvent.PAUSE,
        detail: { reason: 'tab_hidden' },
      });
    }
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', onDocumentVisibilityChange);
    }
    const api = {
      getState() {
        return ctx.state;
      },
      getTimeouts() {
        return timeouts;
      },
      getRecordPolicy() {
        return recordPolicy;
      },
      getRecoveryPolicy() {
        return recoveryPolicy;
      },
      getDiagnosticsSnapshot() {
        return {
          phase: ctx.state.phase,
          hear: ctx.state.hear !== false,
          sessionKind: ctx.state.sessionKind,
          sessionId: ctx.state.sessionId,
          runToken: ctx.state.runToken,
          recording: Boolean(media.isRecording),
          playing: Boolean(media.isPlaying),
          hearingSpeech: Boolean(ctx.state.hearingSpeech),
          micRms: this.getMicRms(),
          lastTranscript: ctx.lastTranscript,
          lastResponse: ctx.lastResponse,
          lastError: ctx.lastError,
          lastSpokenText: ctx.lastSpokenText,
          durations: { ...ctx.lastDurations },
        };
      },
      getMicRms() {
        return typeof media.getMicRms === 'function' ? Number(media.getMicRms()) || 0 : 0;
      },
      isActive() {
        return isSpeakActive(ctx.state.phase);
      },
      enterReady({ sessionId } = {}) {
        abortMediaSoft();
        dispatch({
          type: SpeakEvent.START_SESSION,
          sessionId: sessionId || '',
        });
        emitDiag({
          type: SpeakDiagnosticType.SESSION,
          event: SpeakEvent.START_SESSION,
          detail: { sessionKind },
        });
        if (ctx.state.hear !== false && (ctx.pendingAssistantSpeech || !commandSession)) {
          void speaking.beginSpeechWarm();
        }
      },
      async start({ skipOpening = false, speakNow = false } = {}) {
        if (ctx.startInFlight) return;
        if (ctx.state.phase !== SpeakPhase.READY && ctx.state.phase !== SpeakPhase.ERROR) {
          return;
        }
        ctx.startInFlight = true;
        try {
          try {
            await media.unlockFromGesture();
          } catch (err) {
            ctx.lastError = err?.message || 'microphone';
            dispatch({
              type: SpeakEvent.TRANSCRIPTION_FAILED,
              message: err?.message || 'Could not start voice conversation.',
              category: err?.category || 'microphone',
            });
            return;
          }
          ctx.pendingMicError = null;
          ctx.lastTranscript = '';
          ctx.lastResponse = '';
          ctx.lastError = '';
          ctx.duplex.resetSessionFlags();
          ctx.consecutiveGarbledStrikes = 0;
          const opening = resolveAssistantSpeech();
          const hearOff = shouldSkipPlayback(ctx.state);
          const forceSpeak =
            speakNow === true && !hearOff && Boolean(String(opening?.text || '').trim());
          const listenFirst = hearOff || (!forceSpeak && (commandSession || skipOpening === true));
          if (listenFirst) {
            try {
              await media.ensureMicPermission();
              if (typeof media.armRecording === 'function' && !media.isRecording) {
                void media.armRecording().catch((err) => {
                  ctx.pendingMicError = err;
                });
              }
            } catch (err) {
              if (err?.category === 'permission') {
                ctx.lastError = err.message || 'permission';
                dispatch({ type: SpeakEvent.PERMISSION_DENIED, message: err.message });
                emitDiag({
                  type: SpeakDiagnosticType.ERROR,
                  event: SpeakEvent.PERMISSION_DENIED,
                  detail: { category: 'permission' },
                });
                return;
              }
              ctx.lastError = err?.message || 'microphone';
              dispatch({
                type: SpeakEvent.TRANSCRIPTION_FAILED,
                message: err?.message || 'Could not access the microphone.',
                category: err?.category || 'microphone',
              });
              return;
            }
          } else {
            void media.ensureMicPermission().catch((err) => {
              ctx.pendingMicError = err;
            });
            await speaking.resolveWarmedSpeech();
            ctx.lastResponse = String(opening?.text || ctx.lastResponse || '');
          }
          ctx.loopAbort = new AbortController();
          dispatch({
            type: SpeakEvent.START,
            messageId: String(opening?.id || ''),
            text: String(opening?.text || ''),
            skipOpening: skipOpening === true,
            speakNow: forceSpeak,
          });
          ctx.pendingAssistantSpeech = null;
          ctx.duplex.playbackRate = void 0;
          emitDiag({
            type: SpeakDiagnosticType.SESSION,
            event: SpeakEvent.START,
            detail: { sessionKind, speakNow: forceSpeak },
          });
          startLoopIfNeeded();
        } finally {
          ctx.startInFlight = false;
        }
      },
      /**
       * Host-provided assistant line (Ask, opening, follow-up). Uses the same
       * SPEAKING → duplex/barge → LISTENING path as sendTurn replies.
       */
      async beginAssistantTurn({ text, id, playbackRate, sessionId } = {}) {
        const spoken = String(text || '').trim();
        const messageId = String(id || spoken.slice(0, 40) || `ask-${Date.now()}`);
        ctx.pendingAssistantSpeech = spoken ? { text: spoken, id: messageId } : null;
        ctx.duplex.playbackRate = playbackRate;
        const phase = ctx.state.phase;
        if (phase !== SpeakPhase.IDLE && phase !== SpeakPhase.READY) {
          stopSession({ playQuitCue: true });
        }
        if (ctx.state.phase === SpeakPhase.IDLE) {
          this.enterReady({ sessionId: sessionId || `ask-${Date.now()}` });
        } else if (ctx.pendingAssistantSpeech && ctx.state.hear !== false) {
          void speaking.beginSpeechWarm();
        }
        await this.start({ speakNow: Boolean(spoken) });
      },
      interrupt() {
        if (ctx.state.phase !== SpeakPhase.SPEAKING) return;
        if (recordPolicy.DUPLEX !== 0 && recordPolicy.DUPLEX !== false) {
          ctx.duplex.preserveRecordingAcrossBarge = true;
        }
        cancelActiveTurnTransport('interrupt');
        media.stopPlayback();
        dispatch({ type: SpeakEvent.INTERRUPT });
        emitDiag({
          type: SpeakDiagnosticType.PLAYBACK,
          event: SpeakEvent.INTERRUPT,
          detail: { via: 'button' },
        });
        startLoopIfNeeded();
      },
      setHear(hear) {
        const next = hear !== false;
        if (ctx.state.hear === next) return;
        dispatch({ type: SpeakEvent.SET_HEAR, hear: next });
        emitDiag({
          type: SpeakDiagnosticType.HEAR,
          event: SpeakEvent.SET_HEAR,
          detail: { hear: next },
        });
        if (!next && ctx.state.phase === SpeakPhase.SPEAKING) {
          speaking.abortSpeechWarm();
          cancelActiveTurnTransport('quiet');
          media.stopPlayback();
          dispatch({ type: SpeakEvent.INTERRUPT });
          emitDiag({
            type: SpeakDiagnosticType.PLAYBACK,
            event: SpeakEvent.INTERRUPT,
            detail: { via: 'quiet' },
          });
          startLoopIfNeeded();
        }
      },
      toggleHear() {
        this.setHear(ctx.state.hear === false);
      },
      doneSpeaking() {
        if (ctx.state.phase !== SpeakPhase.LISTENING) return;
        const armed =
          typeof media.getArmedSnapshot === 'function'
            ? media.getArmedSnapshot()
            : { recording: Boolean(media.isRecording) };
        emitDiag({
          type: SpeakDiagnosticType.RECORDING,
          event: 'DONE_SPEAKING',
          detail: {
            ...armed,
            question: ctx.duplex.turn?.question || ctx.lastSpokenText || '',
          },
        });
        try {
          media.stopRecording({ discard: false });
        } catch (err) {
          emitDiag({
            type: SpeakDiagnosticType.ERROR,
            event: 'DONE_SPEAKING_FAILED',
            detail: { message: err?.message || String(err) },
          });
        }
      },
      pause() {
        if (
          ctx.state.phase !== SpeakPhase.SPEAKING &&
          ctx.state.phase !== SpeakPhase.LISTENING &&
          ctx.state.phase !== SpeakPhase.WAITING &&
          ctx.state.phase !== SpeakPhase.SUBMITTING &&
          ctx.state.phase !== SpeakPhase.TRANSCRIBING &&
          ctx.state.phase !== SpeakPhase.READY
        ) {
          return;
        }
        abortAndReleaseMic();
        dispatch({ type: SpeakEvent.PAUSE });
        emitDiag({
          type: SpeakDiagnosticType.SESSION,
          event: SpeakEvent.PAUSE,
          detail: {},
        });
      },
      resume() {
        if (ctx.state.phase !== SpeakPhase.PAUSED) return;
        dispatch({ type: SpeakEvent.RESUME });
        emitDiag({
          type: SpeakDiagnosticType.SESSION,
          event: SpeakEvent.RESUME,
          detail: {},
        });
      },
      resumeAfterBackground() {
        if (ctx.disposed) return;
        if (ctx.state.phase !== SpeakPhase.PAUSED) return;
        dispatch({ type: SpeakEvent.RESUME, listen: true });
        emitDiag({
          type: SpeakDiagnosticType.VISIBILITY,
          event: SpeakEvent.RESUME,
          detail: { reason: 'tab_visible', listen: true },
        });
        const kick = () => {
          if (ctx.disposed) return;
          if (ctx.state.phase === SpeakPhase.LISTENING) startLoopIfNeeded();
        };
        kick();
        void Promise.resolve(ctx.loopPromise).finally(kick);
      },
      retry() {
        if (ctx.state.phase !== SpeakPhase.ERROR) return;
        dispatch({ type: SpeakEvent.RETRY });
        emitDiag({
          type: SpeakDiagnosticType.RECOVERY,
          event: SpeakEvent.RETRY,
          detail: {},
        });
        if (commandSession) {
          void this.start();
        }
      },
      /**
       * Host navigation / park: cancel in-flight thinking and return to LISTENING.
       * Does not manufacture transcription/submission success events.
       */
      listenAgain({ category = 'host', message = '' } = {}) {
        const phase = ctx.state.phase;
        if (
          phase !== SpeakPhase.TRANSCRIBING &&
          phase !== SpeakPhase.SUBMITTING &&
          phase !== SpeakPhase.WAITING &&
          phase !== SpeakPhase.LISTENING &&
          phase !== SpeakPhase.ERROR
        ) {
          return false;
        }
        cancelActiveTurnTransport(category || 'host');
        const line = String(message || recoveryPolicy.missLine || '');
        void recovery.dispatchListenAgain(line, category || 'host').then(() => {
          startLoopIfNeeded();
        });
        return true;
      },
      /**
       * End the session.
       * @param {{ playQuitCue?: boolean, flush?: boolean }} [opts]
       * - `flush: false` (default) — hard stop; discard in-progress capture
       * - `flush: true` — while listening, finish the utterance (STT + sendTurn)
       *   then stop; while thinking, wait for the in-flight turn then stop
       */
      stop({ playQuitCue = true, flush = false } = {}) {
        if (!flush) {
          stopSession({ playQuitCue });
          return;
        }
        const phase = ctx.state.phase;
        if (phase === SpeakPhase.LISTENING) {
          const recording =
            Boolean(media.isRecording) ||
            Boolean(
              typeof media.getArmedSnapshot === 'function' && media.getArmedSnapshot()?.recording,
            );
          if (recording) {
            ctx.flushEndAfterTurn = true;
            ctx.flushEndPlayQuitCue = playQuitCue !== false;
            emitDiag({
              type: SpeakDiagnosticType.SESSION,
              event: 'FLUSH_END_REQUESTED',
              detail: { phase, playQuitCue: playQuitCue !== false },
            });
            this.doneSpeaking();
            return;
          }
        }
        if (
          phase === SpeakPhase.TRANSCRIBING ||
          phase === SpeakPhase.SUBMITTING ||
          phase === SpeakPhase.WAITING
        ) {
          ctx.flushEndAfterTurn = true;
          ctx.flushEndPlayQuitCue = playQuitCue !== false;
          emitDiag({
            type: SpeakDiagnosticType.SESSION,
            event: 'FLUSH_END_REQUESTED',
            detail: { phase, playQuitCue: playQuitCue !== false },
          });
          return;
        }
        stopSession({ playQuitCue });
      },
      dispose() {
        ctx.disposed = true;
        ctx.flushEndAfterTurn = false;
        if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
          document.removeEventListener('visibilitychange', onDocumentVisibilityChange);
        }
        abortAndReleaseMic();
        try {
          media.destroy();
        } catch (_) {}
        const hear = ctx.state.hear !== false;
        ctx.state = createInitialSpeakState({
          sessionKind,
          hear,
          runToken: (ctx.state.runToken || 0) + 1,
        });
      },
    };
    return api;
  }

  // src/realtime/providers.js
  var SpeakRealtimeProvider = Object.freeze({
    FAKE: 'fake',
    LEGACY: 'legacy',
    OPENAI_REALTIME: 'openai-realtime',
    ELEVENLABS_REALTIME: 'elevenlabs-realtime',
  });
  var SpeakRealtimeSessionState = Object.freeze({
    IDLE: 'idle',
    CONNECTING: 'connecting',
    ACTIVE: 'active',
    CANCELLING: 'cancelling',
    FINISHED: 'finished',
    FAILED: 'failed',
  });
  var PROVIDERS = new Set(Object.values(SpeakRealtimeProvider));
  function normalizeSpeakRealtimeProvider(provider) {
    const value = String(provider || '')
      .trim()
      .toLowerCase();
    return PROVIDERS.has(value) ? value : SpeakRealtimeProvider.LEGACY;
  }
  function isRealtimeProvider(provider) {
    return normalizeSpeakRealtimeProvider(provider) !== SpeakRealtimeProvider.LEGACY;
  }

  // src/realtime/events.js
  var SpeakRealtimeEvent = Object.freeze({
    SESSION_CONNECT_START: 'realtime.session.connect_start',
    SESSION_CONNECTED: 'realtime.session.connected',
    SESSION_FAILED: 'realtime.session.failed',
    SESSION_CLOSED: 'realtime.session.closed',
    CONNECTION_STATE: 'realtime.connection.state',
    USER_SPEECH_START: 'realtime.user.speech_start',
    USER_SPEECH_END: 'realtime.user.speech_end',
    INPUT_TRANSCRIPT: 'realtime.input.transcript',
    ASSISTANT_RESPONSE_START: 'realtime.assistant.response_start',
    ASSISTANT_AUDIO_START: 'realtime.assistant.audio_start',
    ASSISTANT_RESPONSE_DONE: 'realtime.assistant.response_done',
    ASSISTANT_INTERRUPTED: 'realtime.assistant.interrupted',
    TOOL_CALL: 'realtime.tool.call',
    TOOL_START: 'realtime.tool.start',
    TOOL_DONE: 'realtime.tool.done',
    TOOL_ERROR: 'realtime.tool.error',
    CANCEL_REQUESTED: 'realtime.cancel.requested',
    STALE_REJECTED: 'realtime.stale.rejected',
    PROVIDER_EVENT: 'realtime.provider.event',
  });
  function createRealtimeEvent(type, detail = {}) {
    return {
      type: String(type || SpeakRealtimeEvent.PROVIDER_EVENT),
      timestamp: Date.now(),
      detail: detail && typeof detail === 'object' ? { ...detail } : {},
    };
  }

  // src/realtime/conversationBehavior.js
  var SpeakConversationTurnTaking = Object.freeze({
    FAST: 'fast',
    BALANCED: 'balanced',
    PATIENT: 'patient',
  });
  var SpeakConversationInterruption = Object.freeze({
    ENABLED: 'enabled',
    DISABLED: 'disabled',
  });
  var TURN_TAKING = new Set(Object.values(SpeakConversationTurnTaking));
  var INTERRUPTION = new Set(Object.values(SpeakConversationInterruption));
  function defaultSilenceMs(turnTaking) {
    if (turnTaking === SpeakConversationTurnTaking.FAST) return 5e3;
    if (turnTaking === SpeakConversationTurnTaking.PATIENT) return 18e3;
    return 8e3;
  }
  function normalizeSpeakConversationBehavior(raw = {}) {
    const input = raw && typeof raw === 'object' ? raw : {};
    const turnRaw = String(input.turnTaking || '')
      .trim()
      .toLowerCase();
    const turnTaking = TURN_TAKING.has(turnRaw) ? turnRaw : SpeakConversationTurnTaking.BALANCED;
    const interruptRaw = String(input.interruption || '')
      .trim()
      .toLowerCase();
    const interruption = INTERRUPTION.has(interruptRaw)
      ? interruptRaw
      : SpeakConversationInterruption.ENABLED;
    const requested = Number(input.silenceTimeoutMs);
    const silenceTimeoutMs =
      Number.isFinite(requested) && requested >= 1e3
        ? Math.round(requested)
        : defaultSilenceMs(turnTaking);
    return { turnTaking, interruption, silenceTimeoutMs };
  }
  function elevenLabsTurnConfigFromConversationBehavior(raw) {
    const behavior = normalizeSpeakConversationBehavior(raw);
    const turnEagerness =
      behavior.turnTaking === SpeakConversationTurnTaking.FAST
        ? 'eager'
        : behavior.turnTaking === SpeakConversationTurnTaking.PATIENT
          ? 'patient'
          : 'normal';
    return {
      turnEagerness,
      speculativeTurn: behavior.turnTaking === SpeakConversationTurnTaking.FAST,
      turnTimeout: Math.max(1, Math.round(behavior.silenceTimeoutMs / 1e3)),
      turnModel: 'turn_v3',
    };
  }
  function speakConversationBehaviorsEqual(left, right) {
    const a = normalizeSpeakConversationBehavior(left);
    const b = normalizeSpeakConversationBehavior(right);
    return (
      a.turnTaking === b.turnTaking &&
      a.interruption === b.interruption &&
      a.silenceTimeoutMs === b.silenceTimeoutMs
    );
  }
  function shouldHoldRealtimeInput(options = {}) {
    const input = options && typeof options === 'object' ? options : {};
    if (input.holdInput === false) return false;
    if (input.holdInput === true) return true;
    const rawBehavior =
      input.conversationBehavior ||
      (input.session && typeof input.session === 'object'
        ? input.session.conversationBehavior
        : null);
    if (rawBehavior && typeof rawBehavior === 'object') {
      const interruptRaw = String(rawBehavior.interruption || '')
        .trim()
        .toLowerCase();
      if (interruptRaw === SpeakConversationInterruption.ENABLED) return false;
      if (interruptRaw === SpeakConversationInterruption.DISABLED) return true;
    }
    return true;
  }

  // src/realtime/fakeRealtimeSession.js
  function defaultAssistantText(text) {
    return `Realtime heard: ${String(text || '').trim() || 'silence'}`;
  }
  function parseDelay(text) {
    const match = String(text || '').match(/\bslow\s+(\d{1,5})\b/i);
    return match ? Number(match[1]) : 0;
  }
  function wait(ms, signal) {
    const delay = Math.max(0, Number(ms) || 0);
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        return;
      }
      const timer = setTimeout(resolve, delay);
      signal?.addEventListener?.(
        'abort',
        () => {
          clearTimeout(timer);
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        },
        { once: true },
      );
    });
  }
  function createFakeRealtimeSession(options = {}) {
    const listeners = /* @__PURE__ */ new Set();
    const tools = options.tools && typeof options.tools === 'object' ? options.tools : {};
    const responseFor =
      typeof options.responseFor === 'function' ? options.responseFor : defaultAssistantText;
    const toolDelayMs = Number(options.toolDelayMs) || 0;
    const responseDelayMs = Number(options.responseDelayMs) || 0;
    const id = String(options.sessionId || `fake-realtime-${Date.now()}`);
    let state = SpeakRealtimeSessionState.IDLE;
    let turn = 0;
    let response = 0;
    let closed = false;
    let activeOutput = null;
    let abortController = new AbortController();
    let muted = false;
    function emit(type, detail = {}) {
      const event = createRealtimeEvent(type, {
        provider: SpeakRealtimeProvider.FAKE,
        sessionId: id,
        state,
        ...detail,
      });
      for (const fn of [...listeners]) {
        try {
          fn(event);
        } catch (_) {}
      }
      return event;
    }
    function assertActive() {
      if (closed || state === SpeakRealtimeSessionState.FINISHED) {
        throw Object.assign(new Error('Realtime session is closed'), {
          code: 'SPEAK_REALTIME_CLOSED',
        });
      }
      if (state !== SpeakRealtimeSessionState.ACTIVE) {
        throw Object.assign(new Error('Realtime session is not active'), {
          code: 'SPEAK_REALTIME_NOT_ACTIVE',
        });
      }
    }
    async function maybeRunTool(text, currentTurn, signal) {
      const lower = String(text || '').toLowerCase();
      let name = '';
      let args = {};
      if (lower.includes('slow tool') || lower.includes('slow lookup')) {
        name = 'slow_demo_lookup';
        args = { delayMs: parseDelay(text) || toolDelayMs || 2500 };
      } else if (lower.includes('fail tool') || lower.includes('fail lookup')) {
        name = 'fail_demo_lookup';
        args = {};
      } else if (lower.includes('save note')) {
        name = 'save_demo_note';
        args = { text };
      } else if (lower.includes('demo fact')) {
        name = 'get_demo_fact';
        args = { topic: text };
      }
      if (!name) return null;
      const callId = `tool-${currentTurn}-${Date.now()}`;
      emit(SpeakRealtimeEvent.TOOL_CALL, { turnId: currentTurn, callId, name, arguments: args });
      emit(SpeakRealtimeEvent.TOOL_START, { turnId: currentTurn, callId, name });
      try {
        const handler = tools[name];
        const result =
          typeof handler === 'function'
            ? await handler(args, { signal, sessionId: id, turnId: currentTurn })
            : await wait(args.delayMs || toolDelayMs, signal).then(() => ({
                ok: true,
                name,
                args,
              }));
        if (signal.aborted || closed) {
          emit(SpeakRealtimeEvent.STALE_REJECTED, {
            turnId: currentTurn,
            callId,
            reason: 'tool_result_after_cancel',
          });
          return null;
        }
        emit(SpeakRealtimeEvent.TOOL_DONE, { turnId: currentTurn, callId, name, result });
        return result;
      } catch (err) {
        if (signal.aborted || closed) {
          emit(SpeakRealtimeEvent.STALE_REJECTED, {
            turnId: currentTurn,
            callId,
            reason: 'tool_error_after_cancel',
          });
          return null;
        }
        emit(SpeakRealtimeEvent.TOOL_ERROR, {
          turnId: currentTurn,
          callId,
          name,
          message: err?.message || String(err),
        });
        throw err;
      }
    }
    async function sendUserText(text, meta = {}) {
      assertActive();
      const currentTurn = ++turn;
      const signal = abortController.signal;
      emit(SpeakRealtimeEvent.USER_SPEECH_START, {
        turnId: currentTurn,
        source: meta.source || 'text',
      });
      emit(SpeakRealtimeEvent.USER_SPEECH_END, {
        turnId: currentTurn,
        source: meta.source || 'text',
      });
      emit(SpeakRealtimeEvent.INPUT_TRANSCRIPT, { turnId: currentTurn, text: String(text || '') });
      const toolResult = await maybeRunTool(text, currentTurn, signal);
      if (signal.aborted || closed) {
        emit(SpeakRealtimeEvent.STALE_REJECTED, {
          turnId: currentTurn,
          reason: 'response_after_cancel',
        });
        return null;
      }
      if (responseDelayMs > 0) await wait(responseDelayMs, signal);
      if (signal.aborted || closed) {
        emit(SpeakRealtimeEvent.STALE_REJECTED, {
          turnId: currentTurn,
          reason: 'delayed_response_after_cancel',
        });
        return null;
      }
      const responseId = `response-${++response}`;
      activeOutput = responseId;
      emit(SpeakRealtimeEvent.ASSISTANT_RESPONSE_START, { turnId: currentTurn, responseId });
      emit(SpeakRealtimeEvent.ASSISTANT_AUDIO_START, { turnId: currentTurn, responseId });
      const outputText = responseFor(text, { turnId: currentTurn, toolResult });
      activeOutput = null;
      emit(SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE, {
        turnId: currentTurn,
        responseId,
        text: outputText,
      });
      return { turnId: currentTurn, responseId, text: outputText };
    }
    return {
      id,
      provider: SpeakRealtimeProvider.FAKE,
      get state() {
        return state;
      },
      onEvent(fn) {
        if (typeof fn !== 'function') return () => {};
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      async start() {
        if (state === SpeakRealtimeSessionState.ACTIVE) return;
        state = SpeakRealtimeSessionState.CONNECTING;
        emit(SpeakRealtimeEvent.SESSION_CONNECT_START);
        await wait(Number(options.connectDelayMs) || 0, abortController.signal);
        if (closed) return;
        state = SpeakRealtimeSessionState.ACTIVE;
        emit(SpeakRealtimeEvent.CONNECTION_STATE, { connectionState: 'connected' });
        emit(SpeakRealtimeEvent.SESSION_CONNECTED);
      },
      sendUserText,
      async interrupt(text = '', meta = {}) {
        assertActive();
        const interruptedResponseId = activeOutput;
        if (interruptedResponseId) activeOutput = null;
        emit(SpeakRealtimeEvent.ASSISTANT_INTERRUPTED, {
          responseId: interruptedResponseId,
          reason: meta.reason || 'barge_in',
        });
        if (text) return sendUserText(text, { ...meta, source: meta.source || 'interrupt' });
        return null;
      },
      cancel(reason = 'cancel') {
        if (closed) return;
        state = SpeakRealtimeSessionState.CANCELLING;
        emit(SpeakRealtimeEvent.CANCEL_REQUESTED, { reason });
        abortController.abort();
        abortController = new AbortController();
        activeOutput = null;
        state = SpeakRealtimeSessionState.ACTIVE;
      },
      setMuted(nextMuted = true) {
        muted = Boolean(nextMuted);
        emit(SpeakRealtimeEvent.CONNECTION_STATE, { muted });
        return muted;
      },
      stop(reason = 'stop') {
        if (closed) return;
        closed = true;
        abortController.abort();
        activeOutput = null;
        state = SpeakRealtimeSessionState.FINISHED;
        emit(SpeakRealtimeEvent.SESSION_CLOSED, { reason });
        listeners.clear();
      },
      snapshot() {
        return {
          id,
          provider: SpeakRealtimeProvider.FAKE,
          state,
          turn,
          response,
          activeOutput,
          closed,
          muted,
        };
      },
    };
  }

  // src/realtime/openaiRealtimeWebRtc.js
  function safeJson(raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }
  function normalizeOpenAIEvent(type, detail = {}) {
    const eventType = String(type || '');
    if (eventType === 'input_audio_buffer.speech_started')
      return SpeakRealtimeEvent.USER_SPEECH_START;
    if (eventType === 'input_audio_buffer.speech_stopped')
      return SpeakRealtimeEvent.USER_SPEECH_END;
    if (eventType.endsWith('transcription.completed')) return SpeakRealtimeEvent.INPUT_TRANSCRIPT;
    if (eventType === 'response.created') return SpeakRealtimeEvent.ASSISTANT_RESPONSE_START;
    if (
      eventType === 'response.audio.delta' ||
      eventType === 'response.output_audio.delta' ||
      eventType === 'output_audio_buffer.started'
    ) {
      return SpeakRealtimeEvent.ASSISTANT_AUDIO_START;
    }
    if (eventType === 'response.done') return SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE;
    if (eventType === 'response.output_item.added' && detail.item?.type === 'function_call') {
      return SpeakRealtimeEvent.TOOL_CALL;
    }
    return SpeakRealtimeEvent.PROVIDER_EVENT;
  }
  function createOpenAIRealtimeWebRTCSession(options = {}) {
    const bootstrapCall = options.bootstrapCall;
    if (typeof bootstrapCall !== 'function') {
      throw new TypeError(
        'createOpenAIRealtimeWebRTCSession requires bootstrapCall({ sdp, session })',
      );
    }
    const listeners = /* @__PURE__ */ new Set();
    const RTCPeerConnectionCtor = options.RTCPeerConnection || globalThis.RTCPeerConnection;
    const getUserMedia =
      options.getUserMedia ||
      globalThis.navigator?.mediaDevices?.getUserMedia?.bind(globalThis.navigator.mediaDevices);
    const createAudioElement =
      options.createAudioElement ||
      (() => {
        if (!globalThis.document?.createElement) return null;
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.playsInline = true;
        return audio;
      });
    const id = String(options.sessionId || `openai-realtime-${Date.now()}`);
    const sessionConfig = options.session || {};
    const holdInputDuringOutput = shouldHoldRealtimeInput(options);
    let state = SpeakRealtimeSessionState.IDLE;
    let peer = null;
    let channel = null;
    let localStream = null;
    let remoteAudio = null;
    let closed = false;
    let muted = false;
    let playbackHold = false;
    let assistantOutputActive = false;
    function applyTrackMute() {
      const hold = muted || playbackHold;
      for (const track of localStream?.getAudioTracks?.() || []) {
        track.enabled = !hold;
      }
    }
    function setAssistantOutputActive(active) {
      assistantOutputActive = Boolean(active);
      if (holdInputDuringOutput) {
        playbackHold = assistantOutputActive;
        applyTrackMute();
      }
    }
    function notePlaybackEvent(type) {
      if (type === 'output_audio_buffer.started') {
        setAssistantOutputActive(true);
        return;
      }
      if (
        type === 'output_audio_buffer.stopped' ||
        type === 'output_audio_buffer.cleared' ||
        type === 'response.done' ||
        type === 'response.cancelled' ||
        type === 'response.output_audio.done'
      ) {
        setAssistantOutputActive(false);
      }
    }
    function interruptAssistant(reason = 'user_speech') {
      if (!assistantOutputActive) return false;
      setAssistantOutputActive(false);
      try {
        sendEvent({ type: 'response.cancel' });
      } catch (_) {}
      try {
        sendEvent({ type: 'output_audio_buffer.clear' });
      } catch (_) {}
      if (remoteAudio) {
        try {
          remoteAudio.pause?.();
        } catch (_) {}
      }
      emit(SpeakRealtimeEvent.ASSISTANT_INTERRUPTED, { reason });
      return true;
    }
    function emit(type, detail = {}) {
      const event = createRealtimeEvent(type, {
        provider: SpeakRealtimeProvider.OPENAI_REALTIME,
        sessionId: id,
        state,
        ...detail,
      });
      for (const fn of [...listeners]) {
        try {
          fn(event);
        } catch (_) {}
      }
      return event;
    }
    function assertActive() {
      if (closed || state === SpeakRealtimeSessionState.FINISHED) {
        throw Object.assign(new Error('Realtime session is closed'), {
          code: 'SPEAK_REALTIME_CLOSED',
        });
      }
    }
    function sendEvent(event) {
      assertActive();
      if (!channel || channel.readyState !== 'open') {
        throw Object.assign(new Error('Realtime data channel is not open'), {
          code: 'SPEAK_REALTIME_CHANNEL_CLOSED',
        });
      }
      channel.send(JSON.stringify(event));
      if (event?.type === 'output_audio_buffer.clear') {
        setAssistantOutputActive(false);
      }
    }
    function teardown(reason = 'stop') {
      closed = true;
      try {
        channel?.close?.();
      } catch (_) {}
      try {
        peer?.close?.();
      } catch (_) {}
      for (const track of localStream?.getTracks?.() || []) {
        try {
          track.stop();
        } catch (_) {}
      }
      if (remoteAudio) {
        try {
          remoteAudio.pause?.();
        } catch (_) {}
        try {
          remoteAudio.srcObject = null;
        } catch (_) {}
      }
      channel = null;
      peer = null;
      localStream = null;
      remoteAudio = null;
      state = SpeakRealtimeSessionState.FINISHED;
      emit(SpeakRealtimeEvent.SESSION_CLOSED, { reason });
      listeners.clear();
    }
    return {
      id,
      provider: SpeakRealtimeProvider.OPENAI_REALTIME,
      get state() {
        return state;
      },
      onEvent(fn) {
        if (typeof fn !== 'function') return () => {};
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      async start() {
        if (state === SpeakRealtimeSessionState.ACTIVE) return;
        if (typeof RTCPeerConnectionCtor !== 'function') {
          throw new TypeError('RTCPeerConnection is unavailable');
        }
        if (typeof getUserMedia !== 'function') {
          throw new TypeError('navigator.mediaDevices.getUserMedia is unavailable');
        }
        state = SpeakRealtimeSessionState.CONNECTING;
        emit(SpeakRealtimeEvent.SESSION_CONNECT_START, {
          model: sessionConfig.model,
        });
        try {
          localStream = await acquireSpeakMicStream(getUserMedia);
          if (closed) {
            for (const track of localStream?.getTracks?.() || []) track.stop();
            return;
          }
          peer = new RTCPeerConnectionCtor(options.rtcConfig || {});
          peer.onconnectionstatechange = () => {
            emit(SpeakRealtimeEvent.CONNECTION_STATE, {
              connectionState: peer?.connectionState || '',
              iceConnectionState: peer?.iceConnectionState || '',
            });
          };
          peer.ontrack = (event) => {
            const [stream] = event.streams || [];
            if (!stream) return;
            remoteAudio = remoteAudio || createAudioElement();
            if (remoteAudio) remoteAudio.srcObject = stream;
          };
          for (const track of localStream.getTracks()) peer.addTrack(track, localStream);
          channel = peer.createDataChannel(options.dataChannelName || 'oai-events');
          channel.onmessage = (message) => {
            const data = safeJson(message.data) || { raw: String(message.data || '') };
            notePlaybackEvent(data.type);
            if (!holdInputDuringOutput && data.type === 'input_audio_buffer.speech_started') {
              interruptAssistant('user_speech');
            }
            emit(normalizeOpenAIEvent(data.type, data), {
              providerEvent: data.type || '',
              event: data,
            });
          };
          channel.onopen = () =>
            emit(SpeakRealtimeEvent.CONNECTION_STATE, { dataChannelState: 'open' });
          channel.onclose = () =>
            emit(SpeakRealtimeEvent.CONNECTION_STATE, { dataChannelState: 'closed' });
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          const answerSdp = await bootstrapCall({
            sdp: offer.sdp,
            session: {
              type: 'realtime',
              ...sessionConfig,
            },
          });
          if (closed) return;
          await peer.setRemoteDescription({ type: 'answer', sdp: String(answerSdp || '') });
          state = SpeakRealtimeSessionState.ACTIVE;
          emit(SpeakRealtimeEvent.SESSION_CONNECTED, {
            model: sessionConfig.model,
            connectionState: peer.connectionState || '',
          });
        } catch (err) {
          state = SpeakRealtimeSessionState.FAILED;
          emit(SpeakRealtimeEvent.SESSION_FAILED, {
            message: err?.message || String(err),
            name: err?.name || '',
          });
          teardown('failed');
          throw err;
        }
      },
      sendEvent,
      sendUserText(text) {
        sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: String(text || '') }],
          },
        });
        sendEvent({ type: 'response.create' });
      },
      cancel(reason = 'cancel') {
        emit(SpeakRealtimeEvent.CANCEL_REQUESTED, { reason });
        interruptAssistant(reason);
        try {
          sendEvent({ type: 'response.cancel' });
        } catch (_) {}
      },
      setMuted(nextMuted = true) {
        muted = Boolean(nextMuted);
        applyTrackMute();
        emit(SpeakRealtimeEvent.CONNECTION_STATE, { muted, playbackHold });
        return muted;
      },
      stop: teardown,
      snapshot() {
        return {
          id,
          provider: SpeakRealtimeProvider.OPENAI_REALTIME,
          state,
          connectionState: peer?.connectionState || '',
          iceConnectionState: peer?.iceConnectionState || '',
          dataChannelState: channel?.readyState || '',
          hasLocalStream: Boolean(localStream),
          muted,
          playbackHold,
          holdInputDuringOutput,
          assistantOutputActive,
        };
      },
    };
  }

  // src/realtime/elevenlabsRealtime.js
  function normalizeBootstrap(value) {
    if (value == null) return { token: '', providerSessionId: '' };
    if (typeof value === 'string') return { token: value, providerSessionId: '' };
    return {
      token: String(value.token || value.conversationToken || ''),
      providerSessionId: String(
        value.providerSessionId || value.conversationId || value.conversation_id || '',
      ).trim(),
    };
  }
  function resolveOutputVoiceId(options, sessionConfig) {
    return String(
      sessionConfig?.audio?.output?.voiceId ||
        sessionConfig?.voiceId ||
        options.voice ||
        sessionConfig?.voice ||
        '',
    ).trim();
  }
  function messageText(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return String(payload.message || payload.text || payload.content || '');
  }
  function isUserMessage(payload) {
    const role = String(payload?.role || payload?.source || '').toLowerCase();
    return role === 'user';
  }
  function rmsFromFrequency(data) {
    if (!data || !data.length) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      const n = Number(data[i]) / 255;
      sum += n * n;
    }
    return Math.sqrt(sum / data.length);
  }
  function createElevenLabsRealtimeSession(options = {}) {
    const bootstrapToken = options.bootstrapToken;
    const startConversationSession = options.startConversationSession;
    if (typeof bootstrapToken !== 'function') {
      throw new TypeError('createElevenLabsRealtimeSession requires bootstrapToken()');
    }
    if (typeof startConversationSession !== 'function') {
      throw new TypeError(
        'createElevenLabsRealtimeSession requires startConversationSession(options)',
      );
    }
    const listeners = /* @__PURE__ */ new Set();
    const id = String(options.sessionId || `elevenlabs-realtime-${Date.now()}`);
    const sessionConfig =
      options.session && typeof options.session === 'object' ? options.session : {};
    const conversationBehavior = normalizeSpeakConversationBehavior(
      sessionConfig.conversationBehavior,
    );
    const voiceId = resolveOutputVoiceId(options, sessionConfig);
    let state = SpeakRealtimeSessionState.IDLE;
    let conversation = null;
    let providerSessionId = '';
    let closed = false;
    let mode = '';
    let speaking = false;
    let inUserUtterance = false;
    let cancelRequested = false;
    let turn = 0;
    let muted = false;
    let mutedForDoneSpeaking = false;
    let unmuteAfterDoneSpeakingTimer = null;
    let listeningSettleTimer = null;
    const configuredSettle = Number(options.listeningSettleMs);
    const listeningSettleMs =
      Number.isFinite(configuredSettle) && configuredSettle >= 0 ? configuredSettle : 500;
    function clearListeningSettle() {
      if (listeningSettleTimer) {
        clearTimeout(listeningSettleTimer);
        listeningSettleTimer = null;
      }
    }
    function commitAssistantTurnEnded() {
      speaking = false;
      releasePlaybackHold();
      if (cancelRequested) {
        emit(SpeakRealtimeEvent.ASSISTANT_INTERRUPTED, {
          turnId: turn,
          reason: 'cancel',
        });
      } else {
        emit(SpeakRealtimeEvent.ASSISTANT_RESPONSE_DONE, { turnId: turn });
      }
      cancelRequested = false;
    }
    function clearUnmuteAfterDoneSpeaking() {
      if (unmuteAfterDoneSpeakingTimer) {
        clearTimeout(unmuteAfterDoneSpeakingTimer);
        unmuteAfterDoneSpeakingTimer = null;
      }
    }
    function applyMicMuted(nextMuted) {
      muted = Boolean(nextMuted);
      try {
        conversation?.setMicMuted?.(muted);
      } catch (_) {}
      emit(SpeakRealtimeEvent.CONNECTION_STATE, { muted });
      return muted;
    }
    let playbackHeldOff = false;
    function setOutputVolume(volume) {
      try {
        conversation?.setVolume?.({ volume });
      } catch (_) {}
    }
    function cutAgentPlayback() {
      playbackHeldOff = true;
      setOutputVolume(0);
      try {
        conversation?.output?.interrupt?.();
      } catch (_) {}
    }
    function releasePlaybackHold() {
      if (!playbackHeldOff) return;
      playbackHeldOff = false;
      setOutputVolume(1);
    }
    function requestAgentStopSpeaking() {
      clearListeningSettle();
      speaking = false;
      cutAgentPlayback();
      try {
        if (typeof conversation?.interrupt === 'function') conversation.interrupt();
      } catch (_) {}
      if (mode === 'listening') {
        const finish = () => {
          listeningSettleTimer = null;
          if (closed || mode !== 'listening') return;
          commitAssistantTurnEnded();
        };
        if (listeningSettleMs === 0) {
          finish();
        } else {
          listeningSettleTimer = setTimeout(finish, listeningSettleMs);
        }
      }
    }
    function releaseDoneSpeakingMute() {
      if (!mutedForDoneSpeaking) return;
      mutedForDoneSpeaking = false;
      clearUnmuteAfterDoneSpeaking();
      applyMicMuted(false);
    }
    function emit(type, detail = {}) {
      const event = createRealtimeEvent(type, {
        provider: SpeakRealtimeProvider.ELEVENLABS_REALTIME,
        sessionId: id,
        state,
        ...detail,
      });
      for (const fn of [...listeners]) {
        try {
          fn(event);
        } catch (_) {}
      }
      return event;
    }
    function assertActive() {
      if (closed || state === SpeakRealtimeSessionState.FINISHED) {
        throw Object.assign(new Error('Realtime session is closed'), {
          code: 'SPEAK_REALTIME_CLOSED',
        });
      }
      if (state !== SpeakRealtimeSessionState.ACTIVE) {
        throw Object.assign(new Error('Realtime session is not active'), {
          code: 'SPEAK_REALTIME_NOT_ACTIVE',
        });
      }
    }
    function readMicRms() {
      if (!conversation) return 0;
      try {
        if (typeof conversation.getInputByteFrequencyData === 'function') {
          const rms = rmsFromFrequency(conversation.getInputByteFrequencyData());
          if (rms > 0) return rms;
        }
        return Number(conversation.getInputVolume?.()) || 0;
      } catch (_) {
        return 0;
      }
    }
    function handleUserText(text, isFinal = true) {
      const trimmed = String(text || '').trim();
      if (!trimmed) return;
      if (!inUserUtterance) {
        inUserUtterance = true;
        turn += 1;
        releasePlaybackHold();
        emit(SpeakRealtimeEvent.USER_SPEECH_START, { turnId: turn, text: trimmed });
      }
      emit(SpeakRealtimeEvent.INPUT_TRANSCRIPT, { turnId: turn, text: trimmed, isFinal });
      if (isFinal) {
        emit(SpeakRealtimeEvent.USER_SPEECH_END, { turnId: turn, text: trimmed });
        inUserUtterance = false;
      }
    }
    async function teardown(reason = 'stop') {
      closed = true;
      mutedForDoneSpeaking = false;
      playbackHeldOff = false;
      clearListeningSettle();
      clearUnmuteAfterDoneSpeaking();
      const current = conversation;
      conversation = null;
      try {
        await current?.endSession?.();
      } catch (_) {}
      state = SpeakRealtimeSessionState.FINISHED;
      emit(SpeakRealtimeEvent.SESSION_CLOSED, { reason });
      listeners.clear();
    }
    return {
      id,
      provider: SpeakRealtimeProvider.ELEVENLABS_REALTIME,
      get state() {
        return state;
      },
      onEvent(fn) {
        if (typeof fn !== 'function') return () => {};
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      async start(options2 = {}) {
        if (state === SpeakRealtimeSessionState.ACTIVE) return;
        state = SpeakRealtimeSessionState.CONNECTING;
        emit(SpeakRealtimeEvent.SESSION_CONNECT_START, { voice: voiceId });
        try {
          const bootstrap = normalizeBootstrap(
            await bootstrapToken({
              sessionId: id,
              voice: voiceId,
              session: sessionConfig,
            }),
          );
          const token = bootstrap.token;
          providerSessionId = bootstrap.providerSessionId;
          if (closed) return;
          if (!token) {
            throw Object.assign(new Error('ElevenLabs conversation token was empty'), {
              code: 'SPEAK_REALTIME_TOKEN_MISSING',
            });
          }
          const firstMessage = String(options2.firstMessage || '').trim();
          const overrides = {
            ...(sessionConfig.overrides && typeof sessionConfig.overrides === 'object'
              ? sessionConfig.overrides
              : {}),
          };
          if (voiceId) {
            overrides.tts = { ...(overrides.tts || {}), voiceId };
          }
          if (firstMessage) {
            overrides.agent = { ...(overrides.agent || {}), firstMessage };
          }
          const sessionOpts = {
            conversationToken: token,
            connectionType: 'webrtc',
            connectionDelay: { default: 0, android: 0, ios: 0 },
            onConnect: ({ conversationId } = {}) => {
              emit(SpeakRealtimeEvent.CONNECTION_STATE, {
                connectionState: 'connected',
                conversationId: conversationId || '',
                providerSessionId,
              });
            },
            onStatusChange: ({ status } = {}) => {
              emit(SpeakRealtimeEvent.CONNECTION_STATE, { status: status || '' });
            },
            onModeChange: ({ mode: nextMode } = {}) => {
              const previous = mode;
              mode = String(nextMode || '');
              emit(SpeakRealtimeEvent.PROVIDER_EVENT, {
                providerEvent: 'mode_change',
                mode,
                previous,
              });
              if (mode === 'speaking') {
                clearListeningSettle();
                speaking = true;
                cancelRequested = false;
                releaseDoneSpeakingMute();
                if (playbackHeldOff) {
                  setOutputVolume(0);
                  return;
                }
                emit(SpeakRealtimeEvent.ASSISTANT_RESPONSE_START, { turnId: turn });
                emit(SpeakRealtimeEvent.ASSISTANT_AUDIO_START, { turnId: turn });
              } else if (mode === 'listening') {
                if (previous === 'speaking') {
                  const finish = () => {
                    listeningSettleTimer = null;
                    if (closed || mode !== 'listening') return;
                    commitAssistantTurnEnded();
                  };
                  if (listeningSettleMs === 0) {
                    finish();
                  } else {
                    clearListeningSettle();
                    listeningSettleTimer = setTimeout(finish, listeningSettleMs);
                  }
                }
              }
            },
            onMessage: (payload) => {
              emit(SpeakRealtimeEvent.PROVIDER_EVENT, {
                providerEvent: 'message',
                event: payload,
              });
              if (isUserMessage(payload)) {
                handleUserText(messageText(payload), payload?.isFinal !== false);
              }
            },
            onInterruption: (detail) => {
              clearListeningSettle();
              speaking = false;
              emit(SpeakRealtimeEvent.ASSISTANT_INTERRUPTED, {
                turnId: turn,
                reason: 'barge_in',
                event: detail,
              });
            },
            onError: (message, context) => {
              emit(SpeakRealtimeEvent.PROVIDER_EVENT, {
                providerEvent: 'error',
                message: String(message || ''),
                context,
              });
            },
            onDisconnect: (details) => {
              if (closed) return;
              emit(SpeakRealtimeEvent.CONNECTION_STATE, {
                connectionState: 'disconnected',
                details,
              });
            },
          };
          if (Object.keys(overrides).length) sessionOpts.overrides = overrides;
          conversation = await startConversationSession(sessionOpts);
          if (closed) {
            try {
              await conversation?.endSession?.();
            } catch (_) {}
            conversation = null;
            return;
          }
          state = SpeakRealtimeSessionState.ACTIVE;
          emit(SpeakRealtimeEvent.SESSION_CONNECTED, {
            voice: voiceId,
            conversationId: conversation?.getId?.() || providerSessionId,
            providerSessionId,
          });
        } catch (err) {
          state = SpeakRealtimeSessionState.FAILED;
          emit(SpeakRealtimeEvent.SESSION_FAILED, {
            message: err?.message || String(err),
            name: err?.name || '',
          });
          await teardown('failed');
          throw err;
        }
      },
      sendUserText(text) {
        assertActive();
        conversation.sendUserMessage(String(text || ''));
      },
      interrupt(text = '', meta = {}) {
        if (closed || state !== SpeakRealtimeSessionState.ACTIVE) return;
        requestAgentStopSpeaking();
        emit(SpeakRealtimeEvent.ASSISTANT_INTERRUPTED, {
          turnId: turn,
          reason: meta.reason || 'barge_in',
        });
        if (text) {
          conversation.sendUserMessage(String(text));
          handleUserText(text, true);
        }
      },
      cancel(reason = 'cancel') {
        if (closed) return;
        cancelRequested = speaking || mode === 'speaking';
        requestAgentStopSpeaking();
        emit(SpeakRealtimeEvent.CANCEL_REQUESTED, { reason });
      },
      setMuted(nextMuted = true) {
        mutedForDoneSpeaking = false;
        clearUnmuteAfterDoneSpeaking();
        return applyMicMuted(nextMuted);
      },
      doneSpeaking() {
        if (closed || state !== SpeakRealtimeSessionState.ACTIVE) return;
        releasePlaybackHold();
        if (mode === 'speaking') return;
        mutedForDoneSpeaking = true;
        applyMicMuted(true);
        emit(SpeakRealtimeEvent.PROVIDER_EVENT, { providerEvent: 'done_speaking' });
        clearUnmuteAfterDoneSpeaking();
        unmuteAfterDoneSpeakingTimer = setTimeout(() => {
          unmuteAfterDoneSpeakingTimer = null;
          releaseDoneSpeakingMute();
        }, 8e3);
      },
      stop: teardown,
      getMicRms: readMicRms,
      snapshot() {
        return {
          id,
          provider: SpeakRealtimeProvider.ELEVENLABS_REALTIME,
          state,
          turn,
          mode,
          speaking,
          voice: voiceId,
          conversationId: conversation?.getId?.() || '',
          providerSessionId,
          conversationBehavior,
          hasConversation: Boolean(conversation),
          muted,
          micRms: readMicRms(),
        };
      },
    };
  }

  // src/realtime/createRealtimeSession.js
  function createSpeakRealtimeSession(options = {}) {
    const provider = normalizeSpeakRealtimeProvider(options.provider);
    if (provider === SpeakRealtimeProvider.FAKE) {
      return createFakeRealtimeSession(options);
    }
    if (provider === SpeakRealtimeProvider.OPENAI_REALTIME) {
      return createOpenAIRealtimeWebRTCSession(options);
    }
    if (provider === SpeakRealtimeProvider.ELEVENLABS_REALTIME) {
      return createElevenLabsRealtimeSession(options);
    }
    throw Object.assign(
      new Error('Legacy sessions use createSpeakController, not createSpeakRealtimeSession'),
      {
        code: 'SPEAK_REALTIME_LEGACY_PROVIDER',
      },
    );
  }

  // src/realtime/openaiFunctionCallBridge.js
  function clean(value) {
    return String(value || '').trim();
  }
  function defaultFormatOutput(result) {
    if (typeof result === 'string') return result;
    return JSON.stringify(result ?? null);
  }
  function defaultFormatError(error) {
    return JSON.stringify({
      ok: false,
      error: clean(error?.message) || 'Tool execution failed.',
    });
  }
  function submitOpenAIRealtimeToolOutput(
    session,
    { callId, output, requestResponse = true } = {},
  ) {
    const id = clean(callId);
    if (!id || typeof session?.sendEvent !== 'function') {
      throw new TypeError('submitOpenAIRealtimeToolOutput requires a session and callId');
    }
    session.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: id,
        output: String(output ?? ''),
      },
    });
    if (requestResponse) {
      session.sendEvent({ type: 'response.create' });
    }
  }
  function createOpenAIRealtimeFunctionCallBridge(options = {}) {
    if (typeof options.invokeTool !== 'function') {
      throw new TypeError('createOpenAIRealtimeFunctionCallBridge requires invokeTool(call)');
    }
    const formatOutput =
      typeof options.formatOutput === 'function' ? options.formatOutput : defaultFormatOutput;
    const formatError =
      typeof options.formatError === 'function' ? options.formatError : defaultFormatError;
    const shouldInvoke =
      typeof options.shouldInvoke === 'function' ? options.shouldInvoke : () => true;
    const onLifecycle = typeof options.onLifecycle === 'function' ? options.onLifecycle : () => {};
    const calls = /* @__PURE__ */ new Map();
    let session = options.session || null;
    let unsubscribe = null;
    let inputHoldCount = 0;
    let superseded = false;
    const holdInputEnabled = shouldHoldRealtimeInput(options);
    const continuationTimers = /* @__PURE__ */ new Map();
    const INPUT_HOLD_TIMEOUT_MS =
      Number(options.inputHoldTimeoutMs) > 0 ? Number(options.inputHoldTimeoutMs) : 15e3;
    function applyInputHold() {
      if (typeof options.pauseInput === 'function') {
        options.pauseInput();
        return;
      }
      session?.setMuted?.(true);
    }
    function applyInputRelease() {
      if (typeof options.resumeInput === 'function') {
        options.resumeInput();
        return;
      }
      session?.setMuted?.(false);
    }
    function holdInput(slot) {
      if (!holdInputEnabled || !slot || slot.heldInput) return;
      slot.heldInput = true;
      inputHoldCount += 1;
      if (inputHoldCount === 1) applyInputHold();
    }
    function releaseInput(slot) {
      if (!slot?.heldInput) return;
      slot.heldInput = false;
      slot.awaitingContinuation = false;
      const timer = continuationTimers.get(slot.callId);
      if (timer) {
        clearTimeout(timer);
        continuationTimers.delete(slot.callId);
      }
      inputHoldCount = Math.max(0, inputHoldCount - 1);
      if (inputHoldCount === 0) applyInputRelease();
    }
    function armContinuationHold(slot) {
      if (!slot?.heldInput) return;
      slot.awaitingContinuation = true;
      const timer = setTimeout(() => releaseInput(slot), INPUT_HOLD_TIMEOUT_MS);
      continuationTimers.set(slot.callId, timer);
    }
    function slotFor(callId) {
      const id = clean(callId);
      if (!calls.has(id)) {
        calls.set(id, {
          callId: id,
          name: '',
          responseId: '',
          argumentParts: [],
          argumentsJson: '',
          argumentsReady: false,
          dispatched: false,
          promise: null,
        });
      }
      return calls.get(id);
    }
    function register(item, responseId) {
      if (!item || item.type !== 'function_call') return null;
      const callId = clean(item.call_id);
      const name = clean(item.name);
      if (!callId || !name) return null;
      const slot = slotFor(callId);
      slot.name = name;
      if (responseId) slot.responseId = clean(responseId);
      if (Object.prototype.hasOwnProperty.call(item, 'arguments')) {
        slot.completedArgumentsJson = String(item.arguments ?? '{}');
      }
      holdInput(slot);
      return slot;
    }
    function parseArguments(argumentsJson) {
      try {
        const parsed = JSON.parse(argumentsJson || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    function finalize(callId) {
      const id = clean(callId);
      const slot = calls.get(id);
      if (!slot || slot.dispatched || !slot.name || !slot.argumentsReady) {
        return null;
      }
      slot.dispatched = true;
      const argumentsJson =
        slot.argumentsJson || slot.completedArgumentsJson || slot.argumentParts.join('') || '{}';
      const call = Object.freeze({
        callId: id,
        name: slot.name,
        argumentsJson,
        arguments: parseArguments(argumentsJson),
        responseId: slot.responseId,
      });
      holdInput(slot);
      onLifecycle({ phase: 'received', ...call });
      slot.promise = Promise.resolve()
        .then(() => shouldInvoke(call))
        .then((allowed) => {
          if (allowed === false) {
            releaseInput(slot);
            return { skipped: true };
          }
          if (superseded) {
            releaseInput(slot);
            onLifecycle({ phase: 'superseded', ...call });
            return { skipped: true, superseded: true };
          }
          return options.invokeTool(call);
        })
        .then((result) => {
          if (result?.skipped === true) {
            return result;
          }
          if (superseded) {
            releaseInput(slot);
            onLifecycle({ phase: 'superseded', ...call, result });
            return { skipped: true, superseded: true, result };
          }
          const output = formatOutput(result, call);
          onLifecycle({ phase: 'executed', ...call, ok: true, result });
          submitOpenAIRealtimeToolOutput(session, {
            callId: id,
            output,
            requestResponse: options.requestResponse !== false,
          });
          if (options.requestResponse === false) {
            releaseInput(slot);
          } else {
            armContinuationHold(slot);
          }
          onLifecycle({ phase: 'returned', ...call, ok: true });
          return result;
        })
        .catch((error) => {
          if (superseded) {
            releaseInput(slot);
            onLifecycle({ phase: 'superseded', ...call, ok: false, error });
            return { skipped: true, superseded: true };
          }
          const output = formatError(error, call);
          onLifecycle({ phase: 'executed', ...call, ok: false, error });
          submitOpenAIRealtimeToolOutput(session, {
            callId: id,
            output,
            requestResponse: options.requestResponse !== false,
          });
          if (options.requestResponse === false) {
            releaseInput(slot);
          } else {
            armContinuationHold(slot);
          }
          onLifecycle({ phase: 'returned', ...call, ok: false, error });
          return { ok: false, error };
        });
      return slot.promise;
    }
    function complete({ callId, argumentsJson, responseId }) {
      const id = clean(callId);
      if (!id) return null;
      const slot = slotFor(id);
      slot.argumentsJson = String(argumentsJson ?? slot.completedArgumentsJson ?? '{}');
      slot.argumentsReady = true;
      if (responseId) slot.responseId = clean(responseId);
      return finalize(id);
    }
    function handleProviderEvent(providerEvent, raw) {
      const responseId = clean(raw?.response_id || raw?.response?.id);
      if (
        providerEvent === 'response.output_item.added' ||
        providerEvent === 'response.output_item.done'
      ) {
        const slot = register(raw?.item, responseId);
        return slot ? finalize(slot.callId) : null;
      }
      if (providerEvent === 'response.function_call_arguments.delta') {
        const callId = clean(raw?.call_id);
        if (!callId) return null;
        const slot = slotFor(callId);
        slot.argumentParts.push(String(raw?.delta || ''));
        if (responseId) slot.responseId = responseId;
        return null;
      }
      if (providerEvent === 'response.function_call_arguments.done') {
        return complete({
          callId: raw?.call_id,
          argumentsJson: raw?.arguments,
          responseId,
        });
      }
      if (providerEvent === 'response.done') {
        const outputs = Array.isArray(raw?.response?.output) ? raw.response.output : [];
        let latest = null;
        for (const item of outputs) {
          const slot = register(item, responseId);
          if (!slot || slot.dispatched) continue;
          latest =
            complete({
              callId: slot.callId,
              argumentsJson: item.arguments,
              responseId,
            }) || latest;
        }
        for (const slot of calls.values()) {
          if (!slot.awaitingContinuation) continue;
          if (slot.responseId && slot.responseId === responseId) continue;
          releaseInput(slot);
        }
        return latest;
      }
      return null;
    }
    function handleEvent(event) {
      const detail = event?.detail || {};
      const raw = detail.event || {};
      if (
        event?.type === SpeakRealtimeEvent.CANCEL_REQUESTED ||
        event?.type === SpeakRealtimeEvent.ASSISTANT_INTERRUPTED ||
        event?.type === SpeakRealtimeEvent.SESSION_CLOSED
      ) {
        superseded = true;
        reset();
        return null;
      }
      if (event?.type === SpeakRealtimeEvent.TOOL_CALL) {
        const slot = register(raw.item, raw.response_id || detail.responseId);
        return slot ? finalize(slot.callId) : null;
      }
      if (event?.type !== SpeakRealtimeEvent.PROVIDER_EVENT) {
        return null;
      }
      return handleProviderEvent(clean(detail.providerEvent || raw.type), raw);
    }
    function attach(nextSession) {
      detach();
      superseded = false;
      session = nextSession;
      if (typeof session?.onEvent !== 'function') {
        throw new TypeError('Realtime function-call bridge requires session.onEvent');
      }
      unsubscribe = session.onEvent(handleEvent);
      return detach;
    }
    function detach() {
      try {
        unsubscribe?.();
      } catch {}
      unsubscribe = null;
      reset();
    }
    function reset() {
      for (const slot of calls.values()) {
        releaseInput(slot);
      }
      calls.clear();
      inputHoldCount = 0;
    }
    return Object.freeze({
      attach,
      detach,
      handleEvent,
      reset,
      snapshot() {
        return [...calls.values()].map((slot) => ({
          callId: slot.callId,
          name: slot.name,
          responseId: slot.responseId,
          argumentsReady: slot.argumentsReady,
          dispatched: slot.dispatched,
        }));
      },
    });
  }

  // src/media/createFakeSpeakMedia.js
  function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
  function createFakeSpeakMedia(opts = {}) {
    let recording = false;
    let playing = false;
    let destroyed = false;
    let rms = Number(opts.rms) || 0;
    let speechDetected = false;
    let recordingStarts = 0;
    let played = 0;
    let bargeInHandler = null;
    let permissionDenied = Boolean(opts.permissionDenied);
    let hangPlayback = Boolean(opts.hangPlayback);
    let playbackMs = Number.isFinite(Number(opts.playbackMs)) ? Number(opts.playbackMs) : 15;
    let recordingWait = null;
    let playbackWait = null;
    let lastOnPhaseChange = null;
    let lastRecordingOpts = null;
    let armedBuffer = null;
    let externalPlaybackActive = false;
    let telemetryHandler = typeof opts.onTelemetry === 'function' ? opts.onTelemetry : null;
    const duplex = opts.duplex !== false;
    const recordPolicy = mergeSpeakRecordPolicy(opts.recordPolicy);
    function emitTelemetry(row) {
      try {
        telemetryHandler?.(row);
      } catch (_) {}
    }
    function finishRecording(audio) {
      recording = false;
      const wait2 = recordingWait;
      recordingWait = null;
      const payload = audio == null ? null : { ...audio };
      const onCaptureEnded = lastRecordingOpts?.onCaptureEnded;
      if (typeof onCaptureEnded === 'function' && payload) {
        try {
          onCaptureEnded({
            endReason: payload.endReason || 'pause',
            heardSpeech: Boolean(speechDetected || payload.heardSpeech),
            speechHeldMs: payload.speechHeldMs,
            activeSpeechMs: payload.activeSpeechMs ?? payload.speechHeldMs,
            softLimitReached: Boolean(payload.softLimitReached),
            silenceMs: payload.silenceMs,
            listenMs: payload.listenMs,
            noSpeech: Boolean(payload.noSpeech),
          });
        } catch (_) {}
      } else if (typeof onCaptureEnded === 'function' && !payload) {
        try {
          onCaptureEnded({
            endReason: 'pause',
            heardSpeech: Boolean(speechDetected),
            noSpeech: true,
          });
        } catch (_) {}
      }
      wait2?.resolve(payload);
    }
    return {
      get isRecording() {
        return recording;
      },
      get isPlaying() {
        return playing || externalPlaybackActive;
      },
      get duplex() {
        return recordPolicy.DUPLEX !== 0 && recordPolicy.DUPLEX !== false && duplex;
      },
      getRecordPolicy() {
        return recordPolicy;
      },
      get isMicMutedForPlayback() {
        return false;
      },
      get recordingStarts() {
        return recordingStarts;
      },
      get played() {
        return played;
      },
      get speechDetected() {
        return speechDetected;
      },
      setBargePlaybackActive(active) {
        externalPlaybackActive = Boolean(active);
      },
      async unlockFromGesture() {},
      async ensureMicPermission() {
        if (permissionDenied) {
          throw Object.assign(new Error('Microphone access is off.'), { category: 'permission' });
        }
      },
      async armRecording() {
        if (permissionDenied) {
          throw Object.assign(new Error('Microphone access is off.'), { category: 'permission' });
        }
        if (recording) return;
        recording = true;
        recordingStarts += 1;
        armedBuffer = { audioBase64: 'AAAA', mimeType: 'audio/webm', early: true };
      },
      resetArmedBuffer() {
        armedBuffer = null;
      },
      async playBase64() {
        if (destroyed) return;
        playing = true;
        played += 1;
        if (hangPlayback) {
          playbackWait = deferred();
          await playbackWait.promise;
          playing = false;
          return;
        }
        playbackWait = deferred();
        const timer = setTimeout(() => playbackWait?.resolve(), playbackMs);
        try {
          await playbackWait.promise;
        } finally {
          clearTimeout(timer);
          playing = false;
          playbackWait = null;
        }
      },
      stopPlayback() {
        playing = false;
        externalPlaybackActive = false;
        bargeInHandler = null;
        playbackWait?.resolve();
        playbackWait = null;
      },
      stopBargeInMonitor() {
        bargeInHandler = null;
      },
      startBargeInMonitor(onBargeIn) {
        bargeInHandler = onBargeIn;
      },
      triggerBargeIn() {
        const fn = bargeInHandler;
        bargeInHandler = null;
        fn?.();
      },
      finishPlayback() {
        playbackWait?.resolve();
      },
      hangNextPlayback() {
        hangPlayback = true;
      },
      setPlaybackMs(ms) {
        playbackMs = Number(ms) || 0;
        hangPlayback = false;
      },
      setPermissionDenied(value) {
        permissionDenied = Boolean(value);
      },
      setRms(value) {
        rms = Number(value) || 0;
      },
      setSpeechDetected(value) {
        speechDetected = Boolean(value);
        lastOnPhaseChange?.(speechDetected ? 'speaking' : 'listening');
      },
      getArmedSnapshot() {
        return {
          recording,
          chunkCount: armedBuffer ? 1 : 0,
          bytes: armedBuffer ? 4 : 0,
          armedMs: 0,
          firstChunkMs: armedBuffer ? 0 : null,
          muted: false,
          duplex,
        };
      },
      getListenSnapshot() {
        if (!recording) return null;
        return {
          heardSpeech: speechDetected,
          speechHeldMs: 0,
          activeSpeechMs: 0,
          softLimitReached: false,
          listenMs: 0,
          silenceMs: 0,
        };
      },
      async setDuplexTalkover() {},
      async startRecording(opts2 = {}) {
        lastRecordingOpts = opts2;
        if (permissionDenied) {
          throw Object.assign(new Error('Microphone access is off.'), { category: 'permission' });
        }
        const preserve = Boolean(opts2.preserveChunks) && recording;
        if (!preserve) {
          recordingStarts += 1;
          recording = true;
          armedBuffer = null;
        }
        speechDetected = Boolean(opts2.seedSpeech);
        lastOnPhaseChange = opts2.onPhaseChange || null;
        lastOnPhaseChange?.(speechDetected ? 'speaking' : 'listening');
        recordingWait = deferred();
        return recordingWait.promise.finally(() => {
          recording = false;
        });
      },
      stopRecording({ discard = false } = {}) {
        const audio = discard
          ? null
          : armedBuffer || { audioBase64: 'AAAA', mimeType: 'audio/webm' };
        armedBuffer = null;
        finishRecording(audio);
      },
      injectUtterance(audio = { audioBase64: 'AAAA', mimeType: 'audio/webm' }) {
        speechDetected = true;
        lastOnPhaseChange?.('speaking');
        armedBuffer = null;
        finishRecording(audio);
      },
      injectEmptyUtterance() {
        armedBuffer = null;
        finishRecording(null);
      },
      /**
       * No-speech hangup with room energy (high VAD never locked).
       * Should apologize when spokenWeakRetry is on.
       */
      injectAmbientHangup(meta = {}) {
        lastRecordingOpts?.onNoSpeech?.();
        armedBuffer = null;
        finishRecording({
          audioBase64: '',
          mimeType: 'audio/webm',
          noSpeech: true,
          peakSpeechRms: 0.045,
          peakListenRms: 0.045,
          noiseFloor: 0.038,
          ...meta,
        });
      },
      /** Room noise captured without a VAD lock — reject before STT and apologize. */
      injectLowEnergyNoLock(meta = {}) {
        armedBuffer = null;
        finishRecording({
          audioBase64: 'AAAA',
          mimeType: 'audio/webm',
          peakSpeechRms: 0.03,
          noiseFloor: 0.024,
          ...meta,
        });
      },
      /** Ambient / false speech lock then no usable audio — should apologize when Hear is on. */
      injectHeardEmptyUtterance() {
        speechDetected = true;
        lastOnPhaseChange?.('speaking');
        armedBuffer = null;
        finishRecording(null);
      },
      get lastRecordingOpts() {
        return lastRecordingOpts;
      },
      /**
       * Test / host helper — attach listen_watch consumers when media is injected.
       * @param {null | ((row: object) => void)} handler
       */
      setOnTelemetry(handler) {
        telemetryHandler = typeof handler === 'function' ? handler : null;
      },
      /**
       * Test helper — simulate Speak Core listen_watch telemetry.
       */
      emitListenWatch(row = {}) {
        const payload = {
          event: 'listen_watch',
          endReason: 'watch',
          ...row,
        };
        emitTelemetry(payload);
        return payload;
      },
      getMicRms() {
        return rms;
      },
      async playCue() {},
      releaseMic() {
        this.stopRecording({ discard: true });
      },
      destroy() {
        destroyed = true;
        this.stopPlayback();
        this.releaseMic();
      },
    };
  }

  // src/speech/browserSpeech.js
  function speechRecognitionCtor() {
    const win = globalThis.window;
    if (!win) return null;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
  }
  function startBrowserSpeechRecognition(opts = {}) {
    const SpeechRec = speechRecognitionCtor();
    if (!SpeechRec) {
      return { supported: false, stop: async () => '' };
    }
    let finalText = '';
    let interimText = '';
    let closed = false;
    const onTranscript = typeof opts.onTranscript === 'function' ? opts.onTranscript : null;
    let recognition = null;
    try {
      recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = String(
        opts.lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US',
      );
      recognition.onresult = (event) => {
        if (closed) return;
        let interim = '';
        let appended = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const piece = String(result?.[0]?.transcript || '');
          if (result.isFinal) appended += piece;
          else interim += piece;
        }
        if (appended) finalText = `${finalText} ${appended}`.trim();
        interimText = interim;
        const combined = String(`${finalText} ${interimText}`.trim());
        if (combined && onTranscript) {
          try {
            onTranscript(combined, { isFinal: !interim });
          } catch (_) {}
        }
      };
      recognition.onerror = () => {};
      recognition.start();
    } catch (_) {
      return { supported: false, stop: async () => '' };
    }
    return {
      supported: true,
      stop: async () => {
        closed = true;
        const rec = recognition;
        recognition = null;
        try {
          rec?.abort?.();
        } catch (_) {
          try {
            rec?.stop?.();
          } catch (_2) {}
        }
        return String(`${finalText} ${interimText}`.trim());
      },
    };
  }

  // src/voice/voiceTurn.js
  var VoiceTurnStatus = Object.freeze({
    USABLE: 'usable',
    REJECTED: 'rejected',
  });
  var VoiceTurnRejectionReason = Object.freeze({
    EMPTY_TRANSCRIPT: 'empty_transcript',
    NOT_FINAL: 'not_final',
    WEAK_TRANSCRIPT: 'weak_transcript',
    STOP_INTENT: 'stop_intent',
    LISTEN_AGAIN_PROMPT: 'listen_again_prompt',
    PLAYBACK_ECHO: 'playback_echo',
    LOW_ENERGY_SPEECH: 'low_energy_speech',
    AMBIENT_ROOM_ENERGY: 'ambient_room_energy',
    LANGUAGE_POLICY: 'language_policy',
    MINIMUM_DURATION: 'minimum_duration',
    DUPLICATE_TURN: 'duplicate_turn',
    LOW_CONFIDENCE: 'low_confidence',
  });
  var VoiceTurnConfidenceBand = Object.freeze({
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    UNKNOWN: 'unknown',
  });
  function createVoiceTurnId(prefix = 'vt') {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 10);
    return `${String(prefix || 'vt')}_${stamp}_${rand}`;
  }
  function clampVoiceTurnConfidence(value) {
    if (value == null || value === '') return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(1, n));
  }
  function voiceTurnConfidenceBandFromScore(score) {
    const n = clampVoiceTurnConfidence(score);
    if (n == null) return VoiceTurnConfidenceBand.UNKNOWN;
    if (n >= 0.8) return VoiceTurnConfidenceBand.HIGH;
    if (n >= 0.55) return VoiceTurnConfidenceBand.MEDIUM;
    return VoiceTurnConfidenceBand.LOW;
  }
  function normalizeVoiceTurnTranscript(text) {
    return String(text || '')
      .replace(/["""`']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function voiceTurnDedupeKey(text, turnId = '') {
    const normalized = normalizeVoiceTurnTranscript(text).toLowerCase();
    const id = String(turnId || '').trim();
    return id ? `${id}|${normalized}` : normalized;
  }
  function createVoiceTurn(fields) {
    const transcript = String(fields?.transcript ?? '');
    const normalizedTranscript = String(
      fields?.normalizedTranscript ?? normalizeVoiceTurnTranscript(transcript),
    );
    const confidence = clampVoiceTurnConfidence(fields?.confidence);
    const status =
      fields?.status === VoiceTurnStatus.USABLE ? VoiceTurnStatus.USABLE : VoiceTurnStatus.REJECTED;
    const speechStartMs = Number.isFinite(Number(fields?.speechStartMs))
      ? Number(fields.speechStartMs)
      : null;
    const speechEndMs = Number.isFinite(Number(fields?.speechEndMs))
      ? Number(fields.speechEndMs)
      : null;
    let speechDurationMs = Number.isFinite(Number(fields?.speechDurationMs))
      ? Number(fields.speechDurationMs)
      : null;
    if (
      speechDurationMs == null &&
      speechStartMs != null &&
      speechEndMs != null &&
      speechEndMs >= speechStartMs
    ) {
      speechDurationMs = speechEndMs - speechStartMs;
    }
    const rejectionReason =
      status === VoiceTurnStatus.REJECTED
        ? String(fields?.rejectionReason || VoiceTurnRejectionReason.WEAK_TRANSCRIPT)
        : null;
    return Object.freeze({
      id: String(fields?.id || createVoiceTurnId()),
      providerTurnId:
        fields?.providerTurnId != null && String(fields.providerTurnId).trim()
          ? String(fields.providerTurnId).trim()
          : null,
      status,
      rejectionReason,
      transcript,
      normalizedTranscript,
      isFinal: fields?.isFinal !== false,
      language: String(fields?.language || 'en').trim() || 'en',
      confidence,
      confidenceBand: String(
        fields?.confidenceBand || voiceTurnConfidenceBandFromScore(confidence),
      ),
      speechStartMs,
      speechEndMs,
      speechDurationMs,
      endReason:
        fields?.endReason != null && String(fields.endReason).trim()
          ? String(fields.endReason).trim()
          : null,
      signals: Array.isArray(fields?.signals)
        ? Object.freeze(fields.signals.map((s) => String(s)))
        : Object.freeze([]),
      timestamp: Number.isFinite(Number(fields?.timestamp)) ? Number(fields.timestamp) : Date.now(),
    });
  }
  function isUsableVoiceTurn(turn) {
    return Boolean(
      turn &&
        turn.status === VoiceTurnStatus.USABLE &&
        String(turn.normalizedTranscript || '').length > 0,
    );
  }

  // src/policies/voiceTurnQuality.js
  var FILLER_RE = /\b(?:um+|uh+|erm+|ah+|like|you know|i mean|sort of|kind of)\b/gi;
  var SHORT_CONFIRMATION_TOKENS = /* @__PURE__ */ new Set([
    'no',
    'nope',
    'ok',
    'okay',
    'yes',
    'yeah',
    'yep',
    'one',
    'two',
  ]);
  function isShortConfirmationTranscript(text) {
    const normalized = normalizeVoiceTurnTranscript(text).toLowerCase();
    return SHORT_CONFIRMATION_TOKENS.has(normalized);
  }
  function estimateVoiceTurnConfidence(text, options = {}) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return 0;
    if (trimmed.length < 3) return 0.35;
    FILLER_RE.lastIndex = 0;
    const fillerHits = (trimmed.match(FILLER_RE) || []).length;
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    let score = 0.82;
    if (fillerHits >= 2) score -= 0.15;
    else if (fillerHits === 1) score -= 0.08;
    if (words <= 2) score -= 0.12;
    const audioBytes = Number(options.audioBytes) || 0;
    if (audioBytes > 0 && audioBytes < 1200 && words >= 6) score -= 0.2;
    return clampVoiceTurnConfidence(score) ?? 0;
  }
  function detectLanguagePolicyViolation(text, policy = {}) {
    const expected = String(policy.expectedLanguage || 'en')
      .trim()
      .toLowerCase();
    if (!expected || expected === 'any') {
      return { violated: false };
    }
    const letters = String(text || '').match(/\p{L}/gu) || [];
    if (letters.length === 0) {
      return { violated: false };
    }
    const minLetters = Number.isFinite(Number(policy.minLetters)) ? Number(policy.minLetters) : 2;
    if (letters.length < minLetters) {
      return { violated: false };
    }
    const latinLetters = letters.filter((ch) => /\p{Script=Latin}/u.test(ch));
    const ratio = latinLetters.length / letters.length;
    const minRatio = Number.isFinite(Number(policy.minLatinLetterRatio))
      ? Number(policy.minLatinLetterRatio)
      : 0.85;
    if (ratio >= minRatio) {
      return { violated: false };
    }
    const detectedScript = ratio < 0.5 ? 'non-latin' : 'mixed-script';
    return {
      violated: true,
      signal: 'language_policy_non_latin',
      detectedScript,
    };
  }
  function classifyVoiceTurn(input = {}, options = {}) {
    const signals = [];
    const requireFinal = options.requireFinal !== false;
    const transcript = String(input.transcript ?? '');
    const normalizedTranscript = normalizeVoiceTurnTranscript(transcript);
    const isFinal = input.isFinal !== false;
    const providerTurnId =
      input.providerTurnId != null ? String(input.providerTurnId).trim() || null : null;
    const lastAssistantText = String(input.lastAssistantText || '');
    const captureMeta =
      input.captureMeta && typeof input.captureMeta === 'object' ? input.captureMeta : {};
    const languagePolicy =
      options.languagePolicy && typeof options.languagePolicy === 'object'
        ? options.languagePolicy
        : { expectedLanguage: String(input.language || 'en') };
    const base = {
      id: String(input.id || createVoiceTurnId()),
      providerTurnId,
      transcript,
      normalizedTranscript,
      isFinal,
      language: String(input.language || languagePolicy.expectedLanguage || 'en'),
      speechStartMs: input.speechStartMs ?? null,
      speechEndMs: input.speechEndMs ?? null,
      speechDurationMs: input.speechDurationMs ?? null,
      endReason: input.endReason ?? null,
      timestamp: Date.now(),
    };
    const reject = (rejectionReason, extra = {}) =>
      createVoiceTurn({
        ...base,
        status: VoiceTurnStatus.REJECTED,
        rejectionReason,
        confidence: extra.confidence ?? null,
        confidenceBand: extra.confidenceBand ?? voiceTurnConfidenceBandFromScore(extra.confidence),
        signals: Object.freeze([...signals, ...(extra.signals || [])]),
      });
    if (!isFinal && requireFinal) {
      signals.push('not_final');
      return reject(VoiceTurnRejectionReason.NOT_FINAL);
    }
    if (!normalizedTranscript) {
      signals.push('empty_transcript');
      return reject(VoiceTurnRejectionReason.EMPTY_TRANSCRIPT);
    }
    const dedupeKey = voiceTurnDedupeKey(normalizedTranscript, providerTurnId || '');
    const recentKeys =
      options.recentDedupeKeys instanceof Set
        ? options.recentDedupeKeys
        : new Set(Array.isArray(options.recentDedupeKeys) ? options.recentDedupeKeys : []);
    if (recentKeys.has(dedupeKey)) {
      signals.push('duplicate_turn');
      return reject(VoiceTurnRejectionReason.DUPLICATE_TURN);
    }
    const minDuration = Number(options.minimumSpeechDurationMs) || 0;
    const durationMs = Number.isFinite(Number(base.speechDurationMs))
      ? Number(base.speechDurationMs)
      : base.speechStartMs != null &&
          base.speechEndMs != null &&
          base.speechEndMs >= base.speechStartMs
        ? base.speechEndMs - base.speechStartMs
        : null;
    if (minDuration > 0 && (durationMs == null || durationMs < minDuration)) {
      const allowShort =
        options.allowShortConfirmations !== false &&
        normalizedTranscript.split(/\s+/).filter(Boolean).length <= 2 &&
        normalizedTranscript.length <= 12 &&
        !isWeakTranscript(normalizedTranscript);
      if (!allowShort) {
        signals.push('minimum_duration');
        return reject(VoiceTurnRejectionReason.MINIMUM_DURATION);
      }
    }
    if (isLowEnergySpeech(captureMeta, options.lowEnergyOpts)) {
      signals.push('low_energy_speech');
      return reject(VoiceTurnRejectionReason.LOW_ENERGY_SPEECH);
    }
    if (isAmbientRoomEnergy(captureMeta, options.ambientEnergyOpts)) {
      signals.push('ambient_room_energy');
      return reject(VoiceTurnRejectionReason.AMBIENT_ROOM_ENERGY);
    }
    if (isListenAgainPrompt(normalizedTranscript)) {
      signals.push('listen_again_prompt');
      return reject(VoiceTurnRejectionReason.LISTEN_AGAIN_PROMPT);
    }
    if (isStopIntent(normalizedTranscript)) {
      signals.push('stop_intent');
      return reject(VoiceTurnRejectionReason.STOP_INTENT);
    }
    if (lastAssistantText) {
      if (isLikelyPlaybackEcho(normalizedTranscript, lastAssistantText)) {
        signals.push('playback_echo');
        return reject(VoiceTurnRejectionReason.PLAYBACK_ECHO);
      }
      const trimmed = trimPlaybackEcho(normalizedTranscript, lastAssistantText);
      if (!trimmed && normalizedTranscript) {
        signals.push('playback_echo_trim_empty');
        return reject(VoiceTurnRejectionReason.PLAYBACK_ECHO);
      }
      if (trimmed && trimmed !== normalizedTranscript) {
        signals.push('playback_echo_trimmed');
        base.normalizedTranscript = normalizeVoiceTurnTranscript(trimmed);
        base.transcript = trimmed;
      }
    }
    const languageCheck = detectLanguagePolicyViolation(base.normalizedTranscript, languagePolicy);
    if (languageCheck.violated) {
      signals.push(languageCheck.signal || 'language_policy');
      return reject(VoiceTurnRejectionReason.LANGUAGE_POLICY, {
        signals: [languageCheck.detectedScript || 'non_latin'].filter(Boolean),
      });
    }
    if (
      isWeakTranscript(base.normalizedTranscript) &&
      !isShortConfirmationTranscript(base.normalizedTranscript)
    ) {
      signals.push('weak_transcript');
      return reject(VoiceTurnRejectionReason.WEAK_TRANSCRIPT);
    }
    const confidence = clampVoiceTurnConfidence(
      input.confidence ?? estimateVoiceTurnConfidence(base.normalizedTranscript, options),
    );
    const confidenceBand = voiceTurnConfidenceBandFromScore(confidence);
    const minConfidence = options.minimumConfidence;
    if (
      minConfidence != null &&
      Number.isFinite(Number(minConfidence)) &&
      confidence != null &&
      confidence < Number(minConfidence)
    ) {
      signals.push('low_confidence');
      return reject(VoiceTurnRejectionReason.LOW_CONFIDENCE, { confidence, confidenceBand });
    }
    return createVoiceTurn({
      ...base,
      status: VoiceTurnStatus.USABLE,
      confidence,
      confidenceBand,
      signals: Object.freeze(signals),
    });
  }
  function rememberVoiceTurnDedupeKey(turn, dedupeKeys = /* @__PURE__ */ new Set()) {
    if (!turn || turn.status !== VoiceTurnStatus.USABLE) return turn;
    const key = voiceTurnDedupeKey(turn.normalizedTranscript, turn.providerTurnId || '');
    dedupeKeys.add(key);
    return turn;
  }

  // src/adapters/createFakeTurnAdapters.js
  var NUMBER_WORDS = [
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
    'Twenty',
  ];
  var FIXED_PARAGRAPH = [
    'The purple tractor ordered seven sandwiches while a cardboard penguin',
    'argued with the moon about parking. Meanwhile, three umbrellas practiced',
    'their piano scales beside a very confused mailbox.',
  ].join(' ');
  var LONG_REPLY = [
    FIXED_PARAGRAPH,
    'A bicycle taught geometry to a bowl of soup until the soup asked for extra homework.',
    'Then the lighthouse filed a complaint about the weather being too theatrical,',
    'and a choir of spoons rehearsed an anthem nobody had requested.',
  ].join(' ');
  function numberWord(n) {
    const i = Number(n) || 0;
    if (i >= 1 && i <= NUMBER_WORDS.length) return NUMBER_WORDS[i - 1];
    return String(i);
  }
  function sleep(ms) {
    if (!ms) return Promise.resolve();
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  function asText(result) {
    if (typeof result === 'string') return result;
    return String(result?.text || '');
  }
  function createFakeTurnAdapters(opts = {}) {
    let mode = String(opts.mode || 'count');
    let delayMs = Number(opts.delayMs) || 0;
    let hangSend = Boolean(opts.hangSend);
    let turn = 0;
    const failures = {
      stt: Boolean(opts.sttFailure),
      tts: Boolean(opts.ttsFailure),
      send: Boolean(opts.sendFailure),
      emptyTranscript: Boolean(opts.emptyTranscript),
      emptyResponse: Boolean(opts.emptyResponse),
      permission: Boolean(opts.permissionError),
      timeout: false,
      hangStt: false,
      hangTts: false,
    };
    let heldSend = null;
    let synthCalls = 0;
    let transcribeCalls = 0;
    let sendCalls = 0;
    let lastTranscript = '';
    async function maybeDelay() {
      if (hangSend) return new Promise(() => {});
      if (delayMs < 0) return new Promise(() => {});
      await sleep(delayMs);
    }
    return {
      get turn() {
        return turn;
      },
      get synthCalls() {
        return synthCalls;
      },
      get transcribeCalls() {
        return transcribeCalls;
      },
      get sendCalls() {
        return sendCalls;
      },
      get lastTranscript() {
        return lastTranscript;
      },
      setMode(next) {
        mode = String(next || 'count');
      },
      setDelayMs(ms) {
        delayMs = Number(ms) || 0;
        hangSend = delayMs < 0;
      },
      hangForever() {
        hangSend = true;
        delayMs = -1;
      },
      failNext(kind) {
        if (kind === 'stt') failures.stt = true;
        if (kind === 'tts') failures.tts = true;
        if (kind === 'send') failures.send = true;
        if (kind === 'emptyTranscript') failures.emptyTranscript = true;
        if (kind === 'emptyResponse') failures.emptyResponse = true;
        if (kind === 'permission') failures.permission = true;
        if (kind === 'timeout') failures.timeout = true;
        if (kind === 'hangStt') failures.hangStt = true;
        if (kind === 'hangTts') failures.hangTts = true;
      },
      holdNextSend() {
        heldSend = { resolve: null, promise: null };
        heldSend.promise = new Promise((resolve, reject) => {
          heldSend.resolve = resolve;
          heldSend.reject = reject;
        });
      },
      releaseHeldSend(value) {
        heldSend?.resolve(value);
        heldSend = null;
      },
      async transcribeAudio(audio, { signal } = {}) {
        transcribeCalls += 1;
        if (failures.hangStt) {
          failures.hangStt = false;
          return new Promise(() => {});
        }
        if (signal?.aborted) {
          throw Object.assign(new Error('aborted'), { name: 'AbortError' });
        }
        if (failures.permission) {
          failures.permission = false;
          throw Object.assign(new Error('Microphone access is off.'), { category: 'permission' });
        }
        if (failures.stt) {
          failures.stt = false;
          throw Object.assign(new Error('STT failed'), { category: 'transcription' });
        }
        if (failures.emptyTranscript) {
          failures.emptyTranscript = false;
          return { text: '' };
        }
        const fromAudio = typeof audio?.transcript === 'string' ? audio.transcript : '';
        const text = fromAudio || opts.defaultTranscript || 'hello there friend';
        lastTranscript = text;
        return { text };
      },
      async synthesizeSpeech(text, { signal } = {}) {
        synthCalls += 1;
        if (failures.hangTts) {
          failures.hangTts = false;
          return new Promise(() => {});
        }
        if (signal?.aborted) {
          throw Object.assign(new Error('aborted'), { name: 'AbortError' });
        }
        if (failures.tts) {
          failures.tts = false;
          throw Object.assign(new Error('TTS failed'), { category: 'tts' });
        }
        return { base64: 'AAAA', mime: 'audio/mpeg', text: String(text || '') };
      },
      async sendTurn(text, { signal } = {}) {
        sendCalls += 1;
        lastTranscript = String(text || '');
        if (signal?.aborted) {
          throw Object.assign(new Error('aborted'), { name: 'AbortError' });
        }
        if (failures.send) {
          failures.send = false;
          throw Object.assign(new Error('sendTurn failed'), { category: 'submission' });
        }
        if (failures.timeout) {
          failures.timeout = false;
          throw Object.assign(new Error('submission timed out'), {
            category: 'submission_timeout',
          });
        }
        if (heldSend?.promise) {
          const held = heldSend;
          const result = await held.promise;
          return result == null ? this._replyFor(text) : result;
        }
        await maybeDelay();
        return this._replyFor(text);
      },
      _replyFor(text) {
        if (failures.emptyResponse) {
          failures.emptyResponse = false;
          return { text: '', id: `empty-${Date.now()}` };
        }
        turn += 1;
        if (mode === 'echo') {
          return { text: `You said: ${String(text || '').trim()}`, id: `t${turn}` };
        }
        if (mode === 'paragraph') {
          return { text: FIXED_PARAGRAPH, id: `t${turn}` };
        }
        if (mode === 'long') {
          return { text: LONG_REPLY, id: `t${turn}` };
        }
        return { text: numberWord(turn), id: `t${turn}` };
      },
      asText,
    };
  }

  // src/index.js
  var SPEAK_CORE_VERSION = '0.2.21';
  return __toCommonJS(index_exports);
})();
