"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import type { SiteBanner } from "@/src/types/cms";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";

type Props = {
  locale: Locale;
  banners: SiteBanner[];
};

function storageKey(id: number) {
  return `cni-banner-dismiss-${id}`;
}

function isDismissed(id: number): boolean {
  try {
    return sessionStorage.getItem(storageKey(id)) === "1";
  } catch {
    return false;
  }
}

export function SiteBannerBar({ locale, banners }: Props) {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  const visible = useMemo(
    () =>
      banners.filter((banner) => {
        if (!banner.dismissible) return true;
        if (dismissedIds.includes(banner.id)) return false;
        return !isDismissed(banner.id);
      }),
    [banners, dismissedIds],
  );

  if (visible.length === 0) return null;

  const banner = visible[0];

  function dismiss() {
    if (banner.dismissible) {
      try {
        sessionStorage.setItem(storageKey(banner.id), "1");
      } catch {
        // ignore
      }
      setDismissedIds((ids) => [...ids, banner.id]);
    }
  }

  const style = {
    backgroundColor: banner.background_color || "#252A58",
    color: banner.text_color || "#ffffff",
  } as const;

  const content = (
    <div className="flex flex-1 flex-wrap items-center justify-center gap-3 text-sm font-medium">
      <span>{banner.title}</span>
      {banner.body && <span className="opacity-90">{banner.body}</span>}
      {banner.link_url && banner.cta_label && (
        <span className="font-bold underline underline-offset-2">{banner.cta_label}</span>
      )}
    </div>
  );

  return (
    <div
      className="relative z-[60] border-b border-white/10 px-4 py-2.5"
      style={style}
      role="region"
      aria-label={locale === "es" ? "Aviso institucional" : "Institutional notice"}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4">
        {banner.link_url ? (
          <Link
            href={banner.link_url}
            target={banner.link_external ? "_blank" : undefined}
            rel={banner.link_external ? "noopener noreferrer" : undefined}
            className="flex flex-1 justify-center hover:opacity-95"
          >
            {content}
          </Link>
        ) : (
          content
        )}
        {banner.dismissible && (
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded p-1 opacity-80 hover:opacity-100"
            aria-label={locale === "es" ? "Cerrar aviso" : "Dismiss notice"}
          >
            <MaterialIcon name="close" className="text-lg" />
          </button>
        )}
      </div>
    </div>
  );
}
