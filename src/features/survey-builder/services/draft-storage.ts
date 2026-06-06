import { normalizeDraftSurvey } from "@/features/survey-builder/domain/reducer";
import type { DraftSurvey, SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";
import { resolveLocalStorage } from "@/shared/lib/local-storage";

const VALID_QUESTION_TYPES = new Set<string>([
  "short-text", "long-text", "multiple-choice", "checkboxes", "dropdown", "linear-scale",
]);

export const SURVEY_DRAFT_STORAGE_KEY = "create-survey-draft";

interface DraftSurveyStorage {
  hasDraftSurvey: () => boolean;
  saveDraftSurvey: (draft: DraftSurvey) => void;
  loadDraftSurvey: () => DraftSurvey | null;
  clearDraftSurvey: () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isDraftSurveyPayload = (value: unknown): value is DraftSurvey => {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.questions)) return false;

  return value.questions.every((question): question is { id: string; question: string; type: SurveyBuilderQuestionType; required: boolean; options: unknown[] } => {
    if (!isRecord(question)) return false;
    return (
      typeof question.id === "string" &&
      typeof question.question === "string" &&
      typeof question.type === "string" && VALID_QUESTION_TYPES.has(question.type) &&
      typeof question.required === "boolean" &&
      Array.isArray(question.options)
    );
  });
};

export const createDraftSurveyStorage = (
  storage: Storage | null = resolveLocalStorage(),
): DraftSurveyStorage => {
  const getRawDraft = () => {
    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(SURVEY_DRAFT_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const clearDraftSurvey = () => {
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(SURVEY_DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage removal failures and continue.
    }
  };

  return {
    hasDraftSurvey: () => Boolean(getRawDraft()),

    saveDraftSurvey: (draft) => {
      if (!storage) {
        return;
      }

      try {
        storage.setItem(
          SURVEY_DRAFT_STORAGE_KEY,
          JSON.stringify(normalizeDraftSurvey(draft)),
        );
      } catch {
        // Ignore storage write failures and continue.
      }
    },

    loadDraftSurvey: () => {
      const rawDraft = getRawDraft();
      if (!rawDraft) {
        return null;
      }

      try {
        const parsed = JSON.parse(rawDraft) as unknown;
        if (!isDraftSurveyPayload(parsed)) {
          clearDraftSurvey();
          return null;
        }

        return normalizeDraftSurvey(parsed);
      } catch {
        clearDraftSurvey();
        return null;
      }
    },

    clearDraftSurvey,
  };
};

const browserDraftStorage = createDraftSurveyStorage();

export const hasDraftSurvey = () => browserDraftStorage.hasDraftSurvey();

export const saveDraftSurvey = (draft: DraftSurvey) =>
  browserDraftStorage.saveDraftSurvey(draft);

export const loadDraftSurvey = () => browserDraftStorage.loadDraftSurvey();

export const clearDraftSurvey = () => browserDraftStorage.clearDraftSurvey();
