/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Events — editorial calendar with featured event, upcoming 2-col list, past events archive

const UPCOMING = [
  {
    date: '14', month: 'JUN', year: 'MMXXVI',
    title: 'Perimenopause & the Workplace',
    speaker: 'Dr. Naomi Salas, NAMS Fellow',
    format: 'LIVE · WEBINAR',
    location: 'Zoom — register for link',
    desc: 'A frank conversation about managing symptoms at work — accommodation frameworks, disclosure decisions, and the legal landscape for women in midlife.',
    citation: 'NAMS § 2.4 · CHUNK-012',
  },
  {
    date: '21', month: 'JUN', year: 'MMXXVI',
    title: 'Understanding Your Bone Density Report',
    speaker: 'Dr. Priya Mehta, Endocrine Society',
    format: 'LIVE · WEBINAR',
    location: 'Zoom — register for link',
    desc: 'A clinical walk-through of DEXA scan results, T-scores, and the evidence-based interventions that actually move the needle on skeletal health.',
    citation: 'ENDOCRINE SOC. 2024 · CHUNK-031',
  },
  {
    date: '05', month: 'JUL', year: 'MMXXVI',
    title: 'Sleep Architecture in Menopause',
    speaker: 'Dr. Ama Owusu, ACOG',
    format: 'ON DEMAND · RECORDED',
    location: 'Available in member library',
    desc: 'Why sleep changes — and what the evidence actually says about CBT-I, melatonin, and hormone therapy as sleep interventions.',
    citation: 'ACOG BULLETIN 2024 · CHUNK-104',
  },
  {
    date: '12', month: 'JUL', year: 'MMXXVI',
    title: 'Nutrition After Estrogen Decline',
    speaker: 'Dr. Keiko Tanaka, Mayo Clinic',
    format: 'IN PERSON · SAN FRANCISCO',
    location: 'The Battery, 717 Battery St — RSVP required',
    desc: 'A two-hour dinner seminar on the metabolic shifts of menopause and the dietary interventions with the strongest evidence base.',
    citation: 'MAYO CLINIC PROC. 2023 · CHUNK-067',
  },
  {
    date: '19', month: 'JUL', year: 'MMXXVI',
    title: 'HRT Decisions: A Q&A Panel',
    speaker: 'Three NAMS-certified practitioners',
    format: 'LIVE · WEBINAR',
    location: 'Zoom — open to all members',
    desc: 'Candid clinical panel on hormone therapy — candidacy, risk, routes of administration, and the evidence behind current NAMS guidance.',
    citation: 'NAMS 2022 POSITION STATEMENT · CHUNK-008',
  },
  {
    date: '02', month: 'AUG', year: 'MMXXVI',
    title: 'Community Gathering: The West Coast Circle',
    speaker: 'Hosted by Empress Health',
    format: 'IN PERSON · LOS ANGELES',
    location: 'Nomad Hotel, West Hollywood — members only',
    desc: 'An evening for Empress members on the West Coast — informal, no agenda, light dinner. Meet the pods you\'ve been in circles with online.',
    citation: 'EMPRESS COMMUNITY · MMXXVI',
  },
];

const PAST = [
  { n: 'ICES LB 2025', loc: 'Long Beach, CA', format: 'IN PERSON', photos: [
    '/public/events/ICES_LB_2025/opening.jpg',
    '/public/events/ICES_LB_2025/table.jpg',
    '/public/events/ICES_LB_2025/guest.jpg',
  ]},
  { n: 'Retail Club', loc: 'San Jose, CA', format: 'IN PERSON', photos: [
    '/public/events/Retail_Club/RetailClub1.jpg',
    '/public/events/Retail_Club/RetailClub2.jpg',
    '/public/events/Retail_Club/RetailClub3.jpg',
  ]},
  { n: 'Elevate Her', loc: 'San Francisco, CA', format: 'IN PERSON', photos: [
    '/public/events/Elevate_Her/elevateher1.jpg',
    '/public/events/Elevate_Her/elevateher2.jpg',
  ]},
];

