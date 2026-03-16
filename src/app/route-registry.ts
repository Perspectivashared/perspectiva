import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const APP_ROUTE_PATHS = {
  home: "/",
  forYou: "/for-you",
  survey: "/survey",
  createSurvey: "/create-survey",
  communities: "/communities",
  pricing: "/pricing",
  converter: "/converter",
  communityDetails: "/communities/:communityId",
  allCommunities: "/communities/all",
  profile: "/profile",
  signIn: "/sign-in",
  signUp: "/sign-up",
  categorizer: "/categorizer",
  editProfile: "/edit-profile",
  surveyAnalytics: "/surveys/:surveyId/analytics",
  surveyPublished: "/survey-published",
} as const;

export type AppRouteKey = keyof typeof APP_ROUTE_PATHS;
export type AppRoutePath = (typeof APP_ROUTE_PATHS)[AppRouteKey];

type RouteComponent = LazyExoticComponent<ComponentType>;

export interface AppRouteDefinition {
  key: AppRouteKey | "notFound";
  path: AppRoutePath | "*";
  component: RouteComponent;
}

const routeComponents: Record<AppRouteKey | "notFound", RouteComponent> = {
  home: lazy(() => import("@/pages/Index")),
  forYou: lazy(() => import("@/pages/ForYou")),
  survey: lazy(() => import("@/pages/Survey")),
  createSurvey: lazy(() => import("@/pages/CreateSurvey")),
  communities: lazy(() => import("@/pages/Communities")),
  pricing: lazy(() => import("@/pages/Pricing")),
  converter: lazy(() => import("@/pages/Converter")),
  communityDetails: lazy(() => import("@/pages/CommunityDetails")),
  allCommunities: lazy(() => import("@/pages/AllCommunities")),
  profile: lazy(() => import("@/pages/Profile")),
  signIn: lazy(() => import("@/pages/SignIn")),
  signUp: lazy(() => import("@/pages/SignUp")),
  categorizer: lazy(() => import("@/pages/Categorizer")),
  editProfile: lazy(() => import("@/pages/EditProfile")),
  surveyAnalytics: lazy(() => import("@/pages/SurveyAnalytics")),
  surveyPublished: lazy(() => import("@/pages/SurveyPublished")),
  notFound: lazy(() => import("@/pages/NotFound")),
};

export const APP_ROUTES: readonly AppRouteDefinition[] = [
  ...Object.entries(APP_ROUTE_PATHS).map(([key, path]) => ({
    key: key as AppRouteKey,
    path,
    component: routeComponents[key as AppRouteKey],
  })),
  {
    key: "notFound",
    path: "*",
    component: routeComponents.notFound,
  },
];
