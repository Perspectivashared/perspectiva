import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";

interface AuthDividerProps {
  googleLabel?: string;
}

const AuthDivider = ({ googleLabel }: AuthDividerProps) => (
  <div className="mt-6">
    <div className="relative flex items-center gap-3 mb-4">
      <div className="flex-1 border-t border-border" />
      <span className="text-xs text-muted-foreground">or</span>
      <div className="flex-1 border-t border-border" />
    </div>
    <GoogleSignInButton label={googleLabel} />
  </div>
);

export default AuthDivider;
