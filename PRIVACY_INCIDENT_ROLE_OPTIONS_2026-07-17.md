# Tallyo Privacy And Incident Role Options - 2026-07-17

Internal D08-D09 proposal for `LEGAL-OPS-001`. It is designed for Tallyo's initial sole-trader operation and uses role names only. On 2026-07-17, the Owner confirmed that no trusted person or existing professional adviser is available as backup. The professional route in `PROFESSIONAL_BACKUP_SERVICE_OPTIONS_2026-07-17.md` is therefore required before real customers. Do not record private names, addresses, telephone numbers, private emails, identity documents, credentials, or customer/case data in this repository.

This proposal is not a staffing engagement, spending approval, authorization to grant provider access, legal advice, or authorization to handle real cases.

## Plain-English Recommendation

The Owner can perform several day-to-day roles because Tallyo is initially a one-person business. The Owner cannot safely be the only person who can recognise an urgent request, recover access, review a sensitive disclosure/deletion, or help decide whether a serious incident must be reported.

Before real customers, Tallyo needs:

1. the **Owner** as the accountable case and incident lead;
2. one **backup operator** who can access the restricted process during absence or emergency, with their own account and MFA;
3. a **qualified UK legal/privacy adviser** available for complex rights and breach decisions; and
4. an **independent security specialist route** for material technical incidents or forensic uncertainty.

The backup operator and advisers may be external professionals. Selecting, contacting, hiring, paying, licensing, or granting access to anyone remains separately approval-gated.

## Proposed Role Assignment

| Role | Proposed holder | Minimum authority | Must not do alone |
|---|---|---|---|
| Accountable Owner | Tallyo Owner | Own the process, approve ordinary scope, assign work, accept operational risk within existing boundaries, and ensure deadlines are met | Publish legal wording, launch, spend, disclose high-risk material, perform destructive production actions, or override a legal/security block |
| Intake owner | Tallyo Owner; backup operator during absence | Recognise a request/incident from any channel, assign a non-identifying reference, record receipt time, start the deadline/escalation clock, and secure the minimum evidence | Decide disputed identity, exemptions, refusal, deletion, or regulator/person notification |
| Privacy case owner | Tallyo Owner | Scope the case, decide Tallyo's role per activity, coordinate approved searches, maintain the record, and escalate uncertainty | Make a complex legal conclusion without qualified review or disclose unreviewed data |
| Backup operator | Trusted independent person or contracted service, not yet selected | Maintain deadline coverage, exercise emergency access, perform approved intake/administration, and support continuity | Use another person's credentials, access cases without need, approve their own high-risk action, or make final legal/incident decisions |
| Identity decision approver | Tallyo Owner for straightforward cases; qualified adviser for disputed/high-risk cases | Approve proportionate verification and prevent excessive identity-document collection | Treat account recovery as identity proof automatically or request documents by default |
| System/provider operator | Tallyo Owner or separately approved technical operator | Perform the smallest approved tenant-scoped search, export, correction, deletion, or provider request and record counts/references | Expand scope, copy raw payloads into Git/chat, or perform destructive production work without its separate approval |
| Response approver | Tallyo Owner with independent review; qualified adviser for refusal, extension, exemption, protected third-party material, or high-risk disclosure | Approve the final response, redactions, secure delivery route, limitations, and closure | Approve their own high-risk search/action without another review or promise unsupported deletion/compliance |
| Incident lead | Tallyo Owner; backup operator starts the clock if Owner is unavailable | Control the incident record, coordinate containment/facts/recovery, and maintain the decision timeline | Perform unsafe/destructive containment or send notices without authorized review |
| Security specialist | Independently reviewed external route, not yet selected | Preserve and analyse technical evidence, advise on containment, scope, tenant isolation, recovery, and residual risk | Decide the legal notification threshold alone or access more data than needed |
| Privacy/legal decision authority | Qualified UK legal/privacy adviser, not yet selected; Owner remains accountable | Advise on rights, exemptions, legal holds, breach risk, ICO/affected-person notification, wording, and deadlines | Publish or send final communications without the Owner's existing approval boundary |

Codex may help prepare synthetic procedures and code under the repository policies. It is not the human backup operator, legal adviser, incident notification authority, or autonomous operator of real customer cases.

## Decision Rules

| Situation | Minimum decision path |
|---|---|
| Straightforward access/correction request | Case owner prepares; system operator records scoped results; independent reviewer checks identity, scope, redactions, delivery, and limitations; Owner approves |
| Deletion or restriction | Approved target manifest; legal/retention exceptions reviewed; system operator performs only the approved action; read-back verification; independent review; Owner closes |
| Refusal, extension, fee, exemption, disputed identity, third-party conflict, legal hold, sensitive/criminal data, vulnerable person, or cross-border issue | Stop routine processing and obtain qualified legal/privacy advice before the Owner decides |
| Suspected personal-data incident | First available intake/backup starts the clock; Owner leads; security specialist establishes technical facts; qualified privacy authority advises on notification; Owner records and authorizes the decision |
| Destructive containment, production migration, secret rotation, public/customer communication, regulator notice, or spending | Existing Owner/security/legal/release approval boundary applies separately; urgency does not silently remove it |

## Availability And Evidence Gate

Before real customers:

- each role must have a named holder in a restricted non-public record, not Git;
- the intake and backup operators must use separate accounts with MFA and least privilege;
- the backup operator must demonstrate access without using the Owner's credentials;
- response/deletion/incident decisions must demonstrate independent review;
- an out-of-hours route and escalation times must be written and tested;
- absence, access revocation, and emergency recovery must be exercised with fictional cases;
- legal and security routes must have accepted scope, response expectations, confidentiality, data handling, retention, and cost terms; and
- no real case may be accepted while the backup and qualified escalation routes are unavailable.

## Owner Decision And Next Gate

**Owner decision, 2026-07-17:** no trusted person or existing adviser is currently available to act as backup privacy operator. No individual identity was requested or recorded.

This means the informal-backup option is unavailable. Tallyo must select contracted privacy, Workspace-continuity, and incident-response coverage before real cases. `PROFESSIONAL_BACKUP_SERVICE_OPTIONS_2026-07-17.md` records the provider categories, selection criteria, and bounded next approval.

No provider identification, contact, quote, spending, engagement, account, or access grant is authorized yet.
