# Werkelijk rendement (tegenbewijsregeling) — onderzoek voor de rekenmodule

Deze map wordt de module voor **C. Tegenbewijsregeling — Werkelijk rendement** in het dashboard (`index.html`, nu een lege placeholder). Dit document legt vast wat de module per belastingjaar (2017–2026) moet kunnen. Het bevat de wettelijke regels, de rekenformule, de benodigde invoer en de jaarparameters. Bijgewerkt: 17 november 2026.

> Indicatief hulpmiddel. Controleer bij echte dossiers altijd de wettekst van het betreffende jaar en de actuele uitvoeringspraktijk.

---

## 1. Wettelijke basis

| Jaren | Grondslag | Waarmee wordt vergeleken |
|---|---|---|
| 2017–2022 | Art. 6a Wet rechtsherstel box 3 (ingevoegd door art. IV Wet tegenbewijsregeling box 3, terugwerkende kracht tot 1 januari 2017) | Het voordeel dat **volgens de Wet rechtsherstel** in aanmerking wordt genomen, dus de uitkomst van berekening A/B die het dashboard al toont (de laagste van de twee) |
| 2023–2026 | Art. 5.25–5.36 Wet IB 2001 (afdeling 5.6 Tegenbewijsregeling; art. I, terugwerkende kracht tot 1 januari 2023) | Het forfaitaire **voordeel uit sparen en beleggen** volgens de Overbruggingswet (berekening die het dashboard al toont) |
| vanaf 2026 | Ook art. 5.27a: voordeel uit **eigen gebruik** van een onroerende zaak (art. II, geen terugwerkende kracht) | idem |

Wet van 14 juli 2025, Stb. 2025, 195. In werking getreden op 19 juli 2025 (Stb. 2025, 196).

**Toegang per periode** (sluit aan op de formele beoordeling die al in de tool zit):
- **2017–2020:** alleen als de aanslag op 24 december 2021 nog niet onherroepelijk vaststond, en er tijdig bezwaar of een verzoek is ingediend. Tijdig betekent binnen vijf jaar na afloop van het belastingjaar. Kijk ook naar de uitspraak van de Hoge Raad van 25 juni 2026 en de collectieve beslissing van 17 juli 2026 over niet-bezwaarmakers (zie het leerdocument).
- **2021–2024:** opgaaf via het formulier **Opgaaf werkelijk rendement (OWR)**, beschikbaar sinds juli 2025.
- **2025 en later:** opgaaf in de **aangifte inkomstenbelasting**.

## 2. Rekenregel (art. 5.25–5.28)

```text
werkelijk rendement (gezamenlijk) =
    reguliere voordelen                                 (art. 5.27)
  + vermogensaanwas                                     (art. 5.28)
  − betaalde rente op schulden (negatief regulier voordeel)
  − vrijgesteld deel contant geld                       (art. 5.31b)
  − vrijgesteld deel groene beleggingen                 (art. 5.32)

vermogensaanwas per bestanddeel =
    waarde einde jaar − waarde begin jaar − stortingen + onttrekkingen

werkelijk rendement  = max(0, uitkomst)                 (art. 5.25 lid 2)
aandeel belastingplichtige = werkelijk rendement × aandeel in de grondslag sparen en beleggen
toepassen als: aandeel werkelijk rendement < forfaitair voordeel van die persoon
belastbaar inkomen box 3 = aandeel werkelijk rendement − persoonsgebonden aftrek
```

Belangrijke punten:
- **Geen heffingsvrij vermogen** over het werkelijke rendement. Het forfaitaire voordeel waarmee je vergelijkt, is wél al ná het heffingsvrije vermogen berekend.
- **Geen schuldendrempel.** Alle betaalde rente op box 3-schulden is aftrekbaar.
- **Geen kosten aftrekbaar**: geen transactiekosten, geen beheerkosten, geen onderhoud. Alleen rente op schulden.
- **Negatief = € 0.** Een verlies schuift niet door naar een ander jaar.
- **Elk verschil telt.** Er geldt geen drempel of minimumbedrag.
- **Vergelijking per persoon.** Bij fiscale partners wordt het gezamenlijke werkelijke rendement verdeeld in dezelfde verhouding als de grondslag sparen en beleggen in de aangifte (art. 5.25 lid 4–5). Daarvoor kan de tool het `partnerAllocation`-percentage van het dashboard gebruiken.
- **Minderjarige kinderen:** hun rendement wordt aan de ouder(s) toegerekend volgens art. 2.15 (art. 5.25 lid 3). Dat valt buiten de eerste versie: toon alleen een melding.
- **Tijdstip (art. 5.34, kasstelsel):** reguliere voordelen tellen in het jaar waarin ze zijn ontvangen, verrekend, ter beschikking gesteld, rentedragend geworden of vorderbaar en inbaar geworden. Betaalde rente telt in het jaar van betaling.
- **Onzakelijke voorwaarden (art. 5.27 lid 3):** reken met zakelijke voorwaarden, bijvoorbeeld zakelijke rente op een familielening. In de module wordt dit een melding plus een handmatig correctieveld.

