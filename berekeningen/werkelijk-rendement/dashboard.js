"use strict";

// Tegenbewijsregeling. A.2 toont de vermogensbestanddelen uit A.1 (standen op
// 1 januari) en vraagt per bestanddeel de aanvullende gegevens; het (verborgen) paneel Tegenbewijsregeling toont
// de berekening van het werkelijke rendement en de vergelijking.

const actualReturnTables = document.querySelector("#actual-return-tables");
const actualReturnSummary = document.querySelector("#actual-return-summary");
const actualReturnComparisonHead = document.querySelector("#actual-return-comparison-head");
const actualReturnComparison = document.querySelector("#actual-return-comparison");
const actualReturnResult = document.querySelector("#actual-return-result");
const actualReturnNotes = document.querySelector("#actual-return-notes");
const actualReturnError = document.querySelector("#actual-return-error");
const actualReturnBasis = document.querySelector("#actual-return-basis");
const actualReturnAccess = document.querySelector("#actual-return-access");
const actualReturnAddExtra = document.querySelector("#actual-return-add-extra");

const COSTS_HINT = "Vul aan- en verkoopbedragen in zonder kosten (verkoop van € 10.000 met € 250 kosten: vul € 10.000 in). Transactie-, beheer- en advieskosten zijn niet aftrekbaar; kosten die al in de koers zitten hoeft u niet te corrigeren.";
const CURRENCY_HINT = "Valutaresultaat in vreemde valuta = saldo 31 december − stortingen + opnames − saldo 1 januari, alles omgerekend naar euro's (dag- of maandkoersen).";

const ACTUAL_RETURN_EXTRA_TYPES = [
  ["securities", "Aandelen, obligaties en fondsen"],
  ["crypto", "Cryptovaluta"],
  ["claims", "Vorderingen en uitgeleend geld"],
  ["capital-insurance", "Kapitaalverzekering"],
  ["periodic-rights", "Recht op periodieke uitkeringen"],
  ["movable-property", "Roerende zaken"],
  ["home", "Woning of onroerende zaak (WOZ)"],
  ["other", "Overige bezitting"],
];

const ACTUAL_RETURN_SECTIONS = [
  {
    category: "bank",
    title: "Banktegoeden",
    intro: `Saldo rente = ontvangen rente − betaalde (negatieve) rente. ${CURRENCY_HINT} Overboekingen tussen eigen rekeningen zijn geen rendement.`,
    fields: [
      ["interest", "Ontvangen rente"],
      ["negativeInterest", "Betaalde negatieve rente"],
      ["currencyResult", "Valutaresultaat (±)", { signed: true }],
      ["green", "Groen", { checkbox: true }],
    ],
  },
  {
    category: "cash",
    title: "Contant geld",
    intro: `Contant geld in euro's heeft geen werkelijk rendement (€ 0). Alleen bij vreemde valuta telt een valutaresultaat mee. ${CURRENCY_HINT}`,
    fields: [
      ["foreignCurrency", "Vreemde valuta", { checkbox: true }],
      ["currencyResult", "Valutaresultaat (±)", { signed: true, requires: "foreignCurrency" }],
    ],
  },
  {
    category: "asset",
    assetTypes: ["securities"],
    title: "Aandelen, obligaties en fondsen",
    intro: `Rendement = waarde 31 december − waarde 1 januari − aankopen + verkopen + dividend en coupons. ${COSTS_HINT} Dividend in vreemde valuta rekent u om tegen de koers op de dag van ontvangst; stockdividend telt ook mee.`,
    fields: [
      ["endValue", "Waarde 31 december"],
      ["deposits", "Aankopen"],
      ["withdrawals", "Verkopen"],
      ["income", "Ontvangen dividend en coupons"],
      ["green", "Groen", { checkbox: true }],
    ],
  },
  {
    category: "asset",
    assetTypes: ["crypto"],
    title: "Cryptovaluta",
    intro: `Rendement = waarde 31 december − waarde 1 januari − aankopen + verkopen + overige opbrengsten. ${COSTS_HINT}`,
    fields: [
      ["endValue", "Waarde 31 december"],
      ["deposits", "Aankopen"],
      ["withdrawals", "Verkopen"],
      ["income", "Staking- en andere opbrengsten"],
    ],
  },
  {
    category: "asset",
    assetTypes: ["claims", "crowdfunding", "benefit-repayment"],
    title: "Vorderingen en uitgeleend geld",
    intro: "Bij een lening tegen nominale waarde verandert de waarde meestal alleen door nieuw uitgeleend geld en aflossingen; het rendement is dan de ontvangen rente. Vul de vordering op 31 december alleen in als die afwijkt.",
    fields: [
      ["income", "Ontvangen rente"],
      ["deposits", "Nieuw uitgeleend"],
      ["withdrawals", "Ontvangen aflossingen"],
      ["endValue", "Vordering 31 december"],
    ],
  },
  {
    category: "asset",
    assetTypes: ["capital-insurance"],
    title: "Kapitaalverzekeringen (niet-vrijgesteld deel)",
    intro: "De waarde uit A.1 is het niet-vrijgestelde deel op 1 januari. Vul hier de volledige eindwaarde, premies en uitkeringen in, met het niet-vrijgestelde percentage van 1 januari; de tool past dat percentage op die bedragen toe. Leeg percentage = bedragen zijn al het niet-vrijgestelde deel.",
    fields: [
      ["nonExemptPercent", "Niet-vrijgesteld % (1 januari)"],
      ["endValue", "Waarde 31 december"],
      ["deposits", "Betaalde premies"],
      ["withdrawals", "Ontvangen uitkeringen"],
    ],
  },
  {
    category: "asset",
    assetTypes: ["periodic-rights"],
    title: "Rechten op periodieke uitkeringen",
    intro: "Een waardedaling door het verstrijken van de tijd of een hogere leeftijd is geen verlies: de tool verwerkt die automatisch als onttrekking. Rendement = ontvangen uitkeringen (plus een eventuele waardestijging).",
    fields: [
      ["endValue", "Waarde 31 december"],
      ["withdrawals", "Ontvangen uitkeringen"],
    ],
  },
  {
    category: "asset",
    assetTypes: ["usufruct"],
    title: "Vruchtgebruik of blote eigendom",
    intro: "Waardeer op 31 december volgens dezelfde tabellen als op 1 januari.",
    fields: [
      ["endValue", "Waarde 31 december"],
      ["income", "Ontvangen opbrengsten (huur, rente, dividend)"],
    ],
  },
  {
    category: "asset",
    assetTypes: ["movable-property"],
    title: "Roerende zaken als belegging of verhuurd",
    intro: `Rendement = waarde 31 december − waarde 1 januari − aankopen + verkopen + ontvangen huur. ${COSTS_HINT}`,
    fields: [
      ["endValue", "Waarde 31 december"],
      ["deposits", "Aankopen"],
      ["withdrawals", "Verkopen"],
      ["income", "Ontvangen huur"],
    ],
  },
  {
    category: "asset",
    assetTypes: ["other"],
    title: "Overige bezittingen",
    intro: "Rendement = waarde 31 december − waarde 1 januari − aankopen/stortingen + verkopen/onttrekkingen + opbrengsten.",
    fields: [
      ["endValue", "Waarde 31 december"],
      ["deposits", "Aankopen / stortingen"],
      ["withdrawals", "Verkopen / onttrekkingen"],
      ["income", "Ontvangen opbrengsten"],
    ],
  },
  {
    category: "home",
    extra: false,
    title: "Woningen en onroerende zaken (WOZ)",
    intro: "Beginwaarde is de waarde uit A.1 (WOZ-waarde voor dit jaar). Eindwaarde is de WOZ-waarde voor het volgende jaar, bij verhuur met dezelfde leegwaarderatio. Een bij de gemeente gemelde investering die de WOZ-waarde verhoogde, gaat van de eindwaarde af. Onderhoud is niet aftrekbaar. Bij verkoop telt de waardeverandering naar rato van de dagen in bezit.",
    fields: [
      ["wozNext", "Eindwaarde (WOZ volgend jaar)"],
      ["improvement", "Gemelde investering"],
      ["rent", "Kale huur (zonder servicekosten)"],
      ["disposedDate", "Verkocht op", { date: true }],
      ["ownUseBenefit", "Voordeel eigen gebruik", { fromYear: 2026 }],
    ],
  },
  {
    category: "home",
    extra: true,
    title: "Woningen gekocht tijdens het jaar",
    intro: "Vul de WOZ-waarde voor dit jaar en voor het volgende jaar in. De waardeverandering telt naar rato van de dagen vanaf de aankoopdatum.",
    fields: [
      ["wozCurrent", "WOZ-waarde dit jaar"],
      ["acquiredDate", "Gekocht op", { date: true }],
      ["wozNext", "Eindwaarde (WOZ volgend jaar)"],
      ["improvement", "Gemelde investering"],
      ["rent", "Kale huur (zonder servicekosten)"],
      ["disposedDate", "Verkocht op", { date: true }],
      ["ownUseBenefit", "Voordeel eigen gebruik", { fromYear: 2026 }],
    ],
  },
  {
    category: "debt",
    title: "Schulden",
    intro: `Alle betaalde rente op box 3-schulden is aftrekbaar; de schuldendrempel geldt niet. Een kwijtgescholden schuld is rendement: vul het kwijtgescholden bedrag positief in. ${CURRENCY_HINT}`,
    fields: [
      ["interestPaid", "Betaalde rente"],
      ["currencyResult", "Valutaresultaat / kwijtschelding (±)", { signed: true }],
    ],
  },
];

