# Box 3-rekentool

Zakelijke rekentool voor het vastleggen en beoordelen van Box 3-gegevens per belastingjaar. De interface is gericht op fiscale dossierbehandeling.

## Gebruiken

Open `index.html` in een moderne browser en selecteer een belastingjaar van 2017 tot en met 2025. De invoer en dossiergegevens worden lokaal in de browser opgeslagen; er is geen server of buildstap nodig.

## Vermogensoverzicht

Het overzicht bevat banktegoeden, overige bezittingen, schulden en werkelijk rendement. De berekeningsuitkomst blijft leeg zolang de toepasselijke tarieven en rekenregels niet zijn vastgesteld.

Klik op **Banktegoeden** om naar `banktegoeden.html` te gaan. Daar kunnen meerdere bankrekeningen worden geregistreerd met rekeningnaam, bank en saldo op 1 januari. Het totaal wordt op de detailpagina en op het overzicht getoond. Banktegoeden worden per belastingjaar bewaard.

## Voorvragen voor 2017–2020

Voor belastingjaren 2017 tot en met 2020 wordt eerst de formele voorvragenstap getoond. De berekening blijft verborgen totdat de toepasselijke vragen zijn doorlopen.

1. **Is er een definitieve aanslag opgelegd?**
   - **Ja:** voer de dagtekening van de aanslag in. Na invoer toont de tool de dagtekening en een indicatieve uiterste bezwaardatum.
   - **Nee:** beantwoord de vragen over het verstrijken van de reguliere aanslagtermijn, verleend uitstel en andere wettelijke omstandigheden.

Bij de datumweergave wordt vermeld dat de bezwaartermijn in beginsel zes weken bedraagt en begint op de dag na de dagtekening van het aanslagbiljet (art. 22j AWR). De tool telt voor de indicatie 42 kalenderdagen op bij de dagtekening en vermeldt: **Let op: Algemene termijnenwet.** De toepassing van die wet wordt niet automatisch beoordeeld.

Bij antwoord **Nee** op de aanslagvraag geldt een blokkade als de reguliere aanslagtermijn is verstreken, geen uitstel is verleend en geen andere wettelijke omstandigheid een afwijkende termijn geeft. De knop **Naar berekening** blijft dan uitgeschakeld en de volgende conclusie wordt vetgedrukt getoond:

> Als er geen toepasselijke verlenging of uitzondering is, mag de Belastingdienst niet alsnog een reguliere definitieve aanslag opleggen.

De antwoorden op de voorvragen worden per belastingjaar bewaard in de browsersessie. De beoordeling is een hulpmiddel en geen vervanging van toetsing aan de wet en de omstandigheden van het dossier.

## Bestanden

- `index.html` — vermogensoverzicht en voorvragen.
- `app.js` — jaarselectie, voorvragen, datumindicatie en banktegoedentotaal.
- `banktegoeden.html` — invoer van bankrekeningen.
- `banktegoeden.js` — opslag en optelling van bankrekeningen per jaar.
- `styles.css` — gedeelde vormgeving.

## Status berekening

Tarieven, vrijstellingen en Box 3-rekenregels zijn nog niet geconfigureerd. De tool toont daarom nog geen belastingberekening.
