import { describe, expect, it } from "vitest";
import { activityEditorHref } from "@/src/lib/cms/dashboard";
import { searchResultHref } from "@/src/lib/cms/editorial/search";
import { isProtectedPageSlug } from "@/src/lib/cms/pageProtection";
import { canManageUsers } from "@/src/lib/cms/permissions";
import type { CmsUser } from "@/src/lib/cms/types";

describe("searchResultHref", () => {
  it("maps sector results", () => {
    expect(searchResultHref("sectors", 3)).toBe("/cms/sectores/3");
  });
});

describe("activityEditorHref", () => {
  it("maps page activity", () => {
    expect(activityEditorHref("page", 2)).toBe("/cms/paginas/2");
  });
});

describe("isProtectedPageSlug", () => {
  it("protects contacto", () => {
    expect(isProtectedPageSlug("contacto")).toBe(true);
  });
  it("allows custom slugs", () => {
    expect(isProtectedPageSlug("landing-custom")).toBe(false);
  });
});

describe("canManageUsers", () => {
  const base: CmsUser = {
    id: 1,
    username: "u",
    email: "",
    first_name: "",
    last_name: "",
    is_superuser: false,
    is_staff: true,
    groups: [],
    permissions: [],
  };
  it("allows superuser", () => {
    expect(canManageUsers({ ...base, is_superuser: true })).toBe(true);
  });
  it("allows auth.change_user", () => {
    expect(canManageUsers({ ...base, permissions: ["auth.change_user"] })).toBe(true);
  });
});
