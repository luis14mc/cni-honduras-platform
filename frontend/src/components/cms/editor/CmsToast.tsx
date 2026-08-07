"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface CmsToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const CmsToastContext = createContext<CmsToastContextValue | null>(null);

let toastId = 0;

export function CmsToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo<CmsToastContextValue>(
    () => ({
      toast: push,
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
      info: (message) => push(message, "info"),
    }),
    [push],
  );

  return (
    <CmsToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <CmsToast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </CmsToastContext.Provider>
  );
}

export function useCmsToast(): CmsToastContextValue {
  const ctx = useContext(CmsToastContext);
  if (!ctx) {
    throw new Error("useCmsToast debe usarse dentro de <CmsToastProvider>.");
  }
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-[#32B372]/30 bg-white text-[#252A58]",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-[#334E88]/20 bg-white text-[#252A58]",
};

function CmsToast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const Icon =
    toast.variant === "success" ? CheckCircle2 : toast.variant === "error" ? XCircle : Info;
  const iconClass =
    toast.variant === "success"
      ? "text-[#32B372]"
      : toast.variant === "error"
        ? "text-red-500"
        : "text-[#334E88]";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        VARIANT_STYLES[toast.variant],
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-0.5 opacity-60 transition hover:opacity-100"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export { CmsToast };
