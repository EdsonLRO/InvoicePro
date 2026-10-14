(function () {
    'use strict';

    const storageKey = 'tallyo-growth-studio-v3';
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const audienceSegments = [
        { id: 'trades', name: 'Owner-operated trades', market: 'Plumbers, electricians, painters and builders', fit: 'Mobile-friendly quotes, invoices, customer records and payment status.', angles: ['Finish paperwork before leaving site', 'Keep deposits and balances clear', 'Know which jobs still need payment'] },
        { id: 'property-services', name: 'Property and home services', market: 'Handymen, cleaners, gardeners and decorators', fit: 'Reusable services, customer history, recurring invoices and reminders.', angles: ['Reuse regular services', 'Make repeat visits easier to bill', 'Follow up without losing job context'] },
        { id: 'mobile-services', name: 'Mobile self-employed services', market: 'Installers, repairers and technicians', fit: 'Installable mobile workspace for quotes, invoices and customer records.', angles: ['Quote while the job is fresh', 'Keep the customer record ready', 'Carry the workflow on your phone'] },
        { id: 'professional-services', name: 'Independent professionals', market: 'Consultants, tutors, surveyors and bookkeepers', fit: 'Professional documents, recurring schedules and income records in one workspace.', angles: ['Protect billable time', 'Turn accepted work into an invoice', 'Prepare a clearer income handover'] },
        { id: 'creative-services', name: 'Creative service businesses', market: 'Photographers, designers, videographers and studios', fit: 'A clear quote-to-invoice workflow with branded documents and payment status.', angles: ['Move smoothly from quote to invoice', 'Keep deposits and balances visible', 'Make documents match the business'] },
        { id: 'consultants', name: 'Independent consultants', market: 'UK service businesses', fit: 'Clear quotes, professional invoices, recurring billing and income visibility.', angles: ['Protect billable time', 'Turn accepted work into an invoice', 'See recorded income without a spreadsheet'] },
        { id: 'creatives', name: 'Freelance creatives', market: 'Design, video and writing', fit: 'A focused quote-to-payment workflow for project and retainer work.', angles: ['Keep client work moving', 'Professional documents in minutes', 'One view from quote to paid'] },
        { id: 'agencies', name: 'Small agencies', market: 'Small service teams', fit: 'Recurring invoices, shared visibility and repeatable client workflows.', angles: ['Repeatable billing for retained work', 'A calmer month-end', 'Visibility without finance-tool complexity'] },
        { id: 'contractors', name: 'Independent contractors', market: 'Professional services', fit: 'Invoices, recurring work and income records in one workspace.', angles: ['Plan from recorded income', 'Spend less time reconciling', 'Keep evidence organised'] }
    ];
    const brandCategories = [
        { id: 'all', label: 'All visuals' }, { id: 'jobs', label: 'Jobs & quotes' }, { id: 'payments', label: 'Payments' }, { id: 'customers', label: 'Customers' },
        { id: 'automation', label: 'Repeat admin' }, { id: 'insights', label: 'Income & records' }, { id: 'brand', label: 'Brand & access' }, { id: 'founder', label: 'Founder story' }
    ];
    const brandAssets = [
        { id: 'clarity', label: 'Free Invoice Maker', file: '01-free-invoice-maker.png', category: 'jobs', tone: 'Confident', topics: ['free invoice', 'first invoice', 'no account'], alt: 'Tallyo graphic introducing its free invoice maker.' },
        { id: 'dashboard', label: 'Dashboard clarity', file: '02-dashboard-clarity.png', category: 'insights', tone: 'Direct', topics: ['dashboard', 'overview', 'attention', 'outstanding'], alt: 'Tallyo graphic showing a clear business dashboard.' },
        { id: 'invoice-create', label: 'Create invoices', file: '03-create-invoices.png', category: 'jobs', tone: 'Practical', topics: ['invoice', 'create invoice', 'professional document'], alt: 'Tallyo graphic about creating professional invoices.' },
        { id: 'saved-items', label: 'Saved services', file: '04-saved-items.png', category: 'automation', tone: 'Efficient', topics: ['service', 'materials', 'labour', 'saved item', 'reuse'], alt: 'Tallyo graphic about saving commonly used products and services for reuse.' },
        { id: 'recurring', label: 'Recurring invoices', file: '05-recurring-invoices.png', category: 'automation', tone: 'Empathetic', topics: ['recurring', 'regular', 'maintenance', 'monthly', 'repeat'], alt: 'Tallyo graphic about planning recurring invoices.' },
        { id: 'customers', label: 'Customer records', file: '07-manage-customers.png', category: 'customers', tone: 'Organised', topics: ['customer', 'client', 'contact', 'record'], alt: 'Tallyo graphic about keeping customer details ready for future work.' },
        { id: 'reminders', label: 'Automatic reminders', file: '16-automatic-reminders.png', category: 'automation', tone: 'Helpful', topics: ['reminder', 'follow up', 'chasing', 'late'], alt: 'Tallyo graphic about choosing when overdue reminders start and stop.' },
        { id: 'branding', label: 'Business branding', file: '17-branding.png', category: 'brand', tone: 'Professional', topics: ['brand', 'logo', 'colour', 'professional'], alt: 'Tallyo graphic showing business branding controls for documents.' },
        { id: 'install', label: 'Install Tallyo', file: '24-install-tallyo.png', category: 'brand', tone: 'Accessible', topics: ['mobile', 'phone', 'install', 'on site', 'van'], alt: 'Tallyo graphic explaining that the app can be installed on a phone or computer.' },
        { id: 'helper', label: 'Tallyo Helper', file: '25-tallyo-helper.png', category: 'brand', tone: 'Supportive', topics: ['helper', 'help', 'question', 'support'], alt: 'Tallyo graphic introducing the in-app Helper.' },
        { id: 'mobile-invoice', label: 'Invoice without the admin session', file: '27-invoice-without-the-admin-session.png', category: 'jobs', tone: 'Empathetic', topics: ['evening', 'admin', 'phone', 'mobile', 'site', 'invoice'], alt: 'Tallyo graphic about finishing an invoice without a separate evening admin session.' },
        { id: 'repeat-customer', label: 'Repeat customer', file: '28-repeat-customer-less-retyping.png', category: 'customers', tone: 'Efficient', topics: ['repeat customer', 'returning', 'retyping', 'customer'], alt: 'Tallyo graphic about reusing details for a repeat customer.' },
        { id: 'schedule', label: 'Let the schedule remember', file: '29-let-the-schedule-remember.png', category: 'automation', tone: 'Calm', topics: ['schedule', 'recurring', 'remember', 'maintenance', 'regular'], alt: 'Tallyo graphic about using a recurring schedule for regular work.' },
        { id: 'overdue', label: 'Overdue with context', file: '30-overdue-with-context.png', category: 'payments', tone: 'Helpful', topics: ['overdue', 'unpaid', 'late', 'outstanding', 'follow up'], alt: 'Tallyo graphic about viewing overdue invoices with their job context.' },
        { id: 'deposit', label: 'Deposit and balance', file: '31-deposit-and-balance.png', category: 'payments', tone: 'Clear', topics: ['deposit', 'balance', 'part payment', 'upfront'], alt: 'Tallyo graphic about keeping a predefined deposit and remaining balance clear.' },
        { id: 'activity', label: 'After an invoice is sent', file: '32-after-the-invoice-is-sent.png', category: 'payments', tone: 'Analytical', topics: ['activity', 'email', 'sent', 'payment', 'history'], alt: 'Tallyo graphic about reviewing document and payment activity after an invoice is sent.' },
        { id: 'quote-to-invoice', label: 'Accepted quote to invoice', file: '33-quote-accepted-to-invoice.png', category: 'jobs', tone: 'Practical', topics: ['quote', 'estimate', 'accepted', 'acceptance', 'job', 'invoice'], alt: 'Current Tallyo Overview showing an accepted quote and its linked draft invoice, using fictional sample data.' },
        { id: 'income-insights', label: 'Income Insights', file: '34-income-insights.png', category: 'insights', tone: 'Clear', topics: ['income', 'finance', 'paid', 'outstanding', 'overdue', 'cash'], alt: 'Current Tallyo Finances screen showing invoiced, received, outstanding and overdue values with fictional sample data.' },
        { id: 'income-pack', label: 'Income Pack', file: '35-income-pack.png', category: 'insights', tone: 'Organised', topics: ['income pack', 'accountant', 'export', 'records', 'csv', 'pdf', 'handover'], alt: 'Current Tallyo Prepare records screen showing downloadable income files with fictional sample data.' },
        { id: 'document-layouts', label: 'Document layouts', file: '36-document-layouts.png', category: 'brand', tone: 'Professional', topics: ['layout', 'template', 'document', 'branding', 'invoice design'], alt: 'Current Tallyo Branding screen showing the Tallyo, Basic, Modern and Professional document styles.' },
        { id: 'send-review', label: 'Review before sending', file: '37-review-before-sending.png', category: 'customers', tone: 'Reassuring', topics: ['email', 'send', 'review', 'quote', 'acceptance'], alt: 'Current Tallyo Email Quote review showing the recipient, secure customer response and automatic invoice options.' },
        { id: 'google-sign-in', label: 'Google sign-in', file: '38-google-sign-in.png', category: 'brand', tone: 'Reassuring', topics: ['google', 'sign in', 'login', 'access', 'security'], alt: 'Current Tallyo sign-in screen showing the Continue with Google option and the official Tallyo wordmark.' },
        { id: 'growth-studio', label: 'Growth Studio workflow', file: '39-growth-studio-workflow.png', category: 'founder', tone: 'Transparent', topics: ['growth studio', 'building', 'founder', 'behind the scenes', 'research', 'content'], alt: 'Current Tallyo Owner Growth Studio showing a draft-first content workflow with fictional sample data.' }
    ];
    const templates = [
        { id: 'trade-evening', label: 'Finish the job, not another shift', hook: 'The job is finished. The paperwork should not take the rest of your evening.', body: 'Tallyo keeps quotes, invoices, customer details and payment status in one focused workspace for small service businesses.', cta: 'Which part of job admin follows you home most often?', assetId: 'mobile-invoice' },
        { id: 'quote-flow', label: 'Quote to invoice', hook: 'A customer saying yes should move the job forward—not create another round of typing.', body: 'With Tallyo, an accepted quote can keep its customer and job details as the work moves toward invoicing.', cta: 'What slows down your quote-to-invoice handover?', assetId: 'quote-to-invoice' },
        { id: 'deposit-clarity', label: 'Deposit and balance', hook: 'A deposit is easier to manage when the remaining balance stays visible.', body: 'Tallyo can show a predefined deposit and the balance that remains on the invoice, keeping the payment request easier to understand.', cta: 'Do you use deposits for larger jobs?', assetId: 'deposit' },
        { id: 'repeat-work', label: 'Repeat work', hook: 'Regular work should not mean rebuilding the same invoice every month.', body: 'Save the schedule for repeat work and decide whether each generated invoice is emailed or left for review.', cta: 'Which regular job creates the most repeated admin?', assetId: 'schedule' },
        { id: 'income-view', label: 'Recorded income view', hook: 'Knowing what was invoiced is different from seeing what is paid, outstanding or overdue.', body: 'Tallyo Income Insights organises invoice and payment activity recorded in Tallyo by period and currency. It does not calculate expenses, profit or tax due.', cta: 'Which figure do you check first when planning the next few weeks?', assetId: 'income-insights' },
        { id: 'founder-note', label: 'Founder note', hook: 'I am building Tallyo around a simple belief: essential business admin should feel calm.', body: 'That means clearer job workflows, professional customer documents and honest boundaries around what the product does.', cta: 'Where does admin get in the way of your best work?', assetId: 'growth-studio' }
    ];
    const initialState = {
        section: 'overview', selectedPostId: 'post-1', discoveryFilter: 'all', brandCategory: 'all', dismissedCandidateIds: [], savedCandidateIds: [], metrics: { profileViews: 248, followerGrowth: 18, engagementRate: 4.7 },
        posts: [
            { id: 'post-1', title: 'Admin should not take the evening', status: 'In review', scheduledFor: 'Tue · 09:10', segmentId: 'trades', assetId: 'mobile-invoice', caption: 'The job is finished. The paperwork should not take the rest of your evening.\n\nTallyo keeps quotes, invoices, customer details and payment status in one focused workspace for small service businesses.\n\nWhich part of job admin follows you home most often?\n\n#UKTrades #SmallBusiness #Tallyo', alt: 'Tallyo graphic about finishing an invoice without a separate evening admin session.' },
            { id: 'post-2', title: 'From accepted quote to invoice', status: 'Approved', scheduledFor: 'Thu · 12:20', segmentId: 'trades', assetId: 'quote-to-invoice', caption: 'A customer saying yes should move the job forward—not create another round of typing.\n\nWith Tallyo, an accepted quote can keep its customer and job details as the work moves toward invoicing.\n\n#SoleTrader #Quoting #Tallyo', alt: 'Current Tallyo Overview showing an accepted quote and its linked draft invoice, using fictional sample data.' },
            { id: 'post-3', title: 'A clearer view of recorded income', status: 'Draft', scheduledFor: 'Unscheduled', segmentId: 'professional-services', assetId: 'income-insights', caption: 'Knowing what was invoiced is different from seeing what is paid, outstanding or overdue.\n\nTallyo Income Insights organises invoice and payment activity recorded in Tallyo by period and currency. It does not calculate expenses, profit or tax due.\n\n#SelfEmployed #BusinessAdmin #Tallyo', alt: 'Current Tallyo Finances screen showing invoiced, received, outstanding and overdue values with fictional sample data.' }
        ],
        automations: [
            { id: 'research', name: 'Public-business Discovery Agent', cadence: 'Weekdays · 08:30 Europe/London', enabled: true, mode: 'Searches public business websites for trade and self-employed service businesses' },
            { id: 'drafts', name: 'Content draft pack', cadence: 'Manual for now', enabled: true, mode: 'Creates drafts for owner review' },
            { id: 'review', name: 'Approval reminder', cadence: 'Not scheduled', enabled: false, mode: 'Local reminder only' },
            { id: 'report', name: 'Weekly performance recap', cadence: 'Not connected', enabled: false, mode: 'Requires approved LinkedIn analytics access' }
        ]
    };
    const emptyDiscovery = { schemaVersion: 1, generatedAt: null, sourcePolicy: 'Public business websites only', searchSummary: 'The next weekday research cycle has not completed yet.', candidates: [] };

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
            if (!saved || typeof saved !== 'object') return clone(initialState);
            return { ...clone(initialState), ...saved, posts: Array.isArray(saved.posts) ? saved.posts : clone(initialState.posts), automations: Array.isArray(saved.automations) ? saved.automations : clone(initialState.automations) };
        } catch (_) { return clone(initialState); }
    }
    function saveState(state) { localStorage.setItem(storageKey, JSON.stringify(state)); }
    function safeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : ''; } catch (_) { return ''; } }
    function normaliseDiscovery(payload) {
        if (!payload || typeof payload !== 'object') return clone(emptyDiscovery);
        return { schemaVersion: 1, generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt.slice(0, 40) : null, sourcePolicy: String(payload.sourcePolicy || emptyDiscovery.sourcePolicy).slice(0, 120), searchSummary: String(payload.searchSummary || emptyDiscovery.searchSummary).slice(0, 500), candidates: (Array.isArray(payload.candidates) ? payload.candidates : []).slice(0, 50).map((candidate, index) => ({ id: String(candidate.id || `candidate-${index + 1}`).slice(0, 80), company: String(candidate.company || '').slice(0, 120), website: safeUrl(candidate.website), sector: String(candidate.sector || '').slice(0, 120), location: String(candidate.location || '').slice(0, 120), fitScore: Math.max(0, Math.min(100, Number(candidate.fitScore) || 0)), confidence: ['High', 'Medium', 'Low'].includes(candidate.confidence) ? candidate.confidence : 'Medium', signal: String(candidate.signal || '').slice(0, 500), fitReason: String(candidate.fitReason || '').slice(0, 500), decisionRole: String(candidate.decisionRole || '').slice(0, 160), contentAngle: String(candidate.contentAngle || '').slice(0, 300), sourceTitle: String(candidate.sourceTitle || '').slice(0, 200), sourceUrl: safeUrl(candidate.sourceUrl), discoveredAt: String(candidate.discoveredAt || '').slice(0, 40), status: ['new', 'saved', 'dismissed'].includes(candidate.status) ? candidate.status : 'new' })).filter((candidate) => candidate.company && candidate.sourceUrl) };
    }
    function recommendAsset(value, fallbackId = 'dashboard') {
        const normalised = (Array.isArray(value) ? value.join(' ') : String(value || '')).toLowerCase();
        let best = brandAssets.find((asset) => asset.id === fallbackId) || brandAssets[0]; let bestScore = 0;
        for (const asset of brandAssets) { const score = asset.topics.reduce((total, topic) => total + (normalised.includes(topic) ? Math.max(2, topic.split(' ').length + 1) : 0), 0); if (score > bestScore) { best = asset; bestScore = score; } }
        return best;
    }
    function recommendSegment(value) {
        const text = String(value || '').toLowerCase();
        const id = /plumb|electric|build|construct|paint|decorat|roof|carpent|joiner|brick|trade/.test(text) ? 'trades' : /clean|garden|landscap|handyman|property|maintenance/.test(text) ? 'property-services' : /install|repair|technician|mobile|vehicle|appliance/.test(text) ? 'mobile-services' : /photo|design|video|creative|studio/.test(text) ? 'creative-services' : 'professional-services';
        return audienceSegments.find((item) => item.id === id);
    }

    window.TallyoGrowthStudio = Object.freeze({
        sections: [{ id: 'overview', label: 'Overview' }, { id: 'discover', label: 'Discover' }, { id: 'content', label: 'Content Studio' }, { id: 'calendar', label: 'Calendar' }, { id: 'audience', label: 'Audience' }, { id: 'analytics', label: 'Analytics' }, { id: 'brand', label: 'Brand Library' }, { id: 'automations', label: 'Automations' }, { id: 'settings', label: 'Settings' }],
        audienceSegments, brandCategories, brandAssets, templates,
        claimGuardrails: ['Use concrete product capabilities, not financial promises.', 'Do not claim Tallyo replaces an accountant, bank or adviser.', 'Income Insights covers invoices and payments recorded in Tallyo; it excludes expenses, profit and tax due.', 'Put audience value before promotion.', 'Every post requires owner approval and meaningful alt text.'],
        emptyDiscovery, loadState, saveState, normaliseDiscovery, recommendAsset, recommendSegment
    });
})();
