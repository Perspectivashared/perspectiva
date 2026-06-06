/**
 * Centralized query key factory.
 * All TanStack Query keys must be defined here so that cache invalidations
 * and stale-time policies remain consistent across the codebase.
 */
export const queryKeys = {
  // Surveys
  publishedSurveys: () => ["published-surveys"] as const,
  mySurveys: () => ["my-surveys"] as const,
  completedSurveys: () => ["completed-surveys"] as const,
  savedSurveys: () => ["saved-surveys"] as const,
  inProgressSurveys: () => ["in-progress-surveys"] as const,
  survey: (id: string | number) => ["survey", String(id)] as const,
  surveyAnalytics: (id: string | number, dateFrom?: string, dateTo?: string) =>
    ["analytics", String(id), dateFrom ?? "", dateTo ?? ""] as const,

  // Users / profile
  userProfile: () => ["user-profile"] as const,
  profile: () => ["profile"] as const,
  myAchievements: () => ["my-achievements"] as const,

  // Communities
  communities: () => ["communities"] as const,
  favouriteCommunities: () => ["favourite-communities"] as const,
  joinedCommunities: () => ["joined-communities"] as const,
} as const;
