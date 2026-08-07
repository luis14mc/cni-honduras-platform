"use client";

import { Loader2, Save, Send, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CmsSaveBarProps {
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  saving?: boolean;
  publishing?: boolean;
  canSave?: boolean;
  canPublish?: boolean;
  canDelete?: boolean;
  statusLabel?: string;
  className?: string;
}

export function CmsSaveBar({
  onSaveDraft,
  onPublish,
  onDelete,
  saving = false,
  publishing = false,
  canSave = true,
  canPublish = false,
  canDelete = false,
  statusLabel,
  className,
}: CmsSaveBarProps) {
  const busy = saving || publishing;

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#334E88]/10 bg-[#f5f7fc]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6",
        className,
      )}
    >
      <div className="text-sm text-[#252A58]/60">{statusLabel ?? null}</div>
      <div className="flex flex-wrap items-center gap-2">
        {canDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Eliminar
          </button>
        ) : null}
        {canSave && onSaveDraft ? (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-[#334E88]/30 bg-white px-4 py-2 text-sm font-semibold text-[#334E88] transition hover:bg-[#334E88]/5 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Guardar borrador
          </button>
        ) : null}
        {canPublish && onPublish ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a9962] disabled:opacity-50"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            Publicar
          </button>
        ) : null}
      </div>
    </div>
  );
}
