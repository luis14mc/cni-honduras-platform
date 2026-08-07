import { describe, expect, it } from "vitest";
import {
  canAdd,
  canChange,
  canDelete,
  canPublish,
  canView,
  hasPermission,
} from "@/src/lib/cms/permissions";
import type { CmsUser } from "@/src/lib/cms/types";

const baseUser: CmsUser = {
  id: 1,
  username: "editor",
  email: "editor@cni.hn",
  first_name: "Editor",
  last_name: "CNI",
  is_superuser: false,
  is_staff: true,
  groups: ["editors"],
  permissions: ["cms.view_news", "cms.add_news", "cms.change_news"],
};

describe("hasPermission", () => {
  it("returns false for null user", () => {
    expect(hasPermission(null, "cms.view_news")).toBe(false);
  });

  it("returns true for superuser regardless of permissions list", () => {
    expect(hasPermission({ ...baseUser, is_superuser: true, permissions: [] }, "cms.delete_news")).toBe(
      true,
    );
  });

  it("returns true when permission is in the list", () => {
    expect(hasPermission(baseUser, "cms.view_news")).toBe(true);
  });

  it("returns false when permission is missing", () => {
    expect(hasPermission(baseUser, "cms.delete_news")).toBe(false);
  });
});

describe("canPublish", () => {
  it("checks cms.can_publish", () => {
    expect(canPublish({ ...baseUser, permissions: ["cms.can_publish"] })).toBe(true);
    expect(canPublish(baseUser)).toBe(false);
  });
});

describe("model permission helpers", () => {
  it("canAdd checks add_<model>", () => {
    expect(canAdd(baseUser, "cms", "news")).toBe(true);
    expect(canAdd(baseUser, "cms", "document")).toBe(false);
  });

  it("canChange checks change_<model>", () => {
    expect(canChange(baseUser, "cms", "news")).toBe(true);
  });

  it("canDelete checks delete_<model>", () => {
    expect(canDelete(baseUser, "cms", "news")).toBe(false);
    expect(
      canDelete({ ...baseUser, permissions: [...baseUser.permissions, "cms.delete_news"] }, "cms", "news"),
    ).toBe(true);
  });

  it("canView checks view_<model>", () => {
    expect(canView(baseUser, "cms", "news")).toBe(true);
    expect(canView(baseUser, "cms", "document")).toBe(false);
  });
});
