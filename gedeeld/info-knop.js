"use strict";

// Informatieknopje (i): toont of verbergt de toelichting waarnaar het verwijst
// (aria-controls). Staat het knopje in de titel van een inklapbaar onderdeel,
// dan klapt een klik het onderdeel niet dicht; een dicht onderdeel gaat open.

function createInfoButton(targetId, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "info-button";
  button.textContent = "i";
  button.setAttribute("aria-controls", targetId);
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", label);
  button.title = label;
  return button;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest?.(".info-button");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const target = document.getElementById(button.getAttribute("aria-controls"));
  if (!target) return;
  const details = button.closest("summary")?.parentElement;
  if (details && details.tagName === "DETAILS" && !details.open) {
    details.open = true;
    target.hidden = false;
  } else {
    target.hidden = !target.hidden;
  }
  button.setAttribute("aria-expanded", String(!target.hidden));
});
