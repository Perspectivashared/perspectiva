import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, SESSION_EXPIRED } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiUser } from "@/features/profile/services/profile-service";

interface AuthContextValue {
  isAuthenticated: boolean | null;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Seed the shared ["me"] cache so onboarding guards read the same entry
    // instead of issuing a second /users/me request.
    queryClient
      .fetchQuery({ queryKey: queryKeys.me(), queryFn: () => api.get<ApiUser>("/users/me") })
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, [queryClient]);

  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      setIsAuthenticated(false);
    };
    globalThis.window?.addEventListener(SESSION_EXPIRED, handler);
    return () => globalThis.window?.removeEventListener(SESSION_EXPIRED, handler);
  }, [queryClient]);

  const signIn = useCallback(() => {
    setIsAuthenticated(true);
    // Force guards to re-read fresh verification/onboarding state after auth.
    void queryClient.invalidateQueries({ queryKey: queryKeys.me() });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await api.post("/auth/signout").catch(() => {});
    queryClient.clear();
    setIsAuthenticated(false);
  }, [queryClient]);

  const value = useMemo(
    () => ({ isAuthenticated, signIn, signOut }),
    [isAuthenticated, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
