// Shared UX state components for the CMS: loading, skeleton, empty, error,
// unauthorized/session-expired. Kept in one small module — they are tiny and
// always used together.

import Link from "next/link";
import { AlertTriangle, Inbox, Loader2, Lock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function CmsLoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-[#334E88]"
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function CmsSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-[#334E88]/10", className)}
    />
  );
}

export function CmsEmptyState({
  title = "Sin registros",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#334E88]/25 bg-white/60 py-14 text-center">
      <Inbox className="h-9 w-9 text-[#334E88]/60" aria-hidden />
      <div>
        <p className="font-semibold text-[#252A58]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-[#252A58]/60">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CmsErrorState({
  title = "Ocurrió un error",
  description = "No pudimos cargar la información. Intente nuevamente.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-14 text-center"
    >
      <AlertTriangle className="h-9 w-9 text-red-500" aria-hidden />
      <div>
        <p className="font-semibold text-red-800">{title}</p>
        <p className="mt-1 text-sm text-red-700/80">{description}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

export function CmsUnauthorizedState({
  expired = false,
}: {
  expired?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#334E88]/20 bg-white py-16 text-center">
      <Lock className="h-9 w-9 text-[#334E88]" aria-hidden />
      <div>
        <p className="font-semibold text-[#252A58]">
          {expired ? "Su sesión expiró" : "Acceso no autorizado"}
        </p>
        <p className="mt-1 text-sm text-[#252A58]/60">
          {expired
            ? "Por seguridad, vuelva a iniciar sesión para continuar."
            : "No tiene permisos para ver este contenido."}
        </p>
      </div>
      <Link
        href="/cms/login"
        className="rounded-lg bg-[#334E88] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#252A58]"
      >
        Ir al inicio de sesión
      </Link>
    </div>
  );
}
