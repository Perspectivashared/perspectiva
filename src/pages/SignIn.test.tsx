import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SignIn from "@/pages/SignIn";

const renderSignIn = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter>
            <SignIn />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
};

describe("SignIn page", () => {
  it("validates required fields", async () => {
    const user = userEvent.setup();

    renderSignIn();

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });
});