let actualReturnState = { entries: {}, extras: [], forfaitaryOverride: ["", ""], assessedTax: ["", ""] };
let actualReturnLoadedYear = "";
let actualReturnStructure = "";
let actualReturnContext = null;

const actualReturnOverrideInputs = [
  document.querySelector("#actual-return-override-1"),
  document.querySelector("#actual-return-override-2"),
];
const actualReturnOverridePartner = document.querySelector("#actual-return-override-partner");
const actualReturnAssessedInputs = [
  document.querySelector("#actual-return-assessed-1"),
  document.querySelector("#actual-return-assessed-2"),
];
const actualReturnAssessedPartner = document.querySelector("#actual-return-assessed-partner");
const actualReturnTaxHead = document.querySelector("#actual-return-tax-head");
const actualReturnTax = document.querySelector("#actual-return-tax");

function actualReturnStorageKey(year) {
  return `${ACTUAL_RETURN_STORAGE_KEY}:${year}`;
}

function readStoredList(key) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadActualReturnState(year) {
  if (actualReturnLoadedYear === year) return;
  actualReturnLoadedYear = year;
  actualReturnStructure = "";
  actualReturnState = { entries: {}, extras: [], forfaitaryOverride: ["", ""], assessedTax: ["", ""] };
  try {
    const stored = localStorage.getItem(actualReturnStorageKey(year));
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed === "object" && parsed !== null &&
        typeof parsed.entries === "object" && parsed.entries !== null &&
        Array.isArray(parsed.extras)
      ) {
        actualReturnState = {
          entries: parsed.entries,
          extras: parsed.extras.map((extra) => ({ type: "other", ...extra })),
          forfaitaryOverride: Array.isArray(parsed.forfaitaryOverride)
            ? [String(parsed.forfaitaryOverride[0] ?? ""), String(parsed.forfaitaryOverride[1] ?? "")]
            : ["", ""],
          assessedTax: Array.isArray(parsed.assessedTax)
            ? [String(parsed.assessedTax[0] ?? ""), String(parsed.assessedTax[1] ?? "")]
            : ["", ""],
        };
      }
    }
  } catch {
    actualReturnState = { entries: {}, extras: [], forfaitaryOverride: ["", ""], assessedTax: ["", ""] };
  }
  actualReturnOverrideInputs.forEach((input, index) => {
    input.value = actualReturnState.forfaitaryOverride[index];
  });
  actualReturnAssessedInputs.forEach((input, index) => {
    input.value = actualReturnState.assessedTax[index];
  });
}

function saveActualReturnState(year) {
  try {
    localStorage.setItem(actualReturnStorageKey(year), JSON.stringify(actualReturnState));
  } catch (error) {
    actualReturnError.hidden = false;
    actualReturnError.textContent = `Gegevens werkelijk rendement konden niet worden opgeslagen: ${error.message}`;
  }
}

