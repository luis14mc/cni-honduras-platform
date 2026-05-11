"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { layoutCopy } from "@/src/i18n/copy/layout";
import type { Locale } from "@/src/i18n/config";
import { getLocaleFromPathname, stripLocalePrefix, withLocale } from "@/src/i18n/path";
import { LanguageSwitch } from "@/src/components/layout/LanguageSwitch";

type DropdownId = "invertir" | "crecer" | "cni" | null;

type DropdownItem = {
  label: string;
  href: string;
  external?: boolean;
};

type DropdownDef = {
  id: Exclude<DropdownId, null>;
  label: string;
  items: readonly DropdownItem[];
};

export default function Navbar() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) as Locale;
  const L = (path: string) => withLocale(locale, path);
  const t = layoutCopy[locale].nav;

  const dropdowns: readonly DropdownDef[] = [
    {
      id: "invertir",
      label: t.dropdowns.invertir.label,
      items: [{ label: t.dropdowns.invertir.sectors, href: L("/invertir#sectores") }],
    },
    {
      id: "crecer",
      label: t.dropdowns.crecer.label,
      items: [
        { label: t.dropdowns.crecer.portfolio, href: L("/crecer#portafolio") },
        { label: t.dropdowns.crecer.cases, href: L("/crecer#casos") },
        { label: t.dropdowns.crecer.pdi, href: "https://pdihonduras.gob.hn", external: true },
      ],
    },
    {
      id: "cni",
      label: t.dropdowns.cni.label,
      items: [
        { label: t.dropdowns.cni.legal, href: L("/cni#servicios-legales") },
        { label: t.dropdowns.cni.technical, href: L("/cni#servicios-tecnicos") },
        { label: t.dropdowns.cni.data, href: L("/cni#inteligencia-de-datos") },
      ],
    },
  ] as const;

  const topLinks: readonly { label: string; href: string }[] = [
    { label: t.top.press, href: L("/prensa") },
    { label: t.top.advisory, href: L("/asesoria") },
    { label: t.top.procedures, href: L("/tramites") },
  ];

  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  const closeDropdowns = useCallback(() => setOpenDropdown(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdowns();
    };
    const onPointer = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) closeDropdowns();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [closeDropdowns]);

  useEffect(() => {
    setMobileOpen(false);
    closeDropdowns();
  }, [pathname, closeDropdowns]);

  const linkIsActive = (href: string) => {
    const hrefPath = stripLocalePrefix(href.split("#")[0] ?? "");
    const current = stripLocalePrefix(pathname).split("#")[0] ?? "";
    if (hrefPath === "/" || hrefPath === "") return current === "/" || current === "";
    return current === hrefPath || current.startsWith(`${hrefPath}/`);
  };

  return (
    <header ref={navRef} className="fixed inset-x-0 top-0 z-50 flex flex-col shadow-lg shadow-black/15">
      <div className="flex h-10 items-center justify-end gap-4 border-b border-white/10 bg-[#002147] px-4 md:gap-6 md:px-10">
        <LanguageSwitch />
        {topLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/75 transition hover:text-[#e9c176] md:text-xs"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <nav className="border-b border-white/10 bg-[#000a1e]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 md:px-10">
          <Link href={L("/")} className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 items-center justify-center rounded-sm bg-[#e9c176] px-2.5 text-sm font-extrabold text-[#191c1d]">
              CNI
            </span>
            <span className="hidden text-[0.58rem] font-extrabold uppercase leading-tight tracking-[0.12em] text-white sm:block md:text-[0.62rem]">
              {t.brandSubtitle}
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href={L("/")}
              className={cn(
                "rounded px-3 py-2 text-xs font-bold uppercase tracking-widest transition",
                linkIsActive(L("/")) ? "text-[#e9c176]" : "text-white/70 hover:text-white",
              )}
            >
              {t.home}
            </Link>

            {dropdowns.map((d) => {
              const isOpen = openDropdown === d.id;
              return (
                <div key={d.id} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className={cn(
                      "flex items-center gap-1 rounded px-3 py-2 text-xs font-bold uppercase tracking-widest transition",
                      isOpen ? "text-[#e9c176]" : "text-white/70 hover:text-white",
                    )}
                    onClick={() => setOpenDropdown((cur) => (cur === d.id ? null : d.id))}
                  >
                    {d.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full z-50 mt-1 min-w-[280px] max-w-sm rounded-md border border-white/10 bg-[#000a1e] py-2 shadow-xl"
                    >
                      {d.items.map((item) =>
                        item.external ? (
                          <a
                            key={item.href}
                            role="menuitem"
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2.5 text-sm font-medium leading-snug text-white/85 hover:bg-white/5 hover:text-[#e9c176]"
                            onClick={closeDropdowns}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            key={item.href}
                            role="menuitem"
                            href={item.href}
                            className="block px-4 py-2.5 text-sm font-medium leading-snug text-white/85 hover:bg-white/5 hover:text-[#e9c176]"
                            onClick={closeDropdowns}
                          >
                            {item.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href={L("/vivir")}
              className={cn(
                "rounded px-3 py-2 text-xs font-bold uppercase tracking-widest transition",
                linkIsActive(L("/vivir")) ? "text-[#e9c176]" : "text-white/70 hover:text-white",
              )}
            >
              {t.vivir}
            </Link>

            <Link
              href={L("/recursos")}
              className={cn(
                "rounded px-3 py-2 text-xs font-bold uppercase tracking-widest transition",
                linkIsActive(L("/recursos")) ? "text-[#e9c176]" : "text-white/70 hover:text-white",
              )}
            >
              {t.recursos}
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="max-h-[min(80vh,calc(100dvh-7rem))] overflow-y-auto border-t border-white/10 bg-[#000a1e] px-4 py-4 lg:hidden">
            <div className="mb-4 flex justify-end">
              <LanguageSwitch />
            </div>
            <Link href={L("/")} className="block py-2 text-sm font-bold uppercase tracking-wide text-white" onClick={() => setMobileOpen(false)}>
              {t.home}
            </Link>
            {dropdowns.map((d) => (
              <div key={d.id} className="border-t border-white/10 py-3">
                <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#e9c176]">{d.label}</p>
                {d.items.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2 text-sm text-white/85"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} className="block py-2 text-sm text-white/85" onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
            <Link
              href={L("/vivir")}
              className="block border-t border-white/10 py-3 text-sm font-bold uppercase tracking-wide text-white"
              onClick={() => setMobileOpen(false)}
            >
              {t.vivir}
            </Link>
            <Link href={L("/recursos")} className="block py-3 text-sm font-bold uppercase tracking-wide text-white" onClick={() => setMobileOpen(false)}>
              {t.recursos}
            </Link>
            <div className="border-t border-white/10 pt-3">
              {topLinks.map((l) => (
                <Link key={l.href} href={l.href} className="block py-2 text-xs font-semibold uppercase tracking-wider text-white/70" onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
