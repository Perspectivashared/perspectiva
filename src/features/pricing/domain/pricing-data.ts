export type BillingCycle = "monthly" | "yearly";

export interface RecurringPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  recommended?: boolean;
  ctaLabel: string;
  features: readonly string[];
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

export const RECURRING_PLANS: readonly RecurringPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Best for individual contributors building survey habits.",
    monthlyPrice: 9,
    yearlyPrice: 86,
    ctaLabel: "Choose Starter",
    features: [
      "120 coins / month",
      "Priority survey matching",
      "Basic analytics dashboard",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For frequent researchers who need scale and deeper insights.",
    monthlyPrice: 19,
    yearlyPrice: 182,
    recommended: true,
    ctaLabel: "Choose Pro",
    features: [
      "300 coins / month",
      "Advanced audience targeting",
      "Team collaboration (up to 3 seats)",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For organizations running continuous research programs.",
    monthlyPrice: 39,
    yearlyPrice: 374,
    ctaLabel: "Choose Team",
    features: [
      "700 coins / month",
      "Unlimited survey drafts",
      "Team collaboration (up to 8 seats)",
      "Export and integration support",
    ],
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
