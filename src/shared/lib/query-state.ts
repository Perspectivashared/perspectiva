import type { UseQueryResult } from "@tanstack/react-query";
import {
  createErrorState,
  createLoadingState,
  createSuccessState,
  type AsyncState,
} from "@/shared/types/async-state";

export const queryToAsyncState = <T>(
  query: UseQueryResult<T, Error>,
): AsyncState<T | null> => {
  if (query.isPending) {
    return createLoadingState(query.data ?? null);
  }

  if (query.isError) {
    return createErrorState(query.error.message, query.data ?? null);
  }

  if (query.data === undefined) {
    return {
      status: "success",
      data: null,
      error: null,
    };
  }

  return createSuccessState(query.data);
};
