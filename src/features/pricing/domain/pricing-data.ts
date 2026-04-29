export interface SurveyPackage {
  id: string;
  name: string;
  subtitle: string;
  bestFor: string;
  price: number;
  targetingLevel: number;
  targetingDescription: string;
  respondents: number;
  maxQuestions: number;
  duration: string;
  keyUpgrade?: string;
  ctaLabel: string;
  ctaMicrocopy: string;
  features: readonly string[];
  recommended?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  pricing: string;
  includedIn?: string;
}

export interface CoinBundle {
  id: string;
  coins: number;
  bonusCoins?: number;
  price: number;
  discountPercent?: number;
  recommended?: boolean;
}

export const POINTS_TO_COINS_RATE = 12;

export const SURVEY_PACKAGES: readonly SurveyPackage[] = [
  {
    id: "basic",
    name: "Basic",
    subtitle: "Open Validation",
    bestFor: "Solo founders testing rough ideas before investing further",
    price: 99,
    targetingLevel: 1,
    targetingDescription: "Anyone online — broad demographic reach",
    respondents: 50,
    maxQuestions: 10,
    duration: "up to 7 days",
    ctaLabel: "Start Basic Validation",
    ctaMicrocopy: "Pay once · No subscription",
    features: [
      "Response pattern charts out of the box",
      "Full CSV export of every answer",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    subtitle: "Early Testing",
    bestFor: "Early-stage teams running first concept tests with light filtering",
    price: 299,
    targetingLevel: 2,
    targetingDescription: "Filtered by age, location & gender",
    respondents: 75,
    maxQuestions: 15,
    duration: "5–7 days",
    keyUpgrade: "Adds demographic filtering",
    ctaLabel: "Run Early Test",
    ctaMicrocopy: "Pay once · No subscription",
    features: [
      "Everything in Basic, plus:",
      "Reach audiences filtered by age, location & gender",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "Core Product Validation",
    bestFor: "PMs & researchers validating with a real target market",
    price: 899,
    targetingLevel: 3,
    targetingDescription: "Filtered by industry, job role & interests",
    respondents: 100,
    maxQuestions: 20,
    duration: "3–5 days",
    recommended: true,
    keyUpgrade: "Unlocks AI Insights",
    ctaLabel: "Validate Your Market",
    ctaMicrocopy: "Pay once · Results in 3–5 days",
    features: [
      "Everything in Starter, plus:",
      "Reach your actual target audience by role & industry",
      "Ask plain-English questions about your data (AI Assistant)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Serious Validation",
    bestFor: "Researchers & consultants who need precision-targeted feedback",
    price: 2499,
    targetingLevel: 4,
    targetingDescription: "Filtered by job title, company size & seniority",
    respondents: 150,
    maxQuestions: 25,
    duration: "2–4 days",
    keyUpgrade: "Adds written Insight Report",
    ctaLabel: "Launch Pro Research",
    ctaMicrocopy: "Pay once · Results in 2–4 days",
    features: [
      "Everything in Growth, plus:",
      "Reach decision-makers by exact title & company size",
      "Written summary + shareable PDF report for stakeholders",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    subtitle: "Investor-Level Testing",
    bestFor: "Mission-critical research requiring the hardest-to-reach respondents",
    price: 5999,
    targetingLevel: 5,
    targetingDescription: "Hyper-niche — C-suite, startup founders & specific verticals",
    respondents: 200,
    maxQuestions: 30,
    duration: "1–3 days",
    keyUpgrade: "Priority processing",
    ctaLabel: "Commission Elite Study",
    ctaMicrocopy: "Pay once · Priority delivery in 1–3 days",
    features: [
      "Everything in Pro, plus:",
      "Access rare, highly specific respondent profiles",
      "Results prioritised and processed first",
    ],
  },
];

export const ADD_ONS: readonly AddOn[] = [
  {
    id: "extra-respondents",
    name: "Extra Respondents",
    description: "Add more responses beyond your package limit.",
    pricing: "$2–$50 per response (scales with targeting level)",
  },
  {
    id: "extra-questions",
    name: "Extra Questions",
    description: "Go beyond the question cap without upgrading tiers.",
    pricing: "+$20 for 10 more · +$50 for 20 more",
  },
  {
    id: "faster-delivery",
    name: "Faster Delivery",
    description: "Get results sooner with expedited panel processing.",
    pricing: "+30% for 48-hour · +80% for 24-hour completion",
  },
  {
    id: "insight-report",
    name: "Structured Insight Report",
    description: "Key trends, written summary, 3 actionable takeaways & shareable PDF.",
    pricing: "$50–$150 depending on survey size",
    includedIn: "Included in Pro & Elite",
  },
  {
    id: "ai-assistant",
    name: "AI Insights Assistant",
    description: "Ask questions about your results in plain English — get instant analysis.",
    pricing: "$20 per survey",
    includedIn: "Included in Growth, Pro & Elite",
  },
  {
    id: "priority-processing",
    name: "Priority Processing",
    description: "Jump the queue — your panel is assembled and processed first.",
    pricing: "$30–$80",
    includedIn: "Included in Elite",
  },
];

export const COIN_BUNDLES: readonly CoinBundle[] = [
  {
    id: "bundle-100",
    coins: 100,
    price: 12,
  },
  {
    id: "bundle-250",
    coins: 250,
    bonusCoins: 25,
    price: 28,
    discountPercent: 6,
    recommended: true,
  },
  {
    id: "bundle-500",
    coins: 500,
    bonusCoins: 70,
    price: 54,
    discountPercent: 10,
  },
  {
    id: "bundle-1200",
    coins: 1200,
    bonusCoins: 220,
    price: 118,
    discountPercent: 16,
  },
];

export const convertPointsToCoins = (points: number): number =>
  points * POINTS_TO_COINS_RATE;

export const convertCoinsToPoints = (coins: number): number =>
  coins / POINTS_TO_COINS_RATE;

export const getTotalCoinsForBundle = (bundle: CoinBundle): number =>
  bundle.coins + (bundle.bonusCoins ?? 0);
