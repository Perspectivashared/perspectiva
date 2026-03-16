import { api } from "@/lib/api";
import type { SignInFormValues, SignUpFormValues } from "@/features/auth/domain/schemas";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const signIn = (credentials: SignInFormValues): Promise<TokenResponse> =>
  api.post<TokenResponse>("/auth/signin", {
    username: credentials.username,
    password: credentials.password,
  });

export const signUp = (payload: SignUpFormValues): Promise<TokenResponse> =>
  api.post<TokenResponse>("/auth/signup", {
    name: payload.name,
    username: payload.username,
    password: payload.password,
    profession: payload.profession,
  });
