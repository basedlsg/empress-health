/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Expert Guidance — Clinician-written guidance hub with filter rail.

const GUIDES = [
  {
    clinician: 'Dr. M. Chen', credentials: 'MD · NAMS-CERTIFIED MENOPAUSE PRACTITIONER',
    specialty: 'Vasomotor', stage: 'Perimenopause', format: 'Protocol',
    title: 'Managing hot flashes: the evidence-based hierarchy.',
    summary: 'From lifestyle-first to pharmacological, a frank ranking of what actually works — and the trial data behind each tier.',
    cite: 'NAMS 2023 · CHUNK-044',
  },
  {
    clinician: 'Dr. R. Patel', credentials: 'MD · ENDOCRINOLOGIST · MAYO CLINIC AFFILIATE',
    specialty: 'Cognition', stage: 'Perimenopause', format: 'Deep-dive',
    title: 'Brain fog in midlife: what\'s hormonal, what isn\'t.',
    summary: 'Distinguishing estrogen-withdrawal cognitive changes from sleep-debt and thyroid — and the tests that tell them apart.',
    cite: 'ENDOCRINE SOC. 2023 · CHUNK-088',
  },
  {
    clinician: 'Sara Okonkwo', credentials: 'PT, DPT · PELVIC FLOOR SPECIALIST · IPPS',
    specialty: 'GU / Pelvic', stage: 'Post-menopause', format: 'Protocol',
    title: 'GSM: the condition nobody named until 2014.',
    summary: 'Genitourinary syndrome of menopause — symptoms, severity grading, and the full treatment ladder from local estrogen to pelvic PT.',
    cite: 'ACOG 2022 · CHUNK-112',
  },
  {
    clinician: 'Dr. L. Iversen', credentials: 'MD · SLEEP MEDICINE · STANFORD-AFFILIATED',
    specialty: 'Sleep', stage: 'Perimenopause', format: 'Protocol',
    title: 'The 3 AM wakeup: a clinical map.',
    summary: 'Why middle-of-the-night waking in midlife is a vasomotor event, not insomnia — and the distinction changes treatment entirely.',
    cite: 'AASM 2023 · CHUNK-067',
  },
  {
    clinician: 'Dr. M. Chen', credentials: 'MD · NAMS-CERTIFIED MENOPAUSE PRACTITIONER',
    specialty: 'Bone', stage: 'Post-menopause', format: 'Checklist',
    title: 'Bone density at 47: when to scan, what to do.',
    summary: 'DEXA timing, T-score interpretation, and the resistance-training evidence that most patients are not given.',
    cite: 'NAMS § 9 · CHUNK-201',
  },
  {
    clinician: 'Dr. A. Vasquez', credentials: 'MD · CARDIOLOGIST · PREVENTIVE MEDICINE',
    specialty: 'Cardio', stage: 'Post-menopause', format: 'Deep-dive',
    title: 'Cardiovascular risk after menopause: the numbers to know.',
    summary: 'LDL shifts, blood pressure inflection, and the preventive window — what the WHI actually said about timing.',
    cite: 'ACC/AHA 2023 · CHUNK-155',
  },
];

const SPECIALTIES = ['All', 'Vasomotor', 'Sleep', 'Cognition', 'GU / Pelvic', 'Bone', 'Cardio'];
const STAGES      = ['All stages', 'Perimenopause', 'Post-menopause'];
const FORMATS     = ['All formats', 'Protocol', 'Deep-dive', 'Checklist'];

