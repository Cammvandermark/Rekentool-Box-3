"use strict";

const DEBTS_STORAGE_KEY = "box3-calculator-debts-v1";
const CALCULATION_STORAGE_KEY = "box3-calculation-inputs-v1";
const rows = document.querySelector("#debt-rows");
const total = document.querySelector("#debt-total");
const saveStatus = document.querySelector("#save-status");
const errorStatus = document.querySelector("#form-status");
const yearSelect = document.querySelector("#tax-year");
const addDebtButton = document.querySelector("#add-debt");
const backLink = document.querySelector(".back-link");
const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const euroWhole = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const debtTypes = [
  ["consumer-credit", "Consumptief krediet of persoonlijke lening"],
  ["overdraft", "Negatief saldo op een bankrekening"],
  ["investment-loan", "Lening voor beleggingen"],
  ["second-home-mortgage", "Hypotheek of lening voor 2e woning of overige onroerende zaken"],
  ["study-debt", "Studieschuld (DUO)"],
  ["private-loan", "Lening van familie of vrienden"],
  ["paper-gift", "Schenking op papier (u bent de schenker)"],
  ["inheritance-tax", "Nog te betalen erfbelasting"],
  ["benefit-repayment", "Terug te betalen toeslagen"],
  ["pgb-repayment", "Terug te betalen pgb"],
  ["vve", "Schuld aan de VvE"],
  ["other", "Overige schulden"],
];

let debts = [];
let nextId = 1;

function storageKey() {
  return yearSelect.value ? `${DEBTS_STORAGE_KEY}:${yearSelect.value}` : null;
}

function showError(message) {
  errorStatus.hidden = false;
  errorStatus.textContent = message;
}

function readDebts() {
  const key = storageKey();
  debts = [];
  nextId = 1;
  addDebtButton.disabled = !key;
  errorStatus.hidden = true;
  if (!key) {
    saveStatus.textContent = "";
    showError("Er is geen belastingjaar gekozen. Ga terug naar het overzicht en kies eerst een jaar.");
    return;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (
        !Array.isArray(parsed) ||
        parsed.some((debt) =>
          typeof debt.id !== "string" ||
          typeof debt.name !== "string" ||
          !(debt.type === "" || debtTypes.some(([type]) => type === debt.type)) ||
          typeof debt.value !== "number" ||
          !Number.isFinite(debt.value) ||
          debt.value < 0
        )
      ) {
        throw new Error("De opgeslagen schuldgegevens hebben een ongeldig formaat.");
      }
      debts = parsed;
    } else {
      // Eerder ingevoerd totaalbedrag uit het dashboard overnemen als één regel.
      const legacy = localStorage.getItem(`${CALCULATION_STORAGE_KEY}:${yearSelect.value}`);
      const value = legacy === null ? 0 : Number(JSON.parse(legacy)?.debts || 0);
      if (Number.isFinite(value) && value > 0) {
        debts = [{ id: "schuld-1", name: "Eerder ingevoerd totaal", type: "other", value }];
      }
    }
    nextId = debts.reduce((highest, debt) => {
      const match = /^schuld-(\d+)$/.exec(debt.id);
      return match ? Math.max(highest, Number(match[1]) + 1) : highest;
    }, 1);
  } catch (error) {
    showError(`Schulden konden niet worden geladen: ${error.message}`);
    debts = [];
  }
}

function saveDebts() {
  const key = storageKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(debts));
    saveStatus.textContent = "Opgeslagen";
    errorStatus.hidden = true;
  } catch (error) {
    saveStatus.textContent = "";
    showError(`Schulden konden niet worden opgeslagen: ${error.message}`);
  }
}

function updateTotal() {
  total.textContent = euro.format(debts.reduce((sum, debt) => sum + debt.value, 0));
}

function render() {
  rows.replaceChildren();

  for (const debt of debts) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const typeCell = document.createElement("td");
    const valueCell = document.createElement("td");
    const actionCell = document.createElement("td");

    const name = document.createElement("input");
    name.type = "text";
    name.value = debt.name;
    name.setAttribute("aria-label", "Omschrijving schuld");
    name.placeholder = "Optioneel, geen persoonsgegevens";
    name.addEventListener("input", () => {
      debt.name = name.value;
      saveDebts();
    });
    nameCell.append(name);

    const type = document.createElement("select");
    type.setAttribute("aria-label", "Soort schuld");
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Kies soort schuld";
    type.append(defaultOption);
    for (const [value, label] of debtTypes) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      type.append(option);
    }
    type.value = debt.type;
    type.addEventListener("change", () => {
      debt.type = type.value;
      saveDebts();
    });
    typeCell.append(type);

    const value = document.createElement("input");
    value.type = "number";
    value.min = "0";
    value.step = "0.01";
    value.inputMode = "decimal";
    value.value = String(debt.value);
    value.setAttribute("aria-label", "Bedrag op 1 januari in euro");
    value.addEventListener("input", () => {
      if (value.value === "") {
        debt.value = 0;
      } else {
        const numericValue = Number(value.value);
        if (!Number.isFinite(numericValue) || numericValue < 0) {
          showError("Vul een geldig bedrag van nul of hoger in.");
          return;
        }
        debt.value = numericValue;
      }
      updateTotal();
      saveDebts();
    });
    valueCell.append(value);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Verwijderen";
    remove.setAttribute("aria-label", `${debt.name || "Schuld zonder omschrijving"} verwijderen`);
    remove.addEventListener("click", () => {
      debts = debts.filter((item) => item.id !== debt.id);
      render();
      saveDebts();
    });
    actionCell.append(remove);
    row.append(nameCell, typeCell, valueCell, actionCell);
    rows.append(row);
  }

  updateTotal();
}

function updateBackLink() {
  const query = yearSelect.value ? `?year=${encodeURIComponent(yearSelect.value)}` : "";
  backLink.href = `index.html${query}`;
  for (const link of document.querySelectorAll("[data-year-link]")) {
    link.href = `${link.getAttribute("href").split("?")[0]}${query}`;
  }
}

function updatePageTitle() {
  const h1 = document.querySelector("h1");
  if (h1) h1.textContent = yearSelect.value ? `Schulden ${yearSelect.value}` : "Schulden";
}

function updateYearTexts() {
  const data = BOX3_YEAR_DATA[yearSelect.value];
  const percentage = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const texts = data
    ? {
        threshold: ` (voor ${yearSelect.value}: ${euroWhole.format(data.debtThreshold)} per persoon, ${euroWhole.format(data.debtThreshold * 2)} als u het hele jaar een fiscale partner had)`,
        rate: ` (${percentage.format(data.reliefDebtRate)}% in ${yearSelect.value}${yearSelect.value === "2026" ? ", voorlopig" : ""})`,
      }
    : { threshold: "", rate: "" };
  for (const element of document.querySelectorAll("[data-year-text]")) {
    element.textContent = texts[element.dataset.yearText] ?? "";
  }
}

addDebtButton.addEventListener("click", () => {
  debts.push({ id: `schuld-${nextId++}`, name: "", type: "", value: 0 });
  render();
  saveDebts();
  rows.querySelector("tr:last-child input")?.focus();
});

window.addEventListener("storage", (event) => {
  if (event.key === storageKey() || event.key === null) {
    readDebts();
    render();
  }
});

yearSelect.value = new URLSearchParams(window.location.search).get("year") || "";
updateBackLink();
updatePageTitle();
updateYearTexts();
readDebts();
render();
