import { type PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/app/query-client";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);
