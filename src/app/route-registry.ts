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
  heroLab: "/dev/hero-lab",
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
  /** Page title for <title> and og:title */
  title?: string;
  /** Meta description */
  description?: string;
  /** If true, add <meta name="robots" content="noindex"> */
  noindex?: boolean;
}

type RouteConfigEntry = Omit<AppRouteDefinition, "path"> & {
  /** Only the catch-all route specifies a path explicitly; others derive it from their key. */
  path?: AppRouteDefinition["path"];
};

const ROUTE_CONFIG: RouteConfigEntry[] = [
  { key: "home",            component: lazy(() => import("@/pages/Index")),          title: "Perspectiva - Gamified Survey Exchange Platform", description: "Join Perspectiva, earn points by completing surveys, publish your own research, and join communities of researchers." },
  { key: "forYou",         component: lazy(() => import("@/pages/ForYou")),         protected: true, title: "For You | Perspectiva", description: "Surveys curated for you based on your profile." },
  { key: "survey",         component: lazy(() => import("@/pages/Survey")),         protected: true, guard: "onboarded" },
  { key: "surveyEdit",     component: lazy(() => import("@/pages/SurveyEdit")),     protected: true, guard: "onboarded" },
  { key: "surveyResume",   component: lazy(() => import("@/pages/SurveyResume")),   protected: true, guard: "onboarded" },
  { key: "createSurvey",   component: lazy(() => import("@/pages/CreateSurvey")),   protected: true, guard: "onboarded" },
  { key: "drafts",         component: lazy(() => import("@/pages/Drafts")),         protected: true },
  { key: "communities",    component: lazy(() => import("@/pages/Communities")),    title: "Communities | Perspectiva", description: "Join research communities and connect with researchers on Perspectiva." },
  { key: "pricing",        component: lazy(() => import("@/pages/Pricing")),        title: "Pricing | Perspectiva", description: "Choose a plan to publish surveys and get insights on Perspectiva." },
  { key: "converter",      component: lazy(() => import("@/pages/Converter")),      protected: true, guard: "onboarded" },
  { key: "communityDetails", component: lazy(() => import("@/pages/CommunityDetails")) },
  { key: "allCommunities", component: lazy(() => import("@/pages/AllCommunities")), title: "All Communities | Perspectiva" },
  { key: "allSurveys",     component: lazy(() => import("@/pages/AllSurveys")),    title: "All Surveys | Perspectiva", description: "Browse all published surveys on Perspectiva." },
  { key: "profile",        component: lazy(() => import("@/pages/Profile")),        protected: true },
  { key: "editProfile",    component: lazy(() => import("@/pages/EditProfile")),    protected: true },
  { key: "surveyAnalytics", component: lazy(() => import("@/pages/SurveyAnalytics")), protected: true },
  { key: "surveyComparison", component: lazy(() => import("@/pages/SurveyComparison")), protected: true },
  { key: "surveyPublished", component: lazy(() => import("@/pages/SurveyPublished")) },
  { key: "signIn",         component: lazy(() => import("@/pages/SignIn")),         title: "Sign In | Perspectiva" },
  { key: "signUp",         component: lazy(() => import("@/pages/SignUp")),         title: "Sign Up | Perspectiva" },
  { key: "categorizer",    component: lazy(() => import("@/pages/Categorizer")),    protected: true, guard: "verified" },
  { key: "privacy",        component: lazy(() => import("@/pages/Privacy")),       title: "Privacy Policy | Perspectiva" },
  { key: "terms",          component: lazy(() => import("@/pages/Terms")),          title: "Terms of Service | Perspectiva" },
  { key: "faqs",           component: lazy(() => import("@/pages/Faqs")),           title: "FAQs | Perspectiva", description: "Frequently asked questions about Perspectiva, surveys, pricing, and data privacy." },
  { key: "about",          component: lazy(() => import("@/pages/About")),          title: "About | Perspectiva", description: "Learn about Perspectiva, the gamified survey exchange platform for researchers and students." },
  { key: "contact",        component: lazy(() => import("@/pages/Contact")),        title: "Contact | Perspectiva" },
  { key: "security",       component: lazy(() => import("@/pages/Security")),       title: "Security | Perspectiva" },
  { key: "verifyEmail",    component: lazy(() => import("@/pages/VerifyEmail")) },
  { key: "forgotPassword", component: lazy(() => import("@/pages/ForgotPassword")) },
  { key: "resetPassword",  component: lazy(() => import("@/pages/ResetPassword")) },
  { key: "admin",          component: lazy(() => import("@/pages/Admin")),         protected: true },
  { key: "notifications",  component: lazy(() => import("@/pages/Notifications")), protected: true },
  { key: "userProfile",   component: lazy(() => import("@/pages/UserProfile")) },
  // Only include the dev showcase in development builds.
  ...(import.meta.env.DEV
    ? [
        { key: "buttonShowcase" as const, component: lazy(() => import("@/pages/ButtonShowcase")) },
        { key: "heroLab" as const, component: lazy(() => import("@/pages/HeroLab")), noindex: true },
      ]
    : []),
  { key: "notFound",       component: lazy(() => import("@/pages/NotFound")),       path: "*" as const, title: "Page Not Found | Perspectiva", noindex: true },
];

export const APP_ROUTES: readonly AppRouteDefinition[] = ROUTE_CONFIG.map((cfg) => ({
  ...cfg,
  path: cfg.path ?? APP_ROUTE_PATHS[cfg.key as AppRouteKey],
}));
