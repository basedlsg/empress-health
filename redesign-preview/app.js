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
    /* No badge in the top menu by choice — the footer link and the page itself carry it.
       Re-add `tag: 'Waitlist'` here to bring it back. */
    { href: 'ask-empress.html',   label: 'Ask Empress' },
    { href: 'pricing.html',       label: 'Pricing' }
  ]},
  { href: 'marketplace.html', label: 'Shop' },
  { label: 'Learn', children: [
    { href: 'learn.html',   label: 'Articles' },
    { href: 'stories.html', label: 'Community stories' },
    { href: 'ebook-guides.html', label: 'E-books & guides' }
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

/* ---------- social links ----------
   Instagram first, as requested. Facebook, YouTube and Pinterest are waiting on Empress Health's own
   handles — the ones we know belong to Empress Naturals, so they are left out rather than sending
   women to the sister brand. */
var SOCIAL = [
  { name: 'Instagram', href: 'https://www.instagram.com/empresshealth.ai/',
    path: 'M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.44 2.21 8.84 2.2 12 2.2zm0 5.13A4.67 4.67 0 1 0 16.67 12 4.67 4.67 0 0 0 12 7.33zm0 7.7A3.03 3.03 0 1 1 15.03 12 3.03 3.03 0 0 1 12 15.03zm5.95-7.89a1.09 1.09 0 1 1-1.09-1.09 1.09 1.09 0 0 1 1.09 1.09z' },
  /* TikTok is the Empress Naturals handle — the growth channel the team is investing in.
     Swap the href the day Empress Health has its own. */
  { name: 'TikTok', href: 'https://www.tiktok.com/@empress_naturals',
    path: 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z' },
  /* Facebook (facebook.com/empresshealthai) is ready to add back once the page has more followers */
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/empresshealthai/',
    path: 'M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9.5h4v11H3v-11zm7 0h3.8v1.5h.06a4.2 4.2 0 0 1 3.77-2.07c4.03 0 4.77 2.65 4.77 6.1v5.47h-4v-4.85c0-1.16-.02-2.65-1.62-2.65-1.62 0-1.87 1.26-1.87 2.57v4.93h-4v-11z' }
];

function socialHTML() {
  return '<p class="follow-label">Follow along</p>' +
    '<ul class="social" aria-label="Empress Health on social media">' +
    SOCIAL.map(function (s) {
      return '<li><a href="' + s.href + '" target="_blank" rel="noopener" aria-label="Empress Health on ' + s.name + '">' +
        '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="' + s.path + '"></path></svg></a></li>';
    }).join('') + '</ul>';
}

/* ---------- follow prompts ----------
   One source of truth for the handles. Any element with data-follow is filled with a row of
   named chips; the attribute value is the line that introduces them. Used on Community stories,
   the home community band and the assessment results — always after an email has been asked for,
   never instead of asking. */
function socialByName(name) {
  for (var i = 0; i < SOCIAL.length; i++) if (SOCIAL[i].name === name) return SOCIAL[i];
  return null;
}

function followChipsHTML(names) {
  return (names || ['Instagram', 'TikTok']).map(function (n) {
    var s = socialByName(n);
    if (!s) return '';
    return '<a class="follow-chip" href="' + s.href + '?utm_source=website&utm_medium=follow" ' +
      'target="_blank" rel="noopener">' +
      '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="' + s.path + '"></path></svg>' + s.name + '</a>';
  }).join('');
}

(function () {
  document.querySelectorAll('[data-follow]').forEach(function (slot) {
    var lead = slot.getAttribute('data-follow');
    slot.className = (slot.className ? slot.className + ' ' : '') + 'follow-row';
    slot.innerHTML = (lead ? '<span class="follow-lead">' + lead + '</span>' : '') + followChipsHTML();
  });
})();

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
            return '<a href="' + c.href + '"' + (c.href === page ? ' aria-current="page"' : '') + '>' + c.label +
              (c.tag ? '<span class="nav-tag">' + c.tag + '</span>' : '') + '</a>';
          }).join('') +
          '</div></div>';
      } else {
        html += '<a href="' + item.href + '"' + (item.href === page ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
      }
    });
    /* "Log in" sits in the mobile menu as well, since the header version is hidden on small screens */
    html += '<a class="mobile-only" href="account.html"' + (page === 'account.html' ? ' aria-current="page"' : '') + '>Log in</a>' +
      '<a class="mobile-only" href="faq.html">FAQ</a>' +
      '</nav>' +
      '<div class="header-cta">' +
        '<a class="login-link" href="account.html"' + (page === 'account.html' ? ' aria-current="page"' : '') + '>Log in</a>' +
        '<a class="btn btn-gold btn-sm" href="free-assessment.html">Free assessment</a>' +
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
  /* Ported into this site so the footer no longer drops people into the old design and its
     old navigation. "Terms" is deliberately absent: every URL variant 404s, and a dead legal
     link is worse than a missing one. Add it back here the day the page exists. */
  var LEGAL = [
    ['Privacy',       'privacy.html'],
    ['Accessibility', 'accessibility.html'],
    ['Cookies',       'cookies.html']
  ];
  var bottom = '<div class="footer-bottom"><span>© 2026 Empress Health. All rights reserved.</span>' +
    '<span>' + LEGAL.map(function (l) {
      return '<a href="' + l[1] + '">' + l[0] + '</a>';
    }).join(' · ') + '</span></div>';

  slot.className = 'footer';
  if (minimal) {
    slot.innerHTML = '<div class="container">' + note + bottom + '</div>';
    return;
  }

  slot.innerHTML =
    '<div class="container">' +
      '<div class="footer-top">' +
        '<div><h3>Menopause science, in plain language</h3>' +
        '<p>One email a week: what the research says, what our experts make of it, and what to try.</p></div>' +
        '<div><form class="signup js-signup" data-source="newsite-footer-newsletter" ' +
          'data-thanks="You\'re on the list. We\'ll be in touch." novalidate>' +
          '<label class="visually-hidden" for="footer-email">Email address</label>' +
          '<input id="footer-email" type="email" placeholder="you@example.com" autocomplete="email" required>' +
          '<button class="btn btn-gold" type="submit">Join the updates list</button>' +
        '</form><small class="signup-msg">We save your email so we can contact you about Empress Health.</small></div>' +
      '</div>' +
      '<div class="footer-grid">' +
        '<div class="footer-brand">' + logoHTML(true) +
          '<p>Science-backed support for women in perimenopause and menopause.</p>' +
          socialHTML() + '</div>' +
        '<div><h4>How Empress works</h4><ul>' +
          '<li><a href="how-it-works.html">How it works</a></li>' +
          '<li><a href="ask-empress.html">Ask Empress <span class="nav-tag">Waitlist</span></a></li>' +
          '<li><a href="pricing.html">Pricing</a></li></ul></div>' +
        '<div><h4>Explore</h4><ul>' +
          '<li><a href="free-assessment.html">Free assessment</a></li>' +
          '<li><a href="marketplace.html">Shop</a></li>' +
          '<li><a href="learn.html">Articles</a></li>' +
          '<li><a href="stories.html">Community stories</a></li>' +
          '<li><a href="ebook-guides.html">E-books &amp; guides</a></li></ul></div>' +
        '<div><h4>About</h4><ul>' +
          '<li><a href="our-story.html">Our Story</a></li>' +
          '<li><a href="why-empress.html">What\'s EmpressHealth.ai</a></li>' +
          '<li><a href="founder-letter.html">Founder\'s Letter</a></li>' +
          '<li><a href="team.html">Team</a></li></ul></div>' +
        '<div><h4>Help</h4><ul>' +
          '<li><a href="account.html">Log in</a></li>' +
          '<li><a href="faq.html">FAQ</a></li>' +
          '<li><a href="mailto:hello@empresshealth.ai">hello@empresshealth.ai</a></li></ul></div>' +
      '</div>' + note + bottom +
    '</div>';
})();