### Reguliere voordelen (art. 5.27)
Rente, huur, pacht, dividend, winstuitkeringen, kapitaalsvergoedingen, licentie- en gebruiksvergoedingen. Huur telt **kaal**, dus zonder servicekosten. Voorbeeld van de Belastingdienst: (€ 1.500 − € 200) × 12 = € 15.600.

### Stortingen en onttrekkingen (art. 5.29–5.30)
- Een **storting** is een aankoop of een andere verkrijging, en ook een uitbreiding of verbetering van een bezitting. Een storting wordt gewaardeerd tegen de waarde op het moment van storten.
- **Uitzondering woning:** een uitbreiding of verbetering is geen storting (lid 3). De correctie loopt via de WOZ-eindwaarde (zie hieronder). **Onderhoud** is nooit een storting (lid 4).
- Een **onttrekking** is een verkoop of een andere vervreemding, gewaardeerd op het moment van onttrekken.
- Een overboeking tussen eigen box 3-rekeningen levert per saldo geen rendement op.

### Waardering (art. 5.31)
- **Algemeen:** de waarde in het economisch verkeer, net als in afdeling 5.4.
- **Woning:**
  - **Beginwaarde** = de WOZ-waarde die voor **dat** kalenderjaar is vastgesteld (peildatum 1 januari van het jaar ervoor).
  - **Eindwaarde** = de WOZ-waarde die voor **het volgende** kalenderjaar is vastgesteld.
  - **Aan- of verkoop tijdens het jaar:** waarde op dat moment = beginwaarde + (eindwaarde − beginwaarde) × verstreken dagen / dagen in het jaar.
  - **Uitbreiding of verbetering** (art. 18 lid 3 onder b Wet WOZ): als eindwaarde geldt de WOZ-waarde zonder die verbetering. Volgens de Belastingdienst mag een investering die de WOZ-waarde heeft verhoogd van de eindwaarde worden afgetrokken, mits die bij de gemeente is gemeld.
  - **Verhuurde woning:** de leegwaarderatio geldt (art. 5.31 lid 4 jo. 5.20 lid 3).
- **Eigen gebruik** (tweede woning, vakantiewoning): voor 2017–2025 is dit voordeel nihil. Vanaf **2026** telt de economische huurwaarde (art. 5.27a), naar tijdsevenredigheid. Dit geldt niet bij verhuur, bouw of onbruikbaarheid.

### Vrijstellingen binnen het werkelijke rendement
- **Contant geld:**
  - **In euro's is het werkelijke rendement € 0.** Contant geld levert geen rente of dividend op, en de nominale waarde verandert niet. Er is dus geen vermogensaanwas.
  - Geld opnemen van of storten op een eigen bankrekening is een verschuiving binnen box 3. Dat levert ook geen rendement op.
  - Alleen **contant geld in vreemde valuta** kan rendement geven, namelijk een **valutaresultaat**. Het OWR-formulier vraagt bij contant geld daarom alleen het valutaresultaat. De memorie van toelichting noemt valutaresultaten als waardemutatie.
  - De vrijstelling van art. 5.31b is dus alleen van belang bij vreemde valuta: niet-meetellend deel = valutaresultaat × drempel / bedrag aan contant geld aan het begin van het jaar.
  - **In de module:** zet contant geld in euro's vast op een werkelijk rendement van € 0. Vraag alleen bij vreemde valuta om een valutaresultaat.
  - Contant geld telt bij het forfaitaire rendement wél mee. Vanaf 2023 zelfs tegen het forfait voor overige bezittingen, rond de 6%. Daardoor kan veel contant geld de tegenbewijsregeling al snel gunstig maken.
