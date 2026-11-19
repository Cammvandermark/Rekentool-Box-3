"use strict";

// A.1: banktegoeden, overige bezittingen en schulden direct op het overzicht
// invullen. Elke tabel begint met één regel; rechts kan een regel worden
// toegevoegd (+) of verwijderd (×). De gegevens worden in hetzelfde formaat en
// onder dezelfde sleutels en in hetzelfde formaat als op de vroegere
// invoerpagina's, zodat eerder ingevoerde dossiers, A.2 en het
// verslag ongewijzigd blijven werken.

(() => {
  const OTHER_ASSET_TYPES = [
    ["securities", "Aandelen, obligaties, winstbewijzen en opties"],
    ["claims", "Vorderingen of uitgeleend geld"],
    ["cash", "Contant geld"],
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
  const DEBT_TYPES = [
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
  const amountFormat = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const SECTIONS = {
    bank: {
      storage: () => STORAGE_KEY,
      idPrefix: "rekening",
      amountField: "balance",
      amountLabel: "Saldo 1 januari",
      legacyField: null,
      newItem: (id) => ({ id, name: "", bank: "", balance: 0 }),
      // Vanaf 2023 telt contant geld als banktegoed (art. 5.2 Wet IB 2001).
      typeColumn: (year, items) => (Number(year) >= 2023 || items.some((item) => item.kind === "cash")
        ? {
          label: "Soort",
          options: [["", "Bankrekening"], ["cash", "Contant geld"]],
          get: (item) => item.kind || "",
          set: (item, value) => {
            if (value === "cash") item.kind = "cash";
            else delete item.kind;
          },
        }
        : null),
    },
    other: {
      storage: () => OTHER_ASSETS_STORAGE_KEY,
      idPrefix: "bezitting",
      amountField: "value",
      amountLabel: "Waarde 1 januari",
      legacyField: "investments",
      newItem: (id) => ({ id, name: "", type: "", value: 0 }),
      typeColumn: (year) => ({
        label: "Soort",
        options: [["", "Kies soort"], ...OTHER_ASSET_TYPES],
        // Vanaf 2023 hoort contant geld bij Banktegoeden.
        hide: (value, item) => value === "cash" && Number(year) >= 2023 && item.type !== "cash",
        get: (item) => item.type || "",
        set: (item, value) => { item.type = value; },
      }),
    },
    debts: {
      storage: () => DEBTS_STORAGE_KEY,
      idPrefix: "schuld",
      amountField: "value",
      amountLabel: "Bedrag 1 januari",
      legacyField: "debts",
      newItem: (id) => ({ id, name: "", type: "", value: 0 }),
      typeColumn: () => ({
        label: "Soort",
        options: [["", "Kies soort"], ...DEBT_TYPES],
        get: (item) => item.type || "",
        set: (item, value) => { item.type = value; },
      }),
    },
  };

  const state = { year: "", lists: {}, placeholders: {} };

  function storageKeyFor(section, year) {
    return `${SECTIONS[section].storage()}:${year}`;
  }

  function loadList(section, year) {
    const config = SECTIONS[section];
    let list = [];
    let fromStorage = false;
    try {
      const stored = localStorage.getItem(storageKeyFor(section, year));
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          list = parsed;
          fromStorage = true;
        }
      }
      // Eerder ingevoerd totaalbedrag (van vóór de detailpagina's).
      if (!fromStorage && config.legacyField) {
        const legacy = JSON.parse(localStorage.getItem(`${CALCULATION_STORAGE_KEY}:${year}`) || "null");
        const value = Number(legacy?.[config.legacyField] || 0);
        if (Number.isFinite(value) && value > 0) {
          list = [{ ...config.newItem(`${config.idPrefix}-1`), name: "Eerder ingevoerd totaal", type: "other", [config.amountField]: value }];
        }
      }
    } catch {
      list = [];
    }
    return list;
  }

  function nextId(section) {
    const config = SECTIONS[section];
    const pattern = new RegExp(`^${config.idPrefix}-(\\d+)$`);
    const highest = state.lists[section].reduce((max, item) => {
      const match = pattern.exec(item.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return `${config.idPrefix}-${highest + 1}`;
  }

  function save(section) {
    try {
      localStorage.setItem(storageKeyFor(section, state.year), JSON.stringify(state.lists[section]));
    } catch (error) {
      showCalculationError(`Gegevens konden niet worden opgeslagen: ${error.message}`);
      return;
    }
    // Totalen, berekening, A.2 en verslag bijwerken.
    renderTotal();
  }

  // De lege eerste regel wordt pas bewaard zodra er iets wordt ingevuld.
  function ensureStored(section, item) {
    if (state.placeholders[section] === item) {
      state.lists[section].push(item);
      state.placeholders[section] = null;
    }
  }

  function amountText(value) {
    return value ? amountFormat.format(value) : "";
  }

  function buildRow(section, item, { isLast, typeColumn }) {
    const config = SECTIONS[section];
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const name = document.createElement("input");
    name.type = "text";
    name.value = item.name || "";
    name.placeholder = "Omschrijving (optioneel)";
    name.setAttribute("aria-label", "Omschrijving");
    name.addEventListener("input", () => {
      ensureStored(section, item);
      item.name = name.value;
      save(section);
    });
    nameCell.append(name);
    row.append(nameCell);

    if (typeColumn) {
      const typeCell = document.createElement("td");
      const select = document.createElement("select");
      select.setAttribute("aria-label", typeColumn.label);
      for (const [value, label] of typeColumn.options) {
        if (typeColumn.hide?.(value, item)) continue;
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        select.append(option);
      }
      select.value = typeColumn.get(item);
      select.addEventListener("change", () => {
        ensureStored(section, item);
        typeColumn.set(item, select.value);
        save(section);
      });
      typeCell.append(select);
      row.append(typeCell);
    }

    const amountCell = document.createElement("td");
    const amount = document.createElement("input");
    amount.type = "text";
    amount.inputMode = "decimal";
    amount.autocomplete = "off";
    amount.className = "asset-input-amount";
    amount.value = amountText(item[config.amountField]);
    amount.placeholder = config.amountLabel;
    amount.setAttribute("aria-label", config.amountLabel);
    amount.addEventListener("input", () => {
      let value;
      try {
        value = parseDutchAmount(amount.value, { label: config.amountLabel }) ?? 0;
      } catch {
        amount.setAttribute("aria-invalid", "true");
        return;
      }
      amount.setAttribute("aria-invalid", "false");
      ensureStored(section, item);
      item[config.amountField] = value;
      save(section);
    });
    amount.addEventListener("blur", () => {
      if (amount.getAttribute("aria-invalid") === "true") return;
      amount.value = amountText(item[config.amountField]);
    });
    amountCell.append(amount);
    row.append(amountCell);

    const actionCell = document.createElement("td");
    actionCell.className = "asset-input-actions";
    {
      // Op elke regel; op de nog lege eerste regel maakt × de regel leeg.
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "row-button row-remove";
      remove.textContent = "×";
      remove.title = "Regel verwijderen";
      remove.setAttribute("aria-label", `${item.name || "Regel"} verwijderen`);
      remove.addEventListener("click", () => {
        if (state.lists[section].includes(item)) {
          state.lists[section] = state.lists[section].filter((entry) => entry !== item);
          save(section);
        }
        renderSection(section);
      });
      actionCell.append(remove);
    }
    if (isLast) {
      const add = document.createElement("button");
      add.type = "button";
      add.className = "row-button row-add";
      add.textContent = "+";
      add.title = "Regel toevoegen";
      add.setAttribute("aria-label", "Regel toevoegen");
      add.addEventListener("click", () => {
        // Een nog lege eerste regel eerst bewaren, zodat de nieuwe regel eronder komt.
        if (state.placeholders[section]) ensureStored(section, state.placeholders[section]);
        state.lists[section].push(SECTIONS[section].newItem(nextId(section)));
        save(section);
        renderSection(section);
        document.querySelector(`[data-asset-input="${section}"] tbody tr:last-child input`)?.focus();
      });
      actionCell.append(add);
    }
    row.append(actionCell);
    return row;
  }

  function renderSection(section) {
    const table = document.querySelector(`[data-asset-input="${section}"]`);
    if (!table) return;
    const config = SECTIONS[section];
    const list = state.lists[section];
    const typeColumn = config.typeColumn(state.year, list);

    // Geen kolomkoppen (rustiger beeld): elk veld heeft een eigen naam
    // (aria-label) en het bedragveld toont de kolomnaam als hulptekst.
    table.querySelector("thead")?.replaceChildren();
    table.querySelector("tfoot th").colSpan = typeColumn ? 2 : 1;

    const body = table.querySelector("tbody");
    body.replaceChildren();
    state.placeholders[section] = list.length ? null : config.newItem(`${config.idPrefix}-1`);
    const shown = list.length ? list : [state.placeholders[section]];
    shown.forEach((item, index) => {
      body.append(buildRow(section, item, { isLast: index === shown.length - 1, typeColumn }));
    });
  }

  function updateYearTexts(year) {
    const data = BOX3_YEAR_DATA[year];
    const numericYear = Number(year);
    const percentage = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const texts = data
      ? {
        peildatum: ` (voor ${year}: 1 januari ${year})`,
        woz: ` (voor ${year}: 1 januari ${numericYear - 1})`,
        threshold: ` (voor ${year}: ${formatCalculationEuroWhole(data.debtThreshold)} per persoon, ${formatCalculationEuroWhole(data.debtThreshold * 2)} als u het hele jaar een fiscale partner had)`,
        rate: ` (${percentage.format(data.reliefDebtRate)}% in ${year}${year === "2026" ? ", voorlopig" : ""})`,
      }
      : {};
    for (const element of document.querySelectorAll("#calculation-section [data-year-text]")) {
      element.textContent = texts[element.dataset.yearText] ?? "";
    }
  }

  function renderAll() {
    const year = yearSelect.value;
    state.year = year;
    if (!BOX3_YEAR_DATA[year]) return;
    for (const section of Object.keys(SECTIONS)) {
      state.lists[section] = loadList(section, year);
      renderSection(section);
    }
    updateYearTexts(year);
  }

  yearSelect.addEventListener("change", renderAll);
  window.addEventListener("storage", (event) => {
    if (event.key === null || Object.keys(SECTIONS).some((section) => event.key === storageKeyFor(section, state.year))) {
      renderAll();
    }
  });
  renderAll();
})();
