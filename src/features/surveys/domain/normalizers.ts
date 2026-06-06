import {
  type RawSurveyOption,
  type RawSurveyPayload,
  type RawSurveyQuestion,
  type SurveyDefinition,
  type SurveyOption,
  type SurveyQuestion,
} from "@/features/surveys/domain/types";

const SURVEY_KEYS = new Set([
  "surveyId",
  "title",
  "description",
  "acknowledgement",
  "startDate",
  "endDate",
  "timeLimitMinutes",
  "questions",
]);

const QUESTION_KEYS = new Set([
  "id",
  "order",
  "type",
  "text",
  "description",
  "required",
  "options",
  "placeholder",
  "min",
  "max",
  "step",
]);

const collectGarbage = (
  source: Record<string, unknown>,
  whitelist: Set<string>,
) =>
  Object.fromEntries(
    Object.entries(source).filter(([key]) => !whitelist.has(key)),
  );

const normalizeSurveyOption = (
  option: RawSurveyOption,
  index: number,
): SurveyOption => ({
  label: option.label ?? `Option ${index + 1}`,
  value: option.value ?? option.label ?? `option-${index + 1}`,
});

const normalizeQuestion = (rawQuestion: RawSurveyQuestion): SurveyQuestion => {
  const normalizedOptions = (rawQuestion.options ?? []).map((option, index) =>
    normalizeSurveyOption(option, index),
  );

  const options =
    rawQuestion.type === "yesNo" && normalizedOptions.length === 0
      ? [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]
      : normalizedOptions;

  return {
    id: rawQuestion.id,
    order: rawQuestion.order,
    type: rawQuestion.type,
    text: rawQuestion.text,
    description: rawQuestion.description,
    required: rawQuestion.required === true,
    options,
    placeholder: rawQuestion.placeholder,
    min: rawQuestion.min,
    max: rawQuestion.max,
    step: rawQuestion.step,
    garbageCollector: collectGarbage(rawQuestion, QUESTION_KEYS),
  };
};

export const normalizeSurveyDefinition = (
  rawSurvey: RawSurveyPayload,
  requestedSurveyId: string,
): SurveyDefinition => ({
  surveyId: rawSurvey.surveyId || requestedSurveyId,
  title: rawSurvey.title,
  description: rawSurvey.description,
  acknowledgement: rawSurvey.acknowledgement,
  startDate: rawSurvey.startDate,
  endDate: rawSurvey.endDate,
  timeLimitMinutes: rawSurvey.timeLimitMinutes,
  questions: rawSurvey.questions
    .map(normalizeQuestion)
    .sort((a, b) => a.order - b.order),
  garbageCollector: collectGarbage(rawSurvey, SURVEY_KEYS),
});

export const formatSurveyDate = (value?: string) => {
  if (!value) return "N/A";

  // Date-only strings (YYYY-MM-DD) are parsed by `new Date()` as UTC midnight,
  // which shifts to the previous calendar day in UTC-offset timezones.
  // Appending T12:00:00 anchors to local noon, avoiding the boundary crossing.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString();
};
