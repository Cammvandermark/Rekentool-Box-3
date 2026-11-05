# Box 3-rekentool

Zakelijke rekentool voor het vastleggen en beoordelen van Box 3-gegevens per belastingjaar. De interface is gericht op fiscale dossierbehandeling.

## Gebruiken

Open `index.html` in een moderne browser en selecteer een belastingjaar van 2017 tot en met 2026. De formele beoordeling en historische berekeningen zijn beschikbaar voor 2017–2022. De berekening volgens de Overbruggingswet box 3 is beschikbaar voor 2023–2026. De invoer en dossiergegevens worden lokaal in de browser opgeslagen; er is geen server of buildstap nodig.

## Stappenplan

Het overzicht bevat banktegoeden, overige bezittingen, schulden en werkelijk rendement. Voor belastingjaren 2017–2020 bevat het dashboard de bestaande formele beoordeling. Voor 2021–2022 gebruikt het een afzonderlijke, kortere beoordeling zonder de peildatumvraag van 24 december 2021. De Wet rechtsherstelberekeningen zijn beschikbaar voor 2017–2022, ook voordat de formele beoordeling is afgerond. Voor 2023–2026 is er een afzonderlijke berekening volgens de Overbruggingswet box 3.

De formele beoordeling is standaard ingeklapt. Open het onderdeel **Formele beoordeling** om de vragen te bekijken en in te vullen.

Klik op **Banktegoeden** om naar `banktegoeden.html` te gaan. Daar kunnen meerdere bankrekeningen worden geregistreerd met rekeningnaam, bank en saldo op 1 januari. Klik op **Overige bezittingen** om naar `overige-bezittingen.html` te gaan. Daar staat per categorie alvast een invoerregel klaar; extra bezittingen kunnen met **+ Bezitting toevoegen** worden toegevoegd. Elke regel heeft een omschrijving, soort en waarde op 1 januari. De pagina toont ook een waarderingsuitleg per soort, waaronder de WOZ-peildatum voor Nederlandse woningen en de voorwaarden voor de leegwaarderatio bij verhuurde woningen. De categorieën volgen de bezittingenindeling van de [Belastingdienst](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/vermogen_en_aanmerkelijk_belang/vermogen/wat_zijn_uw_bezittingen_en_schulden/uw_bezittingen/). De categorie is alleen voor de inventarisatie: bijzondere vrijstellingen en waarderingsregels, zoals de leegwaarderatio, worden niet automatisch in de berekening toegepast. Beide totalen worden op de detailpagina en op het overzicht getoond en per belastingjaar bewaard.

## Voorvragen voor 2017–2020

Voor belastingjaren 2017 tot en met 2020 wordt de formele beoordeling getoond en kunnen de berekeningen ook worden ingevuld voordat de formele beoordeling is afgerond. Een melding maakt duidelijk dat deze berekeningen indicatief zijn en op zichzelf geen recht op Wet rechtsherstel box 3 vaststellen.

1. **Is er een definitieve aanslag opgelegd?**
   - **Ja:** voer bij vraag 2 de dagtekening van de aanslag in.
   - **Nee:** beantwoord vraag 2 over het verstrijken van de reguliere aanslagtermijn, vraag 3 over verleend uitstel en vraag 4 over andere wettelijke omstandigheden. Als bij vraag 3 **Ja** wordt gekozen, verschijnt een datumveld voor de datum tot wanneer uitstel is verleend; deze datum is nodig om verder te gaan. De conclusie over het niet alsnog mogen opleggen van een reguliere definitieve aanslag verschijnt alleen bij de antwoorden **Ja**, **Nee**, **Nee** op vragen 2, 3 en 4.

2. **Dagtekening aanslag:** voer de dagtekening in. De tool toont zes weken (42 dagen) na de dagtekening en past de Algemene termijnenwet niet automatisch toe. Geef per jaar aan of die wet van toepassing is. Bij **Ja** voer je zelf een datum in, vanaf de berekende datum tot maximaal één week daarna; deze datum wordt gebruikt voor de bezwaartermijn.
3. **Is er bezwaar ingediend?**
   - **Ja:** vraag 4 vraagt of het bezwaar tijdig is en om de indieningsdatum. Een tijdig bezwaar toont naast de datum de groene status **Ontvankelijk**. Bij een te laat bezwaar vraagt de tool of de termijnoverschrijding verschoonbaar is op grond van artikel 6:11 Awb; **Ja** toont **Ontvankelijk** en **Nee** toont **Niet ontvankelijk** naast de datum.
   - **Nee:** ga naar vraag 5.
