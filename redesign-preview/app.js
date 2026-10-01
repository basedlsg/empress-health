/* Empress Health prototype — shared layout and interactions.
   The header and footer are rendered here so every page shares one source of truth.
   In the production build these become components. */

document.documentElement.classList.add('js');

/* ---------- site map ---------- */
/* Pricing sits last inside "How Empress works" on purpose: visitors see the value and sign up
   before they reach price details. Competitors (Midi, Evernow, Gennev, Noom) keep pricing out of the top level too. */
var NAV = [
  { label: 'How Empress works', children: [
    { href: 'how-it-works.html',  label: 'How it works' },
    { href: 'ask-empress.html',   label: 'Ask Empress' },
    { href: 'pricing.html',       label: 'Pricing' }
  ]},
  { href: 'marketplace.html', label: 'Shop' },
  { label: 'Learn', children: [
    { href: 'learn.html',   label: 'Articles' },
    { href: 'stories.html', label: 'Community stories' }
  ]},
  { label: 'About', children: [
    { href: 'our-story.html',      label: 'Our Story' },
    { href: 'why-empress.html',    label: "What's EmpressHealth.ai" },
    { href: 'founder-letter.html', label: "Founder's Letter" },
    { href: 'team.html',           label: 'Team' }
  ]}
];

function currentPage() {
  var file = location.pathname.split('/').pop();
  return file === '' ? 'index.html' : file;
}

function logoHTML(onDark) {
  return '<span class="logo' + (onDark ? ' on-dark' : '') + '">' +
           '<span class="logo-mark"><img src="assets/logo.png" alt=""></span>' +
           '<span class="logo-tag">Be You Again!</span>' +
         '</span>';
}

