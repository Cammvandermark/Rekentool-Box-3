"use strict";

function initializeFormalAssessment() {
  modernPreliminaryPanel.addEventListener("input", updateQuestionnaire);
  modernPreliminaryPanel.addEventListener("change", updateQuestionnaire);

  for (const name of [
    ...questionNames,
    "objection-submitted",
    "objection-timely",
    "general-terms-law",
    "excusable-delay",
    "appeal-open-2021",
    "objection-decision",
    "objection-in-progress",
    "objection-decision-deadline-passed",
    "tax-appeal-filed",
    "tax-appeal-timely",
  ]) {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.addEventListener("change", updateQuestionnaire);
    });
  }
  for (const input of [objectionSubmissionDate, assessmentDate, generalTermsLawDate, extensionUntil]) {
    input.addEventListener("input", updateQuestionnaire);
    input.addEventListener("change", updateQuestionnaire);
  }
  for (const input of document.querySelectorAll(
    "#procedure-questions input:not([type=\"radio\"]), #procedure-questions select",
  )) {
    input.addEventListener("input", updateQuestionnaire);
    input.addEventListener("change", updateQuestionnaire);
  }
}

const RELIEF_ACCESS_STATUS = {
  positive: "TOEGANG_RECHTSHERSTEL",
  negative: "GEEN_TOEGANG_RECHTSHERSTEL",
  review: "NADER_ONDERZOEK",
};
const FINALITY_STATUS = {
  yes: "ONHERROEPELIJK_JA",
  no: "ONHERROEPELIJK_NEE",
  unknown: "ONHERROEPELIJK_ONBEKEND",
};
const KERSTARREST_DATE = "2021-12-24";
const preliminaryPanel = document.querySelector("#preliminary-panel");
const modernPreliminaryPanel = document.querySelector("#modern-preliminary-panel");
const modernPreliminaryError = document.querySelector("#modern-preliminary-error");
const modernAssessmentDate = document.querySelector("#modern-assessment-date");
const modernExtensionDate = document.querySelector("#modern-extension-date");
const modernObjectionDate = document.querySelector("#modern-objection-date");
const modernAavRequestDate = document.querySelector("#modern-aav-request-date");
const modernObjectionAnnouncementDate = document.querySelector("#modern-objection-announcement-date");
const modernAppealDate = document.querySelector("#modern-appeal-date");
const modernAppealProcedureStatus = document.querySelector("#modern-appeal-procedure-status");
const modernAppealFinalDate = document.querySelector("#modern-appeal-final-date");
const modernAppealFinalInstance = document.querySelector("#modern-appeal-final-instance");
const modernAppealFinalEnding = document.querySelector("#modern-appeal-final-ending");
const modernAssessmentNotIssued = document.querySelector("#modern-assessment-not-issued");
const modernAssessmentIssuedFields = document.querySelector("#modern-assessment-issued-fields");
const modernAssessmentDateDeadline = document.querySelector("#modern-assessment-date-deadline");
const modernObjectionDeadlineDate = document.querySelector("#modern-objection-deadline-date");
const modernGeneralTermsLawDateField = document.querySelector("#modern-general-terms-law-date-field");
const modernGeneralTermsLawDate = document.querySelector("#modern-general-terms-law-date");
const modernAssessmentStatutoryDeadline = document.querySelector("#modern-assessment-statutory-deadline");
const modernExtensionDateField = document.querySelector("#modern-extension-date-field");
const modernLateObjectionFields = document.querySelector("#modern-late-objection-fields");
const modernFinalityQuestion = document.querySelector("#modern-finality-question");
const modernAavFields = document.querySelector("#modern-aav-fields");
const modernLateObjectionNotice = document.querySelector("#modern-late-objection-notice");
const modernNoObjectionNotice = document.querySelector("#modern-no-objection-notice");
const modernAavYear = document.querySelector("#modern-aav-year");
const modernAavDeadline = document.querySelector("#modern-aav-deadline");
const modernAavDateStatus = document.querySelector("#modern-aav-date-status");
const modernAavReasonField = document.querySelector("#modern-aav-reason-field");
const modernReliefFields = document.querySelector("#modern-relief-fields");
const modernProcedureFields = document.querySelector("#modern-procedure-fields");
const modernObjectionDateField = document.querySelector("#modern-objection-date-field");
const modernObjectionAdmissibilityBadge = document.querySelector("#modern-objection-admissibility-badge");
const modernLateAdmissibilityBadge = document.querySelector("#modern-late-admissibility-badge");
const modernObjectionDecisionFields = document.querySelector("#modern-objection-decision-fields");
const modernObjectionRulingFields = document.querySelector("#modern-objection-ruling-fields");
const modernAppealDateField = document.querySelector("#modern-appeal-date-field");
const modernAppealProcedureFields = document.querySelector("#modern-appeal-procedure-fields");
const modernAppealFinalFields = document.querySelector("#modern-appeal-final-fields");
const modernAssessmentResult = document.querySelector("#modern-assessment-result");
const modernAssessmentNote = document.querySelector("#modern-assessment-note");
const preliminaryYear = document.querySelector("#preliminary-year");
const preliminaryError = document.querySelector("#preliminary-error");
const assessmentDateQuestion = document.querySelector("#assessment-date-question");
const assessmentDate = document.querySelector("#assessment-date");
const assessmentDateDisplay = document.querySelector("#assessment-date-display");
const assessmentDateText = document.querySelector("#assessment-date-text");
const extensionDateField = document.querySelector("#extension-date-field");
const extensionUntil = document.querySelector("#extension-until");
const objectionSubmittedQuestion = document.querySelector("#objection-submitted-question");
const timelyObjectionQuestion = document.querySelector("#timely-objection-question");
const objectionSubmissionDateField = document.querySelector("#objection-submission-date-field");
const objectionSubmissionDate = document.querySelector("#objection-submission-date");
const objectionAdmissibilityBadge = document.querySelector("#objection-admissibility-badge");
const objectionLateAdmissibilityBadge = document.querySelector("#objection-late-admissibility-badge");
const excusableDelayQuestion = document.querySelector("#excusable-delay-question");
const objectionDeadline = document.querySelector("#objection-deadline");
const objectionDeadlineDate = document.querySelector("#objection-deadline-date");
const generalTermsLawDateField = document.querySelector("#general-terms-law-date-field");
const generalTermsLawDate = document.querySelector("#general-terms-law-date");
const finalityQuestion = document.querySelector("#finality-question");
const finalityReviewNotice = document.querySelector("#finality-review-notice");
const procedureQuestions = document.querySelector("#procedure-questions");
const noObjectionDecisionQuestions = document.querySelector("#no-objection-decision-questions");
const yesObjectionDecisionQuestions = document.querySelector("#yes-objection-decision-questions");
const taxAppealQuestions = document.querySelector("#tax-appeal-questions");
const noTaxAppealQuestions = document.querySelector("#no-tax-appeal-questions");
const objectionDecisionDeadlineDisplay = document.querySelector("#objection-decision-deadline-display");
const objectionOpenNotice = document.querySelector("#objection-open-notice");
const objectionPendingReason = document.querySelector("#objection-pending-reason");
const objectionPendingOtherField = document.querySelector("#objection-pending-other-field");
const objectionPendingOther = document.querySelector("#objection-pending-other");
const objectionAdvisoryCommittee = document.querySelector("#objection-advisory-committee");
const objectionMassalStatus = document.querySelector("#objection-massal-status");
const objectionDecisionDate = document.querySelector("#objection-decision-date");
const objectionAnnouncementDate = document.querySelector("#objection-announcement-date");
const objectionDecisionOutcome = document.querySelector("#objection-decision-outcome");
const taxAppealDate = document.querySelector("#tax-appeal-date");
const appealDeadlineDisplay = document.querySelector("#appeal-deadline-display");
const noAppealDeadlineDisplay = document.querySelector("#no-appeal-deadline-display");
const appealPendingNotice = document.querySelector("#appeal-pending-notice");
const courtDecisionNotice = document.querySelector("#court-decision-notice");
const appealStageDateField = document.querySelector("#appeal-stage-date-field");
const taxAppealStageDate = document.querySelector("#tax-appeal-stage-date");
const appealFinalOutcomeFieldset = document.querySelector("#appeal-final-outcome-fieldset");
const taxAppealFinalOutcome = document.querySelector("#tax-appeal-final-outcome");
const appealEndingField = document.querySelector("#appeal-ending-field");
const taxAppealEnding = document.querySelector("#tax-appeal-ending");
const appealFinalDecisionDateField = document.querySelector("#appeal-final-decision-date-field");
const taxAppealFinalDecisionDate = document.querySelector("#tax-appeal-final-decision-date");
const appealFinalDateLabel = document.querySelector("#appeal-final-date-label");
const appealTimeRunningNotice = document.querySelector("#appeal-time-running-notice");
const appealTimeExpiredNotice = document.querySelector("#appeal-time-expired-notice");
const calculationSection = document.querySelector("#calculation-section");
const accessResult = document.querySelector("#access-result");
const accessResultProcedureNote = document.querySelector("#access-result-procedure-note");
const accessResultExplanation = document.querySelector("#access-result-explanation");
const formalLawQuestions = document.querySelector("#formal-law-questions");
const legalConclusion = document.querySelector(".legal-conclusion");
const questionNames = [
  "assessment-issued",
  "deadline-expired",
  "extension-granted",
  "legal-exception",
];
let preliminaryByYear = {};
function setReliefAccessStatus(statusValue) {
  const root = document.documentElement;
  if (root.dataset.reliefAccessStatus === statusValue) return;
  root.dataset.reliefAccessStatus = statusValue;
  root.dispatchEvent(
    new CustomEvent("box3:relief-access-status", {
      detail: { status: statusValue },
    }),
  );
}

