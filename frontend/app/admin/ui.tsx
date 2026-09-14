"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
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
  neutral: "border border-sky/20 text-gray-body bg-white",
  red: "bg-rose-50 text-rose-700 border border-rose-200",
  amber: "bg-amber-50 text-amber-800 border border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  accent: "bg-sky/15 text-sky-deep border border-sky/25",
} as const;

export function Tag({ tone = "neutral", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${TONES[tone]}`}
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
  "inline-flex items-center gap-1.5 rounded-full bg-sky-deep px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-dark transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default";
export const btnSecondary =
  "inline-flex items-center gap-1.5 rounded-full border border-sky/30 px-3.5 py-1.5 text-xs font-bold text-gray-body hover:bg-powder transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default";
export const btnGhost =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-gray-soft hover:bg-powder hover:text-blue-ink transition-colors cursor-pointer";

export const inputClass =
  "rounded-lg border border-sky/25 bg-white px-3 py-1.5 text-sm text-blue-ink placeholder:text-gray-soft focus:outline-none focus:ring-2 focus:ring-sky/40";

export const tableClass = "w-full text-sm bg-white border border-sky/15 rounded-2xl overflow-hidden";
export const thClass =
  "text-left text-xs font-bold text-gray-soft bg-powder/50 px-3 py-2.5 border-b border-sky/15 whitespace-nowrap";
export const tdClass = "px-3 py-2.5 border-b border-sky/10 align-top";

export const textareaClass =
  "w-full rounded-lg border border-sky/25 bg-white px-3 py-2 text-sm text-blue-ink placeholder:text-gray-soft focus:outline-none focus:ring-2 focus:ring-sky/40 resize-y";
export const selectClass = `${inputClass} pr-8`;

/* ── Form + overlay primitives ─────────────────────────── */

/** Label + control + inline message, so forms read the same everywhere. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 block text-xs font-bold text-gray-body">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-rose-700">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-[11px] text-gray-soft">{hint}</span>
      )}
    </label>
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
  placeholder = "Type to search…",
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
    <div className="rounded-lg border border-sky/25 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-sky/40">
      {value.length > 0 && (
        <ul className="mb-1 flex flex-wrap gap-1">
          {value.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => remove(item)}
                className="inline-flex items-center gap-1 rounded-full bg-sky/15 px-2 py-0.5 text-[11px] font-bold text-sky-deep hover:bg-sky/25 cursor-pointer"
              >
                {item}
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {item}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Enter takes the top suggestion when there is one, else the typed value.
            e.preventDefault();
            add(suggestions[0] ?? (allowCustom ? draft : ""));
          }
          if (e.key === "Backspace" && !draft && value.length > 0) remove(value[value.length - 1]);
        }}
        onBlur={() => {
          if (allowCustom && draft.trim()) add(draft);
          else if (suggestions[0]) add(suggestions[0]);
        }}
        placeholder={placeholder}
        className="w-full bg-transparent px-1 py-0.5 text-sm text-blue-ink placeholder:text-gray-soft focus:outline-none"
      />

      {suggestions.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => add(suggestion)}
                className="rounded-full border border-sky/25 px-2 py-0.5 text-[11px] font-semibold text-gray-body hover:bg-powder cursor-pointer"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const btnDanger =
  "inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default";

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
