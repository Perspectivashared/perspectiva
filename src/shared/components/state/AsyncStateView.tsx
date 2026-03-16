import { type ReactNode } from "react";
import { type AsyncState } from "@/shared/types/async-state";

interface AsyncStateViewProps<T, E = string> {
  state: AsyncState<T, E>;
  render: (data: T) => ReactNode;
  loading: ReactNode;
  error: (error: E) => ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
}

export const AsyncStateView = <T, E = string>({
  state,
  render,
  loading,
  error,
  empty,
  isEmpty,
}: AsyncStateViewProps<T, E>) => {
  if (state.status === "loading" || state.status === "idle") {
    return <>{loading}</>;
  }

  if (state.status === "error" && state.error !== null) {
    return <>{error(state.error)}</>;
  }

  if (state.data === null) {
    return <>{empty ?? null}</>;
  }

  if (isEmpty?.(state.data)) {
    return <>{empty ?? null}</>;
  }

  return <>{render(state.data)}</>;
};
