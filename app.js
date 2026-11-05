"use strict";

const STORAGE_KEY = "box3-calculator-bank-accounts-v1";
const OTHER_ASSETS_STORAGE_KEY = "box3-calculator-other-assets-v1";
const PRELIMINARY_STORAGE_KEY = "box3-calculator-preliminary-v1";
const CALCULATION_STORAGE_KEY = "box3-calculation-inputs-v1";
const RELIEF_ACCESS_STATUS = {
  positive: "TOEGANG_RECHTSHERSTEL",
  negative: "GEEN_TOEGANG_RECHTSHERSTEL",
  review: "NADER_ONDERZOEK",
};
const FINALITY_STATUS = {
  yes: "ONHERROEPELIJK_JA",
  no: "ONHERROEPELIJK_NEE",
  unknown: "ONHERROEPELIJK_ONBEKEND",
};
const KERSTARREST_DATE = "2021-12-24";
const BOX3_YEAR_DATA = {
  2017: {
    savingsRate: 1.63,
    investmentRate: 5.39,
    taxRate: 30,
    tier1: 75000,
    tier2: 975000,
    oldTierRates: [2.871, 4.6, 5.39],
    exemption: 25000,
    debtThreshold: 3000,
    reliefSavingsRate: 0.25,
    reliefInvestmentRate: 5.39,
    reliefDebtRate: 3.43,
  },
  2018: {
    savingsRate: 0.36,
    investmentRate: 5.38,
    taxRate: 30,
    tier1: 70800,
    tier2: 978000,
    oldTierRates: [2.017, 4.326, 5.38],
    exemption: 30000,
    debtThreshold: 3000,
    reliefSavingsRate: 0.12,
    reliefInvestmentRate: 5.38,
    reliefDebtRate: 3.2,
  },
  2019: {
    savingsRate: 0.13,
    investmentRate: 5.59,
    taxRate: 30,
    tier1: 71650,
    tier2: 989736,
    oldTierRates: [1.931, 4.443, 5.59],
    exemption: 30360,
    debtThreshold: 3100,
    reliefSavingsRate: 0.08,
    reliefInvestmentRate: 5.59,
    reliefDebtRate: 3,
  },
  2020: {
    savingsRate: 0.07,
    investmentRate: 5.28,
    taxRate: 30,
    tier1: 72797,
    tier2: 1005572,
    oldTierRates: [1.789, 4.185, 5.28],
    exemption: 30846,
    debtThreshold: 3100,
    reliefSavingsRate: 0.04,
    reliefInvestmentRate: 5.28,
    reliefDebtRate: 2.74,
  },
  2021: {
    savingsRate: 0.03,
    investmentRate: 5.69,
    taxRate: 31,
    tier1: 50000,
    tier2: 950000,
    oldTierRates: [1.898, 4.501, 5.69],
    exemption: 50000,
    debtThreshold: 3200,
    reliefSavingsRate: 0.01,
    reliefInvestmentRate: 5.69,
    reliefDebtRate: 2.46,
  },
  2022: {
    savingsRate: -0.01,
    investmentRate: 5.53,
    taxRate: 31,
    tier1: 50650,
    tier2: 962350,
    oldTierRates: [1.818, 4.366, 5.53],
    exemption: 50650,
    debtThreshold: 3200,
    reliefSavingsRate: 0,
    reliefInvestmentRate: 5.53,
    reliefDebtRate: 2.28,
    taxableShareDecimals: 2,
  },
  2023: {
    taxRate: 32,
    exemption: 57000,
    debtThreshold: 3400,
    reliefSavingsRate: 0.92,
    reliefInvestmentRate: 6.17,
    reliefDebtRate: 2.46,
    taxableShareDecimals: 2,
  },
  2024: {
    taxRate: 36,
    exemption: 57000,
    debtThreshold: 3700,
    reliefSavingsRate: 1.44,
    reliefInvestmentRate: 6.04,
    reliefDebtRate: 2.61,
    taxableShareDecimals: 3,
  },
  2025: {
    taxRate: 36,
    exemption: 57684,
    debtThreshold: 3800,
    reliefSavingsRate: 1.37,
    reliefInvestmentRate: 5.88,
    reliefDebtRate: 2.70,
    taxableShareDecimals: 2,
  },
  2026: {
    taxRate: 36,
    exemption: 59357,
    debtThreshold: 3800,
    reliefSavingsRate: 1.28,
    reliefInvestmentRate: 6.00,
    reliefDebtRate: 2.70,
    taxableShareDecimals: 2,
  },
};

const total = document.querySelector("#savings-total");
const status = document.querySelector("#form-status");
const bankLink = document.querySelector("#bank-accounts-link");
const yearSelect = document.querySelector("#tax-year");
const preliminaryPanel = document.querySelector("#preliminary-panel");
const modernPreliminaryPanel = document.querySelector("#modern-preliminary-panel");
const modernPreliminaryError = document.querySelector("#modern-preliminary-error");
const modernAssessmentDate = document.querySelector("#modern-assessment-date");
const modernExtensionDate = document.querySelector("#modern-extension-date");
const modernObjectionDate = document.querySelector("#modern-objection-date");
const modernAavRequestDate = document.querySelector("#modern-aav-request-date");
const modernObjectionAnnouncementDate = document.querySelector("#modern-objection-announcement-date");
const modernAppealDate = document.querySelector("#modern-appeal-date");
const modernAppealProcedureStatus = document.querySelector("#modern-appeal-procedure-status");
const modernAppealFinalDate = document.querySelector("#modern-appeal-final-date");
const modernAppealFinalInstance = document.querySelector("#modern-appeal-final-instance");
const modernAppealFinalEnding = document.querySelector("#modern-appeal-final-ending");
const modernAssessmentNotIssued = document.querySelector("#modern-assessment-not-issued");
const modernAssessmentIssuedFields = document.querySelector("#modern-assessment-issued-fields");
const modernAssessmentDateDeadline = document.querySelector("#modern-assessment-date-deadline");
const modernObjectionDeadlineDate = document.querySelector("#modern-objection-deadline-date");
const modernGeneralTermsLawDateField = document.querySelector("#modern-general-terms-law-date-field");
const modernGeneralTermsLawDate = document.querySelector("#modern-general-terms-law-date");
const modernAssessmentStatutoryDeadline = document.querySelector("#modern-assessment-statutory-deadline");
const modernExtensionDateField = document.querySelector("#modern-extension-date-field");
const modernLateObjectionFields = document.querySelector("#modern-late-objection-fields");
const modernFinalityQuestion = document.querySelector("#modern-finality-question");
const modernAavFields = document.querySelector("#modern-aav-fields");
const modernLateObjectionNotice = document.querySelector("#modern-late-objection-notice");
const modernNoObjectionNotice = document.querySelector("#modern-no-objection-notice");
const modernAavYear = document.querySelector("#modern-aav-year");
const modernAavDeadline = document.querySelector("#modern-aav-deadline");
const modernAavDateStatus = document.querySelector("#modern-aav-date-status");
const modernAavReasonField = document.querySelector("#modern-aav-reason-field");
const modernReliefFields = document.querySelector("#modern-relief-fields");
const modernProcedureFields = document.querySelector("#modern-procedure-fields");
const modernObjectionDateField = document.querySelector("#modern-objection-date-field");
const modernObjectionAdmissibilityBadge = document.querySelector("#modern-objection-admissibility-badge");
const modernLateAdmissibilityBadge = document.querySelector("#modern-late-admissibility-badge");
const modernObjectionDecisionFields = document.querySelector("#modern-objection-decision-fields");
const modernObjectionRulingFields = document.querySelector("#modern-objection-ruling-fields");
const modernAppealDateField = document.querySelector("#modern-appeal-date-field");
const modernAppealProcedureFields = document.querySelector("#modern-appeal-procedure-fields");
const modernAppealFinalFields = document.querySelector("#modern-appeal-final-fields");
const modernAssessmentResult = document.querySelector("#modern-assessment-result");
const modernAssessmentNote = document.querySelector("#modern-assessment-note");
const preliminaryYear = document.querySelector("#preliminary-year");
const preliminaryError = document.querySelector("#preliminary-error");
const assessmentDateQuestion = document.querySelector("#assessment-date-question");
const assessmentDate = document.querySelector("#assessment-date");
const assessmentDateDisplay = document.querySelector("#assessment-date-display");
const assessmentDateText = document.querySelector("#assessment-date-text");
const extensionDateField = document.querySelector("#extension-date-field");
const extensionUntil = document.querySelector("#extension-until");
const objectionSubmittedQuestion = document.querySelector("#objection-submitted-question");
const timelyObjectionQuestion = document.querySelector("#timely-objection-question");
const objectionSubmissionDateField = document.querySelector("#objection-submission-date-field");
const objectionSubmissionDate = document.querySelector("#objection-submission-date");
const objectionAdmissibilityBadge = document.querySelector("#objection-admissibility-badge");
const objectionLateAdmissibilityBadge = document.querySelector("#objection-late-admissibility-badge");
const excusableDelayQuestion = document.querySelector("#excusable-delay-question");
const objectionDeadline = document.querySelector("#objection-deadline");
const objectionDeadlineDate = document.querySelector("#objection-deadline-date");
const generalTermsLawDateField = document.querySelector("#general-terms-law-date-field");
const generalTermsLawDate = document.querySelector("#general-terms-law-date");
const finalityQuestion = document.querySelector("#finality-question");
const finalityReviewNotice = document.querySelector("#finality-review-notice");
const procedureQuestions = document.querySelector("#procedure-questions");
const noObjectionDecisionQuestions = document.querySelector("#no-objection-decision-questions");
const yesObjectionDecisionQuestions = document.querySelector("#yes-objection-decision-questions");
const taxAppealQuestions = document.querySelector("#tax-appeal-questions");
const noTaxAppealQuestions = document.querySelector("#no-tax-appeal-questions");
const objectionDecisionDeadlineDisplay = document.querySelector("#objection-decision-deadline-display");
const objectionOpenNotice = document.querySelector("#objection-open-notice");
const objectionPendingReason = document.querySelector("#objection-pending-reason");
const objectionPendingOtherField = document.querySelector("#objection-pending-other-field");
const objectionPendingOther = document.querySelector("#objection-pending-other");
const objectionAdvisoryCommittee = document.querySelector("#objection-advisory-committee");
const objectionMassalStatus = document.querySelector("#objection-massal-status");
const objectionDecisionDate = document.querySelector("#objection-decision-date");
const objectionAnnouncementDate = document.querySelector("#objection-announcement-date");
const objectionDecisionOutcome = document.querySelector("#objection-decision-outcome");
const taxAppealDate = document.querySelector("#tax-appeal-date");
const appealDeadlineDisplay = document.querySelector("#appeal-deadline-display");
const noAppealDeadlineDisplay = document.querySelector("#no-appeal-deadline-display");
const appealPendingNotice = document.querySelector("#appeal-pending-notice");
const courtDecisionNotice = document.querySelector("#court-decision-notice");
const appealStageDateField = document.querySelector("#appeal-stage-date-field");
const taxAppealStageDate = document.querySelector("#tax-appeal-stage-date");
const appealFinalOutcomeFieldset = document.querySelector("#appeal-final-outcome-fieldset");
const taxAppealFinalOutcome = document.querySelector("#tax-appeal-final-outcome");
const appealEndingField = document.querySelector("#appeal-ending-field");
const taxAppealEnding = document.querySelector("#tax-appeal-ending");
const appealFinalDecisionDateField = document.querySelector("#appeal-final-decision-date-field");
const taxAppealFinalDecisionDate = document.querySelector("#tax-appeal-final-decision-date");
const appealFinalDateLabel = document.querySelector("#appeal-final-date-label");
const appealTimeRunningNotice = document.querySelector("#appeal-time-running-notice");
const appealTimeExpiredNotice = document.querySelector("#appeal-time-expired-notice");
const calculationSection = document.querySelector("#calculation-section");
const accessResult = document.querySelector("#access-result");
const accessResultProcedureNote = document.querySelector("#access-result-procedure-note");
const accessResultExplanation = document.querySelector("#access-result-explanation");
const formalLawQuestions = document.querySelector("#formal-law-questions");
const legalConclusion = document.querySelector(".legal-conclusion");
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
const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percentage = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const questionNames = [
  "assessment-issued",
  "deadline-expired",
  "extension-granted",
  "legal-exception",
];
let preliminaryByYear = {};
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

