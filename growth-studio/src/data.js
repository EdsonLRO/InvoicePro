export const channelDefinitions = {
  linkedin: { label: "LinkedIn", status: "Planning active", description: "Draft, review, schedule-plan, and measure manually imported results.", capabilities: { discoverPublicBusinesses: true, generateDrafts: true, renderAssets: true, publish: false, readAnalytics: false, searchPeople: false, sendMessages: false, sendConnections: false, reactToPosts: false } },
  facebook: { label: "Facebook", status: "Later", description: "Reserved for a future approved integration.", capabilities: { discoverPublicBusinesses: false, generateDrafts: false, renderAssets: false, publish: false, readAnalytics: false, searchPeople: false, sendMessages: false, sendConnections: false, reactToPosts: false } },
  x: { label: "X", status: "Later", description: "Reserved for a future approved integration.", capabilities: { discoverPublicBusinesses: false, generateDrafts: false, renderAssets: false, publish: false, readAnalytics: false, searchPeople: false, sendMessages: false, sendConnections: false, reactToPosts: false } }
};

export const audienceSegments = [
  { id: "trades", name: "Owner-operated trades", market: "Plumbers, electricians, painters and builders", pain: "Paperwork waits until the working day is over.", fit: "Mobile-friendly quotes, invoices, customer records and payment status.", signals: ["Local UK coverage", "Quoted jobs", "Owner-operated service"], angles: ["Finish paperwork before leaving site", "Keep deposits and balances clear", "Know which jobs still need payment"] },
  { id: "property-services", name: "Property and home services", market: "Handymen, cleaners, gardeners and decorators", pain: "Repeat visits and separately quoted work are difficult to track.", fit: "Reusable services, customer history, recurring invoices and reminders.", signals: ["Regular maintenance", "Call-outs or packages", "Residential and commercial work"], angles: ["Reuse regular services", "Make repeat visits easier to bill", "Follow up without losing job context"] },
  { id: "mobile-services", name: "Mobile self-employed services", market: "Installers, repairers and technicians", pain: "Customer details and job admin move between the van, site and home.", fit: "Installable mobile workspace for quotes, invoices and customer records.", signals: ["On-site work", "Mobile coverage area", "Job-based pricing"], angles: ["Quote while the job is fresh", "Keep the customer record ready", "Carry the workflow on your phone"] },
  { id: "professional-services", name: "Independent professionals", market: "Consultants, tutors, surveyors and bookkeepers", pain: "Project, session and retainer billing compete with paid work.", fit: "Professional documents, recurring schedules and income records in one workspace.", signals: ["Independent services", "Quoted projects", "Repeat or retained work"], angles: ["Protect billable time", "Turn accepted work into an invoice", "Prepare a clearer income handover"] },
  { id: "creative-services", name: "Creative service businesses", market: "Photographers, designers, videographers and studios", pain: "Quoting, deposits and final balances live in different places.", fit: "A clear quote-to-invoice workflow with branded documents and payment status.", signals: ["Project pricing", "Booked work", "Deposits or staged payments"], angles: ["Move smoothly from quote to invoice", "Keep deposits and balances visible", "Make documents match the business"] },
  { id: "consultants", name: "Independent consultants", market: "UK service businesses", pain: "Admin interrupts billable work and follow-up.", fit: "Clear quotes, professional invoices, recurring billing and income visibility.", signals: ["Advisory services", "Project and retainer work", "Small UK practice"], angles: ["Protect billable time", "Turn accepted work into an invoice", "See recorded income without a spreadsheet"] },
  { id: "creatives", name: "Freelance creatives", market: "Design, video and writing", pain: "Quoting, revisions and payment follow-up live in different tools.", fit: "A focused quote-to-payment workflow designed for small service businesses.", signals: ["Creative services", "Project pricing", "Maintenance or retainer packages"], angles: ["Keep client work moving", "Professional documents in minutes", "One view from quote to paid"] },
  { id: "agencies", name: "Small agencies", market: "Small service teams", pain: "Recurring work and overdue follow-up become operational noise.", fit: "Recurring invoices, shared visibility and repeatable client workflows.", signals: ["Small agency", "Monthly retainers", "Recurring client delivery"], angles: ["Repeatable billing for retained work", "A calmer month-end", "Visibility without finance-tool complexity"] },
  { id: "contractors", name: "Independent contractors", market: "Professional services", pain: "Income planning is disconnected from invoice status.", fit: "Invoices, recurring work and income records in one workspace.", signals: ["Independent services", "Quoted projects", "UK business audience"], angles: ["Plan from recorded income", "Spend less time reconciling", "Keep evidence organised"] }
];

