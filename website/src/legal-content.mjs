const effectiveDate = "31 July 2026";

export const privacyNotice = `
  <section class="page-hero legal-hero">
    <p class="eyebrow">Legal</p>
    <h1>Tallyo Privacy Notice</h1>
    <p>Effective ${effectiveDate}. This notice explains how Tallyo uses personal information.</p>
  </section>
  <article class="legal-document">
    <section>
      <h2>Who we are</h2>
      <p>Tallyo is operated by Edson Oliveira, a sole trader based in the United Kingdom. This notice explains how Tallyo uses personal information when you visit the Tallyo website, create or use a Tallyo account, buy a Tallyo subscription, contact us, or interact with a business that uses Tallyo.</p>
      <address>
        <strong>Business and service address</strong><br>
        87 Coles Green Road, NW2 7JH, London, UK<br>
        <strong>Contact</strong> <a href="mailto:main@tallyo.co.uk">main@tallyo.co.uk</a><br>
        <strong>Privacy requests</strong> <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>
      </address>
    </section>

    <section>
      <h2>Our different data-protection roles</h2>
      <p>Tallyo is the <strong>controller</strong> for account registration and security, Tallyo subscriptions, service administration, support and complaints, product security, the public website, and the AI Helper if it is enabled. This means we decide why and how that information is used.</p>
      <p>When a business user enters information about their customers, contacts, invoices, quotes, credit notes, recurring documents or payment status, that business normally decides why the information is used. The business is the controller and Tallyo acts as its <strong>processor</strong>. Questions about a business's invoice or its use of your information should normally be sent to that business first. We assist the business with data-protection requests where required.</p>
      <p>Stripe and other providers may act as our processor, as an independent controller, or both, depending on the activity. Their roles are described below.</p>
    </section>

    <section>
      <h2>Information we use</h2>
      <h3>Account and security information</h3>
      <p>We use your email address, account identifier, email-confirmation state, sign-in and session information, optional authenticator-app MFA state, recovery events, security events and device/session controls. One-time recovery codes are shown to you, but Tallyo stores only protected hashes while they are needed.</p>

      <h3>Business profile and document information</h3>
      <p>A business user may enter their business name, address, contact details, tax identifier, logo, branding, payment instructions, notes and terms. They may also create customer records, saved products or services, invoices, quotes, credit notes and recurring schedules. Those records can include customer contact details, line items, dates, references, amounts, tax, discounts, notes, payment status, reminders and activity history.</p>
      <p>Please do not enter information that Tallyo does not need. Tallyo is not designed for special-category information or regulated professional records.</p>

      <h3>Subscription and payment information</h3>
      <p>For a Tallyo subscription, we use limited Stripe identifiers and subscription, price, period, payment and entitlement status needed to provide and manage the service.</p>
      <p>When a business connects its own Stripe account for customer card payments, that business is the merchant of record for direct charges. Tallyo receives limited identifiers, amount, currency, status, event time, invoice association, refund/dispute status and reconciliation information.</p>
      <p>Card numbers, CVCs, Stripe identity documents and payout-bank credentials are entered directly into Stripe and are not stored by Tallyo. A business user may separately place their own payment instructions or manual payment notes on a document.</p>

      <h3>Communications and support</h3>
      <p>We use the information in support questions, complaints, privacy requests and related correspondence. Document email and reminder delivery can include the recipient's email address, the document PDF, business/customer details and delivery status.</p>
      <p>If you separately enter an email address in the free invoice generator and tick the optional consent box, Tallyo uses that address to send the single introductory overview you requested. We do not copy the invoice sender or recipient address into this field. We record the consent wording and version, time, source, one-way address and connection fingerprints, send state and any withdrawal so we can honour the one-email limit and demonstrate your choice.</p>

      <h3>Website, service and security information</h3>
      <p>Our infrastructure providers may process request metadata such as IP address, approximate country, browser or device information, timestamps and request identifiers to deliver and protect the service, enforce access controls, diagnose errors and prevent abuse.</p>
      <p>If you choose <strong>Accept analytics</strong>, Tallyo uses Google Analytics 4 to understand how people use the public website and selected account journeys. Google may process an analytics cookie identifier, a query-free page address, approximate location derived from the connection, browser/device information and the limited events listed in our <a href="/cookies/">Cookie Notice</a>. We do not send names, email addresses, company details, customer records, invoice or quote contents, payment information, Stripe identifiers, free-text entries or internal user identifiers to Google Analytics.</p>
      <p>Analytics is off unless you affirmatively accept it. Tallyo uses Google's basic consent approach, so the Google tag is not loaded and no analytics request is sent before acceptance. You can reject Analytics and still use Tallyo, or withdraw later using the persistent <strong>Cookie settings</strong> control. Tallyo does not enable Google Signals, advertising personalisation, enhanced conversions, user-provided data collection or advertising cookies.</p>

      <h3>AI Helper</h3>
      <p>The public AI Helper answers questions about public Tallyo product information. When a visitor submits a question that the reviewed browser guidance cannot answer directly, Tallyo sends the short question and reviewed public Tallyo information to OpenAI. The Helper is not designed to access account records or private business/customer data, and visitors must not enter that information.</p>
      <p>Tallyo does not intentionally store a Helper conversation history. OpenAI's standard API abuse-monitoring logs may retain prompt and response content for up to 30 days unless a separately approved reduced-retention control applies. Cloudflare uses a short-lived, protected network-derived key to enforce the Helper rate limit.</p>
    </section>

    <section>
      <h2>Why we use personal information</h2>
      <p>We use information only where a lawful basis applies:</p>
      <ul>
        <li><strong>Contract:</strong> to create and operate a user's Tallyo account, provide subscribed features, manage the subscription, deliver requested support, and take requested steps before a contract.</li>
        <li><strong>Legal obligation:</strong> to keep Tallyo's own tax/accounting records, respond to binding legal requirements, and meet other specific duties that apply to us.</li>
        <li><strong>Legitimate interests:</strong> to secure the service, prevent fraud and abuse, diagnose faults, provide operational support, maintain limited audit and payment-integrity evidence, and establish, exercise or defend legal claims. We use this basis only after considering necessity, the effect on people and appropriate safeguards.</li>
        <li><strong>Consent:</strong> for optional Google Analytics measurement after you choose <strong>Accept analytics</strong>, and for the single introductory Tallyo overview email only when you enter an address and tick its separate consent box. You can withdraw Analytics consent using <strong>Cookie settings</strong> and withdraw the overview-email consent using the unsubscribe link in that email.</li>
      </ul>
      <p>Business users are responsible for identifying their lawful basis for the customer and document information they enter. We process that information under their instructions and the applicable <a href="/data-processing-terms/">Data Processing Terms</a>.</p>
    </section>

    <section>
      <h2>Who receives information</h2>
      <p>We use providers only for genuine service purposes:</p>
      <ul>
        <li><strong>Supabase:</strong> database, authentication and server functions.</li>
        <li><strong>Resend:</strong> service, document, reminder, security and separately requested one-time overview email delivery.</li>
        <li><strong>Cloudflare:</strong> website/app delivery, access protection, Turnstile, request security and the AI rate limiter.</li>
        <li><strong>Stripe:</strong> Tallyo subscription Billing, connected-account onboarding and customer payments, payment/refund/dispute processing, fraud prevention and regulatory compliance. Stripe's role depends on the activity.</li>
        <li><strong>OpenAI:</strong> public product-question processing only if the AI Helper is enabled.</li>
        <li><strong>Google Analytics:</strong> optional website and selected account-journey measurement only after affirmative Analytics consent. Advertising features and user-provided data collection are disabled.</li>
        <li><strong>Google Workspace:</strong> Tallyo's official system for business, support and privacy email and restricted privacy-request records.</li>
        <li><strong>GitHub:</strong> source-code administration and limited rollback hosting; it is not the primary store for Tallyo customer workspaces.</li>
      </ul>
      <p>Providers may use their own subprocessors. We may also disclose information to professional advisers, regulators, courts, law enforcement or a buyer of the business where lawful and necessary.</p>
      <p>We do not sell personal information.</p>
    </section>

    <section>
      <h2>Stripe's roles</h2>
      <p>Stripe generally processes payment data to provide payment services and also determines some processing for fraud prevention, security, legal and regulatory compliance.</p>
      <p>For Tallyo subscriptions, Tallyo determines the subscription purpose. Stripe provides Checkout, payment, billing and portal services and carries out its own compliance and fraud functions.</p>
      <p>For direct connected-account customer payments, the connected business is the merchant of record. Stripe provides the connected account, onboarding, payment, payout, refund, dispute, identity and regulatory services. Tallyo retains only the limited status and reconciliation information needed to operate the invoice workflow.</p>
      <p>Stripe gives individuals its own privacy information for processing it controls.</p>
    </section>

    <section>
      <h2>International transfers</h2>
      <p>Some providers and their subprocessors process information outside the United Kingdom, including in the United States, the European Economic Area and other countries listed in their current subprocessor records.</p>
      <p>Where UK information is transferred to a country without applicable UK adequacy regulations, the relevant provider terms use safeguards such as the UK International Data Transfer Agreement or the UK Addendum to the European Commission Standard Contractual Clauses. A provider may use another lawful transfer mechanism for processing it controls. You may contact us for more information about the applicable safeguard.</p>
      <p>Provider terms and locations can change. We review the relevant data-processing terms and subprocessor information as part of provider oversight.</p>
    </section>

    <section>
      <h2>How long we keep information</h2>
      <p>We keep active-account and workspace information while the account is active.</p>
      <p>To close an account or request deletion, email <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>. We verify and review each request manually. We delete or anonymise information when it is no longer necessary, but may retain limited records where required for tax, accounting, fraud prevention, payment disputes, regulatory duties or legal claims. We do not promise a fixed closed-account deletion deadline.</p>
      <p>Deleted active-database information may remain temporarily in Supabase daily backups for up to seven days under the current Pro-plan cycle. Other providers retain information under their documented cycles and legal obligations.</p>
      <p>We keep Tallyo's own subscription and tax/accounting records for the period required by UK tax law. Routine operational records are kept for shorter periods based on their security, support or payment-integrity purpose. Ordinary support records are normally reviewed for deletion two years after closure, privacy-request records three years after closure, and material claims when the claim and any necessary legal-retention period end.</p>
      <p>Your Analytics consent preference is stored for up to six months so the website can respect your choice. If you accept, Tallyo configures Google Analytics cookies with a maximum age of six months. Withdrawing consent stops future Analytics events from Tallyo and removes the Analytics cookies that Tallyo can identify on this domain. Google may retain previously received Analytics event data under the retention settings and legal obligations that apply to its service.</p>
      <p>For the optional one-time overview email, Tallyo removes the plain email address from its request record after the send attempt. We keep the minimised consent, one-way address fingerprint, send and withdrawal evidence only while reasonably needed to demonstrate the request, prevent a duplicate overview and respect a withdrawal. We review that evidence at least annually and delete or anonymise it when it is no longer needed.</p>
      <p>Tallyo does not intentionally retain AI Helper conversations. If the Helper is enabled, standard OpenAI API abuse-monitoring logs may retain content for up to 30 days. Stripe keeps information it controls for its legal, regulatory, fraud and financial obligations.</p>
      <p>We review retention manually at launch and record any exception or legal hold. More information about the retention criteria is available on request.</p>
    </section>

    <section>
      <h2>Security</h2>
      <p>Tallyo uses confirmed accounts, optional authenticator-app MFA, one-time recovery controls, session revocation, tenant-isolated database rules, server-side checks, signed webhooks and access controls. Providers also apply their own security measures.</p>
      <p>No system can remove every risk. Users should use a strong unique password, protect recovery codes and avoid entering unnecessary or sensitive information.</p>
    </section>

    <section>
      <h2>Your rights</h2>
      <p>Depending on the circumstances, UK data-protection law may give you rights to:</p>
      <ul>
        <li>be informed about processing;</li>
        <li>obtain access to your information;</li>
        <li>correct inaccurate or incomplete information;</li>
        <li>request erasure;</li>
        <li>restrict processing;</li>
        <li>object to processing based on legitimate interests;</li>
        <li>receive portable information where applicable;</li>
        <li>withdraw consent for future processing where consent is the basis; and</li>
        <li>complain to the Information Commissioner's Office.</li>
      </ul>
      <p>Some rights have legal limits. We may need to confirm your identity and clarify your request.</p>
      <p>If your request concerns an invoice, customer record or other information entered by a Tallyo business user, contact that business first because it is normally the controller. You may also contact us and we will route or assist with the request as required.</p>
      <p>Send privacy requests to <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>.</p>
      <p>You can complain to the <a href="https://ico.org.uk/make-a-complaint/">Information Commissioner's Office</a>, but we would welcome the opportunity to address your concern first.</p>
    </section>

    <section>
      <h2>Changes to this notice</h2>
      <p>We will update this notice when our product, providers, legal duties or data uses materially change. We will show the effective date and, where appropriate, give account users advance notice.</p>
    </section>

    <section>
      <h2>Provider information</h2>
      <ul>
        <li><a href="https://supabase.com/downloads/docs/Supabase%2BDPA%2B260601.pdf">Supabase DPA</a></li>
        <li><a href="https://resend.com/legal/dpa">Resend privacy and DPA</a></li>
        <li><a href="https://stripe.com/gb/legal/privacy-center">Stripe Privacy Center</a></li>
        <li><a href="https://www.cloudflare.com/en-gb/cloudflare-customer-dpa/">Cloudflare privacy and DPA</a></li>
        <li><a href="https://openai.com/en-GB/policies/data-processing-addendum/">OpenAI privacy and DPA</a></li>
        <li><a href="https://workspace.google.com/terms/dpa_terms.html">Google Workspace data-processing terms</a></li>
        <li><a href="https://business.safety.google/adsprocessorterms/">Google Ads Data Processing Terms, including Google Analytics processor terms</a></li>
      </ul>
    </section>
  </article>`;

