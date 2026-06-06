import * as z from "zod";

export const platformEnum = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Telegram",
  "WhatsApp",
  "Twitter / X",
  "LinkedIn",
  "Reddit",
  "Discord",
] as const;

export const engagementFeatureEnum = [
  "streaks",
  "Badges of achievement",
  "Leaderboard",
  "Points/ Coins",
  "Progress journey",
  "Stats",
] as const;

export const paymentFactorEnum = [
  "Unlocking key features",
  "Removing limits",
  "Saving time",
  "Social proof",
  "Discounts",
] as const;

export const interestEnum = [
  "Sports & Fitness",
  "Gaming",
  "Music",
  "Art & Design",
  "Travel",
  "Food & Cooking",
  "Fashion & Beauty",
  "Technology",
  "Finance & Investing",
  "Reading & Writing",
  "Photography / Video",
  "Nature & Outdoors",
  "Volunteering / Social causes",
] as const;

export const topicOfInterestEnum = [
  "Products & Consumer goods",
  "Food & Beverages",
  "Health & Wellness",
  "Technology & Apps",
  "Finance & Banking",
  "Education",
  "Entertainment & Media",
  "Travel & Hospitality",
  "Government & Policy",
  "Sustainability & Environment",
] as const;

export const communityEngagementMotivationEnum = [
  "Learning something new",
  "Sharing my opinions",
  "Making connections",
  "Earning rewards",
  "Being part of something meaningful",
  "Getting exclusive access",
] as const;

export const surveyCompletionMotivatorEnum = [
  "Cash / voucher reward",
  "Points / in-app rewards",
  "Knowing the results will be shared",
  "Short length",
  "Interesting topic",
  "Trusted brand asking",
] as const;

export const surveyTurnOffEnum = [
  "Too long",
  "Too personal / intrusive",
  "Irrelevant to me",
  "No reward",
  "Confusing questions",
  "Too many surveys already",
] as const;

export const productDiscoveryChannelEnum = [
  "Social media ads",
  "Friend / family recommendations",
  "Influencer / content creator reviews",
  "Search engines",
  "Online communities / forums",
  "In-store browsing",
] as const;

export const loyaltyFactorEnum = [
  "Consistent rewards",
  "Surveys on topics I care about",
  "A community I enjoy",
  "Recognition / status (badges, ranks)",
  "Learning from results",
  "A great mobile experience",
] as const;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const requiredEnum = <T extends [string, ...string[]]>(values: T) =>
  z.enum(values, { required_error: "Please select an option" });

const acknowledgementSchema = z.object({
  accept: z.boolean().refine((val) => val === true, {
    message: "You must accept to proceed",
  }),
});

const basicInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email").min(1, "Email is required"),
  age: z.number().min(1, "Age must be at least 1"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  primaryStatus: requiredEnum([
    "Secondary school student",
    "Polytechnic student",
    "JC / IB student",
    "University student",
    "Working adult",
    "Founder / self employed",
    "Retired",
    "Unemployed",
    "Independent researcher",
  ]),
  gender: requiredEnum([
    "Male",
    "Female",
    "Non-binary / gender diverse",
    "Prefer not to say",
  ]),
  livingSituation: requiredEnum([
    "Alone",
    "With family / parents",
    "With a partner",
    "With roommates / flatmates",
    "Other",
  ]),
  spokenLanguages: z
    .array(z.string())
    .min(1, "Please select at least one language"),
});

const professionSchema = z.object({
  profession: z.string().min(1, "Profession is required"),
  industry: requiredEnum([
    "Technology & Software",
    "Finance & Banking",
    "Healthcare & Medicine",
    "Education",
    "Retail & E-commerce",
    "Media & Entertainment",
    "Government & Public sector",
    "Marketing & Advertising",
    "Manufacturing & Engineering",
    "Non-profit / Social services",
    "Student — not yet in industry",
    "Other",
  ]),
});

const incomeSchema = z.object({
  monthlyIncome: z.number().min(0).optional(),
  monthlyAllowance: z.number().min(0, "Monthly allowance must be a positive number"),
  incomeSources: z.array(z.string()).optional(),
});

const expenditureSchema = z.object({
  majorExpenditures: z.array(z.string()).optional(),
  mainExpediture: z.string().optional(),
  onlineWeeklySpedingPattern: requiredEnum([
    "Multiple times a week",
    "Weekly",
    "Monthly",
    "Rarely",
    "Never",
  ]),
  onlinePurchaseChannels: z.array(z.string()).optional(),
  priceSensitivityTowardsDigitalProducts: requiredEnum([
    "Extremely price-sensitive",
    "Somewhat price-sensitive",
    "Neutral",
    "Willing to pay for quality",
  ]),
});

const digitalActivitySchema = z.object({
  averageDailyScreenTime: z.number().min(0, "Screen time must be a positive number"),
  dailyPlatformUsage: z.array(z.enum(platformEnum)).optional(),
  mostUsedPlatform: z.string().optional(),
  appUsagePatterns: requiredEnum(["Quick and frequent", "Long and focused", "Mixed"]),
  favouriteEngagementFeatures: z.array(z.enum(engagementFeatureEnum)).optional(),
});

const paymentSchema = z.object({
  everPaidForDigitalContent: requiredEnum(["Yes", "No"]),
  convincingFactorsForPayment: z.array(z.enum(paymentFactorEnum)).optional(),
  comfortableSubscriptionPrice: requiredEnum([
    "Under $5",
    "$5 to $10",
    "$10 to $20",
    "$20 and above",
  ]),
  preferredPaymentMethods: requiredEnum(["Monthly", "Annually", "One-time"]),
});