function calculateOldTierAmounts(taxableBase, data) {
  return [
    Math.min(taxableBase, data.tier1),
    Math.min(Math.max(0, taxableBase - data.tier1), data.tier2 - data.tier1),
    Math.max(0, taxableBase - data.tier2),
  ];
}

function calculateOldTierRates(data) {
  return data.oldTierRates || [0, 0, 0];
}

function calculateOldYield(taxableBase, data) {
  const tierAmounts = calculateOldTierAmounts(taxableBase, data);
  const tierRates = calculateOldTierRates(data);
  return tierAmounts.map((amount, index) =>
    roundToTwoDecimals(
      amount * tierRates[index] / 100,
    ),
  );
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
    const firstPartnerTiers = yearUsesOldMethodComparison
      ? calculateOldYield(firstPartnerBase, data)
      : [0, 0, 0];
    const secondPartnerTiers = fiscalPartner && yearUsesOldMethodComparison
      ? calculateOldYield(secondPartnerBase, data)
      : [0, 0, 0];
    const firstPartnerTierAmounts = calculateOldTierAmounts(firstPartnerBase, data);
    const secondPartnerTierAmounts = fiscalPartner
      ? calculateOldTierAmounts(secondPartnerBase, data)
      : [0, 0, 0];
    const oldTierRates = calculateOldTierRates(data);
    const oldTierReturns = firstPartnerTiers.map(
      (value, index) =>
        roundToTwoDecimals(value + secondPartnerTiers[index]),
    );
    const oldTierCalculations = oldTierReturns.map((total, index) => {
      const partnerAmounts = [
        firstPartnerTierAmounts[index],
        secondPartnerTierAmounts[index],
      ];
      const multiplier = formatOldYieldRate(oldTierRates[index]);
      const calculationParts = partnerAmounts
        .filter((amount) => amount > 0)
        .map((amount) => ({
          amount: formatCalculationEuro(amount),
          result: formatCalculationEuro(
            roundToTwoDecimals(amount * oldTierRates[index] / 100),
          ),
        }));
      if (calculationParts.length === 0) {
        return `${formatCalculationEuro(0)} × ${multiplier} = ${formatCalculationEuro(total)}`;
      }
      if (calculationParts.length === 1) {
        return `${calculationParts[0].amount} × ${multiplier} = ${formatCalculationEuro(total)}`;
      }
      return `${calculationParts.map(({ amount, result }) =>
        `(${amount} × ${multiplier} = ${result})`,
      ).join(" + ")} = ${formatCalculationEuro(total)}`;
    });
    const firstPartnerIncome = roundToTwoDecimals(
      firstPartnerTiers.reduce((sum, value) => sum + value, 0),
    );
    const secondPartnerIncome = fiscalPartner
      ? roundToTwoDecimals(
        secondPartnerTiers.reduce((sum, value) => sum + value, 0),
      )
      : 0;
    const oldIncome = roundToTwoDecimals(
      firstPartnerIncome + secondPartnerIncome,
    );
    const oldTax = roundToTwoDecimals(
      roundToTwoDecimals(firstPartnerIncome * data.taxRate / 100) +
      roundToTwoDecimals(secondPartnerIncome * data.taxRate / 100),
    );

    const reliefSavingsReturn = bank * data.reliefSavingsRate / 100;
    const reliefInvestmentReturn = investments * data.reliefInvestmentRate / 100;
    const reliefDebtReturn = deductibleDebts * data.reliefDebtRate / 100;
    const roundedReliefSavingsReturn = roundToTwoDecimals(reliefSavingsReturn);
    const roundedReliefInvestmentReturn = roundToTwoDecimals(reliefInvestmentReturn);
    const roundedReliefDebtReturn = roundToTwoDecimals(reliefDebtReturn);
    const reliefTotalReturn = roundToTwoDecimals(
      roundedReliefSavingsReturn + roundedReliefInvestmentReturn -
      roundedReliefDebtReturn,
    );
    const usesTaxableBaseShare = Number(year) >= 2022;
    const reliefYieldRate =
      netAssets > 0 ? reliefTotalReturn / netAssets : 0;
    const appliedYieldRate = roundToTwoDecimals(reliefYieldRate * 100) / 100;
    const shareDecimals = data.taxableShareDecimals ?? 2;
    const formatPercentage = (value, fractionDigits) =>
      new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);
    const firstPartnerShare = netAssets > 0
      ? roundToDecimals(firstPartnerBase / netAssets * 100, shareDecimals)
      : 0;
    const secondPartnerShare = netAssets > 0
      ? roundToDecimals(secondPartnerBase / netAssets * 100, shareDecimals)
      : 0;
    const formattedYieldRate = usesTaxableBaseShare
      ? fiscalPartner
        ? `${formatPercentage(firstPartnerShare, shareDecimals)}% / ${formatPercentage(secondPartnerShare, shareDecimals)}%`
        : `${formatPercentage(firstPartnerShare, shareDecimals)}%`
      : `${formatPercentage(reliefYieldRate * 100, 2)}%`;
    const firstPartnerShareCalculation = `${formatCalculationEuro(firstPartnerBase)} / ${formatCalculationEuro(netAssets)} × 100 = ${formatPercentage(firstPartnerShare, shareDecimals)}%`;
    const secondPartnerShareCalculation = `${formatCalculationEuro(secondPartnerBase)} / ${formatCalculationEuro(netAssets)} × 100 = ${formatPercentage(secondPartnerShare, shareDecimals)}%`;
    const yieldRateExplanation = usesTaxableBaseShare
      ? netAssets > 0
        ? fiscalPartner
          ? `${firstPartnerShareCalculation}\n${secondPartnerShareCalculation}`
          : firstPartnerShareCalculation
        : "Geen rendementsgrondslag; aandeel 0%"
      : netAssets > 0
        ? `${formatCalculationEuro(reliefTotalReturn)} / ${formatCalculationEuro(netAssets)} × 100% = ${formattedYieldRate}`
        : `Geen rendementsgrondslag; rendementspercentage ${formattedYieldRate}`;
    const firstPartnerReliefIncome = roundToTwoDecimals(Math.max(
      0,
      usesTaxableBaseShare
        ? reliefTotalReturn * firstPartnerShare / 100
        : appliedYieldRate * firstPartnerBase,
    ));
    const secondPartnerReliefIncome = fiscalPartner
      ? roundToTwoDecimals(
        Math.max(
          0,
          usesTaxableBaseShare
            ? reliefTotalReturn * secondPartnerShare / 100
            : appliedYieldRate * secondPartnerBase,
        ),
      )
      : 0;
    const reliefIncome = roundToTwoDecimals(
      firstPartnerReliefIncome + secondPartnerReliefIncome,
    );
    const reliefIncomeCalculation = usesTaxableBaseShare
      ? netAssets > 0
        ? fiscalPartner
          ? `(${formatCalculationEuro(reliefTotalReturn)} × ${formatPercentage(firstPartnerShare, shareDecimals)}%) + (${formatCalculationEuro(reliefTotalReturn)} × ${formatPercentage(secondPartnerShare, shareDecimals)}%) = ${formatCalculationEuro(reliefIncome)}`
          : `(${formatCalculationEuro(reliefTotalReturn)} × ${formatPercentage(firstPartnerShare, shareDecimals)}%) = ${formatCalculationEuro(reliefIncome)}`
        : `Geen rendementsgrondslag = ${formatCalculationEuro(reliefIncome)}`
      : netAssets > 0
        ? fiscalPartner
          ? `(${formattedYieldRate} × ${formatCalculationEuro(firstPartnerBase)}) + (${formattedYieldRate} × ${formatCalculationEuro(secondPartnerBase)}) = ${formatCalculationEuro(reliefIncome)}`
          : `(${formattedYieldRate} × ${formatCalculationEuro(firstPartnerBase)}) = ${formatCalculationEuro(reliefIncome)}`
        : `Geen rendementsgrondslag = ${formatCalculationEuro(reliefIncome)}`;
    const reliefTax = roundToTwoDecimals(
      roundToTwoDecimals(firstPartnerReliefIncome * data.taxRate / 100) +
      roundToTwoDecimals(secondPartnerReliefIncome * data.taxRate / 100),
    );

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
    document.querySelector("#old-method-note").textContent =
      yearUsesOldMethodComparison
        ? `Forfait sparen: ${formatCalculationRate(data.savingsRate)}\nForfait beleggen: ${formatCalculationRate(data.investmentRate)}`
        : "";
    document.querySelector("#old-tax-label").textContent =
      `Box 3-belasting oude methode (${data.taxRate}%)`;
    document.querySelector("#old-tier-1-range").textContent =
      `${formatCalculationEuroWhole(0)} - ${formatCalculationEuroWhole(data.tier1)}`;
    document.querySelector("#old-tier-1-allocation").textContent =
      "Sparen / Beleggen = 67% / 33%";
    document.querySelector("#old-tier-1-explanation").textContent =
      `(67% × ${formatCalculationRate(data.savingsRate)}) + (33% × ${formatCalculationRate(data.investmentRate)}) = ${formatOldYieldRate(oldTierRates[0])}`;
    document.querySelector("#old-tier-1-calculation").textContent =
      oldTierCalculations[0];
    document.querySelector("#old-tier-2-range").textContent =
      `${formatCalculationEuroWhole(data.tier1)} - ${formatCalculationEuroWhole(data.tier2)}`;
    document.querySelector("#old-tier-2-allocation").textContent =
      "Sparen / Beleggen = 21% / 79%";
    document.querySelector("#old-tier-2-explanation").textContent =
      `(21% × ${formatCalculationRate(data.savingsRate)}) + (79% × ${formatCalculationRate(data.investmentRate)}) = ${formatOldYieldRate(oldTierRates[1])}`;
    document.querySelector("#old-tier-2-calculation").textContent =
      oldTierCalculations[1];
    document.querySelector("#old-tier-3-range").textContent =
      `${formatCalculationEuroWhole(data.tier2)} en hoger`;
    document.querySelector("#old-tier-3-allocation").textContent =
      "Sparen / Beleggen = 0% / 100%";
    document.querySelector("#old-tier-3-explanation").textContent =
      `(100% × ${formatCalculationRate(data.investmentRate)}) = ${formatOldYieldRate(oldTierRates[2])}`;
    document.querySelector("#old-tier-3-calculation").textContent =
      oldTierCalculations[2];
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

