export type SurveyBuilderQuestionType =
  | "short-text"
  | "long-text"
  | "multiple-choice"
  | "checkboxes"
  | "dropdown"
  | "linear-scale";

export type SurveyCategory = "tech" | "business" | "economics" | "sports";

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
  category: SurveyCategory | "";
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
