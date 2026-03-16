import {
  isOptionQuestionType,
} from "@/features/survey-builder/domain/reducer";
import type { SurveyBuilderState } from "@/features/survey-builder/domain/types";

export const validateDraftSurvey = (
  state: SurveyBuilderState,
): string | null => {
  if (!state.surveyTitle.trim()) {
    return "Survey title is required.";
  }

  if (state.questions.length === 0) {
    return "Add at least one question before publishing.";
  }

  for (const [index, question] of state.questions.entries()) {
    if (!question.question.trim()) {
      return `Question ${index + 1} cannot be empty.`;
    }

    if (isOptionQuestionType(question.type)) {
      const nonEmptyOptions = question.options.filter((option) => option.text.trim());
      if (nonEmptyOptions.length < 2) {
        return `Question ${index + 1} needs at least 2 non-empty options.`;
      }
    }
  }

  return null;
};
