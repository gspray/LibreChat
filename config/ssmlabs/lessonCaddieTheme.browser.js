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

  function looksLikeConfirmationRequest(value) {
    const text = normalizeText(value).toLowerCase();
    if (!text || text.includes('i approve')) {
      return false;
    }
    if (
      /\b(saved|created|booked|deleted|updated successfully|i('ve| have) (created|booked|saved|deleted|updated|sent))\b/.test(
        text,
      )
    ) {
      return false;
    }
    const confirmCue =
      /\b(please confirm|can you confirm|could you confirm|confirm (this|these|that|the|it)|to confirm|your confirmation|awaiting confirmation|are you sure|shall i\b|should i\b|want me to\b|ok to\b|okay to\b|go ahead|proceed with|if (this|that) (looks|sounds) (right|correct|good)|does (this|that) look|once you confirm|after you confirm|say yes|reply (with )?yes|may i (create|book|save|delete|update|send|add|change|move)|ready to (save|send|book|create|delete|update))\b/;
    const writeCue =
      /\b(create|book|save|delete|update|send|add|change|move|share|charge|message|lesson|student|playbook|price|notice|practice)\b/;
    return confirmCue.test(text) && writeCue.test(text);
  }

  function injectApproveControl(documentObject) {
    const bodies = Array.from(
      documentObject.querySelectorAll?.('.agent-turn [data-testid="message-body"]') || [],
    );
    const last = bodies[bodies.length - 1];
    if (!last || last.querySelector?.('a[href="#lc-approve"], a[href$="#lc-approve"]')) {
      return false;
    }
    if (!looksLikeConfirmationRequest(last.textContent)) {
      return false;
    }
    const link = documentObject.createElement('a');
    link.href = '#lc-approve';
    link.textContent = 'I approve';
    addClass(link, 'lc-approve-link');
    last.appendChild(link);
    return true;
  }

  function decorateApproveLinks(documentObject) {
    injectApproveControl(documentObject);
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

  function decorate(documentObject) {
    if (!documentObject?.documentElement || !documentObject?.body) {
      return { landing: false };
    }
    documentObject.documentElement.dataset.lessonCaddieChatTheme = 'true';
    documentObject.body.dataset.lessonCaddieChatTheme = 'true';
    const startersVisible = decorateStarters(documentObject);
    const heroVisible = decorateHero(documentObject);
    const landingActive = startersVisible || heroVisible;
    documentObject.body.classList.toggle('lc-chat-landing', landingActive);
    if (landingActive) {
      addClass(documentObject.querySelector?.('[data-chat-pane]'), 'lc-chat-pane-landing');
    }
    decorateComposer(documentObject);
    decorateHeader(documentObject);
    decorateApproveLinks(documentObject);
    return { landing: landingActive };
  }

  const api = Object.freeze({
    decorate,
    normalizeText,
    starterKind,
    looksLikeConfirmationRequest,
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
