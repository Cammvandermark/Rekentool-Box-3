"use strict";

function initializeCalculationInputs() {
  for (const input of [partnerAllocation]) {
    input.addEventListener("input", updateCalculationInputs);
    input.addEventListener("change", updateCalculationInputs);
  }
  for (const input of fiscalPartnerQuestion) {
    input.addEventListener("change", updateCalculationInputs);
  }
}

const calculationYear = document.querySelector("#calculation-year");
const otherAssetsTotal = document.querySelector("#other-assets-total");
const debtsTotal = document.querySelector("#debts-total");
const fiscalPartnerQuestion = document.querySelectorAll(
  'input[name="calculation-fiscal-partner"]',
);
const partnerAllocationField = document.querySelector("#partner-allocation-field");
const partnerAllocation = document.querySelector("#partner-allocation");
const partnerAllocationSummary = document.querySelector("#partner-allocation-summary");
const calculationError = document.querySelector("#calculation-error");
const comparisonResult = document.querySelector("#comparison-result");
const comparisonDifference = document.querySelector("#comparison-difference");
const oldCalculationPanel = document.querySelector("#old-calculation-panel");
const calculationResultsGrid = document.querySelector(".calculation-results-grid");
const comparisonPanel = document.querySelector("#comparison-panel");
const calculationRoundingNote = document.querySelector("#calculation-rounding-note");
const overbruggingswetNote = document.querySelector("#overbruggingswet-note");
const calculationOutputIds = [
  "old-assets",
  "old-deductible-debts",
  "old-net-assets",
  "old-exemption",
  "old-taxable-base",
  "old-allocation",
  "old-tier-1",
  "old-tier-2",
  "old-tier-3",
  "old-tier-1-calculation",
  "old-tier-2-calculation",
  "old-tier-3-calculation",
  "old-income",
  "old-tax",
  "relief-assets",
  "relief-bank-assets",
  "relief-other-assets",
  "relief-deductible-debts",
  "relief-net-assets",
  "relief-exemption",
  "relief-taxable-base",
  "relief-allocation",
  "relief-savings-return",
  "relief-investment-return",
  "relief-debt-return",
  "relief-total-return",
  "relief-yield-rate",
  "relief-income",
  "relief-tax",
  "relief-savings-return-explanation",
  "relief-investment-return-explanation",
  "relief-debt-return-explanation",
  "relief-yield-rate-explanation",
  "relief-income-explanation",
  "comparison-old-income",
  "comparison-relief-income",
  "comparison-old-tax",
  "comparison-relief-tax",
  "comparison-difference",
];
let loadedCalculationYear = "";
let calculationStorageError = false;

