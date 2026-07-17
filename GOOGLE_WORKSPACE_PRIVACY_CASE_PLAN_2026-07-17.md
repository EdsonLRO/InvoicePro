# Tallyo Google Workspace Privacy Case Plan - 2026-07-17

Internal D07 configuration and synthetic-acceptance plan for `LEGAL-OPS-001`. On 2026-07-17, the Owner reported that Tallyo's Gmail service uses its business domain and that the current edition is Business Standard. The Google Workspace route remains the preferred candidate, but Business Standard does not include Google Vault. The Owner chose to remain on Standard for now; no upgrade or add-on is authorized.

This plan does not authorize account inspection, mailbox inspection, provider configuration, a trial, an upgrade, spending, contract acceptance, real personal data, live cases, external sharing, or retention/deletion rules.

## Required Preconditions

Do not configure or use the case system until all of these are satisfied:

1. the Owner later approves either Business Plus or a confirmed compatible Vault add-on; Business Standard alone does not meet the proposed retention/hold design;
2. the applicable subscription terms, [Google Cloud Data Processing Addendum](https://workspace.google.com/terms/dpa_terms.html), subprocessors, locations/transfers, deletion behaviour, support path, and breach terms have been reviewed and accepted through the existing legal/vendor gate;
3. the Owner separately approves any upgrade, new licensed operator, spending, trial, provider configuration, or contract acceptance;
4. D08-D09 role names and backup coverage are assigned, including an independent reviewer for disclosure, deletion, refusal, extension, incident-notification, and retention-rule decisions;
5. a backup administrator/operator path exists with separately controlled MFA and tested recovery; no credentials or recovery material may enter Git or ordinary chat;
6. the final retention periods and exact rights-deadline rules have qualified review; and
7. Security and Privacy approve the synthetic configuration and evidence plan before any provider change.

## Proposed Locked-Cabinet Design

### Intake

- The existing business/support mailbox is an **intake route only**, not the case record.
- Recognise a privacy request or incident from any channel, assign a non-identifying reference such as `PRIV-YYYY-NNNN`, and move only the minimum necessary evidence into the restricted case area.
- Do not put a name, email address, invoice number, customer name, or allegation in a case title, calendar title, chat, Git issue, or ordinary task tracker.
- Keep account recovery separate from identity verification for a privacy request.

### Internal Case Area

- Create a dedicated organisational Shared Drive for privacy operations; do not use an individual's My Drive.
- Disable external sharing for the internal drive. Restrict membership to the named case roles and keep Manager access to the minimum possible.
- Use a limited-access folder per case. Suggested subfolders are `00-intake`, `10-scope`, `20-approved-evidence`, `30-response-review`, and `40-closure`.
- Keep the identity-to-reference mapping only in the restricted case area. Operational discussion elsewhere uses the case reference only.
- Block offline synchronisation/download to unmanaged devices where the licensed controls support it; otherwise record that limitation and do not accept the configuration for live use.

### Case Register And Deadlines

Use one restricted register with these minimum fields:

| Area | Required fields |
|---|---|
| Identity and timing | Case reference; received date/time/channel; request/incident type; Tallyo role; verified legal deadline; internal checkpoints |
| Ownership | Intake owner; case owner; backup owner; identity approver; response/notification approver; legal/security escalation |
| Scope | Data-subject category; tenant/account reference where approved; systems/providers to search; third-party/protected-material flags |
| Decisions | Identity method/status; extension/refusal/legal-hold reason; actions approved; disclosure/redaction/deletion decision; decision maker and review time |
| Evidence | Restricted folder references; provider reference numbers; result counts; audit-search reference; secure-delivery evidence; no raw provider payloads in the register |
| Closure | Outcome; unresolved limitation; complaint/appeal route where applicable; closed date; retention trigger; deletion due date; deletion/hold status |

- Automation may remind people but must not decide the legal deadline. The case owner records and validates the deadline using current approved guidance.
- Configure multiple internal reminders and an escalation before the deadline. Exact timing remains part of the synthetic test and qualified review.
- Calendar/reminder titles contain the case reference only and use a restricted calendar or approved automation path.
- A missed reminder, missing backup owner, or unclear deadline fails acceptance.

### Evidence And Audit

- Use Drive log events to review material view, edit, download, share, and deletion activity, while recording Google's limitation that not every Drive activity is logged.
- Current Google documentation states that Drive log events are normally retained for six months and Vault log events indefinitely. This does not replace the approved case action record.
- At closure, preserve a minimal review record containing the action, actor/role, time, approval, affected reference/count, result, and audit-search reference. Do not copy private payloads merely to create evidence.
- Confirm whether the actual edition allows the needed log search and export. An unavailable required event or export path is a blocker, not an assumption.

### Attachments And Secure Delivery

- Treat all incoming attachments as untrusted. Use only approved file types and a malware-safe inspection path; do not download case files to unmanaged devices.
- Never share the internal case drive or evidence folders with a requester.
- Build a separate, minimal response package containing only approved disclosure material. Use an authenticated named-recipient route with public/anonymous links disabled and access expiry/revocation tested where supported.
- Verify the recipient separately, record who approved delivery, and test that another account cannot open the package.
- If Business Plus cannot provide the approved delivery guarantees, select a separately reviewed delivery service; ordinary email attachments are not the fallback.

### Retention, Hold, Export, And Deletion

- Google Vault is proposed for retention and legal hold. [Google warns](https://support.google.com/vault/answer/2990828?hl=en) that an incorrect retention rule can cause irreversible purging.
- No Vault rule may be enabled until the final schedule is approved, a rule manifest and rollback/impact analysis are reviewed, a tiny synthetic scope passes, and the Owner separately authorizes the destructive configuration.
- Scope case retention to the dedicated shared drive or approved labels where the licensed edition supports it. Do not apply a default rule across Gmail or Drive merely for convenience.
- Test export, hold, release of hold, normal deletion, provider purge delay, administrator recovery window, and evidence of expiry using fictional cases only.
- A case cannot be described as deleted until active data, shared material, provider residuals, holds, audit exceptions, and recovery windows are recorded honestly.

## Synthetic Acceptance Sequence

Provider configuration is not authorized yet. Once separately approved, use only invented people, addresses, documents, invoice references, and provider references.

1. **Access request:** intake, deadline, identity decision, tenant-scoped search checklist, third-party review, approved response package, authenticated delivery, closure, and audit review.
2. **Correction/deletion request:** approved target manifest, active correction/deletion, Auth/email/payment/provider limitations, legal-hold decision, backup/recovery window, read-back verification, and closure.
3. **Processor-assistance request:** route a fictional business-user request across Supabase, Resend, and Stripe using synthetic references and record each provider limitation without copying payloads.
4. **Fictional personal-data incident:** start the clock, restrict access, record facts and uncertainty, perform the notification-threshold decision, exercise the 72-hour escalation path, recover, and close.
5. **Isolation and continuity:** prove an unauthorized account cannot open a case or response package; revoke an operator; exercise backup-admin access; export a synthetic case; and verify the documented recovery path.
6. **Retention:** apply the candidate rule only to the synthetic scope, verify expected survival and expiry, and stop before any irreversible broad rule.

Pass requires the criteria in `PRIVACY_OPERATIONS_RUNBOOK.md`, complete provider/audit evidence, second-person review, no data outside the restricted test system, and no unresolved high-risk control gap. A tabletop or screenshot alone is insufficient.

## Current Gate

The business-domain Google Workspace Business Standard route is recorded, but D07 remains open. [Google's current edition comparison](https://workspace.google.com/intl/en_gb/business/) includes Vault with Business Plus, while [Google's Vault licensing guidance](https://support.google.com/vault/answer/2557687?hl=en) says an edition without Vault may be able to buy add-on licences. An online add-on starts a 30-day trial and can later bill, so Codex has not opened or activated it.

Current published annual-commitment prices are GBP 11.80 per user/month for Standard and GBP 18.40 for Plus, a GBP 6.60 per-user monthly difference before any tax or contract-specific adjustment. Flexible prices are GBP 14 and GBP 22 respectively. These are comparison signals only, not a purchase recommendation or authorization.

The safe options remain:

1. stay on Standard and keep real-customer privacy-case operations blocked;
2. later approve a Business Plus upgrade review; or
3. later approve checking Vault add-on eligibility and price, without starting the trial.

The Owner selected option 1 for now. Safe internal role, procedure, and synthetic-test preparation may continue, but no provider configuration or live case is allowed.
