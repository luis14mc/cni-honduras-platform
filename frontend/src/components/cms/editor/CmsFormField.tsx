import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface CmsFormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function CmsFormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: CmsFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#252A58]">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-[#252A58]/50">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export const cmsInputClass =
  "w-full rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] placeholder:text-[#252A58]/40 focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20";

export const cmsTextareaClass =
  "w-full min-h-[100px] rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] placeholder:text-[#252A58]/40 focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20";

export const cmsSelectClass =
  "w-full rounded-lg border border-[#334E88]/20 bg-white px-3 py-2 text-sm text-[#252A58] focus:border-[#334E88] focus:outline-none focus:ring-2 focus:ring-[#334E88]/20";
