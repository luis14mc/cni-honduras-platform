"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { InterestLinkIcon, type InterestLinkIconId } from "@/src/components/cni/InterestLinkIcons";
import type { InstitutionalLink } from "@/src/types/cms";
import { mapInstitutionalLinkHref } from "@/src/lib/institutionalLinks";

type LoadStatus = "ok" | "error";

type InterestLink = {
  id: InterestLinkIconId;
  title: string;
  href: string;
  external: boolean;
  accent: string;
};

function mapApiLinks(links: InstitutionalLink[], locale: Locale): InterestLink[] {
  return links.map((link) => ({
    id: (link.icon as InterestLinkIconId) || "guia",
    title: link.title,
    href: mapInstitutionalLinkHref(link, locale),
    external: link.is_external,
    accent: link.accent_color || "#29AB85",
  }));
}

type Props = {
  locale: Locale;
  links?: InstitutionalLink[];
  status?: LoadStatus;
};

export function InterestLinksSection({ locale, links = [], status = "ok" }: Props) {
  const copy = homeCopy[locale].enlacesRapidos;
  const resolvedLinks = mapApiLinks(links, locale);

  return (
    <section
      className="border-t border-cni-primary/10 bg-white py-14 md:py-20"
      aria-labelledby="interest-links-title"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <header className="shrink-0 lg:max-w-[16rem]">
            <p className="font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#29AB85]">
              {copy.sectionEyebrow}
            </p>
            <h2
              id="interest-links-title"
              className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-cni-primary md:text-3xl"
            >
              {copy.sectionTitle}
            </h2>
          </header>

          {status === "error" ? (
            <p className="font-body text-base text-cni-primary/70 lg:flex-1 lg:text-right" role="status">
              {copy.error}
            </p>
          ) : resolvedLinks.length === 0 ? (
            <p className="font-body text-base text-cni-primary/60 lg:flex-1 lg:text-right" role="status">
              {copy.empty}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:flex lg:flex-1 lg:items-start lg:justify-end lg:gap-0 lg:divide-x lg:divide-cni-primary/10">
              {resolvedLinks.map((item) => (
                <li key={item.id} className="lg:min-w-0 lg:flex-1 lg:px-8 lg:first:pl-0 lg:last:pr-0">
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="al-interest-link group flex items-center gap-5 rounded-xl px-1 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29AB85] sm:gap-6 lg:flex-col lg:items-center lg:gap-5 lg:px-0 lg:py-2 lg:text-center"
                    style={{ "--interest-accent": item.accent } as CSSProperties}
                  >
                    <span className="relative flex h-24 w-24 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28 lg:h-36 lg:w-36 xl:h-40 xl:w-40">
                      <InterestLinkIcon id={item.id} className="h-full w-full object-contain" />
                    </span>

                    <span className="min-w-0 flex-1 font-headline text-sm font-bold uppercase leading-snug tracking-[0.1em] text-cni-primary transition-colors duration-300 group-hover:text-[color:var(--interest-accent)] sm:text-base lg:flex-none lg:max-w-[14rem] lg:text-sm lg:tracking-[0.12em]">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
