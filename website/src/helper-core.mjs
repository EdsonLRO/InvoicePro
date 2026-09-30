export const normaliseQuestion = (value) => String(value || "")
  .toLocaleLowerCase("en-GB")
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9£\s-]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/\brecurr+i+n+g\b/g, "recurring")
  .slice(0, 240);

export const boundaryRules = Object.freeze([
  {
    reason: "sensitive",
    pattern: /\b(password|passphrase|mfa code|2fa code|authenticator (?:code|secret)|one[- ]time (?:password|code)|otp|recovery code|card number|security code|cvv|bank details|sort code|secret key|api key|access token|jwt)\b/i,
    answer: "Please do not enter passwords, authenticator codes, recovery codes, payment-card information, bank details, secrets or tokens. Tallyo Helper cannot use or verify them.",
    links: [{ label: "Read the account-security guide", href: "/help/account-security/" }]
  },
  {
    reason: "private-account",
    pattern: /\b(my|our)\s+(account|invoice|quote|credit note|customer|payment|refund|email|subscription|business records?)\b/i,
    answer: "I cannot see your account or business records. I can explain general Tallyo features and link you to public guidance, but I cannot inspect or change private information.",
    links: [{ label: "Open the Help Centre", href: "/help/" }]
  },
  {
    reason: "advice",
    pattern: /\b(legal advice|tax advice|accounting advice|what (?:tax|vat) (?:rate|should)|legally required|legal requirement|tax return)\b/i,
    answer: "Tallyo Helper cannot provide legal, tax or accounting advice. Use a suitably qualified professional or an official source for guidance specific to your circumstances.",
    links: [{ label: "See Tallyo's product boundaries", href: "/features/" }]
  },
  {
    reason: "internal",
    pattern: /\b(system prompt|hidden prompt|developer message|internal document|reveal (?:your|the) prompt|ignore (?:all |the )?(?:previous|prior|above) instructions?|prompt injection|jailbreak)\b/i,
    answer: "I can help only with reviewed public Tallyo product information. I cannot provide internal instructions or documents.",
    links: [{ label: "Browse public Tallyo guidance", href: "/help/" }]
  }
]);

export const noAnswer = Object.freeze({
  reason: "no-answer",
  answer: "I’m not quite sure what you mean yet, but I’d still like to help. Try asking about invoices, quotes, recurring invoices, reminders, payments or branding—or choose one of the guides below.",
  links: [{ label: "See what Tallyo can do", href: "/features/" }, { label: "Browse the Help Centre", href: "/help/" }]
});

const conversationReplies = Object.freeze([
  {
    reason: "conversation",
    pattern: /^(?:hi|hello|hey|hiya|good morning|good afternoon|good evening)(?: tallyo| there)?$/i,
    answer: "Hi! I’m happy to help you explore Tallyo. You can ask how recurring invoices work, what happens when a quote is accepted, how to record a deposit, or anything else about the product. What would you like to know?",
    links: [{ label: "See what Tallyo can do", href: "/features/" }, { label: "Browse popular questions", href: "/faq/" }]
  },
  {
    reason: "conversation",
    pattern: /^(?:thanks|thank you|thankyou|cheers|that helps|helpful)$/i,
    answer: "You’re welcome! If you’d like to know anything else about Tallyo, just ask.",
    links: []
  },
  {
    reason: "conversation",
    pattern: /^(?:that )?sounds? (?:good|great|helpful|interesting|useful)(?: to me)?$/i,
    answer: "I’m glad it sounds useful. You can ask me to explain any part of it, what happens next, or how another Tallyo feature works alongside it.",
    links: []
  },
  {
    reason: "conversation",
    pattern: /^(?:how are you|how are you doing|how is it going)$/i,
    answer: "I’m doing well, thank you—and I’m ready to help with anything you’d like to know about Tallyo.",
    links: []
  },
  {
    reason: "conversation",
    pattern: /^(?:bye|goodbye|see you|see you later)$/i,
    answer: "Thanks for visiting. If another Tallyo question comes up, I’ll be here to help.",
    links: []
  }
]);

export const findConversationalReply = (question) => {
  const normalised = normaliseQuestion(question);
  return conversationReplies.find((reply) => reply.pattern.test(normalised)) || null;
};

const retrievalStopWords = new Set([
  "a", "about", "an", "and", "are", "can", "do", "does", "for", "from", "how", "i", "in", "is", "it",
  "me", "my", "of", "on", "or", "that", "the", "this", "to", "tallyo", "what", "when", "where", "which",
  "who", "why", "with", "you", "your"
]);

