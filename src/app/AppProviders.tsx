import { type PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/app/query-client";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { ThemeProvider } from "@/context/ThemeContext";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SmoothScrollProvider>
            <Toaster />
            {children}
          </SmoothScrollProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);
