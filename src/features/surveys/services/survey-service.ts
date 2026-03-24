import { normalizeSurveyDefinition } from "@/features/surveys/domain/normalizers";
import {
  DEFAULT_SURVEY_JSON,
  loadSurveyFixture,
} from "@/features/surveys/domain/fixtures";
import type {
  RawSurveyPayload,
  SurveyDefinition,
} from "@/features/surveys/domain/types";

export interface SurveySummary {
  surveyId: string;
  title: string;
  description: string;
  createdAt: string;
  endDate: string;
  status: "active" | "draft" | "closed";
  responses: number;
  category: string;
  targetResponses: number;
  rewardPoints: number;
  matchScore: number;
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  averageScore: number;
  responseDistribution: Array<{ label: string; value: number }>;
}

export interface SurveyRepository {
  fetchUserSurveys: () => Promise<SurveySummary[]>;
  fetchAvailableSurveys: () => Promise<SurveySummary[]>;
  fetchSurveyById: (surveyId: string) => Promise<SurveyDefinition>;
  saveSurvey: (survey: RawSurveyPayload) => Promise<void>;
  fetchSurveyAnalytics: (surveyId: string) => Promise<SurveyAnalytics>;
}

interface SurveyServiceDependencies {
  now: () => number;
  random: () => number;
  sleep: (milliseconds: number) => Promise<void>;
}

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
const ANALYTICS_CACHE_TTL_MS = 60_000;

const defaultDependencies: SurveyServiceDependencies = {
  now: () => Date.now(),
  random: () => Math.random(),
  sleep: (milliseconds) =>
    new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds)),
};

const distributionWeights = [
  { label: "Strongly agree", weight: 0.22 },
  { label: "Agree", weight: 0.34 },
  { label: "Neutral", weight: 0.18 },
  { label: "Disagree", weight: 0.16 },
  { label: "Strongly disagree", weight: 0.1 },
] as const;

const buildResponseDistribution = (totalResponses: number) => {
  const baseValues = distributionWeights.map(({ weight }) =>
    Math.floor(totalResponses * weight),
  );

  const allocated = baseValues.reduce((sum, value) => sum + value, 0);
  const remainder = Math.max(0, totalResponses - allocated);
  if (remainder > 0) {
    baseValues[baseValues.length - 1] += remainder;
  }

  return distributionWeights.map(({ label }, index) => ({
    label,
    value: baseValues[index],
  }));
};

const normalizeSurveyId = (surveyId: string) => surveyId.trim();

const cloneSurveyDefinition = (
  survey: SurveyDefinition,
): SurveyDefinition => ({
  ...survey,
  questions: survey.questions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
    garbageCollector: { ...question.garbageCollector },
  })),
  garbageCollector: { ...survey.garbageCollector },
});

const cloneSurveyAnalytics = (analytics: SurveyAnalytics): SurveyAnalytics => ({
  ...analytics,
  responseDistribution: analytics.responseDistribution.map((item) => ({
    ...item,
  })),
});

const createMockSurveySummary = (
  now: number,
  summary: Omit<SurveySummary, "createdAt" | "endDate"> & {
    daysAgo: number;
    daysUntilEnd: number;
  },
): SurveySummary => {
  const { daysAgo, daysUntilEnd, ...rest } = summary;
  return {
    ...rest,
    createdAt: new Date(now - daysAgo * DAY_IN_MILLISECONDS).toISOString(),
    endDate: new Date(now + daysUntilEnd * DAY_IN_MILLISECONDS).toISOString(),
  };
};