function ExpertGuidance() {
  const [specialty, setSpecialty] = React.useState('All');
  const [stage, setStage]         = React.useState('All stages');
  const [format, setFormat]       = React.useState('All formats');

  const filtered = GUIDES.filter(g =>
    (specialty === 'All'         || g.specialty === specialty) &&
    (stage === 'All stages'      || g.stage === stage) &&
    (format === 'All formats'    || g.format === format)
  );

  const filterBtn = (active, label, onClick) => (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
      padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
      border: active ? '1px solid var(--plum)' : '1px solid rgba(74,54,100,0.20)',
      background: active ? 'var(--plum)' : 'transparent',
      color: active ? '#fff' : 'var(--ink-soft)',
      transition: 'all .2s',
    }}>{label}</button>
  );

  return (
    <div data-screen-label="Expert Guidance" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={5} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -140, width: 680, height: 680, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>EXPERT GUIDANCE · CLINICIAN-WRITTEN</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>247 CLINICIANS IN NETWORK · ALL NAMS-CERTIFIED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 72, alignItems: 'end' }}>
            <h1 className="display" style={{ margin: 0, lineHeight: 0.96 }}>
              Guidance from<br/><em className="italic-emph">the people who<br/>actually do this.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 18 }}>
              Every guide is written by a credentialed clinician — not a content team. Filter by your specialty, your stage, or the format you need right now. Citations stay on the page.
            </p>
          </div>
        </div>
      </section>

      {/* ───── FILTER RAIL + GUIDE LIST ───────────────────────────── */}
      <section style={{ padding: '80px 64px 160px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 64 }}>

          {/* Filter rail */}
          <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 20 }}>FILTER GUIDES</div>

            <div style={{ marginBottom: 32 }}>
              <div className="label-sm" style={{ marginBottom: 12, color: 'var(--ink-faint)' }}>SPECIALTY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SPECIALTIES.map(s => filterBtn(specialty === s, s, () => setSpecialty(s)))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div className="label-sm" style={{ marginBottom: 12, color: 'var(--ink-faint)' }}>STAGE RELEVANCE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STAGES.map(s => filterBtn(stage === s, s, () => setStage(s)))}
              </div>
            </div>

            <div>
              <div className="label-sm" style={{ marginBottom: 12, color: 'var(--ink-faint)' }}>FORMAT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FORMATS.map(f => filterBtn(format === f, f, () => setFormat(f)))}
              </div>
            </div>
          </div>

          {/* Guide list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)',
              letterSpacing: '0.12em', marginBottom: 32 }}>
              {filtered.length} GUIDE{filtered.length !== 1 ? 'S' : ''} MATCHING
            </div>

            {filtered.map((g, i) => (
              <article key={g.title} style={{
                paddingTop: 32, paddingBottom: 32,
                borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid rgba(74,54,100,0.10)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {/* Clinician + credentials */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--plum)' }}>
                    — {g.clinician}
                  </span>
                  <span className="mono" style={{ color: 'var(--plum-soft)' }}>{g.credentials}</span>
                </div>

                {/* Format chip */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{g.format.toUpperCase()} · {g.specialty.toUpperCase()}</span>
                </div>

                {/* Italic title */}
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic',
                  fontSize: 26, margin: 0, lineHeight: 1.2, color: 'var(--ink)' }}>
                  {g.title}
                </h3>

                {/* 2-line summary */}
                <p className="body-md" style={{ margin: 0, maxWidth: 680 }}>{g.summary}</p>

                {/* Citation footer */}
                <div className="mono" style={{ color: 'var(--gold)' }}>SOURCES · {g.cite}</div>

                <a href="#" style={{ color: 'var(--plum)', fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none', marginTop: 4 }}>
                  Read the guide →
                </a>
              </article>
            ))}

            {filtered.length === 0 && (
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', paddingTop: 32 }}>
                No guides match these filters — try broadening your selection.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───── JOIN THE NETWORK ───────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>FOR CLINICIANS</div>
            <h2 className="headline">
              Write for the<br/><em className="italic-emph">people who need it.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              We accept guide submissions from NAMS-certified and ACOG-affiliated clinicians quarterly. Honoraria above market. Editorial support included. Your citations stay visible.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 32 }}>Apply to the network {Icon.arrow(14)}</button>
          </div>
          <div style={{ position: 'relative' }}>
            <Placeholder label={"CLINICIAN PORTRAIT\nNATURAL LIGHT · OFFICE SETTING"} width="100%" height={440} radius={6} tone="tan" />
            <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
