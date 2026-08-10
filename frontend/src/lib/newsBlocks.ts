/** Editorial content blocks for News (ES/EN independent structures). */

export type NewsBlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "list"
  | "quote"
  | "divider"
  | "button";

export type NewsBlockBase = {
  id: string;
  type: NewsBlockType;
};

export type ParagraphBlock = NewsBlockBase & {
  type: "paragraph";
  html: string;
};

export type HeadingBlock = NewsBlockBase & {
  type: "heading";
  level: 2 | 3;
  text: string;
};

export type ImageBlock = NewsBlockBase & {
  type: "image";
  media_id: number | null;
  alt: string;
  caption: string;
  /** Resolved at render time from MediaAsset; not persisted as source of truth. */
  preview_url?: string | null;
};

export type ListBlock = NewsBlockBase & {
  type: "list";
  style: "bullet" | "ordered";
  items: string[];
};

export type QuoteBlock = NewsBlockBase & {
  type: "quote";
  text: string;
  attribution: string;
};

export type DividerBlock = NewsBlockBase & {
  type: "divider";
};

export type ButtonBlock = NewsBlockBase & {
  type: "button";
  label: string;
  url: string;
  open_in_new_tab: boolean;
};

export type NewsBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | DividerBlock
  | ButtonBlock;

export function newBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyBlock(type: NewsBlockType): NewsBlock {
  const id = newBlockId();
  switch (type) {
    case "paragraph":
      return { id, type, html: "" };
    case "heading":
      return { id, type, level: 2, text: "" };
    case "image":
      return { id, type, media_id: null, alt: "", caption: "", preview_url: null };
    case "list":
      return { id, type, style: "bullet", items: [""] };
    case "quote":
      return { id, type, text: "", attribution: "" };
    case "divider":
      return { id, type };
    case "button":
      return { id, type, label: "", url: "", open_in_new_tab: false };
  }
}

export function ensureBlocks(raw: unknown): NewsBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is NewsBlock => {
    return Boolean(item && typeof item === "object" && "type" in item && "id" in item);
  });
}

/** Allowed tags when rendering TipTap paragraph HTML. */
export const PARAGRAPH_ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
]);
