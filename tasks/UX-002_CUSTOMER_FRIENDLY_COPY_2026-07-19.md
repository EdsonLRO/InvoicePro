# UX-002 — Customer-friendly account and workflow wording

Task ID: UX-002\
Objective: Remove the customer-facing status panel and replace technical account,
security, export, reminder and email-status wording with clear customer language
without changing the underlying controls or retained activity evidence.\
Priority: Medium\
Status: Awaiting Owner Approval\
Phase: Draft pull-request release gate\
Owner role: Master Orchestrator\
Assigned specialist: Frontend and QA responsibilities performed sequentially\
Risk level: Medium — customer-facing copy and removal of an ordinary account UI
component; no Auth, MFA, session, export, reminder, email, payment or audit
behaviour changes\
Affected files: `index.html`; `service-worker.js`; focused account-export,
email-status, operational-evidence and PWA harnesses; this task record\
Files locked: the affected files listed above\
Lock acquired: 2026-07-19 on branch `codex/customer-friendly-copy`\
Triggered specialist domains: Frontend UX and QA. Security behaviour is preserved
and tested because some copy explains existing password, MFA and sign-out controls.
Payments, RLS, secrets, migrations, legal and provider configuration are not
triggered.\
Security boundary: Preserve the exact Current Password confirmation note, the
12-character password rule, MFA and recovery requirements, local/global sign-out,
account-export privacy, reminder opt-in, audit-event loading and document Activity
History.\
Implementation result: Removed the complete System Status panel and its unused
presentation-only computed code. Rewrote technical customer-facing guidance on
account creation, passwords, MFA recovery, account export, sign-out, automatic
reminders, recurring catch-up, email progress and Activity History. Underlying
audit-event loading and all protected workflows remain unchanged. Build prepared
as `2026.07.19.1`.\
Review result: Focused operational-evidence/customer-copy, email-status,
account-export, MFA-recovery, session-expiry, scale/accessibility/destructive-safety
and PWA-update harnesses passed. `git diff --check` passed.\
Evidence: Browser QA passed at 390x844 and 1280x800. The status panel was absent;
all five retained preview sections stayed within the mobile viewport; no horizontal
overflow or technical-copy match was present; and the desktop content remained
centred at its intended width.\
Branch: `codex/customer-friendly-copy`\
Commit: Pending\
Blocked reason: None during implementation. Publishing the frontend retains the
Owner approval boundary.\
Next action: Open a draft pull request, wait for the required verify check, then
request Owner approval before marking it ready, merging and publishing build
`2026.07.19.1`.
