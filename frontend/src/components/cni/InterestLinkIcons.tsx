import Image from "next/image";

export type InterestLinkIconId = "guia" | "memoria" | "pdi" | "estudios";

const ICON_SRC: Record<InterestLinkIconId, string> = {
  guia: "/home_index/iconos-home/icono-guia.png",
  memoria: "/home_index/iconos-home/icono-memoria.png",
  pdi: "/home_index/iconos-home/icono-portal.png",
  estudios: "/home_index/iconos-home/icono-estudios.png",
};

type Props = {
  id: InterestLinkIconId;
  className?: string;
};

export function InterestLinkIcon({ id, className }: Props) {
  return (
    <Image
      src={ICON_SRC[id]}
      alt=""
      aria-hidden
      width={128}
      height={128}
      className={className ?? "h-20 w-20 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"}
      sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
    />
  );
}
