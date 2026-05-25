/* global React, Nav, Footer, SectionHeading, Icon */
// Contact — editorial masthead, 2-col form + details, FAQ link cards.

function ContactPage() {
  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>

      {/* ── NAV ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* ── MASTHEAD ── */}
      <section style={{ position: 'relative', padding: '80px 64px 100px', overflow: 'hidden' }}>
        {/* Luxury orbs */}
        <div style={{
          position: 'absolute', top: -100, right: -140, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.24) 0%, rgba(214,188,243,0) 65%)',
          filter: 'blur(55px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80, width: 440, height: 440, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)',
          filter: 'blur(48px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            <span className="mono" style={{ color: 'var(--gold)' }}>GET IN TOUCH</span>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.4vw, 88px)', lineHeight: 1.0 }}>
            Reach the <em className="italic-emph">team.</em>
          </h1>
          <p className="body-lg" style={{ marginTop: 22, maxWidth: 520 }}>
            We read every message. If it's clinical, we loop in a clinician. If it's feedback, it goes straight to the founders.
          </p>
        </div>
      </section>

      {/* ── 2-COL FORM + DETAILS ── */}
      <section style={{ padding: '0 64px 160px', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'start' }}>

          {/* Left: form */}
          <div className="glass-warm" style={{ padding: 44, borderRadius: 'var(--r-xl)' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 28 }}>SEND A MESSAGE</div>

            <div id="contact-status" style={{ display: 'none', padding: '12px 16px', marginBottom: 20, borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 14 }} />

            <form id="contact-form" onSubmit="handleContactSubmit(event)">

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="name" style={labelStyle}>Full Name</label>
                <input type="text" id="name" name="name" required autoComplete="name" placeholder="Your full name" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="email" style={labelStyle}>Email Address</label>
                <input type="email" id="email" name="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="phone" style={labelStyle}>Phone Number</label>
                <input type="tel" id="phone" name="phone" required autoComplete="tel" inputMode="tel" placeholder="+1 (555) 555-5555" pattern="^\+?[0-9\s\-\(\)\.]{7,}$" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label htmlFor="message" style={labelStyle}>Message</label>
                <textarea id="message" name="message" rows="5" required autoComplete="off" placeholder="Tell us how we can help…" style={{ ...inputStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.6 }} />
              </div>

              <button type="submit" id="contact-submit-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 28px' }}>
                Send Message {Icon.arrow(16)}
              </button>
            </form>
          </div>

          {/* Right: contact details + FAQ links */}
          <div style={{ paddingTop: 8 }}>
            {/* Contact details */}
            <div style={{ marginBottom: 56 }}>
              <div className="eyebrow" style={{ marginBottom: 18 }}>CONTACT DETAILS</div>
              <div style={{ marginBottom: 20 }}>
                <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>EMAIL</div>
                <a href="mailto:support@empresshealth.ai" style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--plum)', textDecoration: 'none', fontWeight: 500 }}>
                  support@empresshealth.ai
                </a>
              </div>
              <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)', margin: '24px 0' }} />
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 6 }}>OFFICE HOURS</div>
              <div className="mono" style={{ color: 'var(--ink-faint)', lineHeight: 1.8 }}>
                MON–FRI · 9AM–6PM EST<br />
                SAT · 10AM–2PM EST<br />
                CLOSED SUNDAYS
              </div>
              <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)', margin: '24px 0' }} />
              <div className="mono" style={{ color: 'var(--ink-faint)' }}>RESPONSE TIME · WITHIN 24 HOURS</div>
            </div>

            {/* FAQ link cards */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>QUICK ANSWERS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['How does the Health Intelligence Report work?', '/faq'],
                  ['What does a clinician match include?', '/faq'],
                  ['Is my data safe and private?', '/privacypolicy'],
                  ['Can I cancel my membership at any time?', '/faq'],
                ].map(([q, href]) => (
                  <a key={q} href={href} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 18px', borderRadius: 'var(--r-md)',
                    background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(74,54,100,0.10)',
                    textDecoration: 'none', transition: 'background .2s ease',
                  }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>{q}</span>
                    <span style={{ color: 'var(--gold)', fontSize: 16, flexShrink: 0, marginLeft: 16 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />

      {/* ── FUNCTIONAL SCRIPT (preserved /api/contact POST + CSRF from legacy) ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        function getCookie(name) {
          const match = document.cookie.match(new RegExp('(^|;)\\\\s*' + name + '\\\\s*=\\\\s*([^;]+)'));
          return match ? decodeURIComponent(match[2]) : '';
        }
        function fetchWithCsrf(url, opts) {
          opts = opts || {}; opts.headers = opts.headers || {};
          const token = window.__csrfToken || getCookie('csrf_token') || '';
          if (token) opts.headers['X-CSRF-Token'] = token;
          opts.credentials = opts.credentials || 'include';
          return fetch(url, opts);
        }
        async function handleContactSubmit(event) {
          event.preventDefault();
          const name = document.getElementById('name').value.trim();
          const email = document.getElementById('email').value.trim();
          const phone = document.getElementById('phone').value.trim();
          const message = document.getElementById('message').value.trim();
          const statusEl = document.getElementById('contact-status');
          const btn = document.getElementById('contact-submit-btn');
          const origText = btn.textContent;
          btn.textContent = 'Sending…'; btn.disabled = true;
          try {
            const res = await fetchWithCsrf('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, phone, message })
            });
            if (res.ok) {
              statusEl.textContent = 'Thank you, ' + name + '! We\'ve received your message and will get back to you soon.';
              statusEl.style.background = 'rgba(60,140,80,0.08)';
              statusEl.style.border = '1px solid rgba(60,140,80,0.22)';
              statusEl.style.color = '#2a6e40';
              statusEl.style.display = 'block';
              event.target.reset();
            } else {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || 'Failed to send message');
            }
          } catch (err) {
            statusEl.textContent = 'Sorry, there was an error sending your message. Please try again or email us directly.';
            statusEl.style.background = 'rgba(200,60,60,0.08)';
            statusEl.style.border = '1px solid rgba(200,60,60,0.25)';
            statusEl.style.color = '#a03030';
            statusEl.style.display = 'block';
          } finally {
            btn.textContent = origText; btn.disabled = false;
          }
        }
      `}} />
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '1px solid rgba(74,54,100,0.18)', borderRadius: 'var(--r-md)',
  fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)',
  background: 'rgba(255,255,255,0.7)', outline: 'none',
};
const labelStyle = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: 12,
  fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--plum)', marginBottom: 8,
};
