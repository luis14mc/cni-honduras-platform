import type { ReactNode } from "react";

interface CmsSectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function CmsSectionHeader({ title, description, actions }: CmsSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#334E88]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-[#252A58]">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[#252A58]/60">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
