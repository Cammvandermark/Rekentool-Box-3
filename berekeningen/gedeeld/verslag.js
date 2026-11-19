"use strict";

// B. Verantwoording en afdrukken: een volledig, afdrukbaar verslag van de
// berekening van het gekozen jaar, met alle jaargegevens, tussenstappen en
// bronnen. Bevat geen persoonsgegevens: regels zonder omschrijving krijgen een
// genummerde naam.

let calculationReport = null;
let actualReturnReport = null;

const reportContent = document.querySelector("#report-content");
const reportPrintButton = document.querySelector("#report-print");

const reportPercent = (value, decimals = 2) => `${new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
}).format(value)}%`;
const reportEuro = (value) => formatCalculationEuro(value);
const reportWhole = (value) => formatCalculationEuroWhole(value);

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  for (const child of children) if (child) node.append(child);
  return node;
}

function reportTable(head, rows, { className = "report-table" } = {}) {
  const table = el("table", { className });
  if (head) {
    const tr = el("tr");
    head.forEach((label) => tr.append(el("th", { text: label })));
    table.append(el("thead", {}, [tr]));
  }
  const tbody = el("tbody");
  for (const row of rows) {
    const tr = el("tr", { className: row.className || "" });
    row.cells.forEach((cell, index) => tr.append(el(index === 0 ? "th" : "td", { text: cell })));
    tbody.append(tr);
  }
  table.append(tbody);
  return table;
}

function reportSection(title, children) {
  return el("section", { className: "report-section" }, [el("h3", { text: title }), ...children]);
}

function reportNote(text) {
  return el("p", { className: "report-note", text });
}

// Bronnenlijst staat (voorlopig) uit; zet op true om hem weer te tonen.
const SHOW_REPORT_SOURCES = false;

function reportSources(year) {
  const numericYear = Number(year);
  const sources = [];
  if (numericYear <= 2022) {
    sources.push(["Wet rechtsherstel box 3 (Stb. 2022, 533)", "https://zoek.officielebekendmakingen.nl/stb-2022-533.html"]);
  }
  sources.push([`Wet inkomstenbelasting 2001, versie 1 januari ${year}`, `https://wetten.overheid.nl/BWBR0011353/${year}-01-01`]);
  if (numericYear >= 2023) {
    sources.push([`Belastingdienst: berekening box 3-inkomen ${year}`, `https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-${year}`]);
  }
  sources.push(["Wet tegenbewijsregeling box 3 (Stb. 2025, 195)", "https://zoek.officielebekendmakingen.nl/stb-2025-195.html"]);
  sources.push(["Belastingdienst: rekenvoorbeelden werkelijk rendement", "https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/rekenvoorbeelden-berekening-werkelijk-rendement"]);
  const list = el("ul", { className: "report-sources" });
  for (const [label, url] of sources) {
    list.append(el("li", {}, [el("span", { text: `${label}: ` }), el("span", { className: "report-url", text: url })]));
  }
  return list;
}