function isPreliminaryYear(year) {
  const numericYear = Number(year);
  return numericYear >= 2017 && numericYear <= 2020;
}

function isModernAssessmentYear(year) {
  return year === "2021" || year === "2022";
}

function isCalculationYear(year) {
  const numericYear = Number(year);
  return numericYear >= 2017 && numericYear <= 2026;
}

function loadPreliminaryAnswers() {
  try {
    const saved = sessionStorage.getItem(PRELIMINARY_STORAGE_KEY);
    if (saved === null) return;
    const parsed = JSON.parse(saved);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Ongeldig formaat voor de opgeslagen voorvragen.");
    }
    preliminaryByYear = parsed;
  } catch (error) {
    showError(`Voorvragen konden niet worden geladen: ${error.message}`);
  }
}

function getYearAnswers(year) {
  return preliminaryByYear[year] || {};
}

function saveYearAnswers(year, answers) {
  preliminaryByYear[year] = answers;
  try {
    sessionStorage.setItem(
      PRELIMINARY_STORAGE_KEY,
      JSON.stringify(preliminaryByYear),
    );
    preliminaryError.hidden = true;
    modernPreliminaryError.hidden = true;
  } catch (error) {
    const target = isModernAssessmentYear(year)
      ? modernPreliminaryError
      : preliminaryError;
    target.hidden = false;
    target.textContent =
      `Voorvragen konden niet worden opgeslagen: ${error.message}`;
  }
}

function selectedAnswer(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function restoreAnswer(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = false;
  });
  if (typeof value !== "string" || value === "") return;
  const input = document.querySelector(
    `input[name="${name}"][value="${value}"]`,
  );
  if (input) input.checked = true;
}

