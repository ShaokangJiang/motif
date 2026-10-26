"use strict";

// Resource links and reference copying. Interactive results live in charts.js;
// original paper figures remain available as PDF links and noscript fallbacks.
const config = window.MOTIF_CONFIG || {};
let availableResources = 0;
for (const [key, id, label] of [
  ["paperUrl", "paper-resource", "Paper"],
  ["codeUrl", "code-resource", "Code"],
]) {
  if (!config[key]) continue;
  try {
    const url = new URL(config[key]);
    if (!["https:", "http:"].includes(url.protocol)) continue;
    const link = document.getElementById(id);
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.querySelector("[data-resource-label]").textContent = label;
    availableResources++;
  } catch { /* Leave unconfigured or invalid links marked coming soon. */ }
}
if (availableResources === 2) {
  document.getElementById("resources").textContent = "Paper and source code are available through the links above.";
} else if (availableResources === 1) {
  document.getElementById("resources").textContent = "Additional research resources will be linked as they become available.";
}

document.getElementById("copy-reference").addEventListener("click", async () => {
  const text = document.getElementById("reference-text").textContent;
  const status = document.getElementById("copy-status");
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      document.getElementById("copy-reference").focus();
      if (!copied) throw new Error("Copy unavailable");
    }
    status.textContent = "Copied.";
  } catch {
    status.textContent = "Select the reference text above to copy it.";
  }
});
