/* Empress Health — free assessment prototype
   Renders a short multi-step questionnaire, captures an email, and shows a snapshot.
   Nothing is sent anywhere; answers live in memory only. */

(function () {
  'use strict';

  var QUESTIONS = [
    {
      id: 'age',
      title: 'First — how old are you?',
      hint: 'Perimenopause often starts earlier than women are told.',
      type: 'single',
      cols: 2,
      options: [
        { v: 'u40', label: 'Under 40' },
        { v: '40-44', label: '40 – 44' },
        { v: '45-49', label: '45 – 49' },
        { v: '50-54', label: '50 – 54' },
        { v: '55-59', label: '55 – 59' },
        { v: '60+', label: '60 or older' }
      ]
    },
    {
      id: 'cycle',
      title: 'What are your periods doing?',
      hint: 'This is the single strongest clue about where you are.',
      type: 'single',
      options: [
        { v: 'regular', label: 'Still regular, like they always were' },
        { v: 'changing', label: 'Changing — closer together, heavier, or skipping' },
        { v: 'rare', label: 'Very irregular. Months can go by' },
        { v: 'none12', label: 'None for 12 months or more' },
        { v: 'na', label: 'Not applicable (hysterectomy, IUD, or other)' }
      ]
    },
    {
      id: 'symptoms',
      title: 'What has been hardest lately?',
      hint: 'Choose as many as apply — most women pick four or five.',
      type: 'multi',
      cols: 2,
      options: [
        { v: 'sleep', label: 'Broken sleep' },
        { v: 'hot-flashes', label: 'Hot flashes / night sweats' },
        { v: 'brain-fog', label: 'Brain fog, word-finding' },
        { v: 'mood', label: 'Mood swings, irritability' },
        { v: 'anxiety', label: 'Anxiety or low mood' },
        { v: 'energy', label: 'Exhaustion' },
        { v: 'weight', label: 'Weight, especially midsection' },
        { v: 'joints', label: 'Aching joints' },
        { v: 'hair-skin', label: 'Hair thinning, dry skin' },
        { v: 'libido', label: 'Low libido, dryness, discomfort' }
      ]
    },
    {
      id: 'duration',
      title: 'How long has this been going on?',
      type: 'single',
      cols: 2,
      options: [
        { v: '<6m', label: 'Less than 6 months' },
        { v: '6-12m', label: '6 – 12 months' },
        { v: '1-3y', label: '1 – 3 years' },
        { v: '3y+', label: 'More than 3 years' }
      ]
    },
    {
      id: 'impact',
      title: 'How much is it affecting your daily life?',
      hint: 'Work, relationships, patience, the way you feel about yourself.',
      type: 'single',
      options: [
        { v: 'low', label: 'Noticeable, but I manage' },
        { v: 'mid', label: 'It gets in the way most weeks' },
        { v: 'high', label: 'It affects almost every day' },
        { v: 'severe', label: "I don't feel like myself at all" }
      ]
    },
    {
      id: 'care',
      title: 'Have you talked to a doctor about it?',
      type: 'single',
      options: [
        { v: 'no', label: "No — I wasn't sure it was worth raising" },
        { v: 'dismissed', label: 'Yes, and I felt dismissed' },
        { v: 'helped', label: 'Yes, and I got helpful answers' },
        { v: 'treatment', label: "I'm already on hormone therapy or medication" }
      ]
    },
    {
      id: 'tried',
      title: 'What have you already tried?',
      hint: 'So we skip the advice you have heard fifty times.',
      type: 'multi',
      cols: 2,
      options: [
        { v: 'sleep-hygiene', label: 'Sleep routines' },
        { v: 'diet', label: 'Diet changes' },
        { v: 'exercise', label: 'Exercise or strength training' },
        { v: 'supplements', label: 'Supplements' },
        { v: 'hrt', label: 'Hormone therapy' },
        { v: 'therapy', label: 'Therapy or coaching' },
        { v: 'nothing', label: "Honestly, nothing yet" }
      ]
    },
    {
      id: 'goal',
      title: 'If one thing improved this month, what would it be?',
      type: 'single',
      cols: 2,
      options: [
        { v: 'sleep', label: 'Sleeping through the night' },
        { v: 'energy', label: 'Having energy again' },
        { v: 'mood', label: 'Feeling steady' },
        { v: 'clarity', label: 'Thinking clearly' },
        { v: 'body', label: 'Feeling at home in my body' },
        { v: 'answers', label: 'Just understanding what is happening' }
      ]
    }
  ];

  var SYMPTOM_LABELS = {
    'sleep': 'Sleep', 'hot-flashes': 'Vasomotor', 'brain-fog': 'Cognition', 'mood': 'Mood',
    'anxiety': 'Mood', 'energy': 'Energy', 'weight': 'Metabolic', 'joints': 'Joints',
    'hair-skin': 'Skin & hair', 'libido': 'Intimacy'
  };

  var answers = {};
  var step = 0;                       // 0..QUESTIONS.length-1 = questions, then email, then results
  var TOTAL = QUESTIONS.length;
  var stage = document.getElementById('stage');
  var bar = document.getElementById('bar');
  var stepLabel = document.getElementById('stepLabel');
  var backBtn = document.getElementById('backBtn');

  /* pre-select a symptom passed from the homepage chips */
  var params = new URLSearchParams(location.search);
  var focus = params.get('focus');
  if (focus) answers.symptoms = [focus];

  /* ?plan=essential|premium means she arrived from a paid plan on the pricing page:
     the results then point her to the Health Intelligence assessment instead of selling plans again */
  var PLAN_NAMES = { essential: 'Essential', premium: 'Premium' };
  var plan = PLAN_NAMES[(params.get('plan') || '').toLowerCase()] || null;

  backBtn.addEventListener('click', function () {
    if (step > 0) { step--; render(); }
  });

  function setProgress() {
    var pct = Math.min(100, Math.round(((step + 1) / (TOTAL + 2)) * 100));
    bar.style.width = pct + '%';
    if (step < TOTAL) {
      stepLabel.textContent = 'Question ' + (step + 1) + ' of ' + TOTAL;
    } else if (step === TOTAL) {
      stepLabel.textContent = 'Almost there';
    } else {
      stepLabel.textContent = 'Your snapshot';
    }
    backBtn.hidden = step === 0 || step > TOTAL;
  }

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function renderQuestion() {
    var q = QUESTIONS[step];
    var multi = q.type === 'multi';
    var current = answers[q.id] || (multi ? [] : null);

    var card = el('<div class="q-card"></div>');
    card.appendChild(el('<h1>' + q.title + '</h1>'));
    if (q.hint) card.appendChild(el('<p class="q-hint">' + q.hint + '</p>'));

    var list = el('<div class="options' + (q.cols === 2 ? ' two' : '') + '"></div>');
    q.options.forEach(function (o) {
      var on = multi ? current.indexOf(o.v) > -1 : current === o.v;
      var btn = el('<button class="opt" type="button" aria-pressed="' + on + '">' +
        '<span class="tick">✓</span><span>' + o.label + '</span></button>');
      btn.addEventListener('click', function () {
        if (multi) {
          var arr = answers[q.id] || [];
          var i = arr.indexOf(o.v);
          if (i > -1) { arr.splice(i, 1); } else { arr.push(o.v); }
          answers[q.id] = arr;
          btn.setAttribute('aria-pressed', String(i === -1));
          next.hidden = arr.length === 0;
        } else {
          answers[q.id] = o.v;
          Array.prototype.forEach.call(list.children, function (c) { c.setAttribute('aria-pressed', 'false'); });
          btn.setAttribute('aria-pressed', 'true');
          setTimeout(function () { step++; render(); }, 220);
        }
      });
      list.appendChild(btn);
    });
    card.appendChild(list);

    var foot = el('<div class="q-foot"></div>');
    var next = el('<button class="btn btn-gold" type="button">Continue →</button>');
    next.hidden = !multi || !current.length;
    next.addEventListener('click', function () { step++; render(); });
    if (multi) {
      foot.appendChild(next);
      foot.appendChild(el('<p class="microcopy">Pick as many as you need.</p>'));
    } else {
      foot.appendChild(el('<p class="microcopy">Tap an answer to continue.</p>'));
    }
    card.appendChild(foot);

    stage.innerHTML = '';
    stage.appendChild(card);
  }

  function renderEmail() {
    var card = el('<div class="q-card"></div>');
    card.appendChild(el('<h1>Where should we send your report?</h1>'));
    card.appendChild(el('<p class="q-hint">Your results are ready. We send your report to your email so you ' +
      'have a copy to keep, re-read and bring to an appointment.</p>'));

    var form = el('<form class="email-form" novalidate></form>');
    var firstName = el('<input type="text" name="firstName" placeholder="First name" autocomplete="given-name">');
    var email = el('<input type="email" name="email" placeholder="you@example.com" autocomplete="email" required aria-required="true">');
    var phone = el('<input type="tel" name="phone" placeholder="Phone (optional)" autocomplete="tel" inputmode="tel">');
    form.appendChild(firstName);
    form.appendChild(email);
    form.appendChild(phone);
    form.appendChild(el('<p class="field-note">✉ Your report will be sent to this email address. ' +
      'We use it to send your results and never share it with anyone else. ' +
      'A phone number is optional — it only helps us reach you if something needs a follow-up.</p>'));

    var consent = el('<label class="consent"><input type="checkbox" checked>' +
      '<span>Also send me one short science-backed note each week. I can unsubscribe anytime.</span></label>');
    form.appendChild(consent);

    var errBox = el('<p class="err" hidden></p>');
    form.appendChild(errBox);

    var submit = el('<button class="btn btn-gold btn-block" type="submit">Email me my report →</button>');
    form.appendChild(submit);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = email.value.trim();
      if (!v) {
        errBox.textContent = 'Please add your email address — that is where we send your report.';
        errBox.hidden = false;
        email.focus();
        return;
      }
      if (v.indexOf('@') < 1 || v.indexOf('.') < 0) {
        errBox.textContent = 'That email address does not look right. Please check it.';
        errBox.hidden = false;
        email.focus();
        return;
      }
      answers.email = v;
      answers.phone = phone.value.trim();      /* optional — never blocks submission */
      answers.firstName = firstName.value.trim();
      sendReportEmail(answers);                /* best-effort — never blocks showing the results */
      step++;
      render();
    });
    card.appendChild(form);

    stage.innerHTML = '';
    stage.appendChild(card);
  }

  /* Fires the moment she submits her email — she still sees results
     instantly either way, this only affects whether a copy lands in her
     inbox. Failures are logged to the console, not shown to her. */
  function sendReportEmail(a) {
    fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: a.email,
        firstName: a.firstName,
        answers: a
      })
    }).catch(function (err) {
      console.error('send-report failed:', err);
    });
  }

  function estimateStage() {
    var c = answers.cycle, age = answers.age;
    if (c === 'none12') return { name: 'Postmenopause', line: 'It has been a year or more since your last period.' };
    if (c === 'rare') return { name: 'Late perimenopause', line: 'Long gaps between cycles usually mean the transition is well underway.' };
    if (c === 'changing') return { name: 'Perimenopause', line: 'Changing cycles alongside these symptoms is the classic pattern.' };
    if (c === 'regular' && (age === 'u40' || age === '40-44')) return { name: 'Early perimenopause', line: 'Symptoms often begin years before cycles change.' };
    if (c === 'regular') return { name: 'Early perimenopause', line: 'Regular cycles do not rule this out — symptoms often come first.' };
    return { name: 'Needs a closer look', line: 'Without cycle data we lean on your symptom pattern instead.' };
  }

  function renderResults() {
    var st = estimateStage();
    var syms = answers.symptoms || [];
    var name = answers.firstName ? (', ' + answers.firstName) : '';

    var wrap = document.createElement('div');

    wrap.appendChild(el(
      '<div class="result-hero">' +
        '<span class="stage-badge">' + st.name + '</span>' +
        '<h1>Here is your snapshot' + name + '</h1>' +
        '<p class="lede" style="margin-inline:auto">' + st.line + '</p>' +
      '</div>'
    ));

    /* symptom clusters */
    var clusters = {};
    syms.forEach(function (s) {
      var k = SYMPTOM_LABELS[s] || 'Other';
      clusters[k] = (clusters[k] || 0) + 1;
    });
    var impactBoost = { low: 35, mid: 55, high: 75, severe: 88 }[answers.impact] || 50;
    var rows = Object.keys(clusters).map(function (k) {
      return { k: k, pct: Math.min(96, impactBoost + clusters[k] * 12) };
    }).sort(function (a, b) { return b.pct - a.pct; });

    var symCard = el('<div class="result-card"><h3>What you told us</h3></div>');
    if (rows.length) {
      rows.forEach(function (r) {
        symCard.appendChild(el('<div class="sym-row"><label>' + r.k + '</label>' +
          '<div class="meter"><i data-w="' + r.pct + '"></i></div></div>'));
      });
    } else {
      symCard.appendChild(el('<p class="q-hint" style="margin:0">You did not flag specific symptoms — the assessment is still a useful baseline to track against.</p>'));
    }
    symCard.appendChild(el('<p class="q-hint" style="margin:18px 0 0">These bars reflect how strongly you rated each area today. ' +
      'They are a starting point for tracking, not a diagnosis.</p>'));
    wrap.appendChild(symCard);

    /* next steps */
    var goalSteps = {
      sleep: ['Set a fixed wake time for 14 days — it stabilises sleep faster than an earlier bedtime',
              'Keep the bedroom cool and layer thin cotton for night sweats',
              'Log wake-ups for two weeks so a pattern can be shown to your clinician'],
      energy: ['Anchor protein at breakfast to steady the mid-afternoon crash',
               'Add two short strength sessions a week — muscle mass drops in this stage',
               'Ask your doctor whether ferritin and thyroid tests make sense for you'],
      mood: ['Track mood against your cycle for one month — the link is often striking',
             'Protect one non-negotiable hour a week that is yours',
             'Ask your doctor whether hormonal or non-hormonal options suit your history'],
      clarity: ['Note when the fog is worst — it usually tracks sleep and hot flashes',
                'Move the hardest thinking to your best hours for a fortnight',
                'Ask your doctor about common contributors: sleep, iron, thyroid and stress'],
      body: ['Shift the goal from weight to strength for eight weeks',
             'Review skincare and haircare for hormonal dryness and thinning',
             'Be wary of anything promising fast results in this stage'],
      answers: ['Read our plain-language guide to the stages of the transition',
                'Track daily for two weeks — patterns beat memory in an appointment',
                'Bring a written symptom history to your next visit']
    };
    var picks = goalSteps[answers.goal] || goalSteps.answers;
    var nextCard = el('<div class="result-card"><h3>Where to start this week</h3></div>');
    var ol = el('<ul class="next-list"></ul>');
    picks.forEach(function (p, i) {
      ol.appendChild(el('<li><span class="n">' + (i + 1) + '</span><span>' + p + '</span></li>'));
    });
    nextCard.appendChild(ol);
    wrap.appendChild(nextCard);

    /* dismissal-specific nudge */
    if (answers.care === 'dismissed' || answers.care === 'no') {
      wrap.appendChild(el('<div class="result-card"><h3>About that appointment</h3>' +
        '<p style="margin:0;color:var(--muted)">Being brushed off is the most common story we hear. ' +
        'The single thing that changes those conversations is arriving with a written record: ' +
        'what, how often, how bad, and what you have already tried. Empress builds that for you.</p></div>'));
    }

    /* next step: members go on to the full assessment; everyone else sees the plans */
    if (plan) {
      wrap.appendChild(el(
        '<div class="upsell">' +
          '<h3>Your full Consult Report</h3>' +
          '<p>A printable summary of your symptom patterns, your timeline, and the specific questions ' +
          'worth asking your clinician — included with your ' + plan + ' membership.</p>' +
          '<div class="upsell-next">' +
            '<span class="upsell-kicker">Your next step</span>' +
            '<strong>Health Intelligence assessment</strong>' +
            '<span>120 health markers across 10 body systems, no blood draws, about 15 minutes — ' +
            'and it becomes your Consult Report.</span>' +
          '</div>' +
          '<a class="btn btn-gold" href="health-intelligence.html?plan=' + plan.toLowerCase() + '">Start my Health Intelligence assessment →</a>' +
        '</div>'
      ));
    } else {
      wrap.appendChild(el(
        '<div class="upsell">' +
          '<h3>Your full Consult Report</h3>' +
          '<p>A printable summary of your symptom patterns, your timeline, and the specific questions ' +
          'worth asking your clinician — included with every membership, alongside unlimited Ask Empress and tracking.</p>' +
          '<p style="font-size:1.6rem;font-family:var(--display);color:#fff;margin:14px 0 6px">From $9/month</p>' +
          '<p style="font-size:.85rem">Essential $9/mo or $90/yr · Premium $19/mo or $190/yr</p>' +
          '<a class="btn btn-gold" href="pricing.html">See membership plans</a>' +
        '</div>'
      ));
    }

    wrap.appendChild(el('<p class="result-note">Empress Health provides education and wellness guidance only. ' +
      'It does not diagnose, treat or prescribe, and it is not a substitute for professional medical advice. ' +
      'Always consult your doctor about your health and treatment decisions.<br>' +
      '<em>Prototype: your snapshot was emailed to you, but your answers are not saved anywhere.</em></p>'));

    stage.innerHTML = '';
    stage.appendChild(wrap);

    requestAnimationFrame(function () {
      stage.querySelectorAll('.sym-row .meter i').forEach(function (i) { i.style.width = i.dataset.w + '%'; });
    });
  }

  function render() {
    setProgress();
    if (step < TOTAL) renderQuestion();
    else if (step === TOTAL) renderEmail();
    else { bar.style.width = '100%'; renderResults(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render();
})();