// De stand op 1 januari van het volgende jaar (A.1 van dat jaar) hoort gelijk te
// zijn aan de waarde op 31 december van dit jaar. Alleen voor dezelfde regel
// (zelfde id en omschrijving) en alleen als dat jaar in de tool bestaat.
function nextYearValues(year) {
  const nextYear = String(Number(year) + 1);
  const values = new Map();
  if (!BOX3_YEAR_DATA[nextYear]) return values;
  for (const asset of readStoredList(`${OTHER_ASSETS_STORAGE_KEY}:${nextYear}`)) {
    // Een stand van € 0 is geen eindwaarde (vaak een lege regel): niet overnemen,
    // anders lijkt een bezitting volledig in waarde gedaald.
    if (typeof asset.id === "string" && typeof asset.value === "number" && asset.value > 0) {
      values.set(`${asset.id}|${asset.name || ""}`, asset.value);
    }
  }
  return values;
}

const ACTUAL_RETURN_DEFAULT_NAMES = {
  bank: "Bankrekening",
  cash: "Contant geld",
  securities: "Belegging",
  crypto: "Cryptovaluta",
  claims: "Vordering",
  crowdfunding: "Crowdfunding",
  "benefit-repayment": "Nabetaling toeslagen",
  "capital-insurance": "Kapitaalverzekering",
  "periodic-rights": "Periodieke uitkering",
  usufruct: "Vruchtgebruik",
  "movable-property": "Roerende zaak",
  other: "Overige bezitting",
  home: "Woning",
  debt: "Schuld",
};

// Regels zonder omschrijving krijgen automatisch een genummerde naam, zodat
// er nooit een naam of andere persoonsgegevens hoeven te worden ingevuld.
function numberUnnamedRows(rows) {
  const counters = {};
  for (const row of rows) {
    const group = row.category === "asset" ? row.assetType : row.category;
    counters[group] = (counters[group] || 0) + 1;
    if (!row.name || !row.name.trim()) {
      row.name = `${ACTUAL_RETURN_DEFAULT_NAMES[group] || "Bezitting"} ${counters[group]}`;
    }
  }
  return rows;
}

// Zet de vermogensbestanddelen uit A.1 om naar regels voor het werkelijke rendement.
// Een regel uit A.1 telt alleen mee als er iets is ingevuld: een bedrag, een
// omschrijving of al gegevens in A.2. Een lege regel (bijv. na + in A.1) komt
// dus niet als "Overige bezitting 1 – € 0,00" in A.2 terecht.
function hasA1Content(key, name, value) {
  if (Number(value) > 0 || (name && name.trim())) return true;
  const entry = actualReturnState.entries[key] || {};
  return Object.entries(entry).some(([field, value]) => isFilledEntryValue(field, value));
}

function collectActualReturnRows(year) {
  const rows = [];
  for (const account of readStoredList(`${STORAGE_KEY}:${year}`)) {
    if (!hasA1Content(`bank:${account.id}`, account.name, account.balance)) continue;
    const cash = account.kind === "cash";
    rows.push({
      key: `bank:${account.id}`,
      category: cash ? "cash" : "bank",
      name: account.name || "",
      startValue: Number(account.balance) || 0,
    });
  }
  const nextValues = nextYearValues(year);
  for (const asset of readStoredList(`${OTHER_ASSETS_STORAGE_KEY}:${year}`)) {
    if (!hasA1Content(`asset:${asset.id}`, asset.name, asset.value)) continue;
    let category = "asset";
    if (asset.type === "cash") category = "cash";
    if (asset.type === "second-home" || asset.type === "real-estate") category = "home";
    const nextValue = nextValues.get(`${asset.id}|${asset.name || ""}`);
    rows.push({
      key: `asset:${asset.id}`,
      category,
      assetType: ACTUAL_RETURN_SECTIONS.some((section) => section.assetTypes?.includes(asset.type))
        ? asset.type
        : "other",
      name: asset.name || "",
      startValue: Number(asset.value) || 0,
      ...(nextValue === undefined ? {} : { nextValue }),
    });
  }
  for (const debt of readStoredList(`${DEBTS_STORAGE_KEY}:${year}`)) {
    if (!hasA1Content(`debt:${debt.id}`, debt.name, debt.value)) continue;
    rows.push({
      key: `debt:${debt.id}`,
      category: "debt",
      name: debt.name || "",
      startValue: Number(debt.value) || 0,
    });
  }
  for (const extra of actualReturnState.extras) {
    const home = extra.type === "home";
    rows.push({
      key: `extra:${extra.id}`,
      category: home ? "home" : "asset",
      assetType: home ? undefined : extra.type,
      name: extra.name,
      startValue: 0,
      extra: true,
      typedName: extra.name,
    });
  }
  return numberUnnamedRows(rows);
}

function isEmptyField(value) {
  return value === undefined || value === null || value === "";
}

// Is dit een echt ingevulde waarde? Een WOZ-waarde van € 0 bestaat niet en telt
// als leeg (anders lijkt de woning volledig in waarde gedaald); een niet-aangevinkt
// vakje telt ook niet.
function isFilledEntryValue(field, value) {
  if (value === false || isEmptyField(value)) return false;
  if (field === "wozNext" && Number(value) === 0) return false;
  return true;
}

function buildActualReturnItems(rows) {
  return rows.map((row) => {
    const entry = actualReturnState.entries[row.key] || {};
    const item = { ...entry, id: row.key, name: row.name, category: row.category, assetType: row.assetType };
    if (row.category === "home") {
      if (!row.extra) item.wozCurrent = row.startValue;
      if (!isFilledEntryValue("wozNext", entry.wozNext)) {
        // Zonder ingevulde eindwaarde: stand 1 januari volgend jaar, anders geen waardeverandering.
        item.wozNext = row.nextValue ?? (row.extra ? entry.wozCurrent : row.startValue);
      }
    } else {
      item.startValue = row.startValue;
    }
    if (row.category === "asset" && isEmptyField(entry.endValue)) {
      item.endValue = row.nextValue ?? row.startValue;
    }
    return item;
  });
}

