'use strict';

(function attachLessonCaddieConversationStarters(globalObject) {
  const MESSAGE_SOURCE = 'lessoncaddie-assistant';
  const SHELL_SOURCE = 'lessoncaddie-shell';
  const MESSAGE_TYPE = 'conversation-starters';
  const MESSAGE_VERSION = 1;
  const MANAGED_ATTR = 'data-lc-managed';
  const DEFAULT_PROMPTS = [
    'Find one of my students',
    'Show my recent lessons',
    'Help me schedule a lesson',
    'Review a student\u2019s practice plan',
  ];

  let cachedPrompts = null;
  let loadPromise = null;
  let editIndex = -1;

  function requestId() {
    return `lc-starters-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function postToParent(message) {
    if (!globalObject.parent || globalObject.parent === globalObject) {
      return Promise.reject(new Error('parent_unavailable'));
    }
    return new Promise((resolve, reject) => {
      const request = {
        source: MESSAGE_SOURCE,
        type: MESSAGE_TYPE,
        version: MESSAGE_VERSION,
        requestId: requestId(),
        ...message,
      };
      const timeout = globalObject.setTimeout(() => {
        globalObject.removeEventListener('message', onMessage);
        reject(new Error('timeout'));
      }, 12000);
      function onMessage(event) {
        const data = event.data;
        if (!data || data.source !== SHELL_SOURCE || data.type !== `${MESSAGE_TYPE}-ack`) {
          return;
        }
        if (data.requestId !== request.requestId) {
          return;
        }
        globalObject.clearTimeout(timeout);
        globalObject.removeEventListener('message', onMessage);
        if (data.ok) {
          resolve(data);
          return;
        }
        reject(new Error(data.error || 'request_failed'));
      }
      globalObject.addEventListener('message', onMessage);
      try {
        globalObject.parent.postMessage(request, '*');
      } catch (error) {
        globalObject.clearTimeout(timeout);
        globalObject.removeEventListener('message', onMessage);
        reject(error);
      }
    });
  }

  async function loadPrompts() {
    if (cachedPrompts) {
      return cachedPrompts;
    }
    if (!loadPromise) {
      loadPromise = postToParent({ action: 'get' })
        .then((payload) => {
          const prompts =
            Array.isArray(payload.prompts) && payload.prompts.length
              ? payload.prompts.map((item) => String(item || '').trim()).filter(Boolean)
              : [...DEFAULT_PROMPTS];
          cachedPrompts = prompts.slice(0, 4);
          return cachedPrompts;
        })
        .catch(() => {
          cachedPrompts = [...DEFAULT_PROMPTS];
          return cachedPrompts;
        })
        .finally(() => {
          loadPromise = null;
        });
    }
    return loadPromise;
  }

  async function savePrompts(prompts) {
    const next = await postToParent({ action: 'put', prompts });
    const saved =
      Array.isArray(next.prompts) && next.prompts.length
        ? next.prompts.map((item) => String(item || '').trim()).filter(Boolean)
        : [...DEFAULT_PROMPTS];
    cachedPrompts = saved.slice(0, 4);
    return cachedPrompts;
  }

  function findComposerBand(documentObject) {
    const surface = documentObject.querySelector?.('[data-testid="composer-surface"]');
    return surface?.closest?.('form')?.parentElement || null;
  }

  function hideNativeStarters(documentObject) {
    const band = findComposerBand(documentObject);
    if (!band) {
      return;
    }
    const candidates = Array.from(band.querySelectorAll?.(':scope > div') || []);
    for (const node of candidates) {
      if (node.getAttribute(MANAGED_ATTR) === 'true') {
        continue;
      }
      const buttons = node.querySelectorAll?.('button') || [];
      const starters = Array.from(buttons).filter(
        (button) => String(button.textContent || '').trim().length > 0,
      );
      if (starters.length >= 2 && starters.every((button) => button.closest('form') == null)) {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
        node.dataset.lcNativeStartersHidden = 'true';
      }
    }
  }

  function submitPrompt(documentObject, text) {
    const surface = documentObject.querySelector?.('[data-testid="composer-surface"]');
    const textarea = surface?.querySelector?.('textarea');
    if (textarea) {
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus?.();
    }
    const sendButton = surface?.querySelector?.(
      'button[type="submit"], button[aria-label*="Send"], button[data-testid*="send"]',
    );
    if (sendButton && !sendButton.disabled) {
      sendButton.click();
      return;
    }
    textarea?.dispatchEvent?.(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' }),
    );
  }

  function buildChip(documentObject, prompt, index, onChange) {
    const chip = documentObject.createElement('div');
    chip.className = 'lc-conversation-starter lc-conversation-starter-chip';
    chip.dataset.lcStarterIndex = String(index);

    const send = documentObject.createElement('button');
    send.type = 'button';
    send.className = 'lc-conversation-starter-send';
    const label = documentObject.createElement('span');
    label.className = 'lc-conversation-starter-label';
    label.textContent = prompt;
    send.appendChild(label);
    send.addEventListener('click', () => {
      if (editIndex === index) {
        return;
      }
      submitPrompt(documentObject, prompt);
    });

    const edit = documentObject.createElement('button');
    edit.type = 'button';
    edit.className = 'lc-conversation-starter-edit';
    edit.setAttribute('aria-label', `Edit prompt ${index + 1}`);
    edit.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
    edit.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      beginEdit(documentObject, chip, send, index, onChange);
    });

    chip.appendChild(send);
    chip.appendChild(edit);
    return chip;
  }

  function beginEdit(documentObject, chip, send, index, onChange) {
    if (editIndex >= 0) {
      return;
    }
    editIndex = index;
    const current = send.querySelector('.lc-conversation-starter-label')?.textContent || '';
    chip.replaceChildren();
    const input = documentObject.createElement('input');
    input.type = 'text';
    input.className = 'lc-conversation-starter-input';
    input.value = current;
    input.maxLength = 160;
    input.setAttribute('aria-label', 'Edit quick prompt');
    chip.appendChild(input);
    input.focus();
    input.select();

    const finish = async (save) => {
      const value = String(input.value || '').trim();
      editIndex = -1;
      if (!save || !value) {
        onChange();
        return;
      }
      const next = [...(cachedPrompts || DEFAULT_PROMPTS)];
      next[index] = value;
      try {
        await savePrompts(next);
      } catch {
        /* keep local fallback */
        cachedPrompts = next;
      }
      onChange();
    };

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void finish(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        void finish(false);
      }
    });
    input.addEventListener('blur', () => {
      void finish(true);
    });
  }

  async function render(documentObject) {
    const band = findComposerBand(documentObject);
    if (!band) {
      return false;
    }
    hideNativeStarters(documentObject);
    const prompts = await loadPrompts();
    let host = band.querySelector?.(`[${MANAGED_ATTR}="true"]`);
    if (!host) {
      host = documentObject.createElement('div');
      host.className = 'lc-conversation-starters';
      host.setAttribute(MANAGED_ATTR, 'true');
      band.insertBefore(host, band.firstChild);
    }
    host.replaceChildren();
    const paint = () => {
      void render(documentObject);
    };
    prompts.forEach((prompt, index) => {
      host.appendChild(buildChip(documentObject, prompt, index, paint));
    });
    return true;
  }

  function schedule(documentObject) {
    void render(documentObject);
  }

  const api = Object.freeze({ render, loadPrompts, savePrompts });

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  globalObject.LessonCaddieConversationStarters = api;

  const documentObject = globalObject.document;
  if (!documentObject) {
    return;
  }

  let scheduled = false;
  const run = () => {
    scheduled = false;
    schedule(documentObject);
  };
  const scheduleDecorate = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    if (typeof globalObject.requestAnimationFrame === 'function') {
      globalObject.requestAnimationFrame(run);
    } else {
      globalObject.setTimeout(run, 0);
    }
  };

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', scheduleDecorate, { once: true });
  } else {
    scheduleDecorate();
  }
  const observer = new globalObject.MutationObserver(scheduleDecorate);
  observer.observe(documentObject.documentElement, { childList: true, subtree: true });
})(typeof window === 'object' ? window : globalThis);