function renderPreliminary() {
  const year = yearSelect.value;
  const legacyYear = isPreliminaryYear(year);
  const modernYear = isModernAssessmentYear(year);
  const calculationYearSelected = isCalculationYear(year);
  preliminaryPanel.hidden = !legacyYear;
  modernPreliminaryPanel.hidden = !modernYear;
  const answers = legacyYear || modernYear ? getYearAnswers(year) : {};
  loadCalculationInputs(year);
  calculationSection.hidden = !calculationYearSelected;
  if (modernYear) {
    renderModernAssessment(answers, year);
    renderCalculation();
    return;
  }
  if (!legacyYear) {
    setReliefAccessStatus(RELIEF_ACCESS_STATUS.review);
    renderCalculation();
    return;
  }

  preliminaryYear.textContent = year;
  for (const name of questionNames) restoreAnswer(name, answers[name]);
  restoreAnswer("objection-submitted", answers["objection-submitted"]);
  restoreAnswer("objection-timely", answers["objection-timely"]);
  restoreAnswer("general-terms-law", answers.generalTermsLawApplied || "");
  restoreAnswer("excusable-delay", answers["excusable-delay"]);
  restoreAnswer("appeal-open-2021", answers["appeal-open-2021"]);
  for (const name of [
    "objection-decision",
    "objection-in-progress",
    "objection-decision-deadline-passed",
    "tax-appeal-filed",
    "tax-appeal-timely",
  ]) {
    restoreAnswer(name, answers[name]);
  }
  assessmentDate.value = answers.assessmentDate || "";
  generalTermsLawDate.value = answers.generalTermsLawDate || "";
  extensionUntil.value = answers.extensionUntil || "";
  objectionSubmissionDate.value = answers.objectionSubmissionDate || "";
  objectionAdvisoryCommittee.value = answers.objectionAdvisoryCommittee || "unknown";
  objectionMassalStatus.value = answers.objectionMassalStatus || "unknown";
  objectionPendingReason.value = answers.objectionPendingReason || "";
  objectionPendingOther.value = answers.objectionPendingOther || "";
  objectionDecisionDate.value = answers.objectionDecisionDate || "";
  objectionAnnouncementDate.value = answers.objectionAnnouncementDate || "";
  objectionDecisionOutcome.value = answers.objectionDecisionOutcome || "";
  taxAppealDate.value = answers.taxAppealDate || "";
  taxAppealStageDate.value = answers.taxAppealStageDate || "";
  taxAppealFinalOutcome.value = answers.taxAppealFinalOutcome || "";
  taxAppealEnding.value = answers.taxAppealEnding || "";
  taxAppealFinalDecisionDate.value = answers.taxAppealFinalDecisionDate || "";
  document.querySelector("#tax-appeal-subject").value = answers.taxAppealSubject || "";
  document.querySelector("#tax-appeal-status").value = answers.taxAppealStatus || "";

  const issued = answers["assessment-issued"];
  assessmentDateQuestion.hidden = issued !== "yes";
  formalLawQuestions.hidden = issued !== "no";
  extensionDateField.hidden =
    issued !== "no" || answers["extension-granted"] !== "yes";
  extensionUntil.required = !extensionDateField.hidden;
  assessmentDate.required = issued === "yes";
  const validAssessmentDate = Boolean(formatDate(answers.assessmentDate || ""));
  const latestSubmissionDate = getAssessmentObjectionDeadline(
    answers.assessmentDate,
    answers.generalTermsLawApplied,
    answers.generalTermsLawDate,
  );
  const baseObjectionDeadline = validAssessmentDate
    ? getDeadlineAfterDays(answers.assessmentDate, 42)
    : "";
  objectionDeadline.hidden = issued !== "yes" || !validAssessmentDate;
  generalTermsLawDateField.hidden =
    issued !== "yes" ||
    !validAssessmentDate ||
    answers.generalTermsLawApplied !== "yes";
  generalTermsLawDate.required = !generalTermsLawDateField.hidden;
  generalTermsLawDate.min = baseObjectionDeadline;
  generalTermsLawDate.max = baseObjectionDeadline
    ? getDeadlineAfterDays(baseObjectionDeadline, 7)
    : "";
  generalTermsLawDate.setAttribute(
    "aria-invalid",
    String(
      !generalTermsLawDateField.hidden &&
      Boolean(formatDate(answers.generalTermsLawDate || "")) &&
      !latestSubmissionDate,
    ),
  );
  objectionSubmittedQuestion.hidden =
    issued !== "yes" || !validAssessmentDate || !latestSubmissionDate;
  const objectionSubmitted = answers["objection-submitted"];
  timelyObjectionQuestion.hidden =
    issued !== "yes" ||
    objectionSubmitted !== "yes" ||
    !validAssessmentDate ||
    !latestSubmissionDate;
  const timelyObjection = answers["objection-timely"];
  objectionSubmissionDateField.hidden = timelyObjectionQuestion.hidden;
  excusableDelayQuestion.hidden =
    objectionSubmissionDateField.hidden || timelyObjection !== "no";
  if (excusableDelayQuestion.hidden) {
    document.querySelectorAll('input[name="excusable-delay"]').forEach((input) => {
      input.checked = false;
    });
  }
  objectionSubmissionDate.required = !objectionSubmissionDateField.hidden;
  objectionSubmissionDate.max =
    timelyObjection === "yes" ? latestSubmissionDate : "";
  objectionSubmissionDate.min =
    timelyObjection === "no"
      ? getDateAfter(latestSubmissionDate)
      : "";
  const submissionDate = answers.objectionSubmissionDate || "";
  const validSubmissionDate = Boolean(formatDate(submissionDate));
  const submissionDateOutOfRange =
    validSubmissionDate &&
    Boolean(latestSubmissionDate) &&
    ((timelyObjection === "yes" && submissionDate > latestSubmissionDate) ||
      (timelyObjection === "no" && submissionDate <= latestSubmissionDate));
  const objectionInadmissible =
    validSubmissionDate &&
    !submissionDateOutOfRange &&
    timelyObjection === "no" &&
    answers["excusable-delay"] === "no";
  objectionAdmissibilityBadge.textContent = objectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  objectionAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    objectionInadmissible,
  );
  objectionAdmissibilityBadge.hidden =
    objectionSubmissionDateField.hidden ||
    timelyObjection !== "yes" ||
    !validSubmissionDate ||
    submissionDateOutOfRange;
  objectionLateAdmissibilityBadge.hidden =
    objectionSubmissionDateField.hidden ||
    timelyObjection !== "no" ||
    !validSubmissionDate ||
    submissionDateOutOfRange ||
    !["yes", "no"].includes(answers["excusable-delay"]);
  objectionLateAdmissibilityBadge.textContent = objectionInadmissible
    ? "Niet ontvankelijk"
    : "Ontvankelijk";
  objectionLateAdmissibilityBadge.classList.toggle(
    "admissibility-badge-negative",
    objectionInadmissible,
  );
  objectionSubmissionDate.setAttribute(
    "aria-invalid",
    String(submissionDateOutOfRange),
  );
  renderObjectionDeadline(validAssessmentDate);
  const validObjectionDetails =
    Boolean(latestSubmissionDate) &&
    (objectionSubmitted === "no" ||
      (validSubmissionDate && !submissionDateOutOfRange));
  renderProcedureQuestions(
    answers,
    issued,
    objectionSubmitted,
    validAssessmentDate,
    validObjectionDetails,
  );
  renderFinality(
    answers,
    issued,
    objectionSubmitted,
    validAssessmentDate,
    validObjectionDetails,
  );
  legalConclusion.classList.toggle(
    "legal-conclusion-strong",
    blocksRegularAssessment(answers),
  );
  legalConclusion.hidden = !blocksRegularAssessment(answers);
  renderCalculation();
}

