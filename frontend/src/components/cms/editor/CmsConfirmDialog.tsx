"use client";

import { keepDialogFocus, useDialogFocus } from "@/src/lib/dialogFocus";
import { useEffect, useId, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CmsConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CmsConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: CmsConfirmDialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useDialogFocus(open, panel);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#252A58]/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        onKeyDown={keepDialogFocus}
        aria-labelledby={id + "-title"}
        aria-describedby={description ? id + "-desc" : undefined}
        className="w-full max-w-md rounded-xl border border-[#334E88]/15 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={id + "-title"} className="text-lg font-bold text-[#252A58]">
          {title}
        </h2>
        {description ? (
          <p id={id + "-desc"} className="mt-2 text-sm text-[#252A58]/70">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-[#334E88]/20 px-4 py-2 text-sm font-semibold text-[#334E88] hover:bg-[#334E88]/5 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#334E88] hover:bg-[#252A58]",
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
