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
  survey: (id: string | number) => ["survey", String(id)] as const,
  surveyAnalytics: (id: string | number, dateFrom?: string, dateTo?: string) =>
    ["analytics", String(id), dateFrom ?? "", dateTo ?? ""] as const,
  surveyComparison: (ids: string) => ["survey-comparison", ids] as const,

  // Users / profile
  /**
   * The single cache entry for GET /users/me. Every component that needs the
   * current user must use this key (typing only the fields it reads) so the
   * profile isn't duplicated across divergent cache entries.
   */
  me: () => ["me"] as const,
  profile: () => ["profile"] as const,
  myAchievements: () => ["my-achievements"] as const,
  myTransactions: () => ["my-transactions"] as const,

  // Communities
  communities: () => ["communities"] as const,
  communityLeaderboard: (id: string) => ["community-leaderboard", id] as const,
  favouriteCommunities: () => ["favourite-communities"] as const,
  joinedCommunities: () => ["joined-communities"] as const,
  savedForLater: () => ["saved-for-later"] as const,

  // Notifications
  notifications: () => ["notifications"] as const,
  notificationsUnread: () => ["notifications-unread"] as const,

  // Admin
  adminStats: () => ["admin-stats"] as const,
  adminUsers: (q?: string) => ["admin-users", q ?? ""] as const,
  adminSurveys: (status?: string) => ["admin-surveys", status ?? ""] as const,

  // Leaderboard + public profiles
  leaderboard: () => ["leaderboard"] as const,
  myRating: (surveyId: string | number) => ["my-rating", String(surveyId)] as const,
  publicProfile: (username: string) => ["public-profile", username] as const,
} as const;

/** Invalidate all keys that contain user profile/identity data. */
export const invalidateUserProfile = async (
  queryClient: import("@tanstack/react-query").QueryClient,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.me() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.myTransactions() }),
  ]);
};
