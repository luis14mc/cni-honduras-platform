"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layoutCopy } from "@/src/i18n/copy/layout";
import type { Locale } from "@/src/i18n/config";
import { getLocaleFromPathname, withLocale } from "@/src/i18n/path";

export default function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) as Locale;
  const L = (path: string) => withLocale(locale, path);
  const t = layoutCopy[locale].footer;
  const l = t.links;

  const institucional: ReadonlyArray<{ label: string; href: string }> = [
    { label: l.theCni, href: L("/cni") },
    { label: l.legalServices, href: L("/cni#servicios-legales") },
    { label: l.dataIntel, href: L("/cni#inteligencia-de-datos") },
  ];

  const recursos: ReadonlyArray<{ label: string; href: string; external?: boolean }> = [
    { label: l.pressRoom, href: L("/prensa") },
    { label: l.onlineProcedures, href: L("/tramites") },
    { label: l.pdi, href: "https://pdihonduras.gob.hn", external: true },
  ];

  return (
    <footer className="mt-auto w-full border-t-4 border-[#e9c176] bg-[#000a1e] pt-16 pb-10 text-white">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-6 md:px-10 lg:grid-cols-4 lg:gap-10">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 items-center justify-center rounded-sm bg-[#e9c176] px-2.5 text-sm font-extrabold text-[#191c1d]">
              CNI
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.12em]">{layoutCopy[locale].nav.brandSubtitle}</span>
          </div>
          <p className="text-sm leading-relaxed text-white/70">{t.tagline}</p>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e9c176]">{t.institutional}</h4>
          <nav className="flex flex-col gap-3 text-sm text-white/70">
            {institucional.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e9c176]">{t.resources}</h4>
          <nav className="flex flex-col gap-3 text-sm text-white/70">
            {recursos.map((item) =>
              item.external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e9c176]">{t.contact}</h4>
          <address className="not-italic text-sm leading-relaxed text-white/70">
            Centro Cívico Gubernamental (CCG),
            <br />
            Torre 1, Piso 12.
            <br />
            Tegucigalpa, Honduras.
            <br />
            <a className="mt-2 inline-block text-[#e9c176] hover:underline" href="mailto:info@cni.hn">
              info@cni.hn
            </a>
          </address>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-screen-2xl border-t border-white/10 px-6 pt-8 text-center md:px-10">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/45">
          © {new Date().getFullYear()} CNI Honduras — {t.copyright}
        </p>
      </div>
    </footer>
  );
}
