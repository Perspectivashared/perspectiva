import { APP_ROUTE_PATHS } from "@/app/route-registry";

export const ROUTES = APP_ROUTE_PATHS;

export const getCommunityRoute = (communityId: string) =>
  `/communities/${communityId}`;

export const getSurveyRoute = (surveyId: string | number) =>
  `/surveys/${surveyId}`;

export const getSurveyEditRoute = (surveyId: string | number) =>
  `/surveys/${surveyId}/edit`;

export const getSurveyAnalyticsRoute = (surveyId: string | number) =>
  `/surveys/${surveyId}/analytics`;

export const getSurveyResultsRoute = (surveyId: string | number) =>
  `/surveys/${surveyId}/analytics`;

export const LANDING_SECTION_IDS = {
  howItWorks: "how-it-works",
  communities: "communities",
} as const;