- **Groene beleggingen (art. 5.32):** niet-meetellend deel = rendement groene beleggingen × vrijstelling / waarde groene beleggingen aan het begin van het jaar. Bij partners geldt het dubbele bedrag over de gezamenlijke beleggingen.
- **Uitvaart- en kapitaalverzekeringen (art. 5.31a, 5.32a):** gedeeltelijke vrijstelling. Komt zelden voor; in de eerste versie alleen een melding.
- **Bos- en natuurterreinen** en andere vrijgestelde bezittingen tellen niet mee.

### Overig
- **Begin of einde binnenlandse belastingplicht (art. 5.33):** de begin- of einddatum van het jaar verschuift. Buiten de eerste versie; alleen een melding.
- **Belastingrente** over de aanslag wordt naar verhouding verminderd. De Belastingdienst vergoedt geen rente over de vermindering.
- **Voorkoming dubbele belasting:** het buitenlandse deel volgt uit het buitenlandse deel van het werkelijke rendement. Buiten de eerste versie.

## 3. Invoer per categorie (volgt de OWR-rubrieken)

| Categorie | Benodigde invoer | Rendement |
|---|---|---|
| Banktegoeden (NL/buitenland) | ontvangen rente, betaalde (negatieve) rente, valutaresultaat | rente + valutaresultaat |
| Contant geld | euro of vreemde valuta; bij vreemde valuta: bedrag op 1 januari en valutaresultaat | euro: **€ 0**; vreemde valuta: valutaresultaat − vrijgesteld deel |
| Effecten, aandelen, obligaties, uitgeleend geld, crypto | waarde 1 januari en 31 december, stortingen (aankopen), onttrekkingen (verkopen), dividend en rente | eind − begin − stortingen + onttrekkingen + dividend/rente |
| Onroerende zaken (NL/buitenland) | WOZ-waarde jaar t, WOZ-waarde jaar t+1, aan-/verkoopdatum, verhuurd ja/nee (leegwaarderatio), kale huur/pacht, gemelde investering, eigen gebruik (vanaf 2026: huurwaarde) | huur + WOZ-mutatie (gecorrigeerd) |
| Kapitaalverzekeringen (niet-vrijgesteld deel) | waarde 1 januari en 31 december, gestorte premies, uitkeringen | eind − begin − premies + uitkeringen |
| Rechten op periodieke uitkeringen | waarde 1 januari en 31 december, ontvangen termijnen | eind − begin + termijnen |
| Overige bezittingen | waarde 1 januari en 31 december, aankopen, verkopen, opbrengsten | eind − begin − aankopen + verkopen + opbrengsten |
| Schulden (op onroerende zaken, overige, andere) | betaalde rente, valutaresultaat of bijzondere waardemutatie | − rente (± mutatie) |
| Groene beleggingen | markering bij de bank- of effectenregel + waarde 1 januari | vrijgesteld deel volgens de formule |

**Hergebruik van bestaande invoer:** de banktegoeden, overige bezittingen en schulden per 1 januari staan al per jaar in `localStorage`. Die kunnen als beginwaarde dienen. Wat de module nog extra moet vragen: de eindwaarden (31 december), de mutaties en de opbrengsten.

## 4. Jaarparameters

| Jaar | Vergelijken met | Contant geld p.p. | Groene beleggingen p.p. | Tarief | Bijzonderheid |
|---|---|---:|---:|---:|---|
| 2017 | Wet rechtsherstel (art. 6a) | € 520 ⚠︎ | € 57.385 | 30% | formele toets 24-12-2021 |
| 2018 | idem | € 527 | € 57.845 | 30% | idem |
| 2019 | idem | € 534 | € 58.540 | 30% | idem |
| 2020 | idem | € 543 | € 59.477 | 30% | idem |
| 2021 | idem | € 552 | € 60.429 | 31% | OWR-formulier |
| 2022 | idem | € 560 | € 61.215 | 31% | OWR-formulier |
| 2023 | Overbruggingswet (art. 5.25) | € 596 | € 65.072 | 32% | OWR-formulier |
| 2024 | idem | € 653 | € 71.251 | 36% | OWR-formulier |
| 2025 | idem | € 661 | € 26.312 | 36% | via de aangifte |
| 2026 | idem | € 672 | € 26.715 | 36% | via de aangifte; eigen gebruik telt (art. 5.27a) |

Bij fiscale partners gelden de dubbele bedragen. Het tarief en het forfaitaire voordeel staan al in [`gedeeld/jaargegevens.js`](../../gedeeld/jaargegevens.js).

Contant geld 2020–2026: bevestigd op de pagina van de Belastingdienst over overige vorderingen en contant geld. Deze vrijstelling raakt het werkelijke rendement alleen bij vreemde valuta (zie §2).

