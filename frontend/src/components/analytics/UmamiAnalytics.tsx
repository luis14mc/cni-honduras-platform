"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isAnalyticsPath, trackEvent, trackPageview } from "@/src/lib/analytics";

export function UmamiAnalytics({ src, websiteId }: { src: string; websiteId: string }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isAnalyticsPath(pathname)) {
      lastPath.current = null;
      return;
    }
    if (ready && lastPath.current !== pathname) {
      lastPath.current = pathname;
      trackPageview(pathname);
    }
  }, [pathname, ready]);

  useEffect(() => {
    if (!ready || !isAnalyticsPath(pathname)) return;
    function onClick(event: MouseEvent) {
      if (event.type === "auxclick" && event.button !== 1) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("data-resource-download")) return;
      const url = new URL(link.href, window.location.href);
      if (["http:", "https:"].includes(url.protocol) && url.host !== window.location.host) {
        trackEvent("outbound_click", { host: url.hostname });
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, [pathname, ready]);

  if (!isAnalyticsPath(pathname)) return null;
  return (
    <Script
      id="umami"
      src={src}
      strategy="afterInteractive"
      referrerPolicy="no-referrer"
      data-website-id={websiteId}
      data-auto-pageview="false"
      data-exclude-search="true"
      data-exclude-hash="true"
      onReady={() => setReady(true)}
    />
  );
}
