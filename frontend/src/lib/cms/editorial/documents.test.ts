import { describe, expect, it } from "vitest";
import {
  buildListQuery,
  type ListParams,
} from "@/src/lib/cms/editorial/types";
import { documentResourceConflict } from "@/src/lib/cms/editorial/documents";

describe("documentResourceConflict", () => {
  it("blocks file + external url", () => {
    expect(
      documentResourceConflict({ hasFile: true, externalUrl: "https://example.com/a.pdf" }),
    ).toMatch(/no ambos/i);
  });

  it("allows file only", () => {
    expect(documentResourceConflict({ hasFile: true, externalUrl: "" })).toBeNull();
  });

  it("allows url only", () => {
    expect(
      documentResourceConflict({ hasFile: false, externalUrl: "https://example.com/a.pdf" }),
    ).toBeNull();
  });
});

describe("buildListQuery language filter", () => {
  it("includes language and resource_key", () => {
    const params: ListParams = { language: "en", resource_key: "turismo-2026", page: 1 };
    const qs = buildListQuery(params);
    expect(qs).toContain("language=en");
    expect(qs).toContain("resource_key=turismo-2026");
    expect(qs).toContain("page=1");
  });
});