function setReliefAccessStatus(statusValue) {
  const root = document.documentElement;
  if (root.dataset.reliefAccessStatus === statusValue) return;
  root.dataset.reliefAccessStatus = statusValue;
  root.dispatchEvent(
    new CustomEvent("box3:relief-access-status", {
      detail: { status: statusValue },
    }),
  );
}

function isPreliminaryYear(year) {
  const numericYear = Number(year);
  return numericYear >= 2017 && numericYear <= 2020;
}

function isModernAssessmentYear(year) {
  return year === "2021" || year === "2022";
}

function isCalculationYear(year) {
  const numericYear = Number(year);
  return numericYear >= 2017 && numericYear <= 2026;
}

function setModernAssessmentResult(kind, message, note = "") {
  modernAssessmentResult.hidden = !message;
  modernAssessmentResult.className =
    `access-result${message ? ` access-result-${kind}` : ""}`;
  modernAssessmentResult.textContent = message;
  modernAssessmentNote.hidden = !note;
  modernAssessmentNote.textContent = note;
}

function renderModernAavResult(answers, year, lateObjection) {
  const requestDate = answers.modernAavRequestDate || "";
  const assessmentDate = answers.modernAssessmentDate || "";
  const deadline = `${Number(year) + 5}-12-31`;
  if (!formatDate(requestDate) || requestDate < assessmentDate) {
    setModernAssessmentResult(
      "review",
      formatDate(requestDate) && requestDate < assessmentDate
        ? "De ontvangstdatum van het verzoek kan niet vóór de dagtekening van de definitieve aanslag liggen. Controleer de ingevoerde datum."
        : lateObjection
        ? "Het bezwaar is niet-ontvankelijk wegens termijnoverschrijding. Vul de juridisch relevante ontvangstdatum van het eventuele verzoek om ambtshalve vermindering in."
        : "De bezwaartermijn is verstreken. Vul de datum in waarop het verzoek om ambtshalve vermindering is (of wordt) ontvangen.",
      `De reguliere vijfjaarstermijn loopt in beginsel tot en met ${formatDate(deadline)}.`,
    );
    return;
  }
  if (requestDate > deadline) {
    setModernAssessmentResult(
      "review",
      "De reguliere vijfjaarstermijn lijkt verstreken. Controleer of een bijzondere wettelijke regel of uitzondering van toepassing is.",
      "De datum alleen is onvoldoende om vast te stellen dat vermindering onmogelijk is. Beoordeel artikel 9.6 Wet IB 2001, artikel 45aa Uitvoeringsregeling IB 2001 en de toepasselijke box 3-regels.",
    );
    return;
  }

  const counterproof = answers.modernAavCounterproof || "";
  if (counterproof === "yes") {
    setModernAssessmentResult(
      "info",
      "Verzoek binnen de reguliere vijfjaarstermijn. De mogelijke vermindering wegens lager werkelijk rendement moet afzonderlijk worden beoordeeld.",
      "De huidige berekeningsmodule berekent geen werkelijk rendement. De datumcontrole bewijst niet dat aan de voorwaarden van de Wet tegenbewijsregeling box 3 is voldaan.",
    );
    return;
  }
  if (counterproof === "unknown" || !["yes", "no"].includes(counterproof)) {
    setModernAssessmentResult(
      "review",
      "Verzoek binnen de reguliere vijfjaarstermijn. Geef aan of vermindering wordt gevraagd wegens lager werkelijk rendement.",
      "De termijn is slechts een procedurele voorwaarde; de inhoudelijke voorwaarden en wettelijke beperkingen moeten nog worden getoetst.",
    );
    return;
  }
  if (answers.modernReliefApplied === "no") {
    setModernAssessmentResult(
      "info",
      "Verzoek binnen de reguliere vijfjaarstermijn. Onderzoek of de Wet rechtsherstel niet of onjuist is toegepast en of artikel 45aa Uitvoeringsregeling IB 2001 aan vermindering in de weg staat.",
      "Een tijdig verzoek geeft niet automatisch recht op vermindering. Gebruik de berekeningen hieronder als indicatie en controleer de aanslag en de wettelijke voorwaarden.",
    );
    return;
  }
  setModernAssessmentResult(
    "review",
    "Op basis van de antwoorden is geen aanvullende grond voor ambtshalve vermindering vastgesteld.",
    "De Wet rechtsherstel is al toegepast en er is geen verzoek wegens lager werkelijk rendement opgegeven. Controleer de berekening, wettelijke beperkingen en eventuele bijzondere omstandigheden voordat een definitieve conclusie wordt getrokken.",
  );
}

