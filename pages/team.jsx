/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Team — Magazine-style team grid + clinical principles block.

const TEAM = [
  {
    name: 'Ariana Kaplan', credentials: 'MBA · FOUNDER · CEO · EDITOR-IN-CHIEF', tone: 'lavender',
    bio: 'Former senior editor at a health journal; started Empress after eleven months and four doctors who did not say the word menopause.',
    specialty: 'EDITORIAL + STRATEGY',
  },
  {
    name: 'Marcela Rivas', credentials: 'MPH · CO-FOUNDER · COO', tone: 'cream',
    bio: 'Public health background in women\'s health systems. Runs operations, clinician network, and member experience.',
    specialty: 'OPERATIONS + CLINICIAN NETWORK',
  },
  {
    name: 'Dr. M. Chen', credentials: 'MD · NAMS-CERTIFIED · CLINICAL LEAD', tone: 'tan',
    bio: 'NAMS-certified menopause practitioner. Leads the clinical board, approves all protocol content, and sees members directly.',
    specialty: 'VASOMOTOR + SLEEP',
  },
  {
    name: 'Dr. R. Patel', credentials: 'MD · ENDOCRINOLOGIST · MAYO AFFILIATE', tone: 'lavender',
    bio: 'Endocrinology lead. Responsible for hormonal and metabolic sections of the Health Intelligence Report.',
    specialty: 'HORMONES + COGNITION',
  },
  {
    name: 'Sara Okonkwo', credentials: 'PT, DPT · PELVIC FLOOR SPECIALIST · IPPS', tone: 'cream',
    bio: 'Leads pelvic floor and GU content. Co-wrote the GSM protocol. Runs the PT consultation track.',
    specialty: 'GU + PELVIC FLOOR',
  },
  {
    name: 'Linnea Holm', credentials: 'MA JOURNALISM · HEAD OF EDITORIAL', tone: 'tan',
    bio: 'Edits every piece in The Empress Library. Former deputy editor at a major women\'s health publication. The reason the writing is worth reading.',
    specialty: 'EDITORIAL',
  },
  {
    name: 'Maya Russo', credentials: 'MSW · COMMUNITY LEAD · PODS PROGRAM', tone: 'lavender',
    bio: 'Runs the pod program — 8-person community groups, facilitated by trained moderators. 2,100 members across 260 pods.',
    specialty: 'COMMUNITY + PODS',
  },
  {
    name: 'Hana Park', credentials: 'MSCS · HEAD OF ENGINEERING', tone: 'cream',
    bio: 'Leads the engineering team. Built the HIS engine, the Pinecone grounding pipeline, and the daily affirmation system.',
    specialty: 'ENGINEERING + AI',
  },
  {
    name: 'Dr. L. Iversen', credentials: 'MD · SLEEP MEDICINE · STANFORD-AFFILIATED', tone: 'tan',
    bio: 'Sleep medicine specialist. Wrote the sleep protocol and the 3 AM wakeup guide. Sees members with complex sleep presentations.',
    specialty: 'SLEEP',
  },
  {
    name: 'Dr. A. Vasquez', credentials: 'MD · CARDIOLOGIST · PREVENTIVE MEDICINE', tone: 'lavender',
    bio: 'Leads cardiovascular content. Wrote the post-menopause cardio window guide cited by the ACC/AHA 2023 panel.',
    specialty: 'CARDIOVASCULAR',
  },
];

const PRINCIPLES = [
  {
    n: 'I',
    title: 'Every claim, cited on the page.',
    body: 'We do not write "studies show." We write the chunk number, the trial, the panel size — on the page where the claim lives. This is the brand. Citations in tooltips are not citations.',
    cite: 'BRAND BRIEF § 5 · THE DIFFERENTIATOR',
  },
  {
    n: 'II',
    title: 'The clinician reads your report first.',
    body: 'No consultation begins cold. The Health Intelligence Report is the briefing document. The clinician starts where the report ends — not at "tell me about your symptoms."',
    cite: 'EMPRESS CLINICAL PROTOCOL · CHUNK-031',
  },
  {
    n: 'III',
    title: 'Medicine, not marketing.',
    body: 'We do not run ads. We do not accept sponsorships. The marketplace pays its own way. Our clinical content is editorially independent — the editor does not see commercial arrangements before publication.',
    cite: 'EMPRESS GOVERNANCE · B-CORP STANDARDS',
  },
];

