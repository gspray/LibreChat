'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildCapabilityLinkInstructions,
  resolveLessonCaddieOrigin,
} = require('./instructorCapabilityLinks');

test('capability answers use environment-specific Take me there links', () => {
  const instructions = buildCapabilityLinkInstructions('https://stage.lessoncaddie.app/app');
  assert.match(
    instructions,
    /\[Take me there\]\(https:\/\/stage\.lessoncaddie\.app\/app\?panel=directory&lc_nav=1\)/,
  );
  assert.match(instructions, /Do not call open_app_screen merely to create/);
  assert.match(instructions, /weather or local time/);
});

test('capability link origin fails closed to the reviewed HTTPS default', () => {
  assert.equal(
    resolveLessonCaddieOrigin('javascript:alert(1)'),
    'https://lessoncaddie.ssmlabs.com',
  );
});