function yearDataSection(report) {
  const { year, data, fiscalPartner } = report;
  const numericYear = Number(year);
  const count = fiscalPartner ? 2 : 1;
  const rows = [
    { cells: ["Tarief box 3", reportPercent(data.taxRate, 0)] },
    { cells: ["Heffingsvrij vermogen", `${reportWhole(data.exemption)} per persoon${fiscalPartner ? ` (samen ${reportWhole(data.exemption * 2)})` : ""}`] },
    { cells: ["Schuldendrempel", `${reportWhole(data.debtThreshold)} per persoon${fiscalPartner ? ` (samen ${reportWhole(data.debtThreshold * 2)})` : ""}`] },
    { relief: true, cells: ["Forfait banktegoeden", reportPercent(data.reliefSavingsRate) + (year === "2026" ? " (voorlopig)" : "")] },
    { relief: true, cells: ["Forfait overige bezittingen", reportPercent(data.reliefInvestmentRate)] },
    { relief: true, cells: ["Forfait schulden", reportPercent(data.reliefDebtRate) + (year === "2026" ? " (voorlopig)" : "")] },
  ];
  if (numericYear <= 2021) {
    rows.push({ relief: true, cells: ["Rendementspercentage (rechtsherstel)", "totaal rendement ÷ rendementsgrondslag, op 2 decimalen"] });
  } else {
    rows.push({ relief: true, cells: ["Aandeel in de rendementsgrondslag", `grondslag sparen en beleggen per persoon ÷ rendementsgrondslag, op ${data.taxableShareDecimals ?? 2} decimalen${data.taxableShareRoundDown ? ", naar beneden afgerond" : ""}`] });
  }
  rows.push({ relief: true, cells: ["Contant geld valt onder", numericYear >= 2023 ? "banktegoeden" : "overige bezittingen"] });
  if (numericYear <= 2022) {
    rows.push({ cells: ["Oude methode: forfait sparen / beleggen", `${reportPercent(data.savingsRate)} / ${reportPercent(data.investmentRate)}`] });
    rows.push({ cells: [`Schijf 1 (tot ${reportWhole(data.tier1)}): 67% sparen / 33% beleggen`, reportPercent(data.oldTierRates[0], 3)] });
    rows.push({ cells: [`Schijf 2 (${reportWhole(data.tier1)} – ${reportWhole(data.tier2)}): 21% / 79%`, reportPercent(data.oldTierRates[1], 3)] });
    rows.push({ cells: [`Schijf 3 (vanaf ${reportWhole(data.tier2)}): 0% / 100%`, reportPercent(data.oldTierRates[2], 3)] });
  }
  rows.push({ relief: true, cells: ["Werkelijk rendement: vrijstelling contant geld", `${reportWhole(data.cashExemption)} per persoon${count === 2 ? ` (samen ${reportWhole(data.cashExemption * 2)})` : ""}`] });
  rows.push({ relief: true, cells: ["Werkelijk rendement: vrijstelling groene beleggingen", `${reportWhole(data.greenExemption)} per persoon${count === 2 ? ` (samen ${reportWhole(data.greenExemption * 2)})` : ""}`] });
  rows.push({ relief: true, cells: ["Werkelijk rendement: voordeel eigen gebruik woning", numericYear >= 2026 ? "telt mee (art. 5.27a Wet IB 2001)" : "nihil (telt pas vanaf 2026)"] });
  // 2017-2022: de gegevens van de oude methode eerst, direct na de algemene
  // gegevens (tarief, heffingsvrij vermogen, schuldendrempel).
  if (numericYear <= 2022) {
    const isOld = (row) => /^(Oude methode|Schijf )/.test(row.cells[0]);
    const oldRows = rows.filter(isOld);
    const otherRows = rows.filter((row) => !isOld(row));
    rows.splice(0, rows.length, ...otherRows.slice(0, 3), ...oldRows, ...otherRows.slice(3));
  }
  // Geen toegang tot de Wet rechtsherstel (2017-2020): alleen de gegevens van de oude methode.
  const shownRows = report.accessDenied ? rows.filter((row) => !row.relief) : rows;
  return reportSection(`1. Jaargegevens ${year}`, [reportTable(null, shownRows)]);
}

function assetsSection(report) {
  const { year } = report;
  const rows = actualReturnReport?.rows ?? [];
  const typeLabel = (row) => {
    if (row.category === "bank") return "Banktegoed";
    if (row.category === "cash") return "Contant geld";
    if (row.category === "home") return "Woning / onroerende zaak (WOZ)";
    if (row.category === "debt") return "Schuld";
    return ACTUAL_RETURN_DEFAULT_NAMES[row.assetType] || "Overige bezitting";
  };
  const tableRows = rows
    .filter((row) => !row.extra)
    .map((row) => ({ cells: [typeLabel(row), row.name, reportEuro(row.startValue)] }));
  const children = [
    tableRows.length
      ? reportTable(null, tableRows)
      : reportNote("Geen vermogensbestanddelen ingevuld."),
    reportTable(null, [
      { cells: ["Banktegoeden (incl. contant geld vanaf 2023)", reportEuro(report.bank)] },
      { cells: ["Overige bezittingen", reportEuro(report.investments)] },
      { cells: ["Schulden", reportEuro(report.debts)] },
      { cells: ["Fiscale partner", report.fiscalPartner ? `ja, verdeling grondslag ${report.allocationPercent}% / ${100 - report.allocationPercent}%` : "nee"] },
    ]),
  ];
  return reportSection(`2. Vermogen op 1 januari ${year} (A.1)`, children);
}

