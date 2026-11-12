# Aandachtspunten Rekentool Box 3

## Prioriteit 1: Data Opslag & Persistentie
- [ ] Berekeningen opslaan (local storage, database, of server?)
- [ ] Werkingsstaten behouden tussen sessies
- [ ] Mogelijkheid om eerder gemaakte berekeningen op te roepen
- [ ] Backup functionaliteit

## Prioriteit 2: Input Validatie & Constraints
- [ ] Minimale en maximale vermogensbedragen definiëren per jaar
- [ ] Negatieve bedragen niet toestaan (waar van toepassing)
- [ ] Vereiste velden controleren voor completeness
- [ ] Waarschuwingen voor extreme waarden
- [ ] Valutaformatering (2 decimalen)

## Prioriteit 3: Berekeningen Verifiëren
- [ ] Formule voor Oude methode (2017-2020) mathematisch controleren
- [ ] Formule voor Wet rechtsherstel (2021-2022) mathematisch controleren
- [ ] Formule voor Overbruggingswet (2023-2024, 2025-2028) mathematisch controleren
- [ ] Tegenbewijsregeling berekening valideren
- [ ] Edge cases testen (0, negatief, zeer hoog vermogen)

## Prioriteit 4: Rapportage & Export
- [ ] PDF export van berekening
- [ ] Excel export van gegevens
- [ ] Rapport met gebruikte periode, jaren, en resultaten
- [ ] Mogelijkheid om rapport af te drukken voor dossier

## Prioriteit 5: Audit Trail & Logging
- [ ] Registreren wie (medewerker ID) wat heeft ingevoerd
- [ ] Timestamp van wijzigingen
- [ ] Wijzigingsgeschiedenis per berekening
- [ ] Optioneel: Verschillende rollen/rechten (viewer, editor, admin)

## Prioriteit 6: Error Handling & User Feedback
- [ ] Duidelijke foutmeldingen bij ongeldige input
- [ ] Helptext/tooltips per veld
- [ ] Validatiefouten duidelijk highlighten
- [ ] Recovery stappen aanbieden

## Prioriteit 7: Wettelijke Compliance Checks
- [ ] Automatische controle op Kerstarrest (2017-2020)
- [ ] Check of belastingplichtige toegang heeft tot rechtsherstel
- [ ] Waarschuwing als Tegenbewijsregeling van toepassing is
- [ ] Verificatie tegen actuele belastingwetgeving

## Prioriteit 8: Gebruikersdocumentatie
- [ ] Gebruikershandleiding schrijven
- [ ] FAQ opstellen
- [ ] Juridische uitleg per onderdeel uitbreiden
- [ ] Training/onboarding materiaal

## Prioriteit 9: Test Coverage
- [ ] Unit tests voor berekeningen
- [ ] Integratietests voor workflows
- [ ] Edge case testing
- [ ] Regressie testing na updates

## Prioriteit 10: Integratie & Connectiviteit
- [ ] API voor koppeling met interne BD-systemen?
- [ ] Authenticatie voor beveiligde toegang
- [ ] Logging naar centrale server
- [ ] GDPR compliance check (persoonsgegevens)

---

## Status per datum
- **12-11-2026**: Basis UI functioneel, alle periodes werkend, Formele beoordeling panels gefixt
- **Versie tag**: versie-einde-12-11-2026

## Notities voor jezelf
- Dit is intern gebruik, dus geen commercial grade nodig - maar wel betrouwbaar en auditabel voor BD-doeleinden
- Vraag intern bij BD of er voorkeuren zijn voor opslag (local, server, specifiek systeem)
- Check regelmatig of wettelijke regelingen zijn gewijzigd!
