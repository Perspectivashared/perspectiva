import { type PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/app/query-client";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import { ThemeProvider } from "@/context/ThemeContext";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <HelmetProvider>
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SmoothScrollProvider>
            <Toaster />
            <CustomScrollbar />
            {children}
          </SmoothScrollProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);
