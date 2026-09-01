import { describe, expect, it } from "vitest";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { resolveHref } from "@/src/config/siteNavigation";
import { buildMetadata } from "@/src/lib/seo";

describe("portfolio QA regressions", () => {
  it("resolves the English studies resource URL", () => {
    expect(resolveHref("en", "/recursos/estudios")).toBe("/en/resources/studies");
  });

  it("leaves the global metadata template to append the CNI brand once", () => {
    const metadata = buildMetadata(PAGE_SEO.portafolio, "en");
    expect(metadata.title).toBe("INVESTMENT PORTFOLIO");
  });
});
