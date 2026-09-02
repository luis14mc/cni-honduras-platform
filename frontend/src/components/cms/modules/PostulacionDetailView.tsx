"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CmsLeadStatusBadge } from "@/src/components/cms/editor/CmsLeadStatusBadge";
import { useCmsToast } from "@/src/components/cms/editor/CmsToast";
import { CmsErrorState, CmsLoadingState } from "@/src/components/cms/states";
import { useCmsAuth } from "@/src/lib/cms/AuthProvider";
import { CmsApiError } from "@/src/lib/cms/api";
import { canChange } from "@/src/lib/cms/permissions";
import {
  INVESTMENT_RANGE_LABELS,
  PROJECT_APPLICATION_STATUS_LABELS,
  createPostulacionNote,
  formatHistoryEntry,
  getPostulacion,
  listAssignableStaff,
  listPostulacionHistory,
  listPostulacionNotes,
  updatePostulacion,
  type ProjectApplicationDetail,
  type ProjectApplicationHistoryEntry,
  type ProjectApplicationNote,
  type ProjectApplicationStatus,
  type StaffUserBrief,
} from "@/src/lib/cms/editorial/postulaciones";

type Props = {
  referenceCode: string;
};

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#001a33]/40 p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[#8DC046]">{title}</h2>
      <div className="space-y-3 text-sm text-white/90">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</dt>
      <dd className="mt-1">{value ?? "—"}</dd>
    </div>
  );
}

