'use strict';

(function redirectUnauthenticatedLessonCaddieSso() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('local') === '1') {
      return;
    }
    const path = window.location.pathname || '/';
    const isLoginSurface = path === '/' || path === '/login' || path.indexOf('/login') === 0;
    if (!isLoginSurface) {
      return;
    }
    fetch('/api/user', { credentials: 'include' })
      .then(function (response) {
        if (response.ok) {
          return;
        }
        var returnTo = path + window.location.search + window.location.hash;
        if (path === '/' || path === '/login' || path === '/login/') {
          returnTo = '/c/new';
        }
        window.location.replace('/sso/lessoncaddie/start?returnTo=' + encodeURIComponent(returnTo));
      })
      .catch(function () {
        /* stay on login if health check fails */
      });
  } catch (_error) {
    /* ignore */
  }
})();