export const createMockSurveyRepository = (
  dependencies: Partial<SurveyServiceDependencies> = {},
): SurveyRepository => {
  const deps: SurveyServiceDependencies = {
    ...defaultDependencies,
    ...dependencies,
  };
  let surveySummariesCache: SurveySummary[] | null = null;
  let availableSurveysCache: SurveySummary[] | null = null;
  const surveyDefinitionCache = new Map<string, SurveyDefinition>();
  const analyticsCache = new Map<
    string,
    { data: SurveyAnalytics; createdAt: number }
  >();

  return {
    fetchUserSurveys: async () => {
      if (surveySummariesCache) {
        return surveySummariesCache.map((s) => ({ ...s }));
      }

      await deps.sleep(300);

      const now = deps.now();
      surveySummariesCache = [
        createMockSurveySummary(now, {
          surveyId: "demo-survey-001",
          title: DEFAULT_SURVEY_JSON.title,
          description: DEFAULT_SURVEY_JSON.description,
          daysAgo: 0,
          daysUntilEnd: 30,
          status: "active",
          responses: 132,
          category: "Research",
          targetResponses: 200,
          rewardPoints: 10,
          matchScore: 88,
        }),
        createMockSurveySummary(now, {
          surveyId: "1",
          title: "Campus Technology Use",
          description: "A quick poll about student technology habits.",
          daysAgo: 7,
          daysUntilEnd: -7,
          status: "closed",
          responses: 84,
          category: "Technology",
          targetResponses: 100,
          rewardPoints: 8,
          matchScore: 75,
        }),
        createMockSurveySummary(now, {
          surveyId: "2",
          title: "Course Feedback Survey",
          description: "Gather feedback about course quality.",
          daysAgo: 14,
          daysUntilEnd: 14,
          status: "active",
          responses: 25,
          category: "Education",
          targetResponses: 60,
          rewardPoints: 8,
          matchScore: 71,
        }),
      ];

      return surveySummariesCache.map((s) => ({ ...s }));
    },

    fetchAvailableSurveys: async () => {
      if (availableSurveysCache) {
        return availableSurveysCache.map((s) => ({ ...s }));
      }

      await deps.sleep(300);

      const now = deps.now();
      availableSurveysCache = [
        createMockSurveySummary(now, {
          surveyId: "avail-001",
          title: "Student Entrepreneurship Research",
          description:
            "Understanding the challenges faced by student entrepreneurs in their first year of business.",
          daysAgo: 14,
          daysUntilEnd: 3,
          status: "active",
          responses: 45,
          category: "Business",
          targetResponses: 100,
          rewardPoints: 15,
          matchScore: 95,
        }),
        createMockSurveySummary(now, {
          surveyId: "avail-002",
          title: "AI Tools in Education Survey",
          description:
            "How students are using AI tools like ChatGPT for learning and research.",
          daysAgo: 3,
          daysUntilEnd: 12,
          status: "active",
          responses: 78,
          category: "Technology",
          targetResponses: 150,
          rewardPoints: 10,
          matchScore: 92,
        }),
        createMockSurveySummary(now, {
          surveyId: "avail-003",
          title: "Sports Nutrition Habits",
          description:
            "Dietary patterns and supplement usage among college athletes.",
          daysAgo: 21,
          daysUntilEnd: 2,
          status: "active",
          responses: 34,
          category: "Sports Science",
          targetResponses: 80,
          rewardPoints: 8,
          matchScore: 71,
        }),
        createMockSurveySummary(now, {
          surveyId: "avail-004",
          title: "Sustainable Finance Awareness",
          description:
            "Student perspectives on ESG investing and green finance.",
          daysAgo: 10,
          daysUntilEnd: 7,
          status: "active",
          responses: 56,
          category: "Economics",
          targetResponses: 120,
          rewardPoints: 12,
          matchScore: 85,
        }),
        createMockSurveySummary(now, {
          surveyId: "avail-005",
          title: "Mental Health in Academia",
          description:
            "Exploring stress, burnout, and wellbeing support structures for university students.",
          daysAgo: 2,
          daysUntilEnd: 15,
          status: "active",
          responses: 22,
          category: "Psychology",
          targetResponses: 100,
          rewardPoints: 10,
          matchScore: 79,
        }),
        createMockSurveySummary(now, {
          surveyId: "avail-006",
          title: "Remote Work Productivity Study",
          description:
            "Assessing productivity trends and communication habits among remote student workers.",
          daysAgo: 4,
          daysUntilEnd: 20,
          status: "active",
          responses: 110,
          category: "Business",
          targetResponses: 200,
          rewardPoints: 8,
          matchScore: 72,
        }),
        createMockSurveySummary(now, {
          surveyId: "avail-007",
          title: "Climate Change Awareness Survey",
          description:
            "Student attitudes and behaviours related to climate change and sustainability.",
          daysAgo: 10,
          daysUntilEnd: 30,
          status: "active",
          responses: 67,
          category: "Environmental Science",
          targetResponses: 150,
          rewardPoints: 6,
          matchScore: 68,
        }),
      ];

      return availableSurveysCache.map((s) => ({ ...s }));
    },

    fetchSurveyById: async (surveyId: string) => {
      const normalizedSurveyId =
        normalizeSurveyId(surveyId) || DEFAULT_SURVEY_JSON.surveyId;
      const cachedSurvey = surveyDefinitionCache.get(normalizedSurveyId);
      if (cachedSurvey) {
        return cloneSurveyDefinition(cachedSurvey);
      }

      const rawSurvey = await loadSurveyFixture(normalizedSurveyId);
      const normalizedSurvey = normalizeSurveyDefinition(
        rawSurvey,
        normalizedSurveyId,
      );
      surveyDefinitionCache.set(normalizedSurveyId, normalizedSurvey);

      return cloneSurveyDefinition(normalizedSurvey);
    },

    saveSurvey: async (survey: RawSurveyPayload) => {
      await deps.sleep(500);

      const normalizedSurveyId = normalizeSurveyId(survey.surveyId);
      surveySummariesCache = null;

      if (normalizedSurveyId) {
        surveyDefinitionCache.delete(normalizedSurveyId);
        analyticsCache.delete(normalizedSurveyId);
      }
    },

    fetchSurveyAnalytics: async (surveyId: string) => {
      const normalizedSurveyId = normalizeSurveyId(surveyId);
      const cachedAnalytics = analyticsCache.get(normalizedSurveyId);
      const now = deps.now();
      if (
        cachedAnalytics &&
        now - cachedAnalytics.createdAt < ANALYTICS_CACHE_TTL_MS
      ) {
        return cloneSurveyAnalytics(cachedAnalytics.data);
      }

      await deps.sleep(450);

      const totalResponses = 132 + Math.floor(deps.random() * 40);
      const completionRate = 60 + Math.floor(deps.random() * 30);

      const generatedAnalytics = {
        surveyId: normalizedSurveyId,
        totalResponses,
        completionRate,
        averageScore: 3.9 + deps.random() * 1.0,
        responseDistribution: buildResponseDistribution(totalResponses),
      };

      analyticsCache.set(normalizedSurveyId, {
        data: generatedAnalytics,
        createdAt: deps.now(),
      });

      return cloneSurveyAnalytics(generatedAnalytics);
    },
  };
};

const defaultSurveyRepository = createMockSurveyRepository();

export const fetchUserSurveys = () => defaultSurveyRepository.fetchUserSurveys();

export const fetchAvailableSurveys = () =>
  defaultSurveyRepository.fetchAvailableSurveys();

export const fetchSurveyById = (surveyId: string) =>
  defaultSurveyRepository.fetchSurveyById(surveyId);

export const saveSurvey = (survey: RawSurveyPayload) =>
  defaultSurveyRepository.saveSurvey(survey);

export const fetchSurveyAnalytics = (surveyId: string) =>
  defaultSurveyRepository.fetchSurveyAnalytics(surveyId);
