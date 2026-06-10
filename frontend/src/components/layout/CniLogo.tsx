import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import logoCniLight from "@/src/img/logos/Logo_CNI_blanco.png";
import logoCniDark from "@/src/img/logos/Logo_CNI.png";

type CniLogoProps = {
  href: string;
  ariaLabel: string;
  /** `light` = logo blanco sobre fondos oscuros (footer). `dark` = logo a color (navbar blanco). */
  variant?: "light" | "dark";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function CniLogo({
  href,
  ariaLabel,
  variant = "light",
  className,
  imageClassName,
  priority = false,
}: CniLogoProps) {
  const logo = variant === "light" ? logoCniLight : logoCniDark;

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center transition-opacity hover:opacity-90", className)}
      aria-label={ariaLabel}
    >
      <Image
        src={logo}
        alt="Logo del Consejo Nacional de Inversiones"
        priority={priority}
        sizes="(max-width: 768px) 140px, 180px"
        className={cn("h-8 w-auto md:h-12 lg:h-16", imageClassName)}
      />
    </Link>
  );
}
