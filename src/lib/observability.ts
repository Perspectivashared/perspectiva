import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

/**
 * Production-only error tracking (Sentry) + product analytics (PostHog).
 * Both are optional: missing env vars simply disable the integration,
 * so local dev and preview builds stay clean.
 */
export function initObservability() {
  if (!import.meta.env.PROD) return;

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: "production",
      sendDefaultPii: false,
    });
  }

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host:
        (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
        "https://us.i.posthog.com",
      // History-API pageview/pageleave capture — required for SPA routing.
      defaults: "2025-05-24",
      person_profiles: "identified_only",
    });
  }
}
