// Pure helpers for the dashboard view (unit-tested).

import { cmsGet } from "@/src/lib/cms/api";
import type { ActivityItem, ActivityType, DashboardPayload } from "@/src/lib/cms/types";

export async function fetchDashboard(): Promise<DashboardPayload> {
  return cmsGet<DashboardPayload>("/dashboard/");
}

export interface StatCardModel {
  key: string;
  label: string;
  value: number;
  icon: string;
  href: string;
  hint?: string;
  accent: "blue" | "green" | "navy";
}

// Map the API payload to the dashboard stat cards. Pure — unit tested.
export function buildStatCards(payload: DashboardPayload): StatCardModel[] {
  const c = payload.counts;
  return [
    {
      key: "news",
      label: "Noticias",
      value: c.news.total,
      icon: "Newspaper",
      href: "/cms/noticias",
      hint: `${c.news.published} publicadas · ${c.news.draft} borradores`,
      accent: "blue",
    },
    {
      key: "documents",
      label: "Documentos",
      value: c.documents.total,
      icon: "FileText",
      href: "/cms/documentos",
      hint: `${c.documents.published} publicados · ${c.documents.draft} borradores`,
      accent: "navy",
    },
    {
      key: "banners",
      label: "Banners activos",
      value: c.banners.published,
      icon: "Megaphone",
      href: "/cms/banners",
      hint: `${c.banners.total} en total`,
      accent: "green",
    },
    {
      key: "success",
      label: "Casos de éxito",
      value: c.success_stories.total,
      icon: "Trophy",
      href: "/cms/casos-exito",
      hint: `${c.success_stories.published} publicados`,
      accent: "blue",
    },
    {
      key: "sectors",
      label: "Sectores",
      value: c.sectors.total,
      icon: "Layers",
      href: "/cms/sectores",
      hint: `${c.sectors.active} activos`,
      accent: "navy",
    },
    {
      key: "opportunities",
      label: "Oportunidades",
      value: c.opportunities.total,
      icon: "TrendingUp",
      href: "/cms/oportunidades",
      hint: `${c.opportunities.open} abiertas`,
      accent: "green",
    },
  ];
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  news: "Noticia",
  document: "Documento",
  banner: "Banner",
  success_story: "Caso de éxito",
};

const STATUS_LABELS: Record<string, string> = {
  published: "publicado",
  draft: "borrador",
  archived: "archivado",
};

/** Editor route for a dashboard activity row. Pure — unit tested. */
export function activityEditorHref(type: ActivityType, id: number): string {
  switch (type) {
    case "news":
      return `/cms/noticias/${id}`;
    case "document":
      return `/cms/documentos/${id}`;
    case "banner":
      return `/cms/banners/${id}`;
    case "success_story":
      return `/cms/casos-exito/${id}`;
    default:
      return "/cms";
  }
}

// Human summary for an activity row. Pure — unit tested.
export function describeActivity(item: ActivityItem): string {
  const kind = ACTIVITY_LABELS[item.type] ?? "Contenido";
  const status = item.status ? STATUS_LABELS[item.status] ?? item.status : null;
  return status ? `${kind} · ${status}` : kind;
}

// Relative "hace X" formatting from an ISO timestamp. Pure — unit tested.
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  if (Number.isNaN(then)) return "";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? "es" : ""}`;
  const years = Math.floor(months / 12);
  return `hace ${years} año${years > 1 ? "s" : ""}`;
}
