import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/shared/components/layout/AppShell";

type State = "verifying" | "success" | "error" | "check_inbox";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>(token ? "verifying" : "check_inbox");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<{ message: string }>(`/auth/verify-email?token=${token}`)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  const resend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification");
      toast({ title: "Email sent", description: "Check your inbox for a new verification link." });
    } catch {
      toast({ title: "Error", description: "Could not resend. Please try again.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <AppShell showFooter={false}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        {state === "verifying" && (
          <p className="text-muted-foreground">Verifying your email...</p>
        )}

        {state === "success" && (
          <>
            <h1 className="text-2xl font-semibold">Email verified!</h1>
            <p className="text-muted-foreground">Your email has been verified successfully.</p>
            <Button onClick={() => navigate(ROUTES.forYou)}>Continue</Button>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-2xl font-semibold">Verification failed</h1>
            <p className="text-muted-foreground">This link is invalid or has expired.</p>
            <Button onClick={resend} disabled={resending} variant="outline">
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          </>
        )}

        {state === "check_inbox" && (
          <>
            <h1 className="text-2xl font-semibold">Check your inbox</h1>
            <p className="text-muted-foreground">
              We sent a verification link to your email address. Click it to verify your account.
            </p>
            <Button onClick={resend} disabled={resending} variant="outline">
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default VerifyEmail;
