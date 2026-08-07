/** CMS runtime environment helpers (no hostname hardcoding). */

export type CmsEnvironment = "production" | "staging" | "development";

/** Resolve CMS environment from public env vars only. */
export function getCmsEnvironment(): CmsEnvironment {
  const explicit = process.env.NEXT_PUBLIC_CMS_ENV?.trim().toLowerCase();
  if (explicit === "production" || explicit === "staging" || explicit === "development") {
    return explicit;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    return "production";
  }
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    return "staging";
  }
  if (process.env.NODE_ENV === "development") {
    return "development";
  }
  return "staging";
}

export function shouldShowStagingBadge(): boolean {
  return getCmsEnvironment() !== "production";
}

export function getEnvironmentBadgeLabel(): string | null {
  const env = getCmsEnvironment();
  if (env === "production") return null;
  if (env === "staging") return "STAGING";
  return "DEV";
}
