/** SSM Labs overlay — docs/ssmlabs-fork-patches.md. */
(function setComposerPlaceholder() {
  'use strict';

  const replacement = document.currentScript?.dataset.composerPlaceholder;
  if (!replacement) {
    return;
  }

  function apply() {
    document
      .querySelectorAll('textarea.composer-text[placeholder="Message LessonCaddie"]')
      .forEach((textarea) => textarea.setAttribute('placeholder', replacement));
  }

  apply();
  new MutationObserver(apply).observe(document.body, {
    attributes: true,
    attributeFilter: ['placeholder'],
    childList: true,
    subtree: true,
  });
})();
