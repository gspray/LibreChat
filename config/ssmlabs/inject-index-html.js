'use strict';

const fs = require('fs');
const path = require('path');

const SENTINEL = 'data-ssmlabs-lessoncaddie-back="true"';
const SCRIPT = `<script src="/ssmlabs/back-to-lessoncaddie.js" ${SENTINEL}></script>`;

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function readFileSyncWithLessonCaddieBack(file, options) {
  const data = originalReadFileSync.apply(this, arguments);
  const filePath = typeof file === 'string' ? file : String(file);
  if (path.basename(filePath) !== 'index.html') {
    return data;
  }
  const inject = (html) =>
    html.includes(SENTINEL) ? html : html.replace('</head>', `${SCRIPT}</head>`);
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
