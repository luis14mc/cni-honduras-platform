"use client";

import Image from "next/image";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { HOME_HERO_IMAGES } from "@/src/lib/homeHero";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";

type Props = {
  locale: Locale;
  title: React.ReactNode;
};

function StaticHeroSlides({ locale }: { locale: Locale }) {
  const alt = homeCopy[locale].hero.imageAlt;
  const slideCount = HOME_HERO_IMAGES.length;
  const interval = slideCount > 0 ? 20 / slideCount : 20;

  return (
    <>
      {HOME_HERO_IMAGES.map((src, idx) => (
        <div
          key={src}
          className="hero-slide absolute inset-0"
          style={{ animationDelay: `${idx * interval}s` }}
        >
          <Image
            className="object-cover opacity-70"
            src={src}
            alt={alt}
            fill
            priority={idx === 0}
            sizes="100vw"
          />
        </div>
      ))}
    </>
  );
}

/**
 * Home structural hero — always uses static assets from /public/images/hero/home.
 * SiteBanner / CMS must not drive these images.
 */
export function HomeHeroSection({ locale, title }: Props) {
  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden bg-cni-primary -mt-[5.25rem] pt-[5.25rem] h-screen min-h-[100vh]",
      )}
    >
      <div className="absolute inset-0 z-0">
        <StaticHeroSlides locale={locale} />
        <div className="absolute inset-0 bg-gradient-to-t from-cni-primary via-cni-primary/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-8">
        <h1 className={cn(t.heroTitle, "uppercase leading-[0.9] tracking-tighter text-white")}>
          {title}
        </h1>
      </div>
    </section>
  );
}
