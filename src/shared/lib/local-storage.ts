/**
 * Returns the browser's localStorage, or null when unavailable (SSR, private
 * browsing with storage blocked, etc.).
 */
export const resolveLocalStorage = (): Storage | null => {
  if (!("localStorage" in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
};
