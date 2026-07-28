"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { withLocale } from "@/src/i18n/path";
import { InterestLinkIcon, type InterestLinkIconId } from "@/src/components/cni/InterestLinkIcons";

type InterestLink = {
  id: InterestLinkIconId;
  title: string;
  href: string;
  external: boolean;
  accent: string;
};

function buildLinks(locale: Locale): InterestLink[] {
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

type Props = {
  locale: Locale;
};

export function InterestLinksSection({ locale }: Props) {
  const copy = homeCopy[locale].enlacesRapidos;
  const links = buildLinks(locale);

  return (
    <section
      className="border-t border-cni-primary/10 bg-white py-9 md:py-10"
      aria-labelledby="interest-links-title"
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
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

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:items-start lg:justify-end lg:gap-0 lg:divide-x lg:divide-cni-primary/10">
            {links.map((item) => (
              <li key={item.id} className="lg:min-w-0 lg:flex-1 lg:px-5 lg:first:pl-0 lg:last:pr-0">
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="al-interest-link group flex items-center gap-3.5 rounded-xl px-1 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29AB85] lg:flex-col lg:items-center lg:gap-3 lg:px-0 lg:py-0 lg:text-center"
                  style={{ "--interest-accent": item.accent } as CSSProperties}
                >
                  <span className="al-interest-hex relative flex h-11 w-11 shrink-0 items-center justify-center text-cni-primary transition-[color,transform] duration-300 group-hover:scale-105 group-hover:text-[color:var(--interest-accent)] md:h-12 md:w-12">
                    <span
                      className="pointer-events-none absolute inset-0 bg-[#f8f9ff] transition-colors duration-300 group-hover:bg-[color:var(--interest-accent)]/10"
                      aria-hidden
                    />
                    <InterestLinkIcon id={item.id} className="relative h-5 w-5 md:h-[1.35rem] md:w-[1.35rem]" />
                  </span>

                  <span className="min-w-0 flex-1 font-headline text-[11px] font-bold uppercase leading-snug tracking-[0.1em] text-cni-primary transition-colors duration-300 group-hover:text-[color:var(--interest-accent)] lg:flex-none lg:max-w-[9.5rem] lg:text-[10px] lg:tracking-[0.12em]">
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
