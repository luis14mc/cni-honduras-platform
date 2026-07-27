import type { ReactNode } from "react";

/** Tema global en root layout; esta ruta conserva el mismo shell que el home principal. */
export default function HomeLedgerLayout({ children }: { children: ReactNode }) {
  return children;
}
