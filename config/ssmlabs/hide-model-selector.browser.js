(function ssmlabsHideModelSelectorWhenDisabled() {
  'use strict';

  const SELECTOR_TEST_ID = 'model-selector-button';
  let shouldHide = false;

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

  loadConfig();
  window.setTimeout(loadConfig, 1500);
  window.setTimeout(loadConfig, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadConfig();
    }
  });
})();
