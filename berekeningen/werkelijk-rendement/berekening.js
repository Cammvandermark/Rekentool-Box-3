"use strict";

// Werkelijk rendement volgens de Wet tegenbewijsregeling box 3.
// 2017-2022: art. 6a Wet rechtsherstel box 3; vanaf 2023: art. 5.25-5.36 Wet IB 2001.
// Dit bestand bevat alleen rekenlogica (geen DOM), zodat het ook op de
// invoerpagina en in de tests kan worden gebruikt.

const ACTUAL_RETURN_CATEGORIES = ["bank", "cash", "asset", "home", "debt"];

const ACTUAL_RETURN_ASSET_TYPES = [
  ["securities", "Aandelen, obligaties, fondsen"],
  ["crypto", "Cryptovaluta"],
  ["claims", "Uitgeleend geld en andere vorderingen"],
  ["foreign-real-estate", "Onroerende zaak zonder WOZ-waarde (bijv. buitenland)"],
  ["capital-insurance", "Kapitaalverzekering (niet-vrijgesteld deel)"],
  ["periodic-rights", "Recht op periodieke uitkeringen"],
  ["other", "Overige bezittingen"],
];

function actualReturnRound(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const actualReturnEuro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatActualReturnEuro(value) {
  return actualReturnEuro.format(value);
}

function actualReturnDaysInYear(year) {
  const numericYear = Number(year);
  const leap = (numericYear % 4 === 0 && numericYear % 100 !== 0) || numericYear % 400 === 0;
  return leap ? 366 : 365;
}

// Aantal verstreken dagen vanaf 1 januari tot de opgegeven datum (1 januari = 0).
function actualReturnElapsedDays(year, isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || "");
  if (!match || Number(match[1]) !== Number(year)) {
    throw new Error(`Datum ${isoDate} valt niet in ${year}.`);
  }
  const start = Date.UTC(Number(year), 0, 1);
  const date = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const days = Math.round((date - start) / 86400000);
  if (days < 0 || days >= actualReturnDaysInYear(year)) {
    throw new Error(`Datum ${isoDate} valt niet in ${year}.`);
  }
  return days;
}

