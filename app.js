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
const objectionDeadline = document.querySelector("#objection-deadline");
const objectionDeadlineDate = document.querySelector("#objection-deadline-date");
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
  assessmentDate.value = answers.assessmentDate || "";

  const issued = answers["assessment-issued"];
  assessmentDateQuestion.hidden = issued !== "yes";
  formalLawQuestions.hidden = issued !== "no";
  assessmentDate.required = issued === "yes";
  renderObjectionDeadline();

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

function renderObjectionDeadline() {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(assessmentDate.value);
  if (!match) {
    assessmentDateDisplay.hidden = true;
    assessmentDateText.textContent = "";
    objectionDeadline.hidden = true;
    objectionDeadlineDate.textContent = "";
    return;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
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
    return Boolean(answers.assessmentDate);
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
  const answers = {
    "assessment-issued": issued,
    assessmentDate:
      issued === "yes" ? assessmentDate.value : "",
    "deadline-expired":
      issued === "no" ? selectedAnswer("deadline-expired") : "",
    "extension-granted":
      issued === "no" ? selectedAnswer("extension-granted") : "",
    "legal-exception":
      issued === "no" ? selectedAnswer("legal-exception") : "",
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
assessmentDate.addEventListener("input", updateQuestionnaire);
assessmentDate.addEventListener("change", updateQuestionnaire);

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
