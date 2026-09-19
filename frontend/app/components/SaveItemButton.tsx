"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
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
  savedLabel,
}: SaveItemButtonProps) {
  const t = useTranslations("saveButton");
  const { isSaved: checkIsSaved, toggleSave } = useSaved();

  const isSaved = checkIsSaved(item.id);

  const defaultLabel = label || t("save");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    toggleSave(item);
  };

  return (
    <>
      {variant === "card-action" && (
        <button
          type="button"
          onClick={handleClick}
          aria-label={isSaved ? `${t("unsave")} ${item.title}` : `${t("save")} ${item.title}`}
          title={isSaved ? t("savedClickToRemove") : `${t("save")} ${item.title}`}
          className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/40 ${
            isSaved
              ? "bg-[#7AB3B7] text-white ring-2 ring-white/50"
              : "bg-white/80 text-blue-ink hover:bg-white hover:text-sky-deep"
          } ${className}`}
        >
          <Bookmark
            className={`w-4 h-4 transition-colors duration-150 ease-out ${
              isSaved ? "fill-white text-white" : ""
            }`}
          />
        </button>
      )}

      {variant === "icon" && (
        <button
          type="button"
          onClick={handleClick}
          aria-label={isSaved ? `${t("unsave")} ${item.title}` : `${t("save")} ${item.title}`}
          title={isSaved ? t("savedClickToRemove") : `${t("save")} ${item.title}`}
          className={`p-2.5 rounded-md border transition-colors focus:outline-none cursor-pointer ${
            isSaved
              ? "bg-sitomo border-sky text-sky-deep"
              : "bg-white border-sky/15 text-blue-ink hover:border-sky/40 hover:bg-sitomo/50"
          } ${className}`}
        >
          <Bookmark
            className={`w-5 h-5 transition-colors duration-150 ease-out ${
              isSaved ? "fill-sky-deep text-sky-deep" : "text-sky-deep"
            }`}
          />
        </button>
      )}

      {variant === "pill" && (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer border ${
            isSaved
              ? "bg-sitomo border-sky text-sky-deep"
              : "bg-[#7AB3B7] text-white border-transparent hover:bg-[#68A1A5]"
          } ${className}`}
        >
          <Bookmark
            className={`w-4 h-4 transition-colors duration-150 ease-out ${
              isSaved ? "fill-sky-deep text-sky-deep" : "fill-white text-white"
            }`}
          />
          <span>{isSaved ? savedLabel || t("saved") : defaultLabel}</span>
        </button>
      )}

    </>
  );
}

