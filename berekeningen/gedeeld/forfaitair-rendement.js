"use strict";

// Contant geld valt onder de Wet rechtsherstel box 3 (2017-2022) in de categorie
// overige bezittingen. Onder de Overbruggingswet box 3 (vanaf 2023) telt het als
// banktegoed (art. 5.2, derde lid, onderdeel c, Wet IB 2001).
function cashCountsAsBankBalance(year) {
  return Number(year) >= 2023;
}

function splitAssetCategories({ bankTotal, otherAssetsTotal, cashTotal, year }) {
  if (!cashCountsAsBankBalance(year)) {
    return { bank: bankTotal, investments: otherAssetsTotal, cashInBank: 0 };
  }
  return {
    bank: roundToTwoDecimals(bankTotal + cashTotal),
    investments: roundToTwoDecimals(otherAssetsTotal - cashTotal),
    cashInBank: cashTotal,
  };
}

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
