"use client";

// The authenticated CMS chrome: sidebar + header + content area. It also guards
// access — while the session is loading it shows a spinner; if unauthenticated
// or expired it redirects to /cms/login. The backend re-validates every request
// regardless of what the shell renders.

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsSidebar } from "@/src/components/cms/CmsSidebar";
import { CmsHeader } from "@/src/components/cms/CmsHeader";
import { CmsLoadingState, CmsErrorState } from "@/src/components/cms/states";

export function CmsShell({ children }: { children: ReactNode }) {
  const { state, refresh } = useCmsAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (state.status === "unauthenticated") {
      router.replace("/cms/login");
    }
  }, [state.status, router]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fc]">
        <CmsLoadingState label="Verificando sesión…" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fc] p-6">
        <div className="w-full max-w-md">
          <CmsErrorState
            title="No se pudo verificar la sesión"
            description="Revise su conexión e intente de nuevo."
            onRetry={() => void refresh()}
          />
        </div>
      </div>
    );
  }

  if (state.status !== "authenticated") {
    // Redirecting to login — render nothing meaningful.
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fc]">
        <CmsLoadingState label="Redirigiendo…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fc] font-[var(--font-montserrat)] text-[#252A58]">
      <CmsSidebar
        user={state.user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <CmsHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
