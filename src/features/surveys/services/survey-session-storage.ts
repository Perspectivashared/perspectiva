import {
  type StoredSurveyProgress,
  type SurveyAnswerMap,
  type SurveySessionStorage,
} from "@/features/surveys/domain/types";

const getProgressStorageKey = (surveyId: string) => `survey-progress:${surveyId}`;

const saveProgress = (surveyId: string, answers: SurveyAnswerMap) => {
  const payload: StoredSurveyProgress = {
    surveyId,
    answers,
    updatedAt: new Date().toISOString(),
  };

  globalThis.localStorage.setItem(
    getProgressStorageKey(surveyId),
    JSON.stringify(payload),
  );
};

const loadProgress = (surveyId: string): StoredSurveyProgress | null => {
  const storedProgress = globalThis.localStorage.getItem(
    getProgressStorageKey(surveyId),
  );

  if (!storedProgress) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedProgress) as StoredSurveyProgress;

    if (parsed.answers && typeof parsed.answers === "object") {
      return parsed;
    }
  } catch {
    globalThis.localStorage.removeItem(getProgressStorageKey(surveyId));
  }

  return null;
};

const clearProgress = (surveyId: string) => {
  globalThis.localStorage.removeItem(getProgressStorageKey(surveyId));
};

export const browserSurveySessionStorage: SurveySessionStorage = {
  getProgressKey: getProgressStorageKey,
  saveProgress,
  loadProgress,
  clearProgress,
};
