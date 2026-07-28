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
import { mainNavLinkClass } from "@/src/components/layout/layoutBrand";

const dropdownItemClass =
  "block px-4 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-slate-50 hover:text-[#32B372]";

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
  const base = className ?? dropdownItemClass;

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
  const showOverview = !node.hideDropdownOverview;

  return (
    <div
      role="menu"
      className={cn(
        "overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(37,42,88,0.08)]",
        hasNestedFlyout ? "flex max-h-[min(70vh,520px)] max-w-[min(100vw-2rem,44rem)]" : "min-w-[17rem] py-1.5",
      )}
      onMouseLeave={() => setFlyoutOpenId(null)}
    >
      <ul className={cn("shrink-0 overflow-y-auto py-1.5", hasNestedFlyout ? "min-w-[17rem]" : "w-full")}>
        {showOverview ? (
          <li role="none">
            <Link
              role="menuitem"
              href={href}
              className="block border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-[#252A58] transition-colors hover:bg-slate-50 hover:text-[#32B372]"
              onClick={onClose}
            >
              {label}
            </Link>
          </li>
        ) : null}
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
                    ? "bg-slate-50 font-semibold text-[#252A58]"
                    : "text-[#64748B] hover:bg-slate-50 hover:text-[#32B372]",
                )}
                onMouseEnter={() => setFlyoutOpenId(child.id)}
                onFocus={() => setFlyoutOpenId(child.id)}
              >
                {getNavLabel(child, locale)}
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {flyoutNode && (
        <div className="min-w-[12rem] flex-1 overflow-y-auto border-l border-slate-100 py-1.5 md:min-w-[14rem]">
          <NavLinkItem
            node={flyoutNode}
            locale={locale}
            onNavigate={onClose}
            className="block px-4 py-2.5 text-sm font-semibold text-[#252A58] hover:bg-slate-50 hover:text-[#32B372]"
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
          className="block py-2.5 text-sm text-[#64748B] hover:text-[#32B372]"
          onClick={onNavigate}
        >
          {label}
          <span aria-hidden> ↗</span>
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="block py-2.5 text-sm text-[#64748B] hover:text-[#32B372]"
        onClick={onNavigate}
      >
        {label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-2.5 text-left text-sm font-medium text-[#334E88] hover:text-[#32B372]"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {getNavLabel(node, locale)}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="ml-3 border-l border-[#32B372]/25 pb-2 pl-3">
          <Link
            href={getNavHref(node, locale)}
            className="block py-2 text-sm text-[#64748B] hover:text-[#32B372]"
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
    <header ref={navRef} className="fixed inset-x-0 top-0 z-50 flex flex-col shadow-sm" role="banner">
      <div className="flex h-9 items-center justify-end gap-6 border-b border-white/10 bg-[#252A58] px-4 md:gap-8 md:px-10">
        <nav
          aria-label={locale === "es" ? "Enlaces rápidos" : "Quick links"}
          className="flex items-center gap-6 md:gap-8"
        >
          {topBarNodes.map((n) => (
            <Link
              key={n.id}
              href={getNavHref(n, locale)}
              className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/65 transition-colors hover:text-white"
            >
              {getNavLabel(n, locale)}
            </Link>
          ))}
        </nav>
        <LanguageSwitch />
      </div>

      <nav
        className="border-b border-slate-100 bg-white"
        aria-label={locale === "es" ? "Menú principal" : "Main menu"}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-6 px-4 py-1 md:px-10">
          <CniLogo
            href={homeHref}
            ariaLabel={t.brandSubtitle}
            priority
            variant="dark"
            imageClassName="al-navbar-logo"
          />

          <ul className="hidden items-center lg:flex" role="menubar">
            <li role="none">
              <Link
                role="menuitem"
                href={homeHref}
                className={mainNavLinkClass(pathIsActive(pathname, homeHref))}
              >
                {t.home}
              </Link>
            </li>

            {siteNavigation.map((node) => {
              const hasChildren = Boolean(node.children?.length);
              const isOpen = openDropdownId === node.id;
              const href = getNavHref(node, locale);
              const label = getNavLabel(node, locale);
              const isActive = pathIsActive(pathname, href);

              if (!hasChildren) {
                return (
                  <li key={node.id} role="none">
                    <Link role="menuitem" href={href} className={mainNavLinkClass(isActive)}>
                      {label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={node.id} role="none" className="relative">
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
                      className={mainNavLinkClass(isActive, isOpen)}
                      onClick={() => {
                        setOpenDropdownId((cur) => (cur === node.id ? null : node.id));
                        setFlyoutOpenId(null);
                      }}
                    >
                      {label}
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 opacity-70 transition-transform", isOpen && "rotate-180")}
                        aria-hidden
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute left-0 top-full z-50 pt-2">
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
            className="rounded-lg p-2 text-[#252A58] transition-colors hover:bg-slate-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div
            className="max-h-[min(80vh,calc(100dvh-7rem))] overflow-y-auto border-t border-slate-100 bg-white px-4 py-5 lg:hidden"
            aria-label={locale === "es" ? "Menú móvil" : "Mobile menu"}
          >
            <div className="mb-4 flex justify-end">
              <LanguageSwitch />
            </div>
            <Link
              href={homeHref}
              className={cn(
                "block py-3 text-sm font-semibold text-[#252A58]",
                pathIsActive(pathname, homeHref) && "text-[#32B372]",
              )}
              onClick={() => setMobileOpen(false)}
            >
              {t.home}
            </Link>
            {siteNavigation.map((node) => (
              <div key={node.id} className="border-t border-slate-100 py-4">
                {node.children?.length ? (
                  <>
                    <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-[#64748B]">
                      {getNavLabel(node, locale)}
                    </p>
                    {!node.hideDropdownOverview ? (
                      <Link
                        href={getNavHref(node, locale)}
                        className="block py-2 text-sm text-[#64748B] hover:text-[#32B372]"
                        onClick={() => setMobileOpen(false)}
                      >
                        {locale === "es" ? "Vista general" : "Overview"}
                      </Link>
                    ) : null}
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
                    className="block py-2 text-sm font-semibold text-[#334E88] hover:text-[#32B372]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {getNavLabel(node, locale)}
                  </Link>
                )}
              </div>
            ))}

            <div className="mt-2 border-t border-slate-100 py-4">
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-[#64748B]">
                {locale === "es" ? "Enlaces rápidos" : "Quick links"}
              </p>
              {topBarNodes.map((n) => (
                <Link
                  key={n.id}
                  href={getNavHref(n, locale)}
                  className="block py-2 text-sm text-[#64748B] hover:text-[#32B372]"
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
