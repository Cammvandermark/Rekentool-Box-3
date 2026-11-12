"use strict";

function setModernAssessmentResult(kind, message, note = "") {
  modernAssessmentResult.hidden = !message;
  modernAssessmentResult.className =
    `access-result${message ? ` access-result-${kind}` : ""}`;
  modernAssessmentResult.textContent = message;
  modernAssessmentNote.hidden = !note;
  modernAssessmentNote.textContent = note;
}

function renderModernAavResult(answers, year, lateObjection) {
  const requestDate = answers.modernAavRequestDate || "";
  const assessmentDate = answers.modernAssessmentDate || "";
  const deadline = `${Number(year) + 5}-12-31`;
  if (!formatDate(requestDate) || requestDate < assessmentDate) {
    setModernAssessmentResult(
      "review",
      formatDate(requestDate) && requestDate < assessmentDate
        ? "De ontvangstdatum van het verzoek kan niet vóór de dagtekening van de definitieve aanslag liggen. Controleer de ingevoerde datum."
        : lateObjection
        ? "Het bezwaar is niet-ontvankelijk wegens termijnoverschrijding. Vul de juridisch relevante ontvangstdatum van het eventuele verzoek om ambtshalve vermindering in."
        : "De bezwaartermijn is verstreken. Vul de datum in waarop het verzoek om ambtshalve vermindering is (of wordt) ontvangen.",
      `De reguliere vijfjaarstermijn loopt in beginsel tot en met ${formatDate(deadline)}.`,
    );
    return;
  }
  if (requestDate > deadline) {
    setModernAssessmentResult(
      "review",
      "De reguliere vijfjaarstermijn lijkt verstreken. Controleer of een bijzondere wettelijke regel of uitzondering van toepassing is.",
      "De datum alleen is onvoldoende om vast te stellen dat vermindering onmogelijk is. Beoordeel artikel 9.6 Wet IB 2001, artikel 45aa Uitvoeringsregeling IB 2001 en de toepasselijke box 3-regels.",
    );
    return;
  }

  const counterproof = answers.modernAavCounterproof || "";
  if (counterproof === "yes") {
    setModernAssessmentResult(
      "info",
      "Verzoek binnen de reguliere vijfjaarstermijn. De mogelijke vermindering wegens lager werkelijk rendement moet afzonderlijk worden beoordeeld.",
      "De huidige berekeningsmodule berekent geen werkelijk rendement. De datumcontrole bewijst niet dat aan de voorwaarden van de Wet tegenbewijsregeling box 3 is voldaan.",
    );
    return;
  }
  if (counterproof === "unknown" || !["yes", "no"].includes(counterproof)) {
    setModernAssessmentResult(
      "review",
      "Verzoek binnen de reguliere vijfjaarstermijn. Geef aan of vermindering wordt gevraagd wegens lager werkelijk rendement.",
      "De termijn is slechts een procedurele voorwaarde; de inhoudelijke voorwaarden en wettelijke beperkingen moeten nog worden getoetst.",
    );
    return;
  }
  if (answers.modernReliefApplied === "no") {
    setModernAssessmentResult(
      "info",
      "Verzoek binnen de reguliere vijfjaarstermijn. Onderzoek of de Wet rechtsherstel niet of onjuist is toegepast en of artikel 45aa Uitvoeringsregeling IB 2001 aan vermindering in de weg staat.",
      "Een tijdig verzoek geeft niet automatisch recht op vermindering. Gebruik de berekeningen hieronder als indicatie en controleer de aanslag en de wettelijke voorwaarden.",
    );
    return;
  }
  setModernAssessmentResult(
    "review",
    "Op basis van de antwoorden is geen aanvullende grond voor ambtshalve vermindering vastgesteld.",
    "De Wet rechtsherstel is al toegepast en er is geen verzoek wegens lager werkelijk rendement opgegeven. Controleer de berekening, wettelijke beperkingen en eventuele bijzondere omstandigheden voordat een definitieve conclusie wordt getrokken.",
  );
}

