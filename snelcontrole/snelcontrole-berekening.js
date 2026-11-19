"use strict";

// Snelcontrole OWR: rekenlogica zonder DOM. Gebruikt calculateBox3Year
// (forfaitair, laagste van oude methode en Wet rechtsherstel voor 2017-2022) en de
// functies van de tegenbewijsregeling, zodat de uitkomst gelijk is aan het dashboard.

const QUICK_CHECK_YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Signaalgrenzen voor de plausibiliteitscontrole. Dit zijn geen wettelijke normen,
// alleen drempels waarboven de tool vraagt de opgave na te kijken.
const QUICK_CHECK_LIMITS = {
  highReturnRate: 0.15,
  lowReturnRate: -0.3,
  bankOnlyReturnRate: 0.05,
  assessmentTolerance: 1,
};

// parseDutchAmount staat in gedeeld/bedrag.js.

function quickCheckRoute(year) {
  const numericYear = Number(year);
  if (numericYear <= 2020) {
    return { label: "OWR, alleen bij formele toegang", level: "warning" };
  }
  if (numericYear <= 2024) return { label: "OWR", level: "ok" };
  return { label: "Via aangifte, niet via OWR", level: "warning" };
}

function quickCheckRowIsEmpty(row) {
  return ["bank", "other", "cash", "debts", "actualReturn", "assessedTax"]
    .every((field) => row[field] === undefined || row[field] === null || String(row[field]).trim() === "");
}

// Berekent één jaar van de snelcontrole. `row` bevat de ruwe invoer (tekst).
function calculateQuickCheckYear(row) {
  const year = String(row.year);
  const data = BOX3_YEAR_DATA[year];
  if (!data) throw new Error(`Voor ${year} zijn geen jaargegevens beschikbaar.`);
  const bank = parseDutchAmount(row.bank, { label: "Banktegoeden" }) ?? 0;
  const other = parseDutchAmount(row.other, { label: "Overige bezittingen" }) ?? 0;
  const cash = parseDutchAmount(row.cash, { label: "Waarvan contant geld" }) ?? 0;
  const debts = parseDutchAmount(row.debts, { label: "Schulden" }) ?? 0;
  const actualInput = parseDutchAmount(row.actualReturn, { signed: true, label: "Werkelijk rendement" });
  const assessed = parseDutchAmount(row.assessedTax, { label: "Belasting volgens aanslag" });
  if (cash > other) {
    throw new Error("Contant geld is onderdeel van de overige bezittingen en kan niet hoger zijn dan dat totaal.");
  }
  const fiscalPartner = Boolean(row.fiscalPartner);
  let allocationPercent = 100;
  if (fiscalPartner) {
    const rawAllocation = String(row.allocationPercent ?? "").trim();
    allocationPercent = Number(rawAllocation);
    if (rawAllocation === "" || !Number.isInteger(allocationPercent) || allocationPercent < 0 || allocationPercent > 100) {
      throw new Error("Vul voor de verdeling een heel percentage van 0 tot en met 100 in.");
    }
  }

  const forfaitary = calculateBox3Year({
    year, bankTotal: bank, otherAssetsTotal: other, cashTotal: cash, debts,
    fiscalPartner, allocationPercent,
  });

  const hasActual = actualInput !== null;
  const actualTotal = hasActual ? Math.max(0, actualInput) : null;
  const actualShares = hasActual
    ? allocateActualReturn({ total: actualTotal, fiscalPartner, allocationPercent })
    : forfaitary.forfaitaryIncomes;
  const comparison = compareActualReturn({
    actualShares,
    forfaitaryIncomes: forfaitary.forfaitaryIncomes,
    fiscalPartner,
    taxRate: data.taxRate,
  });
  const overview = buildTaxOverview({ persons: comparison.persons, taxRate: data.taxRate });
  const forfaitaryTax = overview.total.forfaitaryTax;
  const appliedTax = hasActual ? overview.total.appliedTax : forfaitaryTax;
  const actualTax = hasActual ? overview.total.actualTax : null;
  const forfaitaryIncome = roundToTwoDecimals(
    forfaitary.forfaitaryIncomes[0] + (fiscalPartner ? forfaitary.forfaitaryIncomes[1] : 0),
  );

  const signals = [];
  const route = quickCheckRoute(year);
  if (route.level === "warning") signals.push({ level: "warning", text: route.label + "." });
  if (year === "2026") {
    signals.push({ level: "info", text: "Forfaits banktegoeden en schulden 2026 zijn voorlopig." });
  }
  if (forfaitary.taxableBase === 0) {
    signals.push({ level: "info", text: "Vermogen valt binnen het heffingsvrij vermogen: geen box 3-belasting." });
  }
  if (hasActual) {
    if (actualInput < 0) {
      signals.push({ level: "info", text: "Werkelijk rendement is negatief en wordt op € 0 gesteld." });
    }
    const grossAssets = bank + other;
    if (grossAssets > 0) {
      const rate = actualInput / grossAssets;
      if (rate > QUICK_CHECK_LIMITS.highReturnRate) {
        signals.push({ level: "warning", text: `Opgegeven rendement is ${formatQuickCheckPercent(rate)} van de bezittingen: ongebruikelijk hoog, controleer de opgave.` });
      } else if (rate < QUICK_CHECK_LIMITS.lowReturnRate) {
        signals.push({ level: "warning", text: `Opgegeven rendement is ${formatQuickCheckPercent(rate)} van de bezittingen: ongebruikelijk laag, controleer de opgave.` });
      }
      if (other === 0 && actualInput > bank * QUICK_CHECK_LIMITS.bankOnlyReturnRate) {
        signals.push({ level: "warning", text: "Alleen banktegoeden, maar een rendement van meer dan 5%: controleer rente en valutaresultaat." });
      }
    } else if (actualInput !== 0) {
      signals.push({ level: "warning", text: "Rendement opgegeven zonder bezittingen op 1 januari: controleer of er bezittingen ná 1 januari zijn verkregen." });
    }
    if (!comparison.anyActual && forfaitary.taxableBase > 0) {
      signals.push({ level: "info", text: "Werkelijk rendement is niet lager dan het forfaitaire voordeel: geen vermindering." });
    }
  }
  let difference = null;
  let assessmentCheck = null;
  if (assessed !== null) {
    difference = roundToTwoDecimals(assessed - appliedTax);
    assessmentCheck = roundToTwoDecimals(assessed - forfaitaryTax);
    // Herken welke berekening de aanslag vermoedelijk volgt (hele euro's per persoon).
    const wholeTax = (incomes) => wholeEuroBox3Tax(incomes[0], data.taxRate) +
      (fiscalPartner ? wholeEuroBox3Tax(incomes[1], data.taxRate) : 0);
    const reliefWholeTax = wholeTax([forfaitary.relief.firstPartnerIncome, forfaitary.relief.secondPartnerIncome]);
    const oldWholeTax = wholeTax([forfaitary.old.oldFirstPartnerIncome, forfaitary.old.oldSecondPartnerIncome]);
    const matches = (value) => Math.abs(assessed - value) <= QUICK_CHECK_LIMITS.assessmentTolerance;
    if (Math.abs(assessmentCheck) <= QUICK_CHECK_LIMITS.assessmentTolerance) {
      // Aanslag komt overeen met de forfaitaire berekening van de tool.
    } else if (forfaitary.oldMethodApplies && matches(reliefWholeTax)) {
      signals.push({
        level: "warning",
        text: `Aanslag volgt de Wet rechtsherstel (${formatCalculationEuroWhole(reliefWholeTax)}), maar de oude methode is lager (${formatCalculationEuroWhole(oldWholeTax)}).`,
      });
    } else if (forfaitary.yearUsesOldMethodComparison && !forfaitary.oldMethodApplies && matches(oldWholeTax)) {
      signals.push({
        level: "info",
        text: `Aanslag volgt de oude methode (${formatCalculationEuroWhole(oldWholeTax)}); de Wet rechtsherstel is lager (${formatCalculationEuroWhole(reliefWholeTax)}).`,
      });
    } else {
      signals.push({
        level: "warning",
        text: `Aanslag wijkt ${formatCalculationEuroWhole(Math.abs(assessmentCheck))} ${assessmentCheck > 0 ? "omhoog" : "omlaag"} af van de forfaitaire berekening: controleer de invoer (vrijstellingen, partnerverdeling) of de aanslag.`,
      });
    }
  }

  return {
    year, route, forfaitary, forfaitaryIncome, forfaitaryMethod: forfaitary.forfaitaryMethod,
    hasActual, actualTotal, actualShares, comparison,
    forfaitaryTax, actualTax, appliedTax, assessed, difference, assessmentCheck, signals,
  };
}