function renderModernAssessment(answers, year) {
  document.querySelector("#modern-preliminary-year").textContent = year;
  setReliefAccessStatus(RELIEF_ACCESS_STATUS.review);
  for (const [name, key] of [
    ["modern-assessment-issued", "modernAssessmentIssued"],
    ["modern-extension-status", "modernExtensionStatus"],
    ["modern-relief-applied", "modernReliefApplied"],
    ["modern-objection-status", "modernObjectionStatus"],
    ["modern-late-objection", "modernLateObjection"],
    ["modern-finality-status", "modernFinalityStatus"],
    ["modern-objection-outcome", "modernObjectionOutcome"],
    ["modern-appeal-status", "modernAppealStatus"],
    ["modern-aav-counterproof", "modernAavCounterproof"],
  ]) {
    restoreAnswer(name, answers[key] || "");
  }
  modernAssessmentDate.value = answers.modernAssessmentDate || "";
  modernGeneralTermsLawDate.value = answers.modernGeneralTermsLawDate || "";
  restoreAnswer("modern-general-terms-law", answers.modernGeneralTermsLaw || "");
  modernExtensionDate.value = answers.modernExtensionDate || "";
  modernObjectionDate.value = answers.modernObjectionDate || "";
  modernAavRequestDate.value = answers.modernAavRequestDate || "";
  modernObjectionAnnouncementDate.value =
    answers.modernObjectionAnnouncementDate || "";
  modernAppealDate.value = answers.modernAppealDate || "";
  modernAppealProcedureStatus.value =
    answers.modernAppealProcedureStatus || "";
  modernAppealFinalDate.value = answers.modernAppealFinalDate || "";
  modernAppealFinalInstance.value = answers.modernAppealFinalInstance || "";
  modernAppealFinalEnding.value = answers.modernAppealFinalEnding || "";

  const issued = answers.modernAssessmentIssued || "";
  const modernAssessmentDateValue = answers.modernAssessmentDate || "";
  const modernDeadline = getAssessmentObjectionDeadline(
    modernAssessmentDateValue,
    answers.modernGeneralTermsLaw,
    answers.modernGeneralTermsLawDate,
  );
  const validModernAssessmentDate = Boolean(formatDate(modernAssessmentDateValue));
  modernAssessmentNotIssued.hidden = issued !== "no";
  modernAssessmentIssuedFields.hidden = issued !== "yes";
  modernExtensionDateField.hidden =
    issued !== "no" || answers.modernExtensionStatus !== "yes";
  modernAssessmentDate.required = issued === "yes";
  modernExtensionDate.required = !modernExtensionDateField.hidden;
  modernGeneralTermsLawDateField.hidden =
    issued !== "yes" ||
    !validModernAssessmentDate ||
    answers.modernGeneralTermsLaw !== "yes";
  modernGeneralTermsLawDate.required = !modernGeneralTermsLawDateField.hidden;
  const modernBaseDeadline = validModernAssessmentDate
    ? getDeadlineAfterDays(modernAssessmentDateValue, 42)
    : "";
  modernGeneralTermsLawDate.min = modernBaseDeadline;
  modernGeneralTermsLawDate.max = modernBaseDeadline
    ? getDeadlineAfterDays(modernBaseDeadline, 7)
    : "";
  modernGeneralTermsLawDate.setAttribute(
    "aria-invalid",
    String(
      !modernGeneralTermsLawDateField.hidden &&
      Boolean(formatDate(answers.modernGeneralTermsLawDate || "")) &&
      !modernDeadline,
    ),
  );
  modernReliefFields.hidden =
    issued !== "yes" || !formatDate(answers.modernAssessmentDate || "");
  const reliefApplied = answers.modernReliefApplied || "";
  modernProcedureFields.hidden =
    modernReliefFields.hidden ||
    !modernDeadline ||
    !["yes", "no"].includes(reliefApplied);
  modernObjectionDateField.hidden =
    modernProcedureFields.hidden ||
    answers.modernObjectionStatus !== "yes";
  modernObjectionDate.required = !modernObjectionDateField.hidden;
  const objectionDate = answers.modernObjectionDate || "";
  const objectionDeadline = getAssessmentObjectionDeadline(
    answers.modernAssessmentDate || "",
    answers.modernGeneralTermsLaw,
    answers.modernGeneralTermsLawDate,
  );
  const objectionDateValid = Boolean(formatDate(objectionDate));
  const objectionLate =
    objectionDateValid &&
    objectionDeadline &&
    objectionDate > objectionDeadline;
  const modernObjectionInadmissible =
    objectionDateValid &&
    objectionLate &&
    answers.modernLateObjection === "no";
  modernObjectionAdmissibilityBadge.textContent = modernObjectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  modernObjectionAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    modernObjectionInadmissible,
  );
  modernObjectionAdmissibilityBadge.hidden =
    modernObjectionDateField.hidden ||
    !objectionDateValid ||
    objectionLate;
  modernLateAdmissibilityBadge.hidden =
    !objectionLate ||
    !["yes", "no"].includes(answers.modernLateObjection);
  modernLateAdmissibilityBadge.textContent = modernObjectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  modernLateAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    modernObjectionInadmissible,
  );
  modernLateObjectionFields.hidden =
    modernObjectionDateField.hidden || !objectionLate;
  const finalityStatus = answers.modernFinalityStatus || "";
  modernFinalityQuestion.hidden =
    modernProcedureFields.hidden ||
    !(
      answers.modernObjectionStatus === "no" ||
      (answers.modernObjectionStatus === "yes" &&
        objectionDateValid &&
        (!objectionLate || ["yes", "no"].includes(answers.modernLateObjection)))
    );
  const objectionDeadlinePassed =
    Boolean(objectionDeadline) && objectionDeadline < getTodayDateValue();
  const aavRoute =
    !modernProcedureFields.hidden &&
    ((answers.modernObjectionStatus === "no" && objectionDeadlinePassed) ||
      (answers.modernObjectionStatus === "yes" &&
        objectionLate &&
        answers.modernLateObjection === "no"));
  const aavDeadline = `${Number(year) + 5}-12-31`;
  modernAavFields.hidden = !aavRoute;
  modernLateObjectionNotice.hidden =
    !aavRoute || answers.modernObjectionStatus !== "yes";
  modernNoObjectionNotice.hidden =
    !aavRoute || answers.modernObjectionStatus !== "no";
  modernAavYear.textContent = year;
  modernAavDeadline.textContent = formatDate(aavDeadline);
  modernAavRequestDate.required = aavRoute;
  const aavRequestDate = answers.modernAavRequestDate || "";
  const aavRequestDateValid =
    Boolean(formatDate(aavRequestDate)) &&
    aavRequestDate >= (answers.modernAssessmentDate || "");
  const aavWithinDeadline =
    aavRequestDateValid && aavRequestDate <= aavDeadline;
  modernAavDateStatus.hidden = !aavRoute || !aavRequestDateValid;
  modernAavDateStatus.textContent = !aavRequestDateValid
    ? ""
    : aavWithinDeadline
      ? `De opgegeven ontvangstdatum valt binnen de reguliere vijfjaarstermijn (tot en met ${formatDate(aavDeadline)}). Dit stelt geen recht op vermindering vast.`
      : `De opgegeven ontvangstdatum valt na de reguliere vijfjaarstermijn (tot en met ${formatDate(aavDeadline)}). Controleer of een bijzondere wettelijke regel van toepassing is.`;
  modernAavReasonField.hidden = !aavRoute || !aavWithinDeadline;
  modernObjectionDecisionFields.hidden =
    modernProcedureFields.hidden ||
    answers.modernObjectionStatus !== "yes" ||
    !objectionDateValid ||
    (objectionLate && answers.modernLateObjection !== "yes");
  modernObjectionRulingFields.hidden =
    modernObjectionDecisionFields.hidden ||
    answers.modernObjectionOutcome !== "decided";
  modernAppealDateField.hidden =
    modernObjectionRulingFields.hidden ||
    answers.modernAppealStatus !== "yes";
  const appealDateValid = Boolean(formatDate(answers.modernAppealDate || ""));
  modernAppealProcedureFields.hidden =
    modernAppealDateField.hidden || !appealDateValid;
  const appealFinalStatus = answers.modernAppealProcedureStatus || "";
  modernAppealFinalFields.hidden =
    modernAppealProcedureFields.hidden ||
    !["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
      .includes(appealFinalStatus);
  modernAssessmentStatutoryDeadline.textContent =
    `Reguliere aanslagtermijn: in beginsel tot en met 31 december ${Number(year) + 3} (drie jaar na afloop van het belastingjaar). Uitstel en bijzondere wettelijke termijnen kunnen dit wijzigen.`;

  const assessmentDate = answers.modernAssessmentDate || "";
  const validAssessmentDate = Boolean(formatDate(assessmentDate));
  modernAavRequestDate.min = validAssessmentDate ? assessmentDate : "";
  modernAavRequestDate.setAttribute(
    "aria-invalid",
    String(
      aavRoute &&
      Boolean(formatDate(aavRequestDate)) &&
      aavRequestDate < assessmentDate,
    ),
  );
  modernAssessmentDateDeadline.hidden =
    issued !== "yes" || !validAssessmentDate;
  const objectionDeadlineDate = validAssessmentDate
    ? getDeadlineAfterDays(assessmentDate, 42)
    : "";
  if (objectionDeadlineDate) {
    modernObjectionDeadlineDate.textContent = formatDate(objectionDeadlineDate);
  }

  if (issued === "yes" && validAssessmentDate && !objectionDeadline) {
    setModernAssessmentResult(
      "review",
      answers.modernGeneralTermsLaw === "yes"
        ? "Vul een handmatige datum in tussen de datum zes weken na dagtekening en maximaal een week daarna."
        : "Geef aan of de Algemene termijnenwet van toepassing is.",
    );
    return;
  }
  if (issued === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: controleer eerst of een definitieve aanslag is opgelegd.",
    );
    return;
  }
  if (issued === "no") {
    const extension = answers.modernExtensionStatus || "";
    const extensionDate = answers.modernExtensionDate || "";
    if (!extension || extension === "unknown" ||
        (extension === "yes" && !formatDate(extensionDate))) {
      setModernAssessmentResult(
        "review",
        "Onvoldoende gegevens: controleer of uitstel of een bijzondere aanslagtermijn geldt.",
      );
      return;
    }
    const assessmentDeadline = extension === "yes"
      ? extensionDate
      : `${Number(year) + 3}-12-31`;
    if (assessmentDeadline >= getTodayDateValue()) {
      setModernAssessmentResult(
        "positive",
        "Reguliere beoordeling mogelijk: de definitieve aanslag kan in beginsel nog worden opgelegd.",
        `De indicatieve termijn loopt tot en met ${formatDate(assessmentDeadline)}. Controleer uitstel, buitenlandse inkomsten en andere bijzondere wettelijke regels.`,
      );
    } else {
      setModernAssessmentResult(
        "review",
        "Nader juridisch onderzoek noodzakelijk: de reguliere aanslagtermijn lijkt verstreken.",
        "Controleer uitstel, bijzondere wettelijke termijnen en de concrete aanslaggegevens. Deze rekentool stelt niet zelfstandig vast dat geen aanslag meer kan worden opgelegd.",
      );
    }
    return;
  }
  if (!validAssessmentDate) {
    setModernAssessmentResult(
      "review",
      "Vul de dagtekening van de definitieve aanslag in.",
    );
    return;
  }
  if (!modernReliefFields.hidden && !["yes", "no"].includes(reliefApplied)) {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: controleer op de aanslag of een latere beschikking de Wet rechtsherstel is toegepast.",
    );
    return;
  }
  if (modernProcedureFields.hidden) {
    setModernAssessmentResult(
      "review",
      "Controleer eerst of de Wet rechtsherstel box 3 is toegepast.",
    );
    return;
  }

  const objectionStatus = answers.modernObjectionStatus || "";
  if (!objectionStatus || objectionStatus === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: stel vast of bezwaar is ingediend.",
    );
    return;
  }
  if (objectionStatus === "no") {
    if (["yes", "no"].includes(finalityStatus)) {
      setReliefAccessStatus(
        finalityStatus === "yes"
          ? RELIEF_ACCESS_STATUS.negative
          : RELIEF_ACCESS_STATUS.positive,
      );
      setModernAssessmentResult(
        finalityStatus === "yes" ? "negative" : "positive",
        finalityStatus === "yes"
          ? "Geen toegang tot Wet rechtsherstel box 3."
          : "Wel toegang tot Wet rechtsherstel box 3.",
      );
      return;
    }
    if (modernDeadline >= getTodayDateValue()) {
      setModernAssessmentResult(
        "positive",
        "Reguliere beoordeling mogelijk: de bezwaartermijn loopt nog.",
        `De indicatieve uiterste bezwaardatum is ${formatDate(modernDeadline)}.`,
      );
    } else {
      renderModernAavResult(answers, year, false);
    }
    return;
  }
  if (!objectionDateValid) {
    setModernAssessmentResult(
      "review",
      "Vul de datum in waarop bezwaar is ingediend voordat de tijdigheid wordt beoordeeld.",
    );
    return;
  }
  if (objectionLate && answers.modernLateObjection === "unknown") {
    setModernAssessmentResult(
      "review",
      "Het bezwaar lijkt na de berekende termijn te zijn ingediend. Stel eerst vast of de postregel geldt en of de termijnoverschrijding verschoonbaar is.",
      "Op grond van artikel 6:11 Awb kan een termijnoverschrijding onder omstandigheden verschoonbaar zijn. Zonder voldoende gegevens wordt geen definitieve conclusie over de ontvankelijkheid getrokken.",
    );
    return;
  }
  if (["yes", "no"].includes(finalityStatus)) {
    setReliefAccessStatus(
      finalityStatus === "yes"
        ? RELIEF_ACCESS_STATUS.negative
        : RELIEF_ACCESS_STATUS.positive,
    );
    setModernAssessmentResult(
      finalityStatus === "yes" ? "negative" : "positive",
      finalityStatus === "yes"
        ? "Geen toegang tot Wet rechtsherstel box 3."
        : "Wel toegang tot Wet rechtsherstel box 3.",
    );
    return;
  }
  if (objectionLate && answers.modernLateObjection === "no") {
    renderModernAavResult(answers, year, true);
    return;
  }
  setModernAssessmentResult(
    "review",
    "Stel vast of de aanslag op 24 december 2021 al onherroepelijk vaststond.",
  );
  return;
  if (objectionLate && answers.modernLateObjection === "no") {
    renderModernAavResult(answers, year, true);
    return;
  }
  const objectionOutcome = answers.modernObjectionOutcome || "";
  if (!objectionOutcome) {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: stel vast of uitspraak op bezwaar is gedaan.",
    );
    return;
  }
  if (objectionOutcome === "pending") {
    setModernAssessmentResult(
      "positive",
      "Reguliere beoordeling mogelijk: het bezwaar is nog in behandeling.",
      "Een lopend bezwaar betekent dat de procedure nog niet definitief is afgerond. Controleer de ontvankelijkheid als het bezwaar na de berekende termijn is ingediend.",
    );
    return;
  }
  if (objectionOutcome === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: controleer de uitspraak op bezwaar en de actuele processtatus.",
    );
    return;
  }
  const announcementDate = answers.modernObjectionAnnouncementDate || "";
  if (!formatDate(announcementDate)) {
    setModernAssessmentResult(
      "review",
      "Vul de datum van bekendmaking van de uitspraak op bezwaar in.",
    );
    return;
  }
  const appealDeadline = getDeadlineAfterDays(announcementDate, 42);
  if (!appealDeadline) {
    setModernAssessmentResult("review", "De beroepstermijn kon niet worden berekend.");
    return;
  }
  const appealStatus = answers.modernAppealStatus || "";
  if (!appealStatus || appealStatus === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: stel vast of tijdig beroep is ingesteld.",
      `De indicatieve beroepstermijn loopt tot en met ${formatDate(appealDeadline)}.`,
    );
    return;
  }
  if (appealStatus === "no") {
    if (appealDeadline >= getTodayDateValue()) {
      setModernAssessmentResult(
        "positive",
        "Reguliere beoordeling mogelijk: de beroepstermijn loopt nog.",
        `De indicatieve uiterste datum voor beroep is ${formatDate(appealDeadline)}.`,
      );
    } else {
      setModernAssessmentResult(
        "review",
        "De beroepstermijn lijkt verstreken zonder beroep. Onderzoek of ambtshalve vermindering of een andere wettelijke route openstaat.",
        `De vijfjaarstermijn voor een verzoek om ambtshalve vermindering loopt in beginsel tot en met 31 december ${Number(year) + 5}; dit garandeert geen vermindering.`,
      );
    }
    return;
  }
  if (!appealDateValid) {
    setModernAssessmentResult(
      "review",
      "Vul de datum in waarop beroep is ingesteld.",
      `De indicatieve beroepstermijn liep tot en met ${formatDate(appealDeadline)}.`,
    );
    return;
  }
  if (answers.modernAppealDate > appealDeadline) {
    setModernAssessmentResult(
      "review",
      "Het beroep lijkt te laat ingesteld. Controleer de postregel, ontvankelijkheid en eventuele verschoonbaarheid.",
      `De berekende uiterste datum was ${formatDate(appealDeadline)}.`,
    );
    return;
  }
  if (appealFinalStatus === "ongoing") {
    setModernAssessmentResult(
      "positive",
      "Reguliere beoordeling mogelijk: de beroepsprocedure loopt nog.",
    );
    return;
  }
  if (!["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
    .includes(appealFinalStatus)) {
    setModernAssessmentResult(
      "review",
      "Geef de actuele status van de beroepsprocedure op.",
    );
    return;
  }
  const finalDate = answers.modernAppealFinalDate || "";
  const finalInstance = answers.modernAppealFinalInstance || "";
  const finalEnding = answers.modernAppealFinalEnding || "";
  if (!formatDate(finalDate) || !finalInstance || !finalEnding) {
    setModernAssessmentResult(
      "review",
      "Vul de laatste uitspraak of beëindiging, de instantie en de wijze waarop de procedure eindigde in.",
    );
    return;
  }
  if (finalEnding === "referred" || appealFinalStatus === "other") {
    setModernAssessmentResult(
      "review",
      "Nader juridisch onderzoek noodzakelijk: de procedure kan nog lopen of de gegevens zijn niet voldoende om de onherroepelijkheid vast te stellen.",
    );
    return;
  }
  if (
    finalInstance === "supreme-court" &&
    finalEnding === "no-further-remedy" &&
    appealFinalStatus === "supreme-court"
  ) {
    setModernAssessmentResult(
      "review",
      "De Hoge Raad-uitspraak kan de procedure definitief hebben beëindigd. Bevestig dat geen verwijzing heeft plaatsgevonden en laat de procedurele mogelijkheid tot vermindering beoordelen.",
      "Na een definitieve uitspraak van de Hoge Raad zonder verwijzing wordt niet automatisch nog een termijn van zes weken opgeteld.",
    );
    return;
  }
  if (finalEnding === "withdrawn") {
    setModernAssessmentResult(
      "review",
      "De procedure is als ingetrokken gemarkeerd. Controleer welke uitspraak daardoor onherroepelijk is geworden en of nog een gewoon rechtsmiddel openstond.",
    );
    return;
  }
  const nextRemedyDeadline = getDeadlineAfterDays(finalDate, 42);
  if (
    ["district", "court-of-appeal"].includes(finalInstance) &&
    finalEnding === "no-appeal" &&
    nextRemedyDeadline >= getTodayDateValue()
  ) {
    setModernAssessmentResult(
      "positive",
      "Reguliere beoordeling mogelijk: de termijn voor het volgende gewone rechtsmiddel loopt nog.",
      `De indicatieve termijn loopt tot en met ${formatDate(nextRemedyDeadline)}. Controleer of beroep of cassatie daadwerkelijk openstond.`,
    );
    return;
  }
  if (
    ["district", "court-of-appeal"].includes(finalInstance) &&
    finalEnding === "no-appeal" &&
    nextRemedyDeadline < getTodayDateValue()
  ) {
    setModernAssessmentResult(
      "review",
      "De termijn voor het volgende gewone rechtsmiddel lijkt verstreken. Controleer of dit rechtsmiddel openstond en of de procedure onherroepelijk is; onderzoek daarna pas een eventuele andere verminderingsroute.",
      `De indicatieve termijn eindigde op ${formatDate(nextRemedyDeadline)}.`,
    );
    return;
  }
  setModernAssessmentResult(
    "review",
    "Nader juridisch onderzoek noodzakelijk: de opgegeven proceduregegevens bepalen niet automatisch of de aanslag onherroepelijk is of nog kan worden verminderd.",
  );
}