function roundToTwoDecimals(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundToDecimals(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function formatCalculationEuro(value) {
  return euro.format(value);
}

function formatCalculationEuroWhole(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Weergave zoals op de aanslag: box 3-inkomen per persoon in hele euro's naar
// beneden, belasting = tarief × afgerond inkomen, ook naar beneden. Alleen voor
// weergave; de berekening zelf blijft in centen.
function assessmentIncome(incomes) {
  return incomes.reduce((sum, income) => sum + Math.floor(Math.max(0, income) + 1e-9), 0);
}

function assessmentTax(incomes, taxRate) {
  return incomes.reduce(
    (sum, income) => sum + Math.floor(Math.floor(Math.max(0, income) + 1e-9) * taxRate / 100 + 1e-9),
    0,
  );
}

function formatWithAssessment(value, wholeValue) {
  return `${formatCalculationEuro(value)} (aanslag: ${formatCalculationEuroWhole(wholeValue)})`;
}

function formatCalculationRate(value) {
  return `${percentage.format(value)}%`;
}

function formatOldYieldRate(value) {
  return `${new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)}%`;
}

function setCalculationText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function showCalculationError(message) {
  calculationError.hidden = !message;
  calculationError.textContent = message;
  for (const id of calculationOutputIds) {
    setCalculationText(id, "—");
  }
  comparisonResult.className = "comparison-result";
  comparisonResult.textContent =
    "Controleer de invoer om de berekeningen te kunnen vergelijken.";
  document.querySelector("#old-tax").classList.remove("is-favorable");
  document.querySelector("#relief-tax").classList.remove("is-favorable");
  document.querySelector("#comparison-old-tax").classList.remove("is-favorable");
  document.querySelector("#comparison-relief-tax").classList.remove("is-favorable");
}

function getBankTotal(year) {
  const stored = localStorage.getItem(`${STORAGE_KEY}:${year}`);
  const accounts = stored === null ? [] : JSON.parse(stored);
  if (
    !Array.isArray(accounts) ||
    accounts.some((account) =>
      typeof account.balance !== "number" ||
      !Number.isFinite(account.balance) ||
      account.balance < 0
    )
  ) {
    throw new Error("De opgeslagen banktegoeden zijn ongeldig. Controleer de rekeninggegevens.");
  }
  return roundToTwoDecimals(
    accounts.reduce((sum, account) => sum + account.balance, 0),
  );
}

function getBankCashTotal(year) {
  const stored = localStorage.getItem(`${STORAGE_KEY}:${year}`);
  const accounts = stored === null ? [] : JSON.parse(stored);
  if (!Array.isArray(accounts)) return 0;
  return roundToTwoDecimals(
    accounts
      .filter((account) => account.kind === "cash")
      .reduce((sum, account) => sum + account.balance, 0),
  );
}

function getDebtsTotal(year) {
  const stored = localStorage.getItem(`${DEBTS_STORAGE_KEY}:${year}`);
  if (stored !== null) {
    const debts = JSON.parse(stored);
    if (
      !Array.isArray(debts) ||
      debts.some((debt) =>
        typeof debt.value !== "number" ||
        !Number.isFinite(debt.value) ||
        debt.value < 0
      )
    ) {
      throw new Error("De opgeslagen schulden zijn ongeldig. Controleer de schulden.");
    }
    return roundToTwoDecimals(debts.reduce((sum, debt) => sum + debt.value, 0));
  }
  // Eerder ingevoerd totaalbedrag (van vóór de pagina Schulden).
  const legacyStored = localStorage.getItem(`${CALCULATION_STORAGE_KEY}:${year}`);
  if (legacyStored === null) return 0;
  const legacyValue = Number(JSON.parse(legacyStored)?.debts || 0);
  if (!Number.isFinite(legacyValue) || legacyValue < 0) {
    throw new Error("De eerder opgeslagen schulden zijn ongeldig.");
  }
  return roundToTwoDecimals(legacyValue);
}

function getOtherAssets(year) {
  const storedAssets = localStorage.getItem(`${OTHER_ASSETS_STORAGE_KEY}:${year}`);
  if (storedAssets !== null) {
    const assets = JSON.parse(storedAssets);
    if (
      !Array.isArray(assets) ||
      assets.some((asset) =>
        typeof asset.id !== "string" ||
        typeof asset.name !== "string" ||
        ![
          "", // nog geen soort gekozen: telt als overige bezitting
          "securities",
          "claims",
          "cash",
          "second-home",
          "real-estate",
          "capital-insurance",
          "periodic-rights",
          "usufruct",
          "movable-property",
          "crypto",
          "crowdfunding",
          "benefit-repayment",
          "other",
        ].includes(asset.type) ||
        typeof asset.value !== "number" ||
        !Number.isFinite(asset.value) ||
        asset.value < 0
      )
    ) {
      throw new Error("De opgeslagen overige bezittingen zijn ongeldig. Controleer de bezittingen.");
    }
    return {
      total: roundToTwoDecimals(
        assets.reduce((sum, asset) => sum + asset.value, 0),
      ),
      cash: roundToTwoDecimals(
        assets
          .filter((asset) => asset.type === "cash")
          .reduce((sum, asset) => sum + asset.value, 0),
      ),
    };
  }

  const legacyStored = localStorage.getItem(`${CALCULATION_STORAGE_KEY}:${year}`);
  if (legacyStored === null) return { total: 0, cash: 0 };
  const legacyInputs = JSON.parse(legacyStored);
  if (
    typeof legacyInputs !== "object" ||
    legacyInputs === null ||
    Array.isArray(legacyInputs) ||
    typeof legacyInputs.investments !== "string"
  ) {
    throw new Error("De opgeslagen overige bezittingen hebben een ongeldig formaat.");
  }
  const legacyValue = Number(legacyInputs.investments);
  if (!Number.isFinite(legacyValue) || legacyValue < 0) {
    throw new Error("De opgeslagen overige bezittingen zijn ongeldig.");
  }
  return { total: roundToTwoDecimals(legacyValue), cash: 0 };
}

function loadCalculationInputs(year) {
  if (loadedCalculationYear === year) return;
  loadedCalculationYear = year;
  calculationStorageError = false;
  otherAssetsTotal.textContent = euro.format(0);
  debtsTotal.textContent = euro.format(0);
  partnerAllocation.value = "50";
  restoreAnswer("calculation-fiscal-partner", "no");
  calculationError.hidden = true;
  if (!year) return;

  try {
    const stored = localStorage.getItem(`${CALCULATION_STORAGE_KEY}:${year}`);
    if (stored === null) return;
    const parsed = JSON.parse(stored);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      typeof parsed.investments !== "string" ||
      !["yes", "no"].includes(parsed.fiscalPartner) ||
      typeof parsed.partnerAllocation !== "string"
    ) {
      throw new Error("De opgeslagen vermogensgegevens hebben een ongeldig formaat.");
    }
    partnerAllocation.value = parsed.partnerAllocation;
    restoreAnswer("calculation-fiscal-partner", parsed.fiscalPartner);
  } catch (error) {
    calculationStorageError = true;
    showCalculationError(`Vermogensgegevens konden niet worden geladen: ${error.message}`);
  }
  updatePartnerAllocation();
}

function saveCalculationInputs(year, fiscalPartner) {
  try {
    const investments = getOtherAssets(year).total;
    localStorage.setItem(
      `${CALCULATION_STORAGE_KEY}:${year}`,
      JSON.stringify({
        investments: String(investments),
        debts: String(getDebtsTotal(year)),
        fiscalPartner,
        partnerAllocation: partnerAllocation.value,
      }),
    );
    calculationStorageError = false;
    return true;
  } catch (error) {
    showCalculationError(`Vermogensgegevens konden niet worden opgeslagen: ${error.message}`);
    return false;
  }
}

function updatePartnerAllocation() {
  const partnered = selectedAnswer("calculation-fiscal-partner") === "yes";
  partnerAllocationField.hidden = !partnered;
  const share = Number(partnerAllocation.value);
  partnerAllocationSummary.textContent =
    `Partner: ${Number.isFinite(share) ? 100 - share : "—"}%`;
}

function renderCalculation() {
  const year = yearSelect.value;
  const data = BOX3_YEAR_DATA[year];
  if (calculationSection.hidden || !data || calculationStorageError) return;
  const yearUsesOldMethodComparison = Number(year) <= 2022;
  calculationYear.textContent = year;
  document.querySelector("#old-calculation-year").textContent = year;
  document.querySelector("#relief-calculation-year").textContent = year;
  oldCalculationPanel.hidden = !yearUsesOldMethodComparison;
  comparisonPanel.hidden = !yearUsesOldMethodComparison;
  calculationResultsGrid.classList.toggle(
    "is-single-column",
    !yearUsesOldMethodComparison,
  );
  document.querySelector("#relief-calculation-title").textContent =
    yearUsesOldMethodComparison
      ? "B. Wet rechtsherstel box 3"
      : "Overbruggingswet box 3";
  document.querySelector("#relief-calculation-eyebrow").textContent =
    yearUsesOldMethodComparison ? "BEREKENING B" : "BEREKENING";
  calculationRoundingNote.hidden = !yearUsesOldMethodComparison;
  overbruggingswetNote.hidden = yearUsesOldMethodComparison;
  document.querySelector("#relief-tax-label").textContent =
    `Box 3-belasting ${yearUsesOldMethodComparison ? "Wet rechtsherstel" : "Overbruggingswet"} (${data.taxRate}%)`;
  updatePartnerAllocation();

  try {
    const otherAssets = getOtherAssets(year);
    otherAssetsTotal.textContent = euro.format(otherAssets.total);
    const { bank, investments, cashInBank } = splitAssetCategories({
      bankTotal: getBankTotal(year),
      otherAssetsTotal: otherAssets.total,
      cashTotal: otherAssets.cash,
      year,
    });
    const debts = getDebtsTotal(year);
    debtsTotal.textContent = euro.format(debts);
    const fiscalPartner = selectedAnswer("calculation-fiscal-partner") === "yes";
    const allocationPercent = fiscalPartner
      ? Number(partnerAllocation.value)
      : 100;
    const householdCount = fiscalPartner ? 2 : 1;
    document.querySelector("#relief-deductible-debts-label").textContent =
      `Af: Aftrekbare schulden na drempel (${formatCalculationEuroWhole(data.debtThreshold * householdCount)})`;
    if (
      fiscalPartner &&
      (partnerAllocation.value === "" ||
        !Number.isInteger(allocationPercent) ||
        allocationPercent < 0 ||
        allocationPercent > 100)
    ) {
      throw new Error("Vul voor de verdeling een heel percentage van 0 tot en met 100 in.");
    }

    calculationError.hidden = true;
    partnerAllocation.setAttribute(
      "aria-invalid",
      String(fiscalPartner && (partnerAllocation.value === "" ||
        !Number.isInteger(allocationPercent) ||
        allocationPercent < 0 || allocationPercent > 100)),
    );

    // De rekenregels staan in calculateBox3Year (jaarberekening.js), die ook de
    // snelcontrole gebruikt.
    const yearResult = calculateBox3Year({
      year, bankTotal: getBankTotal(year), otherAssetsTotal: otherAssets.total,
      cashTotal: otherAssets.cash, debts, fiscalPartner, allocationPercent,
    });
    const {
      assets, debtThreshold, deductibleDebts, netAssets, exemption, taxableBase,
      firstPartnerBase, secondPartnerBase,
    } = yearResult;
    const {
      oldTierRates, oldTierReturns, oldTierCalculations, oldIncome, oldTax,
      oldFirstPartnerIncome, oldSecondPartnerIncome,
    } = yearResult.old;
    const {
      roundedReliefSavingsReturn, roundedReliefInvestmentReturn, roundedReliefDebtReturn,
      reliefTotalReturn, usesTaxableBaseShare, formattedYieldRate, yieldRateExplanation,
      reliefIncome, reliefIncomeCalculation, reliefTax,
      firstPartnerIncome: reliefFirstPartnerIncome, secondPartnerIncome: reliefSecondPartnerIncome,
    } = yearResult.relief;

    const oldIncomes = fiscalPartner ? [oldFirstPartnerIncome, oldSecondPartnerIncome] : [oldFirstPartnerIncome];
    const reliefIncomes = fiscalPartner ? [reliefFirstPartnerIncome, reliefSecondPartnerIncome] : [reliefFirstPartnerIncome];
    const values = {
      "old-assets": formatCalculationEuro(assets),
      "old-deductible-debts": formatCalculationEuro(deductibleDebts),
      "old-net-assets": formatCalculationEuro(netAssets),
      "old-exemption": formatCalculationEuro(exemption),
      "old-taxable-base": formatCalculationEuro(taxableBase),
      "old-allocation": fiscalPartner
        ? `${formatCalculationEuro(firstPartnerBase)} / ${formatCalculationEuro(secondPartnerBase)}`
        : "Geen fiscale partner",
      "old-tier-1": formatCalculationEuro(roundToTwoDecimals(oldTierReturns[0])),
      "old-tier-2": formatCalculationEuro(roundToTwoDecimals(oldTierReturns[1])),
      "old-tier-3": formatCalculationEuro(roundToTwoDecimals(oldTierReturns[2])),
      "old-income": formatWithAssessment(oldIncome, assessmentIncome(oldIncomes)),
      "old-tax": formatWithAssessment(oldTax, assessmentTax(oldIncomes, data.taxRate)),
      "relief-assets": formatCalculationEuro(assets),
      "relief-bank-assets": formatCalculationEuro(bank),
      "relief-other-assets": formatCalculationEuro(investments),
      "relief-deductible-debts": formatCalculationEuro(deductibleDebts),
      "relief-net-assets": formatCalculationEuro(netAssets),
      "relief-exemption": formatCalculationEuro(exemption),
      "relief-taxable-base": formatCalculationEuro(taxableBase),
      "relief-allocation": fiscalPartner
        ? `${formatCalculationEuro(firstPartnerBase)} / ${formatCalculationEuro(secondPartnerBase)}`
        : "Geen fiscale partner",
      "relief-savings-return": formatCalculationEuro(roundedReliefSavingsReturn),
      "relief-investment-return": formatCalculationEuro(roundedReliefInvestmentReturn),
      "relief-debt-return": formatCalculationEuro(roundedReliefDebtReturn),
      "relief-total-return": formatCalculationEuro(roundToTwoDecimals(reliefTotalReturn)),
      "relief-yield-rate": formattedYieldRate,
      "relief-income": formatWithAssessment(reliefIncome, assessmentIncome(reliefIncomes)),
      "relief-tax": formatWithAssessment(reliefTax, assessmentTax(reliefIncomes, data.taxRate)),
      "comparison-old-income": formatWithAssessment(oldIncome, assessmentIncome(oldIncomes)),
      "comparison-relief-income": formatWithAssessment(reliefIncome, assessmentIncome(reliefIncomes)),
      "comparison-old-tax": formatWithAssessment(oldTax, assessmentTax(oldIncomes, data.taxRate)),
      "comparison-relief-tax": formatWithAssessment(reliefTax, assessmentTax(reliefIncomes, data.taxRate)),
      "comparison-difference": formatCalculationEuro(Math.abs(oldTax - reliefTax)),
    };
    for (const [id, value] of Object.entries(values)) {
      setCalculationText(id, value);
    }
    const totalCashInBank = roundToTwoDecimals(cashInBank + getBankCashTotal(year));
    document.querySelector("#relief-bank-assets-label").textContent = totalCashInBank > 0
      ? `Banktegoeden (incl. ${formatCalculationEuro(totalCashInBank)} contant geld)`
      : "Banktegoeden";
    document.querySelector("#old-allocation-row").hidden = !fiscalPartner;
    document.querySelector("#relief-allocation-row").hidden = !fiscalPartner;
    renderOldTierDetails({ data, oldTierRates, oldTierCalculations, yearUsesOldMethodComparison });
    document.querySelector("#relief-method-note").textContent =
      `Forfait banktegoeden ${formatCalculationRate(data.reliefSavingsRate)}\nForfait overige bezittingen ${formatCalculationRate(data.reliefInvestmentRate)}\nForfait schulden ${formatCalculationRate(data.reliefDebtRate)}${year === "2026" ? "\nDe percentages voor banktegoeden en schulden zijn voorlopig; de Belastingdienst stelt deze definitief vast in 2027." : ""}`;
    const yieldRateLabel = usesTaxableBaseShare
      ? "Aandeel in rendementsgrondslag"
      : "Rendementspercentage";
    document.querySelector("#relief-yield-rate-label").textContent =
      yieldRateLabel;
    document.querySelector(
      'summary[aria-controls="relief-yield-rate-details"]',
    )
      .setAttribute("aria-label", `Toon de berekening van ${yieldRateLabel.toLowerCase()}`);
    document.querySelector("#relief-savings-return-explanation").textContent =
      `${formatCalculationEuro(bank)} × ${formatCalculationRate(data.reliefSavingsRate)} = ${formatCalculationEuro(roundedReliefSavingsReturn)}`;
    document.querySelector("#relief-investment-return-explanation").textContent =
      `${formatCalculationEuro(investments)} × ${formatCalculationRate(data.reliefInvestmentRate)} = ${formatCalculationEuro(roundedReliefInvestmentReturn)}`;
    document.querySelector("#relief-debt-return-explanation").textContent =
      `${formatCalculationEuro(deductibleDebts)} × ${formatCalculationRate(data.reliefDebtRate)} = ${formatCalculationEuro(roundedReliefDebtReturn)}`;
    document.querySelector("#relief-yield-rate-explanation").textContent =
      yieldRateExplanation;
    document.querySelector("#relief-income-explanation").textContent =
      reliefIncomeCalculation;

    comparisonResult.className = "comparison-result";
    for (const id of [
      "old-tax",
      "relief-tax",
      "comparison-old-tax",
      "comparison-relief-tax",
    ]) {
      document.querySelector(`#${id}`).classList.remove("is-favorable");
    }
    if (oldTax < reliefTax) {
      comparisonResult.textContent =
        "De oorspronkelijke box 3-berekening is gunstiger en blijft van toepassing.";
      comparisonResult.classList.add("is-old-favorable");
      document.querySelector("#old-tax").classList.add("is-favorable");
      document.querySelector("#comparison-old-tax").classList.add("is-favorable");
    } else if (reliefTax < oldTax) {
      comparisonResult.textContent =
        "De Wet rechtsherstel box 3 leidt tot een lagere belasting.";
      comparisonResult.classList.add("is-relief-favorable");
      document.querySelector("#relief-tax").classList.add("is-favorable");
      document.querySelector("#comparison-relief-tax").classList.add("is-favorable");
    } else {
      comparisonResult.textContent =
        "Beide berekeningen leiden tot dezelfde box 3-heffing.";
      comparisonResult.classList.add("is-equal");
      document.querySelector("#old-tax").classList.add("is-favorable");
      document.querySelector("#relief-tax").classList.add("is-favorable");
      document.querySelector("#comparison-old-tax").classList.add("is-favorable");
      document.querySelector("#comparison-relief-tax").classList.add("is-favorable");
    }
    comparisonDifference.textContent = formatCalculationEuro(Math.abs(oldTax - reliefTax));
    // Voor 2017-2022 geldt het voordeel volgens de Wet rechtsherstel: de laagste
    // uitkomst van de oude methode en de rechtsherstelberekening.
    // 2017-2020 zonder toegang tot de Wet rechtsherstel box 3 (formele
    // beoordeling of snelle keuze): alleen de oude methode, geen tegenbewijsregeling.
    const accessDenied = Number(year) <= 2020 &&
      document.documentElement.dataset.reliefAccessStatus === "GEEN_TOEGANG_RECHTSHERSTEL" &&
      document.documentElement.dataset.reliefAccessComplete !== "nee";
    const oldMethodApplies = accessDenied || yearResult.oldMethodApplies;
    calculationReport = {
      accessDenied,
      year, data, fiscalPartner, allocationPercent,
      bank, investments, debts, assets, debtThreshold, deductibleDebts, netAssets, exemption, taxableBase,
      firstPartnerBase, secondPartnerBase,
      savingsExplanation: `${formatCalculationEuro(bank)} × ${formatCalculationRate(data.reliefSavingsRate)} = ${formatCalculationEuro(roundedReliefSavingsReturn)}`,
      investmentExplanation: `${formatCalculationEuro(investments)} × ${formatCalculationRate(data.reliefInvestmentRate)} = ${formatCalculationEuro(roundedReliefInvestmentReturn)}`,
      debtExplanation: `${formatCalculationEuro(deductibleDebts)} × ${formatCalculationRate(data.reliefDebtRate)} = ${formatCalculationEuro(roundedReliefDebtReturn)}`,
      reliefTotalReturn, usesTaxableBaseShare, yieldRateExplanation, reliefIncomeCalculation,
      reliefIncome, reliefTax, reliefFirstPartnerIncome, reliefSecondPartnerIncome,
      oldTierCalculations, oldIncome, oldTax, oldFirstPartnerIncome, oldSecondPartnerIncome,
    };
    renderActualReturn({
      year, data, fiscalPartner, allocationPercent,
      forfaitaryIncomes: oldMethodApplies
        ? [oldFirstPartnerIncome, oldSecondPartnerIncome]
        : [reliefFirstPartnerIncome, reliefSecondPartnerIncome],
      basisLabel: accessDenied ? "geen toegang tot de Wet rechtsherstel" : oldMethodApplies ? "oude methode is lager" : "Wet rechtsherstel is lager of gelijk",
      accessDenied,
      forfaitaryMethod: oldMethodApplies
        ? "oude methode"
        : yearUsesOldMethodComparison ? "Wet rechtsherstel" : "Overbruggingswet",
    });
    renderReport();
    saveCalculationInputs(year, fiscalPartner ? "yes" : "no");
  } catch (error) {
    otherAssetsTotal.textContent = "—";
    debtsTotal.textContent = "—";
    const allocation = Number(partnerAllocation.value);
    partnerAllocation.setAttribute(
      "aria-invalid",
      String(selectedAnswer("calculation-fiscal-partner") === "yes" &&
        (partnerAllocation.value === "" ||
          !Number.isInteger(allocation) ||
          allocation < 0 ||
          allocation > 100)),
    );
    showCalculationError(error.message);
    clearActualReturn("Controleer de vermogensgegevens onder A.");
    clearReport();
  }
}

function updateCalculationInputs() {
  const year = yearSelect.value;
  if (!BOX3_YEAR_DATA[year]) return;
  const fiscalPartner = selectedAnswer("calculation-fiscal-partner");
  updatePartnerAllocation();
  try {
    getOtherAssets(year);
    getDebtsTotal(year);
    if (fiscalPartner === "yes") {
      const allocation = Number(partnerAllocation.value);
      if (
        partnerAllocation.value === "" ||
        !Number.isInteger(allocation) ||
        allocation < 0 ||
        allocation > 100
      ) {
        throw new Error("Vul voor de verdeling een heel percentage van 0 tot en met 100 in.");
      }
    }
    if (!saveCalculationInputs(year, fiscalPartner || "no")) return;
  } catch (error) {
    const allocation = Number(partnerAllocation.value);
    partnerAllocation.setAttribute(
      "aria-invalid",
      String(fiscalPartner === "yes" &&
        (partnerAllocation.value === "" ||
          !Number.isInteger(allocation) ||
          allocation < 0 ||
          allocation > 100)),
    );
    showCalculationError(error.message);
    return;
  }
  renderCalculation();
}
