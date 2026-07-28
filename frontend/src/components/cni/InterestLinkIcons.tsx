import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function InterestGuideIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M12 10c0-1.1.9-2 2-2h8v32h-8a2 2 0 0 1-2-2V10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M22 8h12a2 2 0 0 1 2 2v28H22V8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M15 15h5M15 21h5M15 27h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 15h7M26 21h7M26 27h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M8 38h32"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function InterestMemoriaIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M13 11h19a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M17 18h14M17 24h14M17 30h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M28 11V8h7v7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="33" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
    </svg>
  );
}

export function InterestPdiIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="24" cy="24" r="13" stroke="currentColor" strokeWidth="1.75" />
      <ellipse cx="24" cy="24" rx="13" ry="5" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />
      <path
        d="M24 11v26M11 24h26"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="24" cy="24" r="3.5" fill="currentColor" />
      <circle cx="34" cy="17" r="2" fill="currentColor" opacity="0.65" />
      <circle cx="15" cy="30" r="2" fill="currentColor" opacity="0.65" />
    </svg>
  );
}

export function InterestEstudiosIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="20" cy="20" r="8.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M26.5 26.5 36 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 34h16M12 34l3-6 4 2 5-9 6 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type InterestLinkIconId = "guia" | "memoria" | "pdi" | "estudios";

const ICONS: Record<InterestLinkIconId, ComponentType<IconProps>> = {
  guia: InterestGuideIcon,
  memoria: InterestMemoriaIcon,
  pdi: InterestPdiIcon,
  estudios: InterestEstudiosIcon,
};

export function InterestLinkIcon({
  id,
  ...props
}: { id: InterestLinkIconId } & IconProps) {
  const Icon = ICONS[id];
  return <Icon {...props} />;
}
