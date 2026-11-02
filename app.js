"use strict";

const STORAGE_KEY = "box3-calculator-bank-accounts-v1";
const PRELIMINARY_STORAGE_KEY = "box3-calculator-preliminary-v1";

const total = document.querySelector("#savings-total");
const footerTotal = document.querySelector("#savings-total-footer");
const status = document.querySelector("#form-status");
const bankLink = document.querySelector("#bank-accounts-link");
const yearSelect = document.querySelector("#tax-year");
const preliminaryPanel = document.querySelector("#preliminary-panel");
const preliminaryForm = document.querySelector("#preliminary-form");
const preliminaryYear = document.querySelector("#preliminary-year");
const preliminaryError = document.querySelector("#preliminary-error");
const assessmentDateQuestion = document.querySelector("#assessment-date-question");
const assessmentDate = document.querySelector("#assessment-date");
const assessmentDateDisplay = document.querySelector("#assessment-date-display");
const assessmentDateText = document.querySelector("#assessment-date-text");
const objectionSubmittedQuestion = document.querySelector("#objection-submitted-question");
const timelyObjectionQuestion = document.querySelector("#timely-objection-question");
const objectionDeadline = document.querySelector("#objection-deadline");
const objectionDeadlineDate = document.querySelector("#objection-deadline-date");
const adjustedDeadlineField = document.querySelector("#adjusted-deadline-field");
const adjustedDeadline = document.querySelector("#adjusted-deadline");
const adjustedDeadlineResult = document.querySelector("#adjusted-deadline-result");
const adjustedDeadlineText = document.querySelector("#adjusted-deadline-text");
const finalityQuestion = document.querySelector("#finality-question");
const accessResult = document.querySelector("#access-result");
const accessResultDenialWord = document.querySelector("#access-result-denial-word");
const accessResultMessage = document.querySelector("#access-result-message");
const formalLawQuestions = document.querySelector("#formal-law-questions");
const legalConclusion = document.querySelector(".legal-conclusion");
const continueButton = document.querySelector("#continue-to-calculation");
const completedPanel = document.querySelector("#preliminary-complete");
const completedYear = document.querySelector("#completed-year");
const calculationPanel = document.querySelector("#calculation-panel");
const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const questionNames = [
  "assessment-issued",
  "deadline-expired",
  "extension-granted",
  "legal-exception",
];
let preliminaryByYear = {};

function isPreliminaryYear(year) {
  const numericYear = Number(year);
  return numericYear >= 2017 && numericYear <= 2020;
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
  } catch (error) {
    preliminaryError.hidden = false;
    preliminaryError.textContent =
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
  if (value !== "yes" && value !== "no") return;
  const input = document.querySelector(
    `input[name="${name}"][value="${value}"]`,
  );
  if (input) input.checked = true;
}

