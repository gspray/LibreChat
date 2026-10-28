(function ssmlabsHideModelSelectorWhenDisabled() {
  'use strict';

  const SELECTOR_TEST_ID = 'model-selector-button';
  let shouldHide = false;
  let embeddedChromeObserver = null;

  function isEmbedded() {
    try {
      return window.parent !== window;
    } catch {
      return true;
    }
  }

  function ensureEmbeddedChromeStyle() {
    if (document.head.querySelector('[data-ssmlabs-hide-embedded-chrome]')) {
      return;
    }
    const style = document.createElement('style');
    style.setAttribute('data-ssmlabs-hide-embedded-chrome', 'true');
    style.textContent = `
      html[data-lessoncaddie-embedded="true"] [data-testid="app-pane"] > header,
      html[data-lessoncaddie-embedded="true"] [data-testid="back-to-lessoncaddie"],
      html[data-lessoncaddie-embedded="true"] #ssmlabs-back-to-lessoncaddie,
      html[data-lessoncaddie-embedded="true"] a[href*="view=start-lesson"],
      html[data-lessoncaddie-embedded="true"] a[href*="start-lesson"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function hideStartLessonControls() {
    if (typeof document?.querySelectorAll !== 'function') {
      return;
    }
    document.querySelectorAll('a, button').forEach((node) => {
      if (
        String(node.textContent || '')
          .replace(/\s+/g, ' ')
          .trim() !== 'Start Lesson'
      ) {
        return;
      }
      node.setAttribute('data-ssmlabs-embedded-chrome-hidden', 'true');
      node.style.display = 'none';
      node.setAttribute('aria-hidden', 'true');
    });
  }

  function hideEmbeddedAppChrome() {
    if (!isEmbedded()) {
      return;
    }
    document.documentElement.setAttribute('data-lessoncaddie-embedded', 'true');
    ensureEmbeddedChromeStyle();
    hideStartLessonControls();
    if (embeddedChromeObserver || !document.body) {
      return;
    }
    embeddedChromeObserver = new MutationObserver(() => {
      hideStartLessonControls();
    });
    embeddedChromeObserver.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      if (embeddedChromeObserver) {
        embeddedChromeObserver.disconnect();
        embeddedChromeObserver = null;
      }
    }, 120000);
  }

  function envHideEnabled() {
    return shouldHide === true;
  }

  function readHideFlagFromStartup(startup) {
    if (!startup || typeof startup !== 'object') {
      return false;
    }
    if (startup.lessonCaddie && startup.lessonCaddie.hideModelSelector === true) {
      return true;
    }
    if (startup.interface && startup.interface.modelSelect === false) {
      return true;
    }
    return false;
  }

  function hideModelSelectorChip() {
    if (!envHideEnabled()) {
      return false;
    }
    const button = document.querySelector(`[data-testid="${SELECTOR_TEST_ID}"]`);
    if (!button) {
      return false;
    }
    // Hide only the control. `.relative.flex` also matches the chat canvas
    // (`Presentation` drag-drop wrapper) and blanks the authenticated UI.
    button.setAttribute('data-ssmlabs-model-selector-hidden', 'true');
    button.style.display = 'none';
    button.setAttribute('aria-hidden', 'true');
    return true;
  }

  function observeUntilHidden() {
    if (!envHideEnabled()) {
      return;
    }
    if (hideModelSelectorChip()) {
      return;
    }
    const observer = new MutationObserver(() => {
      hideModelSelectorChip();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 120000);
  }

  function applyStartup(startup) {
    shouldHide = readHideFlagFromStartup(startup);
    if (shouldHide) {
      observeUntilHidden();
      hideModelSelectorChip();
    }
  }

  function loadConfig() {
    return fetch('/api/config', { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : null))
      .then(applyStartup)
      .catch(() => {
        /* Leave LibreChat usable if config cannot be loaded. */
      });
  }

  hideEmbeddedAppChrome();
  loadConfig();
  window.setTimeout(loadConfig, 1500);
  window.setTimeout(loadConfig, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadConfig();
      hideEmbeddedAppChrome();
    }
  });
})();
