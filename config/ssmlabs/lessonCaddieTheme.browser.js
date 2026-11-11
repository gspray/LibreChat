'use strict';

(function attachLessonCaddieChatTheme(globalObject) {
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

  function hideNode(node) {
    if (!node) {
      return;
    }
    node.hidden = true;
    if (node.style) {
      node.style.display = 'none';
    }
  }

  function hideStarters(documentObject) {
    const buttons = Array.from(documentObject.querySelectorAll?.('button') || []);
    const starters = [];
    for (const button of buttons) {
      const kind = starterKind(button.textContent);
      if (!kind) {
        continue;
      }
      addClass(button, 'lc-conversation-starter');
      button.dataset.lcStarterKind = kind;
      hideNode(button);
      starters.push(button);
    }
    if (!starters.length) {
      return false;
    }
    const parent = starters[0].parentElement;
    if (parent && starters.every((button) => button.parentElement === parent)) {
      addClass(parent, 'lc-conversation-starters');
      hideNode(parent);
    }
    return true;
  }

  function decorateApproveLinks(documentObject) {
    const links = Array.from(documentObject.querySelectorAll?.('a') || []);
    for (const link of links) {
      if (normalizeText(link.textContent).toLowerCase() === 'i approve') {
        addClass(link, 'lc-approve-link');
      }
    }
  }

  function decorateComposer(documentObject) {
    const surface = documentObject.querySelector?.('[data-testid="composer-surface"]');
    addClass(surface, 'lc-composer-surface');
    addClass(surface?.closest?.('form'), 'lc-composer-form');
  }

  function decorateHeader(documentObject) {
    const sidebarButton = documentObject.querySelector?.(
      '[data-testid="header-open-sidebar-button"]',
    );
    addClass(sidebarButton?.closest?.('div[class*="absolute"][class*="top-0"]'), 'lc-chat-header');
  }

  function decorate(documentObject) {
    if (!documentObject?.documentElement || !documentObject?.body) {
      return { landing: false };
    }
    documentObject.documentElement.dataset.lessonCaddieChatTheme = 'true';
    documentObject.body.dataset.lessonCaddieChatTheme = 'true';
    hideStarters(documentObject);
    const heroVisible = decorateHero(documentObject);
    documentObject.body.classList.toggle('lc-chat-landing', heroVisible);
    decorateComposer(documentObject);
    decorateHeader(documentObject);
    decorateApproveLinks(documentObject);
    return { landing: heroVisible };
  }

  const api = Object.freeze({
    decorate,
    normalizeText,
    starterKind,
  });

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  globalObject.LessonCaddieChatTheme = api;

  const documentObject = globalObject.document;
  if (!documentObject) {
    return;
  }

  documentObject.documentElement.dataset.lessonCaddieChatTheme = 'true';
  if (documentObject.body) {
    documentObject.body.dataset.lessonCaddieChatTheme = 'true';
  }
  if (globalObject.parent && globalObject.parent !== globalObject) {
    globalObject.parent.postMessage(
      { source: 'lessoncaddie-assistant', type: 'theme-ready', version: 1 },
      '*',
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

  const observer = new globalObject.MutationObserver(scheduleDecorate);
  observer.observe(documentObject.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})(typeof window === 'object' ? window : globalThis);
