import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import type { SectorGuideContent } from "@/src/data/sectorPageContent";
import { sectorTemplateChrome } from "@/src/data/sectorPageContent";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  guide: SectorGuideContent | null;
};

function resolveGuideHref(locale: Locale, fileUrl: string): { href: string; external: boolean; downloadable: boolean } {
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return { href: fileUrl, external: true, downloadable: true };
  }
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return { href: withLocale(locale, path), external: false, downloadable: false };
}

export function SectorGuide({ locale, guide }: Props) {
  if (!guide) return null;
  const copy = sectorTemplateChrome[locale];
  const { href, external, downloadable } = resolveGuideHref(locale, guide.fileUrl);
  const title = guide.title || copy.guideFallbackTitle;
  const subtitle = guide.subtitle || copy.guideFallbackSubtitle;

  const ctaClassName = cn(
    "al-sector-guide-cta mt-8 inline-flex w-fit items-center gap-3 rounded-full px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_40px_-12px_rgba(37,42,88,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-12px_rgba(37,42,88,0.5)]",
  );

  const ctaContent = (
    <>
      {copy.guideCta}
      <ArrowDownToLine className="h-4 w-4" aria-hidden />
    </>
  );

  return (
    <section
      className={cn("bg-white", layout.section, "border-t border-cni-primary/8")}
      aria-labelledby="sector-guide-title"
    >
      <div className={layout.container}>
        <div className="al-sector-guide-showcase relative overflow-hidden rounded-[28px] border border-cni-primary/10 bg-white shadow-[0_28px_90px_-36px_rgba(37,42,88,0.32)]">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.14] blur-3xl"
            style={{ background: "var(--sector-accent, #29AB85)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[color:var(--sector-accent,#29AB85)] to-transparent opacity-80"
            aria-hidden
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
            <div className="flex items-center justify-center bg-gradient-to-br from-[#f8f9ff] via-white to-white px-8 py-12 sm:px-10 lg:col-span-5 lg:py-16">
              <div className="relative aspect-[5/3] w-full max-w-[420px] sm:max-w-[480px]">
                <Image
                  src={guide.image}
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_24px_48px_rgba(37,42,88,0.22)] transition-transform duration-500 ease-out hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 90vw, 420px"
                />
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-1 lg:items-center lg:justify-center lg:py-12">
              <span className="al-sector-guide-divider block h-[min(280px,70%)] w-[3px] rounded-full" aria-hidden />
            </div>

            <div className="flex flex-col justify-center px-8 pb-12 pt-2 sm:px-10 lg:col-span-6 lg:px-12 lg:py-16">
              <p className="al-sector-guide-eyebrow font-headline text-[10px] font-bold uppercase tracking-[0.22em]">
                {copy.guideEyebrow}
              </p>
              <h2
                id="sector-guide-title"
                className="mt-4 font-display text-[2rem] font-extrabold uppercase leading-[0.95] tracking-tight text-cni-primary sm:text-4xl lg:text-[2.65rem]"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-3 font-display text-xl font-bold text-cni-primary/85 sm:text-2xl">{subtitle}</p>
              ) : null}
              {guide.description ? (
                <p className={cn("mt-5 max-w-lg text-cni-on-surface-variant", t.lead)}>{guide.description}</p>
              ) : null}

              {external ? (
                <a
                  href={href}
                  {...(downloadable ? { download: true } : {})}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaClassName}
                >
                  {ctaContent}
                </a>
              ) : (
                <Link href={href} className={ctaClassName}>
                  {ctaContent}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
