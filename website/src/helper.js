import { createPublicAiAdapter, findHelperAnswer } from "/assets/helper-core.mjs";
import { trackEvent } from "/assets/growth.js";

const root = document.querySelector("[data-helper]");
const knowledgeElement = document.getElementById("helper-knowledge");

if (root && knowledgeElement) {
  const knowledge = JSON.parse(knowledgeElement.textContent || "{}");
  const form = root.querySelector("[data-helper-form]");
  const input = root.querySelector("[data-helper-input]");
  const conversation = root.querySelector("[data-helper-conversation]");
  const suggestions = root.querySelector("[data-helper-suggestions]");
  const reset = root.querySelector("[data-helper-reset]");
  const status = root.querySelector("[data-helper-status]");
  const submit = form.querySelector('button[type="submit"]');
  const aiAdapter = createPublicAiAdapter({ enabled: root.dataset.aiEnabled === "true" });
  let requestSequence = 0;

  const resolveHref = (href) => {
    if (href === "app:signup") return document.querySelector("[data-signup-link]")?.href || "/";
    if (href === "app:login") return document.querySelector("[data-login-link]")?.href || "/";
    return href;
  };

  const addMessage = (speaker, text, links = []) => {
    const item = document.createElement("li");
    item.className = `helper-message helper-message-${speaker}`;
    const label = document.createElement("strong");
    label.textContent = speaker === "user" ? "You" : "Tallyo Helper";
    const copy = document.createElement("p");
    copy.textContent = text;
    item.append(label, copy);

    if (links.length) {
      const linkList = document.createElement("div");
      linkList.className = "helper-links";
      for (const link of links) {
        const anchor = document.createElement("a");
        anchor.href = resolveHref(link.href);
        anchor.textContent = link.label;
        linkList.append(anchor);
      }
      item.append(linkList);
    }

    conversation.append(item);
    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const initialMessage = () => addMessage(
    "assistant",
    "Ask a general question about Tallyo. I use reviewed public guidance and cannot see accounts or business records.",
    [{ label: "Browse the Help Centre", href: "/help/" }]
  );

  const ask = async (question, entryId = "") => {
    const trimmed = question.trim().slice(0, 240);
    if (!trimmed) return;
    const sequence = ++requestSequence;
    let reply = findHelperAnswer(knowledge, trimmed, entryId);
    if (reply.reason === "knowledge") trackEvent("helper_answer_found", { answer_key: reply.id });
    addMessage("user", reply.reason === "sensitive" ? "Sensitive information omitted" : trimmed);
    input.value = "";
    if (reply.reason === "no-answer" && aiAdapter.enabled) {
      status.textContent = "Tallyo Helper is checking reviewed public guidance.";
      submit.disabled = true;
      form.setAttribute("aria-busy", "true");
      try {
        reply = await aiAdapter.answer(trimmed) || reply;
      } catch {
        reply = findHelperAnswer(knowledge, "");
      } finally {
        submit.disabled = false;
        form.removeAttribute("aria-busy");
      }
    }
    if (sequence !== requestSequence) return;
    if (reply.reason === "no-answer") trackEvent("helper_answer_not_found");
    addMessage("assistant", reply.answer, reply.links || []);
    status.textContent = reply.reason === "ai"
      ? "Tallyo Helper answered from reviewed public guidance."
      : "Tallyo Helper answered using its reviewed guide.";
    input.focus();
  };

  for (const entry of knowledge.entries || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "helper-suggestion";
    button.textContent = entry.question;
    button.addEventListener("click", () => void ask(entry.question, entry.id));
    suggestions.append(button);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void ask(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    void ask(input.value);
  });

  reset.addEventListener("click", () => {
    requestSequence += 1;
    conversation.replaceChildren();
    initialMessage();
    status.textContent = "Conversation cleared. Nothing was saved.";
    input.value = "";
    input.focus();
  });

  initialMessage();
}