function actualReturnNumber(item, field, { signed = false, label = field } = {}) {
  const raw = item[field];
  if (raw === undefined || raw === null || raw === "") return 0;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${item.name || "Regel zonder omschrijving"}: ${label} is geen geldig bedrag.`);
  }
  if (!signed && value < 0) {
    throw new Error(`${item.name || "Regel zonder omschrijving"}: ${label} mag niet negatief zijn.`);
  }
  return value;
}

function calculateBankLine(item) {
  const interest = actualReturnNumber(item, "interest", { label: "ontvangen rente" });
  const negativeInterest = actualReturnNumber(item, "negativeInterest", { label: "betaalde (negatieve) rente" });
  const currencyResult = actualReturnNumber(item, "currencyResult", { signed: true, label: "valutaresultaat" });
  const amount = actualReturnRound(interest - negativeInterest + currencyResult);
  const parts = [`${formatActualReturnEuro(interest)} rente`];
  if (negativeInterest) parts.push(`− ${formatActualReturnEuro(negativeInterest)} negatieve rente`);
  if (currencyResult) parts.push(`${currencyResult < 0 ? "−" : "+"} ${formatActualReturnEuro(Math.abs(currencyResult))} valutaresultaat`);
  return { amount, explanation: `${parts.join(" ")} = ${formatActualReturnEuro(amount)}` };
}

function calculateCashLine(item) {
  if (!item.foreignCurrency) {
    return {
      amount: 0,
      explanation: "Contant geld in euro's: geen rente en geen waardeverandering = € 0,00",
    };
  }
  const currencyResult = actualReturnNumber(item, "currencyResult", { signed: true, label: "valutaresultaat" });
  const amount = actualReturnRound(currencyResult);
  return { amount, explanation: `Valutaresultaat = ${formatActualReturnEuro(amount)}` };
}

function calculateAssetLine(item) {
  const startValue = actualReturnNumber(item, "startValue", { label: "waarde 1 januari" });
  let endValue = actualReturnNumber(item, "endValue", { label: "waarde 31 december" });
  let deposits = actualReturnNumber(item, "deposits", { label: "stortingen/aankopen" });
  let withdrawals = actualReturnNumber(item, "withdrawals", { label: "onttrekkingen/verkopen" });
  const income = actualReturnNumber(item, "income", { label: "ontvangen opbrengsten" });
  const prefix = [];

  // Kapitaalverzekering: het niet-vrijgestelde percentage van 1 januari geldt ook
  // voor de eindwaarde, de premies en de uitkeringen (de waarde uit A.1 is al het
  // niet-vrijgestelde deel).
  if (item.assetType === "capital-insurance" && item.nonExemptPercent !== undefined && item.nonExemptPercent !== "") {
    const percent = Number(item.nonExemptPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new Error(`${item.name || "Kapitaalverzekering"}: het niet-vrijgestelde percentage moet tussen 0 en 100% liggen.`);
    }
    endValue = actualReturnRound(endValue * percent / 100);
    deposits = actualReturnRound(deposits * percent / 100);
    withdrawals = actualReturnRound(withdrawals * percent / 100);
    prefix.push(`niet-vrijgesteld deel ${percent}% toegepast op eindwaarde, premies en uitkeringen`);
  }

  // Recht op periodieke uitkeringen: een waardedaling door het verstrijken van de
  // tijd of een hogere leeftijd is geen verlies maar een onttrekking. Alleen de
  // werkelijk ontvangen uitkeringen (en een eventuele waardestijging) zijn rendement.
  if (item.assetType === "periodic-rights" && endValue < startValue) {
    const decline = actualReturnRound(startValue - endValue);
    withdrawals = actualReturnRound(withdrawals + decline);
    prefix.push(`waardedaling ${formatActualReturnEuro(decline)} telt als onttrekking`);
  }

  const amount = actualReturnRound(endValue - startValue - deposits + withdrawals + income);
  const explanation =
    `${prefix.length ? `${prefix.join("; ")}: ` : ""}${formatActualReturnEuro(endValue)} − ${formatActualReturnEuro(startValue)} − ${formatActualReturnEuro(deposits)} + ${formatActualReturnEuro(withdrawals)} + ${formatActualReturnEuro(income)} opbrengsten = ${formatActualReturnEuro(amount)}`;
  return { amount, explanation };
}

// Woning met WOZ-waarde (art. 5.31): beginwaarde = WOZ voor dit jaar, eindwaarde =
// WOZ voor het volgende jaar. Bij aan- of verkoop tijdens het jaar telt de
// waardeverandering tijdsevenredig (art. 5.31 lid 2 onderdeel c via storting/onttrekking).
function calculateHomeLine(item, year) {
  const wozCurrent = actualReturnNumber(item, "wozCurrent", { label: `WOZ-waarde ${year}` });
  const wozNext = actualReturnNumber(item, "wozNext", { label: `WOZ-waarde ${Number(year) + 1}` });
  const improvement = actualReturnNumber(item, "improvement", { label: "gemelde investering" });
  const rent = actualReturnNumber(item, "rent", { label: "kale huur" });
  const ownUse = actualReturnNumber(item, "ownUseBenefit", { label: "voordeel eigen gebruik" });
  const ratioInput = item.rentedRatio === undefined || item.rentedRatio === null || item.rentedRatio === ""
    ? 100
    : Number(item.rentedRatio);
  if (!Number.isFinite(ratioInput) || ratioInput <= 0 || ratioInput > 100) {
    throw new Error(`${item.name || "Woning zonder omschrijving"}: de leegwaarderatio moet tussen 0 en 100% liggen.`);
  }
  if (improvement > wozNext) {
    throw new Error(`${item.name || "Woning zonder omschrijving"}: de investering is hoger dan de WOZ-eindwaarde.`);
  }
  const days = actualReturnDaysInYear(year);
  const startDay = item.acquiredDate ? actualReturnElapsedDays(year, item.acquiredDate) : 0;
  const endDay = item.disposedDate ? actualReturnElapsedDays(year, item.disposedDate) : days;
  if (endDay < startDay) {
    throw new Error(`${item.name || "Woning zonder omschrijving"}: de verkoopdatum ligt vóór de aankoopdatum.`);
  }
  const ratio = ratioInput / 100;
  const startValue = actualReturnRound(wozCurrent * ratio);
  const endValue = actualReturnRound((wozNext - improvement) * ratio);
  const fraction = (endDay - startDay) / days;
  const valueChange = actualReturnRound((endValue - startValue) * fraction);
  const ownUseApplies = Number(year) >= 2026;
  const amount = actualReturnRound(valueChange + rent + (ownUseApplies ? ownUse : 0));

  const parts = [];
  const endLabel = improvement
    ? `(${formatActualReturnEuro(wozNext)} − ${formatActualReturnEuro(improvement)} investering)`
    : formatActualReturnEuro(wozNext);
  const ratioLabel = ratio < 1 ? ` × ${ratioInput}% leegwaarderatio` : "";
  const fractionLabel = fraction < 1 ? ` × ${endDay - startDay}/${days} dagen` : "";
  parts.push(`(${endLabel} − ${formatActualReturnEuro(wozCurrent)})${ratioLabel}${fractionLabel} = ${formatActualReturnEuro(valueChange)} waardeverandering`);
  if (rent) parts.push(`+ ${formatActualReturnEuro(rent)} kale huur`);
  if (ownUse && ownUseApplies) parts.push(`+ ${formatActualReturnEuro(ownUse)} voordeel eigen gebruik`);
  return {
    amount,
    explanation: `${parts.join(" ")}${parts.length > 1 ? ` = ${formatActualReturnEuro(amount)}` : ""}`,
    ownUseIgnored: ownUse > 0 && !ownUseApplies,
  };
}

function calculateDebtLine(item) {
  const interestPaid = actualReturnNumber(item, "interestPaid", { label: "betaalde rente" });
  const currencyResult = actualReturnNumber(item, "currencyResult", { signed: true, label: "valutaresultaat of kwijtschelding" });
  const amount = actualReturnRound(-interestPaid + currencyResult);
  const currencyPart = currencyResult
    ? ` ${currencyResult < 0 ? "−" : "+"} ${formatActualReturnEuro(Math.abs(currencyResult))} valutaresultaat/kwijtschelding`
    : "";
  return { amount, explanation: `− ${formatActualReturnEuro(interestPaid)} betaalde rente${currencyPart} = ${formatActualReturnEuro(amount)}` };
}

// Vrijstelling (art. 5.31b en 5.32): niet-meetellend deel =
// rendement × vrijstelling / waarde aan het begin van het jaar (maximaal 100%).
function calculateExemptPart({ returnAmount, startTotal, exemption }) {
  if (!exemption || startTotal <= 0 || returnAmount === 0) return { exempt: 0, share: 0 };
  const share = Math.min(1, exemption / startTotal);
  return { exempt: actualReturnRound(returnAmount * share), share };
}

function calculateActualReturn({ year, items, fiscalPartner, data }) {
  if (!Array.isArray(items)) throw new Error("De invoer voor werkelijk rendement is ongeldig.");
  const householdCount = fiscalPartner ? 2 : 1;
  const categories = { bank: 0, cash: 0, asset: 0, home: 0, debt: 0 };
  const lines = [];
  const notes = [];
  let greenReturn = 0;
  let greenStart = 0;
  let foreignCashReturn = 0;
  let cashStart = 0;

  for (const item of items) {
    if (!ACTUAL_RETURN_CATEGORIES.includes(item.category)) {
      throw new Error(`Onbekende categorie: ${item.category}.`);
    }
    let line;
    if (item.category === "bank") line = calculateBankLine(item);
    if (item.category === "cash") line = calculateCashLine(item);
    if (item.category === "asset") line = calculateAssetLine(item);
    if (item.category === "home") line = calculateHomeLine(item, year);
    if (item.category === "debt") line = calculateDebtLine(item);
    if (line.ownUseIgnored) {
      notes.push(`${item.name || "Woning"}: het voordeel uit eigen gebruik telt pas vanaf 2026 mee (art. 5.27a Wet IB 2001).`);
    }
    categories[item.category] = actualReturnRound(categories[item.category] + line.amount);
    lines.push({ id: item.id, name: item.name, category: item.category, amount: line.amount, explanation: line.explanation });

    if (item.category === "cash") {
      cashStart += actualReturnNumber(item, "startValue", { label: "bedrag 1 januari" });
      if (item.foreignCurrency) foreignCashReturn += line.amount;
    }
    if (item.green && (item.category === "bank" || item.category === "asset")) {
      greenReturn += line.amount;
      greenStart += actualReturnNumber(item, "startValue", { label: "waarde 1 januari" });
    }
  }

  const cash = calculateExemptPart({
    returnAmount: actualReturnRound(foreignCashReturn),
    startTotal: cashStart,
    exemption: (data.cashExemption || 0) * householdCount,
  });
  const green = calculateExemptPart({
    returnAmount: actualReturnRound(greenReturn),
    startTotal: greenStart,
    exemption: (data.greenExemption || 0) * householdCount,
  });

  const grossTotal = actualReturnRound(
    categories.bank + categories.cash + categories.asset + categories.home + categories.debt,
  );
  const totalBeforeFloor = actualReturnRound(grossTotal - cash.exempt - green.exempt);
  const total = Math.max(0, totalBeforeFloor);
  if (totalBeforeFloor < 0) {
    notes.push("Het werkelijke rendement is negatief en wordt op € 0 gesteld. Een verlies schuift niet door naar een ander jaar.");
  }

  return {
    categories, lines, notes, grossTotal,
    cashExempt: cash.exempt, cashExemptShare: cash.share,
    greenExempt: green.exempt, greenExemptShare: green.share,
    totalBeforeFloor, total,
  };
}

// Toerekening aan partners naar rato van de verdeling van de grondslag sparen en
// beleggen (art. 5.25 lid 4-5 Wet IB 2001).
function allocateActualReturn({ total, fiscalPartner, allocationPercent }) {
  if (!fiscalPartner) return [actualReturnRound(total), 0];
  const first = actualReturnRound(total * allocationPercent / 100);
  return [first, actualReturnRound(total - first)];
}

// Vergelijking per persoon: het werkelijke rendement geldt alleen als het lager is
// dan het forfaitaire voordeel van die persoon.
function compareActualReturn({ actualShares, forfaitaryIncomes, fiscalPartner, taxRate }) {
  const persons = (fiscalPartner ? [0, 1] : [0]).map((index) => {
    const forfaitary = actualReturnRound(forfaitaryIncomes[index] || 0);
    const actual = actualReturnRound(actualShares[index] || 0);
    const usesActual = actual < forfaitary;
    const applied = usesActual ? actual : forfaitary;
    const forfaitaryTax = actualReturnRound(forfaitary * taxRate / 100);
    const appliedTax = actualReturnRound(applied * taxRate / 100);
    return { forfaitary, actual, usesActual, applied, forfaitaryTax, appliedTax };
  });
  const forfaitaryTax = actualReturnRound(persons.reduce((sum, person) => sum + person.forfaitaryTax, 0));
  const appliedTax = actualReturnRound(persons.reduce((sum, person) => sum + person.appliedTax, 0));
  return {
    persons, forfaitaryTax, appliedTax,
    reduction: actualReturnRound(forfaitaryTax - appliedTax),
    anyActual: persons.some((person) => person.usesActual),
  };
}

// Box 3-belasting zoals op de aanslag: inkomen per persoon in hele euro's naar
// beneden, belasting = tarief × afgerond inkomen, naar beneden.
function wholeEuroBox3Tax(income, taxRate) {
  const wholeIncome = Math.floor(Math.max(0, income) + 1e-9);
  return Math.floor(wholeIncome * taxRate / 100 + 1e-9);
}

// Overzicht van de te betalen box 3-belasting per persoon en in totaal:
// volgens de aanslag (optioneel), forfaitair, bij werkelijk rendement en na
// tegenbewijs (laagste), plus het verschil met de aanslag.
function buildTaxOverview({ persons, taxRate, assessedTaxes = [] }) {
  const rows = persons.map((person, index) => {
    const raw = assessedTaxes[index];
    const assessed = raw === undefined || raw === null || raw === "" ? null : Number(raw);
    if (assessed !== null && (!Number.isFinite(assessed) || assessed < 0)) {
      throw new Error("De box 3-belasting volgens de aanslag moet een bedrag van nul of hoger zijn.");
    }
    const forfaitaryTax = wholeEuroBox3Tax(person.forfaitary, taxRate);
    const actualTax = wholeEuroBox3Tax(person.actual, taxRate);
    const appliedTax = wholeEuroBox3Tax(person.applied, taxRate);
    return {
      assessed,
      forfaitaryTax,
      actualTax,
      appliedTax,
      differenceWithAssessment: assessed === null ? null : actualReturnRound(assessed - appliedTax),
      assessmentCheck: assessed === null ? null : actualReturnRound(assessed - forfaitaryTax),
    };
  });
  const sum = (field) => rows.reduce((total, row) => total + (row[field] ?? 0), 0);
  const anyAssessed = rows.some((row) => row.assessed !== null);
  const allAssessed = rows.every((row) => row.assessed !== null);
  const total = {
    assessed: anyAssessed ? actualReturnRound(sum("assessed")) : null,
    forfaitaryTax: sum("forfaitaryTax"),
    actualTax: sum("actualTax"),
    appliedTax: sum("appliedTax"),
    differenceWithAssessment: allAssessed ? actualReturnRound(sum("assessed") - sum("appliedTax")) : null,
    assessmentCheck: allAssessed ? actualReturnRound(sum("assessed") - sum("forfaitaryTax")) : null,
  };
  return { rows, total, anyAssessed, allAssessed };
}
