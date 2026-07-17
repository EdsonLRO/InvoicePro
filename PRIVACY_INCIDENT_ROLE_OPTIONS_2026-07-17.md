# Tallyo Privacy And Incident Role Options - 2026-07-17

Internal D08-D09 proposal for `LEGAL-OPS-001`. It is designed for Tallyo's initial sole-trader operation and uses role names only. On 2026-07-17, the Owner confirmed that no trusted person or existing professional adviser is available as backup and selected an Owner-operated initial model. A second operator or retained professional service is optional for this limited scope, not an automatic launch requirement. Do not record private names, addresses, telephone numbers, private emails, identity documents, credentials, or customer/case data in this repository.

This proposal is not a staffing engagement, spending approval, authorization to grant provider access, legal advice, or authorization to handle real cases.

## Plain-English Recommendation

The Owner can perform the routine roles because Tallyo is initially a one-person, low-volume business. This creates an availability risk, but current ICO small-organisation guidance does not make a DPO or contracted backup operator an automatic requirement for this scope.

Before real customers, Tallyo needs:

1. the **Owner** as the accountable case and incident lead;
2. tested account recovery, deadline reminders and a written absence/monitoring plan;
3. a rule to pause and obtain qualified UK legal/privacy advice for complex rights, notification, transfer or legal-hold decisions; and
4. a rule to obtain specialist technical help when an incident is material or technically uncertain.

An optional alternate operator or adviser can be added as volume, absence risk or case complexity grows. Selecting, contacting, hiring, paying, licensing, or granting access to anyone remains separately approval-gated.

## Proposed Role Assignment

| Role | Proposed holder | Minimum authority | Must not do alone |
|---|---|---|---|
| Accountable Owner | Tallyo Owner | Own the process, approve ordinary scope, assign work, accept operational risk within existing boundaries, and ensure deadlines are met | Publish legal wording, launch, spend, disclose high-risk material, perform destructive production actions, or override a legal/security block |
| Intake owner | Tallyo Owner; optional alternate if later appointed | Recognise a request/incident from any channel, assign a non-identifying reference, record receipt time, start the deadline/escalation clock, and secure the minimum evidence | Decide disputed identity, exemptions, refusal, deletion, or regulator/person notification without the required escalation |
| Privacy case owner | Tallyo Owner | Scope the case, decide Tallyo's role per activity, coordinate approved searches, maintain the record, and escalate uncertainty | Make a complex legal conclusion without qualified review or disclose unreviewed data |
| Optional alternate operator | Not appointed; not an initial launch prerequisite | If later appointed, maintain deadline coverage and perform approved intake/administration using a separate least-privilege account and MFA | Use another person's credentials, access cases without need, approve their own high-risk action, or make final legal/incident decisions |
| Identity decision approver | Tallyo Owner for straightforward cases; qualified adviser for disputed/high-risk cases | Approve proportionate verification and prevent excessive identity-document collection | Treat account recovery as identity proof automatically or request documents by default |
| System/provider operator | Tallyo Owner or separately approved technical operator | Perform the smallest approved tenant-scoped search, export, correction, deletion, or provider request and record counts/references | Expand scope, copy raw payloads into Git/chat, or perform destructive production work without its separate approval |
| Response approver | Tallyo Owner for straightforward cases; qualified advice required when a recorded escalation trigger applies | Approve the final response, redactions, secure delivery route, limitations, and closure | Self-approve a high-risk disclosure, refusal, exemption or disputed legal conclusion without required advice |
| Incident lead | Tallyo Owner | Control the incident record, coordinate containment/facts/recovery, and maintain the decision timeline | Perform unsafe/destructive containment or send notices without authorized review |
| Security specialist | Ad-hoc qualified route when a material or technically uncertain incident occurs | Preserve and analyse technical evidence, advise on containment, scope, tenant isolation, recovery, and residual risk | Decide the legal notification threshold alone or access more data than needed |
| Privacy/legal adviser | Ad-hoc qualified route when a recorded legal trigger occurs; Owner remains accountable | Advise on rights, exemptions, legal holds, breach risk, ICO/affected-person notification, wording, and deadlines | Publish or send final communications without the Owner's existing approval boundary |

Codex may help prepare synthetic procedures and code under the repository policies. It is not the human backup operator, legal adviser, incident notification authority, or autonomous operator of real customer cases.

## Decision Rules

| Situation | Minimum decision path |
|---|---|
| Straightforward access/correction request | Owner completes the identity, scope, third-party, delivery and limitation checklist; system operator records scoped results; Owner approves and closes |
| Straightforward deletion or restriction | Owner approves a target manifest, checks the accepted retention rules, performs only the approved action, records read-back verification, and closes; pause for qualified advice if an exception, dispute or legal hold may apply |
| Refusal, extension, fee, exemption, disputed identity, third-party conflict, legal hold, sensitive/criminal data, vulnerable person, or cross-border issue | Stop routine processing and obtain qualified legal/privacy advice before the Owner decides |
| Suspected personal-data incident | Owner starts the clock and leads; obtain specialist technical facts and qualified privacy advice when materiality, scope or notification is uncertain; Owner records and authorizes the decision |
| Destructive containment, production migration, secret rotation, public/customer communication, regulator notice, or spending | Existing Owner/security/legal/release approval boundary applies separately; urgency does not silently remove it |

## Availability And Evidence Gate

Before real customers:

- the Owner must be recorded as the initial holder of the accountable, intake, case, response and incident roles in a restricted non-public record, not Git;
- the Owner account must use MFA and tested recovery without recording credentials or recovery material;
- request recognition, deadline reminders, absence handling and escalation triggers must be written and tested;
- access, correction, deletion, secure delivery, provider assistance and the 72-hour incident path must pass with fictional cases;
- a complex or high-risk action must pause until the applicable qualified advice is available; and
- if volume, planned absence, account-recovery risk or response-time evidence becomes unacceptable, onboarding must pause until an alternate operator or service is added.

## Owner Decision And Next Gate

**Owner decision, 2026-07-17:** no trusted person or existing adviser is currently available to act as backup privacy operator. No individual identity was requested or recorded.

The Owner accepted the proportionate self-operated route for the limited initial scope. Tallyo does not need contracted privacy backup, Workspace continuity or an incident-response retainer before the first customer. `PROFESSIONAL_BACKUP_SERVICE_OPTIONS_2026-07-17.md` and the public candidate research remain optional contingency references.

No provider contact, quote submission, spending, engagement, account, or access grant is authorized. The next operational gate is approval to configure and synthetically test the selected Business Standard case area without real data.
