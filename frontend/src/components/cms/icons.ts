// Curated lucide-react icon map for the CMS nav, so icon names in nav.ts stay
// data (strings) without pulling the whole icon set into the bundle.

import {
  FileText,
  Images,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Newspaper,
  Settings,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export const CMS_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Newspaper,
  FileText,
  Megaphone,
  Trophy,
  Layers,
  TrendingUp,
  Images,
  LayoutTemplate,
  Users,
  Shield,
  Settings,
};

export function cmsIcon(name: string): LucideIcon {
  return CMS_ICONS[name] ?? LayoutDashboard;
}
