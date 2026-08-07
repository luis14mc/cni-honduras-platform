"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CmsConfirmDialog } from "@/src/components/cms/editor/CmsConfirmDialog";
import { CmsEditorLayout } from "@/src/components/cms/editor/CmsEditorLayout";
import { CmsEditorSidebar } from "@/src/components/cms/editor/CmsEditorSidebar";
import { cmsInputClass, CmsFormField } from "@/src/components/cms/editor/CmsFormField";
import { CmsSaveBar } from "@/src/components/cms/editor/CmsSaveBar";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsLoadingState, CmsErrorState, CmsUnauthorizedState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import { listGroups } from "@/src/lib/cms/editorial/groups";
import {
  activateUser,
  createUser,
  deactivateUser,
  deleteUser,
  getUser,
  setUserPassword,
  updateUser,
} from "@/src/lib/cms/editorial/users";
import type { CmsGroup, CmsStaffUser } from "@/src/lib/cms/editorial/types";
import { canManageUsers } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

interface UserFormState {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  group_ids: number[];
}

const emptyForm = (): UserFormState => ({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  password_confirm: "",
  is_active: true,
  is_staff: true,
  is_superuser: false,
  group_ids: [],
});

function userToForm(item: CmsStaffUser, groups: CmsGroup[]): UserFormState {
  const groupIds = groups
    .filter((g) => item.groups.includes(g.name))
    .map((g) => g.id);
  return {
    username: item.username,
    email: item.email ?? "",
    first_name: item.first_name ?? "",
    last_name: item.last_name ?? "",
    password: "",
    password_confirm: "",
    is_active: item.is_active,
    is_staff: item.is_staff,
    is_superuser: item.is_superuser,
    group_ids: groupIds,
  };
}

interface UserEditorViewProps {
  userId?: number;
}

