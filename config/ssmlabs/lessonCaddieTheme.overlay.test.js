'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const theme = require('./lessonCaddieTheme.browser');

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : force;
    if (enabled) this.values.add(name);
    else this.values.delete(name);
    return enabled;
  }
}

class FakeElement {
  constructor(textContent = '') {
    this.textContent = textContent;
    this.className = '';
    this.classList = new FakeClassList();
    this.dataset = {};
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.query = null;
    this.queryAll = null;
    this.closestMatch = null;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  prepend(child) {
    child.parentElement = this;
    this.children.unshift(child);
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  querySelector(selector) {
    if (selector === '.lc-starter-icon') {
      return this.children.find(
        (child) =>
          child.className === 'lc-starter-icon' || child.classList.contains('lc-starter-icon'),
      );
    }
    if (selector === '.lc-assistant-mark') {
      return this.children.find(
        (child) =>
          child.className === 'lc-assistant-mark' || child.classList.contains('lc-assistant-mark'),
      );
    }
    if (selector === 'a[href="#lc-approve"], a[href$="#lc-approve"]') {
      return this.children.find((child) => child.href === '#lc-approve') || null;
    }
    return this.query?.(selector) || null;
  }

  querySelectorAll(selector) {
    return this.queryAll?.(selector) || [];
  }

  closest(selector) {
    return this.closestMatch?.(selector) || null;
  }
}

function buildThemeDocument() {
  const body = new FakeElement();
  const documentElement = new FakeElement();
  const title = new FakeElement('Instructor Assistant');
  const titleWrap = new FakeElement('Instructor Assistant');
  const heroRow = new FakeElement('Instructor Assistant');
  const content = new FakeElement(
    'Instructor Assistant Your AI assistant for managing students, lessons, schedules, and practice activities.',
  );
  const landingShell = new FakeElement();
  const avatar = new FakeElement();
  const avatarContainer = new FakeElement();
  const description = new FakeElement(
    'Your AI assistant for managing students, lessons, schedules, and practice activities.',
  );
  title.parentElement = titleWrap;
  titleWrap.parentElement = heroRow;
  heroRow.parentElement = content;
  content.parentElement = landingShell;
  avatar.parentElement = avatarContainer;
  heroRow.query = (selector) =>
    selector === 'img, .avatar-stroke' || selector === '.avatar-stroke' ? avatar : null;
  content.queryAll = (selector) => (selector === 'p,div' ? [description] : []);

  const starterContainer = new FakeElement();
  const buttons = [
    'Find one of my students',
    'Show my recent lessons',
    'Help me schedule a lesson',
    'Review a student’s practice plan',
  ].map((text) => {
    const button = new FakeElement(text);
    button.parentElement = starterContainer;
    return button;
  });

  const composerSurface = new FakeElement();
  const composerForm = new FakeElement();
  const composerBand = new FakeElement();
  composerForm.parentElement = composerBand;
  composerSurface.closestMatch = (selector) => (selector === 'form' ? composerForm : null);
  const approveLink = new FakeElement('I approve');

  return {
    body,
    documentElement,
    buttons,
    landingShell,
    composerSurface,
    composerForm,
    composerBand,
    approveLink,
    createElement: () => new FakeElement(),
    querySelectorAll(selector) {
      if (selector === 'button') return buttons;
      if (selector === 'h1,h2,h3,[role="heading"],span,div') return [title];
      if (selector === 'a') return [approveLink];
      return [];
    },
    querySelector(selector) {
      if (selector === '[data-testid="composer-surface"]') return composerSurface;
      return null;
    },
  };
}

test('starterKind recognizes every Instructor Assistant quick action', () => {
  assert.equal(theme.starterKind(' Find one of my students '), 'students');
  assert.equal(theme.starterKind('Show my recent lessons'), 'lessons');
  assert.equal(theme.starterKind('Help me schedule a lesson'), 'schedule');
  assert.equal(theme.starterKind("Review a student's practice plan"), 'practice');
  assert.equal(theme.starterKind('Unrelated action'), '');
});

test('decorate applies landing, starter, icon, and composer theme hooks', () => {
  const documentObject = buildThemeDocument();
  assert.deepEqual(theme.decorate(documentObject), { landing: true });
  assert.equal(documentObject.documentElement.dataset.lessonCaddieEmbed, 'true');
  assert.equal(documentObject.body.dataset.lessonCaddieEmbed, 'true');
  assert.equal(documentObject.body.classList.contains('lc-chat-landing'), true);
  assert.equal(documentObject.landingShell.classList.contains('lc-assistant-landing-shell'), true);
  assert.equal(documentObject.buttons[0].classList.contains('lc-conversation-starter'), true);
  assert.equal(documentObject.buttons[0].dataset.lcStarterKind, 'students');
  assert.equal(documentObject.composerSurface.classList.contains('lc-composer-surface'), true);
  assert.equal(documentObject.composerForm.classList.contains('lc-composer-form'), true);
  assert.equal(documentObject.composerBand.classList.contains('lc-composer-band'), true);
  assert.equal(documentObject.approveLink.classList.contains('lc-approve-link'), true);
});

test('decorate marks the chat pane on landing', () => {
  const documentObject = buildThemeDocument();
  const pane = new FakeElement();
  const originalQuery = documentObject.querySelector.bind(documentObject);
  documentObject.querySelector = (selector) => {
    if (selector === '[data-chat-pane]') return pane;
    if (selector === '[data-testid="composer-surface"]') return documentObject.composerSurface;
    return originalQuery(selector);
  };
  assert.deepEqual(theme.decorate(documentObject), { landing: true });
  assert.equal(pane.classList.contains('lc-chat-pane-landing'), true);
});

test('decorate still applies landing layout when starter chips are absent', () => {
  const documentObject = buildThemeDocument();
  const originalAll = documentObject.querySelectorAll.bind(documentObject);
  documentObject.querySelectorAll = (selector) =>
    selector === 'button' ? [] : originalAll(selector);
  assert.deepEqual(theme.decorate(documentObject), { landing: true });
  assert.equal(documentObject.body.classList.contains('lc-chat-landing'), true);
});

test('decorate safely ignores a missing Chat document', () => {
  assert.deepEqual(theme.decorate(null), { landing: false });
  assert.deepEqual(theme.decorate({}), { landing: false });
});

test('looksLikeConfirmationRequest matches write confirmations only', () => {
  assert.equal(
    theme.looksLikeConfirmationRequest('Please confirm the lesson tomorrow at 10:00.'),
    true,
  );
  assert.equal(
    theme.looksLikeConfirmationRequest('Can you confirm the new 60-minute price of $150?'),
    true,
  );
  assert.equal(
    theme.looksLikeConfirmationRequest(
      "I'll move Taylor's lesson to Thursday at 2pm. Does this look right?",
    ),
    true,
  );
  assert.equal(
    theme.looksLikeConfirmationRequest('Are you sure you want to delete this student?'),
    true,
  );
  assert.equal(theme.looksLikeConfirmationRequest('Which student did you mean?'), false);
  assert.equal(theme.looksLikeConfirmationRequest('Booked the lesson for Taylor.'), false);
});

test('decorate injects I approve on the latest confirmation message', () => {
  const documentObject = buildThemeDocument();
  const body = new FakeElement('Please confirm the lesson tomorrow at 10:00.');
  const originalAll = documentObject.querySelectorAll.bind(documentObject);
  documentObject.querySelectorAll = (selector) => {
    if (selector === '.agent-turn [data-testid="message-body"]') return [body];
    if (selector === 'a') return [...originalAll(selector), ...body.children];
    return originalAll(selector);
  };
  theme.decorate(documentObject);
  assert.equal(body.children[0].textContent, 'I approve');
  assert.equal(body.children[0].href, '#lc-approve');
  assert.equal(body.children[0].classList.contains('lc-approve-link'), true);
});
