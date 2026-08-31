// Invite links are handled manually here: the classic netlify-identity-widget
// does not show the "set password" form when registration is "Invite only",
// so we call the GoTrue verify API ourselves.
(function () {
  function parseHash() {
    var out = {};
    var h = (window.location.hash || '').replace(/^#/, '');
    if (!h) return out;
    h.split('&').forEach(function (part) {
      var i = part.indexOf('=');
      if (i > 0) out[decodeURIComponent(part.slice(0, i))] = decodeURIComponent(part.slice(i + 1));
    });
    return out;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function loadWidget() {
    if (window.netlifyIdentity) { netlifyIdentity.init(); return; }
    var s = document.createElement('script');
    s.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
    s.onload = function () { if (window.netlifyIdentity) netlifyIdentity.init(); };
    document.head.appendChild(s);
  }

  function inviteEmail(token) {
    try {
      var b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return JSON.parse(atob(b64)).email || '';
    } catch (e) { return ''; }
  }

  function handleInvite(token) {
    var email = inviteEmail(token);

    var css = [
      '#invite-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}',
      '#invite-modal .im-overlay{position:absolute;inset:0;background:rgba(11,31,42,.6)}',
      '#invite-modal .im-box{position:relative;width:92%;max-width:420px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:30px 28px;box-shadow:0 24px 60px rgba(11,31,42,.3);font-family:inherit}',
      '#invite-modal .im-close{position:absolute;top:12px;right:16px;border:0;background:none;font-size:26px;line-height:1;color:var(--muted);cursor:pointer}',
      '#invite-modal .im-kicker{color:var(--teal);font-weight:700;letter-spacing:2px;font-size:12px;text-transform:uppercase;margin:0 0 4px}',
      '#invite-modal h2{margin:0 0 6px;font-size:22px;color:var(--ink)}',
      '#invite-modal .im-email{margin:0 0 20px;font-size:14px;color:var(--muted);word-break:break-all}',
      '#invite-modal .im-email b{color:var(--ink)}',
      '#invite-modal label{display:block;font-weight:600;font-size:13.5px;margin-bottom:6px;color:var(--ink)}',
      '#invite-modal input{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:9px;font-size:15px;font-family:inherit;margin-bottom:18px}',
      '#invite-modal input:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 3px rgba(14,124,107,.15)}',
      '#invite-modal .im-btn{width:100%;padding:12px;border:0;border-radius:10px;background:var(--grad);color:#fff;font-weight:600;font-size:15px;cursor:pointer}',
      '#invite-modal .im-btn:disabled{opacity:.65;cursor:default}',
      '#invite-modal .im-msg{min-height:18px;margin:12px 0 0;font-size:13.5px;color:#b91c1c}',
      '#invite-modal .im-msg.ok{color:var(--teal)}'
    ].join('\n');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var modal = document.createElement('div');
    modal.id = 'invite-modal';
    modal.innerHTML =
      '<div class="im-overlay"></div>' +
      '<div class="im-box">' +
        '<button class="im-close" aria-label="Close" type="button">&times;</button>' +
        '<p class="im-kicker">Invitation</p>' +
        '<h2>Set your password</h2>' +
        '<p class="im-email">' + (email ? 'Account: <b>' + esc(email) + '</b>' : 'Complete your account setup') + '</p>' +
        '<label for="im-password">Password</label>' +
        '<input type="password" id="im-password" placeholder="Create a password (min 6 characters)" autocomplete="new-password">' +
        '<button class="im-btn" id="im-submit" type="button">Set password</button>' +
        '<p class="im-msg" id="im-msg"></p>' +
      '</div>';
    document.body.appendChild(modal);

    var msgEl = document.getElementById('im-msg');
    var btn = document.getElementById('im-submit');
    var input = document.getElementById('im-password');

    modal.querySelector('.im-close').addEventListener('click', function () { modal.remove(); });

    function showMsg(m, ok) {
      msgEl.textContent = m;
      msgEl.className = 'im-msg' + (ok ? ' ok' : '');
    }

    function submit() {
      var password = input.value;
      if (!password) { showMsg('Please enter a password.'); return; }
      if (password.length < 6) { showMsg('Password must be at least 6 characters.'); return; }
      btn.disabled = true; btn.textContent = 'Saving…';

      // Netlify's GoTrue accepts invites via the "signup" type; try it first,
      // and fall back to "invite" if the server doesn't recognize the type.
      var types = ['signup', 'invite'];

      function attempt(i) {
        if (i >= types.length) {
          showMsg('Something went wrong. Please try again.');
          btn.disabled = false; btn.textContent = 'Set password';
          return;
        }
        fetch('/.netlify/identity/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: types[i], token: token, password: password })
        }).then(function (r) {
          return r.json().then(function (j) { return { ok: r.ok, body: j }; });
        }).then(function (res) {
          if (res.ok) {
            showMsg('Success! Redirecting to the editor…', true);
            setTimeout(function () { window.location.href = '/admin/'; }, 1200);
          } else {
            var b = res.body || {};
            var m = b.msg || b.error_description || b.error || b.message || '';
            if (m === 'Verify requires a verification type' && i + 1 < types.length) {
              attempt(i + 1);
            } else {
              showMsg(m || 'Something went wrong. Please try again.');
              btn.disabled = false; btn.textContent = 'Set password';
            }
          }
        }).catch(function () {
          showMsg('Network error. Please try again.');
          btn.disabled = false; btn.textContent = 'Set password';
        });
      }

      attempt(0);
    }

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    input.focus();
  }

  var p = parseHash();
  if (p.invite_token) { handleInvite(p.invite_token); return; }
  if (p.recovery_token || p.confirmation_token) { loadWidget(); }
})();
