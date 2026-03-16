import { type RawSurveyPayload } from "@/features/surveys/domain/types";

export const DEFAULT_SURVEY_JSON: RawSurveyPayload = {
  surveyId: "demo-survey-001",
  title: "Student Digital Habits Benchmark",
  description:
    "This placeholder survey is used to test dynamic question rendering, validation, and save/continue behavior before backend integration.",
  acknowledgement:
    "I understand my responses are collected for product and research analysis. Participation is voluntary and I can stop at any time.",
  startDate: "2026-02-20T00:00:00.000Z",
  endDate: "2026-03-20T23:59:59.000Z",
  timeLimitMinutes: 15,
  ownerId: "owner-demo-100",
  category: "Research",
  rewardPoints: 1,
  questions: [
    {
      id: "q-short-text",
      order: 1,
      type: "shortText",
      text: "What is your current area of study?",
      required: true,
      placeholder: "Example: Computer Science",
      maxLength: 120,
      trackingKey: "study_area",
    },
    {
      id: "q-long-text",
      order: 2,
      type: "longText",
      text: "Describe one challenge you face while participating in surveys.",
      description: "A few sentences are enough.",
      required: false,
      placeholder: "Write your thoughts here...",
      sentimentTarget: "pain-point",
    },
    {
      id: "q-single-choice",
      order: 3,
      type: "singleChoice",
      text: "How often do you complete online surveys?",
      required: true,
      options: [
        { label: "Daily", value: "daily" },
        { label: "A few times a week", value: "weekly" },
        { label: "A few times a month", value: "monthly" },
        { label: "Rarely", value: "rarely" },
      ],
      randomizeOptions: false,
    },
    {
      id: "q-multiple-choice",
      order: 4,
      type: "multipleChoice",
      text: "Which devices do you usually use for surveys?",
      required: true,
      options: [
        { label: "Phone", value: "phone" },
        { label: "Laptop", value: "laptop" },
        { label: "Tablet", value: "tablet" },
        { label: "Desktop", value: "desktop" },
      ],
      maxSelections: 3,
    },
    {
      id: "q-dropdown",
      order: 5,
      type: "dropdown",
      text: "Which time slot do you prefer for longer surveys?",
      required: true,
      placeholder: "Select one time slot",
      options: [
        { label: "Morning (6am - 12pm)", value: "morning" },
        { label: "Afternoon (12pm - 5pm)", value: "afternoon" },
        { label: "Evening (5pm - 10pm)", value: "evening" },
        { label: "Late Night (10pm+)", value: "late-night" },
      ],
      uiVariant: "compact",
    },
    {
      id: "q-rating",
      order: 6,
      type: "rating",
      text: "Rate your confidence in providing reliable responses.",
      description: "1 means low confidence. 5 means high confidence.",
      required: true,
      min: 1,
      max: 5,
      step: 1,
      displayStyle: "numeric-scale",
    },
    {
      id: "q-number",
      order: 7,
      type: "number",
      text: "How many hours per week can you dedicate to surveys?",
      required: false,
      min: 0,
      max: 40,
      step: 1,
      unit: "hours",
    },
    {
      id: "q-date",
      order: 8,
      type: "date",
      text: "When did you complete your first online survey?",
      required: false,
      allowFutureDate: false,
    },
    {
      id: "q-yes-no",
      order: 9,
      type: "yesNo",
      text: "Would you like to receive follow-up surveys?",
      required: true,
      followUpTopic: "opt-in",
    },
  ],
};

const createFixtureForId = (surveyId: string): RawSurveyPayload => ({
  ...DEFAULT_SURVEY_JSON,
  surveyId,
});

const LOCAL_SURVEY_FIXTURES: Record<string, RawSurveyPayload> = {
  "demo-survey-001": DEFAULT_SURVEY_JSON,
  "1": createFixtureForId("1"),
  "2": createFixtureForId("2"),
  "3": createFixtureForId("3"),
  "4": createFixtureForId("4"),
};

export const loadSurveyFixture = async (
  surveyId: string,
): Promise<RawSurveyPayload> => {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 200));
  const normalizedSurveyId = surveyId.trim();

  return (
    LOCAL_SURVEY_FIXTURES[normalizedSurveyId] ??
    createFixtureForId(normalizedSurveyId || DEFAULT_SURVEY_JSON.surveyId)
  );
};
