"use client";

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { CmsBreadcrumb } from "@/src/components/cms/CmsBreadcrumb";
import { CmsGlobalSearch } from "@/src/components/cms/CmsGlobalSearch";
import { CmsUserMenu } from "@/src/components/cms/CmsUserMenu";

interface CmsHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

export function CmsHeader({ collapsed, onToggleCollapse, onOpenMobile }: CmsHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#334E88]/10 bg-white/90 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-[#252A58] hover:bg-[#334E88]/8 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden rounded-lg p-2 text-[#252A58] hover:bg-[#334E88]/8 lg:inline-flex"
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden />
        )}
      </button>

      <div className="hidden sm:block">
        <CmsBreadcrumb pathname={pathname} />
      </div>

      <CmsGlobalSearch />

      <div className="ml-auto md:ml-0">
        <CmsUserMenu />
      </div>
    </header>
  );
}
