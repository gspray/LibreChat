'use strict';

const fs = require('fs');
const path = require('path');

const BACK_SENTINEL = 'data-ssmlabs-lessoncaddie-back="true"';
const SELECTOR_SENTINEL = 'data-ssmlabs-hide-model-selector="true"';
const SCRIPTS = [
  `<script src="/ssmlabs/back-to-lessoncaddie.js?v=3" defer ${BACK_SENTINEL}></script>`,
  `<script src="/ssmlabs/hide-model-selector.js?v=1" defer ${SELECTOR_SENTINEL}></script>`,
].join('\n');

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function readFileSyncWithLessonCaddieBack(file, options) {
  const data = originalReadFileSync.apply(this, arguments);
  const filePath = typeof file === 'string' ? file : String(file);
  if (path.basename(filePath) !== 'index.html') {
    return data;
  }
  const inject = (html) => {
    if (html.includes(BACK_SENTINEL) && html.includes(SELECTOR_SENTINEL)) {
      return html;
    }
    let next = html;
    for (const tag of SCRIPTS.split('\n')) {
      if (!next.includes(tag)) {
        next = next.replace('</head>', `${tag}\n</head>`);
      }
    }
    return next;
  };
  if (typeof data === 'string') {
    return inject(data);
  }
  if (Buffer.isBuffer(data)) {
    const html = data.toString('utf8');
    const next = inject(html);
    return next === html ? data : Buffer.from(next, 'utf8');
  }
  return data;
};
