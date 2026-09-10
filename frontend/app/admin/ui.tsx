"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

/* ── Shared pieces for the admin area ─────────────────────
   A work tool, so denser than the public site, but in the same palette:
   powder canvas, white surfaces, teal-grey text, the brand teal as the one
   accent, and red / amber / green only for status. */

export const PHNOM_PENH = "Asia/Phnom_Penh";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Calendar date in Phnom Penh, whatever timezone the admin's browser is in. */
const phnomPenhDate = (value: string | Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PHNOM_PENH,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
};

export const formatDate = (iso: string, withYear = false) => {
  const { y, m, d } = phnomPenhDate(iso);
  return `${d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`;
};

/** Whole days from today to `iso`, counted in Phnom Penh. Negative means past. */
export const daysFromToday = (iso: string) => {
  const a = phnomPenhDate(iso);
  const b = phnomPenhDate(new Date());
  return Math.round((Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d)) / 86_400_000);
};

export const relativeDays = (days: number) =>
  days === 0
    ? "today"
    : days === 1
      ? "tomorrow"
      : days === -1
        ? "yesterday"
        : days > 0
          ? `in ${days} days`
          : `${-days} days ago`;

/** "2d 3h" — how long something has been waiting. */
export const formatAge = (iso: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

/** Has this been waiting longer than `hours`? Kept out of components so renders stay pure. */
export const waitedMoreThan = (iso: string, hours: number) =>
  Date.now() - Date.parse(iso) > hours * 3_600_000;

export const hostOf = (url: string | null | undefined) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/**
 * Load once on mount, with a manual reload. `load` must be stable (defined at
 * module level), or every render would start a new request.
 */
export function useAdminLoad<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await load());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this page");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void (async () => {
      await reload();
    })();
  }, [reload]);

  return { data, setData, error, loading, reload };
}

export function PageHeader({
  title,
  description,
  aside,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-blue-ink">{title}</h1>
        {description && <p className="text-sm text-gray-soft mt-0.5">{description}</p>}
      </div>
      {aside && <div className="text-sm text-gray-soft shrink-0">{aside}</div>}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-16 justify-center text-gray-soft">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-white p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
      <p className="font-bold text-blue-ink">{message || "Something went wrong"}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-sky/35 px-3 py-1.5 text-xs font-bold text-gray-body hover:bg-powder/70 cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Something in the data a person should fix. Amber, because it isn't an outage. */
export function Callout({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-sky/20 border-l-[3px] border-l-amber-500 bg-white px-4 py-3">
      <p className="text-sm font-bold text-blue-ink">{title}</p>
      {children && <div className="text-xs text-gray-body mt-1 leading-relaxed">{children}</div>}
    </div>
  );
}

const TONES = {
  neutral: "border border-sky/20 text-gray-body",
  red: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-800",
  green: "bg-emerald-50 text-emerald-700",
  accent: "bg-sky/15 text-sky-deep",
} as const;

export function Tag({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export const RISK_TAG: Record<string, { tone: keyof typeof TONES; label: string }> = {
  high: { tone: "red", label: "High risk" },
  caution: { tone: "amber", label: "Caution" },
  low: { tone: "green", label: "No flags" },
};

/** Filter chips with counts, e.g. "Deadline passed 4". */
export function Segments<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
            option.value === value ? "bg-sky/15 text-sky-deep" : "text-gray-soft hover:text-blue-ink"
          }`}
        >
          {option.label}
          {option.count !== undefined && <span className="ml-1 font-mono text-gray-soft">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

export const inputClass =
  "rounded-md border border-sky/35 bg-white px-3 py-1.5 text-sm text-blue-ink placeholder:text-gray-soft focus:outline-none focus:ring-2 focus:ring-sky/40";

export const tableClass = "w-full text-sm bg-white border border-sky/20 rounded-lg overflow-hidden";
export const thClass = "text-left text-xs font-bold text-gray-soft bg-powder/50 px-3 py-2 border-b border-sky/20 whitespace-nowrap";
export const tdClass = "px-3 py-2.5 border-b border-sky/10 align-top";
