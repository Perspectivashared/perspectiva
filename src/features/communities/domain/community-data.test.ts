import {
  ALL_COMMUNITIES,
  applyCommunityQuery,
  DEFAULT_COMMUNITY_SORT,
  filterCommunitiesByCategory,
  fromSortQueryValue,
  normalizeCategoryFilter,
  sortCommunities,
  toSortQueryValue,
} from "@/features/communities/domain/community-data";

describe("community domain utilities", () => {
  it("filters by category", () => {
    const filtered = filterCommunitiesByCategory(ALL_COMMUNITIES, "Technology");

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("technology");
  });

  it("sorts by most members descending", () => {
    const sorted = sortCommunities(ALL_COMMUNITIES, "mostMembers");

    expect(sorted[0]?.members).toBeGreaterThanOrEqual(sorted[1]?.members ?? 0);
  });

  it("maps sort query aliases and falls back to default", () => {
    expect(fromSortQueryValue("most-surveyed")).toBe("mostSurveyed");
    expect(fromSortQueryValue("invalid-sort")).toBe(DEFAULT_COMMUNITY_SORT);
    expect(toSortQueryValue("mostMembers")).toBe("most-members");
  });

  it("normalizes invalid category filters to all", () => {
    expect(normalizeCategoryFilter("Technology")).toBe("Technology");
    expect(normalizeCategoryFilter("Invalid")).toBe("all");
  });

  it("applies category and sort in one step", () => {
    const result = applyCommunityQuery(ALL_COMMUNITIES, {
      category: "Business",
      sort: "mostActive",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("business");
  });
});
