"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  MonthCaptionProps,
  useDayPicker,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Add months safely (first-of-month) */
function addMonths(date: Date, months: number) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Custom Month+Year caption (v9): gunakan calendarMonth.date & useDayPicker */
function CustomMonthCaption({
  calendarMonth,
  displayIndex,
  className,
  ...rest
}: MonthCaptionProps) {
  const { goToMonth, previousMonth, nextMonth, dayPickerProps, formatters } =
    useDayPicker();

  const monthDate = calendarMonth.date;
  const currentYear = monthDate.getFullYear();
  const currentMonth = monthDate.getMonth();

  // Range tahun mengikuti props startMonth/endMonth bila ada; default "last 100 years".
  const startYear =
    dayPickerProps.startMonth?.getFullYear() ?? currentYear - 100;
  const endYear = dayPickerProps.endMonth?.getFullYear() ?? currentYear;

  const years = React.useMemo(
    () =>
      Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    [startYear, endYear],
  );

  const monthLabels = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) =>
        formatters.formatMonthDropdown(new Date(currentYear, m, 1)),
      ),
    [formatters, currentYear],
  );

  const goToDisplayedMonth = (year: number, monthIndex: number) => {
    const target = new Date(year, monthIndex, 1);
    // Perhatikan multi-month: geser base month dengan displayIndex
    const base = displayIndex ? addMonths(target, -displayIndex) : target;
    goToMonth(base);
  };

  return (
    <div
      className={cn("flex items-center justify-between gap-1", className)}
      {...rest}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label="Go to the Previous Month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5">
        <Select
          value={String(currentMonth)}
          onValueChange={(val) =>
            goToDisplayedMonth(currentYear, parseInt(val, 10))
          }
        >
          <SelectTrigger
            className="h-8 w-auto min-w-[6.5rem] rounded-full border-0 bg-secondary/60 px-3 font-medium text-foreground focus:bg-accent focus:text-accent-foreground"
            aria-label="Choose month"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthLabels.map((label, idx) => (
              <SelectItem key={idx} value={String(idx)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentYear)}
          onValueChange={(val) =>
            goToDisplayedMonth(parseInt(val, 10), currentMonth)
          }
        >
          <SelectTrigger
            className="h-8 w-auto min-w-[5rem] rounded-full border-0 bg-secondary/60 px-3 font-medium text-foreground focus:bg-accent focus:text-accent-foreground"
            aria-label="Choose year"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label="Go to the Next Month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 text-center text-[0.8rem] font-normal text-muted-foreground",
        week: "flex w-full mt-2",
        day: cn(
          "h-9 w-9 p-0 text-center text-sm relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-full [&:has(>.day-range-start)]:rounded-l-full"
            : ""
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 font-normal text-foreground aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "rounded-full bg-accent font-semibold text-accent-foreground",
        outside: "day-outside text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        /** Matikan Nav bawaan supaya tombol prev/next tidak ganda */
        Nav: () => <></>,
        /** Gunakan caption kustom yang mengikuti API v9 (MonthCaption) */
        MonthCaption: CustomMonthCaption,
        ...components,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
