/* global React, Nav, Footer, Icon */
// Membership Survey — design-system shell around all existing form fields.
// All field names, ids, and values are preserved exactly from the legacy membershipsurvey.html.
// The survey JS engine (currentPage, surveyData, showPage, validatePage, submitSurvey)
// is preserved via dangerouslySetInnerHTML script at bottom.

function MembershipSurveyPage() {
  const radioOpt = (id, name, value, label) => (
    <label key={id} style={optionStyle} htmlFor={id}>
      <input type="radio" id={id} name={name} value={value} style={{ width: 18, height: 18, accentColor: 'var(--plum)', flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', flex: 1 }}>{label}</span>
    </label>
  );
  const checkOpt = (id, name, value, label) => (
    <label key={id} style={optionStyle} htmlFor={id}>
      <input type="checkbox" id={id} name={name} value={value} style={{ width: 18, height: 18, accentColor: 'var(--plum)', flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', flex: 1 }}>{label}</span>
    </label>
  );

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={2} base="" />
      </div>

      {/* Luxury orbs */}
      <div style={{ position: 'absolute', top: -100, right: -140, width: 580, height: 580, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '30%', left: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <section style={{ position: 'relative', padding: '60px 64px 160px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Masthead */}
          <div style={{ marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>HEALTH ASSESSMENT · 5 SECTIONS</div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(40px, 4.8vw, 72px)', lineHeight: 1.0 }}>
              Your health, <em className="italic-emph">mapped.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 18, maxWidth: 520 }}>
              Help us understand your health and wellness goals. Takes about 10 minutes.
            </p>
          </div>

          {/* Progress indicator */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span id="progress-text" className="mono" style={{ color: 'var(--plum)' }}>01 · LET'S GET STARTED</span>
              <span id="progress-pct" className="mono" style={{ color: 'var(--ink-faint)' }}>PAGE 1 OF 5</span>
            </div>
            <div style={{ height: 3, background: 'rgba(74,54,100,0.10)', borderRadius: 999, overflow: 'hidden' }}>
              <div id="progress-fill" style={{ height: '100%', width: '20%', background: 'var(--plum)', borderRadius: 999, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Error message */}
          <div id="error-message" style={{ display: 'none', padding: '12px 16px', marginBottom: 20, background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: 'var(--r-md)', color: '#a03030', fontFamily: 'var(--font-body)', fontSize: 14 }} />

          {/* ── PAGE 1: Age ── */}
          <div className="glass-warm survey-page active" id="page-1" style={{ padding: 44, borderRadius: 'var(--r-xl)', marginBottom: 24 }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 16 }}>01 · ONBOARDING</div>
            <h2 className="headline" style={{ margin: '0 0 32px', fontSize: 'clamp(26px, 3vw, 40px)' }}>Let's get <em className="italic-emph">started.</em></h2>

            <div style={{ marginBottom: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: 16 }}>How old are you? *</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[['age-18-24','18-24'],['age-25-29','25-29'],['age-30-34','30-34'],['age-35-39','35-39'],['age-40-44','40-44'],['age-45-49','45-49'],['age-50-54','50-54'],['age-55-59','55-59'],['age-60-64','60-64'],['age-65plus','65+']].map(([id, val]) =>
                  radioOpt(id, 'age', val, val)
                )}
              </div>
            </div>
          </div>

          {/* ── PAGE 2: Energy & Exercise ── */}
          <div className="glass-warm survey-page" id="page-2" style={{ padding: 44, borderRadius: 'var(--r-xl)', marginBottom: 24, display: 'none' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 16 }}>02 · ENERGY & EXERCISE</div>
            <h2 className="headline" style={{ margin: '0 0 32px', fontSize: 'clamp(26px, 3vw, 40px)' }}>Your energy, <em className="italic-emph">your movement.</em></h2>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>How would you rate your overall energy? *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['energy-1','Very Low - Constantly Tired'],['energy-2','Low - Tired Most Days'],['energy-3','Moderate - Some Good and Bad Days'],['energy-4','Good - Generally Energetic'],['energy-5','Excellent - Very Energetic']].map(([id,val]) =>
                  radioOpt(id, 'energy_rating', val, val)
                )}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>How often do you currently exercise? *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['exercise-never','Never or rarely'],['exercise-1-2','1-2 times a week'],['exercise-3-4','3-4 times a week'],['exercise-5-6','5-6 times a week'],['exercise-daily','Daily']].map(([id,val]) =>
                  radioOpt(id, 'exercise_frequency', val, val)
                )}
              </div>
            </div>

            <div>
              <div style={fieldLabelStyle}>What type of exercise do you prefer or would like to try? *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['exercise-low-impact','Low-impact - Walking, swimming, yoga'],['exercise-strength','Strength training - Resistance exercises'],['exercise-cardio','Cardio - High-intensity workouts'],['exercise-flexibility','Flexibility & balance - Yoga, pilates'],['exercise-mixed','Mixed activities - A variety of different exercises']].map(([id,val]) =>
                  radioOpt(id, 'exercise_type', val, val)
                )}
              </div>
            </div>
          </div>

          {/* ── PAGE 3: Diet & Wellness ── */}
          <div className="glass-warm survey-page" id="page-3" style={{ padding: 44, borderRadius: 'var(--r-xl)', marginBottom: 24, display: 'none' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 16 }}>03 · DIET & WELLNESS</div>
            <h2 className="headline" style={{ margin: '0 0 32px', fontSize: 'clamp(26px, 3vw, 40px)' }}>Nourishment <em className="italic-emph">and rest.</em></h2>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>How would you rate your current diet? *</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['diet-poor','Poor - Mostly processed foods'],['diet-fair','Fair - Some healthy choices'],['diet-good','Good - Mostly healthy with occasional treats'],['diet-excellent','Excellent - Very healthy and balanced']].map(([id,val]) =>
                  radioOpt(id, 'diet_rating', val, val)
                )}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>Do you have any dietary restrictions or preferences? *</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['diet-no-restrictions','No restrictions'],['diet-vegetarian','Vegetarian'],['diet-vegan','Vegan'],['diet-gluten-free','Gluten-free'],['diet-dairy-free','Dairy-free']].map(([id,val]) =>
                  radioOpt(id, 'dietary_restrictions', val, val)
                )}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>How is your sleep quality? *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['sleep-very-poor','Very Poor - Frequent wake-ups, hard to fall asleep'],['sleep-poor','Poor - Some sleep issues'],['sleep-fair','Fair - Occasional sleep problems'],['sleep-good','Good - Generally sleep well'],['sleep-excellent','Excellent - Sleep soundly most nights']].map(([id,val]) =>
                  radioOpt(id, 'sleep_quality', val, val)
                )}
              </div>
            </div>

            <div>
              <div style={fieldLabelStyle}>How would you rate your stress levels? *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['stress-very-high','Very High - Constantly overwhelmed'],['stress-high','High - Frequently stressed'],['stress-moderate','Moderate - Manageable stress'],['stress-low','Low - Rarely stressed'],['stress-very-low','Very Low - Very calm and relaxed']].map(([id,val]) =>
                  radioOpt(id, 'stress_levels', val, val)
                )}
              </div>
            </div>
          </div>

          {/* ── PAGE 4: Medical & Goals ── */}
          <div className="glass-warm survey-page" id="page-4" style={{ padding: 44, borderRadius: 'var(--r-xl)', marginBottom: 24, display: 'none' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 16 }}>04 · MEDICAL & GOALS</div>
            <h2 className="headline" style={{ margin: '0 0 32px', fontSize: 'clamp(26px, 3vw, 40px)' }}>Your history, <em className="italic-emph">your goals.</em></h2>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>Do you have any existing medical conditions? (Select all that apply)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['medical-diabetes','Diabetes'],['medical-high-bp','High Blood Pressure'],['medical-thyroid','Thyroid disorders'],['medical-heart','Heart disease'],['medical-osteoporosis','Osteoporosis'],['medical-none','None of the above']].map(([id,val]) =>
                  checkOpt(id, 'medical_conditions', val, val)
                )}
              </div>
              <input type="text" id="medical_conditions_other" name="medical_conditions_other" placeholder="Other conditions (comma-separated)" style={{ ...inputStyle, marginTop: 12 }} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>Do you take any medications? *</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['med-none','None'],['med-hormone','Hormone therapy'],['med-supplements','Supplements'],['med-prescription','Prescription medication'],['med-other','Other']].map(([id,val]) =>
                  radioOpt(id, 'medications', val, val)
                )}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>Do you have any allergies?</div>
              <textarea id="allergies" name="allergies" placeholder="Please list any allergies" rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>What is your primary health goal? (Select all that apply)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['goal-symptoms','Manage menopause symptoms'],['goal-energy','Improve energy and vitality'],['goal-sleep','Better sleep quality'],['goal-mood','Balance mood and emotional well-being'],['goal-wellness','Overall wellness and prevention']].map(([id,val]) =>
                  checkOpt(id, 'primary_health_goal', val, val)
                )}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={fieldLabelStyle}>What approaches interest you most? (Select all that apply)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['approach-natural','Natural remedies and supplements'],['approach-lifestyle','Lifestyle and diet changes'],['approach-exercise','Exercise and movement'],['approach-mindfulness','Mindfulness and stress management'],['approach-medical','Medical treatments and consultations']].map(([id,val]) =>
                  checkOpt(id, 'approaches_interest', val, val)
                )}
              </div>
            </div>

            <div>
              <div style={fieldLabelStyle}>Which types of affirmations inspire you? (Select 3) <span style={{ color: '#a03030' }}>*</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['affirm-health','Health'],['affirm-confidence','Confidence'],['affirm-calmness','Calmness'],['affirm-motivation','Motivation'],['affirm-resilience','Resilience']].map(([id,val]) =>
                  checkOpt(id, 'affirmations_inspire', val, val)
                )}
              </div>
            </div>
          </div>

          {/* ── PAGE 5: Symptoms ── */}
          <div className="glass-warm survey-page" id="page-5" style={{ padding: 44, borderRadius: 'var(--r-xl)', marginBottom: 24, display: 'none' }}>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 16 }}>05 · SYMPTOMS</div>
            <h2 className="headline" style={{ margin: '0 0 32px', fontSize: 'clamp(26px, 3vw, 40px)' }}>What you're <em className="italic-emph">experiencing.</em></h2>

            <div>
              <div style={fieldLabelStyle}>Which symptoms are you experiencing? (Select all that apply)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  ['symptom-hot-flashes','Hot Flashes'],['symptom-joint-pain','Joint Pain'],['symptom-cognitive-decline','Cognitive Decline'],
                  ['symptom-night-sweats','Night Sweats'],['symptom-bone-loss','Bone Loss'],['symptom-brain-fog','Brain Fog'],
                  ['symptom-insomnia','Insomnia'],['symptom-weight-gain','Weight Gain'],['symptom-memory-loss','Memory Loss'],
                  ['symptom-fatigue','Fatigue'],['symptom-vaginal-dryness','Vaginal Dryness'],['symptom-stiffness','Stiffness'],
                  ['symptom-hormonal-shifts','Hormonal Shifts'],['symptom-painful-sex','Painful Sex'],['symptom-heart-risk','Heart Risk'],
                  ['symptom-irregular-periods','Irregular Periods'],['symptom-low-libido','Low Libido'],['symptom-hair-loss','Hair Loss'],
                  ['symptom-mood-swings','Mood Swings'],['symptom-urinary-issues','Urinary Issues'],['symptom-stress-intolerance','Stress Intolerance'],
                  ['symptom-anxiety','Anxiety'],['symptom-utis','UTIs'],['symptom-low-confidence','Low Confidence'],
                  ['symptom-depression','Depression'],['symptom-skin-changes','Skin Changes'],['symptom-sensitivity','Sensitivity'],
                  ['symptom-irritability','Irritability'],['symptom-muscle-weakness','Muscle Weakness'],
                ].map(([id,val]) => checkOpt(id, 'symptoms_experiencing', val, val))}
              </div>
            </div>
          </div>

          {/* ── THANK YOU ── */}
          <div id="thank-you" style={{ display: 'none', textAlign: 'center', padding: '80px 40px' }} className="glass-warm">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--gold)', marginBottom: 24 }}>✓</div>
            <h2 className="headline" style={{ margin: '0 0 16px' }}>Thank <em className="italic-emph">you.</em></h2>
            <p className="body-lg" style={{ marginBottom: 8 }}>Your survey has been submitted. We'll be in touch soon.</p>
            <p className="mono" style={{ color: 'var(--ink-faint)' }}>REDIRECTING TO HOME PAGE…</p>
          </div>

          {/* ── NAVIGATION BUTTONS ── */}
          <div id="survey-nav" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 24 }}>
            <button type="button" id="prev-btn" className="btn btn-ghost" style={{ display: 'none' }}>← Previous</button>
            <button type="button" id="next-btn" className="btn btn-primary">Next {Icon.arrow(14)}</button>
          </div>

        </div>
      </section>

      <Footer base="" />

      {/* ── SURVEY ENGINE SCRIPT (preserved from legacy) ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        let currentPage = 1;
        const totalPages = 5;
        const surveyData = {};
        const sectionLabels = ['01 · LET\\'S GET STARTED','02 · ENERGY & EXERCISE','03 · DIET & WELLNESS','04 · MEDICAL & GOALS','05 · SYMPTOMS'];

        function getAuthToken() {
          try { return localStorage.getItem('authToken'); } catch(e) { return null; }
        }

        function updateProgress() {
          const pct = (currentPage / totalPages) * 100;
          document.getElementById('progress-fill').style.width = pct + '%';
          document.getElementById('progress-text').textContent = sectionLabels[currentPage - 1];
          document.getElementById('progress-pct').textContent = 'PAGE ' + currentPage + ' OF ' + totalPages;
        }

        function showPage(num) {
          currentPage = num;
          document.querySelectorAll('.survey-page').forEach(p => {
            p.style.display = 'none';
          });
          const pg = document.getElementById('page-' + num);
          if (pg) pg.style.display = 'block';
          updateProgress();
          document.getElementById('prev-btn').style.display = num === 1 ? 'none' : 'inline-flex';
          document.getElementById('next-btn').textContent = num === totalPages ? 'Submit' : 'Next →';
        }

        function collectPageData(pageNum) {
          const page = document.getElementById('page-' + pageNum);
          if (!page) return;
          const radios = page.querySelectorAll('input[type="radio"]:checked');
          radios.forEach(r => { surveyData[r.name] = r.value; });
          const checks = page.querySelectorAll('input[type="checkbox"]:checked');
          checks.forEach(c => {
            if (!surveyData[c.name]) surveyData[c.name] = [];
            if (!surveyData[c.name].includes(c.value)) surveyData[c.name].push(c.value);
          });
          const texts = page.querySelectorAll('input[type="text"], textarea');
          texts.forEach(t => { if (t.value.trim()) surveyData[t.id] = t.value.trim(); });
        }

        function validatePage(pageNum) {
          const page = document.getElementById('page-' + pageNum);
          if (!page) return true;
          const required = page.querySelectorAll('input[required]');
          for (const inp of required) {
            if (inp.type === 'radio') {
              const group = page.querySelectorAll('input[name="' + inp.name + '"]:checked');
              if (group.length === 0) {
                const errEl = document.getElementById('error-message');
                errEl.textContent = 'Please answer all required questions before continuing.';
                errEl.style.display = 'block';
                return false;
              }
            }
          }
          document.getElementById('error-message').style.display = 'none';
          return true;
        }

        async function submitSurvey() {
          collectPageData(totalPages);
          const navEl = document.getElementById('survey-nav');
          if (navEl) navEl.style.display = 'none';
          try {
            const token = getAuthToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const res = await fetch('/api/survey', { method: 'POST', headers, body: JSON.stringify(surveyData), credentials: 'include' });
            if (res.ok) {
              document.querySelectorAll('.survey-page').forEach(p => p.style.display = 'none');
              document.getElementById('thank-you').style.display = 'block';
              document.getElementById('progress-fill').style.width = '100%';
              setTimeout(() => { window.location.href = '/'; }, 3000);
            } else {
              const errEl = document.getElementById('error-message');
              errEl.textContent = 'There was an error submitting your survey. Please try again.';
              errEl.style.display = 'block';
              if (navEl) navEl.style.display = 'flex';
            }
          } catch(e) {
            const errEl = document.getElementById('error-message');
            errEl.textContent = 'Network error. Please check your connection and try again.';
            errEl.style.display = 'block';
            if (navEl) navEl.style.display = 'flex';
          }
        }

        document.getElementById('next-btn').addEventListener('click', () => {
          if (!validatePage(currentPage)) return;
          collectPageData(currentPage);
          if (currentPage < totalPages) {
            showPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            submitSurvey();
          }
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
          if (currentPage > 1) {
            showPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });

        updateProgress();
      `}} />
    </div>
  );
}

const optionStyle = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '11px 14px', borderRadius: 'var(--r-md)',
  border: '1px solid rgba(74,54,100,0.14)',
  background: 'rgba(255,255,255,0.55)',
  cursor: 'pointer', transition: 'border-color .15s ease',
};
const fieldLabelStyle = {
  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
  letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--plum)', marginBottom: 14,
};
const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '1px solid rgba(74,54,100,0.18)', borderRadius: 'var(--r-md)',
  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
  background: 'rgba(255,255,255,0.7)', outline: 'none',
};
