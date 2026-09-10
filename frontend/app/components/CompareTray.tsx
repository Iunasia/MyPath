"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Scale, X } from "lucide-react";
import { MAX_COMPARE, useCompare, type CompareType } from "@/app/context/CompareContext";

const NOUN: Record<CompareType, [string, string]> = {
  scholarship: ["scholarship", "scholarships"],
  university: ["university", "universities"],
  major: ["major", "majors"],
  career: ["career", "careers"],
};

/**
 * Floats at the bottom of the page while a student is picking things to
 * compare. Hidden on the comparison itself and in the admin area.
 */
export default function CompareTray() {
  const { items, type, remove, clear, compareHref, notice, isHydrated } = useCompare();
  const pathname = usePathname() ?? "";

  if (!isHydrated || !type || items.length === 0) return null;
  if (pathname.startsWith("/compare") || pathname.startsWith("/admin")) return null;

  const [one, many] = NOUN[type];
  const message =
    notice === "full"
      ? `You can compare up to ${MAX_COMPARE} at once — remove one first.`
      : notice === "restarted"
        ? `Started a new comparison of ${many}. You can compare one kind at a time.`
        : compareHref
          ? `${items.length} of ${MAX_COMPARE} ${many} picked`
          : `Pick one more ${one} to compare.`;

  return (
    <div
      role="region"
      aria-label="Your comparison"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl animate-fadeInUp"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky px-4 py-3 bubble-shadow flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2.5 min-w-0 sm:w-48 shrink-0">
          <span className="w-8 h-8 rounded-full bg-sky-deep text-white flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </span>
          <p className="text-xs font-bold text-blue-ink leading-snug" aria-live="polite">
            {message}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {items.map((item) => (
            <li
              key={item.apiId}
              className="inline-flex items-center gap-1 max-w-[12rem] rounded-full bg-sitomo border border-sky/25 pl-3 pr-1 py-1 text-[11px] font-bold text-blue-ink"
            >
              <span className="truncate" title={item.title}>
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => remove(item.type, item.apiId)}
                className="p-0.5 rounded-full text-gray-soft hover:text-blue-ink hover:bg-white transition-colors cursor-pointer shrink-0"
                aria-label={`Remove ${item.title}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clear}
            className="px-3 py-2 rounded-full text-xs font-bold text-gray-soft hover:text-blue-ink transition-colors cursor-pointer"
          >
            Clear
          </button>
          {compareHref ? (
            <Link
              href={compareHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-deep px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-dark transition-colors bubble-shadow-sm"
            >
              Compare
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-full bg-sky/40 px-5 py-2.5 text-xs font-bold text-white cursor-not-allowed"
            >
              Compare
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