function loadPreliminaryAnswers() {
  try {
    const saved = sessionStorage.getItem(PRELIMINARY_STORAGE_KEY);
    if (saved === null) return;
    const parsed = JSON.parse(saved);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Ongeldig formaat voor de opgeslagen voorvragen.");
    }
    preliminaryByYear = parsed;
  } catch (error) {
    showError(`Voorvragen konden niet worden geladen: ${error.message}`);
  }
}

function getYearAnswers(year) {
  return preliminaryByYear[year] || {};
}

function saveYearAnswers(year, answers) {
  preliminaryByYear[year] = answers;
  try {
    sessionStorage.setItem(
      PRELIMINARY_STORAGE_KEY,
      JSON.stringify(preliminaryByYear),
    );
    preliminaryError.hidden = true;
    modernPreliminaryError.hidden = true;
  } catch (error) {
    const target = isModernAssessmentYear(year)
      ? modernPreliminaryError
      : preliminaryError;
    target.hidden = false;
    target.textContent =
      `Voorvragen konden niet worden opgeslagen: ${error.message}`;
  }
}

function selectedAnswer(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function restoreAnswer(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = false;
  });
  if (typeof value !== "string" || value === "") return;
  const input = document.querySelector(
    `input[name="${name}"][value="${value}"]`,
  );
  if (input) input.checked = true;
}

function renderPreliminary() {
  const year = yearSelect.value;
  const legacyYear = isPreliminaryYear(year);
  const modernYear = isModernAssessmentYear(year);
  const calculationYearSelected = isCalculationYear(year);
  preliminaryPanel.hidden = !legacyYear;
  modernPreliminaryPanel.hidden = !modernYear;
  const answers = legacyYear || modernYear ? getYearAnswers(year) : {};
  loadCalculationInputs(year);
  calculationSection.hidden = !calculationYearSelected;
  if (modernYear) {
    renderModernAssessment(answers, year);
    renderCalculation();
    return;
  }
  if (!legacyYear) {
    setReliefAccessStatus(RELIEF_ACCESS_STATUS.review);
    renderCalculation();
    return;
  }

  preliminaryYear.textContent = year;
  for (const name of questionNames) restoreAnswer(name, answers[name]);
  restoreAnswer("objection-submitted", answers["objection-submitted"]);
  restoreAnswer("objection-timely", answers["objection-timely"]);
  restoreAnswer("general-terms-law", answers.generalTermsLawApplied || "");
  restoreAnswer("excusable-delay", answers["excusable-delay"]);
  restoreAnswer("appeal-open-2021", answers["appeal-open-2021"]);
  for (const name of [
    "objection-decision",
    "objection-in-progress",
    "objection-decision-deadline-passed",
    "tax-appeal-filed",
    "tax-appeal-timely",
  ]) {
    restoreAnswer(name, answers[name]);
  }
  assessmentDate.value = answers.assessmentDate || "";
  generalTermsLawDate.value = answers.generalTermsLawDate || "";
  extensionUntil.value = answers.extensionUntil || "";
  objectionSubmissionDate.value = answers.objectionSubmissionDate || "";
  objectionAdvisoryCommittee.value = answers.objectionAdvisoryCommittee || "unknown";
  objectionMassalStatus.value = answers.objectionMassalStatus || "unknown";
  objectionPendingReason.value = answers.objectionPendingReason || "";
  objectionPendingOther.value = answers.objectionPendingOther || "";
  objectionDecisionDate.value = answers.objectionDecisionDate || "";
  objectionAnnouncementDate.value = answers.objectionAnnouncementDate || "";
  objectionDecisionOutcome.value = answers.objectionDecisionOutcome || "";
  taxAppealDate.value = answers.taxAppealDate || "";
  taxAppealStageDate.value = answers.taxAppealStageDate || "";
  taxAppealFinalOutcome.value = answers.taxAppealFinalOutcome || "";
  taxAppealEnding.value = answers.taxAppealEnding || "";
  taxAppealFinalDecisionDate.value = answers.taxAppealFinalDecisionDate || "";
  document.querySelector("#tax-appeal-subject").value = answers.taxAppealSubject || "";
  document.querySelector("#tax-appeal-status").value = answers.taxAppealStatus || "";

  const issued = answers["assessment-issued"];
  assessmentDateQuestion.hidden = issued !== "yes";
  formalLawQuestions.hidden = issued !== "no";
  extensionDateField.hidden =
    issued !== "no" || answers["extension-granted"] !== "yes";
  extensionUntil.required = !extensionDateField.hidden;
  assessmentDate.required = issued === "yes";
  const validAssessmentDate = Boolean(formatDate(answers.assessmentDate || ""));
  const latestSubmissionDate = getAssessmentObjectionDeadline(
    answers.assessmentDate,
    answers.generalTermsLawApplied,
    answers.generalTermsLawDate,
  );
  const baseObjectionDeadline = validAssessmentDate
    ? getDeadlineAfterDays(answers.assessmentDate, 42)
    : "";
  objectionDeadline.hidden = issued !== "yes" || !validAssessmentDate;
  generalTermsLawDateField.hidden =
    issued !== "yes" ||
    !validAssessmentDate ||
    answers.generalTermsLawApplied !== "yes";
  generalTermsLawDate.required = !generalTermsLawDateField.hidden;
  generalTermsLawDate.min = baseObjectionDeadline;
  generalTermsLawDate.max = baseObjectionDeadline
    ? getDeadlineAfterDays(baseObjectionDeadline, 7)
    : "";
  generalTermsLawDate.setAttribute(
    "aria-invalid",
    String(
      !generalTermsLawDateField.hidden &&
      Boolean(formatDate(answers.generalTermsLawDate || "")) &&
      !latestSubmissionDate,
    ),
  );
  objectionSubmittedQuestion.hidden =
    issued !== "yes" || !validAssessmentDate || !latestSubmissionDate;
  const objectionSubmitted = answers["objection-submitted"];
  timelyObjectionQuestion.hidden =
    issued !== "yes" ||
    objectionSubmitted !== "yes" ||
    !validAssessmentDate ||
    !latestSubmissionDate;
  const timelyObjection = answers["objection-timely"];
  objectionSubmissionDateField.hidden = timelyObjectionQuestion.hidden;
  excusableDelayQuestion.hidden =
    objectionSubmissionDateField.hidden || timelyObjection !== "no";
  if (excusableDelayQuestion.hidden) {
    document.querySelectorAll('input[name="excusable-delay"]').forEach((input) => {
      input.checked = false;
    });
  }
  objectionSubmissionDate.required = !objectionSubmissionDateField.hidden;
  objectionSubmissionDate.max =
    timelyObjection === "yes" ? latestSubmissionDate : "";
  objectionSubmissionDate.min =
    timelyObjection === "no"
      ? getDateAfter(latestSubmissionDate)
      : "";
  const submissionDate = answers.objectionSubmissionDate || "";
  const validSubmissionDate = Boolean(formatDate(submissionDate));
  const submissionDateOutOfRange =
    validSubmissionDate &&
    Boolean(latestSubmissionDate) &&
    ((timelyObjection === "yes" && submissionDate > latestSubmissionDate) ||
      (timelyObjection === "no" && submissionDate <= latestSubmissionDate));
  const objectionInadmissible =
    validSubmissionDate &&
    !submissionDateOutOfRange &&
    timelyObjection === "no" &&
    answers["excusable-delay"] === "no";
  objectionAdmissibilityBadge.textContent = objectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  objectionAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    objectionInadmissible,
  );
  objectionAdmissibilityBadge.hidden =
    objectionSubmissionDateField.hidden ||
    timelyObjection !== "yes" ||
    !validSubmissionDate ||
    submissionDateOutOfRange;
  objectionLateAdmissibilityBadge.hidden =
    objectionSubmissionDateField.hidden ||
    timelyObjection !== "no" ||
    !validSubmissionDate ||
    submissionDateOutOfRange ||
    !["yes", "no"].includes(answers["excusable-delay"]);
  objectionLateAdmissibilityBadge.textContent = objectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  objectionLateAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    objectionInadmissible,
  );
  objectionSubmissionDate.setAttribute(
    "aria-invalid",
    String(submissionDateOutOfRange),
  );
  renderObjectionDeadline(validAssessmentDate);
  const validObjectionDetails =
    Boolean(latestSubmissionDate) &&
    (objectionSubmitted === "no" ||
      (validSubmissionDate && !submissionDateOutOfRange));
  renderProcedureQuestions(
    answers,
    issued,
    objectionSubmitted,
    validAssessmentDate,
    validObjectionDetails,
  );
  renderFinality(
    answers,
    issued,
    objectionSubmitted,
    validAssessmentDate,
    validObjectionDetails,
  );
  legalConclusion.classList.toggle(
    "legal-conclusion-strong",
    blocksRegularAssessment(answers),
  );
  legalConclusion.hidden = !blocksRegularAssessment(answers);
  renderCalculation();
}

