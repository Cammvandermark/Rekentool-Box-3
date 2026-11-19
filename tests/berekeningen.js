"use strict";

const expectedTaxes = {
  2017: [16574.87, 1180.08],
  2018: [15575.31, 712.20],
  2019: [15955.99, 569.63],
  2020: [14963.69, 427.05],
  2021: [16683.17, 361.83],
  2022: [16125.55, 309.60], // aandeel naar beneden afgerond
  2023: [0, 3723.96], // aandeel naar beneden afgerond (95,31%)
  2024: [0, 6323.53],
  2025: [0, 6020.79],
  2026: [0, 5650.33], // aandeel naar beneden afgerond
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

const cashRecovery = splitAssetCategories({
  bankTotal: 10000, otherAssetsTotal: 5000, cashTotal: 2000, year: "2022",
});
assertEqual("2022 contant geld: banktegoeden", cashRecovery.bank, 10000);
assertEqual("2022 contant geld: overige bezittingen", cashRecovery.investments, 5000);
const cashBridging = splitAssetCategories({
  bankTotal: 10000, otherAssetsTotal: 5000, cashTotal: 2000, year: "2023",
});
assertEqual("2023 contant geld: banktegoeden", cashBridging.bank, 12000);
assertEqual("2023 contant geld: overige bezittingen", cashBridging.investments, 3000);
assertEqual("2023 contant geld: aandeel bank", cashBridging.cashInBank, 2000);

// Werkelijk rendement (tegenbewijsregeling). Voorbeelden van de Belastingdienst:
// https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/rekenvoorbeelden-berekening-werkelijk-rendement
function actual(year, items, fiscalPartner = false) {
  return calculateActualReturn({ year, items, fiscalPartner, data: BOX3_YEAR_DATA[year] });
}
const data2025 = BOX3_YEAR_DATA[2025];

const savingsAndShares = actual("2025", [
  { category: "bank", name: "Spaarrekening", startValue: 100000, interest: 1200 },
  { category: "asset", name: "Aandelen", startValue: 150000, endValue: 160000, deposits: 1200, withdrawals: 3000, income: 500 },
]);
assertEqual("WR spaargeld en aandelen: beleggingen", savingsAndShares.categories.asset, 12300);
assertEqual("WR spaargeld en aandelen: totaal", savingsAndShares.total, 13500);

const crypto = actual("2025", [
  { category: "asset", name: "Crypto", startValue: 80000, endValue: 90000, deposits: 5000, withdrawals: 17000 },
]);
assertEqual("WR crypto", crypto.total, 22000);

const withDebt = actual("2025", [
  { category: "bank", name: "Spaarrekening", startValue: 100000, interest: 2000 },
  { category: "asset", name: "Beleggingen", startValue: 150000, endValue: 160000, deposits: 1200, withdrawals: 3000, income: 700 },
  { category: "debt", name: "Lening", interestPaid: 1500 },
], true);
assertEqual("WR met schuld: totaal", withDebt.total, 13000);
const withDebtShares = allocateActualReturn({ total: withDebt.total, fiscalPartner: true, allocationPercent: 100 });
assertEqual("WR met schuld: toerekening belastingplichtige", withDebtShares[0], 13000);
assertEqual("WR met schuld: toerekening partner", withDebtShares[1], 0);

const rentedHome = actual("2025", [
  { category: "bank", name: "Spaarrekening", startValue: 150000, interest: 2000 },
  { category: "asset", name: "Beleggingen", startValue: 75000, endValue: 77000 },
  { category: "home", name: "Verhuurde 2e woning", wozCurrent: 200000, wozNext: 205000, rent: (1500 - 200) * 12 },
], true);
assertEqual("WR verhuurde woning: woning", rentedHome.categories.home, 20600);
assertEqual("WR verhuurde woning: totaal", rentedHome.total, 24600);
const rentedShares = allocateActualReturn({ total: rentedHome.total, fiscalPartner: true, allocationPercent: 50 });
assertEqual("WR verhuurde woning: per persoon", rentedShares[0], 12300);
assertEqual("WR verhuurde woning: partner", rentedShares[1], 12300);

const ownHome = actual("2025", [
  { category: "bank", name: "Spaarrekening", startValue: 150000, interest: 2000 },
  { category: "asset", name: "Beleggingen", startValue: 75000, endValue: 77000 },
  { category: "home", name: "2e woning eigen gebruik", wozCurrent: 200000, wozNext: 205000 },
  { category: "debt", name: "Hypotheek 2e woning", interestPaid: 5000 },
], true);
assertEqual("WR eigen 2e woning met schuld: totaal", ownHome.total, 4000);

const negative = actual("2025", [
  { category: "bank", name: "Spaarrekening", interest: 800 },
  { category: "asset", name: "Crypto", startValue: 10000, endValue: 8800 },
]);
assertEqual("WR nulgrens: vóór nulgrens", negative.totalBeforeFloor, -400);
assertEqual("WR nulgrens: totaal", negative.total, 0);

const euroCash = actual("2024", [
  { category: "cash", name: "Contant geld", startValue: 5000, currencyResult: 999 },
]);
assertEqual("WR contant geld in euro's", euroCash.total, 0);
const foreignCash = actual("2024", [
  { category: "cash", name: "Dollars", startValue: 2000, foreignCurrency: true, currencyResult: 100 },
]);
assertEqual("WR contant geld vreemde valuta: vrijgesteld deel", foreignCash.cashExempt, 32.65);
assertEqual("WR contant geld vreemde valuta: totaal", foreignCash.total, 67.35);

const green = actual("2024", [
  { category: "bank", name: "Groen sparen", startValue: 100000, interest: 1000, green: true },
]);
assertEqual("WR groene beleggingen: vrijgesteld deel", green.greenExempt, 712.51);
assertEqual("WR groene beleggingen: totaal", green.total, 287.49);
const greenBelowExemption = actual("2024", [
  { category: "bank", name: "Groen sparen", startValue: 50000, interest: 500, green: true },
]);
assertEqual("WR groene beleggingen onder vrijstelling", greenBelowExemption.total, 0);

const soldHome = actual("2025", [
  { category: "home", name: "Verkochte woning", wozCurrent: 200000, wozNext: 210000, disposedDate: "2025-07-02" },
]);
assertEqual("WR woning verkocht op 2 juli", soldHome.total, 4986.30);
const improvedHome = actual("2025", [
  { category: "home", name: "Verbouwde woning", wozCurrent: 200000, wozNext: 230000, improvement: 25000 },
]);
assertEqual("WR woning met gemelde investering", improvedHome.total, 5000);

const ownUse2025 = actual("2025", [
  { category: "home", name: "Vakantiewoning", wozCurrent: 200000, wozNext: 200000, ownUseBenefit: 6000 },
]);
assertEqual("WR eigen gebruik telt niet in 2025", ownUse2025.total, 0);
assertEqual("WR eigen gebruik 2025: melding", ownUse2025.notes.length, 1);
const ownUse2026 = actual("2026", [
  { category: "home", name: "Vakantiewoning", wozCurrent: 200000, wozNext: 200000, ownUseBenefit: 6000 },
]);
assertEqual("WR eigen gebruik telt vanaf 2026", ownUse2026.total, 6000);

let invalidMessage = "";
try {
  actual("2025", [{ category: "asset", name: "Fout", startValue: 1000, endValue: -5 }]);
} catch (error) {
  invalidMessage = error.message;
}
assertEqual("WR negatieve eindwaarde wordt geweigerd", invalidMessage, "Fout: waarde 31 december mag niet negatief zijn.");

// Fictief rendement Belastingdienst-voorbeeld 2025: € 150.000 spaargeld → circa € 1.264.
const savingsOnly = calculateForfaitaryReturn({
  bank: 150000, investments: 0, deductibleDebts: 0, data: data2025, year: "2025",
  netAssets: 150000, firstPartnerBase: 150000 - data2025.exemption, secondPartnerBase: 0, fiscalPartner: false,
});
assertEqual("WR vergelijking: fictief rendement 2025", Math.floor(savingsOnly.reliefIncome), 1264);
const lowerActual = compareActualReturn({
  actualShares: [1050], forfaitaryIncomes: [savingsOnly.reliefIncome], fiscalPartner: false, taxRate: 36,
});
assertEqual("WR vergelijking: werkelijk lager wordt toegepast", lowerActual.persons[0].applied, 1050);
assertEqual("WR vergelijking: belasting na tegenbewijs", lowerActual.appliedTax, 378);
const higherActual = compareActualReturn({
  actualShares: [1875], forfaitaryIncomes: [savingsOnly.reliefIncome], fiscalPartner: false, taxRate: 36,
});
assertEqual("WR vergelijking: werkelijk hoger levert niets op", higherActual.anyActual, false);
assertEqual("WR vergelijking: geen vermindering", higherActual.reduction, 0);
const partnerComparison = compareActualReturn({
  actualShares: [1250, 1250], forfaitaryIncomes: [1606, 1606], fiscalPartner: true, taxRate: 36,
});
assertEqual("WR vergelijking partners: vermindering", partnerComparison.reduction, 256.32);
const mixedComparison = compareActualReturn({
  actualShares: [3000, 0], forfaitaryIncomes: [2799, 2799], fiscalPartner: true, taxRate: 36,
});
assertEqual("WR vergelijking per persoon: belastingplichtige forfaitair", mixedComparison.persons[0].usesActual, false);
assertEqual("WR vergelijking per persoon: partner werkelijk", mixedComparison.persons[1].usesActual, true);

// Rekenvoorbeelden AFAS (Opgaaf werkelijk rendement):
// https://help.afas.nl/help/NL/SE/Tax_IB_Proces_Box3OWR.htm
const bitcoin = actual("2022", [
  { category: "asset", assetType: "crypto", name: "Bitcoin", startValue: 160000, endValue: 100000, deposits: 30000, withdrawals: 37500 },
]);
assertEqual("AFAS bitcoin: vóór nulgrens", bitcoin.totalBeforeFloor, -52500);
assertEqual("AFAS bitcoin: na nulgrens", bitcoin.total, 0);

const periodicFixed = actual("2019", [
  { category: "asset", assetType: "periodic-rights", name: "Uitkering 5 jaar", startValue: 42000, endValue: 33600, withdrawals: 10500 },
]);
assertEqual("AFAS periodieke uitkering bepaalde tijd", periodicFixed.total, 10500);
const periodicLife = actual("2024", [
  { category: "asset", assetType: "periodic-rights", name: "Levenslange uitkering", startValue: 110000, endValue: 90000, withdrawals: 750 },
]);
assertEqual("AFAS periodieke uitkering levenslang", periodicLife.total, 750);
const periodicIncrease = actual("2024", [
  { category: "asset", assetType: "periodic-rights", name: "Uitkering", startValue: 1000, endValue: 1200, withdrawals: 100 },
]);
assertEqual("Periodieke uitkering met waardestijging", periodicIncrease.total, 300);

// AFAS rondt af op hele euro's in het voordeel van de cliënt (€ 3.482); de tool rekent in centen.
const insurance = actual("2024", [
  { category: "asset", assetType: "capital-insurance", name: "Polis 1995", startValue: 76560, nonExemptPercent: 38.28, endValue: 208500, deposits: 1400, withdrawals: 2000 },
]);
assertEqual("AFAS kapitaalverzekering niet-vrijgesteld deel", insurance.total, 3483.48);
let insuranceError = "";
try {
  actual("2024", [{ category: "asset", assetType: "capital-insurance", name: "Polis", startValue: 1, nonExemptPercent: 120 }]);
} catch (error) {
  insuranceError = error.message;
}
assertEqual("Kapitaalverzekering: percentage boven 100% geweigerd", insuranceError, "Polis: het niet-vrijgestelde percentage moet tussen 0 en 100% liggen.");

const afasAllocation = allocateActualReturn({ total: 75000, fiscalPartner: true, allocationPercent: 150000 / 400000 * 100 });
assertEqual("AFAS toerekening belastingplichtige", afasAllocation[0], 28125);
assertEqual("AFAS toerekening partner", afasAllocation[1], 46875);

// AFAS: koerswinst € 488 op contant geld, 2024 zonder partner (vrijstelling € 653).
const afasCash = actual("2024", [
  { category: "cash", name: "Vreemde valuta", startValue: 9000, foreignCurrency: true, currencyResult: 488 },
]);
assertEqual("AFAS contant geld vreemde valuta", afasCash.total, 452.59);

const boughtHome = actual("2025", [
  { category: "home", name: "Gekocht op 1 april", wozCurrent: 200000, wozNext: 210000, acquiredDate: "2025-04-01" },
]);
assertEqual("Woning gekocht op 1 april 2025", boughtHome.total, 7534.25);
const leapYearHome = actual("2024", [
  { category: "home", name: "Verkocht in schrikkeljaar", wozCurrent: 200000, wozNext: 210000, disposedDate: "2024-07-02" },
]);
assertEqual("Woning verkocht 2 juli 2024 (366 dagen)", leapYearHome.total, 5000);
let dateError = "";
try {
  actual("2025", [{ category: "home", name: "Woning", wozCurrent: 1, wozNext: 1, disposedDate: "2024-12-31" }]);
} catch (error) {
  dateError = error.message;
}
assertEqual("Verkoopdatum buiten het belastingjaar geweigerd", dateError, "Datum 2024-12-31 valt niet in 2025.");

const forgiven = actual("2025", [
  { category: "debt", name: "Kwijtgescholden lening", interestPaid: 200, currencyResult: 5000 },
]);
assertEqual("Kwijtschelding schuld telt als rendement", forgiven.total, 4800);

// Jaargegevens: elk jaar heeft vrijstellingsbedragen voor het werkelijke rendement.
for (const year of Object.keys(BOX3_YEAR_DATA)) {
  const yearData = BOX3_YEAR_DATA[year];
  assertEqual(`${year} vrijstelling contant geld aanwezig`, yearData.cashExemption > 0, true);
  assertEqual(`${year} vrijstelling groene beleggingen aanwezig`, yearData.greenExemption > 0, true);
}
assertEqual("2025 groene vrijstelling verlaagd", BOX3_YEAR_DATA[2025].greenExemption, 26312);
assertEqual("2024 contant geld vrijstelling", BOX3_YEAR_DATA[2024].cashExemption, 653);
const greenPartners2025 = actual("2025", [
  { category: "bank", name: "Groen sparen", startValue: 100000, interest: 1000, green: true },
], true);
assertEqual("2025 groene vrijstelling partners (2 × € 26.312)", greenPartners2025.greenExempt, 526.24);

// Alle 10 rekenvoorbeelden van de Belastingdienst (belastingjaar 2025), van invoer
// tot conclusie. De Belastingdienst noemt bedragen in hele euro's (naar beneden).
// https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/rekenvoorbeelden-berekening-werkelijk-rendement
function forfaitary2025({ bank, investments, debts = 0, partner, allocation }) {
  const count = partner ? 2 : 1;
  const deductibleDebts = Math.max(0, debts - data2025.debtThreshold * count);
  const netAssets = Math.max(0, bank + investments - deductibleDebts);
  const base = Math.max(0, netAssets - data2025.exemption * count);
  const firstPartnerBase = partner ? roundToTwoDecimals(base * allocation / 100) : base;
  const forfait = calculateForfaitaryReturn({
    bank, investments, deductibleDebts, data: data2025, year: "2025", netAssets,
    firstPartnerBase, secondPartnerBase: base - firstPartnerBase, fiscalPartner: partner,
  });
  return [forfait.firstPartnerIncome, forfait.secondPartnerIncome];
}
const bdExamples = [
  { nr: 1, partner: false, allocation: 100, bank: 150000, investments: 0,
    items: [{ category: "bank", startValue: 150000, interest: 1875 }], actual: [1875], fictitious: [1264], worthIt: false },
  { nr: 2, partner: false, allocation: 100, bank: 150000, investments: 0,
    items: [{ category: "bank", startValue: 150000, interest: 1050 }], actual: [1050], fictitious: [1264], worthIt: true },
  { nr: 3, partner: false, allocation: 100, bank: 100000, investments: 150000,
    items: [{ category: "bank", startValue: 100000, interest: 1200 }, { category: "asset", startValue: 150000, endValue: 160000, deposits: 1200, withdrawals: 3000, income: 500 }],
    actual: [13500], fictitious: [7838], worthIt: false },
  { nr: 4, partner: false, allocation: 100, bank: 0, investments: 80000,
    items: [{ category: "asset", assetType: "crypto", startValue: 80000, endValue: 90000, deposits: 5000, withdrawals: 17000 }],
    actual: [22000], fictitious: null, worthIt: false },
  { nr: 5, partner: true, allocation: 50, bank: 350000, investments: 0,
    items: [{ category: "bank", startValue: 350000, interest: 3500 }], actual: [1750, 1750], fictitious: [1606, 1606], worthIt: false },
  { nr: 6, partner: true, allocation: 50, bank: 350000, investments: 0,
    items: [{ category: "bank", startValue: 350000, interest: 2500 }], actual: [1250, 1250], fictitious: [1606, 1606], worthIt: true },
  { nr: 7, partner: true, allocation: 100, bank: 100000, investments: 150000,
    items: [{ category: "bank", startValue: 100000, interest: 2000 }, { category: "asset", startValue: 150000, endValue: 151000 }],
    actual: [3000, 0], fictitious: null, worthIt: true },
  { nr: 8, partner: true, allocation: 100, bank: 100000, investments: 150000, debts: 50000,
    items: [{ category: "bank", startValue: 100000, interest: 2000 }, { category: "asset", startValue: 150000, endValue: 160000, deposits: 1200, withdrawals: 3000, income: 700 }, { category: "debt", interestPaid: 1500 }],
    actual: [13000, 0], fictitious: null, worthIt: false },
  { nr: 9, partner: true, allocation: 50, bank: 150000, investments: 275000,
    items: [{ category: "bank", startValue: 150000, interest: 2000 }, { category: "asset", startValue: 75000, endValue: 77000 }, { category: "home", wozCurrent: 200000, wozNext: 205000, rent: 15600 }],
    actual: [12300, 12300], fictitious: null, worthIt: false },
  { nr: 10, partner: true, allocation: 50, bank: 150000, investments: 275000, debts: 100000,
    items: [{ category: "bank", startValue: 150000, interest: 2000 }, { category: "asset", startValue: 75000, endValue: 77000 }, { category: "home", wozCurrent: 200000, wozNext: 205000 }, { category: "debt", interestPaid: 5000 }],
    actual: [2000, 2000], fictitious: null, worthIt: true },
];
for (const example of bdExamples) {
  const label = `BD-voorbeeld ${example.nr}`;
  const actualResult = actual("2025", example.items.map((item, index) => ({ name: `regel ${index + 1}`, ...item })), example.partner);
  const shares = allocateActualReturn({ total: actualResult.total, fiscalPartner: example.partner, allocationPercent: example.allocation });
  const fictitious = forfaitary2025({ ...example });
  example.actual.forEach((expected, index) => assertEqual(`${label}: werkelijk rendement persoon ${index + 1}`, shares[index], expected));
  if (example.fictitious) {
    example.fictitious.forEach((expected, index) =>
      assertEqual(`${label}: fictief rendement persoon ${index + 1} (hele euro's)`, Math.floor(fictitious[index]), expected));
  }
  const comparison = compareActualReturn({ actualShares: shares, forfaitaryIncomes: fictitious, fiscalPartner: example.partner, taxRate: data2025.taxRate });
  assertEqual(`${label}: doorgeven heeft zin`, comparison.anyActual, example.worthIt);
}

// Afronding aandeel in de rendementsgrondslag: naar beneden, zoals in de
// rekenvoorbeelden van de Belastingdienst (2024: 82,658%; 2025: 32,65%).
const share2024 = calculateTaxableShareReturn({
  reliefTotalReturn: 1000, netAssets: 328700, firstPartnerBase: 271700, secondPartnerBase: 0, fiscalPartner: false, data: BOX3_YEAR_DATA[2024],
});
assertEqual("2024 aandeel naar beneden (82,658%)", share2024.formattedYieldRate, "82,658%");
const share2025 = calculateTaxableShareReturn({
  reliefTotalReturn: 1000, netAssets: 332600, firstPartnerBase: 108616, secondPartnerBase: 0, fiscalPartner: false, data: data2025,
});
assertEqual("2025 aandeel naar beneden (32,65%)", share2025.formattedYieldRate, "32,65%");
const share2026 = calculateTaxableShareReturn({
  reliefTotalReturn: 1000, netAssets: 150000, firstPartnerBase: 90643, secondPartnerBase: 0, fiscalPartner: false, data: BOX3_YEAR_DATA[2026],
});
assertEqual("2026 aandeel naar beneden (60,42%)", share2026.formattedYieldRate, "60,42%");

// Box 3-belasting in één oogopslag (hele euro's zoals op de aanslag).
// Voorbeeld 2022: banktegoeden € 52.500, woning € 340.000, geen partner.
const data2022 = BOX3_YEAR_DATA[2022];
const arnhemBase = 392500 - data2022.exemption;
const arnhemOld = calculateOldMethod({ firstPartnerBase: arnhemBase, secondPartnerBase: 0, fiscalPartner: false, yearUsesOldMethodComparison: true, data: data2022 });
const arnhemRelief = calculateForfaitaryReturn({ bank: 52500, investments: 340000, deductibleDebts: 0, data: data2022, year: "2022", netAssets: 392500, firstPartnerBase: arnhemBase, secondPartnerBase: 0, fiscalPartner: false });
assertEqual("Arnhem 2022: oude methode voordeel", arnhemOld.oldIncome, 13634.61);
assertEqual("Arnhem 2022: Wet rechtsherstel voordeel", arnhemRelief.reliefIncome, 16374.66);
assertEqual("Arnhem 2022: Wet rechtsherstel belasting", arnhemRelief.reliefTax, 5076.14);
const arnhemComparison = compareActualReturn({ actualShares: [34750], forfaitaryIncomes: [arnhemOld.oldIncome], fiscalPartner: false, taxRate: data2022.taxRate });
const arnhemTax = buildTaxOverview({ persons: arnhemComparison.persons, taxRate: data2022.taxRate, assessedTaxes: [5076] });
assertEqual("Arnhem 2022: forfaitaire belasting (aanslag)", arnhemTax.rows[0].forfaitaryTax, 4226);
assertEqual("Arnhem 2022: belasting bij werkelijk rendement", arnhemTax.rows[0].actualTax, 10772);
assertEqual("Arnhem 2022: te betalen", arnhemTax.rows[0].appliedTax, 4226);
assertEqual("Arnhem 2022: aanslag € 5.076 is € 850 te hoog", arnhemTax.rows[0].differenceWithAssessment, 850);
assertEqual("Arnhem 2022: controle aanslag tegen tool", arnhemTax.rows[0].assessmentCheck, 850);

const lowerTax = buildTaxOverview({
  persons: compareActualReturn({ actualShares: [600, 400], forfaitaryIncomes: [3144.68, 1496.50], fiscalPartner: true, taxRate: 30 }).persons,
  taxRate: 30, assessedTaxes: [943, 448],
});
assertEqual("Overzicht partners: forfaitair totaal", lowerTax.total.forfaitaryTax, 1391);
assertEqual("Overzicht partners: na tegenbewijs totaal", lowerTax.total.appliedTax, 300);
assertEqual("Overzicht partners: aanslag klopt met tool", lowerTax.total.assessmentCheck, 0);
assertEqual("Overzicht partners: vermindering t.o.v. aanslag", lowerTax.total.differenceWithAssessment, 1091);
const noAssessment = buildTaxOverview({ persons: lowerTax.rows.length ? compareActualReturn({ actualShares: [600], forfaitaryIncomes: [3144.68], fiscalPartner: false, taxRate: 30 }).persons : [], taxRate: 30 });
assertEqual("Overzicht zonder aanslag: geen verschil", noAssessment.rows[0].differenceWithAssessment, null);
assertEqual("BD 2025 voorbeeld: belasting € 455 op € 1.264", wholeEuroBox3Tax(1264.65, 36), 455);
assertEqual("BD 2025 voorbeeld: belasting € 4.638 op € 12.885", wholeEuroBox3Tax(12885.78, 36), 4638);

// --- Rekenvoorbeelden Belastingdienst: berekening box 3-inkomen 2025 ---
// https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2025
// Belasting, grondslag en aandeel moeten exact gelijk zijn. Het voordeel mag € 1
// verschillen: de Belastingdienst rondt in de voorbeelden het rendement per
// onderdeel af op hele euro's (vb. 3: € 15.628 i.p.v. € 15.627,60; vb. 5: € 68 en
// € 20.425 i.p.v. € 68,50 en € 20.425,71), de tool rekent in centen.
const bdForfaitary2025 = [
  { nr: 1, bank: 150000, other: 0, debts: 0, partner: false, allocation: 100, base: 92316, share: "61,54%", income: [1264], tax: [455] },
  { nr: 2, bank: 150000, other: 0, debts: 0, partner: true, allocation: 50, base: 34632, share: "11,54% / 11,54%", income: [237, 237], tax: [85, 85] },
  { nr: 3, bank: 150000, other: 275000, debts: 100000, partner: false, allocation: 100, base: 271116, share: "82,45%", income: [12885], tax: [4638] },
  { nr: 4, bank: 150000, other: 275000, debts: 100000, partner: true, allocation: 50, base: 217232, share: "32,65% / 32,65%", income: [5135, 5135], tax: [1848, 1848] },
  { nr: 5, bank: 5000, other: 347376, debts: 0, partner: true, allocation: 100, base: 237008, share: "67,25% / 0,00%", income: [13781, 0], tax: [4961, 0] },
];
for (const example of bdForfaitary2025) {
  const label = `BD berekening 2025 voorbeeld ${example.nr}`;
  const result = calculateBox3Year({
    year: "2025", bankTotal: example.bank, otherAssetsTotal: example.other, debts: example.debts,
    fiscalPartner: example.partner, allocationPercent: example.allocation,
  });
  const incomes = example.partner
    ? [result.relief.firstPartnerIncome, result.relief.secondPartnerIncome]
    : [result.relief.firstPartnerIncome];
  assertEqual(`${label}: grondslag sparen en beleggen`, result.taxableBase, example.base);
  assertEqual(`${label}: aandeel in de rendementsgrondslag`, result.relief.formattedYieldRate, example.share);
  incomes.forEach((income, index) => {
    assertEqual(`${label}: belasting persoon ${index + 1}`, wholeEuroBox3Tax(income, 36), example.tax[index]);
    assertEqual(`${label}: voordeel persoon ${index + 1} binnen € 1`, Math.abs(Math.floor(income) - example.income[index]) <= 1, true);
  });
}

// --- Jaarberekening (calculateBox3Year) ---
// Referentie: de berekening zoals die vóór de herstructurering letterlijk in
// renderCalculation stond. calculateBox3Year moet voor elke invoer exact gelijk zijn.
function referenceYearCalculation({ year, bankTotal, otherAssetsTotal, cashTotal, debts, fiscalPartner, allocationPercent }) {
  const data = BOX3_YEAR_DATA[year];
  const yearUsesOldMethodComparison = Number(year) <= 2022;
  const { bank, investments } = splitAssetCategories({ bankTotal, otherAssetsTotal, cashTotal, year });
  const householdCount = fiscalPartner ? 2 : 1;
  const assets = roundToTwoDecimals(bank + investments);
  const deductibleDebts = roundToTwoDecimals(Math.max(0, debts - data.debtThreshold * householdCount));
  const netAssets = roundToTwoDecimals(Math.max(0, assets - deductibleDebts));
  const taxableBase = roundToTwoDecimals(Math.max(0, netAssets - roundToTwoDecimals(data.exemption * householdCount)));
  const firstPartnerBase = fiscalPartner ? roundToTwoDecimals(taxableBase * allocationPercent / 100) : taxableBase;
  const secondPartnerBase = taxableBase - firstPartnerBase;
  const old = calculateOldMethod({ firstPartnerBase, secondPartnerBase, fiscalPartner, yearUsesOldMethodComparison, data });
  const relief = calculateForfaitaryReturn({ bank, investments, deductibleDebts, data, year, netAssets, firstPartnerBase, secondPartnerBase, fiscalPartner });
  const oldMethodApplies = yearUsesOldMethodComparison && old.oldTax < relief.reliefTax;
  return {
    taxableBase, oldTax: old.oldTax, reliefTax: relief.reliefTax, oldIncome: old.oldIncome, reliefIncome: relief.reliefIncome,
    forfaitaryIncomes: oldMethodApplies ? [old.oldFirstPartnerIncome, old.oldSecondPartnerIncome] : [relief.firstPartnerIncome, relief.secondPartnerIncome],
  };
}
const yearScenarios = [];
const assetMixes = [
  [0, 0, 0, 0], [10000, 0, 0, 0], [60000, 0, 0, 0], [52500, 340000, 0, 0], [1200000, 20000, 0, 6000],
  [150000, 250000, 3000, 80000], [25000, 500000, 0, 2000], [0, 2500000, 0, 400000], [80000, 120000, 40000, 3500],
  [33333.33, 77777.77, 1234.56, 9999.99],
];
for (const year of Object.keys(BOX3_YEAR_DATA)) {
  for (const [bankTotal, otherAssetsTotal, cashTotal, debts] of assetMixes) {
    yearScenarios.push({ year, bankTotal, otherAssetsTotal, cashTotal, debts, fiscalPartner: false, allocationPercent: 100 });
    for (const allocationPercent of [0, 33, 50, 100]) {
      yearScenarios.push({ year, bankTotal, otherAssetsTotal, cashTotal, debts, fiscalPartner: true, allocationPercent });
    }
  }
}
for (const scenario of yearScenarios) {
  const label = `Jaarberekening ${scenario.year} ${JSON.stringify(scenario)}`;
  const expected = referenceYearCalculation(scenario);
  const actualYear = calculateBox3Year(scenario);
  assertEqual(`${label}: grondslag`, actualYear.taxableBase, expected.taxableBase);
  assertEqual(`${label}: oude belasting`, actualYear.old.oldTax, expected.oldTax);
  assertEqual(`${label}: forfaitaire belasting`, actualYear.relief.reliefTax, expected.reliefTax);
  assertEqual(`${label}: voordeel persoon 1`, actualYear.forfaitaryIncomes[0], expected.forfaitaryIncomes[0]);
  assertEqual(`${label}: voordeel persoon 2`, actualYear.forfaitaryIncomes[1], expected.forfaitaryIncomes[1]);
  assertEqual(`${label}: belasting = laagste`, actualYear.forfaitaryTax,
    Number(scenario.year) <= 2022 ? Math.min(expected.oldTax, expected.reliefTax) : expected.reliefTax);
}
// De bekende verwachte bedragen gelden ook via calculateBox3Year.
for (const [year, expected] of Object.entries(expectedTaxes)) {
  const viaYear = calculateBox3Year({ year, bankTotal: 1200000, otherAssetsTotal: 20000, debts: 6000 });
  if (Number(year) <= 2022) assertEqual(`${year} oude belasting via jaarberekening`, viaYear.old.oldTax, expected[0]);
  assertEqual(`${year} forfaitaire belasting via jaarberekening`, viaYear.relief.reliefTax, expected[1]);
}
let yearError = "";
try { calculateBox3Year({ year: "2016", bankTotal: 0, otherAssetsTotal: 0, debts: 0 }); } catch (error) { yearError = error.message; }
assertEqual("Jaarberekening: onbekend jaar geweigerd", yearError, "Voor 2016 zijn geen jaargegevens beschikbaar.");

// --- Snelcontrole: bedragen in Nederlandse en Engelse notatie ---
const amountCases = [
  ["12.345,67", 12345.67], ["12345,67", 12345.67], ["€ 12.345", 12345], ["12,345.67", 12345.67],
  ["12345.67", 12345.67], ["1.234.567", 1234567], ["1,234,567", 1234567], ["1234,5", 1234.5],
  ["1234.5", 1234.5], ["0", 0], ["", null], ["  ", null], ["€ 1.000,00", 1000], ["1.000", 1000],
];
for (const [input, expected] of amountCases) {
  assertEqual(`Bedrag "${input}"`, parseDutchAmount(input), expected);
}
assertEqual("Bedrag negatief toegestaan", parseDutchAmount("-1.200,50", { signed: true }), -1200.5);
for (const invalid of ["abc", "12.34.5", "1,23,4", "12a"]) {
  let message = "";
  try { parseDutchAmount(invalid); } catch (error) { message = error.message; }
  assertEqual(`Bedrag "${invalid}" geweigerd`, message !== "", true);
}
let negativeMessage = "";
try { parseDutchAmount("-5", { label: "Schulden" }); } catch (error) { negativeMessage = error.message; }
assertEqual("Negatieve schuld geweigerd", negativeMessage, "Schulden mag niet negatief zijn.");

// --- Snelcontrole: uitkomsten gelijk aan dashboard en voorbeelden ---
const arnhemQuick = calculateQuickCheckYear({ year: 2022, bank: "52.500", other: "340.000", actualReturn: "34.750", assessedTax: "5.076" });
assertEqual("Snelcontrole Arnhem 2022: forfaitaire belasting", arnhemQuick.forfaitaryTax, 4226);
assertEqual("Snelcontrole Arnhem 2022: methode", arnhemQuick.forfaitaryMethod, "oude methode");
assertEqual("Snelcontrole Arnhem 2022: belasting bij werkelijk rendement", arnhemQuick.actualTax, 10772);
assertEqual("Snelcontrole Arnhem 2022: te betalen", arnhemQuick.appliedTax, 4226);
assertEqual("Snelcontrole Arnhem 2022: verschil met aanslag", arnhemQuick.difference, 850);
assertEqual("Snelcontrole Arnhem 2022: aanslag volgt Wet rechtsherstel herkend", arnhemQuick.signals.some((signal) => /^Aanslag volgt de Wet rechtsherstel \(€\s5\.075\), maar de oude methode is lager \(€\s4\.226\)/.test(signal.text)), true);
const otherDeviation = calculateQuickCheckYear({ year: 2022, bank: "52.500", other: "340.000", assessedTax: "6.000" });
assertEqual("Snelcontrole: onverklaarde afwijking gemeld", otherDeviation.signals.some((signal) => /^Aanslag wijkt €\s1\.774 omhoog/.test(signal.text)), true);
const matchingAssessment = calculateQuickCheckYear({ year: 2022, bank: "52.500", other: "340.000", assessedTax: "4.226" });
assertEqual("Snelcontrole: kloppende aanslag geeft geen signaal", matchingAssessment.signals.some((signal) => signal.text.startsWith("Aanslag")), false);
assertEqual("Snelcontrole: kloppende aanslag verschil nul", matchingAssessment.difference, 0);

const quick2025 = calculateQuickCheckYear({ year: 2025, bank: "100.000", other: "150.000", actualReturn: "13.500", fiscalPartner: true, allocationPercent: "60" });
const dashboard2025 = calculateBox3Year({ year: "2025", bankTotal: 100000, otherAssetsTotal: 150000, debts: 0, fiscalPartner: true, allocationPercent: 60 });
const dashboardComparison2025 = compareActualReturn({
  actualShares: allocateActualReturn({ total: 13500, fiscalPartner: true, allocationPercent: 60 }),
  forfaitaryIncomes: dashboard2025.forfaitaryIncomes, fiscalPartner: true, taxRate: 36,
});
const dashboardOverview2025 = buildTaxOverview({ persons: dashboardComparison2025.persons, taxRate: 36 });
assertEqual("Snelcontrole 2025 partners = dashboard: forfaitair", quick2025.forfaitaryTax, dashboardOverview2025.total.forfaitaryTax);
assertEqual("Snelcontrole 2025 partners = dashboard: te betalen", quick2025.appliedTax, dashboardOverview2025.total.appliedTax);
assertEqual("Snelcontrole 2025: route aangifte gemeld", quick2025.route.label, "Via aangifte, niet via OWR");

const noActual = calculateQuickCheckYear({ year: 2024, bank: "200000" });
assertEqual("Snelcontrole zonder werkelijk rendement: te betalen = forfaitair", noActual.appliedTax, noActual.forfaitaryTax);
assertEqual("Snelcontrole zonder werkelijk rendement: geen belasting bij WR", noActual.actualTax, null);
const negativeActual = calculateQuickCheckYear({ year: 2023, bank: "20.000", other: "200.000", actualReturn: "-15.000" });
assertEqual("Snelcontrole negatief rendement: op nul", negativeActual.actualTotal, 0);
assertEqual("Snelcontrole negatief rendement: geen belasting", negativeActual.appliedTax, 0);
const highReturn = calculateQuickCheckYear({ year: 2023, bank: "100.000", actualReturn: "8.000" });
assertEqual("Snelcontrole: signaal hoog rendement op alleen bank", highReturn.signals.some((signal) => signal.text.startsWith("Alleen banktegoeden")), true);
const belowExemption = calculateQuickCheckYear({ year: 2024, bank: "40.000" });
assertEqual("Snelcontrole onder heffingsvrij vermogen: nihil", belowExemption.forfaitaryTax, 0);

let cashError = "";
try { calculateQuickCheckYear({ year: 2023, other: "1.000", cash: "2.000" }); } catch (error) { cashError = error.message; }
assertEqual("Snelcontrole: contant hoger dan overige geweigerd", cashError.startsWith("Contant geld"), true);
let allocationError = "";
try { calculateQuickCheckYear({ year: 2023, bank: "100000", fiscalPartner: true, allocationPercent: "" }); } catch (error) { allocationError = error.message; }
assertEqual("Snelcontrole: lege partnerverdeling geweigerd", allocationError, "Vul voor de verdeling een heel percentage van 0 tot en met 100 in.");

const multiYear = calculateQuickCheck([
  { year: 2021, bank: "300.000", assessedTax: "" },
  { year: 2022, bank: "52.500", other: "340.000", actualReturn: "34.750", assessedTax: "5.076" },
  { year: 2023 },
  { year: 2024, bank: "abc" },
]);
assertEqual("Snelcontrole meerdere jaren: lege jaren overgeslagen", multiYear.results.length, 3);
assertEqual("Snelcontrole meerdere jaren: fout in één jaar", multiYear.totals.errors, 1);
assertEqual("Snelcontrole meerdere jaren: totaal verschil", multiYear.totals.difference, 850);
assertEqual("Snelcontrole meerdere jaren: totaal te betalen",
  multiYear.totals.appliedTax, multiYear.results[0].result.appliedTax + 4226);

// --- Vergelijking met berekenhet.nl (box 3 t/m 2022), 19 november 2026 ---
// Gecontroleerd tegen https://www.berekenhet.nl/sparen-en-beleggen/belasting-box3-tm-2022.html.
// berekenhet rekent in hele euro's, met naar beneden afgerond rendementspercentage
// en schijfpercentages op 2 decimalen; deze tool rekent in centen, met het
// rendementspercentage op 2 decimalen afgerond en de wettelijke schijfpercentages
// (3 decimalen). Verschillen van enkele euro's zijn daardoor verklaard. De bedragen
// hieronder zijn de uitkomsten van deze tool; ze leggen de vergelijking vast.
// Partners: verdeling 50/50.
const berekenhetCases = [
  // [jaar, partner, bank, overig, schulden, inkomen oud, inkomen rechtsherstel, belasting, methode, berekenhet]
  [2017, false, 100000, 200000, 10000, 11031.25, 9862.40, 2958.72, "Wet rechtsherstel", 2959],
  [2017, true, 120000, 80000, 0, 4306.50, 3465.00, 1039.50, "Wet rechtsherstel", 1035],
  [2017, true, 300000, 900000, 50000, 48282.50, 45677.80, 13703.34, "Wet rechtsherstel", 13703],
  [2018, false, 100000, 200000, 10000, 9742.61, 9573.20, 2871.96, "Wet rechtsherstel", 2864],
  [2018, true, 300000, 900000, 50000, 44143.42, 44936.00, 13243.02, "oude methode", 13241],
  [2019, false, 100000, 200000, 10000, 9873.69, 9905.30, 2962.11, "oude methode", 2962],
  [2019, true, 300000, 900000, 50000, 45072.48, 46667.44, 13521.74, "oude methode", 13523],
  [2020, false, 100000, 200000, 10000, 9231.12, 9310.02, 2769.34, "oude methode", 2770],
  [2020, true, 300000, 900000, 50000, 42316.74, 43999.22, 12695.02, "oude methode", 12697],
  [2021, false, 100000, 200000, 10000, 9644.93, 9314.56, 2887.51, "Wet rechtsherstel", 2880],
  [2021, true, 300000, 900000, 50000, 44945.56, 45847.76, 13933.12, "oude methode", 13933],
  [2022, false, 100000, 200000, 10000, 9299.17, 9020.58, 2796.38, "Wet rechtsherstel", 2796],
  [2022, false, 1500000, 0, 0, 67656.74, 0, 0, "Wet rechtsherstel", 0],
  [2022, true, 300000, 900000, 50000, 43484.54, 44503.14, 13480.20, "oude methode", 13481],
];
for (const [year, fiscalPartner, bankTotal, otherAssetsTotal, debts, oldIncome, reliefIncome, tax, method, berekenhet] of berekenhetCases) {
  const label = `berekenhet ${year} ${fiscalPartner ? "partners" : "alleenstaand"} ${bankTotal}/${otherAssetsTotal}/${debts}`;
  const viaYear = calculateBox3Year({
    year: String(year), bankTotal, otherAssetsTotal, debts,
    fiscalPartner, allocationPercent: fiscalPartner ? 50 : 100,
  });
  assertEqual(`${label}: inkomen oude methode`, viaYear.old.oldIncome, oldIncome);
  assertEqual(`${label}: inkomen rechtsherstel`, viaYear.relief.reliefIncome, reliefIncome);
  assertEqual(`${label}: belasting`, viaYear.forfaitaryTax, tax);
  assertEqual(`${label}: methode`, viaYear.forfaitaryMethod, method);
  // Ruime marge ten opzichte van berekenhet (hele euro's, andere afronding).
  assertEqual(`${label}: binnen € 10 van berekenhet`, Math.abs(viaYear.forfaitaryTax - berekenhet) < 10, true);
}

const result = document.querySelector("#resultaat");
result.textContent = failures.length ? failures.join("\n") : "Alle berekeningstests geslaagd.";
result.dataset.status = failures.length ? "failed" : "passed";
