(function () {
    'use strict';

    const storageKey = 'tallyo-growth-studio-v2';
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const audienceSegments = [
        { id: 'consultants', name: 'Independent consultants', market: 'UK service businesses', fit: 'Clear quotes, professional invoices, recurring billing, and income visibility.', angles: ['Protect billable time', 'Turn accepted work into an invoice', 'See income without a spreadsheet'] },
        { id: 'creatives', name: 'Freelance creatives', market: 'Design, video, writing', fit: 'A focused quote-to-payment workflow for project and retainer work.', angles: ['Keep client work moving', 'Professional documents in minutes', 'One view from quote to paid'] },
        { id: 'trades', name: 'Owner-operated trades', market: 'Local trade services', fit: 'Mobile-friendly quoting, invoicing, customer records, and payment status.', angles: ['Finish paperwork before leaving site', 'Know what is outstanding', 'Keep documents consistent'] },
        { id: 'agencies', name: 'Small agencies', market: '2–15 person service teams', fit: 'Recurring invoices, shared visibility, and repeatable client workflows.', angles: ['Billing for retained work', 'A calmer month-end', 'Visibility without finance-tool complexity'] },
        { id: 'contractors', name: 'Independent contractors', market: 'Technology and professional services', fit: 'Invoices, expenses, recurring work, and income insights in one workspace.', angles: ['Plan from real activity', 'Spend less time reconciling', 'Keep evidence organised'] }
    ];
    const brandAssets = [
        { id: 'clarity', label: 'Free Invoice Maker', file: '01-free-invoice-maker.png', tone: 'Confident', alt: 'Tallyo graphic introducing the free invoice maker.' },
        { id: 'system', label: 'Dashboard clarity', file: '02-dashboard-clarity.png', tone: 'Direct', alt: 'Tallyo graphic showing a clear business dashboard.' },
        { id: 'flow', label: 'Create invoices', file: '03-create-invoices.png', tone: 'Practical', alt: 'Tallyo graphic about creating professional invoices.' },
        { id: 'time', label: 'Recurring invoices', file: '05-recurring-invoices.png', tone: 'Empathetic', alt: 'Tallyo graphic about setting up recurring invoices.' },
        { id: 'overdue', label: 'Overdue with context', file: '30-overdue-with-context.png', tone: 'Helpful', alt: 'Tallyo graphic about viewing overdue invoices with context.' },
        { id: 'income', label: 'After an invoice is sent', file: '32-after-the-invoice-is-sent.png', tone: 'Analytical', alt: 'Tallyo graphic about the workflow after an invoice is sent.' }
    ];
    const templates = [
        { id: 'problem-solution', label: 'Problem → solution', hook: 'The work is finished. The paperwork should not take the rest of your evening.', body: 'Tallyo brings quotes, invoices, expenses, recurring work, and income visibility into one focused workspace for small service businesses.', cta: 'Follow Tallyo for practical ways to make business admin lighter.', assetId: 'time' },
        { id: 'workflow', label: 'Workflow explainer', hook: 'A quote should be the start of a clean workflow—not another disconnected document.', body: 'Create a professional quote, keep the customer record organised, and move accepted work toward invoicing without rebuilding the same details.', cta: 'What part of your quote-to-payment process creates the most friction?', assetId: 'flow' },
        { id: 'founder-note', label: 'Founder note', hook: 'I am building Tallyo around a simple belief: essential business admin should feel calm.', body: 'Small businesses need a reliable way to handle quotes, invoices, expenses, and recurring work while keeping a clear view of income.', cta: 'Where does admin get in the way of your best work?', assetId: 'clarity' },
        { id: 'insight', label: 'Practical insight', hook: 'Revenue on paper is not the same as knowing what is happening in your business.', body: 'Useful income visibility starts with invoices, payment status, and expenses already recorded in Tallyo.', cta: 'Which number do you check first when planning the month ahead?', assetId: 'income' }
    ];
    const initialState = {
        section: 'overview',
        selectedPostId: 'post-1',
        discoveryFilter: 'all',
        dismissedCandidateIds: [],
        savedCandidateIds: [],
        metrics: { profileViews: 248, followerGrowth: 18, engagementRate: 4.7 },
        posts: [
            { id: 'post-1', title: 'Admin should not take the evening', status: 'In review', scheduledFor: 'Tue · 09:10', segmentId: 'trades', assetId: 'time', caption: 'The work is finished. The paperwork should not take the rest of your evening.\n\nTallyo brings quotes, invoices, expenses, recurring work, and income visibility into one focused workspace for small service businesses. Less switching. A clearer next action.\n\n#SmallBusiness #BusinessAdmin #Tallyo', alt: 'Tallyo graphic about setting up recurring invoices.' },
            { id: 'post-2', title: 'From quote to paid', status: 'Approved', scheduledFor: 'Thu · 12:20', segmentId: 'consultants', assetId: 'flow', caption: 'A quote should be the start of a clean workflow—not another disconnected document.\n\nTallyo is designed around the flow of a small service business, from a professional quote toward invoicing and payment tracking.\n\n#FreelanceBusiness #Invoicing #Tallyo', alt: 'Tallyo graphic about creating professional invoices.' },
            { id: 'post-3', title: 'A calmer view of income', status: 'Draft', scheduledFor: 'Unscheduled', segmentId: 'contractors', assetId: 'income', caption: 'Revenue on paper is not the same as knowing what is happening in your business.\n\nTallyo helps bring invoices, payment status, and expenses into one view so small business owners can plan with more context.\n\n#BusinessFinance #Contractors #Tallyo', alt: 'Tallyo graphic about the workflow after an invoice is sent.' }
        ],
        automations: [
            { id: 'research', name: 'Public-business Discovery Agent', cadence: 'Weekdays · 08:30 Europe/London', enabled: true, mode: 'Researches public business websites and refreshes Discover' },
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
        } catch (_) {
            return clone(initialState);
        }
    }

    function saveState(state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function safeUrl(value) {
        try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : ''; } catch (_) { return ''; }
    }

    function normaliseDiscovery(payload) {
        if (!payload || typeof payload !== 'object') return clone(emptyDiscovery);
        return {
            schemaVersion: 1,
            generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt.slice(0, 40) : null,
            sourcePolicy: String(payload.sourcePolicy || emptyDiscovery.sourcePolicy).slice(0, 120),
            searchSummary: String(payload.searchSummary || emptyDiscovery.searchSummary).slice(0, 500),
            candidates: (Array.isArray(payload.candidates) ? payload.candidates : []).slice(0, 50).map((candidate, index) => ({
                id: String(candidate.id || `candidate-${index + 1}`).slice(0, 80),
                company: String(candidate.company || '').slice(0, 120),
                website: safeUrl(candidate.website),
                sector: String(candidate.sector || '').slice(0, 120),
                location: String(candidate.location || '').slice(0, 120),
                fitScore: Math.max(0, Math.min(100, Number(candidate.fitScore) || 0)),
                confidence: ['High', 'Medium', 'Low'].includes(candidate.confidence) ? candidate.confidence : 'Medium',
                signal: String(candidate.signal || '').slice(0, 500),
                fitReason: String(candidate.fitReason || '').slice(0, 500),
                decisionRole: String(candidate.decisionRole || '').slice(0, 160),
                contentAngle: String(candidate.contentAngle || '').slice(0, 300),
                sourceTitle: String(candidate.sourceTitle || '').slice(0, 200),
                sourceUrl: safeUrl(candidate.sourceUrl),
                discoveredAt: String(candidate.discoveredAt || '').slice(0, 40),
                status: ['new', 'saved', 'dismissed'].includes(candidate.status) ? candidate.status : 'new'
            })).filter((candidate) => candidate.company && candidate.sourceUrl)
        };
    }

    window.TallyoGrowthStudio = Object.freeze({
        sections: [
            { id: 'overview', label: 'Overview' }, { id: 'discover', label: 'Discover' }, { id: 'content', label: 'Content Studio' },
            { id: 'calendar', label: 'Calendar' }, { id: 'audience', label: 'Audience' }, { id: 'analytics', label: 'Analytics' },
            { id: 'brand', label: 'Brand Library' }, { id: 'automations', label: 'Automations' }, { id: 'settings', label: 'Settings' }
        ],
        audienceSegments,
        brandAssets,
        templates,
        claimGuardrails: ['Use concrete product capabilities, not financial promises.', 'Do not claim Tallyo replaces an accountant, bank, or adviser.', 'Put audience value before promotion.', 'Every post requires owner approval and meaningful alt text.'],
        emptyDiscovery,
        loadState,
        saveState,
        normaliseDiscovery
    });
})();
