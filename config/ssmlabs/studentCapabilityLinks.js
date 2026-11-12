'use strict';

const { resolveLessonCaddieOrigin, DEFAULT_HOME_URL } = require('./instructorCapabilityLinks');

const DESTINATIONS = Object.freeze([
  ['Calendar', '/app?panel=calendar&lc_nav=1'],
  ['Lessons', '/app?panel=sessions&lc_nav=1'],
  ['Practices', '/app?panel=practices&lc_nav=1'],
  ['Rounds', '/app?panel=rounds&lc_nav=1'],
  ['Goals', '/app?panel=goals&lc_nav=1'],
  ['Library', '/app?panel=library&lc_nav=1'],
  ['Playbook', '/app?panel=playbook&lc_nav=1'],
  ['Notifications', '/app/notices'],
]);

function buildStudentCapabilityLinkInstructions(homeUrl) {
  const origin = resolveLessonCaddieOrigin(homeUrl);
  const links = DESTINATIONS.map(
    ([label, path]) => `- ${label}: [Take me there](${origin}${path})`,
  ).join('\n');
  return `Capability and help links
When answering what you can do, how you can help, or giving a feature overview:
- Include a Markdown link labeled exactly “Take me there” for every app feature you mention when it has a matching destination below.
- Keep the link next to that feature. These links offer navigation; they do not prove the screen opened.
- Never call open_app_screen for a capability, help, or “what can I do” answer. The Markdown links are the navigation.
Use only these reviewed destinations:
${links}`;
}

module.exports = {
  DEFAULT_HOME_URL,
  DESTINATIONS,
  resolveLessonCaddieOrigin,
  buildStudentCapabilityLinkInstructions,
};
