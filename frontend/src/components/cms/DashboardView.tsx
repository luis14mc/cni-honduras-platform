"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  activityEditorHref,
  buildStatCards,
  describeActivity,
  fetchDashboard,
  relativeTime,
} from "@/src/lib/cms/dashboard";
import { displayName } from "@/src/lib/cms/session";
import type { DashboardPayload } from "@/src/lib/cms/types";
import { CmsStatCard } from "@/src/components/cms/CmsStatCard";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import {
  CmsEmptyState,
  CmsErrorState,
  CmsSkeleton,
  CmsUnauthorizedState,
} from "@/src/components/cms/states";
import { cmsIcon } from "@/src/components/cms/icons";

const QUICK_ACTIONS = [
  { label: "Nueva noticia", href: "/cms/noticias/nueva", icon: "Newspaper" },
  { label: "Nuevo documento", href: "/cms/documentos/nuevo", icon: "FileText" },
  { label: "Nuevo banner", href: "/cms/banners/nuevo", icon: "Megaphone" },
  { label: "Caso de éxito", href: "/cms/casos-exito/nuevo", icon: "Trophy" },
];

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: DashboardPayload }
  | { status: "unauthorized"; expired: boolean }
  | { status: "error" };

export function DashboardView() {
  const { user } = useCmsAuth();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });

  const run = useCallback(async () => {
    setLoad({ status: "loading" });
    try {
      const data = await fetchDashboard();
      setLoad({ status: "ready", data });
    } catch (error) {
      if (error instanceof CmsApiError && (error.status === 401 || error.status === 403)) {
        setLoad({ status: "unauthorized", expired: error.status === 401 });
      } else {
        setLoad({ status: "error" });
      }
    }
  }, []);

  useEffect(() => {
    // Load dashboard data on mount; ``run`` updates state after the fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
  }, [run]);

  const greeting = user ? `Hola, ${displayName(user)}` : "Panel";

  return (
    <>
      <CmsSectionHeader
        title="Dashboard"
        description={`${greeting} — resumen editorial del CNI.`}
      />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = cmsIcon(action.icon);
          return (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-lg border border-[#334E88]/15 bg-white px-3 py-2 text-sm font-medium text-[#334E88] transition hover:border-[#334E88]/40 hover:bg-[#334E88]/5"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <Icon className="h-4 w-4" aria-hidden />
              {action.label}
            </Link>
          );
        })}
      </div>

      {load.status === "loading" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CmsSkeleton key={i} className="h-28" />
          ))}
        </div>
      ) : null}

      {load.status === "error" ? <CmsErrorState onRetry={() => void run()} /> : null}

      {load.status === "unauthorized" ? (
        <CmsUnauthorizedState expired={load.expired} />
      ) : null}

      {load.status === "ready" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {buildStatCards(load.data).map((card) => (
              <CmsStatCard
                key={card.key}
                label={card.label}
                value={card.value}
                icon={card.icon}
                href={card.href}
                hint={card.hint}
                accent={card.accent}
              />
            ))}
          </div>

          <section className="rounded-xl border border-[#334E88]/10 bg-white p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#252A58]/60">
              Actividad reciente
            </h2>
            {load.data.recent_activity.length === 0 ? (
              <CmsEmptyState
                title="Sin actividad reciente"
                description="Cuando se edite o publique contenido aparecerá aquí."
              />
            ) : (
              <ul className="divide-y divide-[#334E88]/8">
                {load.data.recent_activity.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href={activityEditorHref(item.type, item.id)}
                      className="flex items-center justify-between gap-3 py-3 transition hover:bg-[#334E88]/5 -mx-2 px-2 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#252A58]">{item.label}</p>
                        <p className="text-xs text-[#252A58]/50">{describeActivity(item)}</p>
                      </div>
                      <time
                        dateTime={item.updated_at}
                        className="shrink-0 text-xs text-[#252A58]/40"
                      >
                        {relativeTime(item.updated_at)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