// 2017-2020 zonder toegang tot de Wet rechtsherstel box 3: alleen de oude
// methode (schijven); geen vergelijking met de Wet rechtsherstel.
function oldMethodOnlySection(report, steps) {
  const { year, data, fiscalPartner } = report;
  const oldIncomes = fiscalPartner ? [report.oldFirstPartnerIncome, report.oldSecondPartnerIncome] : [report.oldFirstPartnerIncome];
  const rows = [
    ...steps,
    ...report.oldTierCalculations.map((calculation, index) => ({
      cells: [`${oldTierLabel(data, index)} (${reportPercent(data.oldTierRates[index], 3)})`, calculation],
    })),
    { cells: ["Box 3-inkomen oude methode", reportWhole(assessmentIncome(oldIncomes))] },
    { cells: [`Box 3-belasting oude methode (${data.taxRate}%)`, reportWhole(assessmentTax(oldIncomes, data.taxRate))], className: "report-total" },
  ];
  return reportSection(`3. Forfaitaire berekening ${year} — oude methode (geen toegang tot Wet rechtsherstel box 3)`, [
    reportTable(null, rows),
    reportResultBlock(report, { title: "Uitkomst oude box 3-berekening (schijven)", incomes: oldIncomes, lowest: true, suffix: "van toepassing" }),
  ]);
}

// Schijfgrenzen gelden per belastingplichtige.
function oldTierLabel(data, index) {
  const ranges = [
    `van ${reportWhole(0)} tot ${reportWhole(data.tier1)}`,
    `van ${reportWhole(data.tier1)} tot ${reportWhole(data.tier2)}`,
    `vanaf ${reportWhole(data.tier2)}`,
  ];
  return `Schijf ${index + 1}: ${ranges[index]}`;
}