function continuityNotes(rows, year) {
  const notes = [];
  for (const row of rows) {
    if (row.nextValue === undefined) continue;
    const entry = actualReturnState.entries[row.key] || {};
    const field = row.category === "home" ? "wozNext" : "endValue";
    if (isEmptyField(entry[field])) continue;
    if (row.assetType === "capital-insurance" && !isEmptyField(entry.nonExemptPercent)) continue;
    const entered = Number(entry[field]);
    if (Number.isFinite(entered) && Math.abs(entered - row.nextValue) >= 0.01) {
      notes.push(`${row.name}: de waarde op 31 december ${year} (${formatActualReturnEuro(entered)}) wijkt af van de stand op 1 januari ${Number(year) + 1} in A.1 (${formatActualReturnEuro(row.nextValue)}). Controleer welke waarde juist is.`);
    }
  }
  return notes;
}

function createActualReturnInput(row, field, label, options, year) {
  const entry = actualReturnState.entries[row.key] || {};
  const input = document.createElement("input");
  input.setAttribute("aria-label", `${label} — ${row.name || "nieuwe bezitting"}`);
  input.dataset.rowKey = row.key;
  input.dataset.field = field;
  if (options.checkbox) {
    input.type = "checkbox";
    input.checked = Boolean(entry[field]);
  } else if (options.date) {
    input.type = "date";
    input.min = `${year}-01-01`;
    input.max = `${year}-12-31`;
    input.value = entry[field] || "";
  } else {
    input.type = "number";
    input.step = "0.01";
    input.inputMode = "decimal";
    if (!options.signed) input.min = "0";
    if (field === "nonExemptPercent") input.max = "100";
    input.value = isFilledEntryValue(field, entry[field]) || field !== "wozNext" ? entry[field] ?? "" : "";
    if (field === "endValue" || (field === "wozNext" && !row.extra)) {
      input.placeholder = row.nextValue !== undefined
        ? `${formatActualReturnEuro(row.nextValue)} (1 jan ${Number(year) + 1})`
        : "gelijk aan 1 januari";
    }
  }
  if (options.requires) {
    input.dataset.requires = options.requires;
    input.disabled = !entry[options.requires];
  }
  input.addEventListener(options.checkbox ? "change" : "input", () => {
    const current = actualReturnState.entries[row.key] || {};
    current[field] = options.checkbox ? input.checked : input.value;
    actualReturnState.entries[row.key] = current;
    if (options.checkbox) {
      for (const dependent of actualReturnTables.querySelectorAll(
        `input[data-row-key="${CSS.escape(row.key)}"][data-requires="${field}"]`,
      )) {
        dependent.disabled = !input.checked;
      }
    }
    saveActualReturnState(year);
    updateActualReturnResults();
  });
  return input;
}

function createExtraNameCell(row, year) {
  const extra = actualReturnState.extras.find((item) => `extra:${item.id}` === row.key);
  const cell = document.createElement("td");
  // Geen omschrijvingsveld: de bezitting krijgt automatisch een naam
  // (bijv. "Roerende zaak 1"); een eerder ingevulde naam blijft behouden.
  const type = document.createElement("select");
  type.setAttribute("aria-label", "Soort bezitting verkregen tijdens het jaar");
  for (const [value, label] of ACTUAL_RETURN_EXTRA_TYPES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    type.append(option);
  }
  type.value = extra.type;
  type.addEventListener("change", () => {
    extra.type = type.value;
    delete actualReturnState.entries[row.key];
    saveActualReturnState(year);
    refreshActualReturn();
  });
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-button";
  remove.textContent = "Verwijderen";
  remove.addEventListener("click", () => {
    actualReturnState.extras = actualReturnState.extras.filter((item) => item !== extra);
    delete actualReturnState.entries[row.key];
    saveActualReturnState(year);
    refreshActualReturn();
  });
  cell.className = "actual-return-extra-cell";
  cell.append(type, remove);
  return cell;
}

function renderActualReturnTables(rows, year) {
  actualReturnTables.replaceChildren();
  if (rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "calculation-method-note";
    empty.textContent = "Nog niets ingevuld in A.1. Vul daar de standen op 1 januari in, of voeg hieronder een bezitting toe die ná 1 januari is gekocht of gekregen.";
    actualReturnTables.append(empty);
    return;
  }
  for (const [sectionIndex, section] of ACTUAL_RETURN_SECTIONS.entries()) {
    const sectionRows = rows.filter((row) =>
      row.category === section.category &&
      (!section.assetTypes || section.assetTypes.includes(row.assetType)) &&
      (section.extra === undefined || section.extra === Boolean(row.extra)));
    if (sectionRows.length === 0) continue;
    const fields = section.fields.filter(([, , options = {}]) =>
      !options.fromYear || Number(year) >= options.fromYear);
    // Elk onderdeel in een eigen kader, zoals in A.1.
    const card = document.createElement("div");
    card.className = "actual-return-card";
    actualReturnTables.append(card);
    const heading = document.createElement("h3");
    heading.className = "actual-return-heading";
    heading.textContent = section.title;
    card.append(heading);
    if (section.intro) {
      const intro = document.createElement("p");
      intro.className = "calculation-method-note";
      intro.textContent = section.intro;
      // Toelichting achter een (i) naast de titel.
      intro.id = `actual-return-info-${sectionIndex}`;
      intro.classList.add("info-panel");
      intro.hidden = true;
      heading.append(" ", createInfoButton(intro.id, `Toelichting ${section.title}`));
      card.append(intro);
    }
    const wrap = document.createElement("div");
    wrap.className = "account-table-wrap";
    const table = document.createElement("table");
    table.className = "account-table actual-return-table";
    const headRow = document.createElement("tr");
    for (const label of ["Omschrijving", "1 januari (uit A.1)", ...fields.map(([, fieldLabel]) => fieldLabel), "Werkelijk rendement"]) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      headRow.append(th);
    }
    const thead = document.createElement("thead");
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    for (const row of sectionRows) {
      const tr = document.createElement("tr");
      let nameCell;
      if (row.extra) {
        nameCell = createExtraNameCell(row, year);
      } else {
        nameCell = document.createElement("td");
        nameCell.textContent = row.name;
      }
      const startCell = document.createElement("td");
      startCell.className = "actual-return-amount";
      startCell.textContent = row.extra ? `verkregen in ${year}` : formatActualReturnEuro(row.startValue);
      tr.append(nameCell, startCell);
      for (const [field, label, options = {}] of fields) {
        const cell = document.createElement("td");
        cell.append(createActualReturnInput(row, field, label, options, year));
        tr.append(cell);
      }
      const resultCell = document.createElement("td");
      resultCell.className = "actual-return-amount";
      resultCell.dataset.resultFor = row.key;
      resultCell.textContent = "—";
      tr.append(resultCell);
      tbody.append(tr);
    }
    table.append(thead, tbody);
    wrap.append(table);
    card.append(wrap);
  }
}

