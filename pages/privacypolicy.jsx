/* global React, Nav, Footer */
// Privacy Policy — Empress Health · Empathetic Elegance
// Legal copy preserved verbatim from privacypolicy.html

const SECTIONS = [
  {
    id: 'info-we-collect',
    num: '01',
    title: 'Information We Collect',
    content: (
      <>
        <p className="body-md" style={{ color: 'var(--ink-soft)', margin: '0 0 14px' }}>
          Through our onboarding form and within the Empress Health.ai experience, we may collect:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Voluntary wellness information', '(symptoms, lifestyle, self-care goals)'],
            ['Demographic details', '(age range, stage of menopause, preferences)'],
            ['Basic contact details', '(name, email, phone)'],
          ].map(([bold, rest]) => (
            <li key={bold} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 10, borderBottom: '1px solid rgba(74,54,100,0.07)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', marginTop: 8, flexShrink: 0 }} />
              <span className="body-md" style={{ color: 'var(--ink)' }}><strong>{bold}</strong> {rest}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    num: '02',
    title: 'How We Use Your Information',
    content: (
      <>
        <p className="body-md" style={{ color: 'var(--ink-soft)', margin: '0 0 14px' }}>We use your information to:</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Improve our tools, programs, and services',
            'Recommend relevant resources, products, or expert guidance',
            'Personalize your experience on the Empress Health.ai platform',
          ].map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 10, borderBottom: '1px solid rgba(74,54,100,0.07)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', marginTop: 8, flexShrink: 0 }} />
              <span className="body-md" style={{ color: 'var(--ink)' }}>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-protect',
    num: '03',
    title: 'How We Protect Your Information',
    content: (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          'We never sell or rent your personal information to third parties',
          'Access is restricted to authorized team members only',
          'All data is stored on secure, encrypted servers',
        ].map((item) => (
          <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 10, borderBottom: '1px solid rgba(74,54,100,0.07)' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', marginTop: 8, flexShrink: 0 }} />
            <span className="body-md" style={{ color: 'var(--ink)' }}>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'sharing',
    num: '04',
    title: 'Sharing of Information',
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        We may share limited information with trusted service providers who help us operate the platform. These providers are required to keep your information confidential and may only use it as instructed by Empress Health.ai.
      </p>
    ),
  },
  {
    id: 'your-rights',
    num: '05',
    title: 'Your Rights',
    content: (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          'If you are in a region with privacy regulations (e.g., GDPR/UK GDPR/CCPA), you may have additional rights such as data portability or restriction of processing. We will honor applicable rights requests.',
          'You can opt out of communications at any time using unsubscribe links or by emailing us.',
          <>You can request <strong>access</strong>, <strong>correction</strong>, or <strong>deletion</strong> of your information at any time by contacting <a href="mailto:support@empresshealth.ai" style={{ color: 'var(--plum)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>support@empresshealth.ai</a>.</>,
        ].map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 14, borderBottom: '1px solid rgba(74,54,100,0.07)' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', marginTop: 8, flexShrink: 0 }} />
            <span className="body-md" style={{ color: 'var(--ink)' }}>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'confidentiality',
    num: '06',
    title: 'Confidentiality',
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        Your responses are strictly confidential and will only be used to improve your personal wellness journey with Empress Health.ai.
      </p>
    ),
  },
  {
    id: 'cookies',
    num: '07',
    title: 'Cookies & Analytics',
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        We may use cookies and similar technologies to provide core functionality, remember preferences, and understand how the platform is used so we can improve it. You can control cookies through your browser settings. If we use third-party analytics providers, they are bound by agreements to handle data responsibly and only on our instructions.
      </p>
    ),
  },
  {
    id: 'retention',
    num: '08',
    title: 'Data Retention',
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        We retain your information only as long as necessary to provide the platform and for legitimate business needs (e.g., troubleshooting, security), or as required by law. If you request deletion, we will delete or de-identify your data unless retention is legally required.
      </p>
    ),
  },
  {
    id: 'children',
    num: '09',
    title: "Children's Privacy",
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        Empress Health.ai is intended for adults. We do not knowingly collect personal information from children under the age of 16. If you believe a child has provided us information, please contact us so we can delete it.
      </p>
    ),
  },
  {
    id: 'changes',
    num: '10',
    title: 'Changes to This Policy',
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        We may update this policy to reflect changes to our practices or for legal, operational, or regulatory reasons. We will update the "Last updated" date above and, when appropriate, notify you through the platform or by email.
      </p>
    ),
  },
  {
    id: 'contact',
    num: '11',
    title: 'Contact Us',
    content: (
      <p className="body-md" style={{ color: 'var(--ink)', margin: 0 }}>
        If you have questions about this policy or wish to exercise your rights, contact us at{' '}
        <a href="mailto:support@empresshealth.ai" style={{ color: 'var(--plum)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          support@empresshealth.ai
        </a>.
      </p>
    ),
  },
];

function PrivacyPolicy() {
  return (
    <div data-screen-label="Privacy Policy" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Luxury orb atmosphere */}
      <div style={{
        position: 'fixed', top: -180, right: -200, width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,188,243,0.18) 0%, rgba(214,188,243,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Nav */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* Hero editorial header */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>PRIVACY · MMXXVI</div>
          <h1 className="headline" style={{ margin: 0, fontSize: 'clamp(36px, 4vw, 64px)' }}>
            Privacy, <em className="italic-emph">plainly stated.</em>
          </h1>
          <p className="body-lg" style={{ marginTop: 20, maxWidth: 560, color: 'var(--ink-soft)' }}>
            We believe you deserve to understand exactly how your health data is handled. No legalese fog — plain language, every point accounted for.
          </p>
          <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>NON-HIPAA · 11 SECTIONS · LAST UPDATED MMXXVI</span>
          </div>
          {/* Non-HIPAA notice */}
          <div style={{
            marginTop: 24,
            padding: '16px 22px',
            borderRadius: 12,
            background: 'var(--surface-cream)',
            border: '1px solid rgba(74,54,100,0.10)',
          }}>
            <span className="mono" style={{ color: 'var(--plum)', display: 'block', marginBottom: 6 }}>HIPAA COMPLIANCE — UNDER CONSTRUCTION</span>
            <p className="body-md" style={{ margin: 0, color: 'var(--ink-soft)' }}>
              Empress Health.ai is not a covered entity under HIPAA. Information shared on this platform is voluntary wellness information, not protected health information (PHI) under HIPAA.
            </p>
          </div>
        </div>
      </section>

      {/* Gold rule divider */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 64px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      </div>

      {/* Policy body */}
      <section style={{ padding: '60px 64px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {SECTIONS.map((sec, i) => (
            <div key={sec.id} id={sec.id} style={{ paddingTop: 48, paddingBottom: 48, borderBottom: i < SECTIONS.length - 1 ? '1px solid rgba(74,54,100,0.08)' : 'none' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 20 }}>
                <span className="mono" style={{ color: 'var(--gold)', minWidth: 26 }}>{sec.num}</span>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(18px, 2.2vw, 26px)', color: 'var(--plum)' }}>
                  {sec.title}
                </h2>
              </div>
              {sec.content}
            </div>
          ))}
        </div>

        {/* Citation footer */}
        <div style={{ maxWidth: 720, margin: '48px auto 0' }}>
          <div className="mono" style={{ color: 'var(--gold)', borderTop: '1px solid rgba(201,165,96,0.25)', paddingTop: 18 }}>
            EMPRESS HEALTH · PRIVACY & DATA PROTECTION POLICY · NON-HIPAA · MMXXVI
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