function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return "";
  }
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function toDateValue(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getTodayDateValue() {
  const date = new Date();
  return toDateValue(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
  );
}

function getAppealStartDate(decisionDate, announcementDate) {
  if (!formatDate(decisionDate) || !formatDate(announcementDate)) return "";
  return decisionDate >= announcementDate ? decisionDate : announcementDate;
}

function getAppealDeadline(decisionDate, announcementDate) {
  const startDate = getAppealStartDate(decisionDate, announcementDate);
  return startDate ? getDeadlineAfterDays(startDate, 42) : "";
}

function getDeadlineAfterDays(startDate, days) {
  if (!formatDate(startDate)) return "";
  const [year, month, day] = startDate.split("-").map(Number);
  return toDateValue(
    new Date(Date.UTC(year, month - 1, day) + days * 24 * 60 * 60 * 1000),
  );
}

function getAssessmentObjectionDeadline(assessmentDate, termsApplied, manualDate) {
  const baseDeadline = getDeadlineAfterDays(assessmentDate, 42);
  if (!baseDeadline) return "";
  if (termsApplied === "no") return baseDeadline;
  const latestAllowedDate = getDeadlineAfterDays(baseDeadline, 7);
  return termsApplied === "yes" &&
    formatDate(manualDate || "") &&
    manualDate >= baseDeadline &&
    manualDate <= latestAllowedDate
    ? manualDate
    : "";
}

function inferFinalityStatus(answers) {
  if (answers["assessment-issued"] === "no") return FINALITY_STATUS.no;
  if (
    answers["assessment-issued"] !== "yes" ||
    !formatDate(answers.assessmentDate || "")
  ) {
    return FINALITY_STATUS.unknown;
  }
  if (answers.assessmentDate >= KERSTARREST_DATE) {
    return FINALITY_STATUS.no;
  }

  const objectionDeadline = getLatestObjectionSubmissionDate(answers);
  if (!objectionDeadline) return FINALITY_STATUS.unknown;
  if (objectionDeadline >= KERSTARREST_DATE) return FINALITY_STATUS.no;

  if (answers["objection-submitted"] === "no") {
    return FINALITY_STATUS.yes;
  }
  if (answers["objection-submitted"] !== "yes") {
    return FINALITY_STATUS.unknown;
  }

  const submissionDate = answers.objectionSubmissionDate || "";
  if (!formatDate(submissionDate)) return FINALITY_STATUS.unknown;
  if (!isObjectionSubmissionValid(answers)) {
    return FINALITY_STATUS.unknown;
  }
  if (submissionDate > KERSTARREST_DATE) {
    return answers["excusable-delay"] === "no"
      ? FINALITY_STATUS.yes
      : FINALITY_STATUS.unknown;
  }
  if (
    answers["objection-timely"] === "no" &&
    answers["excusable-delay"] === "no"
  ) {
    return FINALITY_STATUS.yes;
  }
  if (
    answers["objection-timely"] !== "yes" &&
    answers["excusable-delay"] !== "yes"
  ) {
    return FINALITY_STATUS.unknown;
  }

  if (answers["objection-decision"] === "no") {
    return answers["objection-in-progress"] === "yes"
      ? FINALITY_STATUS.no
      : FINALITY_STATUS.unknown;
  }
  if (answers["objection-decision"] !== "yes") {
    return FINALITY_STATUS.unknown;
  }

  const announcementDate = answers.objectionAnnouncementDate || "";
  if (!formatDate(announcementDate)) return FINALITY_STATUS.unknown;
  if (announcementDate > KERSTARREST_DATE) return FINALITY_STATUS.no;

  const appealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    announcementDate,
  );
  if (!appealDeadline) return FINALITY_STATUS.unknown;
  if (appealDeadline >= KERSTARREST_DATE) return FINALITY_STATUS.no;
  if (answers["tax-appeal-filed"] === "no") {
    return FINALITY_STATUS.yes;
  }
  if (answers["tax-appeal-filed"] !== "yes") {
    return FINALITY_STATUS.unknown;
  }

  const taxAppealDateValue = answers.taxAppealDate || "";
  if (!formatDate(taxAppealDateValue)) return FINALITY_STATUS.unknown;
  const appealTimeliness = answers["tax-appeal-timely"];
  if (taxAppealDateValue > KERSTARREST_DATE) {
    return appealTimeliness === "no"
      ? FINALITY_STATUS.yes
      : FINALITY_STATUS.unknown;
  }
  if (appealTimeliness === "no") {
    return taxAppealDateValue > appealDeadline
      ? FINALITY_STATUS.yes
      : FINALITY_STATUS.unknown;
  }
  if (appealTimeliness !== "yes" || taxAppealDateValue > appealDeadline) {
    return FINALITY_STATUS.unknown;
  }
  if (answers.taxAppealStatus === "ongoing") {
    return FINALITY_STATUS.no;
  }
  if (["higher-appeal", "cassation"].includes(answers.taxAppealStatus)) {
    const stageDate = answers.taxAppealStageDate || "";
    return formatDate(stageDate) && stageDate <= KERSTARREST_DATE
      ? FINALITY_STATUS.no
      : FINALITY_STATUS.unknown;
  }
  if (answers.taxAppealStatus !== "completed") return FINALITY_STATUS.unknown;

  const endingDate = answers.taxAppealFinalDecisionDate || "";
  if (!formatDate(endingDate)) return FINALITY_STATUS.unknown;
  switch (answers.taxAppealEnding) {
    case "supreme-court-final":
    case "withdrawn":
      return endingDate <= KERSTARREST_DATE
        ? FINALITY_STATUS.yes
        : FINALITY_STATUS.no;
    case "district-no-appeal":
    case "appeals-court-no-cassation": {
      if (endingDate > KERSTARREST_DATE) return FINALITY_STATUS.no;
      const lastRemedyDeadline = getDeadlineAfterDays(endingDate, 42);
      return lastRemedyDeadline >= KERSTARREST_DATE
        ? FINALITY_STATUS.no
        : FINALITY_STATUS.yes;
    }
    case "supreme-court-referral":
      return FINALITY_STATUS.no;
    default:
      return FINALITY_STATUS.unknown;
  }
}

function canAskManualFinality(answers, objectionSubmitted, validAssessmentDate, validObjectionDetails) {
  const objectionDeadline = getLatestObjectionSubmissionDate(answers);
  if (
    answers["assessment-issued"] !== "yes" ||
    !validAssessmentDate ||
    !objectionDeadline ||
    !["yes", "no"].includes(objectionSubmitted)
  ) {
    return false;
  }
  if (objectionSubmitted === "no") return true;
  return (
    validObjectionDetails &&
    isObjectionSubmissionValid(answers) &&
    (answers["objection-timely"] === "yes" ||
      (answers["objection-timely"] === "no" &&
        ["yes", "no"].includes(answers["excusable-delay"])))
  );
}

function getFinalityStatus(answers) {
  if (answers["appeal-open-2021"] === "yes") return FINALITY_STATUS.yes;
  if (answers["appeal-open-2021"] === "no") return FINALITY_STATUS.no;
  return inferFinalityStatus(answers);
}

function getObjectionDecisionDeadlines(answers) {
  if (!formatDate(answers.assessmentDate || "")) return null;
  if (answers.objectionMassalStatus === "yes") {
    return {
      message:
        "De beslistermijn is opgeschort als dit bezwaar daadwerkelijk onder de aanwijzing massaal bezwaar valt. De termijn herleeft volgens de toepasselijke regeling na de collectieve uitspraak; controleer de aanwijzing en de dossierstatus.",
    };
  }
  const objectionDeadline = getLatestObjectionSubmissionDate(answers);
  if (!objectionDeadline) return null;
  const standardDeadline = getDeadlineAfterDays(objectionDeadline, 42);
  const committeeDeadline = getDeadlineAfterDays(objectionDeadline, 84);
  if (answers.objectionAdvisoryCommittee === "yes") {
    return {
      message: `Indicatieve hoofdregel met adviescommissie: ${formatDate(committeeDeadline)} (twaalf weken na het einde van de bezwaartermijn; de Algemene termijnenwet is niet automatisch toegepast).`,
    };
  }
  if (answers.objectionAdvisoryCommittee === "no") {
    return {
      message: `Indicatieve hoofdregel: ${formatDate(standardDeadline)} (zes weken na het einde van de bezwaartermijn; de Algemene termijnenwet is niet automatisch toegepast).`,
    };
  }
  return {
    message: `Indicatieve hoofdregel: ${formatDate(standardDeadline)} zonder adviescommissie of ${formatDate(committeeDeadline)} met adviescommissie. Controleer welke termijn geldt en of verdaging, verder uitstel of opschorting van toepassing is.`,
  };
}