function renderPreliminary() {
  const year = yearSelect.value;
  const required = isPreliminaryYear(year);
  preliminaryPanel.hidden = !required;
  if (!required) return;

  preliminaryYear.textContent = year;
  const answers = getYearAnswers(year);
  calculationPanel.hidden = !answers.completed;
  for (const name of questionNames) restoreAnswer(name, answers[name]);
  restoreAnswer("terms-act-applies", answers["terms-act-applies"]);
  restoreAnswer("objection-submitted", answers["objection-submitted"]);
  restoreAnswer("objection-timely", answers["objection-timely"]);
  restoreAnswer("appeal-open-2021", answers["appeal-open-2021"]);
  assessmentDate.value = answers.assessmentDate || "";
  adjustedDeadline.value = answers.adjustedDeadline || "";

  const issued = answers["assessment-issued"];
  assessmentDateQuestion.hidden = issued !== "yes";
  formalLawQuestions.hidden = issued !== "no";
  assessmentDate.required = issued === "yes";
  const validAssessmentDate = Boolean(formatDate(answers.assessmentDate || ""));
  objectionSubmittedQuestion.hidden = issued !== "yes" || !validAssessmentDate;
  const objectionSubmitted = answers["objection-submitted"];
  timelyObjectionQuestion.hidden =
    issued !== "yes" ||
    objectionSubmitted !== "yes" ||
    !validAssessmentDate;
  objectionDeadline.hidden = issued !== "yes" || !validAssessmentDate;
  renderObjectionDeadline(validAssessmentDate);
  renderAdjustedDeadline(answers);
  renderFinality(answers, objectionSubmitted);

  const complete = Boolean(answers.completed);
  preliminaryForm.hidden = complete;
  completedPanel.hidden = !complete;
  completedYear.textContent = year;
  legalConclusion.classList.toggle(
    "legal-conclusion-strong",
    blocksRegularAssessment(answers),
  );
  continueButton.disabled = !isQuestionnaireComplete(answers);
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

function renderAdjustedDeadline(answers) {
  const applies = answers["terms-act-applies"] === "yes";
  adjustedDeadlineField.hidden = !applies;
  const formattedDate = applies ? formatDate(answers.adjustedDeadline || "") : "";
  adjustedDeadlineResult.hidden = !formattedDate;
  adjustedDeadlineText.textContent = formattedDate;
}

function renderFinality(answers, objectionSubmitted) {
  const showFinality = objectionSubmitted === "no";
  finalityQuestion.hidden = !showFinality;
  let outcome = "";
  if (objectionSubmitted === "yes") {
    outcome = answers["objection-timely"];
  } else if (showFinality) {
    outcome = answers["appeal-open-2021"];
  }

  accessResult.hidden =
    (outcome !== "yes" && outcome !== "no") ||
    (objectionSubmitted !== "yes" && !showFinality);
  const appealWasOpenOnCutoff =
    showFinality && outcome === "no";
  const hasAccess =
    (objectionSubmitted === "yes" && outcome === "yes") ||
    appealWasOpenOnCutoff;
  accessResultDenialWord.hidden = hasAccess || accessResult.hidden;
  accessResultMessage.textContent = accessResult.hidden
    ? ""
    : appealWasOpenOnCutoff
      ? "Nee, de bezwaartermijn liep nog op die datum. Toegang tot Wet rechtsherstel box 3"
      : `${hasAccess ? "Toegang" : "toegang"} tot Wet rechtsherstel box 3`;
  accessResult.classList.toggle(
    "access-result-granted",
    !accessResult.hidden && hasAccess,
  );
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
  const deadline = new Date(
    date.getTime() + 42 * 24 * 60 * 60 * 1000,
  );
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

function isQuestionnaireComplete(answers) {
  if (answers["assessment-issued"] === "yes") {
    if (!formatDate(answers.assessmentDate || "")) return false;
    if (
      answers["terms-act-applies"] !== "yes" &&
      answers["terms-act-applies"] !== "no"
    ) {
      return false;
    }
    if (
      answers["terms-act-applies"] === "yes" &&
      !formatDate(answers.adjustedDeadline || "")
    ) {
      return false;
    }
    if (answers["objection-submitted"] === "yes") {
      return (
        (answers["objection-timely"] === "yes" ||
          answers["objection-timely"] === "no")
      );
    }
    return (
      answers["objection-submitted"] === "no" &&
      (answers["appeal-open-2021"] === "yes" ||
        answers["appeal-open-2021"] === "no")
    );
  }
  if (answers["assessment-issued"] === "no") {
    const formalQuestionsComplete = questionNames.slice(1).every(
      (name) => answers[name] === "yes" || answers[name] === "no",
    );
    return formalQuestionsComplete && !blocksRegularAssessment(answers);
  }
  return false;
}

function blocksRegularAssessment(answers) {
  return (
    answers["deadline-expired"] === "yes" &&
    answers["extension-granted"] === "no" &&
    answers["legal-exception"] === "no"
  );
}

function updateQuestionnaire() {
  const year = yearSelect.value;
  if (!isPreliminaryYear(year)) return;

  const previous = getYearAnswers(year);
  const issued = selectedAnswer("assessment-issued");
  const objectionSubmitted = selectedAnswer("objection-submitted");
  const objectionTimely = selectedAnswer("objection-timely");
  const answers = {
    "assessment-issued": issued,
    assessmentDate:
      issued === "yes" ? assessmentDate.value : "",
    "objection-submitted":
      issued === "yes" ? objectionSubmitted : "",
    "objection-timely":
      issued === "yes" && objectionSubmitted === "yes"
        ? objectionTimely
        : "",
    "appeal-open-2021":
      issued === "yes" && objectionSubmitted === "no"
        ? selectedAnswer("appeal-open-2021")
        : "",
    "deadline-expired":
      issued === "no" ? selectedAnswer("deadline-expired") : "",
    "extension-granted":
      issued === "no" ? selectedAnswer("extension-granted") : "",
    "legal-exception":
      issued === "no" ? selectedAnswer("legal-exception") : "",
    "terms-act-applies":
      issued === "yes"
        ? selectedAnswer("terms-act-applies")
        : "",
    adjustedDeadline:
      issued === "yes"
        ? adjustedDeadline.value
        : "",
    completed: false,
  };
  if (previous.completed && isQuestionnaireComplete(answers)) {
    answers.completed = true;
  }
  saveYearAnswers(year, answers);
  renderPreliminary();
}

function showError(message) {
  status.hidden = false;
  status.textContent = message;
}

function renderTotal() {
  const year = yearSelect.value;
  bankLink.href = year
    ? `banktegoeden.html?year=${encodeURIComponent(year)}`
    : "banktegoeden.html";

  try {
    const stored = year ? localStorage.getItem(`${STORAGE_KEY}:${year}`) : null;
    const accounts = stored === null ? [] : JSON.parse(stored);
    if (!Array.isArray(accounts) || accounts.some((account) =>
      typeof account.balance !== "number" || !Number.isFinite(account.balance)
    )) {
      throw new Error("Ongeldige opgeslagen rekeninggegevens.");
    }

    const sum = accounts.reduce((result, account) => result + account.balance, 0);
    total.textContent = euro.format(sum);
    footerTotal.textContent = euro.format(sum);
  } catch (error) {
    showError(`Banktegoeden konden niet worden geladen: ${error.message}`);
  }
}

yearSelect.value = new URLSearchParams(window.location.search).get("year") || "";
loadPreliminaryAnswers();
yearSelect.addEventListener("change", () => {
  const url = new URL(window.location.href);
  if (yearSelect.value) url.searchParams.set("year", yearSelect.value);
  else url.searchParams.delete("year");
  window.history.replaceState({}, "", url);
  status.hidden = true;
  renderTotal();
  renderPreliminary();
});

bankLink.addEventListener("click", (event) => {
  if (!yearSelect.value) {
    event.preventDefault();
    status.hidden = false;
    status.textContent = "Selecteer eerst een belastingjaar.";
  }
});

renderTotal();
renderPreliminary();

for (const name of questionNames) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", updateQuestionnaire);
  });
}
for (const name of [
  "objection-submitted",
  "objection-timely",
  "appeal-open-2021",
]) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", updateQuestionnaire);
  });
}
assessmentDate.addEventListener("input", updateQuestionnaire);
assessmentDate.addEventListener("change", updateQuestionnaire);
document.querySelectorAll('input[name="terms-act-applies"]').forEach((input) => {
  input.addEventListener("change", updateQuestionnaire);
});
adjustedDeadline.addEventListener("input", updateQuestionnaire);
adjustedDeadline.addEventListener("change", updateQuestionnaire);

continueButton.addEventListener("click", () => {
  const year = yearSelect.value;
  const answers = getYearAnswers(year);
  if (!isQuestionnaireComplete(answers)) {
    preliminaryError.hidden = false;
    preliminaryError.textContent =
      "Beantwoord de getoonde voorvragen voordat u doorgaat.";
    return;
  }
  saveYearAnswers(year, { ...answers, completed: true });
  renderPreliminary();
});

document.querySelector("#edit-preliminary").addEventListener("click", () => {
  const year = yearSelect.value;
  const answers = getYearAnswers(year);
  saveYearAnswers(year, { ...answers, completed: false });
  renderPreliminary();
});

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === null) renderTotal();
});
