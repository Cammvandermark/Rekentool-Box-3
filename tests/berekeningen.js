"use strict";

const expectedTaxes = {
  2017: [16574.87, 1180.08],
  2018: [15575.31, 712.20],
  2019: [15955.99, 569.63],
  2020: [14963.69, 427.05],
  2021: [16683.17, 361.83],
  2022: [16125.55, 309.63],
  2023: [0, 3724.36],
  2024: [0, 6323.53],
  2025: [0, 6020.79],
  2026: [0, 5650.93],
};
const failures = [];

function assertEqual(label, actual, expected) {
  if (actual !== expected) failures.push(`${label}: verwacht ${expected}, kreeg ${actual}`);
}

for (const [year, expected] of Object.entries(expectedTaxes)) {
  const data = BOX3_YEAR_DATA[year];
  const deductibleDebts = 6000 - data.debtThreshold;
  const netAssets = 1220000 - deductibleDebts;
  const firstPartnerBase = netAssets - data.exemption;
  const old = calculateOldMethod({
    firstPartnerBase, secondPartnerBase: 0, fiscalPartner: false,
    yearUsesOldMethodComparison: Number(year) <= 2022, data,
  });
  const relief = calculateForfaitaryReturn({
    bank: 1200000, investments: 20000, deductibleDebts, data, year, netAssets,
    firstPartnerBase, secondPartnerBase: 0, fiscalPartner: false,
  });
  assertEqual(`${year} oude belasting`, old.oldTax, expected[0]);
  assertEqual(`${year} forfaitaire belasting`, relief.reliefTax, expected[1]);
}

const data2024 = BOX3_YEAR_DATA[2024];
const partnerExample = calculateForfaitaryReturn({
  bank: 150000, investments: 0, deductibleDebts: 0, data: data2024,
  year: "2024", netAssets: 150000, firstPartnerBase: 18000,
  secondPartnerBase: 18000, fiscalPartner: true,
});
assertEqual("2024 partners: inkomen", partnerExample.reliefIncome, 518.40);
assertEqual("2024 partners: belasting", partnerExample.reliefTax, 186.62);
const emptyExample = calculateForfaitaryReturn({
  bank: 0, investments: 0, deductibleDebts: 0, data: data2024,
  year: "2024", netAssets: 0, firstPartnerBase: 0,
  secondPartnerBase: 0, fiscalPartner: false,
});
assertEqual("Geen vermogen: belasting", emptyExample.reliefTax, 0);
assertEqual("Geen vermogen: uitleg", emptyExample.yieldRateExplanation, "Geen rendementsgrondslag; aandeel 0%");

const result = document.querySelector("#resultaat");
result.textContent = failures.length ? failures.join("\n") : "Alle berekeningstests geslaagd.";
result.dataset.status = failures.length ? "failed" : "passed";
