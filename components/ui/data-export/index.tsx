"use client";

import { useCallback, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ExportButtonProps, ExportFormat } from "./_types";

const FORMAT_ITEMS: {
  format: ExportFormat;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    format: "xlsx",
    label: "Export Excel",
    description: "File .xlsx untuk Microsoft Excel / Google Sheets",
    icon: FileSpreadsheet,
  },
  {
    format: "csv",
    label: "Export CSV",
    description: "File .csv untuk Excel maupun aplikasi lain",
    icon: FileText,
  },
];

const FORMAT_LABELS: Record<ExportFormat, string> = {
  xlsx: "Excel",
  csv: "CSV",
};

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reusable admin export control (docs/12-design-rules.md).
 *
 * Trigger is a pill button; opening it shows a rounded menu with "Export Excel"
 * and "Export CSV". Files are built server-side by the admin-only endpoint
 * `/api/admin/export` (lib/export/resources.ts defines each resource's
 * columns), then downloaded through the browser.
 */
export function ExportButton({
  resource,
  query,
  filename,
  label = "Export",
  variant = "secondary",
  size = "default",
  icon: Icon = Download,
  align = "end",
  className,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [formatting, setFormatting] = useState<ExportFormat | null>(null);

  const download = useCallback(
    async (format: ExportFormat) => {
      setFormatting(format);
      try {
        const params = new URLSearchParams({ resource, format });
        if (query) {
          for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== "" && value !== "all") {
              params.set(key, value);
            }
          }
        }

        const res = await fetch(`/api/admin/export?${params.toString()}`, {
          method: "GET",
        });

        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(json?.error ?? `Gagal export (${res.status})`);
        }

        const blob = await res.blob();
        const baseName = filename ?? resource;
        const fileName = `${baseName}-${dateStamp()}.${format}`;

        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);

        toast.success(`Export ${FORMAT_LABELS[format]} berhasil!`);
        setOpen(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[data-export] failed:", err);
        toast.error(
          err instanceof Error ? err.message : "Gagal mengekspor data."
        );
      } finally {
        setFormatting(null);
      }
    },
    [resource, query, filename]
  );

  const exporting = formatting !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("rounded-full", className)}
          disabled={exporting}
          aria-label={label}
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icon className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-80 rounded-2xl border-0 p-1.5 shadow-md"
      >
        <p className="px-3 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">
          Export data
        </p>
        {FORMAT_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          const active = formatting === item.format;
          return (
            <button
              key={item.format}
              type="button"
              onClick={() => download(item.format)}
              disabled={exporting}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                "hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                {active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ItemIcon className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {item.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export default ExportButton;
