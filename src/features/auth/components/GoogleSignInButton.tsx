import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";

declare global {
  // eslint-disable-next-line no-var
  var google:
    | {
        accounts: {
          id: {
            initialize: (config: {
              client_id: string;
              callback: (response: { credential: string }) => void;
            }) => void;
            renderButton: (el: HTMLElement, options: object) => void;
          };
        };
      }
    | undefined;
}

interface GoogleSignInButtonProps {
  label?: string;
}

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";

if (!CLIENT_ID) {
  console.warn("[GoogleSignInButton] VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will be disabled.");
}

const GoogleSignInButton = ({ label = "Sign in with Google" }: GoogleSignInButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signIn: storeToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!CLIENT_ID) return;

    const handleCredential = async (credential: string) => {
      try {
        await api.post("/auth/google", { id_token: credential });
        storeToken();
        toast({ title: "Signed in with Google" });
        navigate(ROUTES.forYou, { replace: true });
      } catch {
        toast({ title: "Google sign-in failed", variant: "destructive" });
      }
    };

    const initGoogle = () => {
      if (!globalThis.google || !containerRef.current) return;
      globalThis.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }) => { void handleCredential(credential); },
      });
      globalThis.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: label === "Sign in with Google" ? "signin_with" : "signup_with",
      });
    };

    if (globalThis.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, []);

  if (!CLIENT_ID) {
    return (
      <p className="text-xs text-center text-muted-foreground">
        Google sign-in not configured (set VITE_GOOGLE_CLIENT_ID)
      </p>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
};

export default GoogleSignInButton;
