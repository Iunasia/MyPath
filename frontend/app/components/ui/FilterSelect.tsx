"use client";

import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  label?: string;
  id?: string;
  name?: string;
  className?: string;
}

export const FilterSelect = forwardRef<HTMLSelectElement, FilterSelectProps>(
  function FilterSelect(
    { value, onChange, options, ariaLabel, label, id, name = "filter-select", className = "" },
    ref
  ) {
    const selectId = id ?? name;
    return (
      <div className={`relative ${className}`}>
        {label ? (
          <label htmlFor={selectId} className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel}
          className="appearance-none bg-panel border border-sky/25 text-blue-ink text-xs font-bold pl-4 pr-9 py-2 rounded-full cursor-pointer hover:border-sky transition-colors focus:outline-none focus:ring-2 focus:ring-sky/30 bubble-shadow-sm"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-3.5 h-3.5 text-sky-deep absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  }
);