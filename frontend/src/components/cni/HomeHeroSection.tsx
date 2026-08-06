"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import type { SiteBanner } from "@/src/types/cms";
import {
  bannerCtaRel,
  bannerCtaUrl,
  bannerDesktopImage,
  bannerHasCta,
  bannerMobileImage,
  bannerCtaIsExternal,
  bannerCtaTarget,
  heroImageAlt,
  heroSlideImages,
  primaryHeroBanner,
} from "@/src/lib/cmsBanners";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";

type Props = {
  locale: Locale;
  banners: SiteBanner[];
  fallbackTitle: React.ReactNode;
};

function HeroCta({ banner }: { banner: SiteBanner }) {
  if (!bannerHasCta(banner)) return null;

  const href = bannerCtaUrl(banner);
  const external = bannerCtaIsExternal(banner);
  const className =
    "mt-6 inline-flex items-center gap-2 rounded-full bg-cni-gold px-8 py-3.5 font-headline text-xs font-bold uppercase tracking-widest text-cni-primary transition hover:bg-cni-gold/90";

  if (external) {
    return (
      <a href={href} target={bannerCtaTarget(banner)} rel={bannerCtaRel(banner)} className={className}>
        {banner.cta_label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {banner.cta_label}
    </Link>
  );
}

function HeroSlides({ banners, locale }: { banners: SiteBanner[]; locale: Locale }) {
  const slides = heroSlideImages(banners);
  const slideCount = slides.length;
  const interval = slideCount > 0 ? 20 / slideCount : 20;

  return (
    <>
      {slides.map((src, idx) => {
        const banner = banners.find((item) => bannerDesktopImage(item) === src);
        return (
          <div
            key={`${src}-${idx}`}
            className="hero-slide absolute inset-0"
            style={{ animationDelay: `${idx * interval}s` }}
          >
            <picture>
              {banner && bannerMobileImage(banner) !== bannerDesktopImage(banner) && (
                <source media="(max-width: 767px)" srcSet={bannerMobileImage(banner)!} />
              )}
              <Image
                className="object-cover opacity-70"
                src={src}
                alt={heroImageAlt(locale, banner ?? null)}
                fill
                priority={idx === 0}
                sizes="100vw"
              />
            </picture>
          </div>
        );
      })}
    </>
  );
}

export function HomeHeroSection({ locale, banners, fallbackTitle }: Props) {
  const primary = primaryHeroBanner(banners);
  const slides = heroSlideImages(banners);
  const showCmsContent = banners.length > 0;

  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden bg-cni-primary -mt-[5.25rem] pt-[5.25rem] h-screen min-h-[100vh]",
      )}
    >
      <div className="absolute inset-0 z-0">
        {slides.length > 0 ? (
          <HeroSlides banners={banners} locale={locale} />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-cni-primary via-cni-primary/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-8">
        {showCmsContent && primary ? (
          <>
            {primary.title && (
              <h1
                className={cn(
                  t.heroTitle,
                  "uppercase leading-[0.9] tracking-tighter text-white",
                )}
              >
                {primary.title}
              </h1>
            )}
            {primary.body && (
              <p className="mt-4 max-w-2xl font-body text-lg text-white/85">{primary.body}</p>
            )}
            <HeroCta banner={primary} />
          </>
        ) : (
          <h1
            className={cn(t.heroTitle, "uppercase leading-[0.9] tracking-tighter text-white")}
          >
            {fallbackTitle}
          </h1>
        )}
      </div>
    </section>
  );
}
