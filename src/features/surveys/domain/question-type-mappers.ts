import type { QuestionType } from "@/features/surveys/domain/types";

/** Backend question_type string → frontend QuestionType enum */
export const API_TO_QUESTION_TYPE: Record<string, QuestionType> = {
  "short-text": "shortText",
  "long-text": "longText",
  "multiple-choice": "singleChoice",
  "checkboxes": "multipleChoice",
  "dropdown": "dropdown",
  "linear-scale": "rating",
};

/** Frontend QuestionType → backend question_type string */
export const QUESTION_TYPE_TO_API: Record<string, string> = {
  shortText: "short-text",
  longText: "long-text",
  singleChoice: "multiple-choice",
  multipleChoice: "checkboxes",
  dropdown: "dropdown",
  rating: "linear-scale",
};