const retrievalTokens = (value) => normaliseQuestion(value)
  .split(" ")
  .filter((token) => token.length >= 3 && !retrievalStopWords.has(token));

const retrievalText = (entry, field) => retrievalTokens(Array.isArray(entry?.[field])
  ? entry[field].join(" ")
  : entry?.[field]);

export const findRelevantHelperEntries = (knowledge, question, limit = 8) => {
  const entries = Array.isArray(knowledge?.entries) ? knowledge.entries : [];
  const queryTokens = [...new Set(retrievalTokens(question))];
  if (!queryTokens.length) return entries.filter((entry) => entry.essential).slice(0, limit);

  return entries.map((entry, index) => {
    const keywords = new Set(retrievalText(entry, "keywords"));
    const title = new Set(retrievalText(entry, "question"));
    const triggers = new Set(retrievalText(entry, "triggers"));
    const answer = new Set(retrievalText(entry, "answer"));
    const score = queryTokens.reduce((total, token) => total
      + (keywords.has(token) ? 8 : 0)
      + (title.has(token) ? 5 : 0)
      + (triggers.has(token) ? 4 : 0)
      + (answer.has(token) ? 1 : 0), entry.essential ? 1 : 0);
    return { entry, index, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(1, limit))
    .map(({ entry }) => entry);
};

export const findHelperBoundary = (question) => {
  const normalised = normaliseQuestion(question);
  return boundaryRules.find((rule) => rule.pattern.test(normalised)) || null;
};

export const findHelperAnswer = (knowledge, question, entryId = "") => {
  const entries = Array.isArray(knowledge?.entries) ? knowledge.entries : [];
  const normalised = normaliseQuestion(question);

  const boundary = findHelperBoundary(normalised);
  if (boundary) return boundary;

  const conversation = findConversationalReply(normalised);
  if (conversation) return conversation;

  if (entryId) {
    const selected = entries.find((entry) => entry.id === entryId);
    if (selected) return { ...selected, reason: "knowledge" };
  }

  const exact = entries.find((entry) => normaliseQuestion(entry.question) === normalised);
  if (exact) return { ...exact, reason: "knowledge" };

  const candidates = entries.flatMap((entry) => (entry.triggers || []).map((trigger) => ({
    entry,
    trigger: normaliseQuestion(trigger)
  }))).filter(({ trigger }) => trigger.length >= 8 && normalised.includes(trigger));

  candidates.sort((a, b) => b.trigger.length - a.trigger.length);
  if (candidates[0]) return { ...candidates[0].entry, reason: "knowledge" };

  return noAnswer;
};

export const createPublicAiAdapter = ({
  enabled = false,
  endpoint = "/api/helper",
  fetchImpl = globalThis.fetch,
  timeoutMs = 8_000
} = {}) => Object.freeze({
  enabled,
  provider: enabled ? "same-origin-server" : null,
  async answer(question, history = []) {
    if (!enabled) throw new Error("The future public AI adapter is disabled.");
    if (typeof fetchImpl !== "function") throw new Error("Tallyo Helper is unavailable.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: String(question || "").trim().slice(0, 240),
          history: Array.isArray(history) ? history.slice(-12) : []
        }),
        credentials: "same-origin",
        signal: controller.signal
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        // The caller receives a stable service state instead of provider detail.
      }
      if (!response.ok) {
        const error = new Error("Tallyo Helper is unavailable.");
        error.code = typeof payload?.code === "string" ? payload.code : "assistant_unavailable";
        error.publicAnswer = typeof payload?.answer === "string" ? payload.answer : "";
        error.publicLinks = Array.isArray(payload?.links) ? payload.links : [];
        throw error;
      }
      if (payload?.answered !== true || typeof payload.answer !== "string") {
        return {
          ...noAnswer,
          answer: typeof payload?.answer === "string" ? payload.answer : noAnswer.answer,
          links: Array.isArray(payload?.links) ? payload.links : noAnswer.links
        };
      }
      return {
        reason: "ai",
        answer: payload.answer,
        links: Array.isArray(payload.links) ? payload.links : []
      };
    } finally {
      clearTimeout(timeout);
    }
  }
});

export const futurePublicAiAdapter = Object.freeze({
  enabled: false,
  provider: null,
  async answer() {
    throw new Error("The future public AI adapter is disabled.");
  }
});
