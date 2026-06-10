import {
  Brain,
  BookOpen,
  Briefcase,
  Code2,
  Dumbbell,
  Heart,
  Leaf,
  Megaphone,
  Microscope,
  Palette,
  Scale,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Community, CommunityCategory } from "@/features/communities/domain/community-data";

/** Maps the API's `icon_name` (PascalCase lucide names, e.g. "Code2") to components. */
export const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  BookOpen,
  Briefcase,
  Code2,
  Dumbbell,
  Heart,
  Leaf,
  Megaphone,
  Microscope,
  Palette,
  Scale,
  TrendingUp,
};

interface ApiCommunitySummary {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  member_count: number;
  survey_count: number;
  active_survey_count: number;
}

interface ApiCommunityDetail extends ApiCommunitySummary {
  long_description: string;
  launched_at: string;
  subcategories: string[];
  is_member: boolean;
}

function summaryToFrontendCommunity(c: ApiCommunitySummary): Community {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    longDescription: "",
    category: c.category as CommunityCategory,
    icon: ICON_MAP[c.icon_name] ?? Code2,
    launchedAt: "",
    subcategories: [],
    members: c.member_count,
    surveys: c.survey_count,
    activeSurveys: c.active_survey_count,
    activityLevel: c.survey_count > 0 ? Math.round((c.active_survey_count / c.survey_count) * 100) : 0,
  };
}

function detailToFrontendCommunity(c: ApiCommunityDetail): Community {
  return {
    ...summaryToFrontendCommunity(c),
    longDescription: c.long_description,
    launchedAt: c.launched_at,
    subcategories: c.subcategories,
    isMember: c.is_member,
  };
}

export interface CommunityRepository {
  fetchAll: () => Promise<Community[]>;
  fetchById: (communityId: string) => Promise<Community | null>;
  join: (communityId: string) => Promise<void>;
  leave: (communityId: string) => Promise<void>;
}

export const apiCommunityRepository: CommunityRepository = {
  fetchAll: async () => {
    const data = await api.get<ApiCommunitySummary[]>("/communities");
    return data.map(summaryToFrontendCommunity);
  },

  fetchById: async (communityId: string) => {
    try {
      const data = await api.get<ApiCommunityDetail>(`/communities/${communityId}`);
      return detailToFrontendCommunity(data);
    } catch {
      return null;
    }
  },

  join: async (communityId: string) => {
    await api.post<void>(`/communities/${communityId}/join`);
  },

  leave: async (communityId: string) => {
    await api.delete(`/communities/${communityId}/join`);
  },
};