function forfaitarySection(report) {
  const { year, data, fiscalPartner } = report;
  const numericYear = Number(year);
  const incomes = fiscalPartner ? [report.reliefFirstPartnerIncome, report.reliefSecondPartnerIncome] : [report.reliefFirstPartnerIncome];
  const steps = [
    { cells: ["Banktegoeden", reportEuro(report.bank)] },
    { cells: ["Overige bezittingen", reportEuro(report.investments)] },
    { cells: ["Totale bezittingen", reportEuro(report.assets)], className: "report-total" },
    { cells: [`Schulden ${reportEuro(report.debts)} − drempel ${reportWhole(report.debtThreshold)}`, `− ${reportEuro(report.deductibleDebts)}`] },
    { cells: ["Rendementsgrondslag", reportEuro(report.netAssets)], className: "report-total" },
    { cells: ["Heffingsvrij vermogen", `− ${reportEuro(report.exemption)}`] },
    { cells: ["Grondslag sparen en beleggen", reportEuro(report.taxableBase)], className: "report-total" },
  ];
  if (fiscalPartner) {
    steps.push({ cells: [`Verdeling (${report.allocationPercent}% / ${100 - report.allocationPercent}%)`, `${reportEuro(report.firstPartnerBase)} / ${reportEuro(report.secondPartnerBase)}`] });
  }
  if (report.accessDenied) return oldMethodOnlySection(report, steps);
  const reliefSteps = [
    { cells: ["Rendement banktegoeden", report.savingsExplanation] },
    { cells: ["Rendement overige bezittingen", report.investmentExplanation] },
    { cells: ["Af: rendement schulden", report.debtExplanation] },
    { cells: ["Totaal forfaitair rendement", reportEuro(report.reliefTotalReturn)], className: "report-total" },
    { cells: [report.usesTaxableBaseShare ? "Aandeel in de rendementsgrondslag" : "Rendementspercentage", report.yieldRateExplanation] },
    { cells: ["Voordeel uit sparen en beleggen", report.reliefIncomeCalculation] },
  ];

  // Vanaf 2023: alleen de Overbruggingswet.
  if (numericYear > 2022) {
    return reportSection(`3. Forfaitaire berekening ${year} — Overbruggingswet box 3`, [
      reportTable(null, [...steps, ...reliefSteps]),
      reportResultBlock(report, {
        title: "Uitkomst forfaitaire berekening — Overbruggingswet box 3",
        incomes,
        lowest: isReportWinner(report, "relief"),
        // Zonder berekend werkelijk rendement is er maar één uitkomst: geen "laagste uitkomst".
        suffix: actualReturnReport?.result ? "laagste uitkomst" : null,
      }),
    ]);
  }

  // 2017-2022: eerst de oude methode, dan de Wet rechtsherstel, dan de vergelijking.
  const oldIncomes = fiscalPartner ? [report.oldFirstPartnerIncome, report.oldSecondPartnerIncome] : [report.oldFirstPartnerIncome];
  const oldRows = report.oldTierCalculations.map((calculation, index) => ({
    cells: [`${oldTierLabel(data, index)} (${reportPercent(data.oldTierRates[index], 3)})`, calculation],
  }));
  oldRows.push({ cells: ["Box 3-inkomen oude methode", reportWhole(assessmentIncome(oldIncomes))] });
  oldRows.push({ cells: [`Box 3-belasting oude methode (${data.taxRate}%)`, reportWhole(assessmentTax(oldIncomes, data.taxRate))], className: "report-total" });
  const comparisonRows = [
    { cells: [`Box 3-belasting oude methode (${data.taxRate}%)`, reportWhole(assessmentTax(oldIncomes, data.taxRate))] },
    { cells: [`Box 3-belasting Wet rechtsherstel (${data.taxRate}%)`, reportWhole(assessmentTax(incomes, data.taxRate))] },
    {
      cells: ["Van toepassing (laagste uitkomst, art. 1 Wet rechtsherstel)", report.oldTax < report.reliefTax ? "oude methode" : "Wet rechtsherstel box 3"],
      className: "report-total",
    },
  ];
  const title = `3. Forfaitaire berekening ${year} — oude methode en Wet rechtsherstel box 3`;
  const children = [
    el("h4", { text: "Grondslag" }),
    reportTable(null, steps),
    el("h4", { text: "Oude box 3-berekening (schijven)" }),
    reportTable(null, oldRows),
    reportResultBlock(report, { title: "Uitkomst oude box 3-berekening (schijven)", incomes: oldIncomes, lowest: isReportWinner(report, "old") }),
    el("h4", { text: "Wet rechtsherstel box 3" }),
    reportTable(null, reliefSteps),
    reportResultBlock(report, { title: "Uitkomst Wet rechtsherstel box 3", incomes, lowest: isReportWinner(report, "relief") }),
    el("h4", { text: "Vergelijking oude methode en Wet rechtsherstel" }),
    reportTable(null, comparisonRows),
  ];
  return reportSection(title, children);
}

// Precies één uitkomst is de laagste (groen):
//   2017-2020 zonder toegang: alleen de oude methode;
//   2017-2022: de laagste van oude methode en Wet rechtsherstel;
//   vanaf 2023: de Overbruggingswet;
//   is het werkelijk rendement berekend en voor iedereen lager, dan dat.
// Bij partners met een verschillende uitkomst per persoon is geen blok groen.
function reportWinner(report) {
  if (report.accessDenied) return "old";
  const forfaitary = Number(report.year) <= 2022 && report.oldTax < report.reliefTax ? "old" : "relief";
  const persons = actualReturnReport?.result ? actualReturnReport.comparison?.persons : null;
  if (!persons?.length) return forfaitary;
  if (persons.every((person) => person.usesActual)) return "actual";
  if (persons.some((person) => person.usesActual)) return null;
  return forfaitary;
}