export function UserEditorView({ userId }: UserEditorViewProps) {
  const router = useRouter();
  const { user: currentUser } = useCmsAuth();
  const toast = useCmsToast();
  const isNew = userId === undefined;

  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [groups, setGroups] = useState<CmsGroup[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listGroups()
      .then((data) => setGroups(data.results))
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (isNew || groups.length === 0) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const item = await getUser(userId);
        if (!cancelled) setForm(userToForm(item, groups));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, userId, groups]);

  const patch = useCallback((partial: Partial<UserFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleGroup = (groupId: number) => {
    setForm((prev) => ({
      ...prev,
      group_ids: prev.group_ids.includes(groupId)
        ? prev.group_ids.filter((id) => id !== groupId)
        : [...prev.group_ids, groupId],
    }));
  };

  const handleSave = async () => {
    if (isNew) {
      if (!form.username.trim()) {
        toast.error("El nombre de usuario es obligatorio.");
        return;
      }
      if (!form.password || form.password !== form.password_confirm) {
        toast.error("Las contraseñas no coinciden.");
        return;
      }
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await createUser({
          username: form.username,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          password: form.password,
          password_confirm: form.password_confirm,
          is_active: form.is_active,
          is_staff: form.is_staff,
          group_ids: form.group_ids,
        });
        toast.success("Usuario creado.");
        router.replace(`/cms/usuarios/${created.id}`);
      } else {
        await updateUser(userId!, {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          is_active: form.is_active,
          is_staff: form.is_staff,
          is_superuser: form.is_superuser,
          group_ids: form.group_ids,
        });
        toast.success("Usuario actualizado.");
        setForm(userToForm(await getUser(userId!), groups));
      }
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPassword = async () => {
    if (!userId) return;
    if (!newPassword || newPassword !== newPasswordConfirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setSettingPassword(true);
    try {
      await setUserPassword(userId, newPassword, newPasswordConfirm);
      toast.success("Contraseña actualizada.");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSettingPassword(false);
    }
  };

  const handleToggleActive = async () => {
    if (!userId) return;
    setTogglingActive(true);
    try {
      const updated = form.is_active
        ? await deactivateUser(userId)
        : await activateUser(userId);
      setForm(userToForm(updated, groups));
      toast.success(form.is_active ? "Usuario desactivado." : "Usuario activado.");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo cambiar el estado.");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await deleteUser(userId);
      toast.success("Usuario eliminado.");
      router.push("/cms/usuarios");
    } catch (err) {
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!canManageUsers(currentUser)) {
    return <CmsUnauthorizedState />;
  }

  if (loading) return <CmsLoadingState label="Cargando usuario…" />;
  if (loadError) return <CmsErrorState onRetry={() => router.refresh()} />;

  return (
    <>
      <CmsEditorLayout
        title={isNew ? "Nuevo usuario" : "Editar usuario"}
        description={isNew ? "Cree una cuenta para el equipo del CMS." : form.username}
        backHref="/cms/usuarios"
        sidebar={
          <CmsEditorSidebar>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#252A58]/50">
                Estado
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  form.is_active
                    ? "bg-[#32B372]/15 text-[#1a7a4a]"
                    : "bg-[#252A58]/10 text-[#252A58]/70",
                )}
              >
                {form.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>

            {!isNew ? (
              <button
                type="button"
                onClick={() => void handleToggleActive()}
                disabled={togglingActive || saving}
                className="w-full rounded-lg border border-[#334E88]/30 px-3 py-2 text-sm font-semibold text-[#334E88] transition hover:bg-[#334E88]/5 disabled:opacity-50"
              >
                {form.is_active ? "Desactivar usuario" : "Activar usuario"}
              </button>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#252A58]/50">
                Roles (grupos)
              </p>
              <div className="space-y-2">
                {groups.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-2 text-sm text-[#252A58]"
                  >
                    <input
                      type="checkbox"
                      checked={form.group_ids.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="rounded border-[#334E88]/30"
                    />
                    {group.name}
                  </label>
                ))}
              </div>
            </div>

            {currentUser?.is_superuser && !isNew ? (
              <label className="flex items-center gap-2 text-sm text-[#252A58]">
                <input
                  type="checkbox"
                  checked={form.is_superuser}
                  onChange={(e) => patch({ is_superuser: e.target.checked })}
                  className="rounded border-[#334E88]/30"
                />
                Superusuario
              </label>
            ) : null}
          </CmsEditorSidebar>
        }
      >
        <div className="space-y-4 rounded-xl border border-[#334E88]/10 bg-white p-5">
          <CmsFormField label="Usuario" required htmlFor="user-username">
            <input
              id="user-username"
              value={form.username}
              onChange={(e) => patch({ username: e.target.value })}
              className={cmsInputClass}
              disabled={!isNew}
            />
          </CmsFormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <CmsFormField label="Nombre" htmlFor="user-first-name">
              <input
                id="user-first-name"
                value={form.first_name}
                onChange={(e) => patch({ first_name: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
            <CmsFormField label="Apellido" htmlFor="user-last-name">
              <input
                id="user-last-name"
                value={form.last_name}
                onChange={(e) => patch({ last_name: e.target.value })}
                className={cmsInputClass}
              />
            </CmsFormField>
          </div>

          <CmsFormField label="Correo electrónico" htmlFor="user-email">
            <input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
              className={cmsInputClass}
            />
          </CmsFormField>

          {isNew ? (
            <>
              <CmsFormField label="Contraseña" required htmlFor="user-password">
                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => patch({ password: e.target.value })}
                  className={cmsInputClass}
                  autoComplete="new-password"
                />
              </CmsFormField>
              <CmsFormField label="Confirmar contraseña" required htmlFor="user-password-confirm">
                <input
                  id="user-password-confirm"
                  type="password"
                  value={form.password_confirm}
                  onChange={(e) => patch({ password_confirm: e.target.value })}
                  className={cmsInputClass}
                  autoComplete="new-password"
                />
              </CmsFormField>
            </>
          ) : (
            <div className="space-y-3 rounded-lg border border-[#334E88]/10 bg-[#f5f7fc] p-4">
              <p className="text-sm font-semibold text-[#252A58]">Cambiar contraseña</p>
              <CmsFormField label="Nueva contraseña" htmlFor="user-new-password">
                <input
                  id="user-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cmsInputClass}
                  autoComplete="new-password"
                />
              </CmsFormField>
              <CmsFormField label="Confirmar contraseña" htmlFor="user-new-password-confirm">
                <input
                  id="user-new-password-confirm"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className={cmsInputClass}
                  autoComplete="new-password"
                />
              </CmsFormField>
              <button
                type="button"
                onClick={() => void handleSetPassword()}
                disabled={settingPassword || !newPassword}
                className="rounded-lg bg-[#334E88] px-4 py-2 text-sm font-semibold text-white hover:bg-[#252A58] disabled:opacity-50"
              >
                {settingPassword ? "Guardando…" : "Actualizar contraseña"}
              </button>
            </div>
          )}
        </div>

        <CmsSaveBar
          onSaveDraft={() => void handleSave()}
          onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
          saving={saving}
          canSave
          canDelete={!isNew}
          statusLabel="Guarde los cambios del perfil y los roles asignados."
        />
      </CmsEditorLayout>

      <CmsConfirmDialog
        open={confirmDelete}
        title="Eliminar usuario"
        description="¿Confirma que desea eliminar esta cuenta? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
