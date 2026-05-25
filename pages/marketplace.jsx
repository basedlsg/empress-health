/* global React, Placeholder, Nav, Icon, Footer */
// Curated Marketplace — Editorial: a tightly-curated boutique, not a SKU dump.

function Marketplace() {
  return (
    <div data-screen-label="Curated Marketplace" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ───── HERO — single hero product · magazine cover ───────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: -160, width: 580, height: 580, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.30) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS EDIT · VOLUME I · ISSUE 03</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>34 ITEMS · CURATED MMXXVI</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
                <span className="mono" style={{ color: 'var(--plum)' }}>THE COVER ITEM · MAY MMXXVI</span>
              </div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.6vw, 84px)' }}>
                A pillow,<br/>for the<br/><em className="italic-emph">3:47 wakeup.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 28, maxWidth: 480 }}>
                Hand-loomed silk over a phase-change cooling core. Tested against four bedside fans by a panel of seventy-two women in vasomotor surge season. Made in Porto by a third-generation atelier.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 36 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--plum)', fontWeight: 500, lineHeight: 1 }}>$184</span>
                <span className="mono" style={{ color: 'var(--ink-soft)' }}>FREE RETURNS · 90 DAY</span>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
                <button className="btn btn-primary">Add to your edit {Icon.arrow(16)}</button>
                <button className="btn btn-ghost">Read the field notes</button>
              </div>

              <div className="mono" style={{ marginTop: 40, color: 'var(--gold)' }}>
                SOURCES · MEMBER PANEL N=72 · NAMS § 4.2
              </div>
            </div>

            {/* Right: editorial cover image + tag */}
            <div style={{ position: 'relative' }}>
              <Placeholder label={"COVER · PILLOW\nSILK · CREAM\nSOFT WINDOW LIGHT"} width="100%" height={640} radius={6} tone="cream"/>
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              {/* Floating field-tested tag */}
              <div className="glass" style={{
                position: 'absolute', bottom: 24, left: 24, padding: '14px 18px', borderRadius: 12,
              }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>FIELD-TESTED · N=72</div>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, marginTop: 4, color: 'var(--plum)' }}>
                  9 of 10 chose it
                </div>
              </div>
              <div className="mono" style={{ marginTop: 22, color: 'var(--ink-faint)', textAlign: 'right' }}>
                ITEM 01 · PORTO ATELIER · MADE TO ORDER
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CURATION PRINCIPLES ──────────────────────────────── */}
      <section style={{ padding: '60px 64px 100px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>HOW WE CURATE</div>
              <h2 className="headline" style={{ margin: 0 }}>
                Four rules.<br/><em className="italic-emph">Held tightly.</em>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 36 }}>
              {[
                { n: 'I', t: 'Field-tested by members',  body: 'Every item is used by at least 50 members across two months. If they would not re-order it, it does not ship.' },
                { n: 'II', t: 'Cited, not advertised',   body: 'Each claim points to the panel size, the chunk, the trial. No "doctor-recommended" without the doctor.' },
                { n: 'III', t: 'Independent of revenue', body: 'Our editor does not see margins. We disclose the affiliate, when there is one, in mono on the page.' },
                { n: 'IV', t: 'Small, on purpose',       body: 'Thirty-four items a season. Sometimes fewer. We retire more than we add.' },
              ].map((p) => (
                <div key={p.n}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 30, color: 'var(--gold)', lineHeight: 1 }}>{p.n}.</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '18px 0 8px', lineHeight: 1.25 }}>{p.t}</h3>
                  <p className="body-md" style={{ margin: 0 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── CATEGORIES STRIP ─────────────────────────────────── */}
      <section style={{ padding: '120px 64px 60px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)', padding: '18px 0' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>The Edit, in six rooms.</span>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>EXPLORE BY ROOM</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, marginTop: 36 }}>
            {[
              ['I',   'Sleep & Cooling',     '08'],
              ['II',  'Mood & Calm',         '06'],
              ['III', 'Skin & Bath',         '07'],
              ['IV',  'Intimacy & Body',     '04'],
              ['V',   'Kitchen & Nutrition', '05'],
              ['VI',  'Movement & Bone',     '04'],
            ].map(([n, t, c]) => (
              <a href="#" key={t} style={{ textDecoration: 'none', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--gold)' }}>{n}.</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, lineHeight: 1.2 }}>{t}</span>
                <span className="mono" style={{ color: 'var(--ink-faint)' }}>{c} ITEMS</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───── THE EDIT — product grid (catalog) ────────────────── */}
      <section style={{ padding: '40px 64px 140px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, rowGap: 72 }}>
            {[
              { n: '02', name: 'Linen sleep mask',        price: '$48',  cat: 'I · Sleep & Cooling',    tone: 'cream',    cite: 'PANEL · N=64' },
              { n: '03', name: 'Magnesium bisglycinate',  price: '$32',  cat: 'II · Mood & Calm',       tone: 'lavender', cite: 'NAMS § 6.1' },
              { n: '04', name: 'Phase-change topper',     price: '$396', cat: 'I · Sleep & Cooling',    tone: 'cream',    cite: 'PANEL · N=58' },
              { n: '05', name: 'Cold-pressed ceramide',   price: '$78',  cat: 'III · Skin & Bath',      tone: 'tan',      cite: 'DERMATOLOGY ASSN.' },
              { n: '06', name: 'Pelvic floor wand',       price: '$112', cat: 'IV · Intimacy & Body',   tone: 'lavender', cite: 'PT-REVIEWED' },
              { n: '07', name: 'Ashwagandha + L-theanine',price: '$28',  cat: 'II · Mood & Calm',       tone: 'cream',    cite: 'TRIAL · 2024' },
              { n: '08', name: 'Bath salt · cardamom',    price: '$22',  cat: 'III · Skin & Bath',      tone: 'tan',      cite: 'IN-HOUSE BLEND' },
              { n: '09', name: 'Resistance loops · set',  price: '$36',  cat: 'VI · Movement & Bone',   tone: 'lavender', cite: 'PHYSIO REVIEWED' },
              { n: '10', name: 'Almond protein crisp',    price: '$18',  cat: 'V · Kitchen & Nutrition',tone: 'cream',    cite: 'MEMBER FAVORITE' },
            ].map((p) => (
              <article key={p.n} className="lift" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={`ITEM ${p.n}\n${p.name.toUpperCase()}`} width="100%" height={360} radius={4} tone={p.tone}/>
                  {/* Item number top-left */}
                  <span style={{
                    position: 'absolute', top: 14, left: 14,
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 24, color: 'var(--surface-bright)',
                    textShadow: '0 2px 6px rgba(74,54,100,0.4)',
                  }}>№ {p.n}</span>
                  {/* gold corner ticks */}
                  <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: -6, right: -6, width: 14, height: 14, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                </div>
                <div style={{ marginTop: 22 }}>
                  <div className="mono" style={{ color: 'var(--gold)' }}>{p.cat}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0, lineHeight: 1.2 }}>{p.name}</h3>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--plum)' }}>{p.price}</span>
                  </div>
                  <div className="mono" style={{ marginTop: 10, color: 'var(--ink-faint)' }}>SOURCES · {p.cite}</div>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <a href="#" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: 4 }}>
              See all 34 items in the May edit →
            </a>
          </div>
        </div>
      </section>

      {/* ───── EDITOR LETTER ────────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>From the editor.</span>
              <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            </div>
          </div>
          <h2 className="headline" style={{ textAlign: 'center', margin: 0 }}>
            On what made the<br/><em className="italic-emph">May cut.</em>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)',
            marginTop: 40, columnCount: 2, columnGap: 56,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
              fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
              float: 'left', marginRight: 12, marginTop: 6,
            }}>I</span>
            n a season of vasomotor noise, we wanted the cover to feel like a hand on the forehead. The pillow we landed on is the closest thing we have ever shipped to that. It is the result of seven prototypes, one returned shipment, and a long Tuesday in Porto where we sat with the loom-master and asked, again, what silk does as it cools.
            <br/><br/>
            We retired six items this month — including two from our own line — because the panel told us they were not pulling their weight. We kept four we love, even if the margins are thin. And we welcomed three new houses to the edit, none of whom paid for the privilege. As always, our affiliate disclosure runs in mono at the foot of every page that has one.
            <br/><br/>
            What this edit is not: a department store, a wellness shop, a Reddit thread. What it is: a small room with thirty-four things in it, every one of which has earned a place by being used. We hope you find one.
          </p>
          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>— A. Kaplan</div>
              <div className="mono" style={{ marginTop: 4, color: 'var(--gold)', textAlign: 'center' }}>EDITOR · THE EMPRESS EDIT</div>
            </div>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
          </div>
        </div>
      </section>

      {/* ───── MEMBER BUNDLES ───────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'end', marginBottom: 56 }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>MEMBER BUNDLES</div>
              <h2 className="headline" style={{ margin: 0 }}>
                Built from your<br/><em className="italic-emph">report.</em>
              </h2>
            </div>
            <p className="body-lg" style={{ margin: 0 }}>
              Three pre-assembled bundles, mapped to common Health Intelligence Report contours. Members save 15%. The bundle adapts to your protocol — swap an item, save the saving.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {[
              { name: 'The cool-night kit',  for: 'For: high vasomotor load · low sleep continuity',
                items: ['Linen sleep mask', 'Phase-change topper', 'Cardamom bath salt'],
                price: '$420', save: '$74 saved', tone: 'rgba(232,222,250,0.55)' },
              { name: 'The steady-mood kit', for: 'For: mood variance · cognitive fog',
                items: ['Magnesium bisglycinate', 'Ashwagandha + L-theanine', 'Almond protein crisp'],
                price: '$68', save: '$10 saved', tone: 'rgba(247,232,218,0.55)' },
              { name: 'The bone & body kit', for: 'For: musculoskeletal load · low movement weeks',
                items: ['Resistance loops · set', 'Cold-pressed ceramide', 'Linen sleep mask'],
                price: '$148', save: '$26 saved', tone: 'rgba(247,222,196,0.55)' },
            ].map((b) => (
              <article key={b.name} className="glass" style={{ padding: 32, borderRadius: 22, backgroundColor: b.tone }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>MEMBER BUNDLE</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, margin: '12px 0 6px', lineHeight: 1.25 }}>{b.name}</h3>
                <p className="body-md" style={{ margin: '0 0 22px' }}>{b.for}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
                  {b.items.map((it) => (
                    <li key={it} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed rgba(74,54,100,0.12)', fontSize: 14 }}>
                      <span>{it}</span>
                      <span className="mono" style={{ color: 'var(--ink-faint)' }}>·</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--plum)', fontWeight: 500, lineHeight: 1 }}>{b.price}</span>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{b.save}</span>
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 18, width: '100%' }}>Add the bundle →</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SHIPPING / RETURNS RIBBON ────────────────────────── */}
      <section style={{ padding: '60px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 36 }}>
          {[
            ['Free domestic shipping',  'Over $80, always'],
            ['90-day returns',          'Used and unused, no questions'],
            ['Carbon-paid',             'Every shipment, every time'],
            ['Independent of margins',  'Our editor never sees them'],
          ].map(([t, s]) => (
            <div key={t}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, color: 'var(--plum)' }}>{t}</div>
              <div className="mono" style={{ marginTop: 8, color: 'var(--ink-soft)' }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