function formatQuickCheckPercent(rate) {
  return new Intl.NumberFormat("nl-NL", { style: "percent", maximumFractionDigits: 1 }).format(rate);
}

// Rekent alle ingevulde jaren door. Lege jaren worden overgeslagen; een fout in
// één jaar blokkeert de andere jaren niet.
function calculateQuickCheck(rows) {
  const results = rows
    .filter((row) => !quickCheckRowIsEmpty(row))
    .map((row) => {
      try {
        return { year: String(row.year), ok: true, result: calculateQuickCheckYear(row) };
      } catch (error) {
        return { year: String(row.year), ok: false, error: error.message };
      }
    });
  const valid = results.filter((entry) => entry.ok).map((entry) => entry.result);
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  const withAssessment = valid.filter((result) => result.assessed !== null);
  const totals = {
    forfaitaryTax: sum(valid.map((result) => result.forfaitaryTax)),
    appliedTax: sum(valid.map((result) => result.appliedTax)),
    reduction: sum(valid.map((result) => result.forfaitaryTax - result.appliedTax)),
    assessed: withAssessment.length ? roundToTwoDecimals(sum(withAssessment.map((result) => result.assessed))) : null,
    difference: withAssessment.length ? roundToTwoDecimals(sum(withAssessment.map((result) => result.difference))) : null,
    yearsWithAssessment: withAssessment.length,
    errors: results.filter((entry) => !entry.ok).length,
  };
  return { results, totals };
}
