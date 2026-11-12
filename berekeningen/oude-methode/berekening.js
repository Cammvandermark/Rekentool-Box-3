"use strict";

function calculateOldTierAmounts(taxableBase, data) {
  return [
    Math.min(taxableBase, data.tier1),
    Math.min(Math.max(0, taxableBase - data.tier1), data.tier2 - data.tier1),
    Math.max(0, taxableBase - data.tier2),
  ];
}

function calculateOldTierRates(data) {
  return data.oldTierRates || [0, 0, 0];
}

function calculateOldYield(taxableBase, data) {
  const tierAmounts = calculateOldTierAmounts(taxableBase, data);
  const tierRates = calculateOldTierRates(data);
  return tierAmounts.map((amount, index) =>
    roundToTwoDecimals(
      amount * tierRates[index] / 100,
    ),
  );
}

function calculateOldMethod({ firstPartnerBase, secondPartnerBase, fiscalPartner, yearUsesOldMethodComparison, data }) {
  const firstPartnerTiers = yearUsesOldMethodComparison
    ? calculateOldYield(firstPartnerBase, data)
    : [0, 0, 0];
  const secondPartnerTiers = fiscalPartner && yearUsesOldMethodComparison
    ? calculateOldYield(secondPartnerBase, data)
    : [0, 0, 0];
  const firstPartnerTierAmounts = calculateOldTierAmounts(firstPartnerBase, data);
  const secondPartnerTierAmounts = fiscalPartner
    ? calculateOldTierAmounts(secondPartnerBase, data)
    : [0, 0, 0];
  const oldTierRates = calculateOldTierRates(data);
  const oldTierReturns = firstPartnerTiers.map(
    (value, index) =>
      roundToTwoDecimals(value + secondPartnerTiers[index]),
  );
  const oldTierCalculations = oldTierReturns.map((total, index) => {
    const partnerAmounts = [
      firstPartnerTierAmounts[index],
      secondPartnerTierAmounts[index],
    ];
    const multiplier = formatOldYieldRate(oldTierRates[index]);
    const calculationParts = partnerAmounts
      .filter((amount) => amount > 0)
      .map((amount) => ({
        amount: formatCalculationEuro(amount),
        result: formatCalculationEuro(
          roundToTwoDecimals(amount * oldTierRates[index] / 100),
        ),
      }));
    if (calculationParts.length === 0) {
      return `${formatCalculationEuro(0)} × ${multiplier} = ${formatCalculationEuro(total)}`;
    }
    if (calculationParts.length === 1) {
      return `${calculationParts[0].amount} × ${multiplier} = ${formatCalculationEuro(total)}`;
    }
    return `${calculationParts.map(({ amount, result }) =>
      `(${amount} × ${multiplier} = ${result})`,
    ).join(" + ")} = ${formatCalculationEuro(total)}`;
  });
  const firstPartnerIncome = roundToTwoDecimals(
    firstPartnerTiers.reduce((sum, value) => sum + value, 0),
  );
  const secondPartnerIncome = fiscalPartner
    ? roundToTwoDecimals(
      secondPartnerTiers.reduce((sum, value) => sum + value, 0),
    )
    : 0;
  const oldIncome = roundToTwoDecimals(
    firstPartnerIncome + secondPartnerIncome,
  );
  const oldTax = roundToTwoDecimals(
    roundToTwoDecimals(firstPartnerIncome * data.taxRate / 100) +
    roundToTwoDecimals(secondPartnerIncome * data.taxRate / 100),
  );

  return { oldTierRates, oldTierReturns, oldTierCalculations, oldIncome, oldTax };
}

function renderOldTierDetails({ data, oldTierRates, oldTierCalculations, yearUsesOldMethodComparison }) {
  document.querySelector("#old-method-note").textContent =
    yearUsesOldMethodComparison
      ? `Forfait sparen: ${formatCalculationRate(data.savingsRate)}\nForfait beleggen: ${formatCalculationRate(data.investmentRate)}`
      : "";
  document.querySelector("#old-tax-label").textContent =
    `Box 3-belasting oude methode (${data.taxRate}%)`;
  document.querySelector("#old-tier-1-range").textContent =
    `${formatCalculationEuroWhole(0)} - ${formatCalculationEuroWhole(data.tier1)}`;
  document.querySelector("#old-tier-1-allocation").textContent =
    "Sparen / Beleggen = 67% / 33%";
  document.querySelector("#old-tier-1-explanation").textContent =
    `(67% × ${formatCalculationRate(data.savingsRate)}) + (33% × ${formatCalculationRate(data.investmentRate)}) = ${formatOldYieldRate(oldTierRates[0])}`;
  document.querySelector("#old-tier-1-calculation").textContent =
    oldTierCalculations[0];
  document.querySelector("#old-tier-2-range").textContent =
    `${formatCalculationEuroWhole(data.tier1)} - ${formatCalculationEuroWhole(data.tier2)}`;
  document.querySelector("#old-tier-2-allocation").textContent =
    "Sparen / Beleggen = 21% / 79%";
  document.querySelector("#old-tier-2-explanation").textContent =
    `(21% × ${formatCalculationRate(data.savingsRate)}) + (79% × ${formatCalculationRate(data.investmentRate)}) = ${formatOldYieldRate(oldTierRates[1])}`;
  document.querySelector("#old-tier-2-calculation").textContent =
    oldTierCalculations[1];
  document.querySelector("#old-tier-3-range").textContent =
    `${formatCalculationEuroWhole(data.tier2)} en hoger`;
  document.querySelector("#old-tier-3-allocation").textContent =
    "Sparen / Beleggen = 0% / 100%";
  document.querySelector("#old-tier-3-explanation").textContent =
    `(100% × ${formatCalculationRate(data.investmentRate)}) = ${formatOldYieldRate(oldTierRates[2])}`;
  document.querySelector("#old-tier-3-calculation").textContent =
    oldTierCalculations[2];
}
