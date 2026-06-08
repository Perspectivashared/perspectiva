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
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  role: string;
  institution: string;
  category: string;
  subCategory: string;
  points: number;
  coins: number;
  memberSince: string;
  avgRating: number;
  transactions: Transaction[];
}

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  email_verified: boolean;
  profession: string;
  is_admin: boolean;
  institution: string | null;
  category: string | null;
  sub_category: string | null;
  points_balance: number;
  coins_balance: number;
  avg_rating: number | null;
  created_at: string;
}

interface ApiTransaction {
  id: number;
  type: "earn" | "spend";
  currency: "points" | "coins";
  amount: number;
  description: string;
  created_at: string;
}

const PROFESSION_LABELS: Record<string, string> = {
  corporate_employee: "Corporate Employee",
  self_employed: "Self-Employed",
  student: "Student",
  independent_researcher: "Independent Researcher",
  other: "Other",
};

/**
 * Fetches user profile + transaction history only.
 * surveysCreated / surveysCompleted are derived separately in Profile.tsx
 * from already-fetched React Query data to avoid duplicate requests.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const [user, transactions] = await Promise.all([
    api.get<ApiUser>("/users/me"),
    api.get<ApiTransaction[]>("/users/me/transactions"),
  ]);

  return {
    name: user.name,
    username: user.username,
    email: user.email ?? "",
    emailVerified: user.email_verified,
    isAdmin: user.is_admin,
    role: user.is_admin ? "Admin" : (PROFESSION_LABELS[user.profession] ?? user.profession),
    institution: user.institution ?? "",
    category: user.category ?? "",
    subCategory: user.sub_category ?? "",
    points: user.points_balance,
    coins: user.coins_balance,
    memberSince: new Date(user.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
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
  email: "",
  emailVerified: true,
  isAdmin: false,
  role: "",
  institution: "",
  category: "",
  subCategory: "",
  points: 0,
  coins: 0,
  memberSince: "",
  avgRating: 0,
  transactions: [],
};
