"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CmsDataTable } from "@/src/components/cms/editor/CmsDataTable";
import type { CmsColumn } from "@/src/components/cms/editor/CmsDataTable";
import { CmsFilterBar } from "@/src/components/cms/editor/CmsFilterBar";
import { CmsLeadStatusBadge } from "@/src/components/cms/editor/CmsLeadStatusBadge";
import { CmsPagination } from "@/src/components/cms/editor/CmsPagination";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";
import {
  INVESTMENT_RANGE_LABELS,
  listAssignableStaff,
  listPostulaciones,
  type ProjectApplicationListItem,
  type ProjectApplicationStatus,
} from "@/src/lib/cms/editorial/postulaciones";
import { listSectors } from "@/src/lib/cms/editorial/sectors";
import type { SectorItem } from "@/src/lib/cms/editorial/types";
import { API_BASE_URL } from "@/src/lib/api";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: "" | ProjectApplicationStatus; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "new", label: "Nuevo" },
  { value: "reviewing", label: "En revisión" },
  { value: "contacted", label: "Contactado" },
  { value: "qualified", label: "Calificado" },
  { value: "rejected", label: "Rechazado" },
  { value: "converted", label: "Convertido" },
];

const INVESTMENT_OPTIONS = [
  { value: "", label: "Toda inversión" },
  ...Object.entries(INVESTMENT_RANGE_LABELS).map(([value, label]) => ({ value, label })),
];

type DepartmentOption = { slug: string; name: string };

export function PostulacionesListView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"" | ProjectApplicationStatus>("");
  const [sector, setSector] = useState("");
  const [department, setDepartment] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [assignees, setAssignees] = useState<{ id: number; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ProjectApplicationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    listSectors({ page_size: 200 })
      .then((data) => setSectors(data.results))
      .catch(() => setSectors([]));
    listAssignableStaff()
      .then((data) => setAssignees(data))
      .catch(() => setAssignees([]));
    fetch(`${API_BASE_URL}/geo/departments/?page_size=100`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data: { results?: DepartmentOption[] }) => setDepartments(data.results ?? []))
      .catch(() => setDepartments([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await listPostulaciones({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sector: sector || undefined,
        department: department || undefined,
        investment_range: investmentRange || undefined,
        assigned_to: assignedTo || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, sector, department, investmentRange, assignedTo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const columns: CmsColumn<ProjectApplicationListItem>[] = [
    {
      key: "reference_code",
      header: "Código",
      render: (row) => <span className="font-mono text-xs">{row.reference_code}</span>,
    },
    {
      key: "project_name",
      header: "Proyecto",
      render: (row) => <span className="font-medium">{row.project_name || "—"}</span>,
    },
    {
      key: "company",
      header: "Empresa",
      render: (row) => row.company || "—",
    },
    {
      key: "contact",
      header: "Contacto",
      render: (row) => (
        <div>
          <div className="font-medium">{row.full_name}</div>
          <div className="text-xs text-white/60">{row.email}</div>
        </div>
      ),
    },
    {
      key: "sector",
      header: "Sector",
      render: (row) => row.sector?.name ?? "—",
    },
    {
      key: "investment_range",
      header: "Inversión",
      render: (row) => INVESTMENT_RANGE_LABELS[row.investment_range] ?? row.investment_range ?? "—",
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <CmsLeadStatusBadge status={row.status} />,
    },
    {
      key: "assigned_to",
      header: "Responsable",
      render: (row) => row.assigned_to?.name ?? "Sin asignar",
    },
    {
      key: "created_at",
      header: "Fecha",
      render: (row) =>
        new Date(row.created_at).toLocaleString("es-HN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
  ];

  return (
    <div className="space-y-6">
      <CmsSectionHeader
        title="Postulaciones de proyectos"
        description="Bandeja interna de solicitudes recibidas desde el sitio público."
      />

      <CmsFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar código, empresa, contacto…">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as "" | ProjectApplicationStatus);
          }}
          className="rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sector}
          onChange={(e) => {
            setPage(1);
            setSector(e.target.value);
          }}
          className="rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los sectores</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={department}
          onChange={(e) => {
            setPage(1);
            setDepartment(e.target.value);
          }}
          className="rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={investmentRange}
          onChange={(e) => {
            setPage(1);
            setInvestmentRange(e.target.value);
          }}
          className="rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
        >
          {INVESTMENT_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={assignedTo}
          onChange={(e) => {
            setPage(1);
            setAssignedTo(e.target.value);
          }}
          className="rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los responsables</option>
          <option value="unassigned">Sin asignar</option>
          {assignees.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.name}
            </option>
          ))}
        </select>
      </CmsFilterBar>

      <CmsDataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.reference_code}
        loading={loading}
        error={error}
        emptyTitle="Sin postulaciones"
        emptyDescription="No hay postulaciones que coincidan con los filtros."
        onRowClick={(row) => router.push(`/cms/postulaciones/${encodeURIComponent(row.reference_code)}`)}
      />

      <CmsPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
