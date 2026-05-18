"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layoutCopy } from "@/src/i18n/copy/layout";
import type { Locale } from "@/src/i18n/config";
import { getLocaleFromPathname } from "@/src/config/siteNavigation";
import { resolveHref } from "@/src/i18n/path";

export default function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) as Locale;
  const t = layoutCopy[locale].footer;
  const L = (p: string) => resolveHref(locale, p);

  // Columna 2: Institucional → El CNI, Servicios Legales, Inteligencia de Datos
  const institucional = [
    { label: t.links.theCni, href: L("/cni") },
    { label: t.links.legalServices, href: L("/cni/servicios-legales") },
    { label: t.links.dataIntel, href: L("/cni/inteligencia-de-datos") },
  ];

  // Columna 3: Recursos → Sala de Prensa, Trámites en Línea, Portal Digital de Inversiones
  const recursos = [
    { label: t.links.pressRoom, href: L("/prensa") },
    { label: t.links.onlineProcedures, href: L("/tramites") },
    { label: t.links.pdi, href: "https://pdihonduras.gob.hn", external: true as const },
  ];

  return (
    <footer
      className="mt-auto w-full border-t-4 border-[#e9c176] bg-[#000a1e] pt-16 pb-10 text-white"
      role="contentinfo"
    >
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-6 md:px-10 lg:grid-cols-4 lg:gap-10">
        {/* Columna 1: Identidad */}
        <div>
          <Link href={L("/")} className="mb-6 flex items-center gap-3" aria-label={layoutCopy[locale].nav.brandSubtitle}>
            <span className="flex h-10 items-center justify-center rounded-sm bg-[#e9c176] px-2.5 text-sm font-extrabold text-[#191c1d]">
              CNI
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.12em]">
              {layoutCopy[locale].nav.brandSubtitle}
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-white/70">{t.tagline}</p>
        </div>

        {/* Columna 2: Institucional */}
        <nav aria-labelledby="footer-institutional">
          <h2 id="footer-institutional" className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e9c176]">
            {t.institutional}
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            {institucional.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Columna 3: Recursos */}
        <nav aria-labelledby="footer-resources">
          <h2 id="footer-resources" className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e9c176]">
            {t.resources}
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            {recursos.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                    aria-label={`${item.label} (abre en nueva pestaña)`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Columna 4: Contacto */}
        <div>
          <h2 className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e9c176]">
            {t.contact}
          </h2>
          <address className="not-italic text-sm leading-relaxed text-white/70">
            Centro Cívico Gubernamental (CCG),
            <br />
            Torre 1, Piso 12.
            <br />
            Tegucigalpa, Honduras.
            <br />
            <a
              className="mt-2 inline-block text-[#e9c176] hover:underline"
              href="mailto:info@cni.hn"
              aria-label="Enviar correo a info@cni.hn"
            >
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
