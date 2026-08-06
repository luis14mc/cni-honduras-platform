import type { ReactNode } from "react";
import { CmsShell } from "@/src/components/cms/CmsShell";

// All routes in this group render inside the authenticated CMS shell, which
// also guards the session and redirects to /cms/login when needed.
export default function CmsProtectedLayout({ children }: { children: ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
