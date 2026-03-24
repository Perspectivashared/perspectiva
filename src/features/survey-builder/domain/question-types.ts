import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";
import type { QuestionType } from "@/features/surveys/domain/types";

export const SURVEY_BUILDER_CATEGORY_OPTIONS = [
  { value: "tech", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "economics", label: "Economics" },
  { value: "sports", label: "Sports Science" },
] as const;

export const SURVEY_BUILDER_QUESTION_TYPE_OPTIONS = [
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "linear-scale", label: "Rating" },
] as const satisfies ReadonlyArray<{
  value: SurveyBuilderQuestionType;
  label: string;
}>;

const surveyBuilderQuestionTypes = new Set<string>(
  SURVEY_BUILDER_QUESTION_TYPE_OPTIONS.map((option) => option.value),
);

export const isSurveyBuilderQuestionType = (
  value: string,
): value is SurveyBuilderQuestionType => surveyBuilderQuestionTypes.has(value);

const surveyToBuilderQuestionTypeMap: Record<
  QuestionType,
  SurveyBuilderQuestionType
> = {
  shortText: "short-text",
  longText: "long-text",
  singleChoice: "multiple-choice",
  multipleChoice: "checkboxes",
  dropdown: "dropdown",
  rating: "linear-scale",
  number: "short-text",
  date: "short-text",
  yesNo: "multiple-choice",
};

const builderToSurveyQuestionTypeMap: Record<
  SurveyBuilderQuestionType,
  QuestionType
> = {
  "short-text": "shortText",
  "long-text": "longText",
  "multiple-choice": "singleChoice",
  checkboxes: "multipleChoice",
  dropdown: "dropdown",
  "linear-scale": "rating",
};

export const mapSurveyQuestionTypeToBuilderType = (
  questionType: QuestionType,
): SurveyBuilderQuestionType => surveyToBuilderQuestionTypeMap[questionType];

export const mapBuilderQuestionTypeToSurveyType = (
  questionType: SurveyBuilderQuestionType,
): QuestionType => builderToSurveyQuestionTypeMap[questionType];
