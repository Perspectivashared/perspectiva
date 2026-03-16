import {
  normalizeDraftSurvey,
} from "@/features/survey-builder/domain/reducer";
import type { DraftSurvey } from "@/features/survey-builder/domain/types";

export const SURVEY_DRAFT_STORAGE_KEY = "create-survey-draft";

export const hasDraftSurvey = () =>
  Boolean(globalThis.localStorage.getItem(SURVEY_DRAFT_STORAGE_KEY));

export const saveDraftSurvey = (draft: DraftSurvey) => {
  globalThis.localStorage.setItem(SURVEY_DRAFT_STORAGE_KEY, JSON.stringify(draft));
};

export const loadDraftSurvey = (): DraftSurvey | null => {
  const rawDraft = globalThis.localStorage.getItem(SURVEY_DRAFT_STORAGE_KEY);
  if (!rawDraft) {
    return null;
  }

  const parsed = JSON.parse(rawDraft) as DraftSurvey;
  if (!Array.isArray(parsed.questions)) {
    return null;
  }

  return normalizeDraftSurvey(parsed);
};
