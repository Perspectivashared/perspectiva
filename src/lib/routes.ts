import { APP_ROUTE_PATHS } from "@/app/route-registry";

export const ROUTES = APP_ROUTE_PATHS;

export const getCommunityRoute = (communityId: string) =>
  `/communities/${communityId}`;

export const getSurveyEditRoute = (surveyId: string) =>
  `/survey/${surveyId}/edit`;

export const getSurveyResultsRoute = (surveyId: string) =>
  `/survey/${surveyId}/results`;

export const LANDING_SECTION_IDS = {
  howItWorks: "how-it-works",
  communities: "communities",
} as const;
