import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Leaderboard } from "./leaderboard";

describe("Leaderboard", () => {
  const entries = [
    { rank: 1, name: "Ada", points: 1200 },
    { rank: 2, name: "Grace", points: 980, isCurrentUser: true },
    { rank: 3, name: "Linus", points: 640 },
  ];

  it("renders one row per entry with formatted points", () => {
    const { container, getByText } = render(<Leaderboard entries={entries} />);
    expect(container.querySelectorAll("li")).toHaveLength(3);
    expect(getByText("1,200")).toBeTruthy();
    expect(getByText("Grace")).toBeTruthy();
  });

  it("marks the current user's row with aria-current", () => {
    const { container } = render(<Leaderboard entries={entries} />);
    const current = container.querySelector('li[aria-current="true"]');
    expect(current?.textContent).toContain("Grace");
  });
});
