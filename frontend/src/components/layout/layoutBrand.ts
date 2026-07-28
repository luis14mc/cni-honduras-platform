/** Paleta institucional CNI — navbar, footer y layout. */
export const CNI_NAV = {
  navy: "#252A58",
  blue: "#334E88",
  green: "#32B372",
  gray: "#64748B",
  white: "#FFFFFF",
} as const;

export function mainNavLinkClass(active: boolean, open = false) {
  const highlighted = active || open;
  return [
    "relative inline-flex items-center gap-1 px-4 py-3.5",
    "text-[0.8125rem] font-semibold leading-none transition-colors duration-200",
    highlighted ? "text-[#252A58] font-bold" : "text-[#334E88] hover:text-[#32B372]",
    highlighted
      ? "after:absolute after:bottom-2 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-[#32B372] after:content-['']"
      : "",
  ].join(" ");
}