function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return "";
  }
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function toDateValue(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getTodayDateValue() {
  const date = new Date();
  return toDateValue(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
  );
}

function getAppealStartDate(decisionDate, announcementDate) {
  if (!formatDate(decisionDate) || !formatDate(announcementDate)) return "";
  return decisionDate >= announcementDate ? decisionDate : announcementDate;
}

function getAppealDeadline(decisionDate, announcementDate) {
  const startDate = getAppealStartDate(decisionDate, announcementDate);
  return startDate ? getDeadlineAfterDays(startDate, 42) : "";
}

function getDeadlineAfterDays(startDate, days) {
  if (!formatDate(startDate)) return "";
  const [year, month, day] = startDate.split("-").map(Number);
  return toDateValue(
    new Date(Date.UTC(year, month - 1, day) + days * 24 * 60 * 60 * 1000),
  );
}

function getAssessmentObjectionDeadline(assessmentDate, termsApplied, manualDate) {
  const baseDeadline = getDeadlineAfterDays(assessmentDate, 42);
  if (!baseDeadline) return "";
  if (termsApplied === "no") return baseDeadline;
  const latestAllowedDate = getDeadlineAfterDays(baseDeadline, 7);
  return termsApplied === "yes" &&
    formatDate(manualDate || "") &&
    manualDate >= baseDeadline &&
    manualDate <= latestAllowedDate
    ? manualDate
    : "";
}

function inferFinalityStatus(answers) {
  if (answers["assessment-issued"] === "no") return FINALITY_STATUS.no;
  if (
    answers["assessment-issued"] !== "yes" ||
    !formatDate(answers.assessmentDate || "")
  ) {
    return FINALITY_STATUS.unknown;
  }
  if (answers.assessmentDate >= KERSTARREST_DATE) {
    return FINALITY_STATUS.no;
  }

  const objectionDeadline = getLatestObjectionSubmissionDate(answers);
  if (!objectionDeadline) return FINALITY_STATUS.unknown;
  if (objectionDeadline >= KERSTARREST_DATE) return FINALITY_STATUS.no;

  if (answers["objection-submitted"] === "no") {
    return FINALITY_STATUS.yes;
  }
  if (answers["objection-submitted"] !== "yes") {
    return FINALITY_STATUS.unknown;
  }

  const submissionDate = answers.objectionSubmissionDate || "";
  if (!formatDate(submissionDate)) return FINALITY_STATUS.unknown;
  if (!isObjectionSubmissionValid(answers)) {
    return FINALITY_STATUS.unknown;
  }
  if (submissionDate > KERSTARREST_DATE) {
    return answers["excusable-delay"] === "no"
      ? FINALITY_STATUS.yes
      : FINALITY_STATUS.unknown;
  }
  if (
    answers["objection-timely"] === "no" &&
    answers["excusable-delay"] === "no"
  ) {
    return FINALITY_STATUS.yes;
  }
  if (
    answers["objection-timely"] !== "yes" &&
    answers["excusable-delay"] !== "yes"
  ) {
    return FINALITY_STATUS.unknown;
  }

  if (answers["objection-decision"] === "no") {
    return answers["objection-in-progress"] === "yes"
      ? FINALITY_STATUS.no
      : FINALITY_STATUS.unknown;
  }
  if (answers["objection-decision"] !== "yes") {
    return FINALITY_STATUS.unknown;
  }

  const announcementDate = answers.objectionAnnouncementDate || "";
  if (!formatDate(announcementDate)) return FINALITY_STATUS.unknown;
  if (announcementDate > KERSTARREST_DATE) return FINALITY_STATUS.no;

  const appealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    announcementDate,
  );
  if (!appealDeadline) return FINALITY_STATUS.unknown;
  if (appealDeadline >= KERSTARREST_DATE) return FINALITY_STATUS.no;
  if (answers["tax-appeal-filed"] === "no") {
    return FINALITY_STATUS.yes;
  }
  if (answers["tax-appeal-filed"] !== "yes") {
    return FINALITY_STATUS.unknown;
  }

  const taxAppealDateValue = answers.taxAppealDate || "";
  if (!formatDate(taxAppealDateValue)) return FINALITY_STATUS.unknown;
  const appealTimeliness = answers["tax-appeal-timely"];
  if (taxAppealDateValue > KERSTARREST_DATE) {
    return appealTimeliness === "no"
      ? FINALITY_STATUS.yes
      : FINALITY_STATUS.unknown;
  }
  if (appealTimeliness === "no") {
    return taxAppealDateValue > appealDeadline
      ? FINALITY_STATUS.yes
      : FINALITY_STATUS.unknown;
  }
  if (appealTimeliness !== "yes" || taxAppealDateValue > appealDeadline) {
    return FINALITY_STATUS.unknown;
  }
  if (answers.taxAppealStatus === "ongoing") {
    return FINALITY_STATUS.no;
  }
  if (["higher-appeal", "cassation"].includes(answers.taxAppealStatus)) {
    const stageDate = answers.taxAppealStageDate || "";
    return formatDate(stageDate) && stageDate <= KERSTARREST_DATE
      ? FINALITY_STATUS.no
      : FINALITY_STATUS.unknown;
  }
  if (answers.taxAppealStatus !== "completed") return FINALITY_STATUS.unknown;

  const endingDate = answers.taxAppealFinalDecisionDate || "";
  if (!formatDate(endingDate)) return FINALITY_STATUS.unknown;
  switch (answers.taxAppealEnding) {
    case "supreme-court-final":
    case "withdrawn":
      return endingDate <= KERSTARREST_DATE
        ? FINALITY_STATUS.yes
        : FINALITY_STATUS.no;
    case "district-no-appeal":
    case "appeals-court-no-cassation": {
      if (endingDate > KERSTARREST_DATE) return FINALITY_STATUS.no;
      const lastRemedyDeadline = getDeadlineAfterDays(endingDate, 42);
      return lastRemedyDeadline >= KERSTARREST_DATE
        ? FINALITY_STATUS.no
        : FINALITY_STATUS.yes;
    }
    case "supreme-court-referral":
      return FINALITY_STATUS.no;
    default:
      return FINALITY_STATUS.unknown;
  }
}

