"use client";

import Link from "next/link";
import Image from "next/image";
import { CniLogo } from "@/src/components/layout/CniLogo";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "https://www.facebook.com/CNIHonduras", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com", label: "Instagram" },
  { Icon: XIcon, href: "https://twitter.com/cni_honduras", label: "X" },
  { Icon: Linkedin, href: "https://www.linkedin.com/company/cni-honduras", label: "LinkedIn" },
  { Icon: Youtube, href: "https://www.youtube.com", label: "YouTube" },
] as const;

type FooterCopy = {
  description: string;
  investorsTitle: string;
  investorsLinks: { label: string; href: string }[];
  externalTitle: string;
  externalLinks: { label: string; href: string }[];
  cta: { title: string; desc: string; btn: string };
  offices: {
    tguTitle: string;
    tguAddress: string;
    tguTel: string;
    tguEmail: string;
    spsTitle: string;
    spsAddress: string;
    spsTel: string;
    spsEmail: string;
  };
  legal: { privacy: string; terms: string; transparency: string; copyright: string };
};

export function FooterBrandColumn({
  homeHref,
  brandAria,
  copy,
}: {
  homeHref: string;
  brandAria: string;
  copy: FooterCopy;
}) {
  return (
    <div className="flex flex-col">
      <CniLogo
        href={homeHref}
        ariaLabel={brandAria}
        variant="light"
        className="mb-6"
        imageClassName="h-14 md:h-16"
      />
      <p className="mb-6 max-w-xs font-body text-sm leading-relaxed text-white/60">{copy.description}</p>
      <div className="flex gap-3">
        {SOCIAL_LINKS.map(({ Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-[#32B372] hover:text-[#32B372]"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function FooterLinkColumn({
  id,
  title,
  links,
  resolveHref,
  external = false,
  columns = 1,
}: {
  id: string;
  title: string;
  links: { label: string; href: string }[];
  resolveHref: (path: string) => string;
  external?: boolean;
  columns?: 1 | 2;
}) {
  return (
    <nav aria-labelledby={id} className="flex flex-col">
      <h4
        id={id}
        className="mb-5 font-headline text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/90"
      >
        {title}
      </h4>
      <ul
        className={
          columns === 2
            ? "grid grid-cols-2 gap-x-6 gap-y-3 font-body text-sm text-white/60"
            : "space-y-3 font-body text-sm text-white/60"
        }
      >
        {links.map((item) => (
          <li key={item.label}>
            {external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#32B372]"
              >
                {item.label}
              </a>
            ) : (
              <Link href={resolveHref(item.href)} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function FooterExternalLinkColumns({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}) {
  const halfIndex = Math.ceil(links.length / 2);
  const columnA = links.slice(0, halfIndex);
  const columnB = links.slice(halfIndex);
  const renderItem = (item: { label: string; href: string }) => (
    <li key={item.label}>
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[#32B372]"
      >
        {item.label}
      </a>
    </li>
  );
  return (
    <nav aria-labelledby={id} className="flex flex-col">
      <h4
        id={id}
        className="mb-5 font-headline text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/90"
      >
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <ul className="space-y-3 font-body text-sm text-white/60">{columnA.map(renderItem)}</ul>
        <ul className="space-y-3 font-body text-sm text-white/60">{columnB.map(renderItem)}</ul>
      </div>
    </nav>
  );
}

export function FooterGuacamayaCta({
  copy,
  contactHref,
}: {
  copy: FooterCopy;
  contactHref: string;
}) {
  return (
    <div className="footer-guacamaya-banner group/banner relative mb-12 overflow-hidden rounded-2xl border border-white/10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#1a1f42]" />
        <div
          className="absolute inset-y-0 right-0 w-[62%] bg-gradient-to-br from-[#2d3560] via-[#252a58] to-[#1e2348]"
          style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div
          className="absolute inset-y-[-10%] left-[34%] w-16 bg-[#32B372]/25 md:w-20"
          style={{ clipPath: "polygon(35% 0, 100% 0, 65% 100%, 0 100%)" }}
        />
        <div className="absolute -right-8 top-0 h-full w-32 rotate-12 bg-white/[0.03] md:w-40" />
      </div>

      <div className="relative flex flex-col items-center gap-5 px-5 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-7 sm:py-7 md:gap-10">
        <div className="footer-guacamaya-float relative shrink-0">
          <div
            className="absolute -inset-3 rounded-full bg-[#32B372]/15 blur-md"
            aria-hidden
          />
          <div className="relative h-24 w-24 sm:h-28 sm:w-28">
            <Image
              src="/footer/guacamaya.png"
              alt=""
              width={480}
              height={400}
              className="h-full w-full object-contain object-bottom drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover/banner:scale-105 group-hover/banner:-rotate-2"
              priority={false}
            />
          </div>
        </div>

        <div className="hidden h-16 w-px shrink-0 bg-gradient-to-b from-transparent via-[#32B372]/60 to-transparent sm:block sm:rotate-12" aria-hidden />

        <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left">
          <p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#32B372]">
            CNI Honduras
          </p>
          <h3 className="font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
            {copy.cta.title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{copy.cta.desc}</p>
          <Link
            href={contactHref}
            className="mt-5 inline-flex items-center justify-center rounded-md bg-[#32B372] px-6 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#32B372]/20 transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#252A58] hover:shadow-white/10"
          >
            {copy.cta.btn}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FooterBottomBar({
  copy,
  resolveHref,
}: {
  copy: FooterCopy;
  resolveHref: (path: string) => string;
}) {
  return (
    <div className="border-t border-white/10 pt-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div>
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-widest text-[#32B372]">
            {copy.offices.tguTitle}
          </p>
          <p className="text-xs leading-relaxed text-white/50">
            {copy.offices.tguAddress}
          </p>
          <a
            href={`mailto:${copy.offices.tguEmail}`}
            className="mt-2 inline-block text-xs leading-relaxed text-white/55 transition-colors hover:text-[#32B372]"
          >
            {copy.offices.tguEmail}
          </a>
          <p className="text-xs leading-relaxed text-white/50">{copy.offices.tguTel}</p>
        </div>

        <div>
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-widest text-[#32B372]">
            {copy.offices.spsTitle}
          </p>
          <p className="text-xs leading-relaxed text-white/50">
            {copy.offices.spsAddress}
          </p>
          <a
            href={`mailto:${copy.offices.spsEmail}`}
            className="mt-2 inline-block text-xs leading-relaxed text-white/55 transition-colors hover:text-[#32B372]"
          >
            {copy.offices.spsEmail}
          </a>
          <p className="text-xs leading-relaxed text-white/50">{copy.offices.spsTel}</p>
        </div>

        <div className="lg:col-span-2 lg:text-right">
          <p className="text-[0.6875rem] uppercase tracking-wider text-white/40">
            © {new Date().getFullYear()} {copy.legal.copyright}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-white/35 lg:justify-end">
            <Link href={resolveHref("/recursos")} className="transition-colors hover:text-white">
              {copy.legal.privacy}
            </Link>
            <Link href={resolveHref("/recursos")} className="transition-colors hover:text-white">
              {copy.legal.terms}
            </Link>
            <Link href={resolveHref("/recursos")} className="transition-colors hover:text-white">
              {copy.legal.transparency}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FooterCopy };
