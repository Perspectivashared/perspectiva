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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CommunityCategory =
  | "Technology"
  | "Economics"
  | "Business"
  | "Sports Science"
  | "Research"
  | "Education"
  | "Health Sciences"
  | "Climate Policy"
  | "Design Thinking"
  | "Public Policy"
  | "Psychology"
  | "Media Studies";

export type CommunityCategoryFilter = "all" | CommunityCategory;

export type CommunitySortOption =
  | "mostActive"
  | "mostSurveyed"
  | "mostMembers"
  | "newest"
  | "trending";

export interface CommunityQuery {
  category: CommunityCategoryFilter;
  sort: CommunitySortOption;
}

export const DEFAULT_COMMUNITY_SORT: CommunitySortOption = "mostActive";

export interface CommunityCardSummary {
  id: string;
  name: string;
  description: string;
  members: number;
  surveys: number;
  activeSurveys: number;
  icon: LucideIcon;
}

export interface Community extends CommunityCardSummary {
  category: CommunityCategory;
  activityLevel: number;
  subcategories: string[];
  launchedAt: string;
  longDescription: string;
  isMember?: boolean;
}

export const COMMUNITY_SORT_OPTIONS: Array<{
  value: CommunitySortOption;
  label: string;
}> = [
  { value: "mostActive", label: "Most Active" },
  { value: "mostSurveyed", label: "Most Surveyed" },
  { value: "mostMembers", label: "Most Members" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
];

const SORT_TO_QUERY_VALUE: Record<CommunitySortOption, string> = {
  mostActive: "most-active",
  mostSurveyed: "most-surveyed",
  mostMembers: "most-members",
  newest: "newest",
  trending: "trending",
};

const SORT_QUERY_ALIASES: Record<string, CommunitySortOption> = {
  "most-active": "mostActive",
  activity: "mostActive",
  active: "mostActive",
  "most-surveyed": "mostSurveyed",
  surveys: "mostSurveyed",
  "most-members": "mostMembers",
  members: "mostMembers",
  popular: "mostMembers",
  newest: "newest",
  latest: "newest",
  trending: "trending",
};

export const ALL_COMMUNITIES: Community[] = [
  {
    id: "technology",
    icon: Code2,
    name: "Technology",
    description: "AI, software development, cybersecurity, and emerging tech",
    members: 3245,
    surveys: 450,
    activeSurveys: 28,
    activityLevel: 91,
    category: "Technology",
    subcategories: [
      "Artificial Intelligence",
      "Software Engineering",
      "Cybersecurity",
      "Data Science",
    ],
    launchedAt: "2025-01-20",
    longDescription:
      "A collaborative space for builders and researchers exploring AI, software engineering, cybersecurity, and future-facing technologies.",
  },
  {
    id: "economics",
    icon: TrendingUp,
    name: "Economics",
    description: "Market trends, economic policy, behavioral economics",
    members: 2867,
    surveys: 380,
    activeSurveys: 19,
    activityLevel: 79,
    category: "Economics",
    subcategories: [
      "Macroeconomics",
      "Behavioral Economics",
      "Development Economics",
      "Market Analysis",
    ],
    launchedAt: "2024-10-05",
    longDescription:
      "Discuss policy decisions, market signals, and behavioral insights with analysts, students, and applied economists.",
  },
  {
    id: "business",
    icon: Briefcase,
    name: "Business",
    description: "Entrepreneurship, startups, marketing, and management",
    members: 4156,
    surveys: 520,
    activeSurveys: 34,
    activityLevel: 93,
    category: "Business",
    subcategories: ["Entrepreneurship", "Marketing", "Management", "Strategy"],
    launchedAt: "2025-04-16",
    longDescription:
      "From startup growth to operating models, this community covers practical business strategy and market execution.",
  },
  {
    id: "sports-science",
    icon: Dumbbell,
    name: "Sports Science",
    description: "Athletic performance, nutrition, biomechanics, psychology",
    members: 1923,
    surveys: 290,
    activeSurveys: 15,
    activityLevel: 72,
    category: "Sports Science",
    subcategories: [
      "Athletic Performance",
      "Sports Nutrition",
      "Biomechanics",
      "Sports Psychology",
    ],
    launchedAt: "2024-08-12",
    longDescription:
      "A data-informed forum for athletes, coaches, and researchers studying performance, recovery, and applied sports health.",
  },
  {
    id: "research",
    icon: Microscope,
    name: "Research",
    description: "Academic research methods and scientific study design",
    members: 2534,
    surveys: 410,
    activeSurveys: 22,
    activityLevel: 83,
    category: "Research",
    subcategories: [
      "Qualitative Methods",
      "Quantitative Methods",
      "Mixed Methods",
      "Literature Reviews",
    ],
    launchedAt: "2025-02-11",
    longDescription:
      "Improve study quality through shared best practices in research design, data quality, analysis, and interpretation.",
  },
  {
    id: "education",
    icon: BookOpen,
    name: "Education",
    description: "Teaching methods, learning technologies, education policy",
    members: 3712,
    surveys: 480,
    activeSurveys: 31,
    activityLevel: 90,
    category: "Education",
    subcategories: [
      "EdTech",
      "Pedagogy",
      "Curriculum Design",
      "Education Policy",
    ],
    launchedAt: "2025-05-02",
    longDescription:
      "Educators and researchers collaborate here on pedagogy, digital learning design, and student-centered outcomes.",
  },
  {
    id: "health-sciences",
    icon: Heart,
    name: "Health Sciences",
    description: "Public health, clinical research, and patient outcomes",
    members: 2674,
    surveys: 340,
    activeSurveys: 24,
    activityLevel: 86,
    category: "Health Sciences",
    subcategories: [
      "Clinical Studies",
      "Public Health",
      "Patient Outcomes",
      "Digital Health",
    ],
    launchedAt: "2025-03-09",
    longDescription:
      "Explore evidence-based healthcare topics from study design to patient outcomes and public health strategy.",
  },
  {
    id: "climate-policy",
    icon: Leaf,
    name: "Climate Policy",
    description: "Energy transition, sustainability, and climate governance",
    members: 1986,
    surveys: 310,
    activeSurveys: 17,
    activityLevel: 74,
    category: "Climate Policy",
    subcategories: [
      "Energy Policy",
      "Climate Finance",
      "Sustainable Cities",
      "Carbon Markets",
    ],
    launchedAt: "2024-12-18",
    longDescription:
      "Policy professionals and researchers discuss decarbonization pathways, sustainability frameworks, and climate finance.",
  },
  {
    id: "design-thinking",
    icon: Palette,
    name: "Design Thinking",
    description: "Product strategy, UX research, and service design",
    members: 1742,
    surveys: 260,
    activeSurveys: 14,
    activityLevel: 71,
    category: "Design Thinking",
    subcategories: [
      "UX Research",
      "Product Discovery",
      "Service Design",
      "Prototyping",
    ],
    launchedAt: "2024-09-24",
    longDescription:
      "A home for user-centered product work, from generative research through prototyping and service design delivery.",
  },
  {
    id: "public-policy",
    icon: Scale,
    name: "Public Policy",
    description: "Policy analysis, civic engagement, and social outcomes",
    members: 2310,
    surveys: 355,
    activeSurveys: 20,
    activityLevel: 81,
    category: "Public Policy",
    subcategories: [
      "Policy Evaluation",
      "Local Government",
      "Social Programs",
      "Civic Tech",
    ],
    launchedAt: "2025-01-03",
    longDescription:
      "Analyze how policy choices affect real communities with practical discussions on governance and social impact.",
  },
  {
    id: "psychology",
    icon: Brain,
    name: "Psychology",
    description: "Behavioral science, cognition, and mental wellbeing",
    members: 2898,
    surveys: 420,
    activeSurveys: 27,
    activityLevel: 88,
    category: "Psychology",
    subcategories: [
      "Cognitive Science",
      "Behavioral Research",
      "Mental Health",
      "Social Psychology",
    ],
    launchedAt: "2025-05-28",
    longDescription:
      "Investigate cognition, behavior, and wellbeing with peers applying psychology to research and real-world interventions.",
  },
  {
    id: "media-studies",
    icon: Megaphone,
    name: "Media Studies",
    description: "Digital media, audience behavior, and online discourse",
    members: 1464,
    surveys: 235,
    activeSurveys: 12,
    activityLevel: 68,
    category: "Media Studies",
    subcategories: [
      "Media Literacy",
      "Audience Analytics",
      "Journalism",
      "Platform Culture",
    ],
    launchedAt: "2024-07-07",
    longDescription:
      "Understand how media ecosystems shape narratives, behavior, and discourse across digital and traditional channels.",
  },
];

export const COMMUNITY_FILTER_OPTIONS: Array<{
  value: CommunityCategoryFilter;
  label: string;
}> = [
  { value: "all", label: "All Categories" },
  ...[...new Set(ALL_COMMUNITIES.map((community) => community.category))].map(
    (category) => ({
      value: category,
      label: category,
    }),
  ),
];

export const filterCommunitiesByCategory = (
  communities: Community[],
  categoryFilter: CommunityCategoryFilter,
) => {
  if (categoryFilter === "all") {
    return [...communities];
  }

  return communities.filter((community) => community.category === categoryFilter);
};

export const getTrendingScore = (community: Community) =>
  community.activeSurveys * community.activityLevel;

export const sortCommunities = (
  communities: Community[],
  sortBy: CommunitySortOption,
) => {
  const copy = [...communities];

  copy.sort((a, b) => {
    if (sortBy === "mostActive") {
      return (
        b.activityLevel - a.activityLevel ||
        b.activeSurveys - a.activeSurveys
      );
    }

    if (sortBy === "mostSurveyed") {
      return b.surveys - a.surveys;
    }

    if (sortBy === "mostMembers") {
      return b.members - a.members;
    }

    if (sortBy === "newest") {
      return new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime();
    }

    return getTrendingScore(b) - getTrendingScore(a);
  });

  return copy;
};

export const applyCommunityQuery = (
  communities: Community[],
  query: CommunityQuery,
) => sortCommunities(filterCommunitiesByCategory(communities, query.category), query.sort);

const validCategoryFilters = new Set<CommunityCategoryFilter>(
  COMMUNITY_FILTER_OPTIONS.map((option) => option.value),
);

export const toSortQueryValue = (sortBy: CommunitySortOption) =>
  SORT_TO_QUERY_VALUE[sortBy];

export const fromSortQueryValue = (
  sortParam: string | null | undefined,
): CommunitySortOption => {
  if (!sortParam) {
    return DEFAULT_COMMUNITY_SORT;
  }

  return SORT_QUERY_ALIASES[sortParam] ?? DEFAULT_COMMUNITY_SORT;
};

export const normalizeCategoryFilter = (
  categoryParam: string | null | undefined,
): CommunityCategoryFilter => {
  if (!categoryParam) {
    return "all";
  }

  const normalized = categoryParam as CommunityCategoryFilter;
  return validCategoryFilters.has(normalized) ? normalized : "all";
};
