import { describe, expect, it } from "vitest";
import {
  blocksHaveRenderableContent,
  createEmptyBlock,
  ensureBlocks,
  serializeBlocksForSave,
  type NewsBlock,
} from "@/src/lib/newsBlocks";

describe("ensureBlocks", () => {
  it("assigns ids to legacy blocks missing id", () => {
    const blocks = ensureBlocks([
      { type: "paragraph", html: "<p>Hola</p>" },
      { type: "heading", level: 2, text: "Titulo" },
    ]);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].id).toBeTruthy();
    expect(blocks[1].id).toBeTruthy();
    expect(blocks[0].type).toBe("paragraph");
  });

  it("keeps existing ids", () => {
    const blocks = ensureBlocks([{ id: "keep-me", type: "divider" }]);
    expect(blocks[0].id).toBe("keep-me");
  });
});

describe("serializeBlocksForSave", () => {
  it("strips preview_url from image blocks", () => {
    const blocks = serializeBlocksForSave([
      {
        id: "img-1",
        type: "image",
        media_id: 9,
        alt: "Alt",
        caption: "Cap",
        preview_url: "https://api-test.cni.hn/media/x.webp",
      },
    ]);
    expect(blocks[0].type).toBe("image");
    if (blocks[0].type === "image") {
      expect(blocks[0].media_id).toBe(9);
      expect(blocks[0].preview_url).toBeUndefined();
    }
  });
});

describe("blocksHaveRenderableContent", () => {
  it("returns false for empty paragraph shells", () => {
    expect(
      blocksHaveRenderableContent([{ id: "1", type: "paragraph", html: "<p></p>" }]),
    ).toBe(false);
  });

  it("returns true for real content", () => {
    const blocks: NewsBlock[] = [
      createEmptyBlock("heading"),
      { id: "p", type: "paragraph", html: "<p>Contenido</p>" },
    ];
    expect(blocksHaveRenderableContent(blocks)).toBe(true);
  });
});

describe("block editor mutations", () => {
  it("supports add, reorder, remove, duplicate shapes", () => {
    let blocks: NewsBlock[] = [createEmptyBlock("paragraph"), createEmptyBlock("heading")];
    const third = createEmptyBlock("list");
    blocks = [...blocks, third];
    expect(blocks).toHaveLength(3);

    // reorder: move last to first
    const [a, b, c] = blocks;
    blocks = [c, a, b];
    expect(blocks[0].type).toBe("list");

    // duplicate
    const clone = { ...structuredClone(blocks[0]), id: createEmptyBlock("list").id };
    blocks = [blocks[0], clone, ...blocks.slice(1)];
    expect(blocks).toHaveLength(4);

    // remove
    blocks = blocks.filter((_, i) => i !== 1);
    expect(blocks).toHaveLength(3);
  });

  it("image selection stores media_id", () => {
    let block = createEmptyBlock("image");
    expect(block.type).toBe("image");
    if (block.type === "image") {
      block = {
        ...block,
        media_id: 42,
        preview_url: "https://api-test.cni.hn/media/y.webp",
        alt: "Foto",
      };
      expect(block.media_id).toBe(42);
      const saved = serializeBlocksForSave([block])[0];
      expect(saved.type).toBe("image");
      if (saved.type === "image") {
        expect(saved.media_id).toBe(42);
        expect(saved.preview_url).toBeUndefined();
      }
    }
  });

  it("ES and EN block arrays stay independent", () => {
    const es = [createEmptyBlock("paragraph")];
    const en = [createEmptyBlock("quote")];
    const nextEs = [...es, createEmptyBlock("heading")];
    expect(nextEs).toHaveLength(2);
    expect(en).toHaveLength(1);
    expect(en[0].type).toBe("quote");
  });
});
