# Box 3-rekentool

Zakelijke rekentool voor het vastleggen en beoordelen van Box 3-gegevens per belastingjaar. De interface is gericht op fiscale dossierbehandeling.

## Gebruiken

Open `index.html` in een moderne browser en selecteer een belastingjaar van 2017 tot en met 2026. De formele beoordeling en historische berekeningen zijn beschikbaar voor 2017–2022. De berekening volgens de Overbruggingswet box 3 is beschikbaar voor 2023–2026. De invoer en dossiergegevens worden lokaal in de browser opgeslagen; er is geen server of buildstap nodig.

## Indeling van de code

- `formele-beoordeling/`: vragen, formele beoordeling en conclusies; de specifieke route voor 2021–2022 staat in een apart bestand.
- `berekeningen/oude-methode/`: oude schijfberekening en toelichtingen.
- `berekeningen/rechtsherstel/`: berekening met het rendementspercentage voor 2017–2021.
- `berekeningen/overbruggingswet/`: berekening met het aandeel in de rendementsgrondslag vanaf 2022. Deze methode wordt ook gebruikt voor rechtsherstel in 2022.
- `berekeningen/gedeeld/`: gezamenlijke invoer, presentatie, vergelijking en het forfaitaire rendement dat beide methoden gebruiken.
- `berekeningen/werkelijk-rendement/`: tegenbewijsregeling (paneel C). `berekening.js` bevat de rekenregels zonder DOM; `dashboard.js` toont de bestanddelen uit A en vraagt per bestanddeel de aanvullende jaargegevens. Achtergrond en bronnen staan in `ONDERZOEK.md`.
- `gedeeld/vermogen-invoer.js`: invoer van banktegoeden, overige bezittingen en schulden in A.1 (de aparte invoerpagina's zijn vervallen; de gegevens staan onder dezelfde sleutels).
- `gedeeld/`: jaargegevens, opslagsleutels en het starten van het dashboard.
- `gedeeld/opslag-modus.js`: controlemodus (niets blijvend opslaan; alle opslag gaat naar een tijdelijke opslag van het tabblad) en de knop ‘Alle gegevens wissen’. Moet op elke pagina als eerste script laden.
- `berekeningen/gedeeld/jaarberekening.js`: `calculateBox3Year`, de volledige forfaitaire berekening van één jaar zonder DOM (grondslag, oude methode, Wet rechtsherstel/Overbruggingswet en de laagste uitkomst). Het dashboard en de snelcontrole gebruiken allebei deze functie.
- `snelcontrole.html` en `snelcontrole/`: snelcontrole OWR over meerdere jaren (zie hieronder). `snelcontrole-berekening.js` bevat de rekenregels en signalen zonder DOM, `snelcontrole.js` de invoer en weergave.
- `berekeningen/gedeeld/verslag.js`: onderdeel B (voorheen D), het afdrukbare verslag met jaargegevens, vermogen op 1 januari, forfaitaire berekening stap voor stap (2017–2022 ook de schijven), werkelijk rendement en bronnen. Inkomen en belasting worden in centen getoond, met tussen haakjes het bedrag in hele euro's naar beneden zoals op de aanslag (alleen weergave).

De HTML voor het dashboard en de gezamenlijke vormgeving blijven in `index.html` en `styles.css`. De klassieke scripts worden in de volgorde van `index.html` geladen; behoud die volgorde bij wijzigingen. Open `tests/berekeningen.html` rechtstreeks in de browser om de berekeningstests uit te voeren. Deze tests gebruiken geen opgeslagen dossiergegevens.

## Stappenplan

Het overzicht bevat banktegoeden, overige bezittingen, schulden en werkelijk rendement. Voor belastingjaren 2017–2020 bevat het dashboard de bestaande formele beoordeling. Voor 2021–2022 gebruikt het een afzonderlijke, kortere beoordeling zonder de peildatumvraag van 24 december 2021. De Wet rechtsherstelberekeningen zijn beschikbaar voor 2017–2022, ook voordat de formele beoordeling is afgerond. Voor 2023–2026 is er een afzonderlijke berekening volgens de Overbruggingswet box 3.

**Invoer A.1.** Eerst de vraag ‘Fiscale partner?’, daarna onder elkaar Banktegoeden, Overige bezittingen en Schulden, elk met één regel om mee te beginnen. Rechts voegt **+** een regel toe en verwijdert **×** een regel. Bedragen mogen in Nederlandse notatie worden geplakt (`340.000,00`). De toelichting bij overige bezittingen en schulden staat achter de (i). De gegevens worden onder dezelfde sleutels en in hetzelfde formaat bewaard als op de vroegere invoerpagina’s, zodat eerder ingevoerde dossiers gewoon verschijnen. Vanaf 2023 heeft Banktegoeden een kolom Soort (bankrekening of contant geld). De code staat in `gedeeld/vermogen-invoer.js`; het lezen van bedragen in `gedeeld/bedrag.js`.

**Eén groene uitkomst.** In het verslag is precies één uitkomst groen: de laagste van de methoden die gelden (2017–2020 zonder toegang: alleen de oude methode; 2017–2022: oude methode of Wet rechtsherstel; vanaf 2023: Overbruggingswet), of het werkelijk rendement als dat lager is. Het werkelijk rendement telt alleen mee als er in A.2 zelf iets is ingevuld; alleen de uit A.1 overgenomen standen (ook die van het volgende jaar) tellen niet. Een WOZ-waarde van € 0 als eindwaarde telt als leeg. Bij partners met een verschillende uitkomst per persoon is geen blok groen.

**Snelle keuze toegang (2017–2020).** Bovenaan de formele beoordeling staat ‘Toegang tot Wet rechtsherstel box 3’ met **Wel toegang** of **Geen toegang** (toelichting achter de (i)). Bij geen toegang toont de tool alleen de oude methode (schijven): geen Wet rechtsherstel, geen tegenbewijsregeling, en in het verslag alleen de jaargegevens van de oude methode. Bij wel toegang worden oude methode en Wet rechtsherstel vergeleken (laagste geldt) en is de tegenbewijsregeling van toepassing. Een snelle keuze gaat voor de uitkomst van de uitgebreide beoordeling; met ‘Keuze wissen’ bepaalt de uitgebreide beoordeling weer de toegang. Ook bij ‘geen toegang’ uit de uitgebreide beoordeling geldt alleen de oude methode. De keuze wordt per jaar bewaard onder `box3-snelle-toegang-v1`.

Opbouw van het overzicht per jaar: bovenaan de **formele beoordeling** (voor 2017–2020 een voorwaarde voor de tegenbewijsregeling), daarna de **uitkomstbalk** (forfaitair, bij werkelijk rendement, te betalen, volgens aanslag, verschil; voor 2017–2020 met de toegangsstatus), **A. Vermogensgegevens** met de box 3-belasting volgens de aanslag bovenaan, en **B. Verantwoording en afdrukken**: het volledige verslag, standaard open. Het verslag vermeldt voor 2017–2020 bovenaan de uitkomst van de formele beoordeling. De panelen ‘Berekening box 3’ en ‘Tegenbewijsregeling — Werkelijk rendement’ staan nog in de pagina (klasse `is-verborgen`), omdat zij de bedragen voor het verslag en de uitkomstbalk berekenen, maar worden niet getoond. Zolang onder A.2 niets is ingevuld voor het werkelijk rendement, meldt het verslag ‘Niet berekend’ en geldt in de uitkomstbalk de forfaitaire belasting; er wordt dan geen vermindering berekend.

De formele beoordeling is standaard ingeklapt. Open het onderdeel **Formele beoordeling** om de vragen te bekijken en in te vullen.

Kies een periode en klik op een jaarknop (bijv. 2017 · 2018 · 2019 · 2020). Banktegoeden, overige bezittingen en schulden vul je direct in onder A.1 (zie ‘Invoer A.1’). De soorten overige bezittingen volgen de indeling van de [Belastingdienst](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/vermogen_en_aanmerkelijk_belang/vermogen/wat_zijn_uw_bezittingen_en_schulden/uw_bezittingen/); de waarderingsuitleg per soort staat achter de (i). De soort is alleen voor de inventarisatie: bijzondere vrijstellingen en waarderingsregels, zoals de leegwaarderatio, worden niet automatisch in de berekening toegepast.

## Snelcontrole OWR

Via **Snelcontrole OWR** op het overzicht (of `snelcontrole.html`) controleer je een verzoek over meerdere jaren op één pagina. Per jaar (2017–2026) vul je de totalen in zoals op het formulier: banktegoeden, overige bezittingen (waarvan contant geld), schulden, fiscale partner met verdeling, het opgegeven werkelijk rendement (huishouden, na vrijstellingen) en de box 3-belasting volgens de aanslag. Lege jaren worden overgeslagen. Bedragen mogen in Nederlandse of Engelse notatie worden geplakt (`12.345,67`, `€ 12.345`, `12,345.67`).

Per jaar toont de tool de toegepaste methode, het forfaitaire voordeel, de belasting forfaitair en bij werkelijk rendement (hele euro's naar beneden, zoals op de aanslag), de te betalen belasting en het verschil met de aanslag. Een balk bovenaan blijft zichtbaar met de totalen over alle jaren. Aandachtspunten per jaar:

- de route: OWR (2017–2020 alleen bij formele toegang), via de aangifte vanaf 2025, en de voorlopige forfaits van 2026;
- een aanslag die afwijkt van de forfaitaire berekening, met herkenning van een aanslag die de Wet rechtsherstel volgt terwijl de oude methode lager is (of omgekeerd);
- een opgegeven rendement dat ongebruikelijk hoog (> 15%) of laag (< −30%) is ten opzichte van de bezittingen, meer dan 5% rendement bij alleen banktegoeden, of rendement zonder bezittingen. Deze grenzen zijn signaaldrempels en geen wettelijke normen;
- een negatief rendement (op € 0 gesteld) en een werkelijk rendement dat niet lager is dan het forfaitaire voordeel.

De invoer blijft alleen in het huidige tabblad bewaard (`sessionStorage`, sleutel `box3-snelcontrole-v1`) en wordt gewist met **Invoer leegmaken** of **Alle gegevens wissen**. Voor de volledige onderbouwing per jaar (schijven, bestanddelen, verslag) gebruik je de berekening op het overzicht.

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
- De belastingtarieven zijn 30% voor 2017–2020 en 31% voor 2021–2022. De vergelijking markeert de lagere belasting als gunstiger. De tegenbewijsregeling (paneel C) berekent het werkelijke rendement over de bestanddelen uit A: rente, waardeverandering (eind − begin − stortingen + onttrekkingen), kale huur, WOZ-mutatie en betaalde rente op schulden, zonder heffingsvrij vermogen en schuldendrempel en met een nulgrens. Contant geld in euro's heeft een werkelijk rendement van € 0. Het rendement wordt naar rato van de grondslagverdeling aan partners toegerekend en per persoon vergeleken met het forfaitaire voordeel (2017–2022: het voordeel volgens de Wet rechtsherstel, de laagste van A en B; vanaf 2023: de Overbruggingswet). De aanvullende invoer wordt per jaar bewaard onder `box3-calculator-actual-return-v1`. De invoer staat onder A.2 (per soort bestanddeel eigen kolommen), de berekening onder C. Bijzonderheden: een waardedaling van rechten op periodieke uitkeringen telt als onttrekking; bij kapitaalverzekeringen kan het niet-vrijgestelde percentage worden toegepast; een kwijtgescholden schuld telt als rendement; een woning kan tijdens het jaar worden gekocht of verkocht (dagen naar rato, schrikkeljaren meegeteld); het forfaitaire voordeel kan optioneel uit de aangifte of aanslag worden overgenomen; de waarde op 31 december wordt vergeleken met de stand op 1 januari van het volgende jaar in A.1. De indieningsroute verschilt per jaar: OWR-formulier voor 2017–2024 (2017–2020 alleen bij formele toegang), aangifte vanaf 2025.

## Berekening Overbruggingswet box 3 (2023–2026)

De berekening gebruikt de ingevulde banktegoeden, overige bezittingen en aftrekbare schulden. Zij past de jaarlijkse forfaits, schuldendrempel en heffingsvrij vermogen toe. Vervolgens wordt het aandeel van de grondslag sparen en beleggen in de rendementsgrondslag afgerond volgens de jaarregels van de Belastingdienst (2023: twee decimalen, 2024: drie decimalen, 2025–2026: twee decimalen) en vermenigvuldigd met het belastbaar rendement. Daarna wordt het jaarlijkse belastingtarief toegepast; de vergelijking met de oude box 3-methode voor 2017–2022 wordt niet getoond. Voor 2022–2026 wordt het aandeel naar beneden afgerond (afgekapt), in het voordeel van de belastingplichtige en zoals in de rekenvoorbeelden van de Belastingdienst voor 2023–2026.

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
- `gedeeld/dashboard.js` en `gedeeld/dashboard-start.js` — dashboard en jaarselectie.
- `styles.css` — gedeelde vormgeving.

## Status berekening

De twee indicatieve vergelijkingsberekeningen zijn geconfigureerd voor 2017–2022. De berekening volgens de Overbruggingswet box 3 is geconfigureerd voor 2023–2026. Andere belastingjaren hebben nog geen berekeningsmodule.
