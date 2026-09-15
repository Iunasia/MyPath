"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
  title: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Opens the phone's share sheet where there is one, and copies the link
 * otherwise. Replaces header buttons that looked like Share but did nothing.
 */
/** A round button the same height as the Save pill beside it. */
const DEFAULT_CLASS =
  "size-11.5 shrink-0 inline-flex items-center justify-center rounded-full bg-white border border-sky/40 text-sky-deep hover:bg-sitomo/60 hover:border-sky transition-all bubble-shadow-sm cursor-pointer";

export default function ShareButton({
  title,
  className = DEFAULT_CLASS,
  iconClassName = "w-4.5 h-4.5",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("shareButton");

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The student closed the share sheet — nothing to do.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className={className}
      aria-label={t("shareTitle", { title })}
      title={copied ? t("linkCopied") : t("share")}
    >
      {copied ? <Check className={iconClassName} /> : <Share2 className={iconClassName} />}
      <span className="sr-only" aria-live="polite">
        {copied ? t("linkCopied") : ""}
      </span>
    </button>
  );
}