function renderModernAssessment(answers, year) {
  document.querySelector("#modern-preliminary-year").textContent = year;
  setReliefAccessStatus(RELIEF_ACCESS_STATUS.review);
  for (const [name, key] of [
    ["modern-assessment-issued", "modernAssessmentIssued"],
    ["modern-extension-status", "modernExtensionStatus"],
    ["modern-relief-applied", "modernReliefApplied"],
    ["modern-objection-status", "modernObjectionStatus"],
    ["modern-late-objection", "modernLateObjection"],
    ["modern-finality-status", "modernFinalityStatus"],
    ["modern-objection-outcome", "modernObjectionOutcome"],
    ["modern-appeal-status", "modernAppealStatus"],
    ["modern-aav-counterproof", "modernAavCounterproof"],
  ]) {
    restoreAnswer(name, answers[key] || "");
  }
  modernAssessmentDate.value = answers.modernAssessmentDate || "";
  modernGeneralTermsLawDate.value = answers.modernGeneralTermsLawDate || "";
  restoreAnswer("modern-general-terms-law", answers.modernGeneralTermsLaw || "");
  modernExtensionDate.value = answers.modernExtensionDate || "";
  modernObjectionDate.value = answers.modernObjectionDate || "";
  modernAavRequestDate.value = answers.modernAavRequestDate || "";
  modernObjectionAnnouncementDate.value =
    answers.modernObjectionAnnouncementDate || "";
  modernAppealDate.value = answers.modernAppealDate || "";
  modernAppealProcedureStatus.value =
    answers.modernAppealProcedureStatus || "";
  modernAppealFinalDate.value = answers.modernAppealFinalDate || "";
  modernAppealFinalInstance.value = answers.modernAppealFinalInstance || "";
  modernAppealFinalEnding.value = answers.modernAppealFinalEnding || "";

  const issued = answers.modernAssessmentIssued || "";
  const modernAssessmentDateValue = answers.modernAssessmentDate || "";
  const modernDeadline = getAssessmentObjectionDeadline(
    modernAssessmentDateValue,
    answers.modernGeneralTermsLaw,
    answers.modernGeneralTermsLawDate,
  );
  const validModernAssessmentDate = Boolean(formatDate(modernAssessmentDateValue));
  modernAssessmentNotIssued.hidden = issued !== "no";
  modernAssessmentIssuedFields.hidden = issued !== "yes";
  modernExtensionDateField.hidden =
    issued !== "no" || answers.modernExtensionStatus !== "yes";
  modernAssessmentDate.required = issued === "yes";
  modernExtensionDate.required = !modernExtensionDateField.hidden;
  modernGeneralTermsLawDateField.hidden =
    issued !== "yes" ||
    !validModernAssessmentDate ||
    answers.modernGeneralTermsLaw !== "yes";
  modernGeneralTermsLawDate.required = !modernGeneralTermsLawDateField.hidden;
  const modernBaseDeadline = validModernAssessmentDate
    ? getDeadlineAfterDays(modernAssessmentDateValue, 42)
    : "";
  modernGeneralTermsLawDate.min = modernBaseDeadline;
  modernGeneralTermsLawDate.max = modernBaseDeadline
    ? getDeadlineAfterDays(modernBaseDeadline, 7)
    : "";
  modernGeneralTermsLawDate.setAttribute(
    "aria-invalid",
    String(
      !modernGeneralTermsLawDateField.hidden &&
      Boolean(formatDate(answers.modernGeneralTermsLawDate || "")) &&
      !modernDeadline,
    ),
  );
  modernReliefFields.hidden =
    issued !== "yes" || !formatDate(answers.modernAssessmentDate || "");
  const reliefApplied = answers.modernReliefApplied || "";
  modernProcedureFields.hidden =
    modernReliefFields.hidden ||
    !modernDeadline ||
    !["yes", "no"].includes(reliefApplied);
  modernObjectionDateField.hidden =
    modernProcedureFields.hidden ||
    answers.modernObjectionStatus !== "yes";
  modernObjectionDate.required = !modernObjectionDateField.hidden;
  const objectionDate = answers.modernObjectionDate || "";
  const objectionDeadline = getAssessmentObjectionDeadline(
    answers.modernAssessmentDate || "",
    answers.modernGeneralTermsLaw,
    answers.modernGeneralTermsLawDate,
  );
  const objectionDateValid = Boolean(formatDate(objectionDate));
  const objectionLate =
    objectionDateValid &&
    objectionDeadline &&
    objectionDate > objectionDeadline;
  const modernObjectionInadmissible =
    objectionDateValid &&
    objectionLate &&
    answers.modernLateObjection === "no";
  modernObjectionAdmissibilityBadge.textContent = modernObjectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  modernObjectionAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    modernObjectionInadmissible,
  );
  modernObjectionAdmissibilityBadge.hidden =
    modernObjectionDateField.hidden ||
    !objectionDateValid ||
    objectionLate;
  modernLateAdmissibilityBadge.hidden =
    !objectionLate ||
    !["yes", "no"].includes(answers.modernLateObjection);
  modernLateAdmissibilityBadge.textContent = modernObjectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  modernLateAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    modernObjectionInadmissible,
  );
  modernLateObjectionFields.hidden =
    modernObjectionDateField.hidden || !objectionLate;
  const finalityStatus = answers.modernFinalityStatus || "";
  modernFinalityQuestion.hidden =
    modernProcedureFields.hidden ||
    !(
      answers.modernObjectionStatus === "no" ||
      (answers.modernObjectionStatus === "yes" &&
        objectionDateValid &&
        (!objectionLate || ["yes", "no"].includes(answers.modernLateObjection)))
    );
  const objectionDeadlinePassed =
    Boolean(objectionDeadline) && objectionDeadline < getTodayDateValue();
  const aavRoute =
    !modernProcedureFields.hidden &&
    ((answers.modernObjectionStatus === "no" && objectionDeadlinePassed) ||
      (answers.modernObjectionStatus === "yes" &&
        objectionLate &&
        answers.modernLateObjection === "no"));
  const aavDeadline = `${Number(year) + 5}-12-31`;
  modernAavFields.hidden = !aavRoute;
  modernLateObjectionNotice.hidden =
    !aavRoute || answers.modernObjectionStatus !== "yes";
  modernNoObjectionNotice.hidden =
    !aavRoute || answers.modernObjectionStatus !== "no";
  modernAavYear.textContent = year;
  modernAavDeadline.textContent = formatDate(aavDeadline);
  modernAavRequestDate.required = aavRoute;
  const aavRequestDate = answers.modernAavRequestDate || "";
  const aavRequestDateValid =
    Boolean(formatDate(aavRequestDate)) &&
    aavRequestDate >= (answers.modernAssessmentDate || "");
  const aavWithinDeadline =
    aavRequestDateValid && aavRequestDate <= aavDeadline;
  modernAavDateStatus.hidden = !aavRoute || !aavRequestDateValid;
  modernAavDateStatus.textContent = !aavRequestDateValid
    ? ""
    : aavWithinDeadline
      ? `De opgegeven ontvangstdatum valt binnen de reguliere vijfjaarstermijn (tot en met ${formatDate(aavDeadline)}). Dit stelt geen recht op vermindering vast.`
      : `De opgegeven ontvangstdatum valt na de reguliere vijfjaarstermijn (tot en met ${formatDate(aavDeadline)}). Controleer of een bijzondere wettelijke regel van toepassing is.`;
  modernAavReasonField.hidden = !aavRoute || !aavWithinDeadline;
  modernObjectionDecisionFields.hidden =
    modernProcedureFields.hidden ||
    answers.modernObjectionStatus !== "yes" ||
    !objectionDateValid ||
    (objectionLate && answers.modernLateObjection !== "yes");
  modernObjectionRulingFields.hidden =
    modernObjectionDecisionFields.hidden ||
    answers.modernObjectionOutcome !== "decided";
  modernAppealDateField.hidden =
    modernObjectionRulingFields.hidden ||
    answers.modernAppealStatus !== "yes";
  const appealDateValid = Boolean(formatDate(answers.modernAppealDate || ""));
  modernAppealProcedureFields.hidden =
    modernAppealDateField.hidden || !appealDateValid;
  const appealFinalStatus = answers.modernAppealProcedureStatus || "";
  modernAppealFinalFields.hidden =
    modernAppealProcedureFields.hidden ||
    !["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
      .includes(appealFinalStatus);
  modernAssessmentStatutoryDeadline.textContent =
    `Reguliere aanslagtermijn: in beginsel tot en met 31 december ${Number(year) + 3} (drie jaar na afloop van het belastingjaar). Uitstel en bijzondere wettelijke termijnen kunnen dit wijzigen.`;

  const assessmentDate = answers.modernAssessmentDate || "";
  const validAssessmentDate = Boolean(formatDate(assessmentDate));
  modernAavRequestDate.min = validAssessmentDate ? assessmentDate : "";
  modernAavRequestDate.setAttribute(
    "aria-invalid",
    String(
      aavRoute &&
      Boolean(formatDate(aavRequestDate)) &&
      aavRequestDate < assessmentDate,
    ),
  );
  modernAssessmentDateDeadline.hidden =
    issued !== "yes" || !validAssessmentDate;
  const objectionDeadlineDate = validAssessmentDate
    ? getDeadlineAfterDays(assessmentDate, 42)
    : "";
  if (objectionDeadlineDate) {
    modernObjectionDeadlineDate.textContent = formatDate(objectionDeadlineDate);
  }

  if (issued === "yes" && validAssessmentDate && !objectionDeadline) {
    setModernAssessmentResult(
      "review",
      answers.modernGeneralTermsLaw === "yes"
        ? "Vul een handmatige datum in tussen de datum zes weken na dagtekening en maximaal een week daarna."
        : "Geef aan of de Algemene termijnenwet van toepassing is.",
    );
    return;
  }
  if (issued === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: controleer eerst of een definitieve aanslag is opgelegd.",
    );
    return;
  }
  if (issued === "no") {
    const extension = answers.modernExtensionStatus || "";
    const extensionDate = answers.modernExtensionDate || "";
    if (!extension || extension === "unknown" ||
        (extension === "yes" && !formatDate(extensionDate))) {
      setModernAssessmentResult(
        "review",
        "Onvoldoende gegevens: controleer of uitstel of een bijzondere aanslagtermijn geldt.",
      );
      return;
    }
    const assessmentDeadline = extension === "yes"
      ? extensionDate
      : `${Number(year) + 3}-12-31`;
    if (assessmentDeadline >= getTodayDateValue()) {
      setModernAssessmentResult(
        "positive",
        "Reguliere beoordeling mogelijk: de definitieve aanslag kan in beginsel nog worden opgelegd.",
        `De indicatieve termijn loopt tot en met ${formatDate(assessmentDeadline)}. Controleer uitstel, buitenlandse inkomsten en andere bijzondere wettelijke regels.`,
      );
    } else {
      setModernAssessmentResult(
        "review",
        "Nader juridisch onderzoek noodzakelijk: de reguliere aanslagtermijn lijkt verstreken.",
        "Controleer uitstel, bijzondere wettelijke termijnen en de concrete aanslaggegevens. Deze rekentool stelt niet zelfstandig vast dat geen aanslag meer kan worden opgelegd.",
      );
    }
    return;
  }
  if (!validAssessmentDate) {
    setModernAssessmentResult(
      "review",
      "Vul de dagtekening van de definitieve aanslag in.",
    );
    return;
  }
  if (!modernReliefFields.hidden && !["yes", "no"].includes(reliefApplied)) {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: controleer op de aanslag of een latere beschikking de Wet rechtsherstel is toegepast.",
    );
    return;
  }
  if (modernProcedureFields.hidden) {
    setModernAssessmentResult(
      "review",
      "Controleer eerst of de Wet rechtsherstel box 3 is toegepast.",
    );
    return;
  }

  const objectionStatus = answers.modernObjectionStatus || "";
  if (!objectionStatus || objectionStatus === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: stel vast of bezwaar is ingediend.",
    );
    return;
  }
  if (objectionStatus === "no") {
    if (["yes", "no"].includes(finalityStatus)) {
      setReliefAccessStatus(
        finalityStatus === "yes"
          ? RELIEF_ACCESS_STATUS.negative
          : RELIEF_ACCESS_STATUS.positive,
      );
      setModernAssessmentResult(
        finalityStatus === "yes" ? "negative" : "positive",
        finalityStatus === "yes"
          ? "Geen toegang tot Wet rechtsherstel box 3."
          : "Wel toegang tot Wet rechtsherstel box 3.",
      );
      return;
    }
    if (modernDeadline >= getTodayDateValue()) {
      setModernAssessmentResult(
        "positive",
        "Reguliere beoordeling mogelijk: de bezwaartermijn loopt nog.",
        `De indicatieve uiterste bezwaardatum is ${formatDate(modernDeadline)}.`,
      );
    } else {
      renderModernAavResult(answers, year, false);
    }
    return;
  }
  if (!objectionDateValid) {
    setModernAssessmentResult(
      "review",
      "Vul de datum in waarop bezwaar is ingediend voordat de tijdigheid wordt beoordeeld.",
    );
    return;
  }
  if (objectionLate && answers.modernLateObjection === "unknown") {
    setModernAssessmentResult(
      "review",
      "Het bezwaar lijkt na de berekende termijn te zijn ingediend. Stel eerst vast of de postregel geldt en of de termijnoverschrijding verschoonbaar is.",
      "Op grond van artikel 6:11 Awb kan een termijnoverschrijding onder omstandigheden verschoonbaar zijn. Zonder voldoende gegevens wordt geen definitieve conclusie over de ontvankelijkheid getrokken.",
    );
    return;
  }
  if (["yes", "no"].includes(finalityStatus)) {
    setReliefAccessStatus(
      finalityStatus === "yes"
        ? RELIEF_ACCESS_STATUS.negative
        : RELIEF_ACCESS_STATUS.positive,
    );
    setModernAssessmentResult(
      finalityStatus === "yes" ? "negative" : "positive",
      finalityStatus === "yes"
        ? "Geen toegang tot Wet rechtsherstel box 3."
        : "Wel toegang tot Wet rechtsherstel box 3.",
    );
    return;
  }
  if (objectionLate && answers.modernLateObjection === "no") {
    renderModernAavResult(answers, year, true);
    return;
  }
  setModernAssessmentResult(
    "review",
    "Stel vast of de aanslag op 24 december 2021 al onherroepelijk vaststond.",
  );
  return;
  if (objectionLate && answers.modernLateObjection === "no") {
    renderModernAavResult(answers, year, true);
    return;
  }
  const objectionOutcome = answers.modernObjectionOutcome || "";
  if (!objectionOutcome) {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: stel vast of uitspraak op bezwaar is gedaan.",
    );
    return;
  }
  if (objectionOutcome === "pending") {
    setModernAssessmentResult(
      "positive",
      "Reguliere beoordeling mogelijk: het bezwaar is nog in behandeling.",
      "Een lopend bezwaar betekent dat de procedure nog niet definitief is afgerond. Controleer de ontvankelijkheid als het bezwaar na de berekende termijn is ingediend.",
    );
    return;
  }
  if (objectionOutcome === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: controleer de uitspraak op bezwaar en de actuele processtatus.",
    );
    return;
  }
  const announcementDate = answers.modernObjectionAnnouncementDate || "";
  if (!formatDate(announcementDate)) {
    setModernAssessmentResult(
      "review",
      "Vul de datum van bekendmaking van de uitspraak op bezwaar in.",
    );
    return;
  }
  const appealDeadline = getDeadlineAfterDays(announcementDate, 42);
  if (!appealDeadline) {
    setModernAssessmentResult("review", "De beroepstermijn kon niet worden berekend.");
    return;
  }
  const appealStatus = answers.modernAppealStatus || "";
  if (!appealStatus || appealStatus === "unknown") {
    setModernAssessmentResult(
      "review",
      "Onvoldoende gegevens: stel vast of tijdig beroep is ingesteld.",
      `De indicatieve beroepstermijn loopt tot en met ${formatDate(appealDeadline)}.`,
    );
    return;
  }
  if (appealStatus === "no") {
    if (appealDeadline >= getTodayDateValue()) {
      setModernAssessmentResult(
        "positive",
        "Reguliere beoordeling mogelijk: de beroepstermijn loopt nog.",
        `De indicatieve uiterste datum voor beroep is ${formatDate(appealDeadline)}.`,
      );
    } else {
      setModernAssessmentResult(
        "review",
        "De beroepstermijn lijkt verstreken zonder beroep. Onderzoek of ambtshalve vermindering of een andere wettelijke route openstaat.",
        `De vijfjaarstermijn voor een verzoek om ambtshalve vermindering loopt in beginsel tot en met 31 december ${Number(year) + 5}; dit garandeert geen vermindering.`,
      );
    }
    return;
  }
  if (!appealDateValid) {
    setModernAssessmentResult(
      "review",
      "Vul de datum in waarop beroep is ingesteld.",
      `De indicatieve beroepstermijn liep tot en met ${formatDate(appealDeadline)}.`,
    );
    return;
  }
  if (answers.modernAppealDate > appealDeadline) {
    setModernAssessmentResult(
      "review",
      "Het beroep lijkt te laat ingesteld. Controleer de postregel, ontvankelijkheid en eventuele verschoonbaarheid.",
      `De berekende uiterste datum was ${formatDate(appealDeadline)}.`,
    );
    return;
  }
  if (appealFinalStatus === "ongoing") {
    setModernAssessmentResult(
      "positive",
      "Reguliere beoordeling mogelijk: de beroepsprocedure loopt nog.",
    );
    return;
  }
  if (!["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
    .includes(appealFinalStatus)) {
    setModernAssessmentResult(
      "review",
      "Geef de actuele status van de beroepsprocedure op.",
    );
    return;
  }
  const finalDate = answers.modernAppealFinalDate || "";
  const finalInstance = answers.modernAppealFinalInstance || "";
  const finalEnding = answers.modernAppealFinalEnding || "";
  if (!formatDate(finalDate) || !finalInstance || !finalEnding) {
    setModernAssessmentResult(
      "review",
      "Vul de laatste uitspraak of beëindiging, de instantie en de wijze waarop de procedure eindigde in.",
    );
    return;
  }
  if (finalEnding === "referred" || appealFinalStatus === "other") {
    setModernAssessmentResult(
      "review",
      "Nader juridisch onderzoek noodzakelijk: de procedure kan nog lopen of de gegevens zijn niet voldoende om de onherroepelijkheid vast te stellen.",
    );
    return;
  }
  if (
    finalInstance === "supreme-court" &&
    finalEnding === "no-further-remedy" &&
    appealFinalStatus === "supreme-court"
  ) {
    setModernAssessmentResult(
      "review",
      "De Hoge Raad-uitspraak kan de procedure definitief hebben beëindigd. Bevestig dat geen verwijzing heeft plaatsgevonden en laat de procedurele mogelijkheid tot vermindering beoordelen.",
      "Na een definitieve uitspraak van de Hoge Raad zonder verwijzing wordt niet automatisch nog een termijn van zes weken opgeteld.",
    );
    return;
  }
  if (finalEnding === "withdrawn") {
    setModernAssessmentResult(
      "review",
      "De procedure is als ingetrokken gemarkeerd. Controleer welke uitspraak daardoor onherroepelijk is geworden en of nog een gewoon rechtsmiddel openstond.",
    );
    return;
  }
  const nextRemedyDeadline = getDeadlineAfterDays(finalDate, 42);
  if (
    ["district", "court-of-appeal"].includes(finalInstance) &&
    finalEnding === "no-appeal" &&
    nextRemedyDeadline >= getTodayDateValue()
  ) {
    setModernAssessmentResult(
      "positive",
      "Reguliere beoordeling mogelijk: de termijn voor het volgende gewone rechtsmiddel loopt nog.",
      `De indicatieve termijn loopt tot en met ${formatDate(nextRemedyDeadline)}. Controleer of beroep of cassatie daadwerkelijk openstond.`,
    );
    return;
  }
  if (
    ["district", "court-of-appeal"].includes(finalInstance) &&
    finalEnding === "no-appeal" &&
    nextRemedyDeadline < getTodayDateValue()
  ) {
    setModernAssessmentResult(
      "review",
      "De termijn voor het volgende gewone rechtsmiddel lijkt verstreken. Controleer of dit rechtsmiddel openstond en of de procedure onherroepelijk is; onderzoek daarna pas een eventuele andere verminderingsroute.",
      `De indicatieve termijn eindigde op ${formatDate(nextRemedyDeadline)}.`,
    );
    return;
  }
  setModernAssessmentResult(
    "review",
    "Nader juridisch onderzoek noodzakelijk: de opgegeven proceduregegevens bepalen niet automatisch of de aanslag onherroepelijk is of nog kan worden verminderd.",
  );
}