function setActualReturnSummary(entries) {
  actualReturnSummary.replaceChildren();
  for (const [label, value, className] of entries) {
    const row = document.createElement("div");
    if (className) row.className = className;
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    row.append(dt, dd);
    actualReturnSummary.append(row);
  }
}

// Uitkomstbalk boven de berekening: forfaitair, bij werkelijk rendement, te
// betalen, volgens aanslag en het verschil. `null` toont een streepje.
function renderResultBar({ forfaitary = null, actual = null, applied = null, assessed = null, difference = null, actualLabel = "—" } = {}) {
  const set = (id, text, className = "") => {
    const element = document.querySelector(`#${id}`);
    if (!element) return;
    element.textContent = text;
    element.className = className;
  };
  const whole = (value) => (value === null ? "—" : formatCalculationEuroWhole(value));
  set("result-bar-forfaitary", whole(forfaitary));
  set("result-bar-actual", actual === null ? actualLabel : whole(actual), actual === null && actualLabel !== "—" ? "is-pending" : "");
  set("result-bar-applied", whole(applied));
  set("result-bar-assessed", assessed === null ? "niet ingevuld" : whole(assessed), assessed === null ? "is-pending" : "");
  set(
    "result-bar-difference",
    difference === null
      ? "—"
      : Math.abs(difference) < 1
        ? "gelijk"
        : `${difference > 0 ? "+" : "−"}${formatCalculationEuroWhole(Math.abs(difference))}`,
    difference === null || Math.abs(difference) < 1 ? "" : difference > 0 ? "is-refund" : "is-extra",
  );
}

// Is er voor dit jaar iets ingevuld waarmee het werkelijke rendement kan worden
// berekend? Zonder invoer zou elk bestanddeel € 0 rendement krijgen en lijkt de
// tegenbewijsregeling ten onrechte de volledige belasting te verminderen.
// Een eindwaarde uit A.1 van het volgende jaar telt ook als gegeven.
function showActualReturnComparison(visible) {
  for (const id of ["actual-return-comparison-title", "actual-return-comparison-wrap"]) {
    const element = document.querySelector(`#${id}`);
    if (element) element.hidden = !visible;
  }
}

// Is er in A.2 zelf iets nader ingevuld? Alleen dan wordt het werkelijke
// rendement berekend en vergeleken. Alleen de uit A.1 overgenomen standen (ook
// de stand op 1 januari van het volgende jaar) tellen niet: dan geldt de oude
// methode, de Wet rechtsherstel of de Overbruggingswet.
function hasActualReturnInput(rows) {
  return rows.some((row) => {
    const entry = actualReturnState.entries[row.key] || {};
    return Object.entries(entry).some(([field, value]) => typeof value !== "boolean" && isFilledEntryValue(field, value));
  });
}

function assessmentSentence(taxOverview) {
  if (!taxOverview.allAssessed) return "";
  const wholeEuro = (value) => formatCalculationEuroWhole(value);
  const difference = taxOverview.total.differenceWithAssessment;
  return difference > 0
    ? ` Ten opzichte van de aanslag (${wholeEuro(taxOverview.total.assessed)}): mogelijk ${wholeEuro(difference)} minder te betalen of terug te ontvangen.`
    : difference < 0
      ? ` De aanslag (${wholeEuro(taxOverview.total.assessed)}) is ${wholeEuro(-difference)} lager dan de berekening; controleer de gegevens.`
      : ` De aanslag (${wholeEuro(taxOverview.total.assessed)}) is gelijk aan de berekening.`;
}

function buildAssessedOverview(persons, data, fiscalPartner) {
  try {
    return buildTaxOverview({
      persons,
      taxRate: data.taxRate,
      assessedTaxes: fiscalPartner ? actualReturnState.assessedTax : [actualReturnState.assessedTax[0]],
    });
  } catch (error) {
    actualReturnError.hidden = false;
    actualReturnError.textContent = error.message;
    return buildTaxOverview({ persons, taxRate: data.taxRate });
  }
}

// Tegenbewijsregeling zonder gegevens voor het werkelijke rendement: alleen de forfaitaire
// belasting en de aanslag tonen, geen vermindering.
function renderActualReturnPending({ year, data, fiscalPartner, forfaitary, rows, forfaitaryMethod, reason = "empty" }) {
  const denied = reason === "denied";
  actualReturnSummary.replaceChildren();
  actualReturnComparisonHead.replaceChildren();
  actualReturnComparison.replaceChildren();
  showActualReturnComparison(false);
  const comparison = compareActualReturn({
    actualShares: forfaitary.incomes, forfaitaryIncomes: forfaitary.incomes, fiscalPartner, taxRate: data.taxRate,
  });
  const taxOverview = buildAssessedOverview(comparison.persons, data, fiscalPartner);
  for (const row of [...taxOverview.rows, taxOverview.total]) row.actualTax = null;
  renderTaxOverview(taxOverview, { fiscalPartner, data, forfaitaryMethod });
  actualReturnResult.className = "comparison-result is-pending";
  actualReturnResult.textContent = denied
    ? `Geen toegang tot de Wet rechtsherstel box 3: de tegenbewijsregeling is niet van toepassing. Box 3-belasting volgens de oude methode: ${formatCalculationEuroWhole(taxOverview.total.forfaitaryTax)}.${assessmentSentence(taxOverview)}`
    : `Nog geen gegevens voor het werkelijke rendement ingevuld (A.2). Zonder die gegevens geldt het forfaitaire voordeel: box 3-belasting ${formatCalculationEuroWhole(taxOverview.total.forfaitaryTax)}.${assessmentSentence(taxOverview)}`;
  actualReturnNotes.replaceChildren();
  const li = document.createElement("li");
  li.textContent = submissionNote(year, fiscalPartner);
  actualReturnNotes.append(li);
  renderResultBar({
    forfaitary: taxOverview.total.forfaitaryTax,
    applied: taxOverview.total.forfaitaryTax,
    assessed: taxOverview.total.assessed,
    difference: taxOverview.allAssessed ? taxOverview.total.assessmentCheck : null,
    actualLabel: denied ? "n.v.t. (geen toegang)" : "nog niet ingevuld",
  });
  actualReturnReport = {
    error: denied
      ? "geen toegang tot de Wet rechtsherstel box 3; de tegenbewijsregeling is niet van toepassing."
      : "er zijn nog geen gegevens voor het werkelijke rendement ingevuld (A.2).",
    rows,
  };
  renderReport();
}

