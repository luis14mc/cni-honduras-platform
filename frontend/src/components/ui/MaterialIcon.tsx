import type { CSSProperties } from "react";
import { cn } from "@/src/lib/utils";

type Props = {
  name: string;
  className?: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  style?: CSSProperties;
};

export function MaterialIcon({ name, className, filled = false, weight = 400, style }: Props) {
  return (
    <span
      aria-hidden
      className={cn("material-symbols-outlined", className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

export default MaterialIcon;
