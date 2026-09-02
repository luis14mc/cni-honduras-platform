import { describe, expect, it } from "vitest";
import {
  PROJECT_APPLICATION_STATUS_LABELS,
  buildPostulacionesQuery,
  formatHistoryEntry,
} from "@/src/lib/cms/editorial/postulaciones";
import type { ProjectApplicationHistoryEntry } from "@/src/lib/cms/editorial/postulaciones";

describe("buildPostulacionesQuery", () => {
  it("serializes filters and pagination", () => {
    const query = buildPostulacionesQuery({
      page: 2,
      page_size: 20,
      search: "CNI-PROJ",
      status: "reviewing",
      sector: "energia",
      department: "cortes",
      investment_range: "10m_50m",
      assigned_to: "5",
      date_from: "2026-01-01",
      date_to: "2026-12-31",
    });
    expect(query).toContain("page=2");
    expect(query).toContain("search=CNI-PROJ");
    expect(query).toContain("status=reviewing");
    expect(query).toContain("sector=energia");
    expect(query).toContain("department=cortes");
    expect(query).toContain("investment_range=10m_50m");
    expect(query).toContain("assigned_to=5");
  });

  it("returns empty string when no params", () => {
    expect(buildPostulacionesQuery({})).toBe("");
  });
});

describe("PROJECT_APPLICATION_STATUS_LABELS", () => {
  it("covers all workflow statuses in Spanish", () => {
    expect(PROJECT_APPLICATION_STATUS_LABELS.new).toBe("Nuevo");
    expect(PROJECT_APPLICATION_STATUS_LABELS.reviewing).toBe("En revisión");
    expect(PROJECT_APPLICATION_STATUS_LABELS.converted).toBe("Convertido");
  });
});

describe("formatHistoryEntry", () => {
  it("formats status change", () => {
    const entry: ProjectApplicationHistoryEntry = {
      id: 1,
      event_type: "status_changed",
      from_status: "new",
      to_status: "reviewing",
      from_assignee: null,
      to_assignee: null,
      metadata: {},
      actor: { id: 1, name: "Luis Martínez", email: "luis@example.com" },
      created_at: "2026-09-02T14:20:00Z",
    };
    expect(formatHistoryEntry(entry)).toBe("Luis Martínez cambió estado: Nuevo → En revisión");
  });

  it("formats assignment", () => {
    const entry: ProjectApplicationHistoryEntry = {
      id: 2,
      event_type: "assigned",
      from_status: "",
      to_status: "",
      from_assignee: null,
      to_assignee: { id: 2, name: "Juan Pérez", email: "juan@example.com" },
      metadata: {},
      actor: { id: 1, name: "Luis Martínez", email: "luis@example.com" },
      created_at: "2026-09-02T14:25:00Z",
    };
    expect(formatHistoryEntry(entry)).toBe("Asignado a Juan Pérez");
  });
});
