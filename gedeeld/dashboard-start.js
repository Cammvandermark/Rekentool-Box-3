"use strict";

// Werkvolgorde: invoer (A, met A.1 en A.2) en het verslag (B) staan open; de
// formele beoordeling blijft ingeklapt.
function openWorkingPanels() {
  for (const selector of [".asset-disclosure", "#assets-start-disclosure", "#assets-actual-return-disclosure", ".report-panel .calculation-disclosure"]) {
    const details = document.querySelector(selector);
    if (details) details.open = true;
  }
}

const initialYear = new URLSearchParams(window.location.search).get("year") || "";
const initialYearRestored = initialYear !== "" && restorePeriodForYear(initialYear);
if (!initialYearRestored) yearSelect.value = "";
loadPreliminaryAnswers();
yearSelect.addEventListener("change", () => {
  const url = new URL(window.location.href);
  if (yearSelect.value) url.searchParams.set("year", yearSelect.value);
  else url.searchParams.delete("year");
  window.history.replaceState({}, "", url);
  status.hidden = true;
  renderPreliminary();
  renderTotal();
  openWorkingPanels();
});

renderTotal();
renderPreliminary();

initializeFormalAssessment();
initializeCalculationInputs();

window.addEventListener("storage", (event) => {
  if (
    event.key === null ||
    event.key === `${STORAGE_KEY}:${yearSelect.value}`
  ) {
    renderTotal();
  }
  if (
    event.key === null ||
    event.key === `${CALCULATION_STORAGE_KEY}:${yearSelect.value}`
  ) {
    loadedCalculationYear = "";
    loadCalculationInputs(yearSelect.value);
    renderCalculation();
  }
  if (
    event.key === null ||
    event.key === `${OTHER_ASSETS_STORAGE_KEY}:${yearSelect.value}` ||
    event.key === `${DEBTS_STORAGE_KEY}:${yearSelect.value}`
  ) {
    renderCalculation();
  }
});

// Terug van een detailpagina: toon het gekozen jaar met de vermogensgegevens open.
if (initialYearRestored) {
  yearSelect.dispatchEvent(new Event("change"));
  openWorkingPanels();
  document.querySelector("#calculation-section")?.scrollIntoView({ block: "start" });
}
