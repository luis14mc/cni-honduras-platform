"use client";

import type { ReactNode } from "react";
import { CmsStatusBadge } from "@/src/components/cms/editor/CmsStatusBadge";
import type { PublishStatus } from "@/src/lib/cms/editorial/types";
import { cn } from "@/src/lib/utils";

interface CmsEditorSidebarProps {
  status?: PublishStatus | string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  children?: ReactNode;
  className?: string;
}

export function CmsEditorSidebar({
  status,
  updatedAt,
  updatedBy,
  children,
  className,
}: CmsEditorSidebarProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-4 lg:sticky lg:top-4 lg:self-start",
        className,
      )}
    >
      {status ? (
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#252A58]/50">
            Estado
          </p>
          <CmsStatusBadge status={status} />
        </div>
      ) : null}
      {updatedAt ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#252A58]/50">
            Última edición
          </p>
          <p className="mt-1 text-sm text-[#252A58]">
            {new Date(updatedAt).toLocaleString("es-HN")}
          </p>
          {updatedBy ? (
            <p className="text-xs text-[#252A58]/50">por {updatedBy}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
