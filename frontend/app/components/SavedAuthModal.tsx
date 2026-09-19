"use client";

import React, { useEffect } from "react";
import { Link, usePathname } from "@/src/i18n";
import { Bookmark, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSaved } from "@/app/context/SavedContext";

export default function SavedAuthModal() {
  const { showAuthModal, closeAuthModal } = useSaved();
  const pathname = usePathname();
  const t = useTranslations("saved");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (!showAuthModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAuthModal, closeAuthModal]);

  if (!showAuthModal) return null;

  const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        data-lenis-prevent
        className="bg-white dark:bg-card-dark rounded-lg p-6 sm:p-8 max-w-md w-full border border-sky/15 dark:border-white/10 text-center relative animate-in zoom-in-95 duration-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-ink dark:hover:text-white p-1.5 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-sitomo/80 border border-sky/30 text-sky-deep flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 fill-sky-deep/20 text-sky-deep stroke-[1.75]" />
        </div>

        <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink dark:text-white mb-2">
          {t("signInToSave")}
        </h3>
        <p className="text-sm text-gray-body dark:text-gray-300 font-medium mb-6 leading-relaxed">
          {t("signInToSaveDesc")}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/auth/signin${nextParam}`}
            onClick={closeAuthModal}
            className="w-full py-3 rounded-md bg-[#7AB3B7] text-white font-bold text-sm hover:bg-[#68A1A5] transition-colors duration-150 ease-out text-center block"
          >
            {tCommon("signIn")}
          </Link>
          <Link
            href={`/auth/signup${nextParam}`}
            onClick={closeAuthModal}
            className="w-full py-3 rounded-md border border-sky/30 text-blue-ink dark:text-white font-bold text-sm hover:bg-sitomo/50 transition-colors duration-150 ease-out text-center block"
          >
            {tCommon("createAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
