import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginationControls from "@/components/PaginationControls";

describe("PaginationControls", () => {
  it("does not render for a single page", () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("triggers onPageChange when navigating", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <PaginationControls currentPage={2} totalPages={5} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole("link", { name: "Go to next page" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
