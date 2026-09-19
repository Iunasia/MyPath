"use client";

import { Search, X } from "lucide-react";
import { forwardRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  id?: string;
  name?: string;
  size?: "sm" | "lg";
  className?: string;
  autoComplete?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      placeholder,
      ariaLabel,
      label,
      id,
      name = "search",
      size = "lg",
      className = "",
      autoComplete = "off",
    },
    ref
  ) {
    const inputId = id ?? name;
    const rounded = "rounded-md";

    return (
      <div className={`relative w-full ${className}`}>
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`${size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-sky-deep`} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel ?? label}
            spellCheck={false}
            autoComplete={autoComplete}
            className={`w-full ${size === "lg" ? "pl-12 pr-10 py-3.5" : "pl-11 pr-9 py-3"} ${rounded} bg-panel border border-sky/25 text-sm text-blue-ink placeholder:text-gray-faint focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-colors duration-150 ease-out font-medium [&::-webkit-search-cancel-button]:hidden`}
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-soft hover:text-blue-ink transition-colors cursor-pointer"
            >
              <X className={`${size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"}`} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }
);