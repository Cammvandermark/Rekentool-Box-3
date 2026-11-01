"use strict";

const STORAGE_KEY = "box3-calculator-bank-accounts-v1";
const rows = document.querySelector("#account-rows");
const total = document.querySelector("#account-total");
const saveStatus = document.querySelector("#save-status");
const errorStatus = document.querySelector("#form-status");
const yearSelect = document.querySelector("#tax-year");
const addAccountButton = document.querySelector("#add-account");
const backLink = document.querySelector(".back-link");
const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let accounts = [];
let nextId = 1;

function storageKey() {
  return yearSelect.value ? `${STORAGE_KEY}:${yearSelect.value}` : null;
}

function showError(message) {
  errorStatus.hidden = false;
  errorStatus.textContent = message;
}

function readAccounts() {
  const key = storageKey();
  accounts = [];
  nextId = 1;
  addAccountButton.disabled = !key;
  if (!key) {
    saveStatus.textContent = "";
    return;
  }

  try {
    const stored = localStorage.getItem(key);
    const parsed = stored === null ? [] : JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.some((account) =>
      typeof account.id !== "string" ||
      typeof account.name !== "string" ||
      typeof account.bank !== "string" ||
      typeof account.balance !== "number" ||
      !Number.isFinite(account.balance)
    )) {
      throw new Error("De opgeslagen rekeninggegevens hebben een ongeldig formaat.");
    }
    accounts = parsed;
    nextId = accounts.reduce((highest, account) => {
      const match = /^rekening-(\d+)$/.exec(account.id);
      return match ? Math.max(highest, Number(match[1]) + 1) : highest;
    }, 1);
  } catch (error) {
    showError(`Rekeninggegevens konden niet worden geladen: ${error.message}`);
    accounts = [];
  }
}

function saveAccounts() {
  const key = storageKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(accounts));
    saveStatus.textContent = "Opgeslagen";
  } catch (error) {
    saveStatus.textContent = "";
    showError(`Rekeninggegevens konden niet worden opgeslagen: ${error.message}`);
  }
}

function updateTotal() {
  const sum = accounts.reduce((result, account) => result + account.balance, 0);
  total.textContent = euro.format(sum);
}

function createTextInput(account, key, label) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = account[key];
  input.setAttribute("aria-label", label);
  input.addEventListener("input", () => {
    account[key] = input.value;
    saveAccounts();
  });
  return input;
}

function render() {
  rows.replaceChildren();

  for (const account of accounts) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const bankCell = document.createElement("td");
    const balanceCell = document.createElement("td");
    const actionCell = document.createElement("td");

    nameCell.append(createTextInput(account, "name", "Naam rekening"));
    bankCell.append(createTextInput(account, "bank", "Bank"));

    const balance = document.createElement("input");
    balance.type = "number";
    balance.min = "0";
    balance.step = "0.01";
    balance.inputMode = "decimal";
    balance.value = String(account.balance);
    balance.setAttribute("aria-label", "Saldo op 1 januari in euro");
    balance.addEventListener("input", () => {
      if (balance.value === "") {
        account.balance = 0;
      } else {
        const value = Number(balance.value);
        if (!Number.isFinite(value) || value < 0) {
          showError("Vul een geldig positief saldo in.");
          return;
        }
        account.balance = value;
      }
      errorStatus.hidden = true;
      updateTotal();
      saveAccounts();
    });
    balanceCell.append(balance);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Verwijderen";
    remove.setAttribute("aria-label", `Rekening ${account.name || "zonder naam"} verwijderen`);
    remove.addEventListener("click", () => {
      accounts = accounts.filter((item) => item.id !== account.id);
      render();
      saveAccounts();
    });
    actionCell.append(remove);
    row.append(nameCell, bankCell, balanceCell, actionCell);
    rows.append(row);
  }

  updateTotal();
}

addAccountButton.addEventListener("click", () => {
  accounts.push({
    id: `rekening-${nextId++}`,
    name: "",
    bank: "",
    balance: 0,
  });
  render();
  saveAccounts();
  rows.querySelector("tr:last-child input")?.focus();
});

window.addEventListener("storage", (event) => {
  if (event.key === storageKey() || event.key === null) {
    readAccounts();
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
  errorStatus.hidden = true;
  readAccounts();
  render();
});

readAccounts();
render();
