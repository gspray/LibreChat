'use strict';

(function attachLessonCaddieChatTheme(globalObject) {
  const STARTERS = Object.freeze({
    'find one of my students': 'students',
    'show my recent lessons': 'lessons',
    'help me schedule a lesson': 'schedule',
    'review a student’s practice plan': 'practice',
    "review a student's practice plan": 'practice',
  });

  const ICONS = Object.freeze({
    students:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    lessons:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h3M8 18h6"/></svg>',
    schedule:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="15" height="16" rx="2"/><path d="M14 3v4M7 3v4M3 11h15M18 14v6M15 17h6"/></svg>',
    practice:
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h6M9 3v4M7 5H5a2 2 0 0 0-2 2v13h12"/><path d="m16 18 2 2 4-5"/><path d="M7 11h5M7 15h3"/></svg>',
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

  function decorateStarter(documentObject, button, kind) {
    addClass(button, 'lc-conversation-starter');
    button.dataset.lcStarterKind = kind;
    if (button.querySelector?.('.lc-starter-icon')) {
      return;
    }
    const icon = documentObject.createElement('span');
    icon.className = 'lc-starter-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = ICONS[kind];
    button.prepend(icon);
  }

  function decorateStarters(documentObject) {
    const buttons = Array.from(documentObject.querySelectorAll?.('button') || []);
    const starters = [];
    for (const button of buttons) {
      const kind = starterKind(button.textContent);
      if (!kind) {
        continue;
      }
      decorateStarter(documentObject, button, kind);
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
    const startersVisible = decorateStarters(documentObject);
    const heroVisible = startersVisible && decorateHero(documentObject);
    documentObject.body.classList.toggle('lc-chat-landing', startersVisible && heroVisible);
    decorateComposer(documentObject);
    decorateHeader(documentObject);
    return { landing: startersVisible && heroVisible };
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
