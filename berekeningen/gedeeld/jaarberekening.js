"use strict";

// Volledige forfaitaire box 3-berekening van één belastingjaar, zonder DOM.
// Wordt gebruikt door het dashboard (onderdeel B) en door de snelcontrole, zodat
// beide altijd dezelfde uitkomst geven. Vereist jaargegevens.js,
// oude-methode/berekening.js, rechtsherstel/berekening.js,
// overbruggingswet/berekening.js, forfaitair-rendement.js en de afrondings- en
// opmaakfuncties uit dashboard-berekeningen.js.

function calculateBox3Year({
  year, bankTotal, otherAssetsTotal, cashTotal = 0, debts,
  fiscalPartner = false, allocationPercent = 100,
}) {
  const data = BOX3_YEAR_DATA[year];
  if (!data) throw new Error(`Voor ${year} zijn geen jaargegevens beschikbaar.`);
  if (
    fiscalPartner &&
    (!Number.isInteger(allocationPercent) || allocationPercent < 0 || allocationPercent > 100)
  ) {
    throw new Error("Vul voor de verdeling een heel percentage van 0 tot en met 100 in.");
  }
  const yearUsesOldMethodComparison = Number(year) <= 2022;
  const householdCount = fiscalPartner ? 2 : 1;
  const { bank, investments, cashInBank } = splitAssetCategories({
    bankTotal, otherAssetsTotal, cashTotal, year,
  });

  const assets = roundToTwoDecimals(bank + investments);
  const debtThreshold = data.debtThreshold * householdCount;
  const deductibleDebts = roundToTwoDecimals(Math.max(0, debts - debtThreshold));
  const netAssets = roundToTwoDecimals(Math.max(0, assets - deductibleDebts));
  const exemption = roundToTwoDecimals(data.exemption * householdCount);
  const taxableBase = roundToTwoDecimals(Math.max(0, netAssets - exemption));
  const firstPartnerBase = fiscalPartner
    ? roundToTwoDecimals(taxableBase * allocationPercent / 100)
    : taxableBase;
  const secondPartnerBase = taxableBase - firstPartnerBase;

  const old = calculateOldMethod({
    firstPartnerBase, secondPartnerBase, fiscalPartner, yearUsesOldMethodComparison, data,
  });
  const relief = calculateForfaitaryReturn({
    bank, investments, deductibleDebts, data, year, netAssets,
    firstPartnerBase, secondPartnerBase, fiscalPartner,
  });

  // Voor 2017-2022 geldt de laagste uitkomst van de oude methode en de Wet
  // rechtsherstel (artikel 1 Wet rechtsherstel box 3).
  const oldMethodApplies = yearUsesOldMethodComparison && old.oldTax < relief.reliefTax;
  const forfaitaryIncomes = oldMethodApplies
    ? [old.oldFirstPartnerIncome, old.oldSecondPartnerIncome]
    : [relief.firstPartnerIncome, relief.secondPartnerIncome];
  const forfaitaryMethod = oldMethodApplies
    ? "oude methode"
    : yearUsesOldMethodComparison ? "Wet rechtsherstel" : "Overbruggingswet";

  return {
    year, data, fiscalPartner, allocationPercent, householdCount, yearUsesOldMethodComparison,
    bank, investments, cashInBank, debts, assets, debtThreshold, deductibleDebts,
    netAssets, exemption, taxableBase, firstPartnerBase, secondPartnerBase,
    old, relief, oldMethodApplies, forfaitaryIncomes, forfaitaryMethod,
    forfaitaryTax: oldMethodApplies ? old.oldTax : relief.reliefTax,
  };
}
