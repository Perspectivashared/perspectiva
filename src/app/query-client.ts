import { QueryClient } from "@tanstack/react-query";
import { ApiError, SESSION_EXPIRED } from "@/lib/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Don't retry SESSION_EXPIRED or rate-limit errors — they are terminal for this request.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.code === SESSION_EXPIRED) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