export const brandCategories = [
  { id: "all", label: "All visuals" }, { id: "jobs", label: "Jobs & quotes" }, { id: "payments", label: "Payments" }, { id: "customers", label: "Customers" },
  { id: "automation", label: "Repeat admin" }, { id: "insights", label: "Income & records" }, { id: "brand", label: "Brand & access" }, { id: "founder", label: "Founder story" }
];

export const brandAssets = [
  { id: "clarity", label: "Free Invoice Maker", file: "01-free-invoice-maker.png", category: "jobs", tone: "Confident", topics: ["free invoice", "first invoice", "no account"], alt: "Tallyo graphic introducing its free invoice maker." },
  { id: "dashboard", label: "Dashboard clarity", file: "02-dashboard-clarity.png", category: "insights", tone: "Direct", topics: ["dashboard", "overview", "attention", "outstanding"], alt: "Tallyo graphic showing a clear business dashboard." },
  { id: "invoice-create", label: "Create invoices", file: "03-create-invoices.png", category: "jobs", tone: "Practical", topics: ["invoice", "create invoice", "professional document"], alt: "Tallyo graphic about creating professional invoices." },
  { id: "saved-items", label: "Saved services", file: "04-saved-items.png", category: "automation", tone: "Efficient", topics: ["service", "materials", "labour", "saved item", "reuse"], alt: "Tallyo graphic about saving commonly used products and services for reuse." },
  { id: "recurring", label: "Recurring invoices", file: "05-recurring-invoices.png", category: "automation", tone: "Empathetic", topics: ["recurring", "regular", "maintenance", "monthly", "repeat"], alt: "Tallyo graphic about planning recurring invoices." },
  { id: "customers", label: "Customer records", file: "07-manage-customers.png", category: "customers", tone: "Organised", topics: ["customer", "client", "contact", "record"], alt: "Tallyo graphic about keeping customer details ready for future work." },
  { id: "reminders", label: "Automatic reminders", file: "16-automatic-reminders.png", category: "automation", tone: "Helpful", topics: ["reminder", "follow up", "chasing", "late"], alt: "Tallyo graphic about choosing when overdue reminders start and stop." },
  { id: "branding", label: "Business branding", file: "17-branding.png", category: "brand", tone: "Professional", topics: ["brand", "logo", "colour", "professional"], alt: "Tallyo graphic showing business branding controls for documents." },
  { id: "install", label: "Install Tallyo", file: "24-install-tallyo.png", category: "brand", tone: "Accessible", topics: ["mobile", "phone", "install", "on site", "van"], alt: "Tallyo graphic explaining that the app can be installed on a phone or computer." },
  { id: "helper", label: "Tallyo Helper", file: "25-tallyo-helper.png", category: "brand", tone: "Supportive", topics: ["helper", "help", "question", "support"], alt: "Tallyo graphic introducing the in-app Helper." },
  { id: "mobile-invoice", label: "Invoice without the admin session", file: "27-invoice-without-the-admin-session.png", category: "jobs", tone: "Empathetic", topics: ["evening", "admin", "phone", "mobile", "site", "invoice"], alt: "Tallyo graphic about finishing an invoice without a separate evening admin session." },
  { id: "repeat-customer", label: "Repeat customer", file: "28-repeat-customer-less-retyping.png", category: "customers", tone: "Efficient", topics: ["repeat customer", "returning", "retyping", "customer"], alt: "Tallyo graphic about reusing details for a repeat customer." },
  { id: "schedule", label: "Let the schedule remember", file: "29-let-the-schedule-remember.png", category: "automation", tone: "Calm", topics: ["schedule", "recurring", "remember", "maintenance", "regular"], alt: "Tallyo graphic about using a recurring schedule for regular work." },
  { id: "overdue", label: "Overdue with context", file: "30-overdue-with-context.png", category: "payments", tone: "Helpful", topics: ["overdue", "unpaid", "late", "outstanding", "follow up"], alt: "Tallyo graphic about viewing overdue invoices with their job context." },
  { id: "deposit", label: "Deposit and balance", file: "31-deposit-and-balance.png", category: "payments", tone: "Clear", topics: ["deposit", "balance", "part payment", "upfront"], alt: "Tallyo graphic about keeping a predefined deposit and remaining balance clear." },
  { id: "activity", label: "After an invoice is sent", file: "32-after-the-invoice-is-sent.png", category: "payments", tone: "Analytical", topics: ["activity", "email", "sent", "payment", "history"], alt: "Tallyo graphic about reviewing document and payment activity after an invoice is sent." },
  { id: "quote-to-invoice", label: "Accepted quote to invoice", file: "33-quote-accepted-to-invoice.png", category: "jobs", tone: "Practical", topics: ["quote", "estimate", "accepted", "acceptance", "job", "invoice"], alt: "Fictional Tallyo preview showing an accepted quote ready to become an invoice." },
  { id: "income-insights", label: "Income Insights", file: "34-income-insights.png", category: "insights", tone: "Clear", topics: ["income", "finance", "paid", "outstanding", "overdue", "cash"], alt: "Fictional Tallyo Income Insights preview showing paid, outstanding and overdue invoice activity." },
  { id: "income-pack", label: "Income Pack", file: "35-income-pack.png", category: "insights", tone: "Organised", topics: ["income pack", "accountant", "export", "records", "csv", "pdf", "handover"], alt: "Fictional Tallyo Income Pack preview showing downloadable income summary and record files." },
  { id: "document-layouts", label: "Document layouts", file: "36-document-layouts.png", category: "brand", tone: "Professional", topics: ["layout", "template", "document", "branding", "invoice design"], alt: "Fictional Tallyo branding preview showing four professional document layouts." },
  { id: "branded-email", label: "Branded customer email", file: "37-branded-emails.png", category: "customers", tone: "Reassuring", topics: ["email", "send", "delivery", "customer experience", "branded"], alt: "Fictional customer email preview showing a clearly presented Tallyo invoice notification." },
  { id: "google-sign-in", label: "Google sign-in", file: "38-google-sign-in.png", category: "brand", tone: "Reassuring", topics: ["google", "sign in", "login", "access", "security"], alt: "Fictional Tallyo sign-in preview showing the available Continue with Google option." },
  { id: "growth-studio", label: "Growth Studio workflow", file: "39-growth-studio-workflow.png", category: "founder", tone: "Transparent", topics: ["growth studio", "building", "founder", "behind the scenes", "research", "content"], alt: "Fictional Tallyo Owner preview showing the draft-first Growth Studio workflow." }
];

