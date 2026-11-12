'use strict';

(function attachLessonCaddieChatTheme(globalObject) {
  const LESSON_CADDIE_DEFAULT_APPEARANCE = 'lesson-caddie-default';
  const THEME_STORAGE_KEY = 'color-theme';

  const STARTERS = Object.freeze({
    'find one of my students': 'students',
    'show my recent lessons': 'lessons',
    'help me schedule a lesson': 'schedule',
    'review a student’s practice plan': 'practice',
    "review a student's practice plan": 'practice',
  });

  function normalizeText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function starterKind(value) {
    return STARTERS[normalizeText(value).toLowerCase()] || '';
  }

  function addClass(node, ...names) {
    if (node?.classList?.add) {
      node.classList.add(...names);
    }
  }

  function findExactTextElement(documentObject, expected) {
    const matches = Array.from(
      documentObject.querySelectorAll?.('h1,h2,h3,[role="heading"],span,div') || [],
    ).filter((element) => normalizeText(element.textContent) === expected);
    return matches.sort(
      (left, right) =>
        (left.querySelectorAll?.('*').length || 0) - (right.querySelectorAll?.('*').length || 0),
    )[0];
  }

  function decorateTitleCharacters(title) {
    const leaves = Array.from(title?.querySelectorAll?.('span') || []).filter(
      (element) => !element.children?.length && normalizeText(element.textContent),
    );
    if (!leaves.length) {
      return;
    }
    let characterOffset = 0;
    for (const leaf of leaves) {
      const text = String(leaf.textContent || '');
      const nextOffset = characterOffset + text.length;
      addClass(
        leaf,
        nextOffset > 'Instructor '.length
          ? 'lc-assistant-title--accent'
          : 'lc-assistant-title--base',
      );
      characterOffset = nextOffset;
    }
  }

  function findNamedLandingTitle(documentObject) {
    return (
      findExactTextElement(documentObject, 'Instructor Assistant') ||
      findExactTextElement(documentObject, 'Student Caddie')
    );
  }

  function findHeroRow(title) {
    let current = title?.parentElement || null;
    for (let depth = 0; current && depth < 6; depth += 1) {
      if (
        current.querySelector?.('img, .avatar-stroke') &&
        normalizeText(current.textContent).includes('Instructor Assistant')
      ) {
        return current;
      }
      current = current.parentElement;
    }
    return title?.parentElement || null;
  }

  function decorateHero(documentObject) {
    const title = findExactTextElement(documentObject, 'Instructor Assistant');
    if (!title) {
      return false;
    }
    addClass(title, 'lc-assistant-title');
    decorateTitleCharacters(title);

    const titleWrap = title.parentElement;
    addClass(titleWrap, 'lc-assistant-title-wrap');

    const heroRow = findHeroRow(title);
    addClass(heroRow, 'lc-assistant-hero-row');
    const avatar = heroRow?.querySelector?.('.avatar-stroke') || heroRow?.querySelector?.('img');
    addClass(avatar?.parentElement || avatar, 'lc-default-agent-icon');

    if (heroRow && !heroRow.querySelector?.('.lc-assistant-mark')) {
      const mark = documentObject.createElement('div');
      mark.className = 'lc-assistant-mark';
      mark.setAttribute('aria-hidden', 'true');
      heroRow.prepend(mark);
    }

    const content = heroRow?.parentElement;
    addClass(content, 'lc-assistant-landing-content');
    addClass(content?.parentElement, 'lc-assistant-landing-shell');
    const descriptions = Array.from(content?.querySelectorAll?.('p,div') || []).filter(
      (element) => {
        const text = normalizeText(element.textContent);
        return (
          text.startsWith('Your AI assistant for') ||
          text.startsWith('Welcome! I’m Instructor Assistant')
        );
      },
    );
    descriptions.sort(
      (left, right) =>
        (left.querySelectorAll?.('*').length || 0) - (right.querySelectorAll?.('*').length || 0),
    );
    addClass(descriptions[0], 'lc-assistant-description');
    return true;
  }

  function decorateStarters(documentObject) {
    const managed = documentObject.querySelector?.(
      '.lc-conversation-starters[data-lc-managed="true"]',
    );
    if (managed) {
      addClass(managed, 'lc-conversation-starters');
      return managed.querySelectorAll('.lc-conversation-starter-chip').length >= 1;
    }
    const buttons = Array.from(documentObject.querySelectorAll?.('button') || []);
    const starters = [];
    for (const button of buttons) {
      const kind = starterKind(button.textContent);
      if (!kind) {
        continue;
      }
      addClass(button, 'lc-conversation-starter');
      button.dataset.lcStarterKind = kind;
      starters.push(button);
    }
    if (starters.length >= 2) {
      const parent = starters[0].parentElement;
      if (parent && starters.every((button) => button.parentElement === parent)) {
        addClass(parent, 'lc-conversation-starters');
      }
      return true;
    }
    return false;
  }

  function looksLikeCompletedWrite(text) {
    return /\b(saved|created|booked|deleted|updated successfully|i('ve| have) (created|booked|saved|deleted|updated|sent))\b/.test(
      text,
    );
  }

  function looksLikePermissionOrProceedAsk(text) {
    return /\b(good to proceed|okay to proceed|ok to proceed|to proceed|proceed with|go ahead|shall i\b|should i\b|may i\b|want me to\b|ok to\b|okay to\b|permission to|ready when you|ready to proceed|if you('d| would) like me to|wait for (your )?(ok|okay|approval|confirmation|go-ahead)|let me know if (this|that|that'?s) (is )?(good|ok|okay|correct|right)|if (this|that|that'?s) (looks|sounds|is|are)?\s*(right|correct|good|ok|okay)|if (this|that) works|is (this|that) (ok|okay|alright|good)|does (this|that) (look|sound))\b/.test(
      text,
    );
  }

  function looksLikeConfirmationRequest(value) {
    const text = normalizeText(value).toLowerCase();
    if (!text || text.includes('i approve')) {
      return false;
    }
    if (looksLikeCompletedWrite(text)) {
      return false;
    }
    if (looksLikePermissionOrProceedAsk(text)) {
      return true;
    }
    const confirmCue =
      /\b(please confirm|can you confirm|could you confirm|confirm (this|these|that|the|it)|to confirm|your confirmation|awaiting confirmation|are you sure|once you confirm|after you confirm|say yes|reply (with )?yes|ready to (save|send|book|create|delete|update)|may i (create|book|save|delete|update|send|add|change|move|schedule))\b/;
    const writeCue =
      /\b(create|book|save|delete|update|send|add|change|move|share|charge|message|lessons?|students?|playbook|prices?|notice|practice|schedule|scheduled|mock)\b/;
    return confirmCue.test(text) && writeCue.test(text);
  }

  function isApproveHref(href) {
    const value = String(href || '')
      .trim()
      .toLowerCase();
    return value === '#lc-approve' || value.endsWith('#lc-approve');
  }

  function isApproveLabel(text) {
    return normalizeText(text).toLowerCase() === 'i approve';
  }

  function linkHref(link) {
    if (link && typeof link.getAttribute === 'function') {
      const fromAttr = link.getAttribute('href');
      if (fromAttr) {
        return fromAttr;
      }
    }
    return link?.href || '';
  }

  function findApproveLinks(root) {
    const seen = new Set();
    const matches = [];
    for (const selector of ['a[href]', 'a']) {
      for (const link of Array.from(root?.querySelectorAll?.(selector) || [])) {
        if (seen.has(link)) {
          continue;
        }
        seen.add(link);
        if (isApproveHref(linkHref(link)) || isApproveLabel(link.textContent)) {
          matches.push(link);
        }
      }
    }
    return matches;
  }

  function dedupeApproveLinks(body) {
    const links = findApproveLinks(body);
    if (links.length <= 1) {
      return;
    }
    const keep =
      links.find((link) => link.dataset.lcInjectedApprove !== 'true') || links[links.length - 1];
    for (const link of links) {
      if (link !== keep) {
        link.remove();
      }
    }
  }

  function removePlainApproveDuplicates(body) {
    if (!findApproveLinks(body).length) {
      return;
    }
    for (const block of Array.from(body.querySelectorAll?.('p, div, li, span') || [])) {
      if (block.querySelector?.('a[href]')) {
        continue;
      }
      if (isApproveLabel(block.textContent) && normalizeText(block.textContent).length <= 12) {
        block.remove();
      }
    }
  }

  function injectApproveControl(documentObject) {
    const bodies = Array.from(
      documentObject.querySelectorAll?.('.agent-turn [data-testid="message-body"]') || [],
    );
    const last = bodies[bodies.length - 1];
    if (!last || findApproveLinks(last).length > 0) {
      return false;
    }
    if (!looksLikeConfirmationRequest(last.textContent)) {
      return false;
    }
    const link = documentObject.createElement('a');
    link.href = '#lc-approve';
    link.textContent = 'I approve';
    link.dataset.lcInjectedApprove = 'true';
    addClass(link, 'lc-approve-link');
    last.appendChild(link);
    return true;
  }

  function decorateApproveLinks(documentObject) {
    const bodies = Array.from(
      documentObject.querySelectorAll?.('.agent-turn [data-testid="message-body"]') || [],
    );
    const last = bodies[bodies.length - 1];
    if (last) {
      dedupeApproveLinks(last);
      removePlainApproveDuplicates(last);
    }
    injectApproveControl(documentObject);
    for (const link of findApproveLinks(documentObject)) {
      addClass(link, 'lc-approve-link');
    }
  }

  function decorateComposer(documentObject) {
    const surface = documentObject.querySelector?.('[data-testid="composer-surface"]');
    addClass(surface, 'lc-composer-surface');
    const form = surface?.closest?.('form');
    addClass(form, 'lc-composer-form');
    addClass(form?.parentElement, 'lc-composer-band');
  }

  function decorateHeader(documentObject) {
    const sidebarButton = documentObject.querySelector?.(
      '[data-testid="header-open-sidebar-button"]',
    );
    addClass(sidebarButton?.closest?.('div[class*="absolute"][class*="top-0"]'), 'lc-chat-header');
  }

  function readAppearanceMode() {
    try {
      return globalObject.localStorage?.getItem(THEME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  function syncColorThemeAttributes(documentObject) {
    const root = documentObject?.documentElement;
    const body = documentObject?.body;
    if (!root || !body) {
      return;
    }
    const lessonCaddieDefault = readAppearanceMode() === LESSON_CADDIE_DEFAULT_APPEARANCE;
    root.dataset.lessonCaddieEmbed = 'true';
    body.dataset.lessonCaddieEmbed = 'true';
    if (typeof root.toggleAttribute === 'function') {
      root.toggleAttribute('data-lesson-caddie-color-theme', lessonCaddieDefault);
      body.toggleAttribute('data-lesson-caddie-color-theme', lessonCaddieDefault);
    }
    if (lessonCaddieDefault) {
      root.dataset.lessonCaddieColorTheme = 'default';
      body.dataset.lessonCaddieColorTheme = 'default';
    } else {
      delete root.dataset.lessonCaddieColorTheme;
      delete body.dataset.lessonCaddieColorTheme;
    }
  }

  function isNewChatLanding(documentObject) {
    const checker = globalObject.LessonCaddieConversationStarters?.isNewChatLanding;
    if (typeof checker === 'function') {
      return checker(documentObject);
    }
    const pane = documentObject.querySelector?.('[data-chat-pane]') || documentObject.body;
    return !pane?.querySelector?.(
      '[data-testid="message-body"], .user-turn, .agent-turn, [data-system-turn="true"]',
    );
  }

  function decorate(documentObject) {
    if (!documentObject?.documentElement || !documentObject?.body) {
      return { landing: false };
    }
    syncColorThemeAttributes(documentObject);
    const newChat = isNewChatLanding(documentObject);
    if (newChat) {
      decorateStarters(documentObject);
    }
    const namedTitle = newChat ? findNamedLandingTitle(documentObject) : null;
    if (newChat) {
      decorateHero(documentObject);
    }
    const composer = Boolean(documentObject.querySelector?.('[data-testid="composer-surface"]'));
    const landingActive = Boolean(newChat && namedTitle);
    // Student Caddie sets showOnLanding: false, so the named title never appears.
    // Keep the pane hidden only while the new-chat shell is still mounting.
    const landingPending = Boolean(newChat && !namedTitle && !composer);
    documentObject.body.classList.toggle('lc-chat-landing', landingActive);
    documentObject.body.classList.toggle('lc-chat-landing-pending', landingPending);
    const pane = documentObject.querySelector?.('[data-chat-pane]');
    if (landingActive) {
      addClass(pane, 'lc-chat-pane-landing');
    } else {
      pane?.classList?.remove?.('lc-chat-pane-landing');
    }
    decorateComposer(documentObject);
    decorateHeader(documentObject);
    decorateApproveLinks(documentObject);
    notifyShellIfReady({
      landing: landingActive,
      pending: landingPending,
      composer: Boolean(documentObject.querySelector?.('[data-testid="composer-surface"]')),
    });
    return { landing: landingActive };
  }

  let notifiedReady = false;
  function notifyShellIfReady(state) {
    if (notifiedReady) {
      return;
    }
    if (!(globalObject.parent && globalObject.parent !== globalObject)) {
      return;
    }
    const ready = state?.landing === true || (state?.composer && state?.pending !== true);
    if (!ready) {
      return;
    }
    notifiedReady = true;
    try {
      globalObject.parent.postMessage(
        {
          source: 'lessoncaddie-assistant',
          type: 'theme-ready',
          version: 1,
          landing: state.landing === true,
        },
        '*',
      );
    } catch {
      notifiedReady = false;
    }
  }

  const api = Object.freeze({
    decorate,
    normalizeText,
    starterKind,
    looksLikeConfirmationRequest,
    findApproveLinks,
    dedupeApproveLinks,
    findNamedLandingTitle,
  });

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  globalObject.LessonCaddieChatTheme = api;

  const documentObject = globalObject.document;
  if (!documentObject) {
    return;
  }

  if (documentObject.body) {
    syncColorThemeAttributes(documentObject);
  } else {
    documentObject.addEventListener(
      'DOMContentLoaded',
      () => syncColorThemeAttributes(documentObject),
      { once: true },
    );
  }

  let scheduled = false;
  const scheduleDecorate = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    const run = () => {
      scheduled = false;
      decorate(documentObject);
    };
    if (typeof globalObject.requestAnimationFrame === 'function') {
      globalObject.requestAnimationFrame(run);
    } else {
      globalObject.setTimeout(run, 0);
    }
  };

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', scheduleDecorate, { once: true });
  } else {
    scheduleDecorate();
  }

  globalObject.addEventListener?.('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      syncColorThemeAttributes(documentObject);
      scheduleDecorate();
    }
  });

  const observer = new globalObject.MutationObserver(() => {
    syncColorThemeAttributes(documentObject);
    scheduleDecorate();
  });
  observer.observe(documentObject.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})(typeof window === 'object' ? window : globalThis);
