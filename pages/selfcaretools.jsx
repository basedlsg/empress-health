/* global React, Placeholder, Nav, SectionHeading, Footer */
// Self-Care Tools — Empress Health Curated Marketplace
// Shopify collection 330403610782 · token 0ad62e12ceaec500c350dc1f4a1958c5
//
// NOTE: the legacy selfcaretools.html used the off-system token #5B2E90 (wrong purple)
// instead of --plum (#33204c), Inter/Poppins/Roboto fonts, pure-white backgrounds,
// and a different type scale. ALL of those have been replaced with canonical
// Empathetic Elegance design tokens here. No hex values below.

function SelfCareTools() {
  return (
    <div data-screen-label="Self-Care Tools" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ───── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', overflow: 'hidden', background: 'var(--surface)' }}>
        {/* Orbs — canonical lavender + peach, not hard purple */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 540, height: 540, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.26) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(58px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 80, right: -80, width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.22) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(52px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 72 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS EDIT · SELF-CARE TOOLS · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>PRACTICAL · EVIDENCE-INFORMED · CITED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <span className="chip" style={{ marginBottom: 32 }}>
                <span className="dot" />
                SELF-CARE TOOLS
              </span>
              {/* Canonical display headline with italic-tail — uses --plum-mid via .italic-emph */}
              <h1 className="display" style={{ margin: '0 0 32px', fontSize: 'clamp(48px, 5.6vw, 84px)' }}>
                Tools,<br/><em className="italic-emph">not props.</em>
              </h1>
              <p className="body-lg" style={{ maxWidth: 500, marginBottom: 40 }}>
                Cooling pads, light therapy panels, vagal tone devices. The category exists because the symptoms are real and the clinical evidence for some of these tools is stronger than for many supplements. We carry only the ones with a study, a mechanism, or a very honest member report that says clearly what it does and does not do.
              </p>
              <div className="mono" style={{ color: 'var(--gold)' }}>
                SOURCES · ACOG 2022 · NAMS § 4.4 · CHUNK-033 · CHUNK-048
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Placeholder label={"SELF-CARE TOOLS\nFLAT LAY · COOLING\nCREAM SURFACE"} width="100%" height={560} radius={6} tone="lavender" />
              {/* Gold corner brackets — canonical pattern */}
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ───── EDITORIAL INTRO — category philosophy ─────────────── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>CATEGORY CONTEXT</div>
              <SectionHeading
                title="What belongs in"
                italicTail="this category."
                sub=""
              />
              <Placeholder label={"TOOLS EDITORIAL\nCOOLING PAD\nSOFT LIGHT"} width="100%" height={300} radius={8} tone="cream" style={{ marginTop: 32 }} />
            </div>

            <div style={{ paddingTop: 8 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.82, color: 'var(--ink-soft)', margin: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
                  float: 'left', marginRight: 10, marginTop: 6,
                }}>T</span>
                he self-care tools category is the part of a marketplace most likely to become noise. Devices that promise everything, gadgets that belong in an infomercial, things that are sold as tools but are really aesthetics. We did not build this page for that.
              </p>
              <p className="body-md" style={{ marginTop: 24 }}>
                What is here falls into three practical subcategories. Cooling tools — pads, wrist bands, handheld devices — that address vasomotor symptoms in the moment. The evidence for topical cooling as a symptom-management strategy is moderate but real. Light therapy panels with evidence for mood and circadian rhythm support, particularly relevant in the sleep disruption that accompanies perimenopause. And vagal tone tools — devices and practices that engage the vagus nerve to shift autonomic state, with the clearest evidence in anxiety and stress response.
              </p>
              <p className="body-md" style={{ marginTop: 20 }}>
                These are tools in the same sense a good pair of walking shoes is a tool. They have a mechanism. They require use. They will not substitute for a clinical conversation, and nothing here makes that claim.
              </p>

              {/* Three subcategory callouts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40 }}>
                {[
                  { label: 'Cooling tools', citation: 'NAMS § 4.4 · CHUNK-033', body: 'Topical cooling for vasomotor symptom management.' },
                  { label: 'Light therapy', citation: 'CHUNK-048 · ACOG 2022', body: 'Circadian rhythm + mood support, evidence-informed.' },
                  { label: 'Vagal tone', citation: 'ANS REVIEW 2023', body: 'Autonomic nervous system tools for stress and anxiety.' },
                ].map((p) => (
                  <div key={p.label} style={{ background: 'var(--surface-lavender)', borderRadius: 'var(--r-md)', padding: '20px 18px', border: '1px solid rgba(74,54,100,0.08)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--plum)', lineHeight: 1.3, marginBottom: 8 }}>{p.label}</div>
                    <p className="body-md" style={{ margin: '0 0 12px' }}>{p.body}</p>
                    <div className="mono" style={{ color: 'var(--gold)' }}>SOURCES · {p.citation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SHOPIFY SELFCARE COLLECTION ───────────────────────── */}
      <section style={{ padding: '120px 64px 80px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="SELF-CARE TOOLS EDIT"
            title="The tools collection,"
            italicTail="practical."
            sub="Cooling, light, and vagal tone. Each with a mechanism. None with a claim it cannot support."
          />

          {/* Shopify embed mount point */}
          <div style={{ marginTop: 64, background: 'var(--surface-bright)', borderRadius: 'var(--r-xl)', padding: '40px 32px', border: '1px solid rgba(74,54,100,0.06)' }}>
            <div id="collection-component-1760916964391" />
          </div>
        </div>
      </section>

      {/* ───── TIP CARD GRID ─────────────────────────────────────── */}
      <section style={{ padding: '100px 64px 140px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Using what you have.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                title: 'For the hot flush',
                tip: 'A cooling pad at the wrist or nape cools a high-density blood vessel. The effect is immediate and the evidence is moderate-strong.',
                cite: 'NAMS § 4.4 · CHUNK-033',
                tone: 'rgba(232,222,250,0.55)',
              },
              {
                title: 'For sleep onset',
                tip: 'A brief light therapy session in the morning (not evening) supports circadian anchoring. Most panels: 20 minutes, 10,000 lux, before 9am.',
                cite: 'CIRCADIAN RESEARCH 2022 · CHUNK-048',
                tone: 'rgba(247,232,218,0.55)',
              },
              {
                title: 'For anxiety & cortisol',
                tip: 'Slow exhale (longer than inhale) activates the vagus nerve. Devices that guide this with resistance or biofeedback extend the practice.',
                cite: 'ANS REVIEW 2023 · CHUNK-061',
                tone: 'rgba(214,188,243,0.30)',
              },
            ].map((p) => (
              <div key={p.title} className="glass" style={{ padding: 32, borderRadius: 'var(--r-lg)', backgroundColor: p.tone }}>
                <div className="mono" style={{ color: 'var(--gold)', marginBottom: 14 }}>TIP</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '0 0 14px', lineHeight: 1.3, color: 'var(--plum)' }}>{p.title}</h3>
                <p className="body-md" style={{ margin: '0 0 20px' }}>{p.tip}</p>
                <div className="mono" style={{ color: 'var(--gold)' }}>SOURCES · {p.cite}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
