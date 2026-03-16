import {
  hasDraftSurvey,
  loadDraftSurvey,
  saveDraftSurvey,
  SURVEY_DRAFT_STORAGE_KEY,
} from "@/features/survey-builder/services/draft-storage";
import { createInitialSurveyBuilderState } from "@/features/survey-builder/domain/reducer";

describe("draft survey storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads draft", () => {
    const draft = createInitialSurveyBuilderState();
    draft.surveyTitle = "Draft title";

    saveDraftSurvey(draft);

    expect(hasDraftSurvey()).toBe(true);
    expect(loadDraftSurvey()?.surveyTitle).toBe("Draft title");
  });

  it("returns null for invalid draft payload", () => {
    localStorage.setItem(SURVEY_DRAFT_STORAGE_KEY, JSON.stringify({ bad: true }));

    expect(loadDraftSurvey()).toBeNull();
  });
});
