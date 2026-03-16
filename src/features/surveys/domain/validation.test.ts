import { DEFAULT_SURVEY_JSON } from "@/features/surveys/domain/fixtures";
import { normalizeSurveyDefinition } from "@/features/surveys/domain/normalizers";
import {
  getRatingScale,
  getSurveyRequiredErrors,
  hasSurveyAnswer,
} from "@/features/surveys/domain/validation";

describe("survey validation", () => {
  const survey = normalizeSurveyDefinition(DEFAULT_SURVEY_JSON, "demo-survey-001");

  it("detects missing required answers", () => {
    const errors = getSurveyRequiredErrors(survey.questions, {});
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });

  it("supports yes/no answers", () => {
    const yesNoQuestion = survey.questions.find((question) => question.type === "yesNo");
    expect(yesNoQuestion).toBeDefined();
    expect(hasSurveyAnswer(yesNoQuestion!, "yes")).toBe(true);
    expect(hasSurveyAnswer(yesNoQuestion!, "")).toBe(false);
  });

  it("creates numeric rating scale", () => {
    const ratingQuestion = survey.questions.find((question) => question.type === "rating");
    expect(ratingQuestion).toBeDefined();
    expect(getRatingScale(ratingQuestion!)).toEqual([1, 2, 3, 4, 5]);
  });
});
