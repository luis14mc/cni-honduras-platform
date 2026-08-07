"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { visibleNav } from "@/src/lib/cms/nav";
import { cmsIcon } from "@/src/components/cms/icons";
import type { CmsUser } from "@/src/lib/cms/types";

interface CmsSidebarProps {
  user: CmsUser;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function CmsSidebar({ user, collapsed, mobileOpen, onCloseMobile }: CmsSidebarProps) {
  const pathname = usePathname();
  const groups = visibleNav(user);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#252A58]/50 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#252A58] text-white transition-all duration-200",
          "lg:static lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Navegación del CMS"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-4">
          <Link href="/cms" className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#32B372] text-sm font-black">
              CNI
            </span>
            {!collapsed ? (
              <span className="truncate text-sm font-semibold tracking-wide">CMS Editorial</span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded p-1 hover:bg-white/10 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.key}>
              {group.label && !collapsed ? (
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  {group.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = cmsIcon(item.icon);
                  const active =
                    item.href === "/cms"
                      ? pathname === "/cms"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                          active
                            ? "bg-[#334E88] text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white",
                          collapsed && "justify-center",
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                        {!collapsed && item.ready === false ? (
                          <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                            pronto
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
