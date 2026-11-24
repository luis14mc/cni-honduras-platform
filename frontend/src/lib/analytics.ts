import type { Locale } from "@/src/i18n/config";

type FormName = "project_application" | "resource_download";
type MapFilter = "sector" | "department" | "municipality" | "region" | "region_level" | "kind" | "stage" | "min_investment" | "max_investment" | "reset";

export type AnalyticsEvents = {
  file_download: { slug: string; access: "free" | "gated" };
  lead_submit: { form: FormName; locale: Locale };
  form_submit: { form: FormName; locale: Locale };
  map_filter: { filter: MapFilter; value?: string };
  map_project_open: { slug: string; kind: "project" | "opportunity" | "case" };
  outbound_click: { host: string };
  locale_switch: { from: Locale; to: Locale };
};

type Tracker = {
  track: (buildPayload: (defaults: Record<string, unknown>) => Record<string, unknown>) => unknown;
};

function tracker() {
  if (!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim() || typeof window === "undefined") return;
  if (!isAnalyticsPath(window.location.pathname)) return;
  return (window as Window & { umami?: Tracker }).umami;
}

export function isAnalyticsPath(path: string): boolean {
  return !/^\/(?:es\/|en\/)?(?:admin|cms|api|strapi-api|editorial-preview)(?:\/|$)/i.test(path);
}

export function getAnalyticsScript(environment: string, vercelEnvironment?: string) {
  if (environment !== "production" || (vercelEnvironment && vercelEnvironment !== "production")) return;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const configured = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
  if (!websiteId || !configured) return;
  try {
    const url = new URL(configured);
    if (url.protocol === "https:") return { websiteId, src: url.href };
  } catch {
    // Analytics is optional.
  }
}

export function trackEvent<Name extends keyof AnalyticsEvents>(name: Name, data: AnalyticsEvents[Name]): void {
  try {
    void Promise.resolve(tracker()?.track((defaults) => ({
      ...defaults, name, data, url: window.location.pathname, referrer: "",
    }))).catch(() => {});
  } catch {
    // Never interrupt the interaction.
  }
}

export function trackPageview(pathname: string): void {
  if (!isAnalyticsPath(pathname)) return;
  try {
    const active = tracker();
    if (active) void Promise.resolve(active.track((defaults) => ({
      ...defaults, url: pathname, referrer: "",
    }))).catch(() => {});
  } catch {
    // Never interrupt navigation.
  }
}

export function trackDownload(detail: AnalyticsEvents["file_download"]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("file_download", { detail }));
  trackEvent("file_download", detail);
}
