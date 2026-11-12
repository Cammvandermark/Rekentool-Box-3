"use strict";

const ASSETS_STORAGE_KEY = "box3-calculator-other-assets-v1";
const CALCULATION_STORAGE_KEY = "box3-calculation-inputs-v1";
const rows = document.querySelector("#asset-rows");
const total = document.querySelector("#asset-total");
const saveStatus = document.querySelector("#save-status");
const errorStatus = document.querySelector("#form-status");
const yearSelect = document.querySelector("#tax-year");
const addAssetButton = document.querySelector("#add-asset");
const backLink = document.querySelector(".back-link");
const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const assetTypes = [
  ["securities", "Aandelen, obligaties, winstbewijzen en opties"],
  ["claims", "Vorderingen, uitgeleend geld of contant geld"],
  ["second-home", "2e woning, zoals een vakantiewoning"],
  ["real-estate", "Overige onroerende zaken"],
  ["capital-insurance", "Niet-vrijgesteld deel kapitaalverzekeringen"],
  ["periodic-rights", "Rechten op periodieke uitkeringen"],
  ["usufruct", "Vruchtgebruik of blote eigendom"],
  ["movable-property", "Roerende zaken als belegging of verhuurd"],
  ["crypto", "Cryptovaluta"],
  ["crowdfunding", "Vorderingen uit crowdfunding"],
  ["benefit-repayment", "Nabetalingen van toeslagen"],
  ["other", "Overige bezittingen of rechten"],
];

let assets = [];
let nextId = 1;

function storageKey() {
  return yearSelect.value ? `${ASSETS_STORAGE_KEY}:${yearSelect.value}` : null;
}

function initializedKey() {
  const key = storageKey();
  return key ? `${key}:categories-initialized` : null;
}

function showError(message) {
  errorStatus.hidden = false;
  errorStatus.textContent = message;
}

function readAssets() {
  const key = storageKey();
  assets = [];
  nextId = 1;
  addAssetButton.disabled = !key;
  errorStatus.hidden = true;
  if (!key) {
    saveStatus.textContent = "";
    return;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (
        !Array.isArray(parsed) ||
        parsed.some((asset) =>
          typeof asset.id !== "string" ||
          typeof asset.name !== "string" ||
          !assetTypes.some(([type]) => type === asset.type) ||
          typeof asset.value !== "number" ||
          !Number.isFinite(asset.value) ||
          asset.value < 0
        )
      ) {
        throw new Error("De opgeslagen bezittinggegevens hebben een ongeldig formaat.");
      }
      assets = parsed;
    } else {
      const legacy = localStorage.getItem(
        `${CALCULATION_STORAGE_KEY}:${yearSelect.value}`,
      );
      if (legacy !== null) {
        const parsed = JSON.parse(legacy);
        const value = Number(parsed?.investments);
        if (!Number.isFinite(value) || value < 0) {
          throw new Error("De eerder opgeslagen waarde voor overige bezittingen is ongeldig.");
        }
        if (value > 0) {
          assets = [{
            id: "bezitting-1",
            name: "Eerder ingevoerd totaal",
            type: "other",
            value,
          }];
        }
      }
    }
    nextId = assets.reduce((highest, asset) => {
      const match = /^bezitting-(\d+)$/.exec(asset.id);
      return match ? Math.max(highest, Number(match[1]) + 1) : highest;
    }, 1);
    const seedKey = initializedKey();
    if (localStorage.getItem(seedKey) !== "true") {
      const existingTypes = new Set(assets.map((asset) => asset.type));
      for (const [type] of assetTypes) {
        if (existingTypes.has(type)) continue;
        assets.push({
          id: `bezitting-${nextId++}`,
          name: "",
          type,
          value: 0,
        });
      }
      if (saveAssets()) {
        try {
          localStorage.setItem(seedKey, "true");
        } catch (error) {
          showError(`De categorie-initialisatie kon niet worden opgeslagen: ${error.message}`);
        }
      }
    }
  } catch (error) {
    showError(`Bezittingen konden niet worden geladen: ${error.message}`);
    assets = [];
  }
}

function saveAssets() {
  const key = storageKey();
  if (!key) return false;
  try {
    localStorage.setItem(key, JSON.stringify(assets));
    saveStatus.textContent = "Opgeslagen";
    errorStatus.hidden = true;
    return true;
  } catch (error) {
    saveStatus.textContent = "";
    showError(`Bezittingen konden niet worden opgeslagen: ${error.message}`);
    return false;
  }
}

function updateTotal() {
  const sum = assets.reduce((result, asset) => result + asset.value, 0);
  total.textContent = euro.format(sum);
}

function render() {
  rows.replaceChildren();

  for (const asset of assets) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const typeCell = document.createElement("td");
    const valueCell = document.createElement("td");
    const actionCell = document.createElement("td");

    const name = document.createElement("input");
    name.type = "text";
    name.value = asset.name;
    name.setAttribute("aria-label", "Omschrijving bezitting");
    name.addEventListener("input", () => {
      asset.name = name.value;
      saveAssets();
    });
    nameCell.append(name);

    const type = document.createElement("select");
    type.setAttribute("aria-label", "Soort bezitting");
    for (const [value, label] of assetTypes) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      type.append(option);
    }
    type.value = asset.type;
    type.addEventListener("change", () => {
      asset.type = type.value;
      saveAssets();
    });
    typeCell.append(type);

    const value = document.createElement("input");
    value.type = "number";
    value.min = "0";
    value.step = "0.01";
    value.inputMode = "decimal";
    value.value = String(asset.value);
    value.setAttribute("aria-label", "Waarde op 1 januari in euro");
    value.addEventListener("input", () => {
      if (value.value === "") {
        asset.value = 0;
      } else {
        const numericValue = Number(value.value);
        if (!Number.isFinite(numericValue) || numericValue < 0) {
          showError("Vul een geldige waarde van nul of hoger in.");
          return;
        }
        asset.value = numericValue;
      }
      updateTotal();
      saveAssets();
    });
    valueCell.append(value);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Verwijderen";
    remove.setAttribute(
      "aria-label",
      `${asset.name || "Bezitting zonder omschrijving"} verwijderen`,
    );
    remove.addEventListener("click", () => {
      assets = assets.filter((item) => item.id !== asset.id);
      render();
      saveAssets();
    });
    actionCell.append(remove);
    row.append(nameCell, typeCell, valueCell, actionCell);
    rows.append(row);
  }

  updateTotal();
}

addAssetButton.addEventListener("click", () => {
  assets.push({
    id: `bezitting-${nextId++}`,
    name: "",
    type: "other",
    value: 0,
  });
  render();
  saveAssets();
  rows.querySelector("tr:last-child input")?.focus();
});

window.addEventListener("storage", (event) => {
  if (event.key === storageKey() || event.key === null) {
    readAssets();
    render();
  }
});

yearSelect.value = new URLSearchParams(window.location.search).get("year") || "";
function updateBackLink() {
  backLink.href = yearSelect.value
    ? `index.html?year=${encodeURIComponent(yearSelect.value)}`
    : "index.html";
}

updateBackLink();
yearSelect.addEventListener("change", () => {
  const url = new URL(window.location.href);
  if (yearSelect.value) url.searchParams.set("year", yearSelect.value);
  else url.searchParams.delete("year");
  window.history.replaceState({}, "", url);
  updateBackLink();
  readAssets();
  render();
});

readAssets();
render();
