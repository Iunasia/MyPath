"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels: { prev: string; next: string; page: string; pageOf: string };
  className?: string;
}

function pagesAround(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("ellipsis");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("ellipsis");
  out.push(total);
  return out;
}

export function Pagination({ currentPage, totalPages, onPageChange, labels, className = "" }: PaginationProps) {
  const pageBtn = (page: number, active: boolean) =>
    `w-8 h-8 rounded-full text-xs font-bold transition-colors duration-150 ease-out cursor-pointer ${
      active
        ? "bg-sky-deep text-white"
        : "bg-panel border border-sky/20 text-blue-ink hover:bg-sitomo/60"
    }`;

  return (
    <nav
      aria-label="Pagination"
      className={`mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-sky/20 ${className}`}
    >
      <span className="text-xs font-bold text-gray-soft tabular-nums">
        {labels.pageOf.includes("{current}")
          ? labels.pageOf.replace("{current}", String(currentPage)).replace("{total}", String(totalPages))
          : labels.pageOf}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sky/30 bg-panel text-blue-ink text-xs font-bold hover:bg-sitomo/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-out cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>{labels.prev}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {pagesAround(currentPage, totalPages).map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 grid place-items-center text-xs text-gray-soft" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? "page" : undefined}
                aria-label={`${labels.page} ${p}`}
                className={pageBtn(p, p === currentPage)}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sky/30 bg-panel text-blue-ink text-xs font-bold hover:bg-sitomo/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-out cursor-pointer"
        >
          <span>{labels.next}</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}