const psychographicsSchema = z.object({
  interests: z.array(z.enum(interestEnum)).optional(),
  topicsOfInterest: z.array(z.enum(topicOfInterestEnum)).optional(),
  personalityType: requiredEnum([
    "Very introverted",
    "Somewhat introverted",
    "Somewhat extroverted",
    "Very extroverted",
  ]),
});

const communitySchema = z.object({
  communityParticipationStyle: requiredEnum([
    "I mostly observe / lurk",
    "I occasionally comment or react",
    "I actively post and engage",
    "I take on leadership / moderator roles",
  ]),
  preferredCommunitySize: requiredEnum([
    "Small, tight-knit groups (< 50 people)",
    "Medium-sized focused communities (50–500)",
    "Large general interest communities (500+)",
    "I don't participate in communities",
  ]),
  communityEngagementMotivations: z.array(z.enum(communityEngagementMotivationEnum)).optional(),
});

const surveyBehaviourSchema = z.object({
  surveyParticipationFrequency: requiredEnum([
    "Never",
    "A few times a year",
    "Monthly",
    "Weekly or more",
  ]),
  maxSurveyTime: requiredEnum([
    "Under 2 minutes",
    "2–5 minutes",
    "5–10 minutes",
    "10–20 minutes",
    "20+ minutes (if rewarded well)",
  ]),
  surveyCompletionMotivators: z.array(z.enum(surveyCompletionMotivatorEnum)).optional(),
  surveyTurnOffs: z.array(z.enum(surveyTurnOffEnum)).optional(),
});

const technologySchema = z.object({
  primaryDevice: requiredEnum([
    "Smartphone only",
    "Mostly smartphone, sometimes laptop",
    "Mostly laptop, sometimes smartphone",
    "Desktop / PC primarily",
  ]),
  techSavviness: requiredEnum([
    "I struggle with new technology",
    "I manage but need help sometimes",
    "I'm comfortable with most tech",
    "I'm an early adopter / tech enthusiast",
  ]),
  aiToolsUsage: requiredEnum([
    "No, never tried them",
    "I've tried but don't use regularly",
    "Yes, occasionally",
    "Yes, daily",
  ]),
});

const valuesSchema = z.object({
  purchaseDecisionFactor: requiredEnum([
    "Price / affordability",
    "Quality & durability",
    "Brand reputation",
    "Peer recommendations",
    "Sustainability / ethics",
    "Convenience",
  ]),
  productDiscoveryChannels: z.array(z.enum(productDiscoveryChannelEnum)).optional(),
  sustainabilityImportance: requiredEnum([
    "Not important at all",
    "Slightly important",
    "Moderately important",
    "Very important — it drives my decisions",
  ]),
});

const goalsSchema = z.object({
  primaryReasonForJoining: requiredEnum([
    "To earn rewards",
    "To share my opinions",
    "To discover surveys / research",
    "To connect with a community",
    "To create surveys / gather data",
    "Just exploring",
  ]),
  loyaltyFactors: z.array(z.enum(loyaltyFactorEnum)).optional(),
});

const feedbackSchema = z.object({
  preferredFeedbackFormat: requiredEnum([
    "Surveys",
    "Online I-on-I short interviews",
    "Online group interviews",
    "In-person events",
  ]),
  gamifiedRewardsForFeedback: requiredEnum(["Yes", "Maybe", "No"]),
});

export const categorizerSchema = acknowledgementSchema
  .merge(basicInfoSchema)
  .merge(professionSchema)
  .merge(incomeSchema)
  .merge(expenditureSchema)
  .merge(digitalActivitySchema)
  .merge(paymentSchema)
  .merge(psychographicsSchema)
  .merge(communitySchema)
  .merge(surveyBehaviourSchema)
  .merge(technologySchema)
  .merge(valuesSchema)
  .merge(goalsSchema)
  .merge(feedbackSchema);

export type CategorizerFormValues = z.infer<typeof categorizerSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blank = () => undefined as any;

export const createDefaultCategorizerValues = (): CategorizerFormValues => ({
  accept: false,
  fullName: "",
  email: "",
  age: 0,
  country: "",
  city: "",
  primaryStatus: blank(),
  gender: blank(),
  livingSituation: blank(),
  spokenLanguages: [],
  profession: "",
  industry: blank(),
  monthlyIncome: undefined,
  monthlyAllowance: 0,
  incomeSources: [],
  majorExpenditures: [],
  mainExpediture: "",
  onlineWeeklySpedingPattern: blank(),
  onlinePurchaseChannels: [],
  priceSensitivityTowardsDigitalProducts: blank(),
  averageDailyScreenTime: 0,
  dailyPlatformUsage: [],
  mostUsedPlatform: "",
  appUsagePatterns: blank(),
  favouriteEngagementFeatures: [],
  everPaidForDigitalContent: blank(),
  convincingFactorsForPayment: [],
  comfortableSubscriptionPrice: blank(),
  preferredPaymentMethods: blank(),
  interests: [],
  topicsOfInterest: [],
  personalityType: blank(),
  communityParticipationStyle: blank(),
  preferredCommunitySize: blank(),
  communityEngagementMotivations: [],
  surveyParticipationFrequency: blank(),
  maxSurveyTime: blank(),
  surveyCompletionMotivators: [],
  surveyTurnOffs: [],
  primaryDevice: blank(),
  techSavviness: blank(),
  aiToolsUsage: blank(),
  purchaseDecisionFactor: blank(),
  productDiscoveryChannels: [],
  sustainabilityImportance: blank(),
  primaryReasonForJoining: blank(),
  loyaltyFactors: [],
  preferredFeedbackFormat: blank(),
  gamifiedRewardsForFeedback: blank(),
});
