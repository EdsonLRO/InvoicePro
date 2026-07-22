import { findHelperAnswer } from "/assets/helper-core.mjs";
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

  const ask = (question, entryId = "") => {
    const trimmed = question.trim().slice(0, 240);
    if (!trimmed) return;
    const reply = findHelperAnswer(knowledge, trimmed, entryId);
    if (reply.reason === "knowledge") trackEvent("helper_answer_found", { answer_key: reply.id });
    if (reply.reason === "no-answer") trackEvent("helper_answer_not_found");
    addMessage("user", reply.reason === "sensitive" ? "Sensitive information omitted" : trimmed);
    addMessage("assistant", reply.answer, reply.links || []);
    input.value = "";
    status.textContent = "Tallyo Helper answered using reviewed public guidance.";
    input.focus();
  };

  for (const entry of knowledge.entries || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "helper-suggestion";
    button.textContent = entry.question;
    button.addEventListener("click", () => ask(entry.question, entry.id));
    suggestions.append(button);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    ask(input.value);
  });

  reset.addEventListener("click", () => {
    conversation.replaceChildren();
    initialMessage();
    status.textContent = "Conversation cleared. Nothing was saved.";
    input.value = "";
    input.focus();
  });

  initialMessage();
}
