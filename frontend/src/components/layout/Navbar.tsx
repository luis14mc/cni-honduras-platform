"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { layoutCopy } from "@/src/i18n/copy/layout";
import type { Locale } from "@/src/i18n/config";
import {
  getLocaleFromPathname,
  getNavHref,
  getNavLabel,
  getTopBarNavNodes,
  homePaths,
  pathIsActive,
  siteNavigation,
  type SiteNavNode,
} from "@/src/config/siteNavigation";
import { LanguageSwitch } from "@/src/components/layout/LanguageSwitch";
import { CniLogo } from "@/src/components/layout/CniLogo";

function NavLinkItem({
  node,
  locale,
  onNavigate,
  className,
}: {
  node: SiteNavNode;
  locale: Locale;
  onNavigate: () => void;
  className?: string;
}) {
  const href = getNavHref(node, locale);
  const label = getNavLabel(node, locale);
  const base =
    className ??
    "block px-4 py-2.5 text-sm font-medium leading-snug text-cni-on-surface-variant hover:bg-cni-surface-low hover:text-cni-primary transition-colors";

  if (node.external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        onClick={onNavigate}
        aria-label={`${label} (abre en nueva pestaña)`}
      >
        {label}
        <span aria-hidden> ↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={base} onClick={onNavigate}>
      {label}
    </Link>
  );
}

