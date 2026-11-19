"use strict";

// Snelle keuze voor 2017-2020: wel of geen toegang tot de Wet rechtsherstel box 3.
// Een keuze gaat voor de uitkomst van de uitgebreide formele beoordeling; leeg
// laten = de uitgebreide beoordeling bepaalt de toegang.
//   Geen toegang: alleen de oude methode, geen Wet rechtsherstel en geen
//                 tegenbewijsregeling.
//   Wel toegang:  oude methode en Wet rechtsherstel vergelijken (laagste geldt) en
//                 de tegenbewijsregeling is van toepassing.

const QUICK_ACCESS_STORAGE_KEY = "box3-snelle-toegang-v1";

function readQuickAccessMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUICK_ACCESS_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// "yes", "no" of "" (geen snelle keuze).
function getQuickAccess(year) {
  const numericYear = Number(year);
  if (!(numericYear >= 2017 && numericYear <= 2020)) return "";
  const value = readQuickAccessMap()[year];
  return value === "yes" || value === "no" ? value : "";
}

function saveQuickAccess(year, value) {
  const map = readQuickAccessMap();
  if (value) map[year] = value;
  else delete map[year];
  try {
    localStorage.setItem(QUICK_ACCESS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Opslag niet beschikbaar: de keuze geldt alleen tot herladen.
  }
}

function restoreQuickAccess() {
  const value = getQuickAccess(yearSelect.value);
  for (const input of document.querySelectorAll('input[name="quick-access"]')) {
    input.checked = input.value === value;
  }
  const clear = document.querySelector("#quick-access-clear");
  if (clear) clear.hidden = !value;
}

function applyQuickAccess(value) {
  const year = yearSelect.value;
  if (!getQuickAccess(year) && !value && !year) return;
  saveQuickAccess(year, value);
  restoreQuickAccess();
  // Formele beoordeling en berekening opnieuw opbouwen met de nieuwe toegang.
  renderPreliminary();
}

document.querySelectorAll('input[name="quick-access"]').forEach((input) => {
  input.addEventListener("change", () => applyQuickAccess(input.value));
});
document.querySelector("#quick-access-clear")?.addEventListener("click", () => applyQuickAccess(""));
yearSelect.addEventListener("change", restoreQuickAccess);