function renderProcedureQuestions(answers, issued, objectionSubmitted, validAssessmentDate, validObjectionDetails) {
  const showOtherReason =
    !noObjectionDecisionQuestions.hidden && answers.objectionPendingReason === "other";
  objectionPendingOtherField.hidden = !showOtherReason;
  const objectionDecisionDeadline = getObjectionDecisionDeadlines(answers);
  objectionDecisionDeadlineDisplay.hidden =
    noObjectionDecisionQuestions.hidden || !objectionDecisionDeadline;
  objectionDecisionDeadlineDisplay.textContent =
    objectionDecisionDeadline?.message || "";

  const appealFiled = answers["tax-appeal-filed"];
  taxAppealQuestions.hidden = yesObjectionDecisionQuestions.hidden || appealFiled !== "yes";
  noTaxAppealQuestions.hidden = yesObjectionDecisionQuestions.hidden || appealFiled !== "no";
  const appealStartDate = getAppealStartDate(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const appealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const formattedAppealDeadline = appealDeadline ? formatDate(appealDeadline) : "";
  appealDeadlineDisplay.hidden = taxAppealQuestions.hidden || !formattedAppealDeadline;
  appealDeadlineDisplay.textContent = formattedAppealDeadline
    ? `Indicatieve uiterste datum beroep (zes weken vanaf ${formatDate(appealStartDate)}, zonder automatische toepassing van de Algemene termijnenwet): ${formattedAppealDeadline}.`
    : "Vul de dagtekening en datum van bekendmaking in om de beroepstermijn te berekenen.";
  const filedAppealDate = answers.taxAppealDate || "";
  const calculatedTimeliness =
    formatDate(filedAppealDate) && appealDeadline
      ? filedAppealDate <= appealDeadline
      : "";
  const selectedTimeliness = answers["tax-appeal-timely"];
  const appealTimelinessConflict =
    calculatedTimeliness !== "" &&
    ((calculatedTimeliness && selectedTimeliness === "no") ||
      (!calculatedTimeliness && selectedTimeliness === "yes"));
  appealDeadlineDisplay.classList.toggle("deadline-conflict", appealTimelinessConflict);
  if (appealTimelinessConflict) {
    appealDeadlineDisplay.textContent +=
      " Let op: dit wijkt af van het handmatig gekozen antwoord; controleer de datum en eventuele bijzondere omstandigheden.";
  }
  const appealStatus = answers.taxAppealStatus;
  taxAppealDate.required = !taxAppealQuestions.hidden;
  appealPendingNotice.hidden =
    taxAppealQuestions.hidden ||
    !["ongoing", "higher-appeal", "cassation"].includes(appealStatus);
  appealStageDateField.hidden =
    taxAppealQuestions.hidden ||
    !["higher-appeal", "cassation"].includes(appealStatus);
  taxAppealStageDate.required = !appealStageDateField.hidden;
  courtDecisionNotice.hidden =
    taxAppealQuestions.hidden || appealStatus !== "court-decided";
  appealFinalOutcomeFieldset.hidden =
    taxAppealQuestions.hidden || appealStatus !== "completed";
  appealEndingField.hidden =
    taxAppealQuestions.hidden || appealStatus !== "completed";
  appealFinalDecisionDateField.hidden =
    taxAppealQuestions.hidden || appealStatus !== "completed";
  taxAppealEnding.required = !appealEndingField.hidden;
  const endingDateRequired =
    !appealFinalDecisionDateField.hidden &&
    taxAppealEnding.value !== "other" &&
    taxAppealEnding.value !== "";
  taxAppealFinalDecisionDate.required = endingDateRequired;
  appealFinalDateLabel.textContent =
    taxAppealEnding.value === "withdrawn"
      ? "Datum waarop het rechtsmiddel is ingetrokken"
      : taxAppealEnding.value === "supreme-court-final"
        ? "Datum uitspraak Hoge Raad"
        : taxAppealEnding.value === "supreme-court-referral"
          ? "Datum uitspraak Hoge Raad waarbij is verwezen"
          : "Datum bekendmaking uitspraak rechtbank of gerechtshof";
  const noAppealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const noAppealDeadlineFormatted = noAppealDeadline ? formatDate(noAppealDeadline) : "";
  noAppealDeadlineDisplay.hidden = noTaxAppealQuestions.hidden || !noAppealDeadlineFormatted;
  noAppealDeadlineDisplay.textContent = noAppealDeadlineFormatted
    ? `Berekende uiterste datum beroep (vanaf de juridisch bepalende datum): ${noAppealDeadlineFormatted}.`
    : "Vul de dagtekening en datum van bekendmaking in om te controleren of de beroepstermijn is verstreken.";
  const today = getTodayDateValue();
  const appealTermExpired = Boolean(noAppealDeadline && today > noAppealDeadline);
  appealTimeRunningNotice.hidden =
    noTaxAppealQuestions.hidden || !noAppealDeadline || appealTermExpired;
  appealTimeExpiredNotice.hidden =
    noTaxAppealQuestions.hidden || !appealTermExpired;
  procedureQuestions.hidden = true;
}

function renderFinality(answers, issued, objectionSubmitted, validAssessmentDate, validObjectionDetails) {
  const showFinality = canAskManualFinality(
    answers,
    objectionSubmitted,
    validAssessmentDate,
    validObjectionDetails,
  );
  const manualFinalityAnswer = answers["appeal-open-2021"];
  const finalityStatus = manualFinalityAnswer === "yes"
    ? FINALITY_STATUS.yes
    : manualFinalityAnswer === "no"
      ? FINALITY_STATUS.no
      : FINALITY_STATUS.unknown;
  finalityQuestion.hidden = !showFinality;
  finalityReviewNotice.hidden = true;
  answers["finality-status"] = finalityStatus;
  const outcome = getLegalOutcome(answers);
  setReliefAccessStatus(
    RELIEF_ACCESS_STATUS[outcome?.status || "review"],
  );
  accessResult.hidden = !outcome;
  accessResult.className = `access-result${outcome ? ` access-result-${outcome.status}` : ""}`;
  accessResult.textContent = outcome?.message || "";
  accessResultProcedureNote.hidden = !outcome?.procedureNote;
  accessResultProcedureNote.textContent = outcome?.procedureNote || "";
  accessResultExplanation.hidden =
    !outcome || outcome.status !== "negative" || objectionSubmitted !== "no";
}

function hasUnresolvedAppealFinality(answers) {
  if (
    answers["objection-decision"] !== "yes" ||
    answers["tax-appeal-filed"] !== "yes"
  ) {
    return false;
  }
  const appealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const appealDate = answers.taxAppealDate || "";
  if (
    !appealDeadline ||
    appealDeadline >= KERSTARREST_DATE ||
    !formatDate(appealDate)
  ) {
    return false;
  }
  const selectedTimeliness = answers["tax-appeal-timely"];
  const calculatedTimeliness = appealDate <= appealDeadline;
  return (
    selectedTimeliness === "pending" ||
    (selectedTimeliness === "yes" && !calculatedTimeliness) ||
    (selectedTimeliness === "no" && calculatedTimeliness)
  );
}

function hasAccessToRelief(answers) {
  return getLegalOutcome(answers)?.status === "positive";
}

function getLegalOutcome(answers) {
  if (
    answers["assessment-issued"] !== "yes" ||
    !formatDate(answers.assessmentDate || "")
  ) {
    return null;
  }
  const objectionSubmitted = answers["objection-submitted"];
  if (!["yes", "no"].includes(objectionSubmitted)) return null;
  if (
    objectionSubmitted === "yes" &&
    !isObjectionSubmissionValid(answers)
  ) {
    return {
      status: "review",
      message:
        "Nader juridisch onderzoek noodzakelijk. Beantwoord eerst de vragen over de tijdigheid en indieningsdatum van het bezwaar.",
    };
  }
  const manualFinalityAnswer = answers["appeal-open-2021"];
  if (!["yes", "no"].includes(manualFinalityAnswer)) {
    return {
      status: "review",
      message:
        "Beantwoord vraag 5: stond de aanslag op 24 december 2021 al onherroepelijk vast?",
    };
  }

  if (manualFinalityAnswer === "yes") {
    return {
      status: "negative",
      message:
        "Geen toegang tot Wet rechtsherstel box 3. Ook geen recht op Ambtshalve vermindering.",
    };
  }
  return {
    status: "positive",
    message: "Wel toegang tot Wet rechtsherstel box 3.",
  };
}

function isObjectionSubmissionValid(answers) {
  const latestDate = getLatestObjectionSubmissionDate(answers);
  if (!latestDate) return false;
  if (answers["objection-submitted"] === "no") return true;
  if (answers["objection-submitted"] !== "yes") return false;
  if (!["yes", "no"].includes(answers["objection-timely"])) return false;
  if (
    answers["objection-timely"] === "no" &&
    !["yes", "no"].includes(answers["excusable-delay"])
  ) {
    return false;
  }
  const submittedDate = answers.objectionSubmissionDate || "";
  if (!formatDate(submittedDate)) return false;
  return answers["objection-timely"] === "yes"
    ? submittedDate <= latestDate
    : submittedDate > latestDate;
}

function renderObjectionDeadline(showDeadline) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(assessmentDate.value);
  if (!showDeadline || !match) {
    assessmentDateDisplay.hidden = true;
    assessmentDateText.textContent = "";
    objectionDeadline.hidden = true;
    objectionDeadlineDate.textContent = "";
    return;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    assessmentDateDisplay.hidden = true;
    assessmentDateText.textContent = "";
    objectionDeadline.hidden = true;
    objectionDeadlineDate.textContent = "";
    return;
  }
  const deadlineValue = getDeadlineAfterDays(assessmentDate.value, 42);
  const deadline = new Date(`${deadlineValue}T00:00:00Z`);
  const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  assessmentDateText.textContent = dateFormatter.format(date);
  assessmentDateDisplay.hidden = false;
  objectionDeadlineDate.textContent = dateFormatter.format(deadline);
  objectionDeadline.hidden = false;
}

function getLatestObjectionSubmissionDate(answers) {
  return getAssessmentObjectionDeadline(
    answers.assessmentDate || "",
    answers.generalTermsLawApplied || "",
    answers.generalTermsLawDate || "",
  );
}

