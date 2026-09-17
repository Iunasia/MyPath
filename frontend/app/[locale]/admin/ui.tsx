"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2, ShieldCheck, X } from "lucide-react";
import type { ApiAuditEntry } from "@/app/lib/api";

/* ── Shared pieces for the admin area ─────────────────────
   A work tool, so denser than the public site, but in the same design
   language: powder canvas, white surfaces, Nunito, the brand teal as the
   one accent, and red / amber / green only for status. */

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

/* ── Validation helpers ──────────────────────────────── */

/** Is a form value meaningfully present? */
export const isFilled = (v: unknown): boolean => {
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

/** Validate a URL field. Returns an error message or empty. */
export const validateUrl = (value: string, label = "URL"): string => {
  if (!value.trim()) return "";
  try {
    const u = new URL(value.trim());
    if (!u.protocol.startsWith("http")) return `Enter a full ${label} starting with https://`;
    return "";
  } catch {
    return `Enter a full ${label} starting with https://`;
  }
};

/** Focus the first `[aria-invalid]` element inside a container. */
export const focusFirstInvalid = (container: HTMLElement | null) => {
  if (!container) return;
  requestAnimationFrame(() => {
    container.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  });
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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-blue-ink">{title}</h1>
        {description && <p className="text-sm text-gray-body mt-1 max-w-[70ch]">{description}</p>}
      </div>
      {aside && <div className="text-xs text-gray-soft shrink-0 sm:text-right max-w-[28rem]">{aside}</div>}
    </div>
  );
}

