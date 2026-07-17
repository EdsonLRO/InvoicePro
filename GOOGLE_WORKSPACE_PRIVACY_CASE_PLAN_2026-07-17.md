# Tallyo Google Workspace Privacy Case Plan - 2026-07-17

Internal D07 configuration and synthetic-acceptance plan for `LEGAL-OPS-001`. On 2026-07-17, the Owner selected Google Workspace Business Standard as the proportionate initial case-system candidate. Subsequent browser verification found only consumer Drive capability in the controlled account, and Google presented a Business Standard trial/checkout rather than an active subscription. Subscription and configuration are therefore pending. Business Standard does not include Google Vault, but Vault remains an optional e-discovery/hold control rather than an automatic prerequisite for the approved sole-trader, low-volume scope.

This plan does not authorize account inspection, mailbox inspection, provider configuration, a trial, an upgrade, spending, contract acceptance, real personal data, live cases, external sharing, or retention/deletion rules.

## Required Preconditions

Do not configure or use the case system until all of these are satisfied:

1. the contract, pricing, cancellation, DPA, subprocessor and transfer review is completed, then the Owner separately approves the Business Standard trial/subscription and any fictional-data configuration; no Vault purchase is required for the initial design;
2. the applicable subscription terms, [Google Cloud Data Processing Addendum](https://workspace.google.com/terms/dpa_terms.html), subprocessors, locations/transfers, deletion behaviour, support path, and breach terms have been reviewed and accepted through the existing legal/vendor gate;
3. the Owner separately approves any upgrade, new licensed operator, spending, trial, provider configuration, or contract acceptance;
4. D08-D09 record the Owner as initial operator, the optional-alternate position, the absence/monitoring plan, and the legal/security escalation triggers;
5. the Owner account uses MFA and tested recovery; no credentials or recovery material may enter Git or ordinary chat;
6. the final retention periods and exact rights-deadline rules have qualified review; and
7. Security and Privacy approve the synthetic configuration and evidence plan before any provider change.

## Proposed Locked-Cabinet Design

### Intake

- The existing business/support mailbox is an **intake route only**, not the case record.
- Recognise a privacy request or incident from any channel, assign a non-identifying reference such as `PRIV-YYYY-NNNN`, and move only the minimum necessary evidence into the restricted case area.
- Do not put a name, email address, invoice number, customer name, or allegation in a case title, calendar title, chat, Git issue, or ordinary task tracker.
- Keep account recovery separate from identity verification for a privacy request.

### Internal Case Area

- Create a dedicated organisational Shared Drive for privacy operations if the actual Standard account supports the required controls; otherwise use a dedicated restricted organisational folder and record the limitation. Do not use an unmanaged consumer account.
- Disable external sharing for the internal drive. Restrict membership to the named case roles and keep Manager access to the minimum possible.
- Use a limited-access folder per case. Suggested subfolders are `00-intake`, `10-scope`, `20-approved-evidence`, `30-response-review`, and `40-closure`.
- Keep the identity-to-reference mapping only in the restricted case area. Operational discussion elsewhere uses the case reference only.
- Avoid offline synchronisation/download to unmanaged devices. Where the edition cannot technically block it, the Owner must use a managed-device operating rule and verify that no case content is synchronised locally during the synthetic test.

### Case Register And Deadlines

Use one restricted register with these minimum fields:

| Area | Required fields |
|---|---|
| Identity and timing | Case reference; received date/time/channel; request/incident type; Tallyo role; verified legal deadline; internal checkpoints |
| Ownership | Intake owner; case owner; optional alternate if appointed; identity approver; response/notification approver; legal/security escalation |
| Scope | Data-subject category; tenant/account reference where approved; systems/providers to search; third-party/protected-material flags |
| Decisions | Identity method/status; extension/refusal/legal-hold reason; actions approved; disclosure/redaction/deletion decision; decision maker and review time |
| Evidence | Restricted folder references; provider reference numbers; result counts; audit-search reference; secure-delivery evidence; no raw provider payloads in the register |
| Closure | Outcome; unresolved limitation; complaint/appeal route where applicable; closed date; retention trigger; deletion due date; deletion/hold status |

- Automation may remind the Owner but must not decide the legal deadline. The Owner records and validates the deadline using current approved guidance.
- Configure multiple internal reminders and an escalation before the deadline. Exact timing remains part of the synthetic test and qualified review.
- Calendar/reminder titles contain the case reference only and use a restricted calendar or approved automation path.
- A missed reminder, untested absence rule, or unclear deadline fails acceptance.

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
- If Standard cannot provide the approved delivery guarantees, select a separately reviewed delivery method; ordinary email attachments are not the fallback for a high-risk disclosure.

### Retention, Export, Deletion, And Triggered Holds

- Business Standard uses the approved case register, dedicated case area, closure date, deletion due date, scheduled review and manual deletion/read-back evidence. Record Drive trash/recovery windows and do not promise immediate or irrecoverable deletion.
- Test case export, ordinary deletion, sharing revocation, provider recovery window and evidence of expiry using fictional cases only.
- If a real case raises litigation, regulatory preservation, disputed deletion or another legal-hold need, pause ordinary deletion and obtain qualified advice before acting. Vault, an add-on or another reviewed preservation method can then be considered under separate approval.
- If Vault is later approved, [Google warns](https://support.google.com/vault/answer/2990828?hl=en) that an incorrect retention rule can cause irreversible purging. No rule may be enabled until a manifest, impact analysis, tiny synthetic scope and separate destructive-configuration approval pass.
- A case cannot be described as deleted until active data, shared material, provider residuals, holds, audit exceptions, and recovery windows are recorded honestly.

## Synthetic Acceptance Sequence

Provider configuration is not authorized yet. Once separately approved, use only invented people, addresses, documents, invoice references, and provider references.

1. **Access request:** intake, deadline, identity decision, tenant-scoped search checklist, third-party review, approved response package, authenticated delivery, closure, and audit review.
2. **Correction/deletion request:** approved target manifest, active correction/deletion, Auth/email/payment/provider limitations, legal-hold decision, backup/recovery window, read-back verification, and closure.
3. **Processor-assistance request:** route a fictional business-user request across Supabase, Resend, and Stripe using synthetic references and record each provider limitation without copying payloads.
4. **Fictional personal-data incident:** start the clock, restrict access, record facts and uncertainty, perform the notification-threshold decision, exercise the 72-hour escalation path, recover, and close.
5. **Isolation and continuity:** prove an unauthorized account cannot open a case or response package; verify Owner account recovery without exposing recovery material; export a synthetic case; and test the absence/monitoring rule.
6. **Retention:** apply the manual schedule to the synthetic scope, verify sharing revocation, ordinary deletion and the documented recovery/expiry limitations, and stop before any irreversible broad rule.

Pass requires the criteria in `PRIVACY_OPERATIONS_RUNBOOK.md`, complete provider/audit evidence, recorded Owner review, qualified advice for any simulated escalation trigger, no data outside the restricted test system, and no unresolved high-risk control gap. A tabletop or screenshot alone is insufficient.

## Current Gate

Google Workspace Business Standard remains the selected candidate, but the subscription is `Pending / not verified active`. Google presented a 14-day trial with a later paid charge; no checkout, agreement acceptance, billing setup or configuration is authorised by the earlier fictional-data approval. D07 cannot proceed until the vendor/transfer review and a separate subscription decision are complete. If purchased, [Google's current edition comparison](https://workspace.google.com/intl/en_gb/business/) places Vault in Business Plus, while [Google's current reporting guidance](https://support.google.com/a/answer/7061566?hl=en) states that Drive log events are normally retained for six months. Those facts define limitations; they do not by themselves require an upgrade.

Current published pricing remains a comparison signal only. Standard is not verified active, and this plan does not authorise a subscription, add-on, trial, agreement acceptance, billing setup or other spending.

The proportionate path is:

1. approve fictional-data configuration of a restricted Standard case area;
2. pass access, audit, deadline, secure-delivery, retention/deletion, recovery and 72-hour synthetic exercises; and
3. reconsider Vault, a second operator or paid support only if a later legal hold, scale, absence, customer/insurer condition or risk assessment requires it.

No provider configuration or live case is authorised by this document. The next gate is explicit Owner approval for the fictional-data Standard configuration and synthetic test; external legal publication and real-customer launch remain separately blocked.
