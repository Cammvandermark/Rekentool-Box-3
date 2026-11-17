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
  
  // HIDE all preliminary panels when switching to a new period (before year is selected)
  const preliminaryPanel = document.getElementById("preliminary-panel");
  if (preliminaryPanel) {
    preliminaryPanel.hidden = true;
  }
  
  const modernPreliminaryPanel = document.getElementById("modern-preliminary-panel");
  if (modernPreliminaryPanel) {
    modernPreliminaryPanel.hidden = true;
  }
  
  const overbrugging2023Panel = document.getElementById("overbrugging-preliminary-panel-2023");
  if (overbrugging2023Panel) {
    overbrugging2023Panel.hidden = true;
  }
  
  const overbrugging2025Panel = document.getElementById("overbrugging-preliminary-panel-2025");
  if (overbrugging2025Panel) {
    overbrugging2025Panel.hidden = true;
  }
  
  const calculationSection = document.getElementById("calculation-section");
  if (calculationSection) {
    calculationSection.hidden = true;
  }
  
  // CLOSE any open <details> elements to hide their content
  const assessmentDetails = document.querySelectorAll(".assessment-disclosure");
  assessmentDetails.forEach(details => {
    if (details && details.open) {
      details.open = false;
    }
  });
  
  const assetDetails = document.querySelector(".asset-disclosure");
  if (assetDetails && assetDetails.open) {
    assetDetails.open = false;
  }
  
  const calculationDetails = document.querySelector(".calculation-disclosure");
  if (calculationDetails && calculationDetails.open) {
    calculationDetails.open = false;
  }
  
  const preliminaryHeadingWithYear = document.getElementById("preliminary-heading-with-year");
  if (preliminaryHeadingWithYear) {
    preliminaryHeadingWithYear.hidden = true;
  }

  const overbruggingHeading2023 = document.getElementById("overbrugging-heading-with-year-2023");
  if (overbruggingHeading2023) {
    overbruggingHeading2023.hidden = true;
  }

  const overbruggingHeading2025 = document.getElementById("overbrugging-heading-with-year-2025");
  if (overbruggingHeading2025) {
    overbruggingHeading2025.hidden = true;
  }
  
  const materieleHeading = document.getElementById("materiele-heading");
  if (materieleHeading) {
    materieleHeading.hidden = true;
  }
  
  // Scroll to details
  periodDetails.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Opent de periode waar het jaar onder valt en vult de jaarlijst, zodat een
