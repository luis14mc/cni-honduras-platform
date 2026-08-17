/** Strapi 5 Blocks JSON (richtext) — domain types, not the raw REST envelope. */

export type StrapiInlineNode = {
  type?: string;
  text?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: StrapiInlineNode[];
};

export type StrapiBlock = {
  type: string;
  level?: number;
  format?: string;
  url?: string;
  children?: StrapiInlineNode[];
  image?: {
    url?: string | null;
    alternativeText?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

export function isStrapiBlockArray(value: unknown): value is StrapiBlock[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "type" in item);
}

export function parseStrapiBlocks(value: unknown): StrapiBlock[] {
  return isStrapiBlockArray(value) ? value : [];
}

export function strapiBlocksHaveContent(blocks: StrapiBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type === "image") {
      return Boolean(block.image?.url);
    }
    return Boolean(plainTextFromInlines(block.children).trim());
  });
}

export function plainTextFromInlines(nodes?: StrapiInlineNode[]): string {
  if (!nodes?.length) return "";
  return nodes
    .map((node) => {
      if (typeof node.text === "string") return node.text;
      if (node.children) return plainTextFromInlines(node.children);
      return "";
    })
    .join("");
}
