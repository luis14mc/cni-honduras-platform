import { newBlockId, type NewsBlock } from "@/src/lib/newsBlocks";
import {
  isStrapiBlockArray,
  type StrapiBlock,
} from "@/src/lib/strapi/blocks";
import { getStrapiMediaUrl } from "@/src/lib/strapi/media";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isDynamicZoneItem(value: unknown): value is UnknownRecord & { __component: string } {
  return isRecord(value) && typeof value.__component === "string";
}

export function isNewsDynamicZone(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every(isDynamicZoneItem);
}

/** List cards: cover only. */
export function newsListPopulateExtra(pageSize = "100"): Record<string, string> {
  return {
    "populate[cover]": "true",
    "pagination[pageSize]": pageSize,
  };
}

/** Detail view: cover, lead points, dynamic zone (+ nested image media). */
export function newsDetailPopulateExtra(pageSize = "100"): Record<string, string> {
  return {
    ...newsListPopulateExtra(pageSize),
    "populate[lead_points]": "true",
    "populate[content][on][content.image][populate]": "image",
  };
}

export function parseLeadPoints(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item) => asString(item.text).trim())
    .filter(Boolean);
}

function headingLevel(value: unknown): number {
  if (value === "h3" || value === 3) return 3;
  if (value === "h1" || value === 1) return 1;
  return 2;
}

function textInlines(text: string): NonNullable<StrapiBlock["children"]> {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return [{ type: "text", text: trimmed }];
}

function resolveComponentImage(raw: unknown): StrapiBlock["image"] {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const url = getStrapiMediaUrl(raw);
    return url ? { url, alternativeText: null, caption: null, width: null, height: null } : null;
  }
  if (!isRecord(raw)) return null;

  let source: UnknownRecord = raw;
  if ("data" in raw) {
    const nested = raw.data;
    if (nested == null) return null;
    if (Array.isArray(nested)) {
      return nested.length ? resolveComponentImage(nested[0]) : null;
    }
    if (isRecord(nested) && isRecord(nested.attributes)) {
      source = { ...nested.attributes, id: nested.id };
    } else if (isRecord(nested)) {
      source = nested;
    }
  }

  const url = getStrapiMediaUrl(asString(source.url));
  if (!url) return null;
  return {
    url,
    alternativeText: asString(source.alternativeText) || null,
    caption: asString(source.caption) || null,
    width: typeof source.width === "number" ? source.width : null,
    height: typeof source.height === "number" ? source.height : null,
  };
}

export function mapNewsDynamicZoneToStrapiBlocks(raw: unknown): StrapiBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: StrapiBlock[] = [];

  for (const item of raw) {
    if (!isDynamicZoneItem(item)) continue;
    switch (item.__component) {
      case "content.paragraph": {
        const text = asString(item.text);
        if (text.trim()) {
          blocks.push({ type: "paragraph", children: textInlines(text) });
        }
        break;
      }
      case "content.heading": {
        const text = asString(item.text);
        if (text.trim()) {
          blocks.push({
            type: "heading",
            level: headingLevel(item.level),
            children: textInlines(text),
          });
        }
        break;
      }
      case "content.quote": {
        const quote = asString(item.quote);
        if (quote.trim()) {
          blocks.push({ type: "quote", children: textInlines(quote) });
        }
        break;
      }
      case "content.image": {
        const image = resolveComponentImage(item.image);
        const altText = asString(item.alt_text);
        if (image?.url) {
          blocks.push({
            type: "image",
            image: {
              ...image,
              alternativeText: altText || image.alternativeText || null,
              caption: asString(item.caption) || image.caption || null,
            },
          });
        }
        break;
      }
      default:
        break;
    }
  }

  return blocks;
}

export function mapNewsDynamicZoneToNewsBlocks(raw: unknown): NewsBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: NewsBlock[] = [];

  for (const item of raw) {
    if (!isDynamicZoneItem(item)) continue;
    switch (item.__component) {
      case "content.paragraph": {
        const text = asString(item.text).trim();
        if (text) {
          blocks.push({ id: newBlockId(), type: "paragraph", html: text });
        }
        break;
      }
      case "content.heading": {
        const text = asString(item.text).trim();
        if (text) {
          const level = headingLevel(item.level) === 3 ? 3 : 2;
          blocks.push({ id: newBlockId(), type: "heading", level, text });
        }
        break;
      }
      case "content.quote": {
        const text = asString(item.quote).trim();
        if (text) {
          const author = asString(item.author).trim();
          const role = asString(item.role).trim();
          const attribution = [author, role].filter(Boolean).join(" — ");
          blocks.push({ id: newBlockId(), type: "quote", text, attribution });
        }
        break;
      }
      case "content.image": {
        const image = resolveComponentImage(item.image);
        if (image?.url) {
          blocks.push({
            id: newBlockId(),
            type: "image",
            media_id: null,
            alt: asString(item.alt_text) || image.alternativeText || "",
            caption: asString(item.caption) || image.caption || "",
            preview_url: image.url,
          });
        }
        break;
      }
      default:
        break;
    }
  }

  return blocks;
}

export function resolveNewsRichContent(raw: unknown): StrapiBlock[] {
  if (isNewsDynamicZone(raw)) {
    return mapNewsDynamicZoneToStrapiBlocks(raw);
  }
  return isStrapiBlockArray(raw) ? raw : [];
}