4. **Is het bezwaar tijdig ingediend?** Bij een te laat bezwaar volgt de vraag of de termijnoverschrijding verschoonbaar is.
5. **Stond de aanslag op 24 december 2021 al onherroepelijk vast?** **Ja** geeft rood **Geen toegang tot Wet rechtsherstel box 3**; **Nee** geeft groen **Wel toegang tot Wet rechtsherstel box 3**. De vragen over de uitspraak op bezwaar en beroep zijn verwijderd.
   - De formele beoordeling gebruikt **Wel toegang** (groen), **Geen toegang** (rood) of **Nader juridisch onderzoek noodzakelijk** (oranje). De status is voor een toekomstige module beschikbaar als `document.documentElement.dataset.reliefAccessStatus` en via het `box3:relief-access-status`-event: `TOEGANG_RECHTSHERSTEL`, `GEEN_TOEGANG_RECHTSHERSTEL` of `NADER_ONDERZOEK`.
   - De toegangsstatus is beschikbaar als `document.documentElement.dataset.reliefAccessStatus` en via het `box3:relief-access-status`-event: `TOEGANG_RECHTSHERSTEL`, `GEEN_TOEGANG_RECHTSHERSTEL` of `NADER_ONDERZOEK`.

## Voorvragen voor 2021–2022

Voor deze jaren blijven de vragen over de definitieve aanslag, dagtekening, toepassing van de Wet rechtsherstel en bezwaar zichtbaar. Nadat de relevante gegevens over bezwaar en eventuele termijnoverschrijding zijn ingevuld, vraagt de tool of de aanslag op 24 december 2021 al onherroepelijk vaststond. **Ja** geeft **Geen toegang tot Wet rechtsherstel box 3**; **Nee** geeft **Wel toegang tot Wet rechtsherstel box 3**. De latere vragen over de uitspraak op bezwaar en beroep zijn niet opgenomen.

## Berekeningen 2017–2022

De gezamenlijke invoer bevat banktegoeden (via de rekeningenpagina), overige bezittingen (via de bezittingenpagina), schulden en fiscaal partnerschap. De overige bezittingen, schulden en partnerverdeling worden per belastingjaar in `localStorage` bewaard; bankrekeningen blijven op hun bestaande manier per jaar bewaard.

- **A. Oude box 3-berekening:** trekt de schuldendrempel en het heffingsvrije vermogen af, verdeelt de resterende grondslag over de vermogensschijven per belastingplichtige en past de jaarlijkse forfaitaire verdeling sparen/beleggen toe.
- **B. Wet rechtsherstel box 3:** berekent het forfaitaire rendement over gezamenlijke banktegoeden, overige bezittingen en aftrekbare schulden. Voor 2017–2021 wordt het effectieve rendementspercentage op twee decimalen afgerond en toegepast op de grondslag sparen en beleggen. Voor 2022 wordt het aandeel van de toegewezen grondslag in de rendementsgrondslag op twee decimalen afgerond en toegepast op het belastbaar rendement. Het voordeel wordt niet lager dan nihil.
- Voor belastingjaren 2017–2022 wordt de Wet rechtsherstel toegepast voor zover deze een lager voordeel oplevert dan de oorspronkelijke wettelijke berekening (artikel 1 Wet rechtsherstel). Dit is geen vergelijking met werkelijk rendement.
- Voor 2021–2022 onderscheidt de formele route de toepassing van de Wet rechtsherstel van de procedurele mogelijkheid een aanslag te wijzigen. Een nog lopend bezwaar of beroep wordt als lopende procedure getoond. Bij verlopen termijnen wordt een eventuele ambtshalve vermindering als nader onderzoek gemarkeerd; de vijfjaarstermijn is geen automatische garantie.
- De indicatieve parameters voor 2021 zijn sparen/beleggen 0,03%/5,69%, en banktegoeden/overige bezittingen/schulden 0,01%/5,69%/2,46%. Voor 2022 zijn deze -0,01%/5,53% en 0,00%/5,53%/2,28%. De heffingsvrije vermogens zijn € 50.000 (2021) en € 50.650 (2022); de schuldendrempel is € 3.200 per persoon.
- Fiscale partners kunnen het percentage van de gezamenlijke grondslag dat aan de belastingplichtige wordt toegerekend zelf instellen; het restant wordt aan de partner toegerekend. Voor 2017–2021 worden de rendementen per partner berekend met het effectieve rendementspercentage. Vanaf 2022 wordt het aandeel in de rendementsgrondslag voor iedere partner afzonderlijk afgerond en toegepast. De partnerbedragen en belasting worden afzonderlijk op twee decimalen afgerond en vervolgens opgeteld.
- Invoerbedragen en rekenuitkomsten worden voor deze indicatieve weergave op twee decimalen afgerond. De gewogen rendementspercentages van de oude methode (2017–2022) worden op drie decimalen afgerond en met die percentages berekend. Onjuiste of negatieve invoer wordt gemeld en niet doorgerekend.
- De belastingtarieven zijn 30% voor 2017–2020 en 31% voor 2021–2022. De vergelijking markeert de lagere belasting als gunstiger. De tegenbewijsregeling is nog een placeholder en bevat geen invoer of berekening.

