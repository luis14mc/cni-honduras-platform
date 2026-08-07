"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { useUnsavedChanges } from "@/src/lib/cms/useUnsavedChanges";
import { cn } from "@/src/lib/utils";

interface CmsEditorLayoutProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  actions?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
  dirty?: boolean;
}

export function CmsEditorLayout({
  title,
  description,
  backHref,
  backLabel = "Volver",
  actions,
  sidebar,
  children,
  className,
  dirty = false,
}: CmsEditorLayoutProps) {
  const { confirmLeave } = useUnsavedChanges(dirty);

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!confirmLeave()) {
      event.preventDefault();
      return;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Link
        href={backHref}
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#334E88] transition hover:text-[#252A58]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>

      <CmsSectionHeader title={title} description={description} actions={actions} />

      <div className={cn(sidebar ? "grid gap-6 lg:grid-cols-[1fr_280px]" : "")}>
        <div className="min-w-0 space-y-6">{children}</div>
        {sidebar ? <aside className="space-y-4">{sidebar}</aside> : null}
      </div>
    </div>
  );
}
