import {
  type DraftQuestion,
  type DraftSurvey,
  type QuestionOption,
  type SurveyBuilderAction,
  type SurveyBuilderQuestionType,
  type SurveyBuilderState,
} from "@/features/survey-builder/domain/types";

const optionQuestionTypes = new Set<SurveyBuilderQuestionType>([
  "multiple-choice",
  "checkboxes",
  "dropdown",
]);

export const createId = () => crypto.randomUUID();

export const isOptionQuestionType = (type: SurveyBuilderQuestionType) =>
  optionQuestionTypes.has(type);

const createEmptyOption = (): QuestionOption => ({
  id: createId(),
  text: "",
});

export const createEmptyQuestion = (): DraftQuestion => ({
  id: createId(),
  type: "short-text",
  question: "",
  required: false,
  options: [],
});

export const createInitialSurveyBuilderState = (): SurveyBuilderState => ({
  surveyTitle: "",
  surveyDescription: "",
  acknowledgement: "",
  category: "",
  surveyCategory: "",
  timeLimitMinutes: null,
  targetResponses: null,
  deadline: "",
  questions: [createEmptyQuestion()],
});

export const normalizeQuestionForType = (
  question: DraftQuestion,
  type: SurveyBuilderQuestionType,
): DraftQuestion => {
  const options = Array.isArray(question.options) ? question.options : [];

  if (!isOptionQuestionType(type)) {
    return { ...question, type, options: [] };
  }

  if (options.length >= 2) {
    return { ...question, type, options };
  }

  return {
    ...question,
    type,
    options: [createEmptyOption(), createEmptyOption()],
  };
};

export const surveyBuilderReducer = (
  state: SurveyBuilderState,
  action: SurveyBuilderAction,
): SurveyBuilderState => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      } as SurveyBuilderState;

    case "ADD_QUESTION":
      return {
        ...state,
        questions: [...state.questions, createEmptyQuestion()],
      };

    case "REMOVE_QUESTION":
      return {
        ...state,
        questions:
          state.questions.length === 1
            ? state.questions
            : state.questions.filter((q) => q.id !== action.questionId),
      };

    case "DUPLICATE_QUESTION": {
      const sourceIndex = state.questions.findIndex(
        (q) => q.id === action.questionId,
      );

      if (sourceIndex === -1) {
        return state;
      }

      const source = state.questions[sourceIndex];
      const duplicate: DraftQuestion = {
        ...source,
        id: createId(),
        options: source.options.map((option) => ({
          ...option,
          id: createId(),
        })),
      };
      const updatedQuestions = [...state.questions];
      updatedQuestions.splice(sourceIndex + 1, 0, duplicate);

      return {
        ...state,
        questions: updatedQuestions,
      };
    }

    case "UPDATE_QUESTION":
      return {
        ...state,
        questions: state.questions.map((question) => {
          if (question.id !== action.questionId) {
            return question;
          }

          const nextQuestion = {
            ...question,
            ...action.updates,
          };

          if (action.updates.type) {
            return normalizeQuestionForType(nextQuestion, action.updates.type);
          }

          return nextQuestion;
        }),
      };

    case "ADD_OPTION":
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === action.questionId
            ? {
                ...question,
                options: [...question.options, createEmptyOption()],
              }
            : question,
        ),
      };

    case "UPDATE_OPTION":
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === action.questionId
            ? {
                ...question,
                options: question.options.map((option) =>
                  option.id === action.optionId
                    ? { ...option, text: action.value }
                    : option,
                ),
              }
            : question,
        ),
      };

    case "REMOVE_OPTION":
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === action.questionId
            ? {
                ...question,
                options: question.options.filter(
                  (option) => option.id !== action.optionId,
                ),
              }
            : question,
        ),
      };

    case "LOAD_DRAFT":
      return action.payload;

    default:
      return state;
  }
};

export const normalizeDraftSurvey = (draft: DraftSurvey): DraftSurvey => ({
  ...draft,
  questions:
    draft.questions.length > 0
      ? draft.questions.map((question) =>
          normalizeQuestionForType(
            {
              ...question,
              options: Array.isArray(question.options) ? question.options : [],
            },
            question.type,
          ),
        )
      : [createEmptyQuestion()],
});
