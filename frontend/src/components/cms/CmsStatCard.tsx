import { createElement } from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { cmsIcon } from "@/src/components/cms/icons";

interface CmsStatCardProps {
  label: string;
  value: number;
  icon: string;
  href?: string;
  /** Optional breakdown, e.g. published vs draft. */
  hint?: string;
  accent?: "blue" | "green" | "navy";
  loading?: boolean;
}

const ACCENTS: Record<string, string> = {
  blue: "text-[#334E88] bg-[#334E88]/10",
  green: "text-[#32B372] bg-[#32B372]/12",
  navy: "text-[#252A58] bg-[#252A58]/10",
};

// Render the resolved icon via createElement so the dynamic lookup isn't treated
// as creating a component during render.
function StatIcon({ name }: { name: string }) {
  return createElement(cmsIcon(name), { className: "h-5 w-5", "aria-hidden": true });
}

export function CmsStatCard({
  label,
  value,
  icon,
  href,
  hint,
  accent = "blue",
  loading = false,
}: CmsStatCardProps) {
  const body = (
    <div
      className={cn(
        "group flex items-start justify-between gap-4 rounded-xl border border-[#334E88]/10 bg-white p-5 shadow-sm transition",
        href && "hover:border-[#334E88]/30 hover:shadow-md",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#252A58]/60">{label}</p>
        {loading ? (
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[#334E88]/10" />
        ) : (
          <p className="mt-1 text-3xl font-bold tabular-nums text-[#252A58]">
            {value.toLocaleString("es-HN")}
          </p>
        )}
        {hint ? <p className="mt-1 text-xs text-[#252A58]/50">{hint}</p> : null}
      </div>
      <span className={cn("rounded-lg p-2.5", ACCENTS[accent])}>
        <StatIcon name={icon} />
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#334E88] rounded-xl">
        {body}
      </Link>
    );
  }
  return body;
}