function clearActualReturn(message) {
  renderResultBar();
  actualReturnContext = null;
  actualReturnSummary.replaceChildren();
  actualReturnComparisonHead.replaceChildren();
  actualReturnComparison.replaceChildren();
  actualReturnResult.textContent = message || "";
  actualReturnResult.className = "comparison-result";
}

// Forfaitair voordeel per persoon: uit de aangifte/aanslag als dat is ingevuld,
// anders de indicatieve berekening van de tool.
function resolveForfaitaryIncomes(calculated, fiscalPartner) {
  const sources = [];
  const incomes = [0, 1].map((index) => {
    const raw = actualReturnState.forfaitaryOverride[index];
    if (index === 1 && !fiscalPartner) return 0;
    if (!isEmptyField(raw)) {
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("Het forfaitaire voordeel volgens aangifte of aanslag moet een bedrag van nul of hoger zijn.");
      }
      sources.push("aangifte/aanslag");
      return value;
    }
    sources.push("berekend");
    return calculated[index] || 0;
  });
  return { incomes, sources };
}

function submissionNote(year, fiscalPartner) {
  const numericYear = Number(year);
  const partnerText = fiscalPartner
    ? " Bij fiscale partners geven beide partners het werkelijke rendement op (ook als het voordeel maar bij één van hen ontstaat); het gezamenlijke rendement wordt toegerekend volgens de verdeling van de grondslag sparen en beleggen."
    : "";
  if (numericYear <= 2020) {
    return `Indienen voor ${year}: formulier Opgaaf werkelijk rendement (OWR). Alleen mogelijk als de aanslag op 24 december 2021 nog niet onherroepelijk vaststond en tijdig bezwaar of een verzoek om ambtshalve vermindering is gedaan (uiterlijk 31 december ${numericYear + 5}).${partnerText}`;
  }
  if (numericYear <= 2024) {
    return `Indienen voor ${year}: formulier Opgaaf werkelijk rendement (OWR, beschikbaar sinds juli 2025). Vereist is een ingediende aangifte of een definitieve aanslag over ${year}.${partnerText}`;
  }
  return `Indienen voor ${year}: het werkelijke rendement geeft u op in de aangifte inkomstenbelasting ${year} (niet in de voorlopige aanslag).${partnerText}`;
}

