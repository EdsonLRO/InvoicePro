export const normaliseQuestion = (value) => String(value || "")
  .toLocaleLowerCase("en-GB")
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9£\s-]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 240);

const boundaryRules = Object.freeze([
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
    pattern: /\b(system prompt|hidden prompt|developer message|internal document|reveal (?:your|the) prompt)\b/i,
    answer: "I can help only with reviewed public Tallyo product information. I cannot provide internal instructions or documents.",
    links: [{ label: "Browse public Tallyo guidance", href: "/help/" }]
  }
]);

export const noAnswer = Object.freeze({
  reason: "no-answer",
  answer: "I do not have a reviewed answer for that. Try one of the suggested questions or use the Help Centre. I will not guess about Tallyo features or your account.",
  links: [{ label: "Open the Help Centre", href: "/help/" }, { label: "Read common questions", href: "/faq/" }]
});

export const findHelperAnswer = (knowledge, question, entryId = "") => {
  const entries = Array.isArray(knowledge?.entries) ? knowledge.entries : [];
  const normalised = normaliseQuestion(question);

  for (const rule of boundaryRules) {
    if (rule.pattern.test(normalised)) return rule;
  }

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

export const futurePublicAiAdapter = Object.freeze({
  enabled: false,
  provider: null,
  async answer() {
    throw new Error("The future public AI adapter is disabled.");
  }
});