// true = groen (laagste), false = niet de laagste, undefined = geen eenduidige uitkomst.
function isReportWinner(report, name) {
  const winner = reportWinner(report);
  return winner === null ? undefined : winner === name;
}

// Omlijnd uitkomstblok: voordeel uit sparen en beleggen en de verschuldigde
// belasting voor de opgegeven inkomens, per persoon en (bij partners) totaal.
// `lowest`: true = laagste uitkomst (groen en vet), false = de hoogste,
// undefined = geen eenduidige vergelijking.
function reportResultBlock(report, { title, incomes, lowest, suffix = "laagste uitkomst" }) {
  const { data, fiscalPartner } = report;
  const persons = fiscalPartner ? ["Belastingplichtige", "Partner"] : [null];
  const columns = persons.map((person, index) => ({
    label: person,
    income: incomes[index],
    tax: roundToTwoDecimals(incomes[index] * data.taxRate / 100),
    assessedIncome: assessmentIncome([incomes[index]]),
    assessedTax: assessmentTax([incomes[index]], data.taxRate),
  }));
  if (fiscalPartner) {
    columns.push({
      label: "Samen",
      income: roundToTwoDecimals(incomes[0] + incomes[1]),
      tax: roundToTwoDecimals(columns[0].tax + columns[1].tax),
      assessedIncome: assessmentIncome(incomes),
      assessedTax: assessmentTax(incomes, data.taxRate),
      total: true,
    });
  }

  const row = (className, label, valueOf, detailOf) => el("div", { className: `report-result-row ${className}` }, [
    el("div", { className: "report-result-label", text: label }),
    ...columns.map((column) => el("div", { className: `report-result-value${column.total ? " is-total" : ""}` }, [
      column.label ? el("span", { className: "report-result-person", text: column.label }) : null,
      el("strong", { text: valueOf(column) }),
      detailOf ? el("span", { className: "report-result-detail", text: detailOf(column) }) : null,
    ])),
  ]);

  const compareClass = lowest === true ? " is-lowest" : lowest === false ? " is-higher" : "";
  return el("div", { className: `report-result${fiscalPartner ? " has-partner" : ""}${compareClass}` }, [
    el("div", { className: "report-result-title", text: lowest === true && suffix ? `${title} — ${suffix}` : title }),
    row("is-income", "Voordeel uit sparen en beleggen (box 3-inkomen)",
      (c) => reportWhole(c.assessedIncome)),
    row("is-tax", `Verschuldigde box 3-belasting (${data.taxRate}%)`,
      (c) => reportWhole(c.assessedTax),
      (c) => `${reportWhole(c.assessedIncome)} × ${data.taxRate}%`),
  ]);
}

