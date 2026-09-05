"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { useSaved, SavedItem } from "@/app/context/SavedContext";

interface SaveItemButtonProps {
  item: Omit<SavedItem, "savedAt">;
  className?: string;
  variant?: "pill" | "icon" | "card-action";
  label?: string;
  savedLabel?: string;
}

export default function SaveItemButton({
  item,
  className = "",
  variant = "pill",
  label,
  savedLabel = "Saved",
}: SaveItemButtonProps) {
  const { isSaved: checkIsSaved, toggleSave } = useSaved();
  const isSaved = checkIsSaved(item.id);

  const defaultLabel =
    label || `Save ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(item);
  };

  if (variant === "card-action") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isSaved ? `Unsave ${item.title}` : `Save ${item.title}`}
        title={isSaved ? "Saved - click to remove" : `Save ${item.title}`}
        className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
          isSaved
            ? "bg-sky text-white ring-2 ring-white/50"
            : "bg-white/80 text-blue-ink hover:bg-white hover:text-sky-deep"
        } ${className}`}
      >
        <Bookmark
          className={`w-4 h-4 transition-transform active:scale-90 ${
            isSaved ? "fill-white text-white" : ""
          }`}
        />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isSaved ? `Unsave ${item.title}` : `Save ${item.title}`}
        title={isSaved ? "Saved - click to remove" : `Save ${item.title}`}
        className={`p-2.5 rounded-2xl border transition-all focus:outline-none cursor-pointer bubble-shadow-sm ${
          isSaved
            ? "bg-sitomo border-sky text-sky-deep"
            : "bg-white border-sky/15 text-blue-ink hover:border-sky/40 hover:bg-sitomo/50"
        } ${className}`}
      >
        <Bookmark
          className={`w-5 h-5 transition-transform active:scale-90 ${
            isSaved ? "fill-sky-deep text-sky-deep" : "text-sky-deep"
          }`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all bubble-shadow-sm cursor-pointer border ${
        isSaved
          ? "bg-sitomo border-sky text-sky-deep"
          : "bg-sky text-white border-transparent hover:bg-sky-bright"
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 transition-transform active:scale-90 ${
          isSaved ? "fill-sky-deep text-sky-deep" : "fill-white text-white"
        }`}
      />
      <span>{isSaved ? savedLabel : defaultLabel}</span>
    </button>
  );
}

