export const getQueryParam = (
  params: URLSearchParams,
  key: string,
): string | undefined => {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
};

export const setQueryParam = (
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) => {
  if (!value) {
    params.delete(key);
    return;
  }

  params.set(key, value);
};

export const parseEnumParam = <T extends string>(
  raw: string | null | undefined,
  validValues: ReadonlySet<T>,
  fallback: T,
): T => {
  if (!raw) {
    return fallback;
  }

  const next = raw as T;
  return validValues.has(next) ? next : fallback;
};
