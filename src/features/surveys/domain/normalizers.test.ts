import { DEFAULT_SURVEY_JSON } from "@/features/surveys/domain/fixtures";
import {
  formatSurveyDate,
  normalizeSurveyDefinition,
} from "@/features/surveys/domain/normalizers";

describe("survey normalizers", () => {
  it("normalizes raw survey payload", () => {
    const normalized = normalizeSurveyDefinition(DEFAULT_SURVEY_JSON, "demo-survey-001");

    expect(normalized.surveyId).toBe("demo-survey-001");
    expect(normalized.questions.length).toBeGreaterThan(0);
    expect(normalized.questions[0]?.order).toBe(1);
    expect(normalized.garbageCollector.ownerId).toBe("owner-demo-100");
  });

  it("formats valid and invalid dates", () => {
    expect(formatSurveyDate("2026-01-10T00:00:00.000Z")).not.toBe("N/A");
    expect(formatSurveyDate("invalid-date")).toBe("N/A");
    expect(formatSurveyDate(undefined)).toBe("N/A");
  });
});
