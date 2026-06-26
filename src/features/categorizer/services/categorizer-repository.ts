import { api } from "@/lib/api";
import type { CategorizerFormValues } from "@/features/categorizer/domain/schema";

/**
 * Maps the categorizer form (camelCase) onto the backend's snake_case
 * `PUT /users/me/profile` contract (app/users/schemas.py: UserProfileRequest).
 * Optional answers fall back to null/[] so the wire payload is always complete.
 */
export const toProfilePayload = (d: CategorizerFormValues) => ({
  accepted_data_policy: d.accept,
  full_name: d.fullName,
  profile_email: d.email,
  age: d.age,
  country: d.country,
  city: d.city,
  primary_status: d.primaryStatus,
  gender: d.gender,
  living_situation: d.livingSituation,
  spoken_languages: d.spokenLanguages ?? [],
  profession_text: d.profession,
  industry: d.industry,
  monthly_income: d.monthlyIncome ?? null,
  monthly_allowance: d.monthlyAllowance,
  income_sources: d.incomeSources ?? [],
  major_expenditures: d.majorExpenditures ?? [],
  main_expenditure: d.mainExpediture ?? null,
  online_weekly_spending_pattern: d.onlineWeeklySpedingPattern,
  online_purchase_channels: d.onlinePurchaseChannels ?? [],
  price_sensitivity_digital: d.priceSensitivityTowardsDigitalProducts,
  avg_daily_screen_time: d.averageDailyScreenTime,
  daily_platform_usage: d.dailyPlatformUsage ?? [],
  most_used_platform: d.mostUsedPlatform ?? null,
  app_usage_patterns: d.appUsagePatterns,
  favourite_engagement_features: d.favouriteEngagementFeatures ?? [],
  ever_paid_digital: d.everPaidForDigitalContent,
  convincing_payment_factors: d.convincingFactorsForPayment ?? [],
  comfortable_subscription_price: d.comfortableSubscriptionPrice,
  preferred_payment_frequency: d.preferredPaymentMethods,
  interests: d.interests ?? [],
  topics_of_interest: d.topicsOfInterest ?? [],
  personality_type: d.personalityType,
  community_participation_style: d.communityParticipationStyle,
  preferred_community_size: d.preferredCommunitySize,
  community_engagement_motivations: d.communityEngagementMotivations ?? [],
  survey_participation_frequency: d.surveyParticipationFrequency,
  max_survey_time: d.maxSurveyTime,
  survey_completion_motivators: d.surveyCompletionMotivators ?? [],
  survey_turn_offs: d.surveyTurnOffs ?? [],
  primary_device: d.primaryDevice,
  tech_savviness: d.techSavviness,
  ai_tools_usage: d.aiToolsUsage,
  purchase_decision_factor: d.purchaseDecisionFactor,
  product_discovery_channels: d.productDiscoveryChannels ?? [],
  sustainability_importance: d.sustainabilityImportance,
  primary_reason_for_joining: d.primaryReasonForJoining,
  loyalty_factors: d.loyaltyFactors ?? [],
  preferred_feedback_format: d.preferredFeedbackFormat,
  gamified_rewards_for_feedback: d.gamifiedRewardsForFeedback,
});

/** Persist the categorizer questionnaire and complete onboarding. */
export const submitCategorizerProfile = (data: CategorizerFormValues): Promise<unknown> =>
  api.put("/users/me/profile", toProfilePayload(data));