function Events() {
  const featured = UPCOMING[0];

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={3} base="" />
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '40px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: -160, width: 620, height: 620, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 16, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>EVENTS · EMPRESS HEALTH · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>CLINICAL · COMMUNITY · IN PERSON + ONLINE</div>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(52px, 6vw, 92px)' }}>
              Events to <em className="italic-emph">gather around.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 26, maxWidth: 600, margin: '26px auto 0' }}>
              Webinars, in-person evenings, and clinical panels — all grounded in the evidence base. No wellness theater.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENT ── */}
      <section style={{ padding: '0 64px 80px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--plum)' }}>Featured event.</span>
            <span className="mono" style={{ color: 'var(--gold)' }}>COMING UP · {featured.format}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'stretch' }}>
            <div style={{ position: 'relative' }}>
              <Placeholder label="EVENT PHOTO · CLINICAL PANEL · NATURAL LIGHT" width="100%" height={640} radius={4} tone="cream" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <span style={{
                position: 'absolute', bottom: 20, left: 20,
                background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)',
                padding: '8px 14px', borderRadius: 999,
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#fff',
              }}>{featured.format} · {featured.location.split('—')[0].trim()}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mono" style={{ color: 'var(--gold)', marginBottom: 10 }}>
                {featured.date} {featured.month} {featured.year}
              </div>
              <h2 className="headline" style={{ margin: '0 0 18px', fontSize: 'clamp(28px, 2.8vw, 44px)' }}>
                {featured.title}
              </h2>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 20 }}>{featured.speaker}</div>
              <p className="body-lg" style={{ margin: '0 0 24px', fontSize: 15 }}>{featured.desc}</p>
              <div className="mono" style={{ color: 'var(--gold)', marginBottom: 28 }}>SOURCES · {featured.citation}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '16px 20px',
                borderRadius: 12, background: 'var(--surface-cream)', border: '1px solid rgba(74,54,100,0.08)' }}>
                <span>{Icon.sparkle(16)}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{featured.location}</span>
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 'auto' }}>
                <button className="btn btn-primary">RSVP {Icon.arrow(14)}</button>
                <button className="btn btn-ghost">Add to calendar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING 2-COL LIST ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 48, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <SectionHeading align="left" eyebrow="UPCOMING" title="On the" italicTail="calendar." />
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>{UPCOMING.length - 1} EVENTS AHEAD</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {UPCOMING.slice(1).map((ev, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 20, padding: '24px 0', borderTop: '1px solid rgba(74,54,100,0.10)', alignItems: 'start' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: 'var(--plum)', lineHeight: 1 }}>{ev.date}</div>
                  <div className="mono" style={{ marginTop: 4, color: 'var(--gold)' }}>{ev.month}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, lineHeight: 1.2, marginBottom: 6 }}>{ev.title}</div>
                  <div className="mono" style={{ color: 'var(--plum)', marginBottom: 6 }}>{ev.speaker}</div>
                  <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>{ev.format}</div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)', margin: '0 0 8px' }}>
                    {ev.desc}
                  </p>
                  <div className="mono" style={{ color: 'var(--gold)', fontSize: 9 }}>SOURCES · {ev.citation}</div>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 12, alignSelf: 'start' }}>
                  RSVP
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAST EVENTS ARCHIVE ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 48, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(26px, 2.4vw, 34px)' }}>
              Past events.
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>THE ARCHIVE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {PAST.map(ev => (
              <div key={ev.n}>
                <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>{ev.n.toUpperCase()}</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ev.photos.length}, 1fr)`, gap: 8, marginBottom: 16 }}>
                  {ev.photos.map((src, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 6, overflow: 'hidden', background: 'var(--surface-tan)' }}>
                      <img src={src} alt={`${ev.n} ${i + 1}`} loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mono" style={{ color: 'var(--ink-faint)' }}>{ev.loc} · {ev.format}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
