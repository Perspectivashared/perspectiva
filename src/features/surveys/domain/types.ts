export type QuestionType =
  | "shortText"
  | "longText"
  | "singleChoice"
  | "multipleChoice"
  | "dropdown"
  | "rating"
  | "number"
  | "date"
  | "yesNo";

export type SurveyAnswerValue = string | string[] | number | null;

export type RawSurveyOption = {
  label?: string;
  value?: string;
  [key: string]: unknown;
};

export type RawSurveyQuestion = {
  id: string;
  order: number;
  type: QuestionType;
  text: string;
  description?: string;
  required?: boolean;
  options?: RawSurveyOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  [key: string]: unknown;
};

export type RawSurveyPayload = {
  surveyId: string;
  title: string;
  description: string;
  acknowledgement: string;
  startDate?: string;
  endDate?: string;
  timeLimitMinutes?: number;
  questions: RawSurveyQuestion[];
  [key: string]: unknown;
};

export type SurveyOption = {
  label: string;
  value: string;
};

export type SurveyQuestion = {
  id: string;
  order: number;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  options: SurveyOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  garbageCollector: Record<string, unknown>;
};

export type SurveyDefinition = {
  surveyId: string;
  title: string;
  description: string;
  acknowledgement: string;
  startDate?: string;
  endDate?: string;
  timeLimitMinutes?: number;
  questions: SurveyQuestion[];
  garbageCollector: Record<string, unknown>;
};

export type SurveyAnswerMap = Record<string, SurveyAnswerValue>;

export type StoredSurveyProgress = {
  surveyId: string;
  answers: SurveyAnswerMap;
  updatedAt: string;
  /** ISO timestamp when the user first accepted the acknowledgement (for completion time tracking). */
  startedAt?: string;
};

export interface SurveySessionStorage {
  getProgressKey: (surveyId: string) => string;
  saveProgress: (surveyId: string, answers: SurveyAnswerMap, startedAt?: string) => void;
  loadProgress: (surveyId: string) => StoredSurveyProgress | null;
  clearProgress: (surveyId: string) => void;
}
