// CMS sidebar navigation model.
//
// Visibility can be gated by a Django permission (e.g. "cms.add_news") or by a
// superuser-only flag. The backend remains the authority — this only decides
// what to *show*; every write is re-checked server-side.

import type { CmsUser } from "@/src/lib/cms/types";

export interface CmsNavItem {
  key: string;
  label: string;
  href: string;
  icon: string; // lucide-react icon name
  /** Any of these Django permissions grants visibility. Empty = all staff. */
  anyPerm?: string[];
  /** Only superusers see this item. */
  superuserOnly?: boolean;
  ready?: boolean; // false => placeholder module
}

export interface CmsNavGroup {
  key: string;
  label: string | null;
  items: CmsNavItem[];
}

export const CMS_NAV: CmsNavGroup[] = [
  {
    key: "overview",
    label: null,
    items: [
      { key: "dashboard", label: "Dashboard", href: "/cms", icon: "LayoutDashboard", ready: true },
    ],
  },
  {
    key: "content",
    label: "Contenido",
    items: [
      { key: "news", label: "Noticias", href: "/cms/noticias", icon: "Newspaper", anyPerm: ["cms.view_news", "cms.add_news"], ready: true },
      { key: "documents", label: "Documentos", href: "/cms/documentos", icon: "FileText", anyPerm: ["cms.view_document", "cms.add_document"], ready: true },
      { key: "banners", label: "Banners", href: "/cms/banners", icon: "Megaphone", anyPerm: ["cms.view_sitebanner", "cms.add_sitebanner"], ready: true },
      { key: "success", label: "Casos de éxito", href: "/cms/casos-exito", icon: "Trophy", anyPerm: ["investment.view_successstory", "investment.add_successstory"], ready: true },
    ],
  },
  {
    key: "investment",
    label: "Inversión",
    items: [
      { key: "sectors", label: "Sectores", href: "/cms/sectores", icon: "Layers", anyPerm: ["investment.view_sector", "investment.add_sector"], ready: true },
      { key: "opportunities", label: "Oportunidades", href: "/cms/oportunidades", icon: "TrendingUp", anyPerm: ["investment.view_investmentopportunity", "investment.add_investmentopportunity"], ready: true },
    ],
  },
  {
    key: "library",
    label: "Biblioteca",
    items: [
      { key: "media", label: "Multimedia", href: "/cms/multimedia", icon: "Images", anyPerm: ["media_library.view_mediaasset", "media_library.add_mediaasset"], ready: true },
    ],
  },
  {
    key: "site",
    label: "Sitio",
    items: [
      { key: "pages", label: "Páginas", href: "/cms/paginas", icon: "LayoutTemplate", anyPerm: ["cms.view_page", "cms.add_page"], ready: true },
    ],
  },
  {
    key: "admin",
    label: "Administración",
    items: [
      { key: "users", label: "Usuarios", href: "/cms/usuarios", icon: "Users", superuserOnly: true, ready: true },
      { key: "roles", label: "Roles y permisos", href: "/cms/usuarios/roles", icon: "Shield", superuserOnly: true, ready: true },
      { key: "settings", label: "Configuración", href: "/cms/configuracion", icon: "Settings", superuserOnly: true, ready: true },
    ],
  },
];

// Whether a user may see a nav item. Pure — unit tested.
export function canSeeNavItem(user: CmsUser, item: CmsNavItem): boolean {
  if (user.is_superuser) return true;
  if (item.superuserOnly) return false;
  if (!item.anyPerm || item.anyPerm.length === 0) return true;
  return item.anyPerm.some((perm) => user.permissions.includes(perm));
}

// Filter the nav tree for a user, dropping empty groups. Pure — unit tested.
export function visibleNav(user: CmsUser): CmsNavGroup[] {
  return CMS_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSeeNavItem(user, item)),
  })).filter((group) => group.items.length > 0);
}

// Flatten all items for breadcrumb/label lookup.
export function findNavItem(href: string): CmsNavItem | null {
  for (const group of CMS_NAV) {
    for (const item of group.items) {
      if (item.href === href) return item;
    }
  }
  return null;
}

const ACTION_LABELS: Record<string, string> = {
  nueva: "Nueva",
  nuevo: "Nuevo",
  roles: "Roles y permisos",
};

/** Resolve nav section + optional action label for nested CMS routes. */
export function resolveNavForPath(pathname: string): {
  section: CmsNavItem | null;
  actionLabel: string | null;
} {
  const normalized = pathname.replace(/\/$/, "") || "/cms";
  let section: CmsNavItem | null = null;

  for (const group of CMS_NAV) {
    for (const item of group.items) {
      if (normalized === item.href || normalized.startsWith(`${item.href}/`)) {
        if (!section || item.href.length > section.href.length) {
          section = item;
        }
      }
    }
  }

  if (!section || section.href === "/cms") {
    return { section: null, actionLabel: null };
  }

  const suffix = normalized.slice(section.href.length).replace(/^\//, "");
  if (!suffix) return { section, actionLabel: null };
  if (/^\d+$/.test(suffix)) return { section, actionLabel: "Editar" };
  const segment = suffix.split("/")[0];
  return { section, actionLabel: ACTION_LABELS[segment] ?? segment };
}
