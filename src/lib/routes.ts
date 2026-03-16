import { APP_ROUTE_PATHS } from "@/app/route-registry";

export const ROUTES = APP_ROUTE_PATHS;

export const getCommunityRoute = (communityId: string) =>
  `/communities/${communityId}`;

export const LANDING_SECTION_IDS = {
  features: "features",
  howItWorks: "how-it-works",
  communities: "communities",
} as const;
