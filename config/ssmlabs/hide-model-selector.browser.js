/**
 * SSM Labs overlay — docs/ssmlabs-fork-patches.md
 * Hides the header model/agent chip when interface.modelSelect is false.
 * Do not restore the ModelSelector.tsx fork; this overlay is the supported path.
 */
(function ssmlabsHideModelSelectorWhenDisabled() {
  'use strict';

  const SELECTOR_TEST_ID = 'model-selector-button';
  const STYLE_ID = 'ssmlabs-hide-model-selector';

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

  function applyStartup(startup) {
    const existingStyle = document.getElementById(STYLE_ID);
    if (!readHideFlagFromStartup(startup)) {
      existingStyle?.remove();
      return;
    }
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      // Hide only the control. Its parent also matches the chat canvas layout.
      style.textContent = `[data-testid="${SELECTOR_TEST_ID}"] { display: none !important; }`;
      document.head.appendChild(style);
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

  loadConfig();
  window.setTimeout(loadConfig, 1500);
  window.setTimeout(loadConfig, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadConfig();
    }
  });
})();
