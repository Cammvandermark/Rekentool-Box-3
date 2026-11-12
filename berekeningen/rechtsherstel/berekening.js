"use strict";

function calculateRecoveryReturn({ reliefTotalReturn, netAssets, firstPartnerBase, secondPartnerBase, fiscalPartner }) {
  const reliefYieldRate = netAssets > 0 ? reliefTotalReturn / netAssets : 0;
  const appliedYieldRate = roundToTwoDecimals(reliefYieldRate * 100) / 100;
  const formattedYieldRate = formatCalculationRate(reliefYieldRate * 100);
  const yieldRateExplanation = netAssets > 0
    ? `${formatCalculationEuro(reliefTotalReturn)} / ${formatCalculationEuro(netAssets)} × 100% = ${formattedYieldRate}`
    : `Geen rendementsgrondslag; rendementspercentage ${formattedYieldRate}`;
  const firstPartnerIncome = roundToTwoDecimals(Math.max(0, appliedYieldRate * firstPartnerBase));
  const secondPartnerIncome = fiscalPartner
    ? roundToTwoDecimals(Math.max(0, appliedYieldRate * secondPartnerBase))
    : 0;
  const reliefIncome = roundToTwoDecimals(firstPartnerIncome + secondPartnerIncome);
  const reliefIncomeCalculation = netAssets > 0
    ? fiscalPartner
      ? `(${formattedYieldRate} × ${formatCalculationEuro(firstPartnerBase)}) + (${formattedYieldRate} × ${formatCalculationEuro(secondPartnerBase)}) = ${formatCalculationEuro(reliefIncome)}`
      : `(${formattedYieldRate} × ${formatCalculationEuro(firstPartnerBase)}) = ${formatCalculationEuro(reliefIncome)}`
    : `Geen rendementsgrondslag = ${formatCalculationEuro(reliefIncome)}`;

  return {
    formattedYieldRate, yieldRateExplanation, firstPartnerIncome,
    secondPartnerIncome, reliefIncome, reliefIncomeCalculation,
  };
}