/** A white surface. `accent` draws the teal top rule for the one card that matters most. */
export function Card({
  title,
  meta,
  accent = false,
  children,
}: {
  title: string;
  meta?: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sky/15 bg-white overflow-hidden">
      {accent && <div className="h-1 bg-sky-deep" aria-hidden="true" />}
      <header className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-sky/15">
        <h2 className="font-display text-sm font-extrabold text-blue-ink">{title}</h2>
        {meta && <span className="text-[11px] text-gray-soft">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

/** Search + filters row, so every catalogue screen reads the same. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 mb-4">{children}</div>;
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
    <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
      <p className="font-bold text-blue-ink">{message || "Something went wrong"}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnSecondary} mt-3`}>
          Try again
        </button>
      )}
    </div>
  );
}

/** Something in the data a person should fix. Amber, because it isn't an outage. */
export function Callout({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-sky/15 border-l-[3px] border-l-amber-500 bg-white px-4 py-3">
      <p className="text-sm font-bold text-blue-ink">{title}</p>
      {children && <div className="text-xs text-gray-body mt-1 leading-relaxed">{children}</div>}
    </div>
  );
}

const TONES = {
  neutral: "border border-sky/20 dark:border-white/10 text-gray-body dark:text-slate-300 bg-white dark:bg-panel",
  red: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/50",
  amber: "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50",
  accent: "bg-sky/15 text-sky-deep border border-sky/25 dark:bg-sky/20 dark:text-sky dark:border-sky/30",
} as const;

export function Tag({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export const RISK_TAG: Record<string, { tone: keyof typeof TONES; label: string }> = {
  high: { tone: "red", label: "High risk" },
  caution: { tone: "amber", label: "Caution" },
  low: { tone: "green", label: "No flags" },
};

/**
 * The verification mark — a stamp for a listing a person confirmed against
 * its source. Hollow and dashed until someone actually checks it.
 */
export function VerificationMark({
  date,
  name,
  pending = false,
}: {
  date?: string | null;
  name?: string | null;
  pending?: boolean;
}) {
  if (pending || !date) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-sky/40 bg-white px-2 py-0.5 text-[11px] font-bold text-gray-soft whitespace-nowrap"
        title="No person has checked this yet"
      >
        Never checked
      </span>
    );
  }
  const initials = name
    ?.trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 whitespace-nowrap"
      title={name ? `Checked by ${name}` : "Checked by a person"}
    >
      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
      Checked{initials ? ` · ${initials}` : ""} {formatDate(date)}
    </span>
  );
}

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
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-sky/15 bg-white p-1" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
            option.value === value ? "bg-sky/15 text-sky-deep" : "text-gray-soft hover:text-blue-ink"
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={`ml-1 tabular-nums ${option.value === value ? "text-sky-deep/70" : "text-gray-faint"}`}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* One control language for the whole area. */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#2B6B6D] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#235759] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-panel px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/25 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
export const btnGhost =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

export const inputClass =
  "w-full h-10 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-panel px-3.5 text-[13.5px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-slate-300 dark:hover:border-white/25 focus:border-[#2B6B6D] dark:focus:border-sky focus:bg-white dark:focus:bg-panel focus:outline-none focus:ring-4 focus:ring-[#2B6B6D]/15 dark:focus:ring-sky/20 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100";

export const tableClass =
  "w-full text-sm bg-white dark:bg-panel border border-slate-200/90 dark:border-transparent rounded-xl overflow-hidden shadow-xs";
export const thClass =
  "text-left text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-panel-raised px-3.5 py-3 border-b border-slate-200 dark:border-b-0 dark:border-transparent whitespace-nowrap";
export const tdClass =
  "px-3.5 py-3 border-b border-slate-100 dark:border-b-0 dark:border-transparent align-top text-[13px] text-slate-700 dark:text-slate-200";

export const textareaClass =
  "w-full min-h-[96px] rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-panel px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-slate-300 dark:hover:border-white/25 focus:border-[#2B6B6D] dark:focus:border-sky focus:bg-white dark:focus:bg-panel focus:outline-none focus:ring-4 focus:ring-[#2B6B6D]/15 dark:focus:ring-sky/20 resize-y";

export const selectClass =
  "w-full h-10 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-panel pl-3.5 pr-10 text-[13.5px] font-medium text-slate-900 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-slate-300 dark:hover:border-white/25 focus:border-[#2B6B6D] dark:focus:border-sky focus:bg-white dark:focus:bg-panel focus:outline-none focus:ring-4 focus:ring-[#2B6B6D]/15 dark:focus:ring-sky/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.65rem_center] bg-no-repeat";

/* ── Form + overlay primitives ─────────────────────────── */

/** Label + control + inline message, so forms read the same everywhere. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 cursor-pointer select-none">
        <span className="flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold text-[13px]" title="Required">*</span>}
        </span>
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-normal leading-normal">{hint}</p>}
      {error && (
        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-700 dark:text-rose-400 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * A section inside a form: elevated card grouping with an icon,
 * clear section header, and responsive two-column grid.
 */
export function FormSection({
  title,
  id,
  empty,
  badge,
  icon,
  children,
}: {
  title: string;
  id?: string;
  empty?: number;
  badge?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-form-section
      data-section-title={title}
      data-section-empty={empty ?? 0}
      className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-panel p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] scroll-mt-24 transition-all hover:border-slate-300 dark:hover:border-white/20"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800/50 text-[#2B6B6D] dark:text-sky flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {badge && <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">{badge}</span>}
          {empty !== undefined && empty > 0 && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
              {empty} {empty === 1 ? "field" : "fields"} remaining
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/** Sticky footer for the focus editor: completeness / error on the left, actions on the right. */
export function FormFooter({
  dirty,
  filled,
  total,
  error,
  busy,
  submitLabel,
  create = false,
  submitAnotherLabel,
  onCancel,
  onSubmitAnother,
}: {
  dirty: boolean;
  filled: number;
  total: number;
  error: string;
  busy: boolean;
  submitLabel: string;
  create?: boolean;
  submitAnotherLabel?: string;
  onCancel: () => void;
  onSubmitAnother?: () => void;
}) {
  const percentage = total ? Math.round((filled / total) * 100) : 0;
  return (
    <div className="sticky bottom-0 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="min-w-0 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-20 sm:w-24 h-1.5 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[#2B6B6D] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-900 tabular-nums">
            {filled}/{total}
          </span>
          <span className="hidden sm:inline text-[11px] font-medium text-slate-500">
            ({percentage}% complete)
          </span>
        </div>

        {dirty && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </span>
        )}
        {error && (
          <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            {error}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        {create && submitAnotherLabel && onSubmitAnother && (
          <button type="button" onClick={onSubmitAnother} disabled={busy} className={btnSecondary}>
            {submitAnotherLabel}
          </button>
        )}
        <button type="submit" disabled={busy} className={btnPrimary} title="Shortcut: Ctrl+S or ⌘S">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          <span>{submitLabel}</span>
          <span className="hidden md:inline-block text-[10px] font-normal opacity-75 border border-white/30 rounded px-1 ml-0.5">
            Ctrl+S
          </span>
        </button>
      </div>
    </div>
  );
}

/** The focus editor: replaces the table when editing. */
export function EditorShell({
  backLabel,
  onBack,
  title,
  id,
  tag,
  children,
}: {
  backLabel: string;
  onBack: () => void;
  title: string;
  id?: number;
  tag?: ReactNode;
  children: ReactNode;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<{ id: string; label: string; empty: number }[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;

    const discover = () => {
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-form-section]"));
      const found = els.map((el) => ({
        id: el.id,
        label: el.dataset.sectionTitle || "",
        empty: Number(el.dataset.sectionEmpty || 0),
      }));
      setSections(found);
      if (found.length > 0 && !found.some((s) => s.id === activeId)) {
        setActiveId(found[0].id);
      }
    };

    discover();

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      },
      { rootMargin: "-88px 0px -60% 0px", threshold: [0, 1] }
    );

    root.querySelectorAll<HTMLElement>("[data-form-section]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const jumpTo = (sectionId: string) => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden" aria-label="Record editor" ref={shellRef}>
      <header className="px-5 sm:px-8 pt-6 pb-5 border-b border-slate-100 bg-white">
        <button type="button" onClick={onBack} className={`${btnGhost} -ml-2 mb-2 group text-[#2B6B6D] hover:text-slate-900`}>
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>Back to {backLabel}</span>
        </button>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {id && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-0.5 tabular-nums">
                #{id}
              </span>
            )}
            {tag && <span className="ml-1">{tag}</span>}
          </div>
        </div>
      </header>

      {sections.length > 1 && (
        <nav
          className="sticky top-14 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-2.5 flex gap-1.5 overflow-x-auto shadow-xs"
          aria-label="Sections"
        >
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpTo(s.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-150 ${
                s.id === activeId
                  ? "bg-[#2B6B6D] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{s.label}</span>
              {s.empty > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    s.id === activeId ? "bg-amber-300" : "bg-amber-500"
                  }`}
                  aria-label={`${s.empty} empty`}
                />
              )}
            </button>
          ))}
        </nav>
      )}
      <div className="p-5 sm:p-8 space-y-6 bg-slate-50/40">{children}</div>
    </section>
  );
}

/**
 * A tag input: chips for the chosen values, type-ahead over `options`, and
 * (when `allowCustom`) free entry. Used for the name-based relationship fields
 * so references resolve to real records wherever possible.
 */
export function TokenSelect({
  value,
  onChange,
  options = [],
  allowCustom = false,
  placeholder = "Type to add or search…",
  inputId,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options?: string[];
  allowCustom?: boolean;
  placeholder?: string;
  inputId?: string;
}) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);

  const exists = (candidate: string) => value.some((v) => v.toLowerCase() === candidate.toLowerCase());

  const add = (raw: string) => {
    const next = raw.trim();
    if (!next || exists(next)) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  };

  const remove = (target: string) => onChange(value.filter((v) => v !== target));

  const query = draft.trim().toLowerCase();
  const suggestions = query
    ? options.filter((option) => option.toLowerCase().includes(query) && !exists(option)).slice(0, 6)
    : [];

  return (
    <div
      className={`min-h-[42px] rounded-lg border bg-white p-2 transition-all duration-150 ${
        focused ? "border-[#2B6B6D] ring-4 ring-[#2B6B6D]/15 shadow-[0_1px_2px_rgba(0,0,0,0.04)]" : "border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      }`}
    >
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((item) => {
            const unmatched = options.length > 0 && !allowCustom && !options.some((o) => o.toLowerCase() === item.toLowerCase());
            return (
              <li key={item}>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md pl-2.5 pr-1.5 py-1 text-xs font-medium transition-all ${
                    unmatched
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "bg-slate-100 text-slate-800 border border-slate-200/80 hover:bg-slate-200/80"
                  }`}
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    title={`Remove ${item}`}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-300 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span className="sr-only">Remove {item}</span>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <input
        id={inputId}
        value={draft}
        onFocus={() => setFocused(true)}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(suggestions[0] ?? (allowCustom ? draft : ""));
          }
          if (e.key === "Backspace" && !draft && value.length > 0) remove(value[value.length - 1]);
        }}
        onBlur={() => {
          setFocused(false);
          if (allowCustom && draft.trim()) add(draft);
          else if (suggestions[0]) add(suggestions[0]);
        }}
        placeholder={value.length === 0 ? placeholder : "Add another…"}
        className="w-full bg-transparent px-1.5 py-0.5 text-[13.5px] font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
      />

      {suggestions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
            Matching suggestions (click or press Enter):
          </span>
          <ul className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(suggestion);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-[#2B6B6D] hover:text-white hover:border-[#2B6B6D] transition-colors cursor-pointer"
                >
                  <span className="font-bold">+</span>
                  <span>{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Thumbnail preview for an image URL with validation feedback. */
export function ImagePreview({ url, className }: { url: string; className?: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (!url?.trim()) {
    return (
      <div className={`h-16 w-16 rounded-xl border border-dashed border-sky/30 bg-powder/40 flex flex-col items-center justify-center text-gray-soft/70 ${className ?? ""}`}>
        <span className="text-[10px] font-bold">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative h-16 w-16 rounded-xl border border-sky/20 bg-white overflow-hidden shadow-sm shrink-0 group ${className ?? ""}`}>
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-500 p-1 text-center">
          <AlertTriangle className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-bold leading-tight">Invalid URL</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Preview"
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      )}
    </div>
  );
}

/**
 * The shared form scaffold for the focus editor. Owns dirty tracking,
 * validation, completeness, keyboard shortcuts, and the sticky footer.
 * Each page passes sections as `children` (a render prop).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function EditorForm<T extends {}>({
  initial,
  fields,
  create = false,
  validate,
  onSubmit,
  onCancel,
  onDirtyChange,
  busy,
  error,
  submitLabel,
  submitAnotherLabel,
  children,
}: {
  initial: T;
  fields: (keyof T)[];
  create?: boolean;
  validate: (value: T) => Partial<Record<keyof T, string>>;
  onSubmit: (value: T, opts?: { keepCreating?: boolean }) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  busy: boolean;
  error: string;
  submitLabel: string;
  submitAnotherLabel?: string;
  children: (ctx: { value: T; set: (patch: Partial<T>) => void; errors: Partial<Record<keyof T, string>>; clear: (key: keyof T) => void }) => ReactNode;
}) {
  const [value, setValue] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(initial), [value, initial]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const set = useCallback((patch: Partial<T>) => {
    setValue((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      let changed = false;
      const next = { ...e };
      for (const k of Object.keys(patch) as (keyof T)[]) {
        if (next[k]) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : e;
    });
  }, []);

  const clear = useCallback((key: keyof T) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e)), []);

  const filledCount = fields.filter((k) => isFilled(value[k])).length;

  const handleSubmit = (opts?: { keepCreating?: boolean }) => {
    const errs = validate(value);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    onSubmit(value, opts);
  };

  const handleAnother = () => handleSubmit({ keepCreating: true });

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector("[role='dialog']")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onCancel]);

  const ctx = useMemo(() => ({ value, set, errors, clear }), [value, set, errors, clear]);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col"
    >
      <div className="grid gap-6 px-5 sm:px-8 py-6">{children(ctx)}</div>
      <FormFooter
        dirty={dirty}
        filled={filledCount}
        total={fields.length}
        error={error}
        busy={busy}
        submitLabel={submitLabel}
        create={create}
        submitAnotherLabel={submitAnotherLabel}
        onCancel={onCancel}
        onSubmitAnother={handleAnother}
      />
    </form>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-blue-ink/30 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-2xl border border-sky/15 bg-white bubble-shadow p-5">
        <h2 className="font-display text-base font-extrabold text-blue-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-body">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={tone === "danger" ? btnDanger : btnPrimary}>
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const ACTION_LABEL: Record<ApiAuditEntry["action"], string> = {
  create: "Added",
  update: "Edited",
  archive: "Archived",
  restore: "Restored",
};

const auditStamp = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: PHNOM_PENH,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const describeValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "blank";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "blank";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/** The change log for one record — shared by every catalogue editor. */
export function HistoryList({ entries }: { entries: ApiAuditEntry[] | null }) {
  if (entries === null) return <p className="px-4 py-3 text-xs text-gray-soft">Loading history…</p>;
  if (entries.length === 0) return <p className="px-4 py-3 text-xs text-gray-soft">No changes recorded yet.</p>;
  return (
    <ul className="divide-y divide-sky/10">
      {entries.map((entry) => (
        <li key={entry.id} className="px-4 py-2.5">
          <p className="text-xs font-bold text-blue-ink">
            {ACTION_LABEL[entry.action]}
            {entry.actor_name ? <span className="font-semibold text-gray-body"> · {entry.actor_name}</span> : null}
          </p>
          <p className="text-[11px] text-gray-soft">{auditStamp(entry.created_at)}</p>
          {entry.action === "update" && (
            <ul className="mt-1 space-y-0.5">
              {Object.entries(entry.changes).map(([field, change]) => (
                <li key={field} className="text-[11px] text-gray-body">
                  <span className="font-bold">{field}</span>: {describeValue(change.from)} → {describeValue(change.to)}
                </li>
              ))}
            </ul>
          )}
          {entry.reason && <p className="mt-0.5 text-[11px] text-gray-body">&ldquo;{entry.reason}&rdquo;</p>}
        </li>
      ))}
    </ul>
  );
}

/** A quiet confirmation that an action landed. */
export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-blue-ink px-4 py-2 text-xs font-bold text-white shadow-lg"
    >
      {message}
    </div>
  );
}
