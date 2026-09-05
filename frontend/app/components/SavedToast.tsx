"use client";

import Link from "next/link";
import { Bookmark, ArrowRight, X } from "lucide-react";
import { useSaved } from "@/app/context/SavedContext";

export default function SavedToast() {
  const { showToast, lastSavedTitle, dismissToast } = useSaved();

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fadeInUp max-w-sm w-[calc(100%-3rem)] sm:w-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-sky px-4 py-3 bubble-shadow flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-sky text-white flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4 fill-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-ink truncate">
              {lastSavedTitle ? `Saved: ${lastSavedTitle}` : "Item saved!"}
            </p>
            <Link
              href="/saved"
              onClick={dismissToast}
              className="text-[11px] font-extrabold text-sky-deep hover:underline inline-flex items-center gap-1"
            >
              <span>View in Saved Items</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-full text-gray-soft hover:text-blue-ink hover:bg-sitomo/50 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