⚠︎ **Nog te verifiëren:**
- Contant geld 2017: bedrag geschat, niet in een bron gevonden.
- Contant geld 2018–2019: komt uit een tweedehandsbron (Lorijn, TaxLive). Controleren aan de jaarversie van art. 5.10 onder d Wet IB 2001.
- Leegwaarderatiotabellen per jaar (art. 10a Uitvoeringsbesluit IB 2001): nog niet opgenomen. Voorstel: de gebruiker voert het percentage in.

## 5. Voorstel voor de opbouw van de module

1. `berekeningen/werkelijk-rendement/berekening.js`: een pure functie `calculateActualReturn({ year, items, fiscalPartner, partnerShare, data })` die per categorie het rendement, het totaal, de nulgrens en de verdeling over de partners teruggeeft, met uitlegregels zoals bij de bestaande berekeningen (`…Calculation`-teksten).
2. Jaarparameters (`cashExemption`, `greenExemption`, `counterproofBasis: "rechtsherstel" | "overbrugging"`) toevoegen aan `BOX3_YEAR_DATA`.
3. Een invoerpagina `werkelijk-rendement.html` (of uitklapregels in paneel C) per categorie, opgeslagen per jaar onder een nieuwe sleutel in `gedeeld/opslag-sleutels.js`.
4. Paneel C vergelijkt het aandeel werkelijk rendement met het forfaitaire voordeel per persoon en toont de box 3-belasting en het verschil. Daarbij een melding als de formele toegang (`reliefAccessStatus`) ontbreekt.
5. Tests in `tests/berekeningen.js` met de rekenvoorbeelden van de Belastingdienst:
   - Zonder partner, spaargeld en aandelen: € 1.200 + € 12.300 = **€ 13.500**.
   - Crypto: € 90.000 − € 80.000 − € 5.000 + € 17.000 = **€ 22.000**.
   - Partner, met schuld: € 2.000 + € 12.500 − € 1.500 = **€ 13.000**.
   - Partner, verhuurde tweede woning: € 2.000 + € 2.000 + € 15.600 + € 5.000 = **€ 24.600**, per persoon € 12.300.
   - Partner, tweede woning in eigen gebruik + schuld: **€ 4.000**, per persoon € 2.000.
   - Nulgrens: € 800 − € 1.200 → **€ 0**.

## Bronnen

- [Stb. 2025, 195 — Wet tegenbewijsregeling box 3](https://zoek.officielebekendmakingen.nl/stb-2025-195.html)
- [Memorie van toelichting, Kamerstukken 36 706, nr. 3](https://zoek.officielebekendmakingen.nl/kst-36706-3.html)
- [Wet IB 2001, afdeling 5.6](https://wetten.overheid.nl/BWBR0011353/2026-01-01)
- [Belastingdienst — werkelijk rendement in de aangifte 2025](https://www.belastingdienst.nl/wps/wcm/connect/fisin/fisin2025/Box_3_Werkelijk_rendement)
- [Belastingdienst — rekenvoorbeelden werkelijk rendement](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/rekenvoorbeelden-berekening-werkelijk-rendement)
- [Belastingdienst — vrijstelling groene beleggingen 2017–2024](https://www.belastingdienst.nl/data/online_aangifte/ola/ib345e/meer_info/vrijstelling_groene_beleggingen.htm)
- [Belastingdienst — overige vorderingen en contant geld (vrijstelling 2020–2026)](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/vermogen_en_aanmerkelijk_belang/vermogen/wat_zijn_uw_bezittingen_en_schulden/uw_bezittingen/overige_vorderingen_zoals_uitgeleend_geld_en_contant_geld)
- [AFAS — rubrieken van het formulier OWR](https://help.afas.nl/help/nl/se/Tax_IB_Proces_Box3OWR.htm)
- [Lorijn — vrijstelling contant geld per jaar](https://www.lorijn.nl/box-3-inkomen-uit-sparen-en-beleggen/schulden), [TaxLive](https://www.taxlive.nl/nl/documenten/nieuws/zijn-saldinisten-strafbaar/), [SRA — bedragen 2026](https://www.sra.nl/nieuws/000000/2026/01/box-3-percentages-vrijstellingen-en-bedragen-2026)
- [NJB — Stb. 2025, 195/196](https://www.njb.nl/wetgeving/staatsbladen/tegenbewijsregeling-box-3/)
