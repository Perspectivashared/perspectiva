import { api } from "@/lib/api";

export interface Transaction {
  id: string;
  type: "earn" | "spend";
  amount: number;
  currency: "points" | "coins";
  description: string;
  date: string;
}

export interface UserProfile {
  name: string;
  username: string;
  isAdmin: boolean;
  role: string;
  institution: string;
  category: string;
  subCategory: string;
  points: number;
  coins: number;
  surveysCompleted: number;
  surveysCreated: number;
  avgRating: number;
  transactions: Transaction[];
}

interface ApiUser {
  id: number;
  name: string;
  username: string;
  profession: string;
  is_admin: boolean;
  institution: string | null;
  category: string | null;
  sub_category: string | null;
  points_balance: number;
  coins_balance: number;
  avg_rating: number | null;
}

interface ApiTransaction {
  id: number;
  type: "earn" | "spend";
  currency: "points" | "coins";
  amount: number;
  description: string;
  created_at: string;
}

interface ApiSurveySummary {
  id: number;
  status: string;
}

const PROFESSION_LABELS: Record<string, string> = {
  corporate_employee: "Corporate Employee",
  self_employed: "Self-Employed",
  student: "Student",
  independent_researcher: "Independent Researcher",
  other: "Other",
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const [user, transactions, surveys, completedSurveys] = await Promise.all([
    api.get<ApiUser>("/users/me"),
    api.get<ApiTransaction[]>("/users/me/transactions"),
    api.get<ApiSurveySummary[]>("/surveys/me"),
    api.get<ApiSurveySummary[]>("/users/me/completed-surveys"),
  ]);

  const surveysCompleted = completedSurveys.length;

  return {
    name: user.name,
    username: user.username,
    isAdmin: user.is_admin,
    role: user.is_admin ? "Admin" : (PROFESSION_LABELS[user.profession] ?? user.profession),
    institution: user.institution ?? "",
    category: user.category ?? "",
    subCategory: user.sub_category ?? "",
    points: user.points_balance,
    coins: user.coins_balance,
    surveysCompleted,
    surveysCreated: surveys.length,
    avgRating: user.avg_rating ?? 0,
    transactions: transactions.map((t) => ({
      id: String(t.id),
      type: t.type,
      currency: t.currency,
      amount: t.amount,
      description: t.description,
      date: new Date(t.created_at).toLocaleDateString(),
    })),
  };
};

export const defaultProfile: UserProfile = {
  name: "Loading...",
  username: "",
  isAdmin: false,
  role: "",
  institution: "",
  category: "",
  subCategory: "",
  points: 0,
  coins: 0,
  surveysCompleted: 0,
  surveysCreated: 0,
  avgRating: 0,
  transactions: [],
};
