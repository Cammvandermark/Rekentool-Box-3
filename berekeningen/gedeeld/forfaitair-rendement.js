"use strict";

function calculateForfaitaryReturn({
  bank, investments, deductibleDebts, data, year, netAssets,
  firstPartnerBase, secondPartnerBase, fiscalPartner,
}) {
  const roundedReliefSavingsReturn = roundToTwoDecimals(bank * data.reliefSavingsRate / 100);
  const roundedReliefInvestmentReturn = roundToTwoDecimals(investments * data.reliefInvestmentRate / 100);
  const roundedReliefDebtReturn = roundToTwoDecimals(deductibleDebts * data.reliefDebtRate / 100);
  const reliefTotalReturn = roundToTwoDecimals(
    roundedReliefSavingsReturn + roundedReliefInvestmentReturn - roundedReliefDebtReturn,
  );
  const usesTaxableBaseShare = Number(year) >= 2022;
  const inputs = {
    reliefTotalReturn, netAssets, firstPartnerBase, secondPartnerBase, fiscalPartner, data,
  };
  const result = usesTaxableBaseShare
    ? calculateTaxableShareReturn(inputs)
    : calculateRecoveryReturn(inputs);
  const reliefTax = roundToTwoDecimals(
    roundToTwoDecimals(result.firstPartnerIncome * data.taxRate / 100) +
    roundToTwoDecimals(result.secondPartnerIncome * data.taxRate / 100),
  );

  return {
    roundedReliefSavingsReturn, roundedReliefInvestmentReturn, roundedReliefDebtReturn,
    reliefTotalReturn, usesTaxableBaseShare, ...result, reliefTax,
  };
}
