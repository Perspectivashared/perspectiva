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
    api.get("/users/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      setIsAuthenticated(false);
    };
    globalThis.window?.addEventListener(SESSION_EXPIRED, handler);
    return () => globalThis.window?.removeEventListener(SESSION_EXPIRED, handler);
  }, [queryClient]);

  const signIn = useCallback(() => setIsAuthenticated(true), []);

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