function canAskManualFinality(answers, objectionSubmitted, validAssessmentDate, validObjectionDetails) {
  const objectionDeadline = getLatestObjectionSubmissionDate(answers);
  if (
    answers["assessment-issued"] !== "yes" ||
    !validAssessmentDate ||
    !objectionDeadline ||
    !["yes", "no"].includes(objectionSubmitted)
  ) {
    return false;
  }
  if (objectionSubmitted === "no") return true;
  return (
    validObjectionDetails &&
    isObjectionSubmissionValid(answers) &&
    (answers["objection-timely"] === "yes" ||
      (answers["objection-timely"] === "no" &&
        ["yes", "no"].includes(answers["excusable-delay"])))
  );
}

function getFinalityStatus(answers) {
  if (answers["appeal-open-2021"] === "yes") return FINALITY_STATUS.yes;
  if (answers["appeal-open-2021"] === "no") return FINALITY_STATUS.no;
  return inferFinalityStatus(answers);
}

function getObjectionDecisionDeadlines(answers) {
  if (!formatDate(answers.assessmentDate || "")) return null;
  if (answers.objectionMassalStatus === "yes") {
    return {
      message:
        "De beslistermijn is opgeschort als dit bezwaar daadwerkelijk onder de aanwijzing massaal bezwaar valt. De termijn herleeft volgens de toepasselijke regeling na de collectieve uitspraak; controleer de aanwijzing en de dossierstatus.",
    };
  }
  const objectionDeadline = getLatestObjectionSubmissionDate(answers);
  if (!objectionDeadline) return null;
  const standardDeadline = getDeadlineAfterDays(objectionDeadline, 42);
  const committeeDeadline = getDeadlineAfterDays(objectionDeadline, 84);
  if (answers.objectionAdvisoryCommittee === "yes") {
    return {
      message: `Indicatieve hoofdregel met adviescommissie: ${formatDate(committeeDeadline)} (twaalf weken na het einde van de bezwaartermijn; de Algemene termijnenwet is niet automatisch toegepast).`,
    };
  }
  if (answers.objectionAdvisoryCommittee === "no") {
    return {
      message: `Indicatieve hoofdregel: ${formatDate(standardDeadline)} (zes weken na het einde van de bezwaartermijn; de Algemene termijnenwet is niet automatisch toegepast).`,
    };
  }
  return {
    message: `Indicatieve hoofdregel: ${formatDate(standardDeadline)} zonder adviescommissie of ${formatDate(committeeDeadline)} met adviescommissie. Controleer welke termijn geldt en of verdaging, verder uitstel of opschorting van toepassing is.`,
  };
}