export function recommendAsset(value, fallbackId = "dashboard") {
  const normalised = (Array.isArray(value) ? value.join(" ") : String(value || "")).toLowerCase();
  let best = brandAssets.find((asset) => asset.id === fallbackId) || brandAssets[0];
  let bestScore = 0;
  for (const asset of brandAssets) {
    const score = asset.topics.reduce((total, topic) => total + (normalised.includes(topic) ? Math.max(2, topic.split(" ").length + 1) : 0), 0);
    if (score > bestScore) { best = asset; bestScore = score; }
  }
  return best;
}

export function recommendSegment(value) {
  const text = String(value || "").toLowerCase();
  if (/plumb|electric|build|construct|paint|decorat|roof|carpent|joiner|brick|trade/.test(text)) return audienceSegments.find((item) => item.id === "trades");
  if (/clean|garden|landscap|handyman|property|maintenance/.test(text)) return audienceSegments.find((item) => item.id === "property-services");
  if (/install|repair|technician|mobile|vehicle|appliance/.test(text)) return audienceSegments.find((item) => item.id === "mobile-services");
  if (/photo|design|video|creative|studio/.test(text)) return audienceSegments.find((item) => item.id === "creative-services");
  return audienceSegments.find((item) => item.id === "professional-services");
}

export const contentTemplates = [
  { id: "trade-evening", label: "Finish the job, not another shift", objective: "Awareness", hook: "The job is finished. The paperwork should not take the rest of your evening.", body: "Tallyo keeps quotes, invoices, customer details and payment status in one focused workspace for small service businesses.", cta: "Which part of job admin follows you home most often?", assetId: "mobile-invoice" },
  { id: "quote-flow", label: "Quote to invoice", objective: "Consideration", hook: "A customer saying yes should move the job forward—not create another round of typing.", body: "With Tallyo, an accepted quote can keep its customer and job details as the work moves toward invoicing.", cta: "What slows down your quote-to-invoice handover?", assetId: "quote-to-invoice" },
  { id: "deposit-clarity", label: "Deposit and balance", objective: "Education", hook: "A deposit is easier to manage when the remaining balance stays visible.", body: "Tallyo can show a predefined deposit and the balance that remains on the invoice, keeping the payment request easier to understand.", cta: "Do you use deposits for larger jobs?", assetId: "deposit" },
  { id: "repeat-work", label: "Repeat work", objective: "Awareness", hook: "Regular work should not mean rebuilding the same invoice every month.", body: "Save the schedule for repeat work and decide whether each generated invoice is emailed or left for review.", cta: "Which regular job creates the most repeated admin?", assetId: "schedule" },
  { id: "income-view", label: "Recorded income view", objective: "Engagement", hook: "Knowing what was invoiced is different from seeing what is paid, outstanding or overdue.", body: "Tallyo Income Insights organises invoice and payment activity recorded in Tallyo by period and currency. It does not calculate expenses, profit or tax due.", cta: "Which figure do you check first when planning the next few weeks?", assetId: "income-insights" },
  { id: "founder-note", label: "Founder note", objective: "Trust", hook: "I am building Tallyo around a simple belief: essential business admin should feel calm.", body: "That means clearer job workflows, professional customer documents and honest boundaries around what the product does.", cta: "Where does admin get in the way of your best work?", assetId: "growth-studio" }
];