function Team() {
  return (
    <div data-screen-label="Team" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={7} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -140, width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -100, width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>EMPRESS HEALTH · FORTY-TWO PEOPLE · THREE CITIES</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>BROOKLYN · LONDON · LISBON</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'end' }}>
            <h1 className="display" style={{ margin: 0, lineHeight: 0.97 }}>
              Meet your<br/><em className="italic-emph">care team.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 18 }}>
              Forty-two people. Clinicians, editors, engineers, and a community team. All working on one thing: making the experience of menopause less lonely, less guessed-at, and less expensive than it has ever been.
            </p>
          </div>
        </div>
      </section>

      {/* ───── 5-PORTRAIT LEADERSHIP GRID ─────────────────────────── */}
      <section style={{ padding: '100px 64px 120px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid var(--ink)', paddingBottom: 14, marginBottom: 64 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 2.6vw, 40px)' }}>
              Leadership <em className="italic-emph">& clinical board.</em>
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>TEN SHOWN · FORTY-TWO IN ALL</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 22, rowGap: 56 }}>
            {TEAM.map((p) => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label="PORTRAIT · NATURAL LIGHT" width="100%" height={300} radius={4} tone={p.tone} />
                  <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14,
                    borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: -6, right: -6, width: 14, height: 14,
                    borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic', fontSize: 18, lineHeight: 1.2, color: 'var(--ink)' }}>
                    {p.name}
                  </div>
                  <div className="mono" style={{ marginTop: 6, color: 'var(--plum)', fontSize: 9 }}>{p.credentials}</div>
                  <p className="body-md" style={{ marginTop: 12, color: 'var(--ink-soft)', fontSize: 13 }}>{p.bio}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 10,
                    padding: '4px 10px', borderRadius: 999,
                    background: 'var(--surface-lavender)', border: '1px solid rgba(74,54,100,0.12)',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', color: 'var(--plum)',
                  }}>{p.specialty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CLINICAL PRINCIPLES ────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 72px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Our clinical principles.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline" style={{ margin: 0 }}>
              Three things we refuse<br/><em className="italic-emph">to negotiate on.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {PRINCIPLES.map((p) => (
              <div key={p.n} style={{ borderTop: '1px solid var(--ink)', paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36,
                  color: 'var(--gold)', lineHeight: 1 }}>{p.n}.</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, margin: 0, lineHeight: 1.2 }}>
                  {p.title}
                </h3>
                <p className="body-md" style={{ margin: 0 }}>{p.body}</p>
                <div className="mono" style={{ color: 'var(--gold)', fontSize: 9 }}>SOURCES · {p.cite}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── JOIN SECTION ───────────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 18 }}>FOR CLINICIANS</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 32, margin: '0 0 14px', lineHeight: 1.2 }}>
              Join our clinical network.
            </h3>
            <p className="body-md" style={{ margin: '0 0 24px' }}>
              NAMS-certified or ACOG-affiliated? We take applications quarterly. Honoraria above market, editorial support included, citations always visible.
            </p>
            <button className="btn btn-ghost">Apply to the network →</button>
          </div>
          <div>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 18 }}>OPEN ROLES</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 32, margin: '0 0 14px', lineHeight: 1.2 }}>
              Work with us.
            </h3>
            <p className="body-md" style={{ margin: '0 0 24px' }}>
              We are hiring in Brooklyn, London, and remotely — engineering, editorial, clinical operations, community. We read every application.
            </p>
            <button className="btn btn-ghost">See open roles →</button>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
