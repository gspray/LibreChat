'use strict';

const DEFAULT_HOME_URL = 'https://lessoncaddie.ssmlabs.com/app';

const DESTINATIONS = Object.freeze([
  ['Start Lesson', '/app?view=start-lesson'],
  ['Students', '/app?panel=directory&lc_nav=1'],
  ['Lessons and lesson summaries', '/app?panel=sessions&lc_nav=1'],
  ['Calendar', '/app?panel=calendar&lc_nav=1'],
  ['Library', '/app?panel=library&lc_nav=1'],
  ['Playbook and practice activities', '/app?panel=playbook&lc_nav=1'],
  ['Notices', '/app/notices'],
  ['Add a student', '/app?view=new-student'],
  ['Plans and billing', '/app/profile/billing'],
  ['Payment setup', '/app/settings/payment-setup'],
]);

function resolveLessonCaddieOrigin(homeUrl) {
  try {
    const parsed = new URL(String(homeUrl || DEFAULT_HOME_URL).trim());
    const localHttp =
      parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
    if (parsed.protocol === 'https:' || localHttp) {
      return parsed.origin;
    }
  } catch {
    // Use the reviewed development origin when configuration is missing or malformed.
  }
  return new URL(DEFAULT_HOME_URL).origin;
}

function buildCapabilityLinkInstructions(homeUrl) {
  const origin = resolveLessonCaddieOrigin(homeUrl);
  const links = DESTINATIONS.map(
    ([label, path]) => `- ${label}: [Take me there](${origin}${path})`,
  ).join('\n');
  return `Capability and help links
When answering what you can do, how you can help, or giving a feature overview:
- Include a Markdown link labeled exactly “Take me there” for every app feature you mention when it has a matching destination below.
- Keep the link next to that feature. These links offer navigation; they do not prove the screen opened.
- Never call open_app_screen for a capability, help, or “what can I do” answer. The Markdown links are the navigation.
- Do not invent a destination for capabilities without an app screen, such as weather or local time.
Use only these reviewed destinations:
${links}`;
}

module.exports = {
  DEFAULT_HOME_URL,
  DESTINATIONS,
  resolveLessonCaddieOrigin,
  buildCapabilityLinkInstructions,
};