export const claimGuardrails = [
  "Describe available product workflows only; do not promise financial outcomes.",
  "Do not claim that Tallyo replaces an accountant, bank or regulated adviser.",
  "Income Insights covers invoices and payments recorded in Tallyo; it excludes expenses, profit and tax due.",
  "Use 'helps', 'designed to', or concrete feature language instead of guarantees.",
  "Every image needs meaningful alt text and every post needs human approval."
];

export const initialState = {
  selectedChannel: "linkedin", selectedPostId: "post-1", discoveryFilter: "all", brandCategory: "all", dismissedCandidateIds: [], savedCandidateIds: [], lastResearchAt: null,
  metrics: { profileViews: 248, followerGrowth: 18, engagementRate: 4.7, draftsReady: 3 },
  posts: [
    { id: "post-1", title: "Admin should not take the evening", status: "In review", scheduledFor: "Tue · 09:10", templateId: "trade-evening", segmentId: "trades", assetId: "mobile-invoice", caption: "The job is finished. The paperwork should not take the rest of your evening.\n\nTallyo keeps quotes, invoices, customer details and payment status in one focused workspace for small service businesses.\n\nWhich part of job admin follows you home most often?\n\n#UKTrades #SmallBusiness #Tallyo", alt: "Tallyo graphic about finishing an invoice without a separate evening admin session." },
    { id: "post-2", title: "From accepted quote to invoice", status: "Approved", scheduledFor: "Thu · 12:20", templateId: "quote-flow", segmentId: "trades", assetId: "quote-to-invoice", caption: "A customer saying yes should move the job forward—not create another round of typing.\n\nWith Tallyo, an accepted quote can keep its customer and job details as the work moves toward invoicing.\n\nWhat slows down your quote-to-invoice handover?\n\n#SoleTrader #Quoting #Tallyo", alt: "Fictional Tallyo preview showing an accepted quote ready to become an invoice." },
    { id: "post-3", title: "A clearer view of recorded income", status: "Draft", scheduledFor: "Unscheduled", templateId: "income-view", segmentId: "professional-services", assetId: "income-insights", caption: "Knowing what was invoiced is different from seeing what is paid, outstanding or overdue.\n\nTallyo Income Insights organises invoice and payment activity recorded in Tallyo by period and currency. It does not calculate expenses, profit or tax due.\n\nWhich figure do you check first when planning the next few weeks?\n\n#SelfEmployed #BusinessAdmin #Tallyo", alt: "Fictional Tallyo Income Insights preview showing paid, outstanding and overdue invoice activity." }
  ],
  automations: [
    { id: "research", name: "Public-business Discovery Agent", cadence: "Weekdays · 08:30 Europe/London", enabled: true, connected: true, mode: "Searches public business websites for trade and self-employed service businesses" },
    { id: "drafts", name: "Content draft pack", cadence: "Mon & Thu · 09:00", enabled: true, mode: "Creates drafts for approval" },
    { id: "review", name: "Approval reminder", cadence: "Weekdays · 15:30", enabled: false, mode: "Local reminder only" },
    { id: "report", name: "Weekly performance recap", cadence: "Fri · 16:00", enabled: false, mode: "Uses manually entered metrics" }
  ]
};
