import {
  type SurveyAnswerMap,
  type SurveyAnswerValue,
  type SurveyQuestion,
} from "@/features/surveys/domain/types";

export const hasSurveyAnswer = (
  question: SurveyQuestion,
  value: SurveyAnswerValue,
) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (question.type === "yesNo") {
    return value === "yes" || value === "no";
  }

  return false;
};

export const getSurveyRequiredErrors = (
  questions: SurveyQuestion[],
  answers: SurveyAnswerMap,
) => {
  const errors: Record<string, string> = {};

  questions.forEach((question) => {
    if (!question.required) {
      return;
    }

    if (!hasSurveyAnswer(question, answers[question.id])) {
      errors[question.id] = "This question is required.";
    }
  });

  return errors;
};

export const getRatingScale = (question: SurveyQuestion) => {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const step = question.step ?? 1;

  if (step <= 0 || max < min) {
    return [];
  }

  const values: number[] = [];
  for (let current = min; current <= max; current += step) {
    values.push(current);
  }

  return values;
};
