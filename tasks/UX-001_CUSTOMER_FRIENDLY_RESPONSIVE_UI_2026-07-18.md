# UX-001 — Customer-friendly responsive navigation and status

Task ID: UX-001\
Objective: Keep every primary navigation option reachable at intermediate window
widths, centre document type badges, and present account status in plain language
without weakening the underlying operational evidence.\
Priority: Medium\
Status: Awaiting Owner Approval\
Phase: Draft pull-request release gate\
Owner role: Master Orchestrator\
Assigned specialist: Frontend and QA responsibilities performed sequentially\
Risk level: Medium — responsive navigation, accessibility and ordinary account UI\
Affected files: `index.html`; `service-worker.js`; focused operational, scale and
PWA harnesses; this task record\
Files locked: the affected files listed above\
Lock acquired: 2026-07-18 on branch `codex/customer-friendly-responsive-ui`\
Triggered specialist domains: Frontend UX and QA; Auth, RLS, payments, secrets,
financial calculations, migrations and legal changes not triggered\
Security boundary: Preserve the account-scoped operational evidence, provider
event semantics, privacy minimisation, Auth controls and every payment control.\
Implementation result: Added a scrollable compact primary menu below 1280px,
kept the full navigation visible once it fits, centred wrapping document-type
badges, and replaced the customer-facing Operational Health wording with a plain
System Status summary while retaining the complete evidence logic in a collapsed
technical explanation. Build prepared as `2026.07.18.10`.\
Review result: Focused operational-health, scale/accessibility/destructive-safety,
PWA-update and core-lifecycle harnesses passed. `git diff --check` passed.\
Evidence: Browser QA passed at 390x700, 900x700 and 1280x800. No horizontal
overflow was present; all nine navigation choices were reachable; the credit-note
badge remained centred; the technical status explanation stayed collapsed; and
the desktop navigation fit inside the viewport.\
Branch: `codex/customer-friendly-responsive-ui`\
Commit: Pending\
Blocked reason: Publishing build `2026.07.18.10` retains the Owner approval
boundary.\
Next action: Open a draft pull request, wait for the required verify check, then
request Owner approval before marking it ready, merging and publishing.