function DesktopDropdownPanel({
  node,
  locale,
  flyoutOpenId,
  setFlyoutOpenId,
  onClose,
}: {
  node: SiteNavNode;
  locale: Locale;
  flyoutOpenId: string | null;
  setFlyoutOpenId: (id: string | null) => void;
  onClose: () => void;
}) {
  const href = getNavHref(node, locale);
  const label = getNavLabel(node, locale);
  const children = node.children ?? [];
  const hasNestedFlyout = children.some((c) => c.children?.length);
  const flyoutNode = children.find((c) => c.id === flyoutOpenId && c.children?.length);

  return (
    <div
      role="menu"
      className={cn(
        "rounded-md border border-cni-surface-high bg-white shadow-2xl",
        hasNestedFlyout ? "flex max-h-[min(70vh,520px)] max-w-[min(100vw-2rem,44rem)] overflow-hidden" : "min-w-[16rem] py-2",
      )}
      onMouseLeave={() => setFlyoutOpenId(null)}
    >
      <ul className={cn("shrink-0 overflow-y-auto py-2", hasNestedFlyout ? "min-w-[16rem]" : "w-full")}>
        <li role="none">
          <Link
            role="menuitem"
            href={href}
            className="block border-b border-cni-surface-low px-4 py-2.5 text-sm font-semibold text-cni-primary hover:bg-cni-surface-low transition-colors"
            onClick={onClose}
          >
            {label}
          </Link>
        </li>
        {children.map((child) => {
          const hasChildren = Boolean(child.children?.length);
          const isFlyoutOpen = flyoutOpenId === child.id;

          if (!hasChildren) {
            return (
              <li key={child.id} role="none">
                <NavLinkItem node={child} locale={locale} onNavigate={onClose} />
              </li>
            );
          }

          return (
            <li key={child.id} role="none">
              <button
                type="button"
                aria-expanded={isFlyoutOpen}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-medium leading-snug transition-colors select-none",
                  isFlyoutOpen
                    ? "bg-cni-surface-low text-cni-primary font-semibold"
                    : "text-cni-on-surface-variant hover:bg-cni-surface-low hover:text-cni-primary",
                )}
                onMouseEnter={() => setFlyoutOpenId(child.id)}
                onFocus={() => setFlyoutOpenId(child.id)}
              >
                {getNavLabel(child, locale)}
                <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {flyoutNode && (
        <div className="min-w-[12rem] flex-1 overflow-y-auto border-l border-cni-surface-low py-2 md:min-w-[14rem]">
          <NavLinkItem
            node={flyoutNode}
            locale={locale}
            onNavigate={onClose}
            className="block px-4 py-2.5 text-sm font-semibold text-cni-primary hover:bg-cni-surface-low"
          />
          {flyoutNode.children!.map((grandchild) => (
            <NavLinkItem key={grandchild.id} node={grandchild} locale={locale} onNavigate={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavBranch({
  node,
  locale,
  onNavigate,
}: {
  node: SiteNavNode;
  locale: Locale;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(node.children?.length);

  if (!hasChildren) {
    const href = getNavHref(node, locale);
    const label = getNavLabel(node, locale);
    if (node.external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-2 text-sm text-cni-on-surface-variant hover:text-cni-primary"
          onClick={onNavigate}
        >
          {label}
          <span aria-hidden> ↗</span>
        </a>
      );
    }
    return (
      <Link href={href} className="block py-2 text-sm text-cni-on-surface-variant hover:text-cni-primary" onClick={onNavigate}>
        {label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-cni-on-surface-variant hover:text-cni-primary"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {getNavLabel(node, locale)}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="ml-3 border-l border-[#e9c176]/35 pb-2 pl-3">
          <Link
            href={getNavHref(node, locale)}
            className="block py-2 text-sm text-cni-on-surface-variant/80 hover:text-cni-primary"
            onClick={onNavigate}
          >
            {getNavLabel(node, locale)}
          </Link>
          {node.children!.map((child) => (
            <MobileNavBranch key={child.id} node={child} locale={locale} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) as Locale;
  const t = layoutCopy[locale].nav;
  const homeHref = homePaths[locale];
  const topBarNodes = getTopBarNavNodes(locale);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [flyoutOpenId, setFlyoutOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  const closeMenus = useCallback(() => {
    setOpenDropdownId(null);
    setFlyoutOpenId(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    const onPointer = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) closeMenus();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [closeMenus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    closeMenus();
  }, [pathname, closeMenus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!openDropdownId) setFlyoutOpenId(null);
  }, [openDropdownId]);

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 flex flex-col shadow-lg shadow-black/15"
      role="banner"
    >
      <div className="flex h-9 items-center justify-end gap-5 border-b border-white/10 bg-[#000a1e] px-4 md:gap-7 md:px-10">
        <nav aria-label={locale === "es" ? "Enlaces rápidos" : "Quick links"} className="flex items-center gap-5 md:gap-7">
          {topBarNodes.map((n) => (
            <Link
              key={n.id}
              href={getNavHref(n, locale)}
              className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-[#e9c176]"
            >
              {getNavLabel(n, locale)}
            </Link>
          ))}
        </nav>
        <LanguageSwitch />
      </div>

      <nav className="bg-white/95 backdrop-blur-lg border-b border-cni-surface-low shadow-sm" aria-label={locale === "es" ? "Menú principal" : "Main menu"}>
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 md:px-10">
          <CniLogo href={homeHref} ariaLabel={t.brandSubtitle} priority variant="dark" />

          <ul className="hidden items-center gap-1 lg:flex" role="menubar">
            <li role="none">
              <Link
                role="menuitem"
                href={homeHref}
                className={cn(
                  "px-3 py-2 text-xs font-bold uppercase tracking-widest transition border-b-2 pb-1",
                  pathIsActive(pathname, homeHref)
                    ? "text-cni-primary border-cni-gold"
                    : "text-cni-on-surface-variant border-transparent hover:text-cni-primary hover:border-cni-gold/40",
                )}
              >
                {t.home}
              </Link>
            </li>

            {siteNavigation.map((node) => {
              const hasChildren = Boolean(node.children?.length);
              const isOpen = openDropdownId === node.id;
              const href = getNavHref(node, locale);
              const label = getNavLabel(node, locale);

              if (!hasChildren) {
                return (
                  <li key={node.id} role="none">
                    <Link
                      role="menuitem"
                      href={href}
                      className={cn(
                        "px-3 py-2 text-xs font-bold uppercase tracking-widest transition border-b-2 pb-1",
                        pathIsActive(pathname, href)
                          ? "text-cni-primary border-cni-gold"
                          : "text-cni-on-surface-variant border-transparent hover:text-cni-primary hover:border-cni-gold/40",
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={node.id} role="none" className="relative">
                  {/* Wrapper único: botón + panel comparten hover zone (sin gap muerto) */}
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdownId(node.id)}
                    onMouseLeave={closeMenus}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-widest transition border-b-2 pb-1",
                        isOpen || pathIsActive(pathname, href)
                          ? "text-cni-primary border-cni-gold"
                          : "text-cni-on-surface-variant border-transparent hover:text-cni-primary hover:border-cni-gold/40",
                      )}
                      onClick={() => {
                        setOpenDropdownId((cur) => (cur === node.id ? null : node.id));
                        setFlyoutOpenId(null);
                      }}
                    >
                      {label}
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition", isOpen && "rotate-180")}
                        aria-hidden
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute left-0 top-full z-50 pt-1">
                        <DesktopDropdownPanel
                          node={node}
                          locale={locale}
                          flyoutOpenId={flyoutOpenId}
                          setFlyoutOpenId={setFlyoutOpenId}
                          onClose={closeMenus}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="rounded-lg p-2 text-cni-primary lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div
            className="max-h-[min(80vh,calc(100dvh-7rem))] overflow-y-auto border-t border-cni-surface-low bg-white px-4 py-4 lg:hidden shadow-lg"
            aria-label={locale === "es" ? "Menú móvil" : "Mobile menu"}
          >
            <div className="mb-4 flex justify-end">
              <LanguageSwitch />
            </div>
            <Link
              href={homeHref}
              className="block py-2 text-sm font-bold uppercase tracking-wide text-cni-primary"
              onClick={() => setMobileOpen(false)}
            >
              {t.home}
            </Link>
            {siteNavigation.map((node) => (
              <div key={node.id} className="border-t border-cni-surface-low py-3">
                {node.children?.length ? (
                  <>
                    <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-cni-gold-dark">
                      {getNavLabel(node, locale)}
                    </p>
                    <Link
                      href={getNavHref(node, locale)}
                      className="block py-2 text-sm text-cni-on-surface-variant hover:text-cni-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {locale === "es" ? "Vista general" : "Overview"}
                    </Link>
                    {node.children.map((child) => (
                      <MobileNavBranch
                        key={child.id}
                        node={child}
                        locale={locale}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    ))}
                  </>
                ) : (
                  <Link
                    href={getNavHref(node, locale)}
                    className="block py-2 text-sm text-cni-on-surface-variant hover:text-cni-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {getNavLabel(node, locale)}
                  </Link>
                )}
              </div>
            ))}

            <div className="mt-2 border-t border-cni-surface-low py-3">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-cni-gold-dark">
                {locale === "es" ? "Enlaces rápidos" : "Quick links"}
              </p>
              {topBarNodes.map((n) => (
                <Link
                  key={n.id}
                  href={getNavHref(n, locale)}
                  className="block py-2 text-sm text-cni-on-surface-variant hover:text-cni-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {getNavLabel(n, locale)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