export const cookieNotice = `
  <section class="page-hero legal-hero">
    <p class="eyebrow">Legal</p>
    <h1>Tallyo Cookie Notice</h1>
    <p>Effective ${effectiveDate}. This notice explains the necessary and optional storage used by Tallyo.</p>
  </section>
  <article class="legal-document">
    <section>
      <h2>Your choice</h2>
      <p>Tallyo keeps necessary storage separate from optional Analytics. Google Analytics is off unless you choose <strong>Accept analytics</strong>. Rejecting Analytics does not prevent you from using the website or app.</p>
      <p>You can change your choice at any time using the persistent <strong>Cookie settings</strong> control. Withdrawing consent stops future Analytics events from Tallyo, updates Google's consent state to denied and removes the Analytics cookies that Tallyo can identify on this domain.</p>
    </section>

    <section>
      <h2>Necessary storage</h2>
      <p>Necessary storage supports security, sign-in, service delivery and your privacy choices. It does not depend on Analytics consent.</p>
      <div class="legal-table-wrap" role="region" aria-label="Necessary storage" tabindex="0">
        <table>
          <thead><tr><th scope="col">Name or purpose</th><th scope="col">What it does</th><th scope="col">Duration</th></tr></thead>
          <tbody>
            <tr><td><code>tallyo_analytics_consent</code></td><td>Stores only <code>granted</code> or <code>denied</code> so Tallyo can respect your Analytics choice. It does not store your identity.</td><td>Up to six months</td></tr>
            <tr><td>Account and security storage</td><td>Supports requested sign-in, session security, fraud/abuse protection and service delivery when you use the Tallyo app. Providers may set necessary storage for these purposes.</td><td>For the session or the provider's necessary security cycle</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Optional Google Analytics</h2>
      <p>After you accept, Tallyo loads Google Analytics 4 using measurement ID <code>G-PZFZKCWZ7M</code>. Tallyo uses basic consent mode: before acceptance, the Google tag is not loaded, Analytics cookies are not set and Analytics requests are not sent.</p>
      <p>Google Analytics may set <code>_ga</code> and a measurement-specific <code>_ga_*</code> cookie. Tallyo limits their configured lifetime to six months. We send a query-free Tallyo page address, the fixed page title “Tallyo”, and only these reviewed events:</p>
      <ul>
        <li><code>view_pricing</code>;</li>
        <li><code>start_registration</code>;</li>
        <li><code>complete_registration</code>;</li>
        <li><code>start_checkout</code>;</li>
        <li><code>subscription_activated</code>;</li>
        <li><code>use_invoice_maker</code>;</li>
        <li><code>download_invoice</code>; and</li>
        <li><code>contact_support</code>.</li>
      </ul>
      <p>These events have no custom properties. Tallyo does not send names, email addresses, company details, customer data, invoice or quote contents, payment information, Stripe identifiers, free text or internal user IDs. Enhanced Measurement is disabled, and no event is marked as an advertising conversion.</p>
      <p>Google Signals, advertising personalisation, enhanced conversions and user-provided data collection are disabled. Tallyo does not use the Analytics choice for advertising.</p>
    </section>

    <section>
      <h2>Contact and more information</h2>
      <p>See the <a href="/privacy/">Tallyo Privacy Notice</a> for controller details, lawful basis, recipients, international transfers, retention and your rights. Send privacy questions to <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>.</p>
    </section>
  </article>`;

