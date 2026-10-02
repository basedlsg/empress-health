/*!
 * Empress Health - shared inline email capture.
 *
 * One dependency-free script that turns "Subscribe" / "Get Notified" links
 * (which used to dump visitors on the contact form) into a real inline email
 * form, and mounts the same form into any <div data-email-capture> placeholder.
 *
 *   POST /api/capture/email  { email, source }   (same-origin, no CSRF token)
 *
 * Placeholder usage (community, daily affirmations, ...):
 *   <div data-email-capture data-source="community-waitlist"
 *        data-cta="Join the waitlist" data-variant="inline"></div>
 *
 * Optional data attributes: data-source (^[a-z0-9-]{1,60}$), data-cta (button
 * text), data-label (accessible input label), data-placeholder, data-success
 * (success message), data-variant ("menu" stacked / "inline" row).
 *
 * Idempotent: running twice never injects twice. Never throws if the markup
 * it looks for is absent.
 */
(function () {
  'use strict';

  if (window.EmpressEmailCapture) return;

  var ENDPOINT = '/api/capture/email';
  var SOURCE_RE = /^[a-z0-9-]{1,60}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var SUCCESS_TEXT = 'Thanks — you’re on the list.';
  var STYLE_ID = 'eh-capture-css';
  var seq = 0;

  /* ---------- helpers ---------- */

  // newsletter-<slug>: lowercase, [^a-z0-9] -> '-', trimmed, max 40 chars, '' -> 'home'
  function pathSlug(pathname) {
    var s = String(pathname || '').toLowerCase()
      .replace(/\.html?$/, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/, '');
    return (!s || s === 'index') ? 'home' : s;
  }

  function newsletterSource() {
    var loc = window.location || {};
    return 'newsletter-' + pathSlug(loc.pathname);
  }

  function make(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) node.setAttribute(k, attrs[k]);
      }
    }
    return node;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      /* Reset anything a page's global form/input/button rules would otherwise impose. */
      'form.eh-capture{display:block;width:100%;max-width:none;margin:0;padding:0;background:none;border:0;border-radius:0;box-shadow:none;text-align:left;font-family:inherit;font-size:16px;line-height:1.4;color:var(--ink,#3f144a)}',
      '.eh-capture-host{display:block;min-width:0}',
      '.eh-capture-host--inline{flex:1 1 100%;width:100%;max-width:440px;margin-left:auto;margin-right:auto}',
      '.eh-capture .eh-capture__label{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',
      '.eh-capture .eh-capture__row{display:flex;flex-direction:column;gap:8px;margin:0}',
      '.eh-capture--inline .eh-capture__row{flex-direction:row;flex-wrap:wrap;align-items:stretch}',
      '.eh-capture .eh-capture__input{box-sizing:border-box;display:block;width:100%;min-width:0;min-height:42px;margin:0;padding:8px 12px;border:1px solid var(--border,#ececec);border-radius:10px;background:#fff;color:var(--ink,#3f144a);font:inherit;font-size:16px;line-height:1.3;box-shadow:none;transition:border-color .15s,box-shadow .15s}',
      '.eh-capture--inline .eh-capture__input{flex:1 1 200px;width:auto}',
      '.eh-capture .eh-capture__input::placeholder{color:var(--muted,#705177);opacity:.8}',
      '.eh-capture .eh-capture__input:focus,.eh-capture .eh-capture__input:focus-visible{outline:2px solid var(--primary,var(--plum,#3f144a));outline-offset:1px;border-color:var(--primary,var(--plum,#3f144a));box-shadow:none}',
      '.eh-capture .eh-capture__input[aria-invalid="true"]{border-color:#a3262a}',
      '.eh-capture .eh-capture__btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:42px;margin:0;padding:8px 14px;border:0;border-radius:10px;background:var(--primary,var(--plum,#3f144a));color:#fff;font:inherit;font-size:15px;font-weight:700;line-height:1.2;white-space:nowrap;cursor:pointer;box-shadow:none;transition:background .15s,color .15s,opacity .15s}',
      '.eh-capture--inline .eh-capture__btn{flex:0 0 auto;width:auto;padding:8px 20px}',
      '.eh-capture .eh-capture__btn:hover:not(:disabled){background:var(--accent-hover,var(--gold,#d29f13));color:var(--accent-ink,var(--plum,#3f144a))}',
      '.eh-capture .eh-capture__btn:focus-visible{outline:2px solid var(--primary,var(--plum,#3f144a));outline-offset:2px}',
      '.eh-capture .eh-capture__btn:disabled{opacity:.65;cursor:progress}',
      '.eh-capture .eh-capture__status{margin:0;padding:0;font-size:13px;line-height:1.4;color:var(--muted,#705177)}',
      '.eh-capture .eh-capture__status:not(:empty){margin-top:8px}',
      '.eh-capture .eh-capture__status.is-error{color:#a3262a;font-weight:600}',
      '.eh-capture .eh-capture__status.is-success{color:var(--ink,#3f144a);font-weight:600}',
      '.eh-capture.is-done .eh-capture__row{display:none}',
      '.eh-capture.is-done .eh-capture__status{font-size:14px}'
    ].join('\n');
    var style = make('style', '', { id: STYLE_ID });
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  function messageFor(status, data) {
    if (data && typeof data.error === 'string' && data.error) return data.error;
    if (status >= 200 && status < 300) return 'We couldn\u2019t confirm that your email was saved. Please try again.';
    if (status === 429) return 'Too many attempts right now — please wait a few minutes and try again.';
    if (status === 503) return 'We can’t save your email right now. Please try again in a moment.';
    if (status === 400) return 'Please enter a valid email address.';
    return 'Something went wrong (error ' + status + '). Please try again.';
  }

  function postEmail(email, source) {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;
    var init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email: email, source: source })
    };
    if (controller) init.signal = controller.signal;
    return fetch(ENDPOINT, init).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        return { ok: res.ok, status: res.status, data: data };
      });
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  /* ---------- widget ---------- */

  function mount(host, opts) {
    if (!host || host.nodeType !== 1) return null;
    if (host.getAttribute('data-eh-capture-mounted') === '1') return null;
    opts = opts || {};

    var attr = function (name) { return host.getAttribute('data-' + name); };
    var source = opts.source || attr('source') || newsletterSource();
    if (!SOURCE_RE.test(source)) source = 'site';
    var variant = (opts.variant || attr('variant') || 'menu') === 'inline' ? 'inline' : 'menu';
    var ctaText = opts.cta || attr('cta') || 'Subscribe';
    var successText = opts.success || attr('success') || SUCCESS_TEXT;
    var labelText = opts.label || attr('label') || 'Email address';
    var placeholder = opts.placeholder || attr('placeholder') || 'you@example.com';

    injectStyles();
    seq += 1;
    var id = 'eh-capture-' + seq;

    var form = make('form', 'eh-capture eh-capture--' + variant, { novalidate: 'novalidate' });
    var label = make('label', 'eh-capture__label', { 'for': id + '-email' });
    label.textContent = labelText;
    var row = make('div', 'eh-capture__row');
    var input = make('input', 'eh-capture__input', {
      type: 'email', id: id + '-email', name: 'email', autocomplete: 'email',
      inputmode: 'email', placeholder: placeholder, maxlength: '200',
      'aria-describedby': id + '-status'
    });
    var button = make('button', 'eh-capture__btn', { type: 'submit' });
    button.textContent = ctaText;
    var status = make('div', 'eh-capture__status', { id: id + '-status', 'aria-live': 'polite' });

    row.appendChild(input);
    row.appendChild(button);
    form.appendChild(label);
    form.appendChild(row);
    form.appendChild(status);

    var sending = false;

    function setStatus(kind, text) {
      status.className = 'eh-capture__status' + (kind ? ' is-' + kind : '');
      status.textContent = text || '';
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (sending) return;
      var email = input.value.replace(/^\s+|\s+$/g, '');
      if (!EMAIL_RE.test(email)) {
        input.setAttribute('aria-invalid', 'true');
        setStatus('error', 'Please enter a valid email address.');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      sending = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      setStatus('', '');

      var finish = function () {
        sending = false;
        form.removeAttribute('aria-busy');
        button.textContent = ctaText;
        if (!form.classList.contains('is-done')) button.disabled = false;
      };

      postEmail(email, source).then(function (r) {
        if (r.ok && r.data && r.data.ok === true) {
          form.classList.add('is-done');
          setStatus('success', successText);
        } else {
          setStatus('error', messageFor(r.status, r.data));
        }
        finish();
      }, function () {
        setStatus('error', 'We couldn’t reach the server. Check your connection and try again.');
        finish();
      });
    });

    host.setAttribute('data-eh-capture-mounted', '1');
    host.className = (host.className ? host.className + ' ' : '') + 'eh-capture-host eh-capture-host--' + variant;
    while (host.firstChild) host.removeChild(host.firstChild);
    host.appendChild(form);
    return form;
  }

  /* ---------- auto wiring ---------- */

  function isNewsletterLink(a) {
    var t = (a.textContent || '').replace(/\s+/g, ' ').replace(/^\s+/, '');
    return /^(subscribe|get notified)/i.test(t);
  }

  function replaceLinks() {
    var links = document.querySelectorAll('a[href="/contact"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!a.parentNode || !isNewsletterLink(a)) continue;
      var inMenu = /(^|\s)menu-link(\s|$)/.test(a.className) ||
        !!(a.closest && a.closest('.menu-section, .menu-panel'));
      var notify = /^\s*get notified/i.test(a.textContent || '');
      var host = make('div', '');
      a.parentNode.replaceChild(host, a);
      mount(host, {
        variant: inMenu ? 'menu' : 'inline',
        source: newsletterSource(),
        cta: notify ? 'Get Notified' : 'Subscribe',
        label: notify ? 'Email address to get notified when the beta opens' : 'Email address for the Empress Health newsletter',
        success: SUCCESS_TEXT
      });
    }
  }

  function mountPlaceholders() {
    var nodes = document.querySelectorAll('[data-email-capture]');
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  function init() {
    try {
      mountPlaceholders();
      replaceLinks();
    } catch (e) {
      if (window.console && console.warn) console.warn('[email-capture] init failed:', e);
    }
  }

  window.EmpressEmailCapture = { mount: mount, init: init, pathSlug: pathSlug };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
