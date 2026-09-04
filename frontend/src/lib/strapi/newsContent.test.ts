import { describe, expect, it } from "vitest";
import {
  isNewsDynamicZone,
  mapNewsDynamicZoneToStrapiBlocks,
  newsDetailPopulateExtra,
  newsListPopulateExtra,
  parseLeadPoints,
  resolveNewsRichContent,
} from "@/src/lib/strapi/newsContent";

describe("newsContent", () => {
  it("detects Strapi dynamic zone payloads", () => {
    expect(
      isNewsDynamicZone([
        { __component: "content.paragraph", text: "Hola" },
        { __component: "content.heading", text: "Título", level: "h2" },
      ]),
    ).toBe(true);
    expect(isNewsDynamicZone([{ type: "paragraph", children: [] }])).toBe(false);
  });

  it("maps dynamic zone blocks to Strapi render blocks", () => {
    const blocks = mapNewsDynamicZoneToStrapiBlocks([
      { __component: "content.paragraph", text: "Párrafo editorial" },
      { __component: "content.heading", text: "Subtítulo", level: "h3" },
      {
        __component: "content.image",
        image: { url: "https://cdn.example/photo.webp", alternativeText: "Alt media" },
        caption: "Pie de foto",
        alt_text: "Alt override",
      },
      { __component: "content.quote", quote: "Cita relevante", author: "Ana", role: "CEO" },
    ]);

    expect(blocks).toHaveLength(4);
    expect(blocks[0]).toMatchObject({ type: "paragraph" });
    expect(blocks[1]).toMatchObject({ type: "heading", level: 3 });
    expect(blocks[2]).toMatchObject({
      type: "image",
      image: { url: "https://cdn.example/photo.webp", alternativeText: "Alt override", caption: "Pie de foto" },
    });
    expect(blocks[3]).toMatchObject({ type: "quote" });
  });

  it("falls back to legacy blocks JSON when content is not a dynamic zone", () => {
    const legacy = [{ type: "paragraph", children: [{ type: "text", text: "Legacy" }] }];
    expect(resolveNewsRichContent(legacy)[0]?.type).toBe("paragraph");
  });

  it("parses lead points", () => {
    expect(parseLeadPoints([{ text: " Punto 1 " }, { text: "" }, { text: "Punto 2" }])).toEqual([
      "Punto 1",
      "Punto 2",
    ]);
  });

  it("builds explicit populate params for list and detail", () => {
    expect(newsListPopulateExtra()).toMatchObject({ "populate[cover]": "true" });
    expect(newsDetailPopulateExtra()).toMatchObject({
      "populate[cover]": "true",
      "populate[lead_points]": "true",
      "populate[content][on][content.image][populate]": "image",
    });
  });
});
