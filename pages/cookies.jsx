/* global React, Nav, Footer */
// Cookie Policy — Empress Health · Empathetic Elegance

const COOKIE_SECTIONS = [
  {
    num: '01',
    title: 'What Are Cookies',
    body: 'Cookies are small text files placed on your device by a website when you visit it. They allow the site to remember information about your visit — such as your language preference or login state — so you do not have to re-enter it each time. Cookies cannot run programs or deliver viruses. They are unique to you and can only be read by the web server that issued them.',
  },
  {
    num: '02',
    title: 'How We Use Cookies',
    body: 'Empress Health uses cookies strictly to provide core platform functionality and improve your experience. Strictly necessary cookies keep you logged in and preserve your assessment progress. Preference cookies remember your language and display settings. We may also use analytics cookies — with your consent where required by law — to understand aggregate traffic patterns so we can improve the platform. We do not use cookies to serve advertising.',
  },
  {
    num: '03',
    title: 'Third-Party Cookies',
    body: 'Some features on our platform are powered by trusted third-party services, which may set their own cookies. For example, our chat assistant and certain embedded tools may place functional cookies. These providers are bound by data-processing agreements that limit how they use your data and prohibit them from using your information for their own purposes.',
  },
  {
    num: '04',
    title: 'Managing and Opting Out',
    body: 'You can control or disable cookies at any time through your browser settings. Most browsers allow you to block all cookies, block only third-party cookies, or clear cookies that have already been set. Disabling certain cookies may affect the functionality of some features — for example, staying logged in between sessions. Where a consent-management option is available on our platform, you can update your preferences there at any time.',
  },
  {
    num: '05',
    title: 'Contact',
    body: null,
    extra: (
      <p className="body-md" style={{ margin: 0, color: 'var(--ink)' }}>
        If you have questions about how we use cookies or wish to exercise any applicable rights, please contact us at{' '}
        <a href="mailto:support@empresshealth.ai" style={{ color: 'var(--plum)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          support@empresshealth.ai
        </a>. We aim to respond within five business days.
      </p>
    ),
  },
];

function Cookies() {
  return (
    <div data-screen-label="Cookie Policy" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Orb atmosphere */}
      <div style={{
        position: 'fixed', top: -200, left: -150, width: 540, height: 540, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>COOKIES · MMXXVI</div>
          <h1 className="headline" style={{ margin: 0, fontSize: 'clamp(36px, 4vw, 64px)' }}>
            Cookies, <em className="italic-emph">clearly explained.</em>
          </h1>
          <p className="body-lg" style={{ marginTop: 20, maxWidth: 560, color: 'var(--ink-soft)' }}>
            We use cookies only for what matters: keeping the platform working, remembering your preferences, and improving what we build. Nothing hidden.
          </p>
          <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>5 SECTIONS · LAST UPDATED MMXXVI</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 64px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      </div>

      {/* Body */}
      <section style={{ padding: '60px 64px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {COOKIE_SECTIONS.map((sec, i) => (
            <div key={sec.num} style={{ paddingTop: 48, paddingBottom: 48, borderBottom: i < COOKIE_SECTIONS.length - 1 ? '1px solid rgba(74,54,100,0.08)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 20 }}>
                <span className="mono" style={{ color: 'var(--gold)', minWidth: 26 }}>{sec.num}</span>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(18px, 2.2vw, 26px)', color: 'var(--plum)' }}>
                  {sec.title}
                </h2>
              </div>
              {sec.body && <p className="body-md" style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.8 }}>{sec.body}</p>}
              {sec.extra && sec.extra}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: '48px auto 0' }}>
          <div className="mono" style={{ color: 'var(--gold)', borderTop: '1px solid rgba(201,165,96,0.25)', paddingTop: 18 }}>
            EMPRESS HEALTH · COOKIE POLICY · MMXXVI
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
