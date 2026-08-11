// Types
import type { LucideIcon } from "lucide-react";
import type { ExportResource } from "@/lib/export/resources";
import type { ComponentProps } from "react";
import type { Button } from "@/components/ui/button";

export type ExportFormat = "xlsx" | "csv";

export interface ExportButtonProps {
  /** Which resource to export (lib/export/resources.ts defines the columns). */
  resource: ExportResource;
  /** Extra query params forwarded to the API (e.g. `{ status, search }`). */
  query?: Record<string, string | undefined>;
  /** Base file name (a date is appended automatically). */
  filename?: string;
  /** Button label, defaults to "Export". */
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  icon?: LucideIcon;
  /** Popover alignment, defaults to "end". */
  align?: "start" | "center" | "end";
  className?: string;
}
