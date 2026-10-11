export const channelDefinitions = {
  linkedin: {
    label: "LinkedIn",
    status: "Planning active",
    description: "Draft, review, schedule-plan, and measure manually imported results.",
    capabilities: { discoverPublicBusinesses: true, generateDrafts: true, renderAssets: true, publish: false, readAnalytics: false, searchPeople: false, sendMessages: false, sendConnections: false, reactToPosts: false }
  },
  facebook: {
    label: "Facebook",
    status: "Later",
    description: "Reserved for a future approved integration.",
    capabilities: { discoverPublicBusinesses: false, generateDrafts: false, renderAssets: false, publish: false, readAnalytics: false, searchPeople: false, sendMessages: false, sendConnections: false, reactToPosts: false }
  },
  x: {
    label: "X",
    status: "Later",
    description: "Reserved for a future approved integration.",
    capabilities: { discoverPublicBusinesses: false, generateDrafts: false, renderAssets: false, publish: false, readAnalytics: false, searchPeople: false, sendMessages: false, sendConnections: false, reactToPosts: false }
  }
};

export const audienceSegments = [
  { id: "consultants", name: "Independent consultants", market: "UK service businesses", pain: "Admin interrupts billable work and follow-up.", fit: "Clear quotes, professional invoices, recurring billing, and income visibility.", signals: ["Advisory services", "Project and retainer work", "Small UK practice"], angles: ["Protect billable time", "Turn accepted work into an invoice", "See income without a spreadsheet"] },
  { id: "creatives", name: "Freelance creatives", market: "Design, video, writing", pain: "Quoting, revisions, and payment follow-up live in different tools.", fit: "A focused quote-to-payment workflow designed for small service businesses.", signals: ["Creative services", "Project pricing", "Maintenance or retainer packages"], angles: ["Keep client work moving", "Professional documents in minutes", "One view from quote to paid"] },
  { id: "trades", name: "Owner-operated trades", market: "Local trade services", pain: "Paperwork waits until the working day is over.", fit: "Mobile-friendly quoting, invoicing, customer records, and payment status.", signals: ["Local UK coverage", "Quoted jobs", "Owner-operated service"], angles: ["Finish the paperwork before leaving site", "Know what is outstanding", "Make every document look consistent"] },
  { id: "agencies", name: "Small agencies", market: "2–15 person service teams", pain: "Recurring work and overdue follow-up become operational noise.", fit: "Recurring invoices, shared financial visibility, and repeatable client workflows.", signals: ["Small agency", "Monthly retainers", "Recurring client delivery"], angles: ["Repeatable billing for retained work", "A calmer month-end", "Visibility without finance-tool complexity"] },
  { id: "contractors", name: "Independent contractors", market: "Technology and professional services", pain: "Income planning is disconnected from invoices and expenses.", fit: "Invoices, expenses, recurring work, and income insights in one workspace.", signals: ["Independent services", "Quoted projects", "UK business audience"], angles: ["Plan from real business activity", "Spend less time reconciling", "Keep evidence organised"] }
];

export const brandAssets = [
  { id: "clarity", label: "Free Invoice Maker", file: "01-free-invoice-maker.png", tone: "Confident", alt: "Tallyo graphic introducing the free invoice maker." },
  { id: "system", label: "Dashboard clarity", file: "02-dashboard-clarity.png", tone: "Direct", alt: "Tallyo graphic showing a clear business dashboard." },
  { id: "flow", label: "Create invoices", file: "03-create-invoices.png", tone: "Practical", alt: "Tallyo graphic about creating professional invoices." },
  { id: "time", label: "Recurring invoices", file: "05-recurring-invoices.png", tone: "Empathetic", alt: "Tallyo graphic about setting up recurring invoices." },
  { id: "overdue", label: "Overdue with context", file: "30-overdue-with-context.png", tone: "Helpful", alt: "Tallyo graphic about viewing overdue invoices with context." },
  { id: "income", label: "After an invoice is sent", file: "32-after-the-invoice-is-sent.png", tone: "Analytical", alt: "Tallyo graphic about the workflow after an invoice is sent." }
];