function renderProcedureQuestions(answers, issued, objectionSubmitted, validAssessmentDate, validObjectionDetails) {
  const showOtherReason =
    !noObjectionDecisionQuestions.hidden && answers.objectionPendingReason === "other";
  objectionPendingOtherField.hidden = !showOtherReason;
  const objectionDecisionDeadline = getObjectionDecisionDeadlines(answers);
  objectionDecisionDeadlineDisplay.hidden =
    noObjectionDecisionQuestions.hidden || !objectionDecisionDeadline;
  objectionDecisionDeadlineDisplay.textContent =
    objectionDecisionDeadline?.message || "";

  const appealFiled = answers["tax-appeal-filed"];
  taxAppealQuestions.hidden = yesObjectionDecisionQuestions.hidden || appealFiled !== "yes";
  noTaxAppealQuestions.hidden = yesObjectionDecisionQuestions.hidden || appealFiled !== "no";
  const appealStartDate = getAppealStartDate(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const appealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const formattedAppealDeadline = appealDeadline ? formatDate(appealDeadline) : "";
  appealDeadlineDisplay.hidden = taxAppealQuestions.hidden || !formattedAppealDeadline;
  appealDeadlineDisplay.textContent = formattedAppealDeadline
    ? `Indicatieve uiterste datum beroep (zes weken vanaf ${formatDate(appealStartDate)}, zonder automatische toepassing van de Algemene termijnenwet): ${formattedAppealDeadline}.`
    : "Vul de dagtekening en datum van bekendmaking in om de beroepstermijn te berekenen.";
  const filedAppealDate = answers.taxAppealDate || "";
  const calculatedTimeliness =
    formatDate(filedAppealDate) && appealDeadline
      ? filedAppealDate <= appealDeadline
      : "";
  const selectedTimeliness = answers["tax-appeal-timely"];
  const appealTimelinessConflict =
    calculatedTimeliness !== "" &&
    ((calculatedTimeliness && selectedTimeliness === "no") ||
      (!calculatedTimeliness && selectedTimeliness === "yes"));
  appealDeadlineDisplay.classList.toggle("deadline-conflict", appealTimelinessConflict);
  if (appealTimelinessConflict) {
    appealDeadlineDisplay.textContent +=
      " Let op: dit wijkt af van het handmatig gekozen antwoord; controleer de datum en eventuele bijzondere omstandigheden.";
  }
  const appealStatus = answers.taxAppealStatus;
  taxAppealDate.required = !taxAppealQuestions.hidden;
  appealPendingNotice.hidden =
    taxAppealQuestions.hidden ||
    !["ongoing", "higher-appeal", "cassation"].includes(appealStatus);
  appealStageDateField.hidden =
    taxAppealQuestions.hidden ||
    !["higher-appeal", "cassation"].includes(appealStatus);
  taxAppealStageDate.required = !appealStageDateField.hidden;
  courtDecisionNotice.hidden =
    taxAppealQuestions.hidden || appealStatus !== "court-decided";
  appealFinalOutcomeFieldset.hidden =
    taxAppealQuestions.hidden || appealStatus !== "completed";
  appealEndingField.hidden =
    taxAppealQuestions.hidden || appealStatus !== "completed";
  appealFinalDecisionDateField.hidden =
    taxAppealQuestions.hidden || appealStatus !== "completed";
  taxAppealEnding.required = !appealEndingField.hidden;
  const endingDateRequired =
    !appealFinalDecisionDateField.hidden &&
    taxAppealEnding.value !== "other" &&
    taxAppealEnding.value !== "";
  taxAppealFinalDecisionDate.required = endingDateRequired;
  appealFinalDateLabel.textContent =
    taxAppealEnding.value === "withdrawn"
      ? "Datum waarop het rechtsmiddel is ingetrokken"
      : taxAppealEnding.value === "supreme-court-final"
        ? "Datum uitspraak Hoge Raad"
        : taxAppealEnding.value === "supreme-court-referral"
          ? "Datum uitspraak Hoge Raad waarbij is verwezen"
          : "Datum bekendmaking uitspraak rechtbank of gerechtshof";
  const noAppealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const noAppealDeadlineFormatted = noAppealDeadline ? formatDate(noAppealDeadline) : "";
  noAppealDeadlineDisplay.hidden = noTaxAppealQuestions.hidden || !noAppealDeadlineFormatted;
  noAppealDeadlineDisplay.textContent = noAppealDeadlineFormatted
    ? `Berekende uiterste datum beroep (vanaf de juridisch bepalende datum): ${noAppealDeadlineFormatted}.`
    : "Vul de dagtekening en datum van bekendmaking in om te controleren of de beroepstermijn is verstreken.";
  const today = getTodayDateValue();
  const appealTermExpired = Boolean(noAppealDeadline && today > noAppealDeadline);
  appealTimeRunningNotice.hidden =
    noTaxAppealQuestions.hidden || !noAppealDeadline || appealTermExpired;
  appealTimeExpiredNotice.hidden =
    noTaxAppealQuestions.hidden || !appealTermExpired;
  procedureQuestions.hidden = true;
}

function renderFinality(answers, issued, objectionSubmitted, validAssessmentDate, validObjectionDetails) {
  const showFinality = canAskManualFinality(
    answers,
    objectionSubmitted,
    validAssessmentDate,
    validObjectionDetails,
  );
  const manualFinalityAnswer = answers["appeal-open-2021"];
  const finalityStatus = manualFinalityAnswer === "yes"
    ? FINALITY_STATUS.yes
    : manualFinalityAnswer === "no"
      ? FINALITY_STATUS.no
      : FINALITY_STATUS.unknown;
  finalityQuestion.hidden = !showFinality;
  finalityReviewNotice.hidden = true;
  answers["finality-status"] = finalityStatus;
  const outcome = getLegalOutcome(answers);
  setReliefAccessStatus(
    RELIEF_ACCESS_STATUS[outcome?.status || "review"],
  );
  accessResult.hidden = !outcome;
  accessResult.className = `access-result${outcome ? ` access-result-${outcome.status}` : ""}`;
  accessResult.textContent = outcome?.message || "";
  accessResultProcedureNote.hidden = !outcome?.procedureNote;
  accessResultProcedureNote.textContent = outcome?.procedureNote || "";
  accessResultExplanation.hidden =
    !outcome || outcome.status !== "negative" || objectionSubmitted !== "no";
}

function hasUnresolvedAppealFinality(answers) {
  if (
    answers["objection-decision"] !== "yes" ||
    answers["tax-appeal-filed"] !== "yes"
  ) {
    return false;
  }
  const appealDeadline = getAppealDeadline(
    answers.objectionDecisionDate || "",
    answers.objectionAnnouncementDate || "",
  );
  const appealDate = answers.taxAppealDate || "";
  if (
    !appealDeadline ||
    appealDeadline >= KERSTARREST_DATE ||
    !formatDate(appealDate)
  ) {
    return false;
  }
  const selectedTimeliness = answers["tax-appeal-timely"];
  const calculatedTimeliness = appealDate <= appealDeadline;
  return (
    selectedTimeliness === "pending" ||
    (selectedTimeliness === "yes" && !calculatedTimeliness) ||
    (selectedTimeliness === "no" && calculatedTimeliness)
  );
}

function hasAccessToRelief(answers) {
  return getLegalOutcome(answers)?.status === "positive";
}

function getLegalOutcome(answers) {
  if (
    answers["assessment-issued"] !== "yes" ||
    !formatDate(answers.assessmentDate || "")
  ) {
    return null;
  }
  const objectionSubmitted = answers["objection-submitted"];
  if (!["yes", "no"].includes(objectionSubmitted)) return null;
  if (
    objectionSubmitted === "yes" &&
    !isObjectionSubmissionValid(answers)
  ) {
    return {
      status: "review",
      message:
        "Nader juridisch onderzoek noodzakelijk. Beantwoord eerst de vragen over de tijdigheid en indieningsdatum van het bezwaar.",
    };
  }
  const manualFinalityAnswer = answers["appeal-open-2021"];
  if (!["yes", "no"].includes(manualFinalityAnswer)) {
    return {
      status: "review",
      message:
        "Beantwoord vraag 5: stond de aanslag op 24 december 2021 al onherroepelijk vast?",
    };
  }

  if (manualFinalityAnswer === "yes") {
    return {
      status: "negative",
      message:
        "Geen toegang tot Wet rechtsherstel box 3. Ook geen recht op Ambtshalve vermindering.",
    };
  }
  return {
    status: "positive",
    message: "Wel toegang tot Wet rechtsherstel box 3.",
  };
}

function isObjectionSubmissionValid(answers) {
  const latestDate = getLatestObjectionSubmissionDate(answers);
  if (!latestDate) return false;
  if (answers["objection-submitted"] === "no") return true;
  if (answers["objection-submitted"] !== "yes") return false;
  if (!["yes", "no"].includes(answers["objection-timely"])) return false;
  if (
    answers["objection-timely"] === "no" &&
    !["yes", "no"].includes(answers["excusable-delay"])
  ) {
    return false;
  }
  const submittedDate = answers.objectionSubmissionDate || "";
  if (!formatDate(submittedDate)) return false;
  return answers["objection-timely"] === "yes"
    ? submittedDate <= latestDate
    : submittedDate > latestDate;
}

function renderObjectionDeadline(showDeadline) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(assessmentDate.value);
  if (!showDeadline || !match) {
    assessmentDateDisplay.hidden = true;
    assessmentDateText.textContent = "";
    objectionDeadline.hidden = true;
    objectionDeadlineDate.textContent = "";
    return;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    assessmentDateDisplay.hidden = true;
    assessmentDateText.textContent = "";
    objectionDeadline.hidden = true;
    objectionDeadlineDate.textContent = "";
    return;
  }
  const deadlineValue = getDeadlineAfterDays(assessmentDate.value, 42);
  const deadline = new Date(`${deadlineValue}T00:00:00Z`);
  const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  assessmentDateText.textContent = dateFormatter.format(date);
  assessmentDateDisplay.hidden = false;
  objectionDeadlineDate.textContent = dateFormatter.format(deadline);
  objectionDeadline.hidden = false;
}

