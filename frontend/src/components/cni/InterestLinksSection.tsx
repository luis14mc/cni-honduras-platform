"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { withLocale } from "@/src/i18n/path";
import { InterestLinkIcon, type InterestLinkIconId } from "@/src/components/cni/InterestLinkIcons";
import type { InstitutionalLink } from "@/src/types/cms";

type InterestLink = {
  id: InterestLinkIconId;
  title: string;
  href: string;
  external: boolean;
  accent: string;
};

function buildFallbackLinks(locale: Locale): InterestLink[] {
  const copy = homeCopy[locale].enlacesRapidos;

  return [
    {
      id: "guia",
      title: copy.guia,
      href: "https://online.flippingbook.com/view/972979540/",
      external: true,
      accent: "#29AB85",
    },
    {
      id: "memoria",
      title: copy.memoria,
      href: "https://online.flippingbook.com/view/975450084/",
      external: true,
      accent: "#24436B",
    },
    {
      id: "pdi",
      title: copy.portal,
      href: "https://pdihonduras.gob.hn/consulta",
      external: true,
      accent: "#0E7A7C",
    },
    {
      id: "estudios",
      title: copy.estudios,
      href: withLocale(locale, "/recursos/estudios"),
      external: false,
      accent: "#35A963",
    },
  ];
}

function mapApiLinks(links: InstitutionalLink[]): InterestLink[] {
  return links.map((link) => ({
    id: (link.icon as InterestLinkIconId) || "guia",
    title: link.title,
    href: link.url,
    external: link.is_external,
    accent: link.accent_color || "#29AB85",
  }));
}

type Props = {
  locale: Locale;
  links?: InstitutionalLink[];
};

export function InterestLinksSection({ locale, links = [] }: Props) {
  const copy = homeCopy[locale].enlacesRapidos;
  const resolvedLinks = links.length > 0 ? mapApiLinks(links) : buildFallbackLinks(locale);

  return (
    <section
      className="border-t border-cni-primary/10 bg-white py-10 md:py-12"
      aria-labelledby="interest-links-title"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <header className="shrink-0 lg:max-w-[13rem]">
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#29AB85]">
              {copy.sectionEyebrow}
            </p>
            <h2
              id="interest-links-title"
              className="mt-2 font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-cni-primary md:text-[1.35rem]"
            >
              {copy.sectionTitle}
            </h2>
          </header>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-1 lg:items-start lg:justify-end lg:gap-0 lg:divide-x lg:divide-cni-primary/10">
            {resolvedLinks.map((item) => (
              <li key={item.id} className="lg:min-w-0 lg:flex-1 lg:px-6 lg:first:pl-0 lg:last:pr-0">
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="al-interest-link group flex items-center gap-4 rounded-xl px-1 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29AB85] sm:gap-5 lg:flex-col lg:items-center lg:gap-4 lg:px-0 lg:py-1 lg:text-center"
                  style={{ "--interest-accent": item.accent } as CSSProperties}
                >
                  <span className="relative flex h-20 w-20 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <InterestLinkIcon id={item.id} className="h-full w-full object-contain" />
                  </span>

                  <span className="min-w-0 flex-1 font-headline text-xs font-bold uppercase leading-snug tracking-[0.1em] text-cni-primary transition-colors duration-300 group-hover:text-[color:var(--interest-accent)] sm:text-[13px] lg:flex-none lg:max-w-[11rem] lg:text-xs lg:tracking-[0.12em]">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
