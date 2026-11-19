"use strict";

// Snelcontrole OWR: invoer en weergave. De rekenregels staan in
// snelcontrole-berekening.js. Eigen scope, omdat de gedeelde klassieke scripts
// globale namen als `total`, `status` en `euro` gebruiken.
(() => {
  const STORAGE = "box3-snelcontrole-v1";
  const AMOUNT_FIELDS = [
    ["bank", "Banktegoeden"],
    ["other", "Overige bezittingen"],
    ["cash", "Waarvan contant geld"],
    ["debts", "Schulden"],
  ];
  const inputBody = document.querySelector("#qc-input-rows");
  const resultBody = document.querySelector("#qc-result-rows");
  const wholeEuro = (value) => formatCalculationEuroWhole(value);

  function loadState() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(state));
    } catch {
      // Opslag niet beschikbaar: de pagina werkt zonder.
    }
  }

  function createAmountInput(year, field, label, value, signed = false) {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.className = "quick-check-amount";
    input.dataset.year = year;
    input.dataset.field = field;
    input.dataset.signed = signed ? "yes" : "no";
    input.setAttribute("aria-label", `${label} ${year}`);
    input.value = value ?? "";
    return input;
  }

  function buildInputRows() {
    const state = loadState();
    inputBody.replaceChildren();
    for (const year of QUICK_CHECK_YEARS) {
      const saved = state[year] || {};
      const row = document.createElement("tr");
      row.dataset.year = year;

      const yearCell = document.createElement("th");
      yearCell.scope = "row";
      const route = quickCheckRoute(year);
      yearCell.innerHTML = `<span class="quick-check-year">${year}</span><span class="quick-check-route is-${route.level}">${route.label}</span>`;
      row.append(yearCell);

      for (const [field, label] of AMOUNT_FIELDS) {
        const cell = document.createElement("td");
        cell.append(createAmountInput(year, field, label, saved[field]));
        row.append(cell);
      }

      const partnerCell = document.createElement("td");
      const partner = document.createElement("input");
      partner.type = "checkbox";
      partner.dataset.year = year;
      partner.dataset.field = "fiscalPartner";
      partner.checked = Boolean(saved.fiscalPartner);
      partner.setAttribute("aria-label", `Fiscale partner ${year}`);
      partnerCell.append(partner);
      row.append(partnerCell);

      const allocationCell = document.createElement("td");
      const allocation = document.createElement("input");
      allocation.type = "text";
      allocation.inputMode = "numeric";
      allocation.className = "quick-check-percent";
      allocation.dataset.year = year;
      allocation.dataset.field = "allocationPercent";
      allocation.value = saved.allocationPercent ?? "50";
      allocation.disabled = !partner.checked;
      allocation.setAttribute("aria-label", `Aandeel belastingplichtige in procenten ${year}`);
      allocationCell.append(allocation);
      row.append(allocationCell);

      const actualCell = document.createElement("td");
      actualCell.append(createAmountInput(year, "actualReturn", "Werkelijk rendement", saved.actualReturn, true));
      row.append(actualCell);
      const assessedCell = document.createElement("td");
      assessedCell.append(createAmountInput(year, "assessedTax", "Belasting volgens aanslag", saved.assessedTax));
      row.append(assessedCell);

      inputBody.append(row);
    }
  }

  function readRows() {
    return QUICK_CHECK_YEARS.map((year) => {
      const row = { year };
      for (const input of inputBody.querySelectorAll(`[data-year="${year}"]`)) {
        row[input.dataset.field] = input.type === "checkbox" ? input.checked : input.value;
      }
      return row;
    });
  }

  function persist(rows) {
    const state = {};
    for (const row of rows) {
      if (!quickCheckRowIsEmpty(row) || row.fiscalPartner) state[row.year] = row;
    }
    saveState(state);
  }

  function cell(text, className) {
    const td = document.createElement("td");
    td.textContent = text;
    if (className) td.className = className;
    return td;
  }

  function differenceCell(value) {
    if (value === null) return cell("—");
    const className = value > 0 ? "quick-check-refund" : value < 0 ? "quick-check-extra" : "";
    return cell(`${value > 0 ? "+" : value < 0 ? "−" : ""}${wholeEuro(Math.abs(value))}`, className);
  }

  function renderResults(rows) {
    const { results, totals } = calculateQuickCheck(rows);
    resultBody.replaceChildren();
    if (!results.length) {
      const row = document.createElement("tr");
      row.append(cell("Nog geen jaren ingevuld."));
      row.firstChild.colSpan = 9;
      resultBody.append(row);
    }
    for (const entry of results) {
      const row = document.createElement("tr");
      const yearCell = document.createElement("th");
      yearCell.scope = "row";
      yearCell.textContent = entry.year;
      row.append(yearCell);
      if (!entry.ok) {
        row.classList.add("quick-check-error-row");
        const message = cell(entry.error);
        message.colSpan = 8;
        row.append(message);
        resultBody.append(row);
        continue;
      }
      const result = entry.result;
      row.append(
        cell(result.forfaitaryMethod),
        cell(formatCalculationEuro(result.forfaitaryIncome)),
        cell(wholeEuro(result.forfaitaryTax), result.hasActual && result.comparison.anyActual ? "" : "is-favorable"),
        cell(result.actualTax === null ? "—" : wholeEuro(result.actualTax), result.hasActual && result.comparison.anyActual ? "is-favorable" : ""),
        cell(wholeEuro(result.appliedTax), "quick-check-applied"),
        cell(result.assessed === null ? "—" : wholeEuro(result.assessed)),
        differenceCell(result.difference),
      );
      const signalCell = document.createElement("td");
      signalCell.className = "quick-check-signals";
      if (result.signals.length) {
        const list = document.createElement("ul");
        for (const signal of result.signals) {
          const item = document.createElement("li");
          item.className = `is-${signal.level}`;
          item.textContent = signal.text;
          list.append(item);
        }
        signalCell.append(list);
      } else {
        signalCell.textContent = "—";
      }
      row.append(signalCell);
      resultBody.append(row);
    }

    const valid = results.some((entry) => entry.ok);
    document.querySelector("#qc-total-forfaitary").textContent = valid ? wholeEuro(totals.forfaitaryTax) : "—";
    document.querySelector("#qc-total-applied").textContent = valid ? wholeEuro(totals.appliedTax) : "—";
    document.querySelector("#qc-total-assessed").textContent = totals.assessed === null
      ? "—"
      : `${wholeEuro(totals.assessed)} (${totals.yearsWithAssessment} ${totals.yearsWithAssessment === 1 ? "jaar" : "jaren"})`;
    const differenceTotal = document.querySelector("#qc-total-difference");
    differenceTotal.textContent = totals.difference === null
      ? "—"
      : `${totals.difference > 0 ? "+" : totals.difference < 0 ? "−" : ""}${wholeEuro(Math.abs(totals.difference))}`;
    differenceTotal.className = totals.difference > 0 ? "quick-check-refund" : totals.difference < 0 ? "quick-check-extra" : "";

    for (const input of inputBody.querySelectorAll(".quick-check-amount")) {
      let invalid = false;
      try {
        parseDutchAmount(input.value, { signed: input.dataset.signed === "yes" });
      } catch {
        invalid = true;
      }
      input.setAttribute("aria-invalid", String(invalid));
    }
  }

  function update() {
    const rows = readRows();
    persist(rows);
    renderResults(rows);
  }

  // Na het verlaten van een veld het bedrag netjes in Nederlandse notatie tonen.
  function formatOnBlur(event) {
    const input = event.target;
    if (!input.classList?.contains("quick-check-amount")) return;
    try {
      const value = parseDutchAmount(input.value, { signed: input.dataset.signed === "yes" });
      if (value === null) return;
      input.value = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
      update();
    } catch {
      // Ongeldige invoer blijft staan en is gemarkeerd.
    }
  }

  inputBody.addEventListener("input", update);
  inputBody.addEventListener("change", (event) => {
    if (event.target.dataset.field === "fiscalPartner") {
      const allocation = inputBody.querySelector(`[data-year="${event.target.dataset.year}"][data-field="allocationPercent"]`);
      allocation.disabled = !event.target.checked;
    }
    update();
  });
  inputBody.addEventListener("focusout", formatOnBlur);
  document.querySelector("#qc-print").addEventListener("click", () => window.print());
  document.querySelector("#qc-clear").addEventListener("click", () => {
    if (!window.confirm("Alle invoer van de snelcontrole leegmaken?")) return;
    saveState({});
    buildInputRows();
    update();
  });

  buildInputRows();
  renderResults(readRows());
})();
