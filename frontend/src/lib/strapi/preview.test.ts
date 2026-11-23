import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyEditorialPreview } from "@/src/lib/strapi/preview";

describe("signed Strapi preview", () => {
  const secret = "local-test";
  const now = 1000;
  const query = {
    collection: "pages",
    documentId: "example1",
    status: "draft",
    expires: "1100",
    signature: createHmac("sha256", secret).update("pages:example1:es:draft:1100").digest("hex"),
  };

  it("accepts a signed request for exactly the requested document, locale and status", () => {
    expect(verifyEditorialPreview("es", query, secret, now)?.status).toBe("draft");
    expect(verifyEditorialPreview("en", query, secret, now)).toBeNull();
    expect(verifyEditorialPreview("es", { ...query, status: "published" }, secret, now)).toBeNull();
    expect(verifyEditorialPreview("es", { ...query, documentId: "example2" }, secret, now)).toBeNull();
  });

  it("rejects expired and malformed signatures", () => {
    expect(verifyEditorialPreview("es", query, secret, 1100)).toBeNull();
    expect(verifyEditorialPreview("es", { ...query, signature: "invalid" }, secret, now)).toBeNull();
  });
});
