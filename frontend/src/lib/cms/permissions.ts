import type { CmsUser } from "@/src/lib/cms/types";

/** Whether the user holds a specific Django permission codename (app.codename). */
export function hasPermission(user: CmsUser | null | undefined, perm: string): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.permissions.includes(perm);
}

/** Whether the user may publish, unpublish, or archive editorial content. */
export function canPublish(user: CmsUser | null | undefined): boolean {
  return hasPermission(user, "cms.can_publish");
}

export function canAdd(
  user: CmsUser | null | undefined,
  appLabel: string,
  modelName: string,
): boolean {
  return hasPermission(user, `${appLabel}.add_${modelName}`);
}

export function canChange(
  user: CmsUser | null | undefined,
  appLabel: string,
  modelName: string,
): boolean {
  return hasPermission(user, `${appLabel}.change_${modelName}`);
}

export function canDelete(
  user: CmsUser | null | undefined,
  appLabel: string,
  modelName: string,
): boolean {
  return hasPermission(user, `${appLabel}.delete_${modelName}`);
}

export function canView(
  user: CmsUser | null | undefined,
  appLabel: string,
  modelName: string,
): boolean {
  return hasPermission(user, `${appLabel}.view_${modelName}`);
}

export function canManageUsers(user: CmsUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return hasPermission(user, "auth.change_user");
}

export function canManageGroups(user: CmsUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return hasPermission(user, "auth.change_group");
}
