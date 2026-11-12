"use strict";

const total = document.querySelector("#savings-total");
const status = document.querySelector("#form-status");
const bankLink = document.querySelector("#bank-accounts-link");
const yearSelect = document.querySelector("#tax-year");
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
