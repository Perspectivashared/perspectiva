import {
  createInitialSurveyBuilderState,
  surveyBuilderReducer,
} from "@/features/survey-builder/domain/reducer";
import { validateDraftSurvey } from "@/features/survey-builder/domain/validation";

describe("survey builder reducer", () => {
  it("adds questions", () => {
    const initialState = createInitialSurveyBuilderState();
    const nextState = surveyBuilderReducer(initialState, { type: "ADD_QUESTION" });

    expect(nextState.questions).toHaveLength(initialState.questions.length + 1);
  });

  it("normalizes option question types", () => {
    const initialState = createInitialSurveyBuilderState();
    const questionId = initialState.questions[0]!.id;

    const nextState = surveyBuilderReducer(initialState, {
      type: "UPDATE_QUESTION",
      questionId,
      updates: { type: "multiple-choice" },
    });

    expect(nextState.questions[0]?.options.length).toBeGreaterThanOrEqual(2);
  });

  it("validates draft before publishing", () => {
    const initialState = createInitialSurveyBuilderState();

    expect(validateDraftSurvey(initialState)).toBe("Survey title is required.");
  });
});
