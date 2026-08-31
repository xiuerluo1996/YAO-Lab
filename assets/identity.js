// Shared Netlify Identity bootstrap (loaded on every page).
// Loads the identity widget, initializes it, and makes sure invite links
// reliably open the signup ("set password") form.
(function () {
  function boot() {
    if (!window.netlifyIdentity) return;
    netlifyIdentity.init();

    var hash = window.location.hash || '';
    if (hash.indexOf('invite_token') !== -1) {
      // Give the widget a moment to finish init, then force the signup form.
      setTimeout(function () {
        if (window.netlifyIdentity) netlifyIdentity.open('signup');
      }, 400);
    }
  }

  if (window.netlifyIdentity) {
    boot();
  } else {
    var s = document.createElement('script');
    s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
    s.onload = boot;
    document.head.appendChild(s);
  }
})();
