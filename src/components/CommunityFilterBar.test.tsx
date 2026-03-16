import { render, screen } from "@testing-library/react";
import CommunityFilterBar from "@/components/CommunityFilterBar";

describe("CommunityFilterBar", () => {
  it("renders category and sort controls by default", () => {
    render(
      <CommunityFilterBar
        category="all"
        onCategoryChange={vi.fn()}
        sortBy="mostActive"
        onSortChange={vi.fn()}
        categories={[{ value: "all", label: "All Categories" }]}
      />,
    );

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort")).toBeInTheDocument();
  });

  it("can hide sort control", () => {
    render(
      <CommunityFilterBar
        category="all"
        onCategoryChange={vi.fn()}
        categories={[{ value: "all", label: "All Categories" }]}
        showSort={false}
      />,
    );

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sort")).not.toBeInTheDocument();
  });
});
