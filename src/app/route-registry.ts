import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const APP_ROUTE_PATHS = {
  home: "/",
  forYou: "/for-you",
  survey: "/survey",
  surveyEdit: "/survey/:surveyId/edit",
  createSurvey: "/create-survey",
  drafts: "/drafts",
  communities: "/communities",
  pricing: "/pricing",
  converter: "/converter",
  communityDetails: "/communities/:communityId",
  allCommunities: "/communities/all",
  allSurveys: "/surveys/all",
  profile: "/profile",
  editProfile: "/edit-profile",
  surveyAnalytics: "/surveys/:surveyId/analytics",
  surveyPublished: "/survey-published",
  signIn: "/sign-in",
  signUp: "/sign-up",
  categorizer: "/categorizer",
  privacy: "/privacy",
  terms: "/terms",
  faqs: "/faqs",
  about: "/about",
  contact: "/contact",
  security: "/security",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  buttonShowcase: "/dev/buttons",
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
  surveyEdit: lazy(() => import("@/pages/SurveyEdit")),
  createSurvey: lazy(() => import("@/pages/CreateSurvey")),
  drafts: lazy(() => import("@/pages/Drafts")),
  communities: lazy(() => import("@/pages/Communities")),
  pricing: lazy(() => import("@/pages/Pricing")),
  converter: lazy(() => import("@/pages/Converter")),
  communityDetails: lazy(() => import("@/pages/CommunityDetails")),
  allCommunities: lazy(() => import("@/pages/AllCommunities")),
  allSurveys: lazy(() => import("@/pages/AllSurveys")),
  profile: lazy(() => import("@/pages/Profile")),
  editProfile: lazy(() => import("@/pages/EditProfile")),
  surveyAnalytics: lazy(() => import("@/pages/SurveyAnalytics")),
  surveyPublished: lazy(() => import("@/pages/SurveyPublished")),
  signIn: lazy(() => import("@/pages/SignIn")),
  signUp: lazy(() => import("@/pages/SignUp")),
  categorizer: lazy(() => import("@/pages/Categorizer")),
  privacy: lazy(() => import("@/pages/Privacy")),
  terms: lazy(() => import("@/pages/Terms")),
  faqs: lazy(() => import("@/pages/Faqs")),
  about: lazy(() => import("@/pages/About")),
  contact: lazy(() => import("@/pages/Contact")),
  security: lazy(() => import("@/pages/Security")),
  verifyEmail: lazy(() => import("@/pages/VerifyEmail")),
  forgotPassword: lazy(() => import("@/pages/ForgotPassword")),
  resetPassword: lazy(() => import("@/pages/ResetPassword")),
  buttonShowcase: lazy(() => import("@/pages/ButtonShowcase")),
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