export const contentTemplates = [
  { id: "problem-solution", label: "Problem → solution", objective: "Awareness", hook: "The work is finished. The paperwork should not take the rest of your evening.", body: "Tallyo brings quotes, invoices, expenses, recurring work, and income visibility into one focused workspace for small service businesses. Less switching. A clearer next action.", cta: "Follow Tallyo for practical ways to make business admin lighter.", assetId: "time" },
  { id: "workflow", label: "Workflow explainer", objective: "Consideration", hook: "A quote should be the start of a clean workflow—not another disconnected document.", body: "Create a professional quote, keep the customer record organised, and move accepted work toward invoicing without rebuilding the same details. Tallyo is designed around the flow of a small service business.", cta: "What part of your quote-to-payment process creates the most friction?", assetId: "flow" },
  { id: "founder-note", label: "Founder note", objective: "Trust", hook: "I am building Tallyo around a simple belief: essential business admin should feel calm.", body: "Small businesses do not need more noise. They need a reliable way to handle quotes, invoices, expenses, and recurring work while keeping a clear view of income. That focus guides every Tallyo decision.", cta: "I would value hearing where admin gets in the way of your best work.", assetId: "clarity" },
  { id: "insight", label: "Practical insight", objective: "Engagement", hook: "Revenue on paper is not the same as knowing what is happening in your business.", body: "Useful income visibility starts with the work you already record: invoices, payment status, and expenses. Tallyo helps bring that activity into one view so business owners can make decisions with more context.", cta: "Which number do you check first when planning the month ahead?", assetId: "income" }
];

export const claimGuardrails = [
  "Describe available product workflows only; do not promise financial outcomes.",
  "Do not claim that Tallyo replaces an accountant, bank, or regulated adviser.",
  "Use 'helps', 'designed to', or concrete feature language instead of guarantees.",
  "Every image needs meaningful alt text and every post needs human approval."
];

export const initialState = {
  selectedChannel: "linkedin",
  selectedPostId: "post-1",
  discoveryFilter: "all",
  dismissedCandidateIds: [],
  savedCandidateIds: [],
  lastResearchAt: null,
  metrics: { profileViews: 248, followerGrowth: 18, engagementRate: 4.7, draftsReady: 3 },
  posts: [
    { id: "post-1", title: "Admin should not take the evening", status: "In review", scheduledFor: "Tue · 09:10", templateId: "problem-solution", segmentId: "trades", assetId: "time", caption: "The work is finished. The paperwork should not take the rest of your evening.\n\nTallyo brings quotes, invoices, expenses, recurring work, and income visibility into one focused workspace for small service businesses. Less switching. A clearer next action.\n\nFollow Tallyo for practical ways to make business admin lighter.\n\n#SmallBusiness #BusinessAdmin #Tallyo", alt: "Tallyo graphic about setting up recurring invoices." },
    { id: "post-2", title: "From quote to paid", status: "Approved", scheduledFor: "Thu · 12:20", templateId: "workflow", segmentId: "consultants", assetId: "flow", caption: "A quote should be the start of a clean workflow—not another disconnected document.\n\nTallyo is designed around the flow of a small service business, from a professional quote toward invoicing and payment tracking.\n\nWhat part of your quote-to-payment process creates the most friction?\n\n#FreelanceBusiness #Invoicing #Tallyo", alt: "Tallyo graphic about creating professional invoices." },
    { id: "post-3", title: "A calmer view of income", status: "Draft", scheduledFor: "Unscheduled", templateId: "insight", segmentId: "contractors", assetId: "income", caption: "Revenue on paper is not the same as knowing what is happening in your business.\n\nTallyo helps bring invoices, payment status, and expenses into one view so small business owners can plan with more context.\n\nWhich number do you check first when planning the month ahead?\n\n#BusinessFinance #Contractors #Tallyo", alt: "Tallyo graphic about the workflow after an invoice is sent." }
  ],
  automations: [
    { id: "research", name: "Public-business Discovery Agent", cadence: "Weekdays · 08:30 Europe/London", enabled: true, connected: true, mode: "Searches public sources and updates Discover" },
    { id: "drafts", name: "Content draft pack", cadence: "Mon & Thu · 09:00", enabled: true, mode: "Creates drafts for approval" },
    { id: "review", name: "Approval reminder", cadence: "Weekdays · 15:30", enabled: false, mode: "Local reminder only" },
    { id: "report", name: "Weekly performance recap", cadence: "Fri · 16:00", enabled: false, mode: "Uses manually entered metrics" }
  ]
};