function updateActualReturnResults() {
  const context = actualReturnContext;
  if (!context) return;
  const { year, data, fiscalPartner, allocationPercent, forfaitaryIncomes, rows } = context;
  actualReturnError.hidden = true;
  actualReturnOverridePartner.hidden = !fiscalPartner;
  actualReturnAssessedPartner.hidden = !fiscalPartner;
  let result;
  let forfaitary;
  try {
    result = calculateActualReturn({
      year, items: buildActualReturnItems(rows), fiscalPartner, data,
    });
    forfaitary = resolveForfaitaryIncomes(forfaitaryIncomes, fiscalPartner);
  } catch (error) {
    actualReturnError.hidden = false;
    actualReturnError.textContent = error.message;
    actualReturnSummary.replaceChildren();
    actualReturnComparison.replaceChildren();
    actualReturnResult.textContent = "Controleer de aanvullende vermogensgegevens onder A.2.";
    actualReturnResult.className = "comparison-result";
    renderResultBar();
    actualReturnReport = { error: error.message, rows };
    renderReport();
    return;
  }

  if (context.accessDenied) {
    renderActualReturnPending({ year, data, fiscalPartner, forfaitary, rows, forfaitaryMethod: context.forfaitaryMethod, reason: "denied" });
    return;
  }
  if (!hasActualReturnInput(rows)) {
    renderActualReturnPending({ year, data, fiscalPartner, forfaitary, rows, forfaitaryMethod: context.forfaitaryMethod });
    return;
  }

  for (const line of result.lines) {
    const cell = actualReturnTables.querySelector(`[data-result-for="${CSS.escape(line.id)}"]`);
    if (!cell) continue;
    cell.textContent = formatActualReturnEuro(line.amount);
    cell.title = line.explanation;
  }

  const summary = [
    ["Banktegoeden", formatActualReturnEuro(result.categories.bank)],
    ["Contant geld", formatActualReturnEuro(result.categories.cash)],
    ["Overige bezittingen", formatActualReturnEuro(result.categories.asset)],
    ["Woningen en onroerende zaken", formatActualReturnEuro(result.categories.home)],
    ["Schulden (rente, valutaresultaat, kwijtschelding)", formatActualReturnEuro(result.categories.debt), "calculation-double-divider"],
  ];
  if (result.cashExempt) {
    summary.push([`Af: vrijgesteld deel contant geld (art. 5.31b; ${formatActualReturnEuro((data.cashExemption || 0) * (fiscalPartner ? 2 : 1))} in ${year})`, formatActualReturnEuro(-result.cashExempt)]);
  }
  if (result.greenExempt) {
    summary.push([`Af: vrijgesteld deel groene beleggingen (art. 5.32; ${formatActualReturnEuro((data.greenExemption || 0) * (fiscalPartner ? 2 : 1))} in ${year})`, formatActualReturnEuro(-result.greenExempt)]);
  }
  summary.push(["Werkelijk rendement vóór nulgrens", formatActualReturnEuro(result.totalBeforeFloor)]);
  summary.push(["Werkelijk rendement (minimaal € 0)", formatActualReturnEuro(result.total), "calculation-total calculation-strong-divider"]);
  const shares = allocateActualReturn({ total: result.total, fiscalPartner, allocationPercent });
  if (fiscalPartner) {
    summary.push([
      `Toerekening (${allocationPercent}% / ${100 - allocationPercent}%)`,
      `${formatActualReturnEuro(shares[0])} / ${formatActualReturnEuro(shares[1])}`,
    ]);
  }
  setActualReturnSummary(summary);

  const comparison = compareActualReturn({
    actualShares: shares, forfaitaryIncomes: forfaitary.incomes, fiscalPartner, taxRate: data.taxRate,
  });
  const taxOverview = buildAssessedOverview(comparison.persons, data, fiscalPartner);
  showActualReturnComparison(true);
  renderResultBar({
    forfaitary: taxOverview.total.forfaitaryTax,
    actual: taxOverview.total.actualTax,
    applied: taxOverview.total.appliedTax,
    assessed: taxOverview.total.assessed,
    difference: taxOverview.total.differenceWithAssessment,
  });
  renderTaxOverview(taxOverview, { fiscalPartner, data, forfaitaryMethod: context.forfaitaryMethod });
  actualReturnComparisonHead.replaceChildren();
  const head = document.createElement("tr");
  for (const label of ["Onderdeel", ...(fiscalPartner ? ["Belastingplichtige", "Partner"] : ["Belastingplichtige"])]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.append(th);
  }
  actualReturnComparisonHead.append(head);
  actualReturnComparison.replaceChildren();
  const whole = (value) => `${formatActualReturnEuro(value)} (aanslag: ${formatCalculationEuroWhole(assessmentIncome([value]))})`;
  const wholeTax = (income, value) => `${formatActualReturnEuro(value)} (aanslag: ${formatCalculationEuroWhole(assessmentTax([income], data.taxRate))})`;
  const tableRows = [
    ["Forfaitair voordeel", (person, index) => `${whole(person.forfaitary)} · ${forfaitary.sources[index]}`],
    ["Werkelijk rendement", (person) => whole(person.actual)],
    ["Toe te passen voordeel", (person) => whole(person.applied)],
    [`Box 3-belasting forfaitair (${data.taxRate}%)`, (person) => wholeTax(person.forfaitary, person.forfaitaryTax)],
    [`Box 3-belasting na tegenbewijs (${data.taxRate}%)`, (person) => wholeTax(person.applied, person.appliedTax)],
  ];
  for (const [label, format] of tableRows) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = label;
    tr.append(th);
    comparison.persons.forEach((person, index) => {
      const td = document.createElement("td");
      td.textContent = format(person, index);
      if (label.startsWith("Toe te passen") && person.usesActual) td.classList.add("is-favorable");
      tr.append(td);
    });
    actualReturnComparison.append(tr);
  }

  actualReturnResult.className = "comparison-result";
  const wholeEuro = (value) => formatCalculationEuroWhole(value);
  let resultText;
  if (comparison.anyActual) {
    resultText = `Het werkelijke rendement is lager dan het forfaitaire voordeel. Box 3-belasting ${wholeEuro(taxOverview.total.forfaitaryTax)} forfaitair → ${wholeEuro(taxOverview.total.appliedTax)} na tegenbewijs (indicatieve vermindering ${wholeEuro(taxOverview.total.forfaitaryTax - taxOverview.total.appliedTax)}).`;
    actualReturnResult.classList.add("is-relief-favorable");
  } else {
    resultText = `Het werkelijke rendement is niet lager dan het forfaitaire voordeel. De tegenbewijsregeling levert geen vermindering op; de box 3-belasting blijft ${wholeEuro(taxOverview.total.forfaitaryTax)}.`;
  }
  resultText += assessmentSentence(taxOverview);
  actualReturnResult.textContent = resultText;

  actualReturnNotes.replaceChildren();
  const notes = [
    ...result.notes,
    ...continuityNotes(rows, year),
    submissionNote(year, fiscalPartner),
    "Over het werkelijke rendement geldt geen heffingsvrij vermogen; het forfaitaire voordeel is al ná het heffingsvrije vermogen berekend.",
    "Niet verwerkt: persoonsgebonden aftrek, minderjarige kinderen, fiscaal partnerschap voor een deel van het jaar, immigratie of emigratie (binnenlandse en buitenlandse periode), voorkoming van dubbele belasting, onzakelijke voorwaarden en polisvrijstellingen.",
    "Controleer bijzondere situaties aan de wet en de uitvoeringspraktijk van het betreffende jaar.",
  ];
  for (const note of notes) {
    const li = document.createElement("li");
    li.textContent = note;
    actualReturnNotes.append(li);
  }
  actualReturnReport = { result, shares, comparison, forfaitary, rows, notes, taxOverview, forfaitaryMethod: context.forfaitaryMethod };
  renderReport();
}

function taxOverviewRows(overview, { forfaitaryMethod }) {
  const euroWhole = (value) => (value === null ? "—" : formatCalculationEuroWhole(value));
  const signed = (value, positive, negative) => {
    if (value === null) return "—";
    if (Math.abs(value) < 1) return "gelijk";
    return value > 0 ? `${formatCalculationEuroWhole(value)} ${positive}` : `${formatCalculationEuroWhole(-value)} ${negative}`;
  };
  const rows = [];
  if (overview.anyAssessed) {
    rows.push({ label: "Volgens aanslag (ingevuld)", get: (row) => euroWhole(row.assessed) });
  }
  rows.push(
    { label: `Forfaitair (${forfaitaryMethod})`, get: (row) => euroWhole(row.forfaitaryTax) },
    { label: "Bij werkelijk rendement", get: (row) => euroWhole(row.actualTax) },
    { label: "Te betalen na tegenbewijs (laagste)", get: (row) => euroWhole(row.appliedTax), strong: true },
  );
  if (overview.anyAssessed) {
    rows.push(
      { label: "Verschil aanslag − na tegenbewijs", get: (row) => signed(row.differenceWithAssessment, "minder te betalen / terug", "méér dan aanslag"), strong: true },
      { label: "Controle: aanslag − forfaitair (tool)", get: (row) => signed(row.assessmentCheck, "hoger dan tool", "lager dan tool") },
    );
  }
  return rows;
}

