"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState, CmsUnauthorizedState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import {
  getPermissionCatalog,
  listGroups,
  updateGroupPermissions,
} from "@/src/lib/cms/editorial/groups";
import type { CmsGroup, PermissionCatalogModel } from "@/src/lib/cms/editorial/types";
import { canManageGroups } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

const ACTIONS = ["view", "add", "change", "delete", "publish"] as const;
type MatrixAction = (typeof ACTIONS)[number];

const ACTION_LABELS: Record<MatrixAction, string> = {
  view: "Ver",
  add: "Crear",
  change: "Editar",
  delete: "Eliminar",
  publish: "Publicar",
};

export function RolesMatrixView() {
  const { user } = useCmsAuth();
  const toast = useCmsToast();

  const [groups, setGroups] = useState<CmsGroup[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalogModel[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyGroupSelection = useCallback((groupId: number, groupList: CmsGroup[]) => {
    setSelectedGroupId(groupId);
    const group = groupList.find((g) => g.id === groupId);
    setSelectedIds(new Set(group?.permissions.map((p) => p.id) ?? []));
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [groupsData, catalogData] = await Promise.all([listGroups(), getPermissionCatalog()]);
      setGroups(groupsData.results);
      setCatalog(catalogData.models);
      if (groupsData.results.length > 0) {
        applyGroupSelection(groupsData.results[0].id, groupsData.results);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [applyGroupSelection]);

  useEffect(() => {
    if (!canManageGroups(user)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInitial();
  }, [loadInitial, user]);

  const permissionLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const model of catalog) {
      for (const perm of model.permissions) {
        map.set(`${model.app_label}.${model.model}.${perm.action}`, perm.id);
      }
      if (model.publish_permission) {
        map.set(`${model.app_label}.${model.model}.publish`, model.publish_permission.id);
      }
    }
    return map;
  }, [catalog]);

  const togglePermission = (model: PermissionCatalogModel, action: MatrixAction) => {
    const key = `${model.app_label}.${model.model}.${action}`;
    const permId = permissionLookup.get(key);
    if (!permId) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const isChecked = (model: PermissionCatalogModel, action: MatrixAction): boolean => {
    const permId = permissionLookup.get(`${model.app_label}.${model.model}.${action}`);
    return permId ? selectedIds.has(permId) : false;
  };

  const isAvailable = (model: PermissionCatalogModel, action: MatrixAction): boolean => {
    if (action === "publish") return Boolean(model.publish_permission);
    return model.permissions.some((p) => p.action === action);
  };

  const handleSave = async () => {
    if (!selectedGroupId) return;
    setSaving(true);
    try {
      const updated = await updateGroupPermissions(selectedGroupId, Array.from(selectedIds));
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setSelectedIds(new Set(updated.permissions.map((p) => p.id)));
      toast.success("Permisos guardados.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudieron guardar los permisos.");
    } finally {
      setSaving(false);
    }
  };

  if (!canManageGroups(user)) {
    return <CmsUnauthorizedState />;
  }

  if (loading) return <CmsLoadingState label="Cargando roles y permisos…" />;
  if (loadError) return <CmsErrorState onRetry={() => void loadInitial()} />;

  return (
    <>
      <CmsSectionHeader
        title="Roles y permisos"
        description="Asigne permisos de contenido por grupo de usuarios."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGroupId ?? ""}
              onChange={(e) => applyGroupSelection(Number(e.target.value), groups)}
              className="rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.user_count})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !selectedGroupId}
              className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Guardar permisos
            </button>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-[#334E88]/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#334E88]/10 bg-[#f5f7fc]">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#252A58]/60">
                Módulo
              </th>
              {ACTIONS.map((action) => (
                <th
                  key={action}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#252A58]/60"
                >
                  {ACTION_LABELS[action]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {catalog.map((model) => (
              <tr key={`${model.app_label}.${model.model}`} className="border-b border-[#334E88]/5">
                <td className="px-4 py-3 font-medium text-[#252A58]">{model.label}</td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-4 py-3 text-center">
                    {isAvailable(model, action) ? (
                      <input
                        type="checkbox"
                        checked={isChecked(model, action)}
                        onChange={() => togglePermission(model, action)}
                        aria-label={`${ACTION_LABELS[action]} — ${model.label}`}
                        className={cn(
                          "h-4 w-4 rounded border-[#334E88]/30 text-[#334E88]",
                          "focus:ring-[#334E88]/20",
                        )}
                      />
                    ) : (
                      <span className="text-[#252A58]/20">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
