/* global React, Placeholder, Nav, SectionHeading, Footer */
// Bundles & Kits — Empress Health Curated Marketplace
// Shopify collection 330403578014 · token 0ad62e12ceaec500c350dc1f4a1958c5

function BundlesAndKits() {
  return (
    <div data-screen-label="Bundles & Kits" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ───── EDITORIAL COVER ───────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', overflow: 'hidden', background: 'var(--surface)' }}>
        {/* Luxury orbs */}
        <div style={{ position: 'absolute', top: -100, left: -120, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.28) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: -80, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.20) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          {/* Volume masthead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 72 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS EDIT · BUNDLES &amp; KITS · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>CURATED · FIELD-TESTED · CITED</div>
          </div>

          {/* Cover headline — 2 col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <span className="chip" style={{ marginBottom: 32 }}>
                <span className="dot" />
                BUNDLES &amp; KITS
              </span>
              <h1 className="display" style={{ margin: '0 0 32px', fontSize: 'clamp(48px, 5.8vw, 88px)' }}>
                Curated for<br/><em className="italic-emph">this chapter.</em>
              </h1>
              <p className="body-lg" style={{ maxWidth: 500, marginBottom: 40 }}>
                Each bundle begins with a clinical need — vasomotor load, disrupted sleep, cognitive fog — and ends with a set of things that actually help. Nothing bundled for the margin. Everything bundled because the panel said so.
              </p>
              <div className="mono" style={{ color: 'var(--gold)' }}>
                SOURCES · MEMBER PANEL · NAMS 2023 § 4.2 · CHUNK-014
              </div>
            </div>

            {/* Cover image with gold corner brackets */}
            <div style={{ position: 'relative' }}>
              <Placeholder label={"BUNDLES COVER\nFLAT LAY · CREAM\nNATURAL LIGHT"} width="100%" height={580} radius={6} tone="cream" />
              {/* Gold corner brackets */}
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              {/* Floating tag */}
              <div className="glass" style={{ position: 'absolute', bottom: 24, left: 24, padding: '14px 18px', borderRadius: 12 }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>ASSEMBLED · NOT RANDOM</div>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, marginTop: 4, color: 'var(--plum)' }}>
                  Every item earns its place
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FEATURED BUNDLE — EDITOR LETTER ───────────────────── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Section ornament */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>The featured bundle.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 72, alignItems: 'start' }}>
            {/* Left: full-bleed photo + gold brackets */}
            <div style={{ position: 'relative' }}>
              <Placeholder label={"FEATURED BUNDLE\nTHE COOL-NIGHT KIT\nCREAM · SOFT WINDOW"} width="100%" height={700} radius={4} tone="lavender" />
              <div style={{ position: 'absolute', top: -12, left: -12, width: 28, height: 28, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -12, right: -12, width: 28, height: 28, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -12, left: -12, width: 28, height: 28, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -12, right: -12, width: 28, height: 28, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div className="mono" style={{ marginTop: 20, color: 'var(--ink-faint)' }}>BUNDLE I · THE COOL-NIGHT KIT</div>
            </div>

            {/* Right: drop-cap editor letter */}
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>BY THE EDITORS</div>
              <SectionHeading
                title="Why this bundle made"
                italicTail="the cover."
                sub=""
              />
              <div style={{ marginTop: 36 }}>
                {/* Drop-cap paragraph */}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.78, color: 'var(--ink-soft)', margin: 0 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                    fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
                    float: 'left', marginRight: 10, marginTop: 6,
                  }}>V</span>
                  asomotor disruption — the hot flush, the 3 a.m. wakeup, the sheet that's wrong — sits at the center of what most members report in their first Health Intelligence assessment. We built this bundle for that. Not to solve it. To make it lighter.
                </p>
                <p className="body-md" style={{ marginTop: 22 }}>
                  Everything here has been used by at least sixty members over two months. The cooling insert was rejected twice before the current version cleared the panel. The magnesium formula went through four third-party assays before we listed it. The linen mask is from a small maker in Lyon who produces forty per month.
                </p>
                <p className="body-md" style={{ marginTop: 22 }}>
                  We do not say "sleep better." We say: the panel reported fewer night wakings in week four. That is the claim. It has a source.
                </p>
              </div>
              <div className="mono" style={{ marginTop: 36, color: 'var(--gold)' }}>
                SOURCES · MEMBER PANEL N=64 · NAMS § 4.2 · CHUNK-014 · CHUNK-031
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40 }}>
                <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>— The Empress Editors</div>
                  <div className="mono" style={{ marginTop: 4, color: 'var(--ink-faint)' }}>THE EMPRESS EDIT · MMXXVI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SHOPIFY BUNDLES COLLECTION ───────────────────────── */}
      <section style={{ padding: '120px 64px 140px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="ALL BUNDLES &amp; KITS"
            title="The full collection,"
            italicTail="assembled."
            sub="Every bundle mapped to a symptom cluster. Members save 15% on all kits."
          />

          {/* Shopify embed mount point */}
          <div style={{ marginTop: 64, background: 'var(--surface-bright)', borderRadius: 'var(--r-xl)', padding: '40px 32px', border: '1px solid rgba(74,54,100,0.06)' }}>
            <div id="collection-component-1760916007974" />
          </div>
        </div>
      </section>

      {/* ───── BY THE EDITORS — closing note ─────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>A note on curation.</span>
              <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 36 }}>
            {[
              { n: 'I', label: 'Field-tested', body: 'No bundle ships without two months of member use. If the panel would not reorder, the bundle does not exist.' },
              { n: 'II', label: 'Cited', body: 'Every claim on this page links to its panel size, its chunk, or its clinical source. Visible in mono beneath each item.' },
              { n: 'III', label: 'Small on purpose', body: 'We curate fewer items per season rather than more. The editors retire more than they add.' },
            ].map((p) => (
              <div key={p.n} className="glass-warm" style={{ padding: 32, borderRadius: 'var(--r-lg)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: 'var(--gold)', lineHeight: 1 }}>{p.n}.</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '16px 0 10px', lineHeight: 1.25, color: 'var(--plum)' }}>{p.label}</h3>
                <p className="body-md" style={{ margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