export function PostulacionDetailView({ referenceCode }: Props) {
  const { user } = useCmsAuth();
  const toast = useCmsToast();
  const canEdit = canChange(user, "forms_app", "projectapplication");

  const [item, setItem] = useState<ProjectApplicationDetail | null>(null);
  const [notes, setNotes] = useState<ProjectApplicationNote[]>([]);
  const [history, setHistory] = useState<ProjectApplicationHistoryEntry[]>([]);
  const [assignees, setAssignees] = useState<StaffUserBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [statusDraft, setStatusDraft] = useState<ProjectApplicationStatus>("new");
  const [assigneeDraft, setAssigneeDraft] = useState<string>("");
  const [managementState, setManagementState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [noteBody, setNoteBody] = useState("");
  const [noteState, setNoteState] = useState<"idle" | "saving" | "error">("idle");

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [detail, noteRows, historyRows, staff] = await Promise.all([
        getPostulacion(referenceCode),
        listPostulacionNotes(referenceCode),
        listPostulacionHistory(referenceCode),
        listAssignableStaff(),
      ]);
      setItem(detail);
      setNotes(noteRows);
      setHistory(historyRows);
      setAssignees(staff);
      setStatusDraft(detail.status);
      setAssigneeDraft(detail.assigned_to ? String(detail.assigned_to.id) : "");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [referenceCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const saveManagement = async () => {
    if (!item || !canEdit) return;
    setManagementState("saving");
    try {
      const payload: { status?: ProjectApplicationStatus; assigned_to?: number | null } = {};
      if (statusDraft !== item.status) payload.status = statusDraft;
      const currentAssignee = item.assigned_to?.id ?? null;
      const nextAssignee = assigneeDraft ? Number(assigneeDraft) : null;
      if (nextAssignee !== currentAssignee) payload.assigned_to = nextAssignee;
      if (Object.keys(payload).length === 0) {
        setManagementState("idle");
        return;
      }
      const updated = await updatePostulacion(referenceCode, payload);
      setItem(updated);
      setStatusDraft(updated.status);
      setAssigneeDraft(updated.assigned_to ? String(updated.assigned_to.id) : "");
      const historyRows = await listPostulacionHistory(referenceCode);
      setHistory(historyRows);
      setManagementState("saved");
      toast.success("Cambios guardados.");
      window.setTimeout(() => setManagementState("idle"), 2000);
    } catch (err) {
      setManagementState("error");
      toast.error(err instanceof CmsApiError ? err.message : "No se pudieron guardar los cambios.");
    }
  };

  const submitNote = async () => {
    if (!canEdit || !noteBody.trim()) return;
    setNoteState("saving");
    try {
      const note = await createPostulacionNote(referenceCode, noteBody.trim());
      setNotes((prev) => [note, ...prev]);
      const historyRows = await listPostulacionHistory(referenceCode);
      setHistory(historyRows);
      setNoteBody("");
      setNoteState("idle");
      toast.success("Nota agregada.");
    } catch (err) {
      setNoteState("error");
      toast.error(err instanceof CmsApiError ? err.message : "No se pudo agregar la nota.");
    }
  };

  if (loading) return <CmsLoadingState label="Cargando postulación…" />;
  if (error || !item) {
    return (
      <CmsErrorState
        title="No se pudo cargar la postulación"
        description="Verifique su conexión o permisos e intente nuevamente."
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/cms/postulaciones"
            className="mb-3 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a postulaciones
          </Link>
          <h1 className="text-2xl font-bold text-white">{item.project_name || item.reference_code}</h1>
          <p className="mt-1 font-mono text-sm text-white/60">{item.reference_code}</p>
        </div>
        <CmsLeadStatusBadge status={item.status} className="text-sm px-3 py-1" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="Resumen">
          <Field label="Estado" value={<CmsLeadStatusBadge status={item.status} />} />
          <Field label="Responsable" value={item.assigned_to?.name ?? "Sin asignar"} />
          <Field
            label="Recibida"
            value={new Date(item.created_at).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" })}
          />
          <Field label="Origen" value={item.source || "—"} />
        </DetailSection>

        <DetailSection title="Contacto">
          <Field label="Nombre" value={item.full_name} />
          <Field label="Correo" value={item.email} />
          <Field label="Teléfono" value={item.phone} />
          <Field label="País" value={item.country} />
        </DetailSection>

        <DetailSection title="Empresa">
          <Field label="Empresa" value={item.company} />
          <Field label="Sitio web" value={item.website ? <a href={item.website} className="text-[#8DC046] underline" target="_blank" rel="noreferrer">{item.website}</a> : "—"} />
        </DetailSection>

        <DetailSection title="Proyecto">
          <Field label="Nombre" value={item.project_name} />
          <Field label="Descripción" value={<p className="whitespace-pre-wrap">{item.project_description || "—"}</p>} />
        </DetailSection>

        <DetailSection title="Inversión">
          <Field label="Rango" value={INVESTMENT_RANGE_LABELS[item.investment_range] ?? item.investment_range} />
          <Field label="Empleos estimados" value={item.estimated_jobs ?? "—"} />
        </DetailSection>

        <DetailSection title="Ubicación">
          <Field label="Sector" value={item.sector?.name} />
          <Field label="Departamento" value={item.department?.name} />
          <Field label="Municipio" value={item.municipality?.name} />
        </DetailSection>
      </div>

      {canEdit ? (
        <DetailSection title="Gestión interna">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Estado</span>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as ProjectApplicationStatus)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
              >
                {Object.entries(PROJECT_APPLICATION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Responsable</span>
              <select
                value={assigneeDraft}
                onChange={(e) => setAssigneeDraft(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white"
              >
                <option value="">Sin asignar</option>
                {assignees.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => void saveManagement()}
              disabled={managementState === "saving"}
              className="inline-flex items-center gap-2 rounded-xl bg-[#32B372] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {managementState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar cambios
            </button>
            {managementState === "saved" ? <span className="text-sm text-[#32B372]">Guardado</span> : null}
            {managementState === "error" ? <span className="text-sm text-red-300">Error al guardar</span> : null}
          </div>
        </DetailSection>
      ) : null}

      <DetailSection title="Notas internas">
        {canEdit ? (
          <div className="mb-4 space-y-2">
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="Agregar nota interna…"
              className="w-full rounded-xl border border-white/10 bg-[#001a33]/60 px-3 py-2 text-sm text-white placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={() => void submitNote()}
              disabled={noteState === "saving" || !noteBody.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#334E88] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {noteState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Agregar nota
            </button>
          </div>
        ) : null}
        {notes.length === 0 ? (
          <p className="text-white/60">Sin notas internas.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-white/10 bg-[#001a33]/30 p-3">
                <p className="whitespace-pre-wrap">{note.body}</p>
                <p className="mt-2 text-xs text-white/50">
                  {note.author.name} ·{" "}
                  {new Date(note.created_at).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      <DetailSection title="Historial">
        {history.length === 0 ? (
          <p className="text-white/60">Sin eventos registrados.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((entry) => (
              <li key={entry.id} className="border-l-2 border-[#334E88]/40 pl-4">
                <p className="text-xs text-white/50">
                  {new Date(entry.created_at).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="mt-1">{formatHistoryEntry(entry)}</p>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </div>
  );
}
