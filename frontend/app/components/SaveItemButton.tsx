"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bookmark, X } from "lucide-react";
import { useSaved, SavedItem } from "@/app/context/SavedContext";
import { useAuth } from "@/app/context/AuthContext";

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
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isSaved = checkIsSaved(item.id);

  const defaultLabel =
    label || `Save ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    toggleSave(item);
  };

  return (
    <>
      {variant === "card-action" && (
        <button
          type="button"
          onClick={handleClick}
          aria-label={isSaved ? `Unsave ${item.title}` : `Save ${item.title}`}
          title={isSaved ? "Saved - click to remove" : `Save ${item.title}`}
          className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
            isSaved
              ? "bg-sky-deep text-white ring-2 ring-white/50"
              : "bg-white/80 text-blue-ink hover:bg-white hover:text-sky-deep"
          } ${className}`}
        >
          <Bookmark
            className={`w-4 h-4 transition-transform active:scale-90 ${
              isSaved ? "fill-white text-white" : ""
            }`}
          />
        </button>
      )}

      {variant === "icon" && (
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
      )}

      {variant === "pill" && (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all bubble-shadow-sm cursor-pointer border ${
            isSaved
              ? "bg-sitomo border-sky text-sky-deep"
              : "bg-sky-deep text-white border-transparent hover:bg-sky-dark"
          } ${className}`}
        >
          <Bookmark
            className={`w-4 h-4 transition-transform active:scale-90 ${
              isSaved ? "fill-sky-deep text-sky-deep" : "fill-white text-white"
            }`}
          />
          <span>{isSaved ? savedLabel : defaultLabel}</span>
        </button>
      )}

      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-ink/40 backdrop-blur-xs p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAuthModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-sky/20 bubble-shadow text-center relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAuthModal(false);
              }}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-soft hover:text-blue-ink hover:bg-powder transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-sitomo text-sky-deep flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-6 h-6 fill-sky-deep" />
            </div>

            <h3 className="font-display text-xl font-extrabold text-blue-ink mb-2">
              Sign in to save items
            </h3>
            <p className="text-xs sm:text-sm text-gray-body mb-6 font-medium">
              Create an account or sign in to bookmark opportunities and access them anytime.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/auth/signin"
                className="w-full py-2.5 rounded-full bg-sky-deep text-white font-bold text-xs sm:text-sm hover:bg-sky-dark transition-colors inline-block text-center cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="w-full py-2.5 rounded-full border border-sky/30 text-sky-deep font-bold text-xs sm:text-sm hover:bg-sitomo transition-colors inline-block text-center cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