/* ---------- header ---------- */
(function () {
  var slot = document.getElementById('site-header');
  if (!slot) return;
  var page = currentPage();
  var minimal = slot.getAttribute('data-variant') === 'minimal';

  var html = '<a class="skip-link" href="#main">Skip to content</a>' +
    '<div class="container header-inner">' +
      '<a class="brand" href="index.html" aria-label="Empress Health — Be You Again, home">' + logoHTML(false) + '</a>';

  if (minimal) {
    html += '<div class="header-cta" style="margin-left:auto"><span class="microcopy" style="margin:0">Free · 3 minutes · Private</span></div></div>';
  } else {
    html += '<nav class="nav" id="nav" aria-label="Main">';
    NAV.forEach(function (item, i) {
      if (item.children) {
        var active = item.children.some(function (c) { return c.href.split('#')[0] === page; });
        html += '<div class="has-menu' + (active ? ' is-current' : '') + '">' +
          '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="submenu-' + i + '">' + item.label + '</button>' +
          '<div class="submenu" id="submenu-' + i + '">' +
          item.children.map(function (c) {
            return '<a href="' + c.href + '"' + (c.href === page ? ' aria-current="page"' : '') + '>' + c.label + '</a>';
          }).join('') +
          '</div></div>';
      } else {
        html += '<a href="' + item.href + '"' + (item.href === page ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
      }
    });
    /* No "Log in" until Empress Health accounts exist (planned with memberships) — a dead link is worse than none */
    html += '<a class="mobile-only" href="faq.html">FAQ</a>' +
      '</nav>' +
      '<div class="header-cta">' +
        '<a class="btn btn-gold btn-sm" href="assessment.html">Free assessment</a>' +
      '</div>' +
      '<button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu">☰</button>' +
    '</div>';
  }

  slot.className = 'header';
  slot.innerHTML = html;

  /* shrink on scroll */
  var onScroll = function () { slot.classList.toggle('is-scrolled', window.scrollY > 24); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (minimal) return;

  /* mobile menu */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.setAttribute('data-open', String(open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.textContent = open ? '✕' : '☰';
  }
  toggle.addEventListener('click', function () { setMenu(nav.getAttribute('data-open') !== 'true'); });

  /* About dropdown — click/tap and keyboard; hover handled in CSS on desktop */
  nav.querySelectorAll('.has-menu').forEach(function (menu) {
    var btn = menu.querySelector('.menu-btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.getAttribute('data-open') !== 'true';
      /* only one dropdown open at a time, now that there are two */
      nav.querySelectorAll('.has-menu').forEach(function (other) {
        if (other !== menu) {
          other.setAttribute('data-open', 'false');
          other.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
        }
      });
      menu.setAttribute('data-open', String(open));
      btn.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        menu.setAttribute('data-open', 'false');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
    menu.addEventListener('focusout', function (e) {
      if (!menu.contains(e.relatedTarget)) {
        menu.setAttribute('data-open', 'false');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('click', function (e) {
    nav.querySelectorAll('.has-menu[data-open="true"]').forEach(function (menu) {
      if (!menu.contains(e.target)) {
        menu.setAttribute('data-open', 'false');
        menu.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
      }
    });
  });
})();

/* ---------- footer ---------- */
(function () {
  var slot = document.getElementById('site-footer');
  if (!slot) return;
  var minimal = slot.getAttribute('data-variant') === 'minimal';
  var note = '<p class="medical-note">Empress Health provides education and wellness guidance only. It does not diagnose, treat or prescribe, ' +
    'and it is not a substitute for professional medical advice. Always consult your doctor about your health and treatment decisions. ' +
    'If your symptoms are severe or sudden, contact a doctor right away.</p>';
  var bottom = '<div class="footer-bottom"><span>© 2026 Empress Health. All rights reserved.</span>' +
    '<span><a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Accessibility</a> · <a href="#">Cookies</a></span></div>';

  slot.className = 'footer';
  if (minimal) {
    slot.innerHTML = '<div class="container">' + note + bottom + '</div>';
    return;
  }

  slot.innerHTML =
    '<div class="container">' +
      '<div class="footer-top">' +
        '<div><h3>Menopause science, in plain language</h3>' +
        '<p>One email a week: what the research says, what our experts make of it, and what to try. ' +
        '<strong style="color:#fff">Sign up and we\'ll send you a one-time 10% welcome discount on Empress Naturals.</strong></p></div>' +
        '<div><form class="signup js-signup" data-thanks="You\'re on the list — your welcome code is on its way." novalidate>' +
          '<label class="visually-hidden" for="footer-email">Email address</label>' +
          '<input id="footer-email" type="email" placeholder="you@example.com" autocomplete="email" required>' +
          '<button class="btn btn-gold" type="submit">Send my welcome code</button>' +
        '</form><small class="signup-msg">One-time 10% welcome code, sent by email. Members save 10–15% on every order. No spam, unsubscribe anytime.</small></div>' +
      '</div>' +
      '<div class="footer-grid">' +
        '<div class="footer-brand">' + logoHTML(true) +
          '<p>Science-backed support for women in perimenopause and menopause.</p></div>' +
        '<div><h4>How Empress works</h4><ul>' +
          '<li><a href="how-it-works.html">How it works</a></li>' +
          '<li><a href="ask-empress.html">Ask Empress</a></li>' +
          '<li><a href="pricing.html">Pricing</a></li></ul></div>' +
        '<div><h4>Explore</h4><ul>' +
          '<li><a href="assessment.html">Free assessment</a></li>' +
          '<li><a href="marketplace.html">Shop</a></li>' +
          '<li><a href="learn.html">Articles</a></li>' +
          '<li><a href="stories.html">Community stories</a></li></ul></div>' +
        '<div><h4>About</h4><ul>' +
          '<li><a href="our-story.html">Our Story</a></li>' +
          '<li><a href="why-empress.html">What\'s EmpressHealth.ai</a></li>' +
          '<li><a href="founder-letter.html">Founder\'s Letter</a></li>' +
          '<li><a href="team.html">Team</a></li></ul></div>' +
        '<div><h4>Help</h4><ul>' +
          '<li><a href="faq.html">FAQ</a></li>' +
          '<li><a href="mailto:hello@empresshealth.ai">hello@empresshealth.ai</a></li></ul></div>' +
      '</div>' + note + bottom +
    '</div>';
})();

/* ---------- reveal on scroll ---------- */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var index = Array.prototype.indexOf.call(el.parentNode.children, el);
        setTimeout(function () { el.classList.add('in'); }, Math.min(index, 4) * 90);
        io.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  items.forEach(function (el) { io.observe(el); });
})();

/* ---------- Ask Empress chat animation ---------- */
(function () {
  var chat = document.getElementById('chat');
  if (!chat) return;
  var bubbles = chat.querySelectorAll('.bubble');
  var played = false;
  function play() {
    if (played) return;
    played = true;
    bubbles.forEach(function (b) {
      setTimeout(function () { b.classList.add('show'); }, parseInt(b.dataset.delay || '0', 10));
    });
  }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bubbles.forEach(function (b) { b.classList.add('show'); });
    return;
  }
  if (!('IntersectionObserver' in window)) { play(); return; }
  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) { play(); obs.disconnect(); }
  }, { threshold: 0.3 }).observe(chat);
})();

/* ---------- email forms: saved to the Empress API (Postgres) ---------- */
var API_BASE = '';  // same-origin: /api/* is proxied to empresshealth.ai by vercel.json
var ASSESSMENT_URL = 'https://empresshealth.ai/assessment/?tier=paid';
document.addEventListener('submit', function (e) {
  var form = e.target;
  if (!form.classList || !form.classList.contains('js-signup')) return;
  e.preventDefault();
  var input = form.querySelector('input[type=email]');
  var msg = form.parentNode.querySelector('.signup-msg');
  var v = (input.value || '').trim();
  if (!v || v.indexOf('@') < 1 || v.indexOf('.') < 0) {
    if (msg) msg.textContent = 'Please enter a valid email address.';
    input.focus();
    return;
  }
  var isHI = form.classList.contains('intake-form');
  var source = isHI ? 'health-intelligence' : (/ask-empress/.test(location.pathname) ? 'ask-empress' : 'site-' + (location.pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'));
  var ctx = { page: location.pathname };
  form.querySelectorAll('input,select').forEach(function (f) {
    if (f.type !== 'email' && f.id && f.value) ctx[f.id.replace(/^hi-/, '')] = f.value;
  });
  var nameEl = form.querySelector('#hi-name');
  var btn = form.querySelector('button[type=submit]');
  if (btn) btn.disabled = true;
  fetch(API_BASE + '/api/csrf', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (t) {
      return fetch(API_BASE + '/api/capture/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': t.csrfToken },
        body: JSON.stringify({ email: v, firstName: nameEl ? nameEl.value : null, source: source, context: ctx })
      });
    })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && j.ok; }); })
    .catch(function () { return false; })
    .then(function (ok) {
      if (!ok) {
        if (btn) btn.disabled = false;
        if (msg) msg.textContent = "We couldn't save your email just now. Please try again in a moment.";
        return;
      }
      var thanks = form.getAttribute('data-thanks') || "You're on the list. Welcome.";
      var extra = isHI ? '<a class="btn btn-gold" style="margin-top:16px;display:inline-block" href="' + ASSESSMENT_URL + '">Begin my assessment →</a>' : '';
      form.outerHTML = '<div class="signup-done"><p style="margin:0;font-weight:600">✦ ' + thanks + '</p>' + extra + '</div>';
      if (msg && !isHI) msg.textContent = "Saved — we'll be in touch at " + v + '.';
    });
});

/* ---------- tabs (shop categories) ----------
   Without JS every panel shows. With JS, one panel shows at a time; the URL hash picks the
   starting tab, so links like marketplace.html#hair open straight onto Hair care. */
document.querySelectorAll('[data-tabs]').forEach(function (list) {
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  function select(tab, updateHash) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (updateHash && history.replaceState) history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t, true); });
    t.addEventListener('keydown', function (e) {
      var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (next === null) return;
      var target = tabs[(next + tabs.length) % tabs.length];
      target.focus();
      select(target, true);
    });
  });
  function fromHash() {
    return tabs.filter(function (t) { return '#' + t.getAttribute('aria-controls') === location.hash; })[0];
  }
  select(fromHash() || tabs[0], false);
  /* menu links like learn.html#fatigue change only the hash when you're already on the page */
  window.addEventListener('hashchange', function () {
    var t = fromHash();
    if (t) { select(t, false); list.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
