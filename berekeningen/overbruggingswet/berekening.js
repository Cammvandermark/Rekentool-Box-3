"use strict";

function calculateTaxableShareReturn({
  reliefTotalReturn, netAssets, firstPartnerBase, secondPartnerBase, fiscalPartner, data,
}) {
  const shareDecimals = data.taxableShareDecimals ?? 2;
  const formatPercentage = (value) => new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: shareDecimals,
    maximumFractionDigits: shareDecimals,
  }).format(value);
  const firstPartnerShare = netAssets > 0
    ? roundToDecimals(firstPartnerBase / netAssets * 100, shareDecimals)
    : 0;
  const secondPartnerShare = netAssets > 0
    ? roundToDecimals(secondPartnerBase / netAssets * 100, shareDecimals)
    : 0;
  const formattedYieldRate = fiscalPartner
    ? `${formatPercentage(firstPartnerShare)}% / ${formatPercentage(secondPartnerShare)}%`
    : `${formatPercentage(firstPartnerShare)}%`;
  const firstPartnerShareCalculation = `${formatCalculationEuro(firstPartnerBase)} / ${formatCalculationEuro(netAssets)} × 100 = ${formatPercentage(firstPartnerShare)}%`;
  const secondPartnerShareCalculation = `${formatCalculationEuro(secondPartnerBase)} / ${formatCalculationEuro(netAssets)} × 100 = ${formatPercentage(secondPartnerShare)}%`;
  const yieldRateExplanation = netAssets > 0
    ? fiscalPartner
      ? `${firstPartnerShareCalculation}\n${secondPartnerShareCalculation}`
      : firstPartnerShareCalculation
    : "Geen rendementsgrondslag; aandeel 0%";
  const firstPartnerIncome = roundToTwoDecimals(Math.max(0, reliefTotalReturn * firstPartnerShare / 100));
  const secondPartnerIncome = fiscalPartner
    ? roundToTwoDecimals(Math.max(0, reliefTotalReturn * secondPartnerShare / 100))
    : 0;
  const reliefIncome = roundToTwoDecimals(firstPartnerIncome + secondPartnerIncome);
  const reliefIncomeCalculation = netAssets > 0
    ? fiscalPartner
      ? `(${formatCalculationEuro(reliefTotalReturn)} × ${formatPercentage(firstPartnerShare)}%) + (${formatCalculationEuro(reliefTotalReturn)} × ${formatPercentage(secondPartnerShare)}%) = ${formatCalculationEuro(reliefIncome)}`
      : `(${formatCalculationEuro(reliefTotalReturn)} × ${formatPercentage(firstPartnerShare)}%) = ${formatCalculationEuro(reliefIncome)}`
    : `Geen rendementsgrondslag = ${formatCalculationEuro(reliefIncome)}`;

  return {
    formattedYieldRate, yieldRateExplanation, firstPartnerIncome,
    secondPartnerIncome, reliefIncome, reliefIncomeCalculation,
  };
}