## Berekening Overbruggingswet box 3 (2023–2026)

De berekening gebruikt de ingevulde banktegoeden, overige bezittingen en aftrekbare schulden. Zij past de jaarlijkse forfaits, schuldendrempel en heffingsvrij vermogen toe. Vervolgens wordt het aandeel van de grondslag sparen en beleggen in de rendementsgrondslag afgerond volgens de jaarregels van de Belastingdienst (2023: twee decimalen, 2024: drie decimalen, 2025–2026: twee decimalen) en vermenigvuldigd met het belastbaar rendement. Daarna wordt het jaarlijkse belastingtarief toegepast; de vergelijking met de oude box 3-methode voor 2017–2022 wordt niet getoond.

| Jaar | Banktegoeden | Overige bezittingen | Schulden | Tarief | Heffingsvrij vermogen p.p. | Schuldendrempel p.p. |
|---|---:|---:|---:|---:|---:|---:|
| 2023 | 0,92% | 6,17% | 2,46% | 32% | € 57.000 | € 3.400 |
| 2024 | 1,44% | 6,04% | 2,61% | 36% | € 57.000 | € 3.700 |
| 2025 | 1,37% | 5,88% | 2,70% | 36% | € 57.684 | € 3.800 |
| 2026 | 1,28%* | 6,00% | 2,70%* | 36% | € 59.357 | € 3.800 |

De percentages zijn overgenomen van de [Belastingdienst: berekening 2023](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2023), [2024](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2024), [2025](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2025) en [voorlopige aanslag 2026](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026). De bedragen voor heffingsvrij vermogen en schuldendrempel volgen de tabellen van de Belastingdienst voor [heffingsvrij vermogen](https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/heffingsvrij-vermogen) en [schuldendrempel](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/vermogen_en_aanmerkelijk_belang/vermogen/wat_zijn_uw_bezittingen_en_schulden/uw_schulden/drempel). Voor 2026 zijn de percentages voor banktegoeden en schulden nog voorlopig; de Belastingdienst stelt deze volgens de genoemde uitleg in 2027 definitief vast. De rekentool markeert dit ook in de berekening. De uitkomst is indicatief en geen berekening van werkelijk rendement of een definitieve belastingaanslag.

De forfaits voor rechtsherstel en de partnerberekening zijn getoetst aan [artikelen 1–4 van de Wet rechtsherstel box 3 (Stb. 2022, 533)](https://zoek.officielebekendmakingen.nl/stb-2022-533.html). De officiële jaarversies van de [Wet inkomstenbelasting 2001 voor 2017](https://wetten.overheid.nl/BWBR0011353/2017-01-01), [2018](https://wetten.overheid.nl/BWBR0011353/2018-01-01), [2019](https://wetten.overheid.nl/BWBR0011353/2019-01-01), [2020](https://wetten.overheid.nl/BWBR0011353/2020-01-01), [2021](https://wetten.overheid.nl/BWBR0011353/2021-01-01) en [2022](https://wetten.overheid.nl/BWBR0011353/2022-01-01) zijn de referenties voor de toepasselijke grondslag, vrijstellingen en schuldendrempels. Controleer voor dossiergebruik bijzondere regels zoals buitenlandse bezittingen, vrijstellingen en voorkoming van dubbele belasting.

Bij antwoord **Nee** op de aanslagvraag geldt een blokkade als de reguliere aanslagtermijn is verstreken, geen uitstel is verleend en geen andere wettelijke omstandigheid een afwijkende termijn geeft. De berekening blijft dan verborgen en de volgende conclusie wordt vetgedrukt getoond:

> Als er geen toepasselijke verlenging of uitzondering is, mag de Belastingdienst niet alsnog een reguliere definitieve aanslag opleggen.

De antwoorden op de voorvragen worden per belastingjaar bewaard in de browsersessie. De beoordeling is een hulpmiddel en geen vervanging van toetsing aan de wet en de omstandigheden van het dossier.

## Bestanden

- `index.html` — vermogensoverzicht en voorvragen.
- `app.js` — jaarselectie, voorvragen, datumindicatie en banktegoedentotaal.
- `banktegoeden.html` en `banktegoeden.js` — invoer en opslag van bankrekeningen per jaar.
- `overige-bezittingen.html` en `overige-bezittingen.js` — invoer en opslag van overige bezittingen per jaar.
- `styles.css` — gedeelde vormgeving.

## Status berekening

De twee indicatieve vergelijkingsberekeningen zijn geconfigureerd voor 2017–2022. De berekening volgens de Overbruggingswet box 3 is geconfigureerd voor 2023–2026. Andere belastingjaren hebben nog geen berekeningsmodule.
