"use client";

import * as React from "react";
import { endOfDay, format, startOfDay, type Locale } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseISO(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export { parseISO as parseISODate, toISO as toISODate };

type DatePickerProps = {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  locale?: Locale;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  minDate,
  maxDate,
  disabled = false,
  error = false,
  id,
  locale,
}: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-full px-4 font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(selected!, "d MMMM yyyy", { locale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-2xl p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) onChange(toISO(date));
          }}
          locale={locale}
          disabled={(d) =>
            (minDate ? startOfDay(d) < startOfDay(minDate) : false) ||
            (maxDate ? startOfDay(d) > endOfDay(maxDate) : false)
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