export const dataProcessingTerms = `
  <section class="page-hero legal-hero">
    <p class="eyebrow">Legal</p>
    <h1>Tallyo Business-User Data Processing Terms</h1>
    <p>Effective ${effectiveDate}. These terms form part of the Tallyo account agreement for business users.</p>
  </section>
  <article class="legal-document">
    <section>
      <p>These terms supplement the Tallyo account agreement between Edson Oliveira, trading as Tallyo (<strong>Tallyo</strong>), and the business user identified in the applicable account or order (<strong>Customer</strong>).</p>
      <address>
        <strong>Business and service address</strong><br>
        87 Coles Green Road, NW2 7JH, London, UK<br>
        <strong>Privacy requests</strong> <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>
      </address>
      <p>They apply only where the Customer is controller and Tallyo processes personal data on the Customer's behalf (<strong>Covered Data</strong>). Tallyo remains controller for its own account administration, subscriptions, security, support, legal compliance and other purposes described in the <a href="/privacy/">Tallyo Privacy Notice</a>.</p>
    </section>

    <section>
      <h2>1. Processing schedule</h2>
      <div class="legal-table-wrap" role="region" aria-label="Data processing schedule" tabindex="0">
        <table>
          <tbody>
            <tr><th scope="row">Subject matter</th><td>Hosting and operating the Customer's business profile, contacts, saved items, invoices, quotes, credit notes, recurring schedules, transactional document/reminder email, customer-payment status and account export.</td></tr>
            <tr><th scope="row">Duration</th><td>While the Customer uses the relevant Tallyo service and during the manual return/deletion process, subject to provider cycles and any lawful retention.</td></tr>
            <tr><th scope="row">Nature</th><td>Collection from the Customer; storage, organisation, retrieval, display, transmission, email delivery, payment-status reconciliation, export, correction, restriction, deletion and anonymisation.</td></tr>
            <tr><th scope="row">Purpose</th><td>Provide the Tallyo functions selected and instructed by the Customer.</td></tr>
            <tr><th scope="row">Data subjects</th><td>Customer personnel and representatives; the Customer's customers, invoice recipients, suppliers and other business contacts whose information the Customer lawfully enters.</td></tr>
            <tr><th scope="row">Data types</th><td>Identity, business and contact details; document descriptions, dates, references and amounts; email/PDF content and delivery events; payment/refund/dispute summaries and provider identifiers; Customer-selected free text.</td></tr>
            <tr><th scope="row">Excluded uses</th><td>Tallyo is not intended for special-category, criminal-offence, medical, safeguarding, legal-case or similarly regulated records, or services aimed at children.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>2. Documented instructions</h2>
      <p>Tallyo will process Covered Data only:</p>
      <ul>
        <li>to provide the services selected by the Customer under the Tallyo account agreement, these terms and the Customer's in-product actions;</li>
        <li>on another documented instruction accepted by Tallyo; or</li>
        <li>where UK law requires processing, in which case Tallyo will inform the Customer before processing unless the law prohibits that notice.</li>
      </ul>
      <p>Tallyo will inform the Customer if, in Tallyo's reasonable view, an instruction infringes applicable data-protection law. Tallyo may suspend the affected instruction while the issue is resolved.</p>
    </section>

    <section>
      <h2>3. Customer responsibilities</h2>
      <p>The Customer:</p>
      <ul>
        <li>decides the purposes and lawful basis for Covered Data;</li>
        <li>gives affected people required privacy information;</li>
        <li>enters only information needed for legitimate business invoicing;</li>
        <li>keeps information accurate and responds to correction requests;</li>
        <li>avoids prohibited sensitive or regulated workflows;</li>
        <li>controls account access and protects credentials;</li>
        <li>gives lawful document, reminder, payment, retention and disclosure instructions;</li>
        <li>maintains its own statutory and accounting records; and</li>
        <li>tells Tallyo promptly about an unlawful, mistaken or disputed instruction.</li>
      </ul>
    </section>

    <section>
      <h2>4. Confidentiality</h2>
      <p>Tallyo limits Covered Data access to authorised people who need it to operate or support the service and who are bound by appropriate confidentiality duties. Access must be removed when no longer required.</p>
    </section>

    <section>
      <h2>5. Security</h2>
      <p>Taking account of the processing, available technology, cost and risk, Tallyo maintains proportionate technical and organisational measures including:</p>
      <ul>
        <li>Supabase account authentication and email confirmation;</li>
        <li>optional authenticator-app MFA, one-time recovery codes and session controls;</li>
        <li>row-level tenant isolation and server-side authorisation;</li>
        <li>protected provider secrets and no service-role credential in browser code;</li>
        <li>signed Stripe and Resend webhook verification;</li>
        <li>Cloudflare delivery, Access and Turnstile protections where configured;</li>
        <li>provider encryption in transit and at rest;</li>
        <li>managed backups and tested restore procedures;</li>
        <li>minimised security, delivery and payment-integrity evidence; and</li>
        <li>incident, rights-request and manual deletion procedures.</li>
      </ul>
      <p>No measure is described as eliminating every risk. Tallyo reviews the measures after material product, provider or threat changes.</p>
    </section>

    <section>
      <h2>6. Subprocessors</h2>
      <p>The Customer gives general written authorisation for Tallyo to use the subprocessors needed for the selected service.</p>
      <div class="legal-table-wrap" role="region" aria-label="Tallyo subprocessors" tabindex="0">
        <table>
          <thead><tr><th scope="col">Subprocessor</th><th scope="col">Relevant processing</th></tr></thead>
          <tbody>
            <tr><th scope="row">Supabase</th><td>Authentication, database, tenant-isolated storage, Edge Functions, scheduled service operations, logs and managed backups.</td></tr>
            <tr><th scope="row">Resend and its email-delivery chain</th><td>Transactional document, reminder and security email, attachments and delivery events.</td></tr>
            <tr><th scope="row">Cloudflare</th><td>App/website delivery, Access, Turnstile, request security and related infrastructure metadata.</td></tr>
            <tr><th scope="row">Stripe</th><td>Customer-payment processing and reconciliation only to the extent Stripe processes on the Customer's instructions; Stripe also acts independently for regulated, fraud, identity, legal and financial purposes.</td></tr>
            <tr><th scope="row">Google Workspace</th><td>Restricted support/privacy case handling where Covered Data is included in a case.</td></tr>
          </tbody>
        </table>
      </div>
      <p>OpenAI is not authorised to receive Covered Data under these terms. The public Helper is not designed to access account or customer records.</p>
      <p>GitHub is used for source administration and rollback hosting; Tallyo does not intentionally place Covered Data in the repository.</p>
      <p>Tallyo will:</p>
      <ul>
        <li>maintain a current subprocessor list;</li>
        <li>impose data-protection obligations appropriate to the delegated processing;</li>
        <li>remain responsible for subprocessor performance to the extent required by law;</li>
        <li>give reasonable advance notice of a new or replacement subprocessor where the change affects Covered Data; and</li>
        <li>consider a reasoned data-protection objection and, where no reasonable alternative is available, allow the affected service to end under the main account agreement.</li>
      </ul>
    </section>

    <section>
      <h2>7. International transfers</h2>
      <p>Where Tallyo or a subprocessor makes a restricted transfer of Covered Data from the UK, the transfer must use:</p>
      <ul>
        <li>applicable UK adequacy regulations; or</li>
        <li>an appropriate safeguard such as the UK International Data Transfer Agreement or the UK Addendum to the European Commission Standard Contractual Clauses.</li>
      </ul>
      <p>Provider subprocessor locations and safeguards are reviewed and may change. Tallyo will provide reasonable information about an applicable safeguard on request, subject to confidentiality and security restrictions.</p>
    </section>

    <section>
      <h2>8. Data-subject rights</h2>
      <p>Taking account of the nature of processing, Tallyo will provide reasonable assistance to help the Customer respond to requests for access, correction, deletion, restriction, objection or portability.</p>
      <p>Tallyo will:</p>
      <ul>
        <li>route a request to the Customer where the Customer is the relevant controller;</li>
        <li>preserve only the information needed to assist;</li>
        <li>use the available tenant-scoped search, export, correction and deletion paths;</li>
        <li>record provider and backup limitations; and</li>
        <li>deliver information through an approved secure route.</li>
      </ul>
      <p>The Customer remains responsible for verifying the requester, deciding the legal response and communicating it, unless Tallyo is separately controller for the relevant processing.</p>
    </section>

    <section>
      <h2>9. Security incidents and personal-data breaches</h2>
      <p>Tallyo will notify the Customer without undue delay after becoming aware of a personal-data breach affecting Covered Data.</p>
      <p>As information becomes available, Tallyo will provide reasonable details about:</p>
      <ul>
        <li>the nature of the breach;</li>
        <li>affected data and people;</li>
        <li>likely consequences;</li>
        <li>containment and remediation; and</li>
        <li>a contact for coordination.</li>
      </ul>
      <p>Tallyo will preserve appropriate evidence and assist the Customer with its assessment and required notifications. Tallyo will not notify the Customer's data subjects or regulator on the Customer's behalf unless instructed or legally required.</p>
    </section>

    <section>
      <h2>10. DPIAs and regulator assistance</h2>
      <p>Taking account of the processing and information available, Tallyo will provide reasonable assistance with the Customer's DPIA, prior-consultation or regulator obligations relating to Tallyo processing. This does not transfer the Customer's controller responsibilities to Tallyo.</p>
    </section>

    <section>
      <h2>11. Return, export and deletion</h2>
      <p>The Customer can use Tallyo's available account export while the account is active.</p>
      <p>Account-closure and deletion requests must be submitted to <a href="mailto:privacy@tallyo.co.uk">privacy@tallyo.co.uk</a>. Tallyo verifies and processes each request manually. Tallyo will delete, return or anonymise Covered Data when it is no longer necessary for the agreed service, unless applicable law requires retention.</p>
      <p>Tallyo may retain limited information where necessary for tax, accounting, fraud prevention, payment disputes, regulatory duties, security incidents or legal claims. Tallyo records the reason and review date.</p>
      <p>Provider copies and backups expire under their documented cycles and legal obligations. Tallyo does not promise an exact closed-account deletion deadline or immediate deletion from every provider backup.</p>
    </section>

    <section>
      <h2>12. Information and audit</h2>
      <p>Tallyo will make available information reasonably necessary to demonstrate the processor obligations in these terms.</p>
      <p>Where that information is not sufficient, the Customer may request a proportionate audit. The parties will first use current documentation, test evidence, provider reports and remote review. Any further inspection must:</p>
      <ul>
        <li>be relevant to Covered Data and applicable law;</li>
        <li>use reasonable notice unless a regulator or urgent incident requires otherwise;</li>
        <li>protect other customers, security, confidentiality and service availability;</li>
        <li>avoid access to secrets or unrelated data; and</li>
        <li>respect non-excludable regulator powers.</li>
      </ul>
      <p>Each party bears its own routine review costs. Exceptional external audit costs may be agreed in advance unless the audit identifies a material breach by Tallyo.</p>
    </section>

    <section>
      <h2>13. Precedence, duration and changes</h2>
      <p>These terms take effect when the Customer creates or uses a Tallyo account after their publication, or otherwise agrees to them. They continue while Tallyo processes Covered Data for the Customer.</p>
      <p>If these terms conflict with the main Tallyo account agreement on processor obligations, these terms take precedence for that conflict. Tallyo may update them where the service, providers or law changes and will give appropriate notice of a material change.</p>
    </section>
  </article>`;
