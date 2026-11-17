"use strict";

function calculateTaxableShareReturn({
  reliefTotalReturn, netAssets, firstPartnerBase, secondPartnerBase, fiscalPartner, data,
}) {
  const shareDecimals = data.taxableShareDecimals ?? 2;
  // Het aandeel wordt naar beneden afgerond (afgekapt): in het voordeel van de
  // belastingplichtige en zoals in de rekenvoorbeelden van de Belastingdienst
  // voor 2023-2026. Ingesteld per jaar in jaargegevens (2022-2026).
  const roundShare = (value) => data.taxableShareRoundDown
    ? Math.floor(value * 10 ** shareDecimals + 1e-9) / 10 ** shareDecimals
    : roundToDecimals(value, shareDecimals);
  const formatPercentage = (value) => new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: shareDecimals,
    maximumFractionDigits: shareDecimals,
  }).format(value);
  const firstPartnerShare = netAssets > 0
    ? roundShare(firstPartnerBase / netAssets * 100)
    : 0;
  const secondPartnerShare = netAssets > 0
    ? roundShare(secondPartnerBase / netAssets * 100)
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
