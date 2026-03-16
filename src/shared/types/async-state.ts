export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T, E = string> {
  status: AsyncStatus;
  data: T | null;
  error: E | null;
}

export const createIdleState = <T, E = string>(): AsyncState<T, E> => ({
  status: "idle",
  data: null,
  error: null,
});

export const createLoadingState = <T, E = string>(
  currentData: T | null = null,
): AsyncState<T, E> => ({
  status: "loading",
  data: currentData,
  error: null,
});

export const createSuccessState = <T, E = string>(
  data: T,
): AsyncState<T, E> => ({
  status: "success",
  data,
  error: null,
});

export const createErrorState = <T, E = string>(
  error: E,
  currentData: T | null = null,
): AsyncState<T, E> => ({
  status: "error",
  data: currentData,
  error,
});
