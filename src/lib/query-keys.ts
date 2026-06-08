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
  surveyComparison: (ids: string) => ["survey-comparison", ids] as const,

  // Users / profile
  userProfile: () => ["user-profile"] as const,
  profile: () => ["profile"] as const,
  meRaw: () => ["me-raw"] as const,
  myAchievements: () => ["my-achievements"] as const,
  myTransactions: () => ["my-transactions"] as const,

  // Communities
  communities: () => ["communities"] as const,
  communityLeaderboard: (id: string) => ["community-leaderboard", id] as const,
  favouriteCommunities: () => ["favourite-communities"] as const,
  joinedCommunities: () => ["joined-communities"] as const,
} as const;

/** Invalidate all keys that contain user profile/identity data. */
export const invalidateUserProfile = async (
  queryClient: import("@tanstack/react-query").QueryClient,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.meRaw() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.myTransactions() }),
  ]);
};
