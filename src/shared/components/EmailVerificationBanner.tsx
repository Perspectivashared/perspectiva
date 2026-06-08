import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/routes";

export const EmailVerificationBanner = ({ email }: { email?: string }) => {
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
      toast({
        title: "Verification email sent",
        description: email ? `Check ${email} for the link.` : "Check your inbox.",
      });
    } catch {
      toast({ title: "Could not resend. Please try again.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-semibold">Email not verified.</span>{" "}
          {email ? `We sent a link to ${email}.` : "Check your inbox."}{" "}
          You need to verify before publishing surveys.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
        <Button
          size="sm"
          variant="outline"
          className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
          onClick={() => { void handleResend(); }}
          disabled={resending || sent}
        >
          {sent ? "Email sent ✓" : resending ? "Sending…" : "Resend email"}
        </Button>
        <Button asChild size="sm" variant="ghost" className="text-amber-700 dark:text-amber-300">
          <Link to={ROUTES.verifyEmail}>Verify now</Link>
        </Button>
      </div>
    </div>
  );
};
