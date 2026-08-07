"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Shield } from "lucide-react";
import { CmsDataTable } from "@/src/components/cms/editor/CmsDataTable";
import type { CmsColumn } from "@/src/components/cms/editor/CmsDataTable";
import { CmsFilterBar } from "@/src/components/cms/editor/CmsFilterBar";
import { CmsPagination } from "@/src/components/cms/editor/CmsPagination";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import { CmsErrorState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { listUsers } from "@/src/lib/cms/editorial/users";
import type { CmsStaffUser } from "@/src/lib/cms/editorial/types";
import { canManageUsers } from "@/src/lib/cms/permissions";
import { cn } from "@/src/lib/utils";

const PAGE_SIZE = 20;

export function UsersListView() {
  const router = useRouter();
  const { user } = useCmsAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CmsStaffUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await listUsers({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (!canManageUsers(user)) {
    return (
      <CmsErrorState
        title="Acceso restringido"
        description="No tiene permisos para administrar usuarios del CMS."
      />
    );
  }

  const columns: CmsColumn<CmsStaffUser>[] = [
    {
      key: "username",
      header: "Usuario",
      render: (row) => (
        <span className="inline-flex items-center gap-2 font-medium">
          {row.username}
          {row.is_superuser ? (
            <Shield className="h-3.5 w-3.5 text-[#334E88]" aria-label="Superusuario" />
          ) : null}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      render: (row) => `${row.first_name} ${row.last_name}`.trim() || "—",
    },
    {
      key: "email",
      header: "Correo",
      render: (row) => row.email || "—",
    },
    {
      key: "groups",
      header: "Roles",
      render: (row) => row.groups.join(", ") || "—",
    },
    {
      key: "active",
      header: "Estado",
      render: (row) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            row.is_active
              ? "bg-[#32B372]/15 text-[#1a7a4a]"
              : "bg-[#252A58]/10 text-[#252A58]/70",
          )}
        >
          {row.is_active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <>
      <CmsSectionHeader
        title="Usuarios"
        description="Administración de cuentas del personal del CMS."
        actions={
          <Link
            href="/cms/usuarios/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-[#32B372] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a9962]"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Link>
        }
      />

      <CmsFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Buscar usuarios…"
      />

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        onRowClick={(row) => router.push(`/cms/usuarios/${row.id}`)}
        emptyTitle="Sin usuarios"
        emptyDescription="Cree cuentas para el equipo editorial del CNI."
      />

      <CmsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}
