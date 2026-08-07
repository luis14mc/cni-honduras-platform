"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  CmsEmptyState,
  CmsErrorState,
  CmsSkeleton,
} from "@/src/components/cms/states";
import { cn } from "@/src/lib/utils";

export interface CmsColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface CmsDataTableProps<T> {
  columns: CmsColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function CmsDataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  error = false,
  onRetry,
  emptyTitle = "Sin registros",
  emptyDescription,
  emptyAction,
  onRowClick,
  className,
}: CmsDataTableProps<T>) {
  if (error) {
    return <CmsErrorState onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <CmsSkeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <CmsEmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-[#334E88]/10 bg-white", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#334E88]/10 bg-[#f5f7fc]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#252A58]/60",
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#334E88]/8">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "transition",
                onRowClick && "cursor-pointer hover:bg-[#334E88]/5",
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-[#252A58]", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {loading ? (
        <div className="flex justify-center py-4 text-[#334E88]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
