"use strict";

const periodBlocks = document.querySelectorAll(".period-block");
const periodDetails = document.getElementById("period-details");
const periodExplanation = document.getElementById("period-explanation");
const taxYearSelect = document.getElementById("tax-year");

const periodData = {
  "2017-2020": {
    years: ["2017", "2018", "2019", "2020"],
    explanation: `
      <strong>Oude berekeningsmethode + Wet rechtsherstel box 3</strong>
      <ul>
        <li>Check formele toegang: stond de aanslag al onherroepelijk vast op 24 december 2021 (Kerstarrest)</li>
        <li>Zo ja: geen toegang tot Wet rechtsherstel box 3</li>
        <li>Nog niet onherroepelijk: wel toegang tot Wet rechtsherstel box 3 + Tegenbewijsregeling</li>
      </ul>
      <p style="margin: 12px 0 4px;"><strong>Oude methode:</strong> Forfaitaire berekening van <u>totale</u> box 3 vermogen</p>
      <p style="margin: 12px 0 0;"><strong>Wet rechtsherstel box 3:</strong> onderscheid vermogen tussen spaargeld, beleggingen en andere bezittingen en schulden.</p>
    `
  },
  "2021-2022": {
    years: ["2021", "2022"],
    explanation: `
      <strong>Oude berekeningsmethode + Wet rechtsherstel box 3</strong>
      <ul>
        <li>Oude berekeningsmethode + Wet rechtsherstel box 3 vergelijken</li>
        <li>Meest gunstige voor belastingplichtige geldt</li>
        <li>Geen formele toets aan Kerstarrest</li>
        <li>Tegenbewijsregeling van toepassing</li>
      </ul>
    `
  },
  "2023-2024": {
    years: ["2023", "2024"],
    explanation: `
      <strong>Overbruggingswet</strong>
      <ul>
        <li>Per 1 januari 2023 Overbruggingswet, forfaitaire berekening de standaard</li>
        <li>Geen vergelijking meer met oude berekeningsmethode</li>
        <li>Vermogensverdeling op 1 januari. Rendement blijft fictief</li>
        <li>Tegenbewijsregeling van toepassing</li>
      </ul>
    `
  },
  "2025-2028": {
    years: ["2025", "2026"],
    explanation: `
      <strong>Overbruggingswet</strong>
      <ul>
        <li>Overbruggingswet van toepassing</li>
        <li>Tegenbewijs via aangifte mogelijk</li>
      </ul>
    `
  }
};

function updateYearOptions(period) {
  const years = periodData[period].years;
  
  // Clear existing options (keep placeholder)
  taxYearSelect.innerHTML = '<option value="" selected>Kies jaar...</option>';
  
  // Add year options
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    taxYearSelect.appendChild(option);
  });
}

function showPeriodDetails(period) {
  const data = periodData[period];
  periodExplanation.innerHTML = data.explanation;
  periodDetails.hidden = false;
  
  // Update year dropdown
  updateYearOptions(period);
  taxYearSelect.value = "";
  
  // Scroll to details
  periodDetails.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hidePeriodDetails() {
  periodDetails.hidden = true;
  taxYearSelect.innerHTML = '<option value="" selected>Kies jaar...</option>';
  taxYearSelect.value = "";
}

// Event listeners for period blocks
periodBlocks.forEach(block => {
  block.addEventListener("click", () => {
    const period = block.dataset.period;
    const isExpanded = block.getAttribute("aria-expanded") === "true";
    
    // Close all blocks
    periodBlocks.forEach(b => {
      b.setAttribute("aria-expanded", "false");
    });
    
    if (!isExpanded) {
      // Open clicked block
      block.setAttribute("aria-expanded", "true");
      showPeriodDetails(period);
    } else {
      // Close clicked block
      hidePeriodDetails();
    }
  });
});

// When year is selected, trigger the normal flow
taxYearSelect.addEventListener("change", () => {
  const event = new Event("change", { bubbles: true });
  taxYearSelect.dispatchEvent(event);
});
