"use strict";

function initializeCalculationInputs() {
  for (const input of [debtsInput, partnerAllocation]) {
    input.addEventListener("input", updateCalculationInputs);
    input.addEventListener("change", updateCalculationInputs);
  }
  for (const input of fiscalPartnerQuestion) {
    input.addEventListener("change", updateCalculationInputs);
  }
}

const calculationYear = document.querySelector("#calculation-year");
const otherAssetsLink = document.querySelector("#other-assets-link");
const otherAssetsTotal = document.querySelector("#other-assets-total");
const debtsInput = document.querySelector("#debts");
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

function readNonNegativeAmount(input, label) {
  if (input.value === "") {
    if (input.validity.badInput) {
      throw new Error(`${label}: vul een geldig bedrag van nul of hoger in.`);
    }
    return 0;
  }
  const value = input.valueAsNumber;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label}: vul een geldig bedrag van nul of hoger in.`);
  }
  return roundToTwoDecimals(value);
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

function getOtherAssetsTotal(year) {
  const storedAssets = localStorage.getItem(`${OTHER_ASSETS_STORAGE_KEY}:${year}`);
  if (storedAssets !== null) {
    const assets = JSON.parse(storedAssets);
    if (
      !Array.isArray(assets) ||
      assets.some((asset) =>
        typeof asset.id !== "string" ||
        typeof asset.name !== "string" ||
        ![
          "securities",
          "claims",
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
    return roundToTwoDecimals(
      assets.reduce((sum, asset) => sum + asset.value, 0),
    );
  }

  const legacyStored = localStorage.getItem(`${CALCULATION_STORAGE_KEY}:${year}`);
  if (legacyStored === null) return 0;
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
  return roundToTwoDecimals(legacyValue);
}

function loadCalculationInputs(year) {
  if (loadedCalculationYear === year) return;
  loadedCalculationYear = year;
  calculationStorageError = false;
  otherAssetsTotal.textContent = euro.format(0);
  debtsInput.value = "";
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
      typeof parsed.debts !== "string" ||
      !["yes", "no"].includes(parsed.fiscalPartner) ||
      typeof parsed.partnerAllocation !== "string"
    ) {
      throw new Error("De opgeslagen vermogensgegevens hebben een ongeldig formaat.");
    }
    debtsInput.value = parsed.debts;
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
    const investments = getOtherAssetsTotal(year);
    localStorage.setItem(
      `${CALCULATION_STORAGE_KEY}:${year}`,
      JSON.stringify({
        investments: String(investments),
        debts: debtsInput.value,
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
  otherAssetsLink.href =
    `overige-bezittingen.html?year=${encodeURIComponent(year)}`;
  updatePartnerAllocation();

  try {
    const bank = getBankTotal(year);
    const investments = getOtherAssetsTotal(year);
    otherAssetsTotal.textContent = euro.format(investments);
    const debts = readNonNegativeAmount(debtsInput, "Schulden");
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
    debtsInput.setAttribute("aria-invalid", "false");
    partnerAllocation.setAttribute(
      "aria-invalid",
      String(fiscalPartner && (partnerAllocation.value === "" ||
        !Number.isInteger(allocationPercent) ||
        allocationPercent < 0 || allocationPercent > 100)),
    );

    const assets = roundToTwoDecimals(bank + investments);
    const debtThreshold = data.debtThreshold * householdCount;
    const deductibleDebts = roundToTwoDecimals(
      Math.max(0, debts - debtThreshold),
    );
    const netAssets = roundToTwoDecimals(
      Math.max(0, assets - deductibleDebts),
    );
    const exemption = roundToTwoDecimals(data.exemption * householdCount);
    const taxableBase = roundToTwoDecimals(
      Math.max(0, netAssets - exemption),
    );

    const firstPartnerBase = fiscalPartner
      ? roundToTwoDecimals(taxableBase * allocationPercent / 100)
      : taxableBase;
    const secondPartnerBase = taxableBase - firstPartnerBase;
    const { oldTierRates, oldTierReturns, oldTierCalculations, oldIncome, oldTax } =
      calculateOldMethod({ firstPartnerBase, secondPartnerBase, fiscalPartner, yearUsesOldMethodComparison, data });

    const {
      roundedReliefSavingsReturn, roundedReliefInvestmentReturn, roundedReliefDebtReturn,
      reliefTotalReturn, usesTaxableBaseShare, formattedYieldRate, yieldRateExplanation,
      reliefIncome, reliefIncomeCalculation, reliefTax,
    } = calculateForfaitaryReturn({
      bank, investments, deductibleDebts, data, year, netAssets,
      firstPartnerBase, secondPartnerBase, fiscalPartner,
    });

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
      "old-income": formatCalculationEuro(oldIncome),
      "old-tax": formatCalculationEuro(oldTax),
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
      "relief-income": formatCalculationEuro(reliefIncome),
      "relief-tax": formatCalculationEuro(reliefTax),
      "comparison-old-income": formatCalculationEuro(oldIncome),
      "comparison-relief-income": formatCalculationEuro(reliefIncome),
      "comparison-old-tax": formatCalculationEuro(oldTax),
      "comparison-relief-tax": formatCalculationEuro(reliefTax),
      "comparison-difference": formatCalculationEuro(Math.abs(oldTax - reliefTax)),
    };
    for (const [id, value] of Object.entries(values)) {
      setCalculationText(id, value);
    }
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
    saveCalculationInputs(year, fiscalPartner ? "yes" : "no");
  } catch (error) {
    otherAssetsTotal.textContent = "—";
    debtsInput.setAttribute(
      "aria-invalid",
      String(debtsInput.value !== "" &&
        (!Number.isFinite(debtsInput.valueAsNumber) ||
          debtsInput.valueAsNumber < 0)),
    );
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
  }
}

function updateCalculationInputs() {
  const year = yearSelect.value;
  if (!BOX3_YEAR_DATA[year]) return;
  const fiscalPartner = selectedAnswer("calculation-fiscal-partner");
  updatePartnerAllocation();
  try {
    getOtherAssetsTotal(year);
    readNonNegativeAmount(debtsInput, "Schulden");
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
    debtsInput.setAttribute(
      "aria-invalid",
      String(debtsInput.value !== "" &&
        (!Number.isFinite(debtsInput.valueAsNumber) ||
          debtsInput.valueAsNumber < 0)),
    );
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