function getDateAfter(dateValue) {
  if (!formatDate(dateValue || "")) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day) + 24 * 60 * 60 * 1000);
  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
    String(nextDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function blocksRegularAssessment(answers) {
  return (
    answers["deadline-expired"] === "yes" &&
    answers["extension-granted"] === "no" &&
    answers["legal-exception"] === "no"
  );
}

function updateModernQuestionnaire() {
  const year = yearSelect.value;
  const issued = selectedAnswer("modern-assessment-issued");
  const extension = selectedAnswer("modern-extension-status");
  const reliefApplied = selectedAnswer("modern-relief-applied");
  const generalTermsLawApplied = selectedAnswer("modern-general-terms-law");
  const generalTermsLawDateValue = modernGeneralTermsLawDate.value;
  const objectionDeadline = getAssessmentObjectionDeadline(
    modernAssessmentDate.value,
    generalTermsLawApplied,
    generalTermsLawDateValue,
  );
  const procedureActive =
    issued === "yes" &&
    Boolean(objectionDeadline) &&
    ["yes", "no"].includes(reliefApplied);
  const objectionStatus = selectedAnswer("modern-objection-status");
  const objectionDate = modernObjectionDate.value;
  const objectionIsLate =
    Boolean(formatDate(objectionDate)) &&
    Boolean(objectionDeadline) &&
    objectionDate > objectionDeadline;
  const objectionDeadlinePassed =
    Boolean(objectionDeadline) && objectionDeadline < getTodayDateValue();
  const aavRoute =
    issued === "yes" &&
    ["yes", "no"].includes(reliefApplied) &&
    ((objectionStatus === "no" && objectionDeadlinePassed) ||
      (objectionStatus === "yes" &&
        objectionIsLate &&
        selectedAnswer("modern-late-objection") === "no"));
  const aavRequestDate = modernAavRequestDate.value;
  const aavWithinDeadline =
    aavRoute &&
    Boolean(formatDate(aavRequestDate)) &&
    aavRequestDate >= modernAssessmentDate.value &&
    aavRequestDate <= `${Number(year) + 5}-12-31`;
  const objectionOutcome = selectedAnswer("modern-objection-outcome");
  const modernFinalityStatus = selectedAnswer("modern-finality-status");
  const appealStatus = selectedAnswer("modern-appeal-status");
  const appealDate = modernAppealDate.value;
  const appealProcedureStatus = modernAppealProcedureStatus.value;
  const answers = {
    modernAssessmentIssued: issued,
    modernAssessmentDate: issued === "yes" ? modernAssessmentDate.value : "",
    modernGeneralTermsLaw: issued === "yes" ? generalTermsLawApplied : "",
    modernGeneralTermsLawDate:
      issued === "yes" && generalTermsLawApplied === "yes"
        ? generalTermsLawDateValue
        : "",
    modernExtensionStatus: issued === "no" ? extension : "",
    modernExtensionDate:
      issued === "no" && extension === "yes" ? modernExtensionDate.value : "",
    modernReliefApplied:
      issued === "yes" ? reliefApplied : "",
    modernObjectionStatus:
      procedureActive ? objectionStatus : "",
    modernFinalityStatus:
      procedureActive && ["yes", "no"].includes(objectionStatus)
        ? modernFinalityStatus
        : "",
    modernObjectionDate:
      procedureActive && objectionStatus === "yes"
        ? objectionDate
        : "",
    modernLateObjection:
      procedureActive && objectionIsLate
        ? selectedAnswer("modern-late-objection")
        : "",
    modernObjectionOutcome:
      procedureActive &&
      objectionStatus === "yes" &&
      formatDate(objectionDate) &&
      (!objectionIsLate || selectedAnswer("modern-late-objection") === "yes")
        ? objectionOutcome
        : "",
    modernObjectionAnnouncementDate:
      procedureActive && objectionOutcome === "decided"
        ? modernObjectionAnnouncementDate.value
        : "",
    modernAppealStatus:
      procedureActive && objectionOutcome === "decided" ? appealStatus : "",
    modernAppealDate:
      procedureActive && objectionOutcome === "decided" && appealStatus === "yes"
        ? appealDate
        : "",
    modernAppealProcedureStatus:
      procedureActive &&
      objectionOutcome === "decided" &&
      appealStatus === "yes" &&
      formatDate(appealDate)
        ? appealProcedureStatus
        : "",
    modernAppealFinalDate:
      procedureActive &&
      ["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
        .includes(appealProcedureStatus)
        ? modernAppealFinalDate.value
        : "",
    modernAppealFinalInstance:
      procedureActive &&
      ["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
        .includes(appealProcedureStatus)
        ? modernAppealFinalInstance.value
        : "",
    modernAppealFinalEnding:
      procedureActive &&
      ["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
        .includes(appealProcedureStatus)
        ? modernAppealFinalEnding.value
        : "",
    modernAavRequestDate: aavRoute ? aavRequestDate : "",
    modernAavCounterproof:
      aavWithinDeadline ? selectedAnswer("modern-aav-counterproof") : "",
  };
  saveYearAnswers(year, answers);
  renderPreliminary();
}

function updateQuestionnaire() {
  const year = yearSelect.value;
  if (isModernAssessmentYear(year)) {
    updateModernQuestionnaire();
    return;
  }
  if (!isPreliminaryYear(year)) return;

  const issued = selectedAnswer("assessment-issued");
  const generalTermsLawApplied = selectedAnswer("general-terms-law");
  const generalTermsLawDateValue = generalTermsLawDate.value;
  const latestSubmissionDate = getAssessmentObjectionDeadline(
    assessmentDate.value,
    generalTermsLawApplied,
    generalTermsLawDateValue,
  );
  const objectionSubmitted = latestSubmissionDate
    ? selectedAnswer("objection-submitted")
    : "";
  const objectionTimely = selectedAnswer("objection-timely");
  const excusableDelay = selectedAnswer("excusable-delay");
  const objectionSubmissionDateValue = objectionSubmissionDate.value;
  const answersForObjectionValidation = {
    "assessment-issued": issued,
    assessmentDate: assessmentDate.value,
    generalTermsLawApplied,
    generalTermsLawDate: generalTermsLawApplied === "yes"
      ? generalTermsLawDateValue
      : "",
    "objection-submitted": objectionSubmitted,
    "objection-timely": objectionTimely,
    "excusable-delay": excusableDelay,
    objectionSubmissionDate: objectionSubmissionDateValue,
  };
  const objectionProcedureEligible =
    issued === "yes" &&
    objectionSubmitted === "yes" &&
    isObjectionSubmissionValid(answersForObjectionValidation);
  const objectionDecision = objectionProcedureEligible
    ? selectedAnswer("objection-decision")
    : "";
  const noDecisionBranch = objectionDecision === "no";
  const yesDecisionBranch = objectionDecision === "yes";
  const appealFiled =
    yesDecisionBranch ? selectedAnswer("tax-appeal-filed") : "";
  const taxAppealStatusValue =
    appealFiled === "yes"
      ? document.querySelector("#tax-appeal-status").value
      : "";
  const answers = {
    "assessment-issued": issued,
    assessmentDate:
      issued === "yes" ? assessmentDate.value : "",
    generalTermsLawApplied: issued === "yes" ? generalTermsLawApplied : "",
    generalTermsLawDate:
      issued === "yes" && generalTermsLawApplied === "yes"
        ? generalTermsLawDateValue
        : "",
    "objection-submitted":
      issued === "yes" ? objectionSubmitted : "",
    "objection-timely":
      issued === "yes" && objectionSubmitted === "yes"
        ? objectionTimely
        : "",
    objectionSubmissionDate:
      issued === "yes" &&
      objectionSubmitted === "yes"
        ? objectionSubmissionDateValue
        : "",
    "excusable-delay":
      issued === "yes" &&
      objectionSubmitted === "yes" &&
      objectionTimely === "no"
        ? excusableDelay
        : "",
    "appeal-open-2021":
      issued === "yes" &&
      (objectionSubmitted === "no" || objectionSubmitted === "yes")
        ? selectedAnswer("appeal-open-2021")
        : "",
    "deadline-expired":
      issued === "no" ? selectedAnswer("deadline-expired") : "",
    "extension-granted":
      issued === "no" ? selectedAnswer("extension-granted") : "",
    extensionUntil:
      issued === "no" && selectedAnswer("extension-granted") === "yes"
        ? extensionUntil.value
        : "",
    "legal-exception":
      issued === "no" ? selectedAnswer("legal-exception") : "",
    "objection-decision": objectionDecision,
    "objection-in-progress": noDecisionBranch
      ? selectedAnswer("objection-in-progress")
      : "",
    "objection-decision-deadline-passed": noDecisionBranch
      ? selectedAnswer("objection-decision-deadline-passed")
      : "",
    objectionAdvisoryCommittee: noDecisionBranch
      ? objectionAdvisoryCommittee.value
      : "unknown",
    objectionMassalStatus: noDecisionBranch
      ? objectionMassalStatus.value
      : "unknown",
    objectionPendingReason: noDecisionBranch
      ? objectionPendingReason.value
      : "",
    objectionPendingOther:
      noDecisionBranch && objectionPendingReason.value === "other"
        ? objectionPendingOther.value
        : "",
    objectionDecisionDate: yesDecisionBranch ? objectionDecisionDate.value : "",
    objectionAnnouncementDate: yesDecisionBranch
      ? objectionAnnouncementDate.value
      : "",
    objectionDecisionOutcome: yesDecisionBranch
      ? objectionDecisionOutcome.value
      : "",
    "tax-appeal-filed": appealFiled,
    taxAppealDate: appealFiled === "yes" ? taxAppealDate.value : "",
    taxAppealStageDate:
      appealFiled === "yes" ? taxAppealStageDate.value : "",
    taxAppealFinalOutcome:
      appealFiled === "yes" ? taxAppealFinalOutcome.value : "",
    taxAppealEnding:
      taxAppealStatusValue === "completed" ? taxAppealEnding.value : "",
    taxAppealFinalDecisionDate:
      taxAppealStatusValue === "completed" ? taxAppealFinalDecisionDate.value : "",
    "tax-appeal-timely":
      appealFiled === "yes" ? selectedAnswer("tax-appeal-timely") : "",
    taxAppealSubject:
      appealFiled === "yes"
        ? document.querySelector("#tax-appeal-subject").value
        : "",
    taxAppealStatus: taxAppealStatusValue,
  };
  answers["finality-status"] = getFinalityStatus(answers);
  saveYearAnswers(year, answers);
  renderPreliminary();
}

function showError(message) {
  status.hidden = false;
  status.textContent = message;
}

function renderTotal() {
  const year = yearSelect.value;
  bankLink.href = year
    ? `banktegoeden.html?year=${encodeURIComponent(year)}`
    : "banktegoeden.html";

  try {
    const sum = year ? getBankTotal(year) : 0;
    total.textContent = euro.format(sum);
    status.hidden = true;
  } catch (error) {
    showError(`Banktegoeden konden niet worden geladen: ${error.message}`);
    total.textContent = "—";
  }
  renderCalculation();
}

yearSelect.value = new URLSearchParams(window.location.search).get("year") || "";
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

renderTotal();
renderPreliminary();

modernPreliminaryPanel.addEventListener("input", updateQuestionnaire);
modernPreliminaryPanel.addEventListener("change", updateQuestionnaire);

for (const name of questionNames) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", updateQuestionnaire);
  });
}
for (const name of [
  "objection-submitted",
  "objection-timely",
  "general-terms-law",
  "excusable-delay",
  "appeal-open-2021",
  "objection-decision",
  "objection-in-progress",
  "objection-decision-deadline-passed",
  "tax-appeal-filed",
  "tax-appeal-timely",
]) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", updateQuestionnaire);
  });
}
objectionSubmissionDate.addEventListener("input", updateQuestionnaire);
objectionSubmissionDate.addEventListener("change", updateQuestionnaire);
assessmentDate.addEventListener("input", updateQuestionnaire);
assessmentDate.addEventListener("change", updateQuestionnaire);
generalTermsLawDate.addEventListener("input", updateQuestionnaire);
generalTermsLawDate.addEventListener("change", updateQuestionnaire);
extensionUntil.addEventListener("input", updateQuestionnaire);
extensionUntil.addEventListener("change", updateQuestionnaire);
for (const input of [debtsInput, partnerAllocation]) {
  input.addEventListener("input", updateCalculationInputs);
  input.addEventListener("change", updateCalculationInputs);
}
for (const input of fiscalPartnerQuestion) {
  input.addEventListener("change", updateCalculationInputs);
}
for (const input of document.querySelectorAll(
  "#procedure-questions input:not([type=\"radio\"]), #procedure-questions select",
)) {
  input.addEventListener("input", updateQuestionnaire);
  input.addEventListener("change", updateQuestionnaire);
}

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
    event.key === `${OTHER_ASSETS_STORAGE_KEY}:${yearSelect.value}`
  ) {
    renderCalculation();
  }
});
