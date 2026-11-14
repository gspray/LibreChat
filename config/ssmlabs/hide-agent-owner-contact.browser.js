/** Hide the default owner contact from the prebuilt Chat client on every agent view. */
(function hideLessonCaddieOwnerContact() {
  'use strict';

  function hideContactRows() {
    for (const row of document.querySelectorAll(
      'div.text-text-secondary.flex.min-w-0.items-center',
    )) {
      if (row.dataset.ssmlabsOwnerContactHidden === 'true') {
        continue;
      }
      const name = [...row.querySelectorAll('span')].some(
        (span) => span.textContent?.trim() === 'Greg Spray',
      );
      if (!name || !/^(?:Contact:\s*)?Greg Spray$/.test(row.textContent?.trim() || '')) {
        continue;
      }
      row.dataset.ssmlabsOwnerContactHidden = 'true';
      row.style.display = 'none';
      row.setAttribute('aria-hidden', 'true');
    }
  }

  function start() {
    hideContactRows();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        hideContactRows();
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