function actualReturnSection(report) {
  const { year, data, fiscalPartner } = report;
  const actualData = actualReturnReport;
  if (!actualData || !actualData.result) {
    return reportSection(`4. Werkelijk rendement ${year} (tegenbewijsregeling)`, [
      reportNote(actualData?.error ? `Niet berekend: ${actualData.error}` : "Niet berekend."),
    ]);
  }
  const { result, shares, comparison, forfaitary, rows, notes } = actualData;
  const nameByKey = new Map(rows.map((row) => [row.key, row.name]));
  const lineRows = result.lines.map((line) => ({
    cells: [nameByKey.get(line.id) || line.name, line.explanation],
  }));
  const totals = [
    { cells: ["Banktegoeden", reportEuro(result.categories.bank)] },
    { cells: ["Contant geld", reportEuro(result.categories.cash)] },
    { cells: ["Overige bezittingen", reportEuro(result.categories.asset)] },
    { cells: ["Woningen en onroerende zaken", reportEuro(result.categories.home)] },
    { cells: ["Schulden (rente, valutaresultaat, kwijtschelding)", reportEuro(result.categories.debt)] },
  ];
  if (result.cashExempt) totals.push({ cells: ["Af: vrijgesteld deel contant geld (art. 5.31b)", `− ${reportEuro(result.cashExempt)} (${reportPercent(result.cashExemptShare * 100)} van het valutaresultaat)`] });
  if (result.greenExempt) totals.push({ cells: ["Af: vrijgesteld deel groene beleggingen (art. 5.32)", `− ${reportEuro(result.greenExempt)} (${reportPercent(result.greenExemptShare * 100)} van het rendement)`] });
  totals.push({ cells: ["Werkelijk rendement vóór nulgrens", reportEuro(result.totalBeforeFloor)] });
  totals.push({ cells: ["Werkelijk rendement (minimaal € 0)", reportEuro(result.total)], className: "report-total" });
  if (fiscalPartner) {
    totals.push({ cells: [`Toerekening (${report.allocationPercent}% / ${100 - report.allocationPercent}%)`, `${reportEuro(shares[0])} / ${reportEuro(shares[1])}`] });
  }
  const persons = fiscalPartner ? ["Belastingplichtige", "Partner"] : ["Belastingplichtige"];
  const comparisonRows = [];
  comparison.persons.forEach((person, index) => {
    comparisonRows.push({ cells: [`${persons[index]}: forfaitair voordeel (${forfaitary.sources[index]})`, reportWhole(assessmentIncome([person.forfaitary]))] });
    comparisonRows.push({ cells: [`${persons[index]}: werkelijk rendement`, reportWhole(assessmentIncome([person.actual]))] });
    comparisonRows.push({ cells: [`${persons[index]}: toe te passen`, person.usesActual ? "werkelijk rendement (lager)" : "forfaitair voordeel"], className: "report-total" });
    comparisonRows.push({ cells: [`${persons[index]}: belasting forfaitair → na tegenbewijs (${data.taxRate}%)`, `${reportWhole(assessmentTax([person.forfaitary], data.taxRate))} → ${reportWhole(assessmentTax([person.applied], data.taxRate))}`] });
  });
  const conclusion = el("div", { className: `report-conclusion${comparison.anyActual ? " is-positive" : ""}` }, [
    el("span", { className: "report-conclusion-label", text: "Conclusie" }),
    el("span", { className: "report-conclusion-text", text: comparison.anyActual ? `Werkelijk rendement is lager; indicatieve vermindering ${reportWhole(comparison.persons.reduce((sum, person) => sum + assessmentTax([person.forfaitary], data.taxRate) - assessmentTax([person.applied], data.taxRate), 0))}.` : "Werkelijk rendement is niet lager; geen vermindering." }),
  ]);
  const overview = actualData.taxOverview;
  const taxRows = [];
  if (overview) {
    const columns = fiscalPartner ? [...overview.rows, overview.total] : overview.rows;
    const fmt = (value) => (value === null ? "—" : reportWhole(value));
    const line = (label, field, className) => ({
      cells: [label, columns.map((row) => fmt(row[field])).join(fiscalPartner ? " / " : "")],
      className,
    });
    if (overview.anyAssessed) taxRows.push(line("Volgens aanslag (ingevuld)", "assessed"));
    taxRows.push(line(`Forfaitair (${actualData.forfaitaryMethod})`, "forfaitaryTax"));
    taxRows.push(line("Bij werkelijk rendement", "actualTax"));
    taxRows.push(line("Te betalen na tegenbewijs (laagste)", "appliedTax", "report-total"));
    if (overview.anyAssessed) {
      taxRows.push(line("Verschil aanslag − na tegenbewijs (+ = minder te betalen)", "differenceWithAssessment", "report-total"));
      taxRows.push(line("Controle: aanslag − forfaitair (tool)", "assessmentCheck"));
    }
  }
  const noteList = el("ul", { className: "report-notes" });
  notes.forEach((note) => noteList.append(el("li", { text: note })));
  return reportSection(`4. Werkelijk rendement ${year} (tegenbewijsregeling)`, [
    el("h4", { text: "Per vermogensbestanddeel" }),
    lineRows.length ? reportTable(null, lineRows) : reportNote("Geen bestanddelen."),
    el("h4", { text: "Totaal" }),
    reportTable(null, totals),
    reportResultBlock(report, {
      title: "Uitkomst werkelijk rendement",
      incomes: comparison.persons.map((person) => person.actual),
      lowest: isReportWinner(report, "actual"),
    }),
    el("h4", { text: `Box 3-belasting in één oogopslag (hele euro's${fiscalPartner ? "; belastingplichtige / partner / totaal" : ""})` }),
    reportTable(null, taxRows),
    el("h4", { text: "Vergelijking per persoon" }),
    reportTable(null, comparisonRows),
    conclusion,
    el("h4", { text: "Opmerkingen" }),
    noteList,
  ]);
}