/* ---------- arriving on a cross-page anchor ----------
   html{scroll-behavior:smooth} is right for in-page clicks, but it also animates the landing
   when you arrive from another page — team.html#experts scrolls through the whole team page
   before settling. Jump straight there instead, then hand smooth scrolling back.
   Pages with tabs are skipped: there the hash picks a panel, which app.js handles already. */
(function () {
  if (!location.hash || document.querySelector('[data-tabs]')) return;
  var target;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; }
  if (!target) return;

  var root = document.documentElement;
  function jump() {
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    target.scrollIntoView();          /* scroll-padding-top clears the sticky header */
    requestAnimationFrame(function () { root.style.scrollBehavior = prev; });
  }
  jump();
  /* images finish loading after this and shift the page, so land again once they have */
  window.addEventListener('load', jump, { once: true });
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

/* ---------- email forms ----------
   Sign-ups go to the same endpoint the live free assessment uses. Browsers only allow this call from
   empresshealth.ai itself, so on the preview and on Vercel it fails quietly and she still sees the
   thank-you; the note underneath says whether it was stored. Each form names itself with data-source. */
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
  var source = form.getAttribute('data-source') ||
    (/ask-empress/.test(location.pathname) ? 'ask-empress' : 'site-' + (location.pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'));
  var ctx = { page: location.pathname };
  form.querySelectorAll('input,select').forEach(function (field) {
    if (field.type !== 'email' && field.id && field.value) ctx[field.id.replace(/^hi-/, '')] = field.value;
  });
  var nameEl = form.querySelector('#hi-name');
  var btn = form.querySelector('button[type=submit]');
  if (isHI && (!nameEl || !nameEl.value.trim() || !/^\d+$/.test(ctx.age || '') ||
      Number(ctx.age) < 18 || Number(ctx.age) > 120 || !ctx.state || !/^\d{5}$/.test(ctx.zip || ''))) {
    if (msg) msg.textContent = 'Please enter your first name, age, state, and five-digit ZIP code.';
    return;
  }
  if (btn) btn.disabled = true;
  fetch('/api/csrf', { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('CSRF unavailable'); return r.json(); })
    .then(function (csrf) {
      return fetch(isHI ? '/api/assessment/intake-handoff' : '/api/capture/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.csrfToken },
        body: JSON.stringify(isHI
          ? { email: v, firstName: nameEl.value.trim(), age: Number(ctx.age), state: ctx.state, zip: ctx.zip, phone: ctx.phone || '' }
          : { email: v, firstName: nameEl ? nameEl.value.trim() : null, source: source, context: ctx })
      });
    })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (data) { return r.ok && data.ok ? data : null; }); })
    .catch(function () { return null; })
    .then(function (saved) {
      if (!saved) {
        if (btn) btn.disabled = false;
        if (msg) msg.textContent = "We couldn't save your details just now. Please try again in a moment.";
        return;
      }
      if (isHI) {
        if (msg) msg.textContent = 'Saved. Opening your member assessment…';
        location.assign('/assessment?tier=paid&intake=' + encodeURIComponent(saved.token));
        return;
      }
      var thanks = form.getAttribute('data-thanks') || "You're on the list. Welcome.";
      var done = document.createElement('p');
      done.className = 'signup-done';
      done.textContent = '✦ ' + thanks;
      form.parentNode.replaceChild(done, form);
      if (msg) msg.textContent = "Saved — we'll be in touch at " + v + '.';
      var follow = document.createElement('p');
      follow.className = 'follow-row follow-after';
      follow.innerHTML = '<span class="follow-lead">We post the short version daily</span>' + followChipsHTML();
      done.parentNode.insertBefore(follow, done.nextSibling);
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
