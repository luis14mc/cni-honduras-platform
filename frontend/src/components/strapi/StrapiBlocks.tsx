import type { ReactNode } from "react";
import { getStrapiMediaUrl } from "@/src/lib/strapi/media";
import {
  type StrapiBlock,
  type StrapiInlineNode,
  strapiBlocksHaveContent,
} from "@/src/lib/strapi/blocks";

type Props = {
  blocks: StrapiBlock[] | null | undefined;
  className?: string;
};

function renderInlines(nodes: StrapiInlineNode[] | undefined, keyPrefix: string): ReactNode {
  if (!nodes?.length) return null;
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "link" && node.url) {
      const href = node.url.trim();
      if (!href) return renderInlines(node.children, key);
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          key={key}
          href={href}
          className="text-[#35A963] underline-offset-2 hover:underline"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {renderInlines(node.children, key)}
        </a>
      );
    }
    if (node.children?.length && node.type !== "text") {
      return <span key={key}>{renderInlines(node.children, key)}</span>;
    }
    let text: ReactNode = node.text ?? "";
    if (node.bold) text = <strong>{text}</strong>;
    if (node.italic) text = <em>{text}</em>;
    if (node.underline) text = <u>{text}</u>;
    if (node.strikethrough) text = <s>{text}</s>;
    if (node.code) text = <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">{text}</code>;
    return <span key={key}>{text}</span>;
  });
}

function BlockView({ block, index }: { block: StrapiBlock; index: number }) {
  const key = `block-${index}-${block.type}`;
  const inlines = renderInlines(block.children, key);

  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className="text-lg leading-relaxed text-[#0E7A7C]">
          {inlines}
        </p>
      );
    case "heading": {
      const level = block.level === 3 ? 3 : block.level === 1 ? 1 : 2;
      const className =
        level === 3
          ? "font-headline text-xl font-bold text-[#252A58]"
          : "font-headline text-2xl font-bold text-[#252A58]";
      if (level === 3) return <h3 className={className}>{inlines}</h3>;
      if (level === 1) return <h1 className={className}>{inlines}</h1>;
      return <h2 className={className}>{inlines}</h2>;
    }
    case "list": {
      const ordered = block.format === "ordered";
      const ListTag = ordered ? "ol" : "ul";
      const items = (block.children ?? []).filter((item) => item.type === "list-item");
      if (!items.length) return null;
      return (
        <ListTag className={ordered ? "list-decimal space-y-1 pl-6" : "list-disc space-y-1 pl-6"}>
          {items.map((item, itemIndex) => (
            <li key={`${key}-li-${itemIndex}`}>{renderInlines(item.children, `${key}-li-${itemIndex}`)}</li>
          ))}
        </ListTag>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-4 border-[#35A963] bg-white/60 px-5 py-4 italic text-[#252A58]">
          {inlines}
        </blockquote>
      );
    case "image": {
      const src = getStrapiMediaUrl(block.image?.url ?? null);
      if (!src) return null;
      return (
        <figure className="space-y-2">
          <img
            src={src}
            alt={block.image?.alternativeText || ""}
            className="w-full rounded-xl object-cover"
            width={block.image?.width ?? undefined}
            height={block.image?.height ?? undefined}
          />
          {block.image?.caption ? (
            <figcaption className="text-center text-sm text-slate-500">{block.image.caption}</figcaption>
          ) : null}
        </figure>
      );
    }
    default:
      if (!inlines) return null;
      return (
        <p key={key} className="text-lg leading-relaxed text-[#0E7A7C]">
          {inlines}
        </p>
      );
  }
}

export function StrapiBlocks({ blocks, className }: Props) {
  if (!blocks?.length || !strapiBlocksHaveContent(blocks)) return null;
  return (
    <div className={className ?? "space-y-6 font-body text-base leading-relaxed text-[#252A58]/90"}>
      {blocks.map((block, index) => (
        <BlockView key={`strapi-block-${index}`} block={block} index={index} />
      ))}
    </div>
  );
}
