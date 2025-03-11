
import React from "react";
import { DropdownIcon, CalendarIcon } from "./icon";

const FilterGroup = ({ label, value, type = "text", className = "" }) => {
  return (
    <section
      className={`flex gap-2.5 justify-between items-center px-6 border border-solid border-neutral-200 ${className}`}
    >
      <h3 className="text-sm font-medium text-zinc-700">{label}</h3>
      <div className="box-border flex relative flex-row shrink-0 gap-1 items-center">
        <p
          className={`text-sm font-medium text-neutral-400 ${type === "date" ? "pt-0.5" : ""}`}
        >
          {value}
        </p>
        {type === "dropdown" && <DropdownIcon />}
        {type === "date" && <CalendarIcon />}
      </div>
    </section>
  );
};

export default FilterGroup;