// 2017-2020: de tegenbewijsregeling geldt alleen bij formele toegang tot de Wet
// rechtsherstel box 3. Uitkomst van de formele beoordeling bovenaan het verslag.
function reportAccessNote(year) {
  if (Number(year) > 2020) return null;
  const root = document.documentElement;
  const complete = root.dataset.reliefAccessComplete !== "nee";
  const status = root.dataset.reliefAccessStatus;
  const [text, className] = !complete
    ? [`Formele toegang ${year}: nog niet beoordeeld. De tegenbewijsregeling geldt alleen bij toegang tot de Wet rechtsherstel box 3; de uitkomsten zijn tot die tijd indicatief.`, "is-open"]
    : status === "TOEGANG_RECHTSHERSTEL"
      ? [`Formele toegang ${year}: wel toegang tot de Wet rechtsherstel box 3.`, "is-ok"]
      : status === "GEEN_TOEGANG_RECHTSHERSTEL"
        ? [`Formele toegang ${year}: geen toegang tot de Wet rechtsherstel box 3. De tegenbewijsregeling (art. 6a Wet rechtsherstel) is niet van toepassing; de uitkomsten zijn alleen indicatief.`, "is-denied"]
        : [`Formele toegang ${year}: nader juridisch onderzoek noodzakelijk. Toepassing van de tegenbewijsregeling hangt daarvan af.`, "is-open"];
  return el("p", { className: `report-access ${className}`, text });
}

function renderReport() {
  if (!reportContent) return;
  reportContent.replaceChildren();
  if (!calculationReport) {
    reportContent.append(reportNote("Kies een belastingjaar en vul de vermogensgegevens in om het verslag te maken."));
    reportPrintButton.disabled = true;
    return;
  }
  reportPrintButton.disabled = false;
  const report = calculationReport;
  const printedOn = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeStyle: "short" }).format(new Date());
  reportContent.append(
    el("header", { className: "report-header" }, [
      el("h2", { text: `Box 3-berekening belastingjaar ${report.year}` }),
      reportNote(`Gemaakt op ${printedOn} met de Box 3-rekentool${document.documentElement.dataset.controlMode === "aan" ? " (controlemodus, niets opgeslagen)" : ""}. Indicatieve berekening; box 3-inkomen en belasting in hele euro's naar beneden afgerond zoals op de aanslag. Bevat geen persoonsgegevens.`),
    ]),
    ...[reportAccessNote(report.year)].filter(Boolean),
    yearDataSection(report),
    assetsSection(report),
    forfaitarySection(report),
    actualReturnSection(report),
    ...(SHOW_REPORT_SOURCES ? [reportSection("5. Bronnen", [reportSources(report.year)])] : []),
  );
}

function clearReport() {
  calculationReport = null;
  renderReport();
}

reportPrintButton?.addEventListener("click", () => {
  renderReport();
  const printRoot = document.createElement("div");
  printRoot.id = "print-root";
  printRoot.append(reportContent.cloneNode(true));
  document.body.append(printRoot);
  document.documentElement.classList.add("is-printing");
  const cleanup = () => {
    document.documentElement.classList.remove("is-printing");
    printRoot.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
});