// link als index.html?year=2025 direct naar dat jaar terugkeert.
function restorePeriodForYear(year) {
  const period = Object.keys(periodData).find((key) => periodData[key].years.includes(year));
  if (!period) return false;
  periodBlocks.forEach((block) => {
    block.setAttribute("aria-expanded", String(block.dataset.period === period));
  });
  showPeriodDetails(period);
  taxYearSelect.value = year;
  return taxYearSelect.value === year;
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

// When year is selected, show the main content
taxYearSelect.addEventListener("change", () => {
  if (taxYearSelect.value) {
    const year = taxYearSelect.value;
    
    // Determine which panels to show based on year
    const preliminaryPanel = document.getElementById("preliminary-panel");
    const modernPreliminaryPanel = document.getElementById("modern-preliminary-panel");
    const overbrugging2023Panel = document.getElementById("overbrugging-preliminary-panel-2023");
    const overbrugging2025Panel = document.getElementById("overbrugging-preliminary-panel-2025");

    // Hide all panels AND their corresponding heading elements first
    if (preliminaryPanel) preliminaryPanel.hidden = true;
    if (modernPreliminaryPanel) modernPreliminaryPanel.hidden = true;
    if (overbrugging2023Panel) overbrugging2023Panel.hidden = true;
    if (overbrugging2025Panel) overbrugging2025Panel.hidden = true;

    const preliminaryHeadingWithYear = document.getElementById("preliminary-heading-with-year");
    const overbruggingHeading2023 = document.getElementById("overbrugging-heading-with-year-2023");
    const overbruggingHeading2025 = document.getElementById("overbrugging-heading-with-year-2025");
    
    if (preliminaryHeadingWithYear) preliminaryHeadingWithYear.hidden = true;
    if (overbruggingHeading2023) overbruggingHeading2023.hidden = true;
    if (overbruggingHeading2025) overbruggingHeading2025.hidden = true;
    
    // Show the appropriate panel AND its heading based on year
    if (["2017", "2018", "2019", "2020"].includes(year)) {
      if (preliminaryPanel) preliminaryPanel.hidden = false;
      if (preliminaryHeadingWithYear) preliminaryHeadingWithYear.hidden = false;
    } else if (["2021", "2022"].includes(year)) {
      if (modernPreliminaryPanel) modernPreliminaryPanel.hidden = false;
      if (preliminaryHeadingWithYear) preliminaryHeadingWithYear.hidden = false;
    } else if (["2023", "2024"].includes(year)) {
      if (overbrugging2023Panel) overbrugging2023Panel.hidden = false;
      if (overbruggingHeading2023) overbruggingHeading2023.hidden = false;
    } else if (["2025", "2026"].includes(year)) {
      if (overbrugging2025Panel) overbrugging2025Panel.hidden = false;
      if (overbruggingHeading2025) overbruggingHeading2025.hidden = false;
    }
    
    // SHOW calculation section
    const calculationSection = document.getElementById("calculation-section");
    if (calculationSection) {
      calculationSection.hidden = false;
    }
    
    // Update h2 titles OUTSIDE the panels (with year)
    // Only show the title that corresponds to the selected year's panel
    if (["2017", "2018", "2019", "2020"].includes(year)) {
      if (preliminaryHeadingWithYear) {
        preliminaryHeadingWithYear.hidden = false;
        preliminaryHeadingWithYear.textContent = `Formele beoordeling ${year}`;
      }
    } else if (["2021", "2022"].includes(year)) {
      if (preliminaryHeadingWithYear) {
        preliminaryHeadingWithYear.hidden = false;
        preliminaryHeadingWithYear.textContent = `Formele beoordeling ${year}`;
      }
    } else if (["2023", "2024"].includes(year)) {
      if (overbruggingHeading2023) {
        overbruggingHeading2023.hidden = false;
        overbruggingHeading2023.textContent = `Formele beoordeling ${year}`;
      }
    } else if (["2025", "2026"].includes(year)) {
      if (overbruggingHeading2025) {
        overbruggingHeading2025.hidden = false;
        overbruggingHeading2025.textContent = `Formele beoordeling ${year}`;
      }
    }
    
    // Show and update the materiele beoordeling section heading
    const materieleHeading = document.getElementById("materiele-heading");
    if (materieleHeading) {
      materieleHeading.hidden = false;
      materieleHeading.textContent = `Materiële beoordeling ${year}`;
    }
    
    // Update all panel titles (without year)
    const preliminaryTitle = document.getElementById("preliminary-title");
    if (preliminaryTitle) {
      preliminaryTitle.textContent = "Formele beoordeling";
    }
    
    const modernPreliminaryTitle = document.getElementById("modern-preliminary-title");
    if (modernPreliminaryTitle) {
      modernPreliminaryTitle.textContent = "Formele beoordeling";
    }
    
    const overbruggingTitle2023 = document.getElementById("overbrugging-preliminary-title-2023");
    if (overbruggingTitle2023) {
      overbruggingTitle2023.textContent = "Formele beoordeling";
    }
    
    const overbruggingTitle2025 = document.getElementById("overbrugging-preliminary-title-2025");
    if (overbruggingTitle2025) {
      overbruggingTitle2025.textContent = "Formele beoordeling";
    }
    
    const calculationInputTitle = document.getElementById("calculation-input-title");
    if (calculationInputTitle) {
      calculationInputTitle.textContent = "A. Vermogensgegevens";
    }
    
    // Hide the year indicators in the panel-index spans
    const preliminaryYear = document.getElementById("preliminary-year");
    if (preliminaryYear) {
      preliminaryYear.hidden = true;
    }
    
    const modernPreliminaryYear = document.getElementById("modern-preliminary-year");
    if (modernPreliminaryYear) {
      modernPreliminaryYear.hidden = true;
    }
    
    const overbruggingYear2023 = document.getElementById("overbrugging-preliminary-year-2023");
    if (overbruggingYear2023) {
      overbruggingYear2023.hidden = true;
    }
    
    const overbruggingYear2025 = document.getElementById("overbrugging-preliminary-year-2025");
    if (overbruggingYear2025) {
      overbruggingYear2025.hidden = true;
    }
    
    const calculationYear = document.getElementById("calculation-year");
    if (calculationYear) {
      calculationYear.hidden = true;
    }
  } else {
    // When year is cleared (selecting "Kies jaar..."), hide content
    const preliminaryPanel = document.getElementById("preliminary-panel");
    if (preliminaryPanel) {
      preliminaryPanel.hidden = true;
    }
    
    const modernPreliminaryPanel = document.getElementById("modern-preliminary-panel");
    if (modernPreliminaryPanel) {
      modernPreliminaryPanel.hidden = true;
    }
    
    const overbrugging2023Panel = document.getElementById("overbrugging-preliminary-panel-2023");
    if (overbrugging2023Panel) {
      overbrugging2023Panel.hidden = true;
    }
    
    const overbrugging2025Panel = document.getElementById("overbrugging-preliminary-panel-2025");
    if (overbrugging2025Panel) {
      overbrugging2025Panel.hidden = true;
    }
    
    const calculationSection = document.getElementById("calculation-section");
    if (calculationSection) {
      calculationSection.hidden = true;
    }
    
    const preliminaryHeadingWithYear = document.getElementById("preliminary-heading-with-year");
    if (preliminaryHeadingWithYear) {
      preliminaryHeadingWithYear.hidden = true;
    }

    const overbruggingHeading2023 = document.getElementById("overbrugging-heading-with-year-2023");
    if (overbruggingHeading2023) {
      overbruggingHeading2023.hidden = true;
    }

    const overbruggingHeading2025 = document.getElementById("overbrugging-heading-with-year-2025");
    if (overbruggingHeading2025) {
      overbruggingHeading2025.hidden = true;
    }
    
    const materieleHeading = document.getElementById("materiele-heading");
    if (materieleHeading) {
      materieleHeading.hidden = true;
    }
  }
});
