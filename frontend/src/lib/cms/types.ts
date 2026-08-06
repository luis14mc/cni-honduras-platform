// Shared types for the editorial CMS (foundation).

export interface CmsUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_staff: boolean;
  groups: string[];
  permissions: string[];
}

export interface CmsCountSplit {
  total: number;
  published: number;
  draft: number;
}

export interface DashboardCounts {
  news: CmsCountSplit;
  documents: CmsCountSplit;
  banners: CmsCountSplit;
  success_stories: CmsCountSplit;
  sectors: { total: number; active: number };
  opportunities: { total: number; open: number };
}

export type ActivityType = "news" | "document" | "banner" | "success_story";

export interface ActivityItem {
  type: ActivityType;
  id: number;
  label: string;
  status: string | null;
  updated_at: string;
}

export interface DashboardPayload {
  counts: DashboardCounts;
  recent_activity: ActivityItem[];
  generated_at: string;
}

// Discriminated result for session-aware CMS requests.
export type CmsAuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: CmsUser }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

// How a failed request should be interpreted by the UI.
export type CmsFailureKind = "unauthorized" | "expired" | "error";
