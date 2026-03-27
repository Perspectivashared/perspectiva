import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't retry SESSION_EXPIRED errors — the refresh-token path in api.ts
      // already handled the retry and signalled expiry via a thrown error.
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message === "SESSION_EXPIRED") {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
