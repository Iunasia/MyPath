"use client";

import React from "react";
import { Check, Scale } from "lucide-react";
import { useCompare, type CompareItem } from "@/app/context/CompareContext";

interface CompareButtonProps {
  item: CompareItem;
  variant?: "pill" | "icon" | "card-action";
  className?: string;
}

/** Adds an item to the compare tray. Styled to sit beside SaveItemButton. */
export default function CompareButton({ item, variant = "pill", className = "" }: CompareButtonProps) {
  const { has, toggle } = useCompare();
  const active = has(item.type, item.apiId);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Cards are links; comparing shouldn't also navigate.
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  };

  const label = active ? `Remove ${item.title} from comparison` : `Compare ${item.title}`;
  const Icon = active ? Check : Scale;

  if (variant === "card-action") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-label={label}
        title={active ? "In your comparison — click to remove" : "Add to comparison"}
        className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
          active
            ? "bg-sky-deep text-white ring-2 ring-white/50"
            : "bg-white/80 text-blue-ink hover:bg-white hover:text-sky-deep"
        } ${className}`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-label={label}
        title={active ? "In your comparison — click to remove" : "Add to comparison"}
        className={`p-2.5 rounded-2xl border transition-all focus:outline-none cursor-pointer bubble-shadow-sm ${
          active
            ? "bg-sitomo border-sky text-sky-deep"
            : "bg-white border-sky/15 text-sky-deep hover:border-sky/40 hover:bg-sitomo/50"
        } ${className}`}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-all bubble-shadow-sm cursor-pointer border ${
        active
          ? "bg-sitomo border-sky text-sky-deep"
          : "bg-white border-sky/40 text-sky-deep hover:bg-sitomo/60 hover:border-sky"
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{active ? "In comparison" : "Compare"}</span>
    </button>
  );
}
