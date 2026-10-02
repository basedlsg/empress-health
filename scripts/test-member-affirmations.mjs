/**
 * scripts/test-member-affirmations.mjs
 *
 * Member plan delivery: Essential → two affirmations a week (Mon/Thu),
 * Premium → one every day. Needs a LOCAL Postgres (DATABASE_URL on localhost);
 * refuses to run against anything else. Sends nothing (SMTP forced off).
 *
 * Run: MOCK_LLM=1 node scripts/test-member-affirmations.mjs
 */
import { createRequire } from 'module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);

process.env.MOCK_LLM = '1';
require('dotenv').config({ quiet: true });
// Whatever .env says, this test must never send real email.
for (const k of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']) process.env[k] = '';

const dbUrl = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\/([^@/]*@)?(localhost|127\.0\.0\.1)[:/]/.test(dbUrl)) {
  console.log('SKIP: DATABASE_URL is not a local Postgres — this test only runs locally.');
  process.exit(0);
}

const { Pool } = require('pg');
const da = require('../lib/daily-affirmations.js');
const { affirmationCadence } = require('../lib/tiers.js');
const pool = new Pool({ connectionString: dbUrl });
da.setPool(pool);

let passed = 0;
const ok = (cond, label) => { assert.ok(cond, label); console.log(`  PASS  ${label}`); passed += 1; };
const stamp = Date.now();
const emails = { essential: `qa-essential-${stamp}@example.test`, premium: `qa-premium-${stamp}@example.test` };

async function mkUser(email, tier) {
  const r = await pool.query(
    `INSERT INTO users (first_name, last_name, email, hashed_password, subscription_tier, subscription_status)
     VALUES ('QA', $3, $1, '', $2, 'active') RETURNING id`,
    [email, tier, tier]
  );
  return r.rows[0].id;
}
const subFor = async (userId) => (await pool.query(
  `SELECT * FROM daily_affirmation_subscribers WHERE user_id = $1 ORDER BY id DESC LIMIT 1`, [userId])).rows[0];
const weekday = (d) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(new Date(d));

console.log('\n=== test-member-affirmations ===\n');
const ids = {};
try {
  ok(affirmationCadence('essential') === 'twice-weekly' && affirmationCadence('premium') === 'daily' && affirmationCadence('free') === null,
    'tiers map to cadences (essential twice-weekly, premium daily, free none)');

  ids.essential = await mkUser(emails.essential, 'essential');
  ids.premium = await mkUser(emails.premium, 'premium');

  console.log('\nFirst cycle — enrol + welcome send');
  const first = await da.runMemberCycle({ concurrency: 1 });
  ok(first.synced.enrolled >= 2, `both members enrolled (enrolled=${first.synced.enrolled})`);
  const e1 = await subFor(ids.essential);
  const p1 = await subFor(ids.premium);
  ok(e1.cadence === 'twice-weekly' && p1.cadence === 'daily', 'cadence stored per plan');
  ok(first.sent >= 2, `welcome affirmation sent to both (sent=${first.sent})`);

  console.log('\nAfter sending — next slot follows the plan');
  const e2 = await subFor(ids.essential);
  const p2 = await subFor(ids.premium);
  const now = Date.now();
  ok(['Mon', 'Thu'].includes(weekday(e2.next_send_at)), `essential next send is Mon/Thu (${weekday(e2.next_send_at)})`);
  ok(new Date(e2.next_send_at) > now, 'essential next send is in the future');
  ok(new Date(p2.next_send_at) > now && new Date(p2.next_send_at) - now <= 24 * 3600e3, 'premium next send is within 24h (tomorrow 09:00 UTC)');

  console.log('\nSecond cycle straight away — nobody is due');
  const second = await da.runMemberCycle({ concurrency: 1 });
  const dueOurs = (await da.listDueSubscribers()).filter((s) => [String(e1.id), String(p1.id)].includes(s.subscriberId));
  ok(dueOurs.length === 0, 'neither member is due again immediately');
  ok(second.synced.enrolled === 0, 'no duplicate enrolment');

  console.log('\nPlan change + lapse + unsubscribe');
  await pool.query(`UPDATE users SET subscription_tier = 'premium' WHERE id = $1`, [ids.essential]);
  await da.syncMemberSubscriptions();
  const e3 = await subFor(ids.essential);
  ok(e3.cadence === 'daily' && e3.profile_json.tier === 'premium', 'upgrade Essential → Premium switches cadence to daily');

  await pool.query(`UPDATE users SET subscription_tier = 'free', subscription_status = 'canceled' WHERE id = $1`, [ids.premium]);
  await da.syncMemberSubscriptions();
  ok((await subFor(ids.premium)).active === false, 'lapsed member is paused');
  await pool.query(`UPDATE users SET subscription_tier = 'premium', subscription_status = 'active' WHERE id = $1`, [ids.premium]);
  await da.syncMemberSubscriptions();
  ok((await subFor(ids.premium)).active === true, 'returning member is re-enrolled');

  const tok = (await subFor(ids.premium)).unsubscribe_token;
  await da.unsubscribe(tok);
  await da.syncMemberSubscriptions();
  ok((await subFor(ids.premium)).active === false, 'unsubscribed member is NOT re-enrolled by the sync');

  console.log('\nEmail copy');
  const mail = da._renderEmail({ profile: { firstName: 'QA', tier: 'essential' } }, { text: 'Hello', evidence_refs: [] }, [], 'tok');
  ok(/two personalised affirmations a week/.test(mail.html) && /Upgrade to Premium/.test(mail.html), 'Essential email mentions the plan and the Premium upgrade');
  const mail2 = da._renderEmail({ profile: { firstName: 'QA', tier: 'premium' } }, { text: 'Hello', evidence_refs: [] }, [], 'tok');
  ok(!/Upgrade to Premium/.test(mail2.html), 'Premium email has no upgrade nudge');

  console.log(`\n=== ${passed} passed, 0 failed ===`);
} catch (err) {
  console.error('\nFAILED:', err.message);
  process.exitCode = 1;
} finally {
  await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [Object.values(emails)]); // cascades subscribers
  await pool.end();
}
