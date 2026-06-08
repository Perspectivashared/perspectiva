export type SurveyBuilderQuestionType =
  | "short-text"
  | "long-text"
  | "multiple-choice"
  | "checkboxes"
  | "dropdown"
  | "linear-scale";

/** Must stay in sync with CATEGORY_LIST in SurveyCard.tsx */
export type SurveyCategory =
  | "Technology"
  | "Economics"
  | "Business"
  | "Sports Science"
  | "Research"
  | "Education"
  | "Health Sciences"
  | "Climate Policy"
  | "Design Thinking"
  | "Public Policy"
  | "Psychology"
  | "Media Studies";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface DraftQuestion {
  id: string;
  type: SurveyBuilderQuestionType;
  question: string;
  required: boolean;
  options: QuestionOption[];
}

export interface DraftSurvey {
  surveyTitle: string;
  surveyDescription: string;
  acknowledgement: string;
  /** Holds the selected community ID (field intentionally named "category" in the reducer
   *  for historical reasons — maps to community_id in the API payload). */
  category: string;
  /** The survey's subject category (e.g. "Technology", "Economics"). Maps to category in the API. */
  surveyCategory: string;
  timeLimitMinutes: number | null;
  targetResponses: number | null;
  deadline: string;
  questions: DraftQuestion[];
}

export type SurveyBuilderAction =
  | {
      type: "SET_FIELD";
      field: Exclude<keyof DraftSurvey, "questions">;
      value: string | number | null;
    }
  | { type: "ADD_QUESTION" }
  | { type: "REMOVE_QUESTION"; questionId: string }
  | { type: "DUPLICATE_QUESTION"; questionId: string }
  | {
      type: "UPDATE_QUESTION";
      questionId: string;
      updates: Partial<Pick<DraftQuestion, "question" | "required" | "type">>;
    }
  | { type: "ADD_OPTION"; questionId: string }
  | {
      type: "UPDATE_OPTION";
      questionId: string;
      optionId: string;
      value: string;
    }
  | { type: "REMOVE_OPTION"; questionId: string; optionId: string }
  | { type: "LOAD_DRAFT"; payload: DraftSurvey };

export type SurveyBuilderState = DraftSurvey;
