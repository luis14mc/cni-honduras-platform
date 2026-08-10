/**
 * Lightweight HTML sanitizer for TipTap paragraph blocks.
 * Only keeps a small allowlist of tags/attrs — no script/style.
 */
import { PARAGRAPH_ALLOWED_TAGS } from "@/src/lib/newsBlocks";

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
};

function isSafeHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  return (
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("mailto:")
  );
}

export function sanitizeNewsHtml(html: string): string {
  if (!html || typeof window === "undefined") {
    // Server: strip tags that are clearly dangerous via regex fallback
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!PARAGRAPH_ALLOWED_TAGS.has(tag)) {
          el.replaceWith(...Array.from(el.childNodes));
          continue;
        }
        for (const attr of Array.from(el.attributes)) {
          const allowed = ALLOWED_ATTRS[tag];
          if (!allowed || !allowed.has(attr.name.toLowerCase())) {
            el.removeAttribute(attr.name);
            continue;
          }
          if (attr.name === "href" && !isSafeHref(attr.value)) {
            el.removeAttribute(attr.name);
          }
          if (attr.name === "target" && attr.value !== "_blank") {
            el.removeAttribute(attr.name);
          }
        }
        if (tag === "a" && el.getAttribute("target") === "_blank") {
          el.setAttribute("rel", "noopener noreferrer");
        }
        walk(el);
      }
    }
  };
  walk(template.content);
  return template.innerHTML;
}
