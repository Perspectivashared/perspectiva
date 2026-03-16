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

const acknowledgementSchema = z.object({
  accept: z.boolean().refine((val) => val === true, {
    message: "You must accept to proceed",
  }),
});

const basicInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required"),
  age: z.number().min(0, "Age must be a positive number"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  primaryStatus: z.enum([
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
});

const professionSchema = z.object({
  profession: z.string().min(1, "Profession is required"),
});

const incomeSchema = z.object({
  monthlyIncome: z
    .number()
    .min(0, "Monthly income must be a positive number")
    .optional(),
  monthlyAllowance: z
    .number()
    .min(0, "Monthly allowance must be a positive number"),
  incomeSources: z.array(z.string()).optional(),
});

const expenditureSchema = z.object({
  majorExpenditures: z.array(z.string()).optional(),
  mainExpediture: z.string().optional(),
  onlineWeeklySpedingPattern: z.enum([
    "Multiple times a week",
    "Weekly",
    "Monthly",
    "Rarely",
    "Never",
  ]),
  onlinePurchaseChannels: z.enum([
    "Shopee",
    "Lazada",
    "Amazon",
    "Taobao",
    "All e-commerce marketplaces",
    "Brand websites",
    "Instagram / TikTok shops",
    "Physical stores",
    "Others",
  ]),
  priceSensitivityTowardsDigitalProducts: z.enum([
    "Extremely price-sensitive",
    "Somewhat price-sensitive",
    "Neutral",
    "Willing to pay for quality",
  ]),
});

const digitalActivitySchema = z.object({
  averageDailyScreenTime: z
    .number()
    .min(0, "Average daily screen time must be a positive number"),
  dailyPlatformUsage: z.array(z.enum(platformEnum)),
  mostUsedPlatform: z.string().min(1, "Most used platform is required"),
  appUsagePatterns: z.enum(["Quick and frequent", "Long and focused", "Mixed"]),
  favouriteEngagementFeatures: z.array(z.enum(engagementFeatureEnum)).optional(),
});

const paymentSchema = z.object({
  everPaidForDigitalContent: z.enum(["Yes", "No"]),
  convincingFactorsForPayment: z.array(z.enum(paymentFactorEnum)),
  comfortableSubscriptionPrice: z.enum([
    "Under $5",
    "$5 to $10",
    "$10 to $20",
    "$20 and above",
  ]),
  preferredPaymentMethods: z.enum(["Monthly", "Annually", "One-time"]),
});

const feedbackSchema = z.object({
  preferredFeedbackFormat: z.enum([
    "Surveys",
    "Online I-on-I short interviews",
    "Online group interviews",
    "In-person events",
  ]),
  gamifiedRewardsForFeedback: z.enum(["Yes", "Maybe", "No"]),
});

export const categorizerSchema = z.intersection(
  acknowledgementSchema,
  z.intersection(
    basicInfoSchema,
    z.intersection(
      professionSchema,
      z.intersection(
        incomeSchema,
        z.intersection(
          expenditureSchema,
          z.intersection(
            digitalActivitySchema,
            z.intersection(paymentSchema, feedbackSchema),
          ),
        ),
      ),
    ),
  ),
);

export type CategorizerFormValues = z.infer<typeof categorizerSchema>;

export const createDefaultCategorizerValues = (): CategorizerFormValues => ({
  accept: false,
  fullName: "",
  email: "",
  age: 0,
  country: "",
  city: "",
  primaryStatus: "Secondary school student",
  profession: "",
  monthlyIncome: undefined,
  monthlyAllowance: 0,
  incomeSources: [],
  majorExpenditures: [],
  mainExpediture: "",
  onlineWeeklySpedingPattern: "Weekly",
  onlinePurchaseChannels: "Shopee",
  priceSensitivityTowardsDigitalProducts: "Neutral",
  averageDailyScreenTime: 0,
  dailyPlatformUsage: [],
  mostUsedPlatform: "",
  appUsagePatterns: "Mixed",
  favouriteEngagementFeatures: [],
  everPaidForDigitalContent: "No",
  convincingFactorsForPayment: [],
  comfortableSubscriptionPrice: "$5 to $10",
  preferredPaymentMethods: "Monthly",
  preferredFeedbackFormat: "Surveys",
  gamifiedRewardsForFeedback: "Maybe",
});
