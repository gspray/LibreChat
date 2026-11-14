'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildStudentCapabilityLinkInstructions } = require('./studentCapabilityLinks');

test('student capability answers use student app destinations', () => {
  const instructions = buildStudentCapabilityLinkInstructions('https://stage.lessoncaddie.app/app');
  assert.match(
    instructions,
    /\[Take me there\]\(https:\/\/stage\.lessoncaddie\.app\/app\?panel=practices&lc_nav=1\)/,
  );
  assert.match(
    instructions,
    /\[Take me there\]\(https:\/\/stage\.lessoncaddie\.app\/app\?panel=goals&lc_nav=1\)/,
  );
  assert.doesNotMatch(instructions, /panel=directory/);
  assert.doesNotMatch(instructions, /Start Lesson/);
});
