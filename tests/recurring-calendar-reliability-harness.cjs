const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const recurring = fs.readFileSync(path.join(root, 'supabase', 'functions', 'generate-recurring', 'index.ts'), 'utf8');
const reminders = fs.readFileSync(path.join(root, 'supabase', 'functions', 'send-overdue-reminders', 'index.ts'), 'utf8');

const helperStart = recurring.indexOf('function daysInMonth');
const helperEnd = recurring.indexOf('// ---- totals and email rendering ----');
assert.ok(helperStart >= 0 && helperEnd > helperStart, 'recurring calendar helpers must remain extractable');
const helperSource = recurring.slice(helperStart, helperEnd)
  .replace(/: number/g, '')
  .replace(/: string/g, '')
  .replace(/: Date/g, '')
  .replace(/: any/g, '');
const helpers = new Function(`${helperSource}\nreturn { advanceOnce, catchUp };`)();
const { advanceOnce, catchUp } = helpers;

const monthly31 = { start_date: '2024-01-31', frequency: 'monthly' };
assert.equal(advanceOnce('2024-01-31', monthly31), '2024-02-29', 'month-end must clamp in a leap year');
assert.equal(advanceOnce('2024-02-29', monthly31), '2024-03-31', 'month-end must return to its anchor day');
assert.equal(advanceOnce('2025-01-31', { ...monthly31, start_date: '2025-01-31' }), '2025-02-28', 'month-end must clamp in a non-leap year');
assert.equal(advanceOnce('2025-02-28', { ...monthly31, start_date: '2025-01-31' }), '2025-03-31', 'non-leap month-end must return to its anchor day');
assert.equal(advanceOnce('2024-02-29', { start_date: '2024-02-29', frequency: 'yearly' }), '2025-02-28', 'leap-day yearly schedules must clamp safely');
assert.equal(advanceOnce('2026-07-18', { start_date: '2026-07-18', frequency: 'weekly' }), '2026-07-25');
assert.equal(advanceOnce('2026-07-18', { start_date: '2026-07-18', frequency: 'custom', custom_unit: 'days', custom_interval: 3 }), '2026-07-21');
assert.equal(advanceOnce('2026-07-18', { start_date: '2026-07-18', frequency: 'custom', custom_unit: 'weeks', custom_interval: 2 }), '2026-08-01');
assert.equal(advanceOnce('2026-01-30', { start_date: '2026-01-30', frequency: 'custom', custom_unit: 'months', custom_interval: 3 }), '2026-04-30');

const caughtUp = catchUp({ next_run: '2026-07-01', start_date: '2026-07-01', frequency: 'weekly' }, '2026-07-18');
assert.deepEqual(caughtUp, { due: true, newNextRun: '2026-07-22' }, 'catch-up must advance beyond today without duplicate dates');
assert.deepEqual(catchUp({ next_run: '2026-07-19', start_date: '2026-07-19', frequency: 'daily' }, '2026-07-18'), { due: false, newNextRun: '2026-07-19' });

for (const pattern of [
  /from\("recurring_templates"\)[\s\S]*?eq\("active", true\)\.lte\("next_run", today\)/,
  /insErr\.code === "23505"/,
  /recurring_occurrence_date/,
  /recurring_generation_retry_reused_invoice/,
  /eq\("user_id", userId\)[\s\S]*?eq\("active", true\)[\s\S]*?eq\("next_run", occurrenceDate\)/,
  /recurring_invoice_generation_failed/,
  /recurring_automation_run_completed/,
  /status: ok \? 200 : 500/,
  /tpl\.email_enabled === true/,
]) assert.match(recurring, pattern);

for (const pattern of [
  /eq\("overdue_reminders_enabled", true\)/,
  /inv\.status === "Draft" \|\| inv\.status === "Paid" \|\| inv\.status === "Cancelled"/,
  /if \(outstanding <= 0\.001\)/,
  /"Idempotency-Key": resendRequestKey/,
  /eq\("user_id", userId\)/,
  /overdue_reminder_run_completed/,
  /return json\([\s\S]*?ok \? 200 : 500\)/,
]) assert.match(reminders, pattern);

console.log('Recurring calendar and retry reliability harness passed.');
