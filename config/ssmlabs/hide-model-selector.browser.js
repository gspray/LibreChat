(function ssmlabsHideModelSelectorWhenDisabled() {
  'use strict';

  const SELECTOR_TEST_ID = 'model-selector-button';
  let hideWhenModelSelectDisabled = false;

  function hideModelSelectorChip() {
    if (!hideWhenModelSelectDisabled) {
      return false;
    }
    const button = document.querySelector(`[data-testid="${SELECTOR_TEST_ID}"]`);
    if (!button) {
      return false;
    }
    const host = button.closest('.relative.flex') || button.parentElement;
    if (host) {
      host.setAttribute('data-ssmlabs-model-selector-hidden', 'true');
      host.style.display = 'none';
    }
    return true;
  }

  function observeUntilHidden() {
    if (hideModelSelectorChip()) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (hideModelSelectorChip()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 30000);
  }

  function applyFromStartupConfig(startup) {
    hideWhenModelSelectDisabled = startup?.interface?.modelSelect === false;
    if (hideWhenModelSelectDisabled) {
      observeUntilHidden();
    }
  }

  fetch('/api/config', { credentials: 'same-origin' })
    .then((response) => (response.ok ? response.json() : null))
    .then(applyFromStartupConfig)
    .catch(() => {
      /* Leave LibreChat usable if config cannot be loaded. */
    });
})();
