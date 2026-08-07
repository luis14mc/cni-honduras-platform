import { describe, expect, it } from "vitest";
import { buildAttentionItems } from "@/src/lib/cms/dashboard";
import {
  classifyStatus,
  messageForStatus,
  parseCmsErrorBody,
  resolveCmsError,
} from "@/src/lib/cms/errors";
import { getCmsEnvironment, getEnvironmentBadgeLabel, shouldShowStagingBadge } from "@/src/lib/cms/environment";
import { resolveNavForPath } from "@/src/lib/cms/nav";
import { buildCrumbs } from "@/src/components/cms/CmsBreadcrumb";
import { isFormDirty } from "@/src/lib/cms/useFormDirty";
import { isValidSlug, slugifyFromTitle } from "@/src/lib/cms/slugify";
import { CmsApiError } from "@/src/lib/cms/errors";

describe("slugifyFromTitle", () => {
  it("normalizes Spanish accents", () => {
    expect(slugifyFromTitle("Noticia de Inversión")).toBe("noticia-de-inversion");
  });

  it("validates slug format", () => {
    expect(isValidSlug("noticia-de-inversion")).toBe(true);
    expect(isValidSlug("Noticia")).toBe(false);
  });
});

describe("parseCmsErrorBody", () => {
  it("maps status codes to user messages", () => {
    expect(messageForStatus(401)).toContain("sesión");
    expect(messageForStatus(429)).toContain("Demasiados");
    expect(messageForStatus(500)).toContain("servidor");
  });

  it("extracts field errors from DRF body", () => {
    const parsed = parseCmsErrorBody({ title_es: ["Este campo es obligatorio."] }, 400);
    expect(parsed.fieldErrors.title_es).toEqual(["Este campo es obligatorio."]);
  });

  it("classifies auth statuses", () => {
    expect(classifyStatus(401)).toBe("expired");
    expect(classifyStatus(403)).toBe("unauthorized");
  });

  it("resolves CmsApiError instances", () => {
    const err = new CmsApiError("Forbidden", 403);
    expect(resolveCmsError(err).status).toBe(403);
  });
});

describe("environment helpers", () => {
  it("shows staging badge outside production", () => {
    expect(shouldShowStagingBadge()).toBe(true);
    expect(getEnvironmentBadgeLabel()).toBeTruthy();
  });

  it("resolves explicit CMS env", () => {
    const prev = process.env.NEXT_PUBLIC_CMS_ENV;
    process.env.NEXT_PUBLIC_CMS_ENV = "production";
    expect(getCmsEnvironment()).toBe("production");
    expect(getEnvironmentBadgeLabel()).toBeNull();
    process.env.NEXT_PUBLIC_CMS_ENV = prev;
  });
});

describe("nav breadcrumbs", () => {
  it("resolves nested editor routes", () => {
    const ctx = resolveNavForPath("/cms/noticias/42");
    expect(ctx.section?.key).toBe("news");
    expect(ctx.actionLabel).toBe("Editar");
  });

  it("builds crumb trail for nested paths", () => {
    const crumbs = buildCrumbs("/cms/noticias/nueva");
    expect(crumbs.map((c) => c.label)).toEqual(["CMS", "Noticias", "Nueva"]);
  });
});

describe("useFormDirty helper", () => {
  it("detects JSON differences", () => {
    expect(isFormDirty({ a: 1 }, JSON.stringify({ a: 1 }))).toBe(false);
    expect(isFormDirty({ a: 2 }, JSON.stringify({ a: 1 }))).toBe(true);
  });
});

describe("buildAttentionItems", () => {
  it("filters zero counts and keeps actionable links", () => {
    const items = buildAttentionItems({
      drafts: 3,
      missing_translation_en: 0,
      missing_image: 1,
      documents_without_resource: 2,
      incomplete_opportunities: 0,
    });
    expect(items).toHaveLength(3);
    expect(items[0].href).toContain("/cms/");
  });
});