function getLatestObjectionSubmissionDate(answers) {
  return getAssessmentObjectionDeadline(
    answers.assessmentDate || "",
    answers.generalTermsLawApplied || "",
    answers.generalTermsLawDate || "",
  );
}

function getDateAfter(dateValue) {
  if (!formatDate(dateValue || "")) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day) + 24 * 60 * 60 * 1000);
  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
    String(nextDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function blocksRegularAssessment(answers) {
  return (
    answers["deadline-expired"] === "yes" &&
    answers["extension-granted"] === "no" &&
    answers["legal-exception"] === "no"
  );
}

function updateModernQuestionnaire() {
  const year = yearSelect.value;
  const issued = selectedAnswer("modern-assessment-issued");
  const extension = selectedAnswer("modern-extension-status");
  const reliefApplied = selectedAnswer("modern-relief-applied");
  const generalTermsLawApplied = selectedAnswer("modern-general-terms-law");
  const generalTermsLawDateValue = modernGeneralTermsLawDate.value;
  const objectionDeadline = getAssessmentObjectionDeadline(
    modernAssessmentDate.value,
    generalTermsLawApplied,
    generalTermsLawDateValue,
  );
  const procedureActive =
    issued === "yes" &&
    Boolean(objectionDeadline) &&
    ["yes", "no"].includes(reliefApplied);
  const objectionStatus = selectedAnswer("modern-objection-status");
  const objectionDate = modernObjectionDate.value;
  const objectionIsLate =
    Boolean(formatDate(objectionDate)) &&
    Boolean(objectionDeadline) &&
    objectionDate > objectionDeadline;
  const objectionDeadlinePassed =
    Boolean(objectionDeadline) && objectionDeadline < getTodayDateValue();
  const aavRoute =
    issued === "yes" &&
    ["yes", "no"].includes(reliefApplied) &&
    ((objectionStatus === "no" && objectionDeadlinePassed) ||
      (objectionStatus === "yes" &&
        objectionIsLate &&
        selectedAnswer("modern-late-objection") === "no"));
  const aavRequestDate = modernAavRequestDate.value;
  const aavWithinDeadline =
    aavRoute &&
    Boolean(formatDate(aavRequestDate)) &&
    aavRequestDate >= modernAssessmentDate.value &&
    aavRequestDate <= `${Number(year) + 5}-12-31`;
  const objectionOutcome = selectedAnswer("modern-objection-outcome");
  const modernFinalityStatus = selectedAnswer("modern-finality-status");
  const appealStatus = selectedAnswer("modern-appeal-status");
  const appealDate = modernAppealDate.value;
  const appealProcedureStatus = modernAppealProcedureStatus.value;
  const answers = {
    modernAssessmentIssued: issued,
    modernAssessmentDate: issued === "yes" ? modernAssessmentDate.value : "",
    modernGeneralTermsLaw: issued === "yes" ? generalTermsLawApplied : "",
    modernGeneralTermsLawDate:
      issued === "yes" && generalTermsLawApplied === "yes"
        ? generalTermsLawDateValue
        : "",
    modernExtensionStatus: issued === "no" ? extension : "",
    modernExtensionDate:
      issued === "no" && extension === "yes" ? modernExtensionDate.value : "",
    modernReliefApplied:
      issued === "yes" ? reliefApplied : "",
    modernObjectionStatus:
      procedureActive ? objectionStatus : "",
    modernFinalityStatus:
      procedureActive && ["yes", "no"].includes(objectionStatus)
        ? modernFinalityStatus
        : "",
    modernObjectionDate:
      procedureActive && objectionStatus === "yes"
        ? objectionDate
        : "",
    modernLateObjection:
      procedureActive && objectionIsLate
        ? selectedAnswer("modern-late-objection")
        : "",
    modernObjectionOutcome:
      procedureActive &&
      objectionStatus === "yes" &&
      formatDate(objectionDate) &&
      (!objectionIsLate || selectedAnswer("modern-late-objection") === "yes")
        ? objectionOutcome
        : "",
    modernObjectionAnnouncementDate:
      procedureActive && objectionOutcome === "decided"
        ? modernObjectionAnnouncementDate.value
        : "",
    modernAppealStatus:
      procedureActive && objectionOutcome === "decided" ? appealStatus : "",
    modernAppealDate:
      procedureActive && objectionOutcome === "decided" && appealStatus === "yes"
        ? appealDate
        : "",
    modernAppealProcedureStatus:
      procedureActive &&
      objectionOutcome === "decided" &&
      appealStatus === "yes" &&
      formatDate(appealDate)
        ? appealProcedureStatus
        : "",
    modernAppealFinalDate:
      procedureActive &&
      ["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
        .includes(appealProcedureStatus)
        ? modernAppealFinalDate.value
        : "",
    modernAppealFinalInstance:
      procedureActive &&
      ["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
        .includes(appealProcedureStatus)
        ? modernAppealFinalInstance.value
        : "",
    modernAppealFinalEnding:
      procedureActive &&
      ["district", "court-of-appeal", "supreme-court", "withdrawn", "other"]
        .includes(appealProcedureStatus)
        ? modernAppealFinalEnding.value
        : "",
    modernAavRequestDate: aavRoute ? aavRequestDate : "",
    modernAavCounterproof:
      aavWithinDeadline ? selectedAnswer("modern-aav-counterproof") : "",
  };
  saveYearAnswers(year, answers);
  renderPreliminary();
}

function updateQuestionnaire() {
  const year = yearSelect.value;
  if (isModernAssessmentYear(year)) {
    updateModernQuestionnaire();
    return;
  }
  if (!isPreliminaryYear(year)) return;

  const issued = selectedAnswer("assessment-issued");
  const generalTermsLawApplied = selectedAnswer("general-terms-law");
  const generalTermsLawDateValue = generalTermsLawDate.value;
  const latestSubmissionDate = getAssessmentObjectionDeadline(
    assessmentDate.value,
    generalTermsLawApplied,
    generalTermsLawDateValue,
  );
  const objectionSubmitted = latestSubmissionDate
    ? selectedAnswer("objection-submitted")
    : "";
  const objectionTimely = selectedAnswer("objection-timely");
  const excusableDelay = selectedAnswer("excusable-delay");
  const objectionSubmissionDateValue = objectionSubmissionDate.value;
  const answersForObjectionValidation = {
    "assessment-issued": issued,
    assessmentDate: assessmentDate.value,
    generalTermsLawApplied,
    generalTermsLawDate: generalTermsLawApplied === "yes"
      ? generalTermsLawDateValue
      : "",
    "objection-submitted": objectionSubmitted,
    "objection-timely": objectionTimely,
    "excusable-delay": excusableDelay,
    objectionSubmissionDate: objectionSubmissionDateValue,
  };
  const objectionProcedureEligible =
    issued === "yes" &&
    objectionSubmitted === "yes" &&
    isObjectionSubmissionValid(answersForObjectionValidation);
  const objectionDecision = objectionProcedureEligible
    ? selectedAnswer("objection-decision")
    : "";
  const noDecisionBranch = objectionDecision === "no";
  const yesDecisionBranch = objectionDecision === "yes";
  const appealFiled =
    yesDecisionBranch ? selectedAnswer("tax-appeal-filed") : "";
  const taxAppealStatusValue =
    appealFiled === "yes"
      ? document.querySelector("#tax-appeal-status").value
      : "";
  const answers = {
    "assessment-issued": issued,
    assessmentDate:
      issued === "yes" ? assessmentDate.value : "",
    generalTermsLawApplied: issued === "yes" ? generalTermsLawApplied : "",
    generalTermsLawDate:
      issued === "yes" && generalTermsLawApplied === "yes"
        ? generalTermsLawDateValue
        : "",
    "objection-submitted":
      issued === "yes" ? objectionSubmitted : "",
    "objection-timely":
      issued === "yes" && objectionSubmitted === "yes"
        ? objectionTimely
        : "",
    objectionSubmissionDate:
      issued === "yes" &&
      objectionSubmitted === "yes"
        ? objectionSubmissionDateValue
        : "",
    "excusable-delay":
      issued === "yes" &&
      objectionSubmitted === "yes" &&
      objectionTimely === "no"
        ? excusableDelay
        : "",
    "appeal-open-2021":
      issued === "yes" &&
      (objectionSubmitted === "no" || objectionSubmitted === "yes")
        ? selectedAnswer("appeal-open-2021")
        : "",
    "deadline-expired":
      issued === "no" ? selectedAnswer("deadline-expired") : "",
    "extension-granted":
      issued === "no" ? selectedAnswer("extension-granted") : "",
    extensionUntil:
      issued === "no" && selectedAnswer("extension-granted") === "yes"
        ? extensionUntil.value
        : "",
    "legal-exception":
      issued === "no" ? selectedAnswer("legal-exception") : "",
    "objection-decision": objectionDecision,
    "objection-in-progress": noDecisionBranch
      ? selectedAnswer("objection-in-progress")
      : "",
    "objection-decision-deadline-passed": noDecisionBranch
      ? selectedAnswer("objection-decision-deadline-passed")
      : "",
    objectionAdvisoryCommittee: noDecisionBranch
      ? objectionAdvisoryCommittee.value
      : "unknown",
    objectionMassalStatus: noDecisionBranch
      ? objectionMassalStatus.value
      : "unknown",
    objectionPendingReason: noDecisionBranch
      ? objectionPendingReason.value
      : "",
    objectionPendingOther:
      noDecisionBranch && objectionPendingReason.value === "other"
        ? objectionPendingOther.value
        : "",
    objectionDecisionDate: yesDecisionBranch ? objectionDecisionDate.value : "",
    objectionAnnouncementDate: yesDecisionBranch
      ? objectionAnnouncementDate.value
      : "",
    objectionDecisionOutcome: yesDecisionBranch
      ? objectionDecisionOutcome.value
      : "",
    "tax-appeal-filed": appealFiled,
    taxAppealDate: appealFiled === "yes" ? taxAppealDate.value : "",
    taxAppealStageDate:
      appealFiled === "yes" ? taxAppealStageDate.value : "",
    taxAppealFinalOutcome:
      appealFiled === "yes" ? taxAppealFinalOutcome.value : "",
    taxAppealEnding:
      taxAppealStatusValue === "completed" ? taxAppealEnding.value : "",
    taxAppealFinalDecisionDate:
      taxAppealStatusValue === "completed" ? taxAppealFinalDecisionDate.value : "",
    "tax-appeal-timely":
      appealFiled === "yes" ? selectedAnswer("tax-appeal-timely") : "",
    taxAppealSubject:
      appealFiled === "yes"
        ? document.querySelector("#tax-appeal-subject").value
        : "",
    taxAppealStatus: taxAppealStatusValue,
  };
  answers["finality-status"] = getFinalityStatus(answers);
  saveYearAnswers(year, answers);
  renderPreliminary();
}
