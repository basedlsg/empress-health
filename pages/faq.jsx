/* global React, Placeholder, Nav, Icon, Footer */
// FAQ — Editorial Q&A organized into chapters, with expandable answers.

const { useState } = React;

function FAQItem({ q, a, num, open, onToggle }) {
  return (
    <div style={{ borderTop: '1px solid rgba(74,54,100,0.10)', padding: '24px 0' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'grid', gridTemplateColumns: '52px 1fr 32px', gap: 20,
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          textAlign: 'left', alignItems: 'baseline', color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
        }}>
        <span className="mono" style={{ color: 'var(--gold)' }}>Q · {num}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, lineHeight: 1.3 }}>{q}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plum)', transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform .3s ease' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </button>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 32px', gap: 20, marginTop: 18 }}>
          <span className="mono" style={{ color: 'var(--ink-faint)' }}>A.</span>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            {a}
          </div>
          <span />
        </div>
      )}
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState({ '01.02': true }); // start with one open
  const toggle = (k) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  const chapters = [
    {
      n: 'I.', title: 'The basics',
      qs: [
        ['What is Empress, in one sentence?',
          <>An editorial-clinical menopause company. We make a 34-page Health Intelligence Report, run twelve-week guided care with NAMS-certified clinicians, publish a long-form library, and host a small, curated community of pods.</>],
        ['Who is Empress for?',
          <>Women in midlife — perimenopause, menopause, post-menopause. We are most useful for the years between roughly 40 and 60, but we have members on either side of that. If the chapter feels like yours, the program will fit.</>],
        ['Are you a medical provider?',
          <>For the clinician check-ins, yes — your NAMS-certified clinician is your provider, licensed in your state. For everything else (the report, the library, the community), we are an editorial and software product, not a substitute for medical care.</>],
        ['How is this different from a wellness app?',
          <>We do not gamify, streak, or notify. We do not sell ads or your data. Every claim cites a source on the page. A real clinician is on the line every week. The product looks like a magazine because we think it should.</>],
      ],
    },
    {
      n: 'II.', title: 'The Health Intelligence Report',
      qs: [
        ['What exactly is in the report?',
          <>34 pages: a cover with your composite Health Intelligence Score, a ten-domain symptom radar, your stage and trajectory, a personalized first-month protocol drafted by your matched clinician, a clinician shortlist, and a citations index.</>],
        ['How long does the assessment take?',
          <>About 20 minutes if you go straight through, but you can pause and resume. Most members do it in two sittings. The questions are written in plain language; the scoring is heavy lift, not you.</>],
        ['Can I share the report with my own doctor?',
          <>Yes, and we encourage it. You can export it as a PDF, a doctor-facing summary, or a JSON file. You own the report — we make no claim on it.</>],
        ['What is the Health Intelligence Score?',
          <>A composite score between 0 and 100 that summarizes your symptom load across ten domains. It is not a diagnosis. It is a useful number you can watch move over twelve weeks.</>],
      ],
    },
    {
      n: 'III.', title: 'The program',
      qs: [
        ['How does the twelve-week program work?',
          <>Three four-week chapters: <em>Discover</em>, <em>Stabilize</em>, <em>Sustain</em>. A weekly 15-minute clinician check-in, a single experiment per week, and a community pod that meets twice weekly. The pace is intentional.</>],
        ['What does it cost?',
          <>The Report is $139 one-time. The Program is $12 a month. FSA/HSA eligible. We have a sliding scale; write to us and we will figure it out.</>],
        ['What if I do not want a clinician?',
          <>That is a real option. You can take the report, use the library, and join a community pod without ever booking the clinician. We will not push it.</>],
        ['Can I bring my own clinician?',
          <>Yes. Many members do. The protocol is exportable and the report is doctor-friendly. We have a one-page brief for your physician inside the export.</>],
      ],
    },
    {
      n: 'IV.', title: 'Community + pods',
      qs: [
        ['What is a pod, exactly?',
          <>Eight women, matched by stage, time zone, and tone. Two 60-minute meetings a week, held by a trained member-host. A pod stays together for at least one season. The smallness is the feature.</>],
        ['Can I switch pods?',
          <>Any month, no questions. Just write to the community team. Most members stay; the option matters more than the use.</>],
        ['Do pods replace therapy?',
          <>No. Pods are peer support held to a code of confidentiality and gentleness. They are not therapy, group therapy, or coaching. If your pod is missing something therapy would catch, your host will say so.</>],
      ],
    },
    {
      n: 'V.', title: 'Privacy + data',
      qs: [
        ['What do you do with my data?',
          <>It powers your report, your clinician hand-off, and (anonymized, aggregated) our editorial. We do not sell it, share it, or advertise against it. HIPAA-aligned, encrypted at rest and in transit.</>],
        ['Can I delete everything?',
          <>One button. We delete every artifact, including backups, within 30 days. We will not ask you why. We will be sad, briefly, and then we will get over it.</>],
        ['Where is the data stored?',
          <>In the United States, on encrypted cloud infrastructure with SOC-2 and HIPAA-aligned controls. Members in the EU and UK have data-residency in their region.</>],
      ],
    },
    {
      n: 'VI.', title: 'About the company',
      qs: [
        ['Who works at Empress?',
          <>Forty-two of us across Brooklyn, London, and Lisbon. Roughly half clinical and editorial, half product and engineering, and a small operations team. About a third of the company are members themselves.</>],
        ['How are you funded?',
          <>A small seed round in early 2025, plus member revenue. We chose investors who agreed not to push us toward an ad model. We have a B-Corp commitment and publish our books once a year.</>],
        ['How do I get in touch?',
          <>hello@empress.health goes to a real person within two working days. Press goes to press@. Clinicians and partners, network@. A complaint? founders@ — and we mean that.</>],
      ],
    },
  ];

  // Flatten + assign numbers like 01.02
  let runningChapter = 0;
  return (
    <div data-screen-label="FAQ" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={8} base="" />
      </div>

      {/* ───── HERO ─── editorial masthead ──────────────────────── */}
      <section style={{ position: 'relative', padding: '40px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -120, width: 720, height: 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.30) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>QUESTIONS · CHAPTER INDEX</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>22 ANSWERS · SIX CHAPTERS</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(56px, 6vw, 96px)' }}>
                Every question<br/>we get, <em className="italic-emph">answered.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 28, maxWidth: 480 }}>
                If something is missing, the box at the bottom of this page goes straight to our customer team. We write back, by hand, within two working days.
              </p>
            </div>

            {/* Chapter index card */}
            <div className="glass" style={{ padding: 32, borderRadius: 22, backgroundColor: 'rgba(255,252,248,0.7)' }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>JUMP TO A CHAPTER</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
                {chapters.map((c, i) => (
                  <li key={c.n} style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 40px', gap: 16,
                    padding: '12px 0', borderTop: '1px dashed rgba(74,54,100,0.18)',
                    alignItems: 'baseline',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--gold)' }}>{c.n}</span>
                    <a href={`#ch-${i + 1}`} style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', textDecoration: 'none' }}>{c.title}</a>
                    <span className="mono" style={{ color: 'var(--ink-faint)', textAlign: 'right' }}>{String(c.qs.length).padStart(2, '0')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CHAPTERED Q&A ────────────────────────────────────── */}
      <section style={{ padding: '80px 64px 100px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          {chapters.map((c, ci) => {
            runningChapter = ci + 1;
            return (
              <div key={c.n} id={`ch-${ci + 1}`} style={{ marginTop: ci === 0 ? 0 : 100 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, borderBottom: '1px solid var(--ink)', paddingBottom: 18, marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 38, color: 'var(--gold)', lineHeight: 1 }}>{c.n}</span>
                  <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 2.4vw, 36px)' }}>{c.title}</h2>
                  <span className="mono" style={{ marginLeft: 'auto', color: 'var(--ink-faint)' }}>CHAPTER {String(runningChapter).padStart(2, '0')}</span>
                </div>
                {c.qs.map(([q, a], qi) => {
                  const num = `${String(runningChapter).padStart(2, '0')}.${String(qi + 1).padStart(2, '0')}`;
                  return (
                    <FAQItem
                      key={num}
                      num={num}
                      q={q}
                      a={a}
                      open={!!open[num]}
                      onToggle={() => toggle(num)}
                    />
                  );
                })}
                <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ───── DID NOT FIND IT — write to us ────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>NOT FINDING YOUR QUESTION?</div>
            <h2 className="headline" style={{ margin: 0 }}>
              Write to us<br/><em className="italic-emph">and we will answer.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              hello@empress.health goes to a real person, not a queue. We respond within two working days, and if your question helps someone else, we add it here with your permission.
            </p>
          </div>
          <div style={{
            background: 'var(--surface-bright)', border: '1px solid rgba(74,54,100,0.10)', borderRadius: 16,
            padding: 28,
          }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>WRITE TO US · IT GOES TO A PERSON</div>
            <input
              placeholder="your@email.com"
              style={{ width: '100%', marginTop: 18, padding: '14px 18px', border: '1px solid rgba(74,54,100,0.18)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 15, background: 'rgba(255,255,255,0.6)', outline: 'none' }}
            />
            <textarea
              placeholder="What is your question?"
              rows={4}
              style={{ width: '100%', marginTop: 10, padding: '14px 18px', border: '1px solid rgba(74,54,100,0.18)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 15, background: 'rgba(255,255,255,0.6)', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span className="mono" style={{ color: 'var(--ink-faint)' }}>WE REPLY · WITHIN 2 WORKING DAYS</span>
              <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>Send {Icon.arrow(14)}</button>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
