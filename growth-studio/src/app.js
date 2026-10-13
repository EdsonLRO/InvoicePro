import { audienceSegments, brandAssets, brandCategories, channelDefinitions, claimGuardrails, contentTemplates, initialState, recommendAsset, recommendSegment } from "./data.js";
import { emptyDiscovery, normaliseDiscovery } from "./discovery.js";

const storageKey = "tallyo-growth-studio-v2";
const workspace = document.querySelector("#workspace");
const toast = document.querySelector("#toast");
let view = "overview";
let state = loadState();
let discovery = structuredClone(emptyDiscovery);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? { ...clone(initialState), ...saved } : clone(initialState);
  } catch { return clone(initialState); }
}
function saveState(message = "Saved locally") {
  localStorage.setItem(storageKey, JSON.stringify(state));
  document.querySelector("#saved-state").textContent = message;
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}
function assetFor(id) { return brandAssets.find((asset) => asset.id === id) || brandAssets[0]; }
function segmentFor(id) { return audienceSegments.find((segment) => segment.id === id) || audienceSegments[0]; }
function selectedPost() { return state.posts.find((post) => post.id === state.selectedPostId) || state.posts[0]; }
function recommendedAssetFor(post) { return recommendAsset([post?.title, post?.caption, segmentFor(post?.segmentId).name], post?.assetId); }
function candidateFor(id) { return discovery.candidates.find((candidate) => candidate.id === id); }
function formattedResearchTime() {
  if (!discovery.generatedAt) return "Awaiting first automated run";
  const date = new Date(discovery.generatedAt);
  if (Number.isNaN(date.valueOf())) return discovery.generatedAt;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
async function loadDiscovery(showFeedback = false) {
  try {
    let response = await fetch("api/discovery", { cache: "no-store" });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      response = await fetch("discovery.json", { cache: "no-store" });
    }
    if (!response.ok) throw new Error("Discovery feed unavailable");
    discovery = normaliseDiscovery(await response.json());
    if (showFeedback) showToast(`${discovery.candidates.length} researched businesses loaded.`);
  } catch {
    discovery = structuredClone(emptyDiscovery);
    if (showFeedback) showToast("Discovery feed is not available yet.");
  }
  if (["overview", "discover"].includes(view)) render();
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}
function pageHeading(eyebrow, title, description, aside = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(description)}</p></div>${aside}</div>`;
}
function renderChannelSwitcher() {
  document.querySelector("#channel-switcher").innerHTML = Object.entries(channelDefinitions).map(([id, channel]) => `<button class="channel-button ${state.selectedChannel === id ? "active" : ""}" data-channel="${id}" ${id !== "linkedin" ? "disabled" : ""}>${escapeHtml(channel.label)}${id !== "linkedin" ? " · Later" : ""}</button>`).join("");
}

function renderOverview() {
  const statusCount = (status) => state.posts.filter((post) => post.status === status).length;
  const activeCandidates = discovery.candidates.filter((candidate) => !state.dismissedCandidateIds.includes(candidate.id));
  const highFitCandidates = activeCandidates.filter((candidate) => candidate.fitScore >= 85);
  return `${pageHeading("Command centre", "Good morning, Edson.", "Plan a consistent LinkedIn presence, keep every claim reviewable, and make the next action obvious.", '<span class="pill mint">● Local workspace ready</span>')}
    <div class="grid metrics-grid">
      ${[["Profile views", state.metrics.profileViews, "+12% demo"], ["Follower growth", `+${state.metrics.followerGrowth}`, "Last 30 days · demo"], ["Engagement rate", `${state.metrics.engagementRate}%`, "+0.8 pts · demo"], ["Drafts ready", state.posts.length, "Awaiting your review"]].map(([label,value,delta]) => `<article class="card metric-card"><span class="metric-label">${label}</span><strong class="metric-value">${value}</strong><span class="metric-delta">${delta}</span></article>`).join("")}
    </div>
    <div class="grid dashboard-grid">
      <div class="grid">
        <article class="card">
          <div class="section-head"><div><h2>Content pipeline</h2><p>Local planning states—nothing is published automatically.</p></div><button class="button ghost" data-view="content">Open studio →</button></div>
          <div class="pipeline">
            <div class="pipeline-step"><span class="pill">Ideas</span><strong>${contentTemplates.length}</strong></div>
            <div class="pipeline-step"><span class="pill">Drafts</span><strong>${statusCount("Draft")}</strong></div>
            <div class="pipeline-step"><span class="pill amber">In review</span><strong>${statusCount("In review")}</strong></div>
            <div class="pipeline-step"><span class="pill mint">Approved</span><strong>${statusCount("Approved")}</strong></div>
          </div>
        </article>
        <article class="card">
          <div class="section-head"><div><h2>This week's plan</h2><p>Three useful posts, each for a defined audience.</p></div><button class="button ghost" data-view="calendar">View calendar →</button></div>
          <div class="queue">${state.posts.map((post) => `<div class="queue-item"><div><p><strong>${escapeHtml(post.title)}</strong></p><small>${escapeHtml(segmentFor(post.segmentId).name)} · ${escapeHtml(post.scheduledFor)}</small></div><span class="pill ${post.status === "Approved" ? "mint" : post.status === "In review" ? "amber" : ""}">${escapeHtml(post.status)}</span></div>`).join("")}</div>
        </article>
      </div>
      <div class="grid">
        <article class="card">
          <div class="section-head"><div><h2>Automated discovery</h2><p>${escapeHtml(formattedResearchTime())}</p></div><span class="pill mint">Weekdays · 08:30</span></div>
          <div class="activity-list">
            ${activeCandidates.slice(0, 3).map((candidate) => `<div class="activity-item"><div><p>${escapeHtml(candidate.company)}</p><small>${escapeHtml(candidate.sector)} · ${escapeHtml(candidate.signal)}</small></div><strong>${candidate.fitScore}</strong></div>`).join("") || '<div class="activity-item"><div><p>First research run pending</p><small>The Discovery Agent will populate this automatically.</small></div></div>'}
          </div>
          <button class="button secondary" data-view="discover">Review ${highFitCandidates.length} high-fit candidates</button>
        </article>
        <div class="notice"><strong>Research runs without manual searching.</strong><br>The agent evaluates public business evidence and saves candidate companies. It does not scrape LinkedIn, collect personal contact details, or contact anyone.</div>
      </div>
    </div>`;
}

function renderDiscover() {
  const candidates = discovery.candidates
    .filter((candidate) => !state.dismissedCandidateIds.includes(candidate.id))
    .filter((candidate) => state.discoveryFilter === "high" ? candidate.fitScore >= 85 : state.discoveryFilter === "saved" ? state.savedCandidateIds.includes(candidate.id) : true)
    .sort((first, second) => second.fitScore - first.fitScore);
  const highFit = discovery.candidates.filter((candidate) => candidate.fitScore >= 85 && !state.dismissedCandidateIds.includes(candidate.id)).length;
  return `${pageHeading("Automated discovery", "The agent searches. You decide what deserves attention.", "Every weekday the Discovery Agent researches public UK business sources, identifies evidence of product fit, removes duplicates, and explains why each candidate may benefit from Tallyo.", '<span class="pill mint">● Scheduled · 08:30 Europe/London</span>')}
    <div class="grid metrics-grid discovery-metrics">
      <article class="card metric-card"><span class="metric-label">Candidates found</span><strong class="metric-value">${discovery.candidates.length}</strong><span class="metric-delta">Latest research cycle</span></article>
      <article class="card metric-card"><span class="metric-label">High fit</span><strong class="metric-value">${highFit}</strong><span class="metric-delta">Score 85 or higher</span></article>
      <article class="card metric-card"><span class="metric-label">Saved</span><strong class="metric-value">${state.savedCandidateIds.length}</strong><span class="metric-delta">For campaign planning</span></article>
      <article class="card metric-card"><span class="metric-label">Last researched</span><strong class="metric-value metric-date">${escapeHtml(discovery.generatedAt ? new Date(discovery.generatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "Pending")}</strong><span class="metric-delta">Weekday automation</span></article>
    </div>
    <article class="card spaced-card discovery-summary"><div><span class="pill">Evidence policy</span><h2>${escapeHtml(discovery.sourcePolicy)}</h2><p>${escapeHtml(discovery.searchSummary)}</p></div><div><label for="discovery-filter">Show</label><select id="discovery-filter" class="compact-select"><option value="all" ${state.discoveryFilter === "all" ? "selected" : ""}>All active</option><option value="high" ${state.discoveryFilter === "high" ? "selected" : ""}>High fit</option><option value="saved" ${state.discoveryFilter === "saved" ? "selected" : ""}>Saved</option></select></div></article>
    <div class="grid discovery-grid">${candidates.map((candidate) => `<article class="card candidate-card">
      <div class="candidate-head"><div><span class="meta">${escapeHtml(candidate.sector)} · ${escapeHtml(candidate.location)}</span><h2>${escapeHtml(candidate.company)}</h2></div><div class="fit-score"><strong>${candidate.fitScore}</strong><span>fit score</span></div></div>
      <div class="evidence-block"><span>Public signal</span><p>${escapeHtml(candidate.signal)}</p></div>
      <div class="candidate-detail"><span>Why Tallyo fits</span><p>${escapeHtml(candidate.fitReason)}</p></div>
      <div class="candidate-detail"><span>Likely decision role</span><p>${escapeHtml(candidate.decisionRole)}</p></div>
      <div class="candidate-detail"><span>Recommended content angle</span><p>${escapeHtml(candidate.contentAngle)}</p></div>
      <a class="source-link" href="${escapeHtml(candidate.sourceUrl)}" target="_blank" rel="noreferrer">View public evidence ↗</a>
      <div class="form-actions"><button class="button secondary" data-action="toggle-save-candidate" data-candidate="${candidate.id}">${state.savedCandidateIds.includes(candidate.id) ? "Saved ✓" : "Save candidate"}</button><button class="button secondary" data-action="dismiss-candidate" data-candidate="${candidate.id}">Dismiss</button><button class="button primary" data-action="draft-from-candidate" data-candidate="${candidate.id}">Create campaign draft</button></div>
    </article>`).join("") || '<article class="card empty-state"><div class="icon">◎</div><h2>No candidates in this view</h2><p class="lede centered-lede">The weekday Discovery Agent will add new evidence-backed businesses automatically. Try another filter if candidates have already been saved or dismissed.</p></article>'}</div>`;
}

function renderContent() {
  const post = selectedPost();
  const asset = assetFor(post.assetId);
  const recommendation = recommendedAssetFor(post);
  return `${pageHeading("Content Studio", "Draft, review, and prepare every post.", "Write against a specific audience need, preview the LinkedIn layout, and keep publishing behind explicit owner approval.")}
    <div class="studio-grid">
      <article class="card"><div class="section-head"><div><h2>Drafts</h2><p>${state.posts.length} in workspace</p></div></div><div class="post-list">${state.posts.map((item) => `<button class="post-list-item ${item.id === post.id ? "active" : ""}" data-post="${item.id}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.status)} · ${escapeHtml(item.scheduledFor)}</small></button>`).join("")}</div><button class="button ghost" data-action="generate-pack">+ Generate a new draft</button></article>
      <article class="card"><div class="section-head"><div><h2>LinkedIn preview</h2><p>Organic company-page post</p></div><span class="pill">Preview</span></div><div class="preview"><div class="preview-head"><div class="avatar">T</div><div><strong>Tallyo</strong><small>Business software · Draft preview</small></div></div><div class="preview-copy">${escapeHtml(post.caption)}</div><img class="preview-image" src="assets/linkedin/${escapeHtml(asset.file)}" alt="${escapeHtml(post.alt)}"><div class="preview-stats"><span>◉ Illustrative preview</span><span>Like · Comment · Repost</span></div></div></article>
      <article class="card editor-card"><div class="section-head"><div><h2>Review</h2><p>Changes save in this browser only.</p></div><span class="pill ${post.status === "Approved" ? "mint" : "amber"}">${escapeHtml(post.status)}</span></div><form id="post-form" class="form-grid">
        <label>Post title<input name="title" value="${escapeHtml(post.title)}"></label>
        <label>Audience<select name="segmentId">${audienceSegments.map((segment) => `<option value="${segment.id}" ${segment.id === post.segmentId ? "selected" : ""}>${escapeHtml(segment.name)}</option>`).join("")}</select></label>
        <label>Brand visual<select name="assetId">${brandCategories.filter((category) => category.id !== "all").map((category) => `<optgroup label="${escapeHtml(category.label)}">${brandAssets.filter((item) => item.category === category.id).map((item) => `<option value="${item.id}" ${item.id === post.assetId ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</optgroup>`).join("")}</select></label>
        <div class="asset-recommendation"><div><span>Recommended for this draft</span><strong>${escapeHtml(recommendation.label)}</strong></div><button class="button secondary" type="button" data-action="use-recommended-asset" data-asset="${recommendation.id}" ${recommendation.id === asset.id ? "disabled" : ""}>${recommendation.id === asset.id ? "Using recommendation" : "Use visual"}</button></div>
        <label>Caption<textarea name="caption">${escapeHtml(post.caption)}</textarea></label>
        <label>Image alt text<input name="alt" value="${escapeHtml(post.alt)}"></label>
        <label>Planned time<input name="scheduledFor" value="${escapeHtml(post.scheduledFor)}"></label>
        <ul class="check-list"><li>Claim language stays within product capabilities</li><li>Audience value comes before promotion</li><li>Alt text is present</li><li>Publishing remains disconnected</li></ul>
        <div class="form-actions"><button class="button secondary" type="submit">Save draft</button><button class="button primary" type="button" data-action="approve-post">Approve locally</button></div>
      </form></article>
    </div>`;
}

function renderCalendar() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return `${pageHeading("Calendar", "A sustainable publishing rhythm.", "Plan around audience value and review capacity. Times are suggestions until a future approved publishing integration exists.")}
    <div class="calendar-grid">${days.map((day) => `<article class="day"><strong>${day}</strong>${state.posts.filter((post) => post.scheduledFor.startsWith(day.slice(0,3))).map((post) => `<div class="calendar-item"><strong>${escapeHtml(post.title)}</strong>${escapeHtml(post.scheduledFor)}<br><span class="muted">${escapeHtml(post.status)}</span></div>`).join("") || '<div class="calendar-item calendar-empty">Keep open for engagement and learning.</div>'}</article>`).join("")}</div>`;
}

function renderDisconnected(title, description, icon) {
  return `${pageHeading("Owner-gated capability", title, description)}<article class="card empty-state"><div class="icon">${icon}</div><h2>Not connected in this milestone</h2><p class="lede centered-lede">This area will become available only through an approved platform API, with owner credentials, privacy review, and clear rate and action limits.</p><span class="pill amber">No account action can occur</span></article>`;
}

function renderAudience() {
  return `${pageHeading("Audience", "Segments built around genuine product fit.", "Keep strategy useful without building a database of people. The studio stores aggregate segment definitions only.")}
    <div class="grid segment-grid">${audienceSegments.map((segment) => `<article class="card"><span class="pill">${escapeHtml(segment.market)}</span><h2 class="segment-title">${escapeHtml(segment.name)}</h2><p class="muted">${escapeHtml(segment.fit)}</p><div class="chip-row">${segment.angles.map((angle) => `<span class="chip">${escapeHtml(angle)}</span>`).join("")}</div></article>`).join("")}</div>`;
}

function renderAnalytics() {
  return `${pageHeading("Analytics", "Learn what earns attention.", "Illustrative metrics establish the dashboard structure. A future approved integration can replace them with company-page analytics.", '<span class="pill amber">Demo data</span>')}
    <div class="grid dashboard-grid"><article class="card"><div class="section-head"><div><h2>Organic reach trend</h2><p>Seven-week illustrative view</p></div></div><div class="bar-chart">${[1,2,3,4,5,6,7].map((week) => `<div class="bar"><span>W${week}</span></div>`).join("")}</div></article><article class="card"><h2>Learning agenda</h2><div class="activity-list"><div class="activity-item"><div><p>Practical workflow posts</p><small>Compare saves and comments</small></div><strong>Test</strong></div><div class="activity-item"><div><p>Founder voice</p><small>Measure profile visits</small></div><strong>Test</strong></div><div class="activity-item"><div><p>Product visuals</p><small>Track meaningful clicks</small></div><strong>Test</strong></div></div></article></div>`;
}

function renderBrand() {
  const category = brandCategories.some((item) => item.id === state.brandCategory) ? state.brandCategory : "all";
  const visibleAssets = category === "all" ? brandAssets : brandAssets.filter((asset) => asset.category === category);
  return `${pageHeading("Brand Library", "One recognisable Tallyo system.", "Use the approved logo, visual language, tone, and product-grounded claims already established for Tallyo.")}
    <div class="brand-filter" role="group" aria-label="Filter brand visuals">${brandCategories.map((item) => `<button class="chip ${item.id === category ? "active" : ""}" data-action="filter-brand" data-category="${item.id}">${escapeHtml(item.label)}</button>`).join("")}</div>
    <div class="grid asset-grid">${visibleAssets.map((asset) => `<article class="card asset-card"><img src="assets/linkedin/${escapeHtml(asset.file)}" alt="${escapeHtml(asset.alt)}"><div class="asset-meta"><div class="asset-tags"><span class="pill">${escapeHtml(asset.tone)}</span><span>${escapeHtml(brandCategories.find((item) => item.id === asset.category)?.label || asset.category)}</span></div><h3>${escapeHtml(asset.label)}</h3><p>${escapeHtml(asset.alt)}</p></div></article>`).join("")}</div><article class="card top-spaced"><div class="section-head"><div><h2>Claim guardrails</h2><p>Applied to every content review.</p></div></div><ul class="check-list">${claimGuardrails.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></article>`;
}

function renderAutomations() {
  return `${pageHeading("Automations", "Automate preparation, retain judgement.", "Cadences generate private briefs and drafts in the workspace. They do not operate a LinkedIn account or contact anyone.")}
    <div class="notice spaced-card"><strong>Discovery is connected to a weekday scheduler.</strong> It updates local research data from public sources. Content preparation and reminders remain proposed until their separate schedules are enabled.</div><article class="card">${state.automations.map((automation) => `<div class="automation-row"><div><strong>${escapeHtml(automation.name)}</strong><small>${escapeHtml(automation.mode)}</small></div><div><span class="muted">Cadence</span><small>${escapeHtml(automation.cadence)}</small></div><div><span class="pill ${automation.connected ? "mint" : automation.enabled ? "" : "amber"}">${automation.connected ? "Connected" : automation.enabled ? "Planned on" : "Planned off"}</span></div><button class="switch ${automation.enabled ? "on" : ""}" data-action="toggle-automation" data-automation="${automation.id}" aria-label="Toggle ${escapeHtml(automation.name)}" aria-pressed="${automation.enabled}" ${automation.connected ? "disabled" : ""}></button></div>`).join("")}</article>`;
}

function renderSettings() {
  const capabilities = channelDefinitions.linkedin.capabilities;
  const labels = { discoverPublicBusinesses: "Research public business sources", generateDrafts: "Generate content drafts", renderAssets: "Prepare branded visuals", publish: "Publish to LinkedIn", readAnalytics: "Read live analytics", searchPeople: "Scrape or automate LinkedIn people search", sendMessages: "Send direct messages", sendConnections: "Send connection requests", reactToPosts: "React to other posts" };
  return `${pageHeading("Settings", "Clear boundaries before connection.", "The first milestone deliberately separates useful preparation from actions that affect external accounts or people.")}
    <div class="grid dashboard-grid"><article class="card"><div class="section-head"><div><h2>LinkedIn capability matrix</h2><p>Enforced in the application data model.</p></div><span class="pill">Draft-only</span></div><div class="settings-list">${Object.entries(capabilities).map(([key,enabled]) => `<div class="setting-row"><span>${escapeHtml(labels[key])}</span><span class="capability ${enabled ? "yes" : "no"}">${enabled ? "Available" : "Not permitted"}</span></div>`).join("")}</div></article><div class="grid"><article class="card"><h2>Connection requirements</h2><ul class="check-list"><li>Approved LinkedIn developer access and supported API product</li><li>Owner-provided credentials stored outside browser code</li><li>Privacy and marketing review for live data processing</li><li>Explicit publish approvals, audit history, and kill switch</li></ul></article><article class="card"><h2>Local data</h2><p class="muted">Only draft copy, aggregate segments, preferences, and demo metrics are stored in this browser.</p><button class="button secondary" data-action="reset-local">Reset local workspace</button></article></div></div>`;
}

const renderers = { overview: renderOverview, discover: renderDiscover, content: renderContent, calendar: renderCalendar, engagement: () => renderDisconnected("Engagement without risky account automation.", "A future inbox can surface comments on Tallyo's own page for human response. Automated reactions, messages, and connection requests remain out of scope.", "↗"), audience: renderAudience, analytics: renderAnalytics, brand: renderBrand, automations: renderAutomations, settings: renderSettings };

function render() {
  renderChannelSwitcher();
  workspace.innerHTML = renderers[view]();
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
}

function navigate(nextView) {
  if (!renderers[nextView]) return;
  view = nextView;
  render();
  document.querySelector(".sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", async (event) => {
  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget) { navigate(viewTarget.dataset.view); return; }
  const postTarget = event.target.closest("[data-post]");
  if (postTarget) { state.selectedPostId = postTarget.dataset.post; saveState(); render(); return; }
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "refresh-discovery") await loadDiscovery(true);
  if (action === "generate-pack") {
    const template = contentTemplates[state.posts.length % contentTemplates.length];
    const id = `post-${Date.now()}`;
    const segment = audienceSegments[state.posts.length % audienceSegments.length];
    const asset = assetFor(template.assetId);
    state.posts.push({ id, title: template.label, status: "Draft", scheduledFor: "Unscheduled", templateId: template.id, segmentId: segment.id, assetId: asset.id, caption: `${template.hook}\n\n${template.body}\n\n${template.cta}\n\n#SmallBusiness #Tallyo`, alt: asset.alt });
    state.selectedPostId = id; saveState("New draft saved locally"); view = "content"; showToast("A new draft is ready for review."); render();
  }
  if (action === "use-recommended-asset") {
    const post = selectedPost(); const asset = assetFor(actionTarget.dataset.asset);
    post.assetId = asset.id; post.alt = asset.alt; saveState("Recommended visual applied"); showToast("Recommended visual applied to the draft."); render();
  }
  if (action === "filter-brand") { state.brandCategory = actionTarget.dataset.category; saveState(); render(); }
  if (action === "toggle-save-candidate") {
    const candidateId = actionTarget.dataset.candidate;
    state.savedCandidateIds = state.savedCandidateIds.includes(candidateId) ? state.savedCandidateIds.filter((id) => id !== candidateId) : [...state.savedCandidateIds, candidateId];
    saveState("Candidate preference saved locally"); showToast(state.savedCandidateIds.includes(candidateId) ? "Candidate saved for campaign planning." : "Candidate removed from saved list."); render();
  }
  if (action === "dismiss-candidate") {
    const candidateId = actionTarget.dataset.candidate;
    state.dismissedCandidateIds = [...new Set([...state.dismissedCandidateIds, candidateId])];
    state.savedCandidateIds = state.savedCandidateIds.filter((id) => id !== candidateId);
    saveState("Candidate dismissed locally"); showToast("Candidate dismissed. The source remains in the research record."); render();
  }
  if (action === "draft-from-candidate") {
    const candidate = candidateFor(actionTarget.dataset.candidate);
    if (!candidate) return;
    const segment = recommendSegment([candidate.sector, candidate.signal, candidate.fitReason].join(" "));
    const template = contentTemplates[0]; const asset = recommendAsset([candidate.sector, candidate.contentAngle, candidate.signal, candidate.fitReason]); const id = `post-${Date.now()}`;
    const caption = `${candidate.contentAngle}\n\n${candidate.signal}\n\nTallyo helps small service businesses keep quotes, invoices, customer records, recurring work and payment status in one focused workspace.\n\nWhich part of this workflow takes the most time today?\n\n#SoleTrader #UKTrades #Tallyo`;
    state.posts.push({ id, title: `${candidate.sector}: ${candidate.contentAngle}`, status: "Draft", scheduledFor: "Unscheduled", templateId: template.id, segmentId: segment.id, assetId: asset.id, caption, alt: asset.alt, researchCandidateId: candidate.id });
    if (!state.savedCandidateIds.includes(candidate.id)) state.savedCandidateIds.push(candidate.id);
    state.selectedPostId = id; saveState("Campaign draft saved locally"); navigate("content"); showToast("Research-backed campaign draft created.");
  }
  if (action === "approve-post") { const post = selectedPost(); post.status = "Approved"; saveState("Approval saved locally"); showToast("Approved locally. Nothing was published."); render(); }
  if (action === "toggle-automation") { const automation = state.automations.find((item) => item.id === actionTarget.dataset.automation); automation.enabled = !automation.enabled; saveState(); showToast("Planning preference saved. No scheduler was started."); render(); }
  if (action === "reset-local") { state = clone(initialState); localStorage.removeItem(storageKey); saveState("Local workspace reset"); showToast("Local demo workspace reset."); render(); }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "discovery-filter") { state.discoveryFilter = event.target.value; saveState(); render(); }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "post-form") return;
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  Object.assign(selectedPost(), values, { status: selectedPost().status === "Approved" ? "Approved" : "In review" });
  saveState("Draft changes saved locally"); showToast("Draft saved. Nothing was published."); render();
});

document.querySelector("#mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
render();
loadDiscovery();
