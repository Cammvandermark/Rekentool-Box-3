"use strict";

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
});

bankLink.addEventListener("click", (event) => {
  if (!yearSelect.value) {
    event.preventDefault();
    status.hidden = false;
    status.textContent = "Selecteer eerst een belastingjaar.";
  }
});

otherAssetsLink.addEventListener("click", (event) => {
  if (!yearSelect.value) {
    event.preventDefault();
    calculationError.hidden = false;
    calculationError.textContent = "Selecteer eerst een belastingjaar.";
  }
});

debtsLink.addEventListener("click", (event) => {
  if (!yearSelect.value) {
    event.preventDefault();
    calculationError.hidden = false;
    calculationError.textContent = "Selecteer eerst een belastingjaar.";
  }
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
  const assetDisclosure = document.querySelector(".asset-disclosure");
  if (assetDisclosure) assetDisclosure.open = true;
  const startDisclosure = document.querySelector("#assets-start-disclosure");
  if (startDisclosure) startDisclosure.open = true;
  document.querySelector("#calculation-section")?.scrollIntoView({ block: "start" });
}