function renderTaxOverview(overview, { fiscalPartner, forfaitaryMethod }) {
  const columns = fiscalPartner ? ["Belastingplichtige", "Partner", "Totaal"] : ["Belastingplichtige"];
  actualReturnTaxHead.replaceChildren();
  const head = document.createElement("tr");
  for (const label of ["Box 3-belasting", ...columns]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.append(th);
  }
  actualReturnTaxHead.append(head);
  actualReturnTax.replaceChildren();
  const values = fiscalPartner ? [...overview.rows, overview.total] : overview.rows;
  for (const row of taxOverviewRows(overview, { forfaitaryMethod })) {
    const tr = document.createElement("tr");
    if (row.strong) tr.className = "tax-overview-strong";
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = row.label;
    tr.append(th);
    for (const value of values) {
      const td = document.createElement("td");
      td.textContent = row.get(value);
      tr.append(td);
    }
    actualReturnTax.append(tr);
  }
}

function renderActualReturnAccess(year) {
  const status = document.documentElement.dataset.reliefAccessStatus;
  const numericYear = Number(year);
  actualReturnAccess.hidden = true;
  if (numericYear <= 2020 && document.documentElement.dataset.reliefAccessComplete === "nee") {
    actualReturnAccess.hidden = false;
    actualReturnAccess.textContent =
      `Formele toegang voor ${year} is nog niet beoordeeld. Voor 2017–2020 is de tegenbewijsregeling alleen van toepassing bij toegang tot de Wet rechtsherstel box 3: vul eerst de formele beoordeling bovenaan in. Tot die tijd is deze uitkomst alleen indicatief.`;
  } else if (numericYear <= 2020 && status === "GEEN_TOEGANG_RECHTSHERSTEL") {
    actualReturnAccess.hidden = false;
    actualReturnAccess.textContent =
      "Volgens de formele beoordeling is er geen toegang tot de Wet rechtsherstel box 3. De tegenbewijsregeling (art. 6a Wet rechtsherstel) is dan niet van toepassing; deze uitkomst is alleen indicatief.";
  } else if (numericYear <= 2020 && status === "NADER_ONDERZOEK") {
    actualReturnAccess.hidden = false;
    actualReturnAccess.textContent =
      "De formele toegang tot de Wet rechtsherstel box 3 vraagt nader onderzoek. Toepassing van de tegenbewijsregeling hangt daarvan af.";
  }
  // Dezelfde status kort in de uitkomstbalk.
  const barAccess = document.querySelector("#result-bar-access");
  if (barAccess) {
    const complete = document.documentElement.dataset.reliefAccessComplete !== "nee";
    const label = numericYear > 2020
      ? ""
      : !complete
        ? "Formele toegang nog niet beoordeeld — bedragen zijn indicatief"
        : status === "TOEGANG_RECHTSHERSTEL"
          ? "Formele toegang: wel toegang tot Wet rechtsherstel box 3"
          : status === "GEEN_TOEGANG_RECHTSHERSTEL"
            ? "Formele toegang: geen toegang — tegenbewijsregeling niet van toepassing"
            : "Formele toegang: nader onderzoek noodzakelijk";
    barAccess.hidden = !label;
    barAccess.textContent = label;
    barAccess.className = `result-bar-access is-${status === "TOEGANG_RECHTSHERSTEL" && complete ? "ok" : status === "GEEN_TOEGANG_RECHTSHERSTEL" && complete ? "denied" : "open"}`;
  }
}

function refreshActualReturn() {
  if (!actualReturnContext) return;
  const { year } = actualReturnContext;
  const rows = collectActualReturnRows(year);
  const structure = JSON.stringify([year, rows]);
  if (structure !== actualReturnStructure) {
    actualReturnStructure = structure;
    renderActualReturnTables(rows, year);
  }
  actualReturnContext.rows = rows;
  updateActualReturnResults();
}

// Wordt aangeroepen vanuit renderCalculation met de forfaitaire uitkomst per persoon.
function renderActualReturn({ year, data, fiscalPartner, allocationPercent, forfaitaryIncomes, basisLabel, forfaitaryMethod, accessDenied = false }) {
  loadActualReturnState(year);
  document.querySelector("#actual-return-year").textContent = year;
  actualReturnBasis.textContent = Number(year) <= 2022
    ? `Grondslag: art. 6a Wet rechtsherstel box 3. Vergeleken wordt met het voordeel volgens de Wet rechtsherstel (${basisLabel}).`
    : "Grondslag: art. 5.25–5.36 Wet IB 2001 (Wet tegenbewijsregeling box 3). Vergeleken wordt met het forfaitaire voordeel volgens de Overbruggingswet box 3.";
  renderActualReturnAccess(year);
  actualReturnContext = { year, data, fiscalPartner, allocationPercent, forfaitaryIncomes, forfaitaryMethod, accessDenied, rows: [] };
  refreshActualReturn();
}

actualReturnAddExtra.addEventListener("click", () => {
  const year = yearSelect.value;
  if (!actualReturnContext || !year) return;
  const nextNumber = actualReturnState.extras.reduce((highest, extra) => {
    const match = /^extra-(\d+)$/.exec(extra.id);
    return match ? Math.max(highest, Number(match[1]) + 1) : highest;
  }, 1);
  actualReturnState.extras.push({ id: `extra-${nextNumber}`, name: "", type: "other" });
  saveActualReturnState(year);
  refreshActualReturn();
});

actualReturnOverrideInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const year = yearSelect.value;
    if (!actualReturnContext || !year) return;
    actualReturnState.forfaitaryOverride[index] = input.value;
    saveActualReturnState(year);
    updateActualReturnResults();
  });
});

actualReturnAssessedInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const year = yearSelect.value;
    if (!actualReturnContext || !year) return;
    actualReturnState.assessedTax[index] = input.value;
    saveActualReturnState(year);
    updateActualReturnResults();
  });
});

document.documentElement.addEventListener("box3:relief-access-status", () => {
  // De toegang bepaalt voor 2017-2020 de methode: alles opnieuw berekenen.
  renderCalculation();
});
