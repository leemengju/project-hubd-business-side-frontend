import * as React from "react";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-gray-800",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-brand-normal text-white hover:bg-brand-normal hover:text-white focus:bg-brand-normal focus:text-white dark:bg-brand-normal dark:text-white",
        day_today: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
        day_outside: "text-gray-400 opacity-50 dark:text-gray-500",
        day_disabled: "text-gray-400 opacity-50 dark:text-gray-600",
        day_range_middle:
          "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => ( <ChevronLeft className={cn("h-4 w-4", className)} {...props} /> ),
        IconRight: ({ ...props }) => ( <ChevronRight className={cn("h-4 w-4", className)} {...props} /> ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar }; 
