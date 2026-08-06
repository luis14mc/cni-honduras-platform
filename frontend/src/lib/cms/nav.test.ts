import { describe, expect, it } from "vitest";
import { canSeeNavItem, findNavItem, visibleNav } from "@/src/lib/cms/nav";
import type { CmsUser } from "@/src/lib/cms/types";

function makeUser(partial: Partial<CmsUser>): CmsUser {
  return {
    id: 1,
    username: "u",
    email: "",
    first_name: "",
    last_name: "",
    is_superuser: false,
    is_staff: true,
    groups: [],
    permissions: [],
    ...partial,
  };
}

describe("canSeeNavItem", () => {
  const newsItem = findNavItem("/cms/noticias")!;
  const usersItem = findNavItem("/cms/usuarios")!;
  const dashboard = findNavItem("/cms")!;

  it("shows everything to a superuser", () => {
    const su = makeUser({ is_superuser: true });
    expect(canSeeNavItem(su, newsItem)).toBe(true);
    expect(canSeeNavItem(su, usersItem)).toBe(true);
  });

  it("shows dashboard (no perms required) to any staff", () => {
    expect(canSeeNavItem(makeUser({}), dashboard)).toBe(true);
  });

  it("hides superuser-only items from non-superusers", () => {
    expect(canSeeNavItem(makeUser({ permissions: ["cms.view_news"] }), usersItem)).toBe(false);
  });

  it("shows a permissioned item only with a matching permission", () => {
    expect(canSeeNavItem(makeUser({ permissions: [] }), newsItem)).toBe(false);
    expect(canSeeNavItem(makeUser({ permissions: ["cms.add_news"] }), newsItem)).toBe(true);
  });
});

describe("visibleNav", () => {
  it("drops groups with no visible items for a scoped editor", () => {
    const editor = makeUser({ permissions: ["cms.view_news", "cms.add_news"] });
    const nav = visibleNav(editor);
    const keys = nav.flatMap((g) => g.items.map((i) => i.key));
    expect(keys).toContain("dashboard");
    expect(keys).toContain("news");
    expect(keys).not.toContain("users");
    expect(keys).not.toContain("sectors");
  });

  it("returns the full tree for a superuser", () => {
    const su = makeUser({ is_superuser: true });
    const keys = visibleNav(su).flatMap((g) => g.items.map((i) => i.key));
    expect(keys).toEqual(
      expect.arrayContaining(["dashboard", "news", "sectors", "media", "users", "settings"]),
    );
  });
});
