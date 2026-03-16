import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "@/pages/SignIn";

describe("SignIn page", () => {
  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });
});
