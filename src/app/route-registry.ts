import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const APP_ROUTE_PATHS = {
  home: "/",
  forYou: "/for-you",
  survey: "/surveys/:surveyId",
  surveyEdit: "/surveys/:surveyId/edit",
  surveyResume: "/surveys/:surveyId/resume",
  surveyAnalytics: "/surveys/:surveyId/analytics",
  surveyComparison: "/surveys/compare",
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
  admin: "/admin",
  notifications: "/notifications",
  userProfile: "/u/:username",
} as const;

export type AppRouteKey = keyof typeof APP_ROUTE_PATHS;
export type AppRoutePath = (typeof APP_ROUTE_PATHS)[AppRouteKey];

type RouteComponent = LazyExoticComponent<ComponentType>;

export interface AppRouteDefinition {
  key: AppRouteKey | "notFound";
  path: AppRoutePath | "*";
  component: RouteComponent;
  /** When true, the route requires authentication. */
  protected?: boolean;
  /**
   * Onboarding gate applied on top of `protected`:
   *  - "verified"  → requires a verified email (the categorizer itself)
   *  - "onboarded" → requires categorizer completion (take/create/edit surveys)
   */
  guard?: "verified" | "onboarded";
}

type RouteConfigEntry = Omit<AppRouteDefinition, "path"> & {
  /** Only the catch-all route specifies a path explicitly; others derive it from their key. */
  path?: AppRouteDefinition["path"];
};

const ROUTE_CONFIG: RouteConfigEntry[] = [
  { key: "home",            component: lazy(() => import("@/pages/Index")) },
  { key: "forYou",         component: lazy(() => import("@/pages/ForYou")),         protected: true },
  { key: "survey",         component: lazy(() => import("@/pages/Survey")),         protected: true, guard: "onboarded" },
  { key: "surveyEdit",     component: lazy(() => import("@/pages/SurveyEdit")),     protected: true, guard: "onboarded" },
  { key: "surveyResume",   component: lazy(() => import("@/pages/SurveyResume")),   protected: true, guard: "onboarded" },
  { key: "createSurvey",   component: lazy(() => import("@/pages/CreateSurvey")),   protected: true, guard: "onboarded" },
  { key: "drafts",         component: lazy(() => import("@/pages/Drafts")),         protected: true },
  { key: "communities",    component: lazy(() => import("@/pages/Communities")) },
  { key: "pricing",        component: lazy(() => import("@/pages/Pricing")) },
  { key: "converter",      component: lazy(() => import("@/pages/Converter")),      protected: true, guard: "onboarded" },
  { key: "communityDetails", component: lazy(() => import("@/pages/CommunityDetails")) },
  { key: "allCommunities", component: lazy(() => import("@/pages/AllCommunities")) },
  { key: "allSurveys",     component: lazy(() => import("@/pages/AllSurveys")) },
  { key: "profile",        component: lazy(() => import("@/pages/Profile")),        protected: true },
  { key: "editProfile",    component: lazy(() => import("@/pages/EditProfile")),    protected: true },
  { key: "surveyAnalytics", component: lazy(() => import("@/pages/SurveyAnalytics")), protected: true },
  { key: "surveyComparison", component: lazy(() => import("@/pages/SurveyComparison")), protected: true },
  { key: "surveyPublished", component: lazy(() => import("@/pages/SurveyPublished")) },
  { key: "signIn",         component: lazy(() => import("@/pages/SignIn")) },
  { key: "signUp",         component: lazy(() => import("@/pages/SignUp")) },
  { key: "categorizer",    component: lazy(() => import("@/pages/Categorizer")),    protected: true, guard: "verified" },
  { key: "privacy",        component: lazy(() => import("@/pages/Privacy")) },
  { key: "terms",          component: lazy(() => import("@/pages/Terms")) },
  { key: "faqs",           component: lazy(() => import("@/pages/Faqs")) },
  { key: "about",          component: lazy(() => import("@/pages/About")) },
  { key: "contact",        component: lazy(() => import("@/pages/Contact")) },
  { key: "security",       component: lazy(() => import("@/pages/Security")) },
  { key: "verifyEmail",    component: lazy(() => import("@/pages/VerifyEmail")) },
  { key: "forgotPassword", component: lazy(() => import("@/pages/ForgotPassword")) },
  { key: "resetPassword",  component: lazy(() => import("@/pages/ResetPassword")) },
  { key: "admin",          component: lazy(() => import("@/pages/Admin")),         protected: true },
  { key: "notifications",  component: lazy(() => import("@/pages/Notifications")), protected: true },
  { key: "userProfile",   component: lazy(() => import("@/pages/UserProfile")) },
  // Only include the dev showcase in development builds.
  ...(import.meta.env.DEV
    ? [{ key: "buttonShowcase" as const, component: lazy(() => import("@/pages/ButtonShowcase")) }]
    : []),
  { key: "notFound",       component: lazy(() => import("@/pages/NotFound")),       path: "*" as const },
];

export const APP_ROUTES: readonly AppRouteDefinition[] = ROUTE_CONFIG.map((cfg) => ({
  ...cfg,
  path: cfg.path ?? APP_ROUTE_PATHS[cfg.key as AppRouteKey],
}));
