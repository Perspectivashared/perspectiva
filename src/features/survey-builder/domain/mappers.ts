import { isOptionQuestionType } from "@/features/survey-builder/domain/reducer";
import {
  mapBuilderQuestionTypeToSurveyType,
  mapSurveyQuestionTypeToBuilderType,
} from "@/features/survey-builder/domain/question-types";
import type { DraftSurvey } from "@/features/survey-builder/domain/types";
import type {
  RawSurveyPayload,
  SurveyDefinition,
} from "@/features/surveys/domain/types";

const toOptionText = (value: string, fallbackIndex: number) => {
  const trimmed = value.trim();
  return trimmed || `Option ${fallbackIndex + 1}`;
};

const toOptionValue = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, "-");

export const mapSurveyDefinitionToDraftSurvey = (
  survey: SurveyDefinition,
): DraftSurvey => ({
  surveyTitle: survey.title,
  surveyDescription: survey.description,
  acknowledgement: survey.acknowledgement ?? "",
  category: "",
  surveyCategory: "",
  timeLimitMinutes: survey.timeLimitMinutes ?? null,
  scheduledAt: "",
  targetResponses: null,
  deadline: survey.endDate ? survey.endDate.slice(0, 10) : "",
  questions: survey.questions.map((question) => ({
    id: question.id,
    type: mapSurveyQuestionTypeToBuilderType(question.type),
    question: question.text,
    required: Boolean(question.required),
    options: question.options.map((option, index) => ({
      id: `${question.id}-opt-${index}`,
      text: toOptionText(option.label || option.value, index),
    })),
  })),
});

export const mapDraftSurveyToRawSurveyPayload = (
  draft: DraftSurvey,
  surveyId: string,
): RawSurveyPayload => ({
  surveyId: surveyId.trim(),
  title: draft.surveyTitle.trim(),
  description: draft.surveyDescription.trim(),
  acknowledgement: "",
  questions: draft.questions.map((question, index) => ({
    id: question.id,
    order: index + 1,
    type: mapBuilderQuestionTypeToSurveyType(question.type),
    text: question.question.trim(),
    required: question.required,
    options: isOptionQuestionType(question.type)
      ? question.options
          .map((option, optionIndex) => toOptionText(option.text, optionIndex))
          .filter(Boolean)
          .map((optionText) => ({
            label: optionText,
            value: toOptionValue(optionText),
          }))
      : [],
  })),
});
