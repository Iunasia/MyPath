"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { fetchScholarships, markScholarshipChecked, type ApiScholarship } from "@/app/lib/api";
import {
  daysFromToday,
  ErrorBox,
  formatDate,
  hostOf,
  inputClass,
  Loading,
  PageHeader,
  relativeDays,
  Segments,
  tableClass,
  Tag,
  tdClass,
  thClass,
  useAdminLoad,
} from "../ui";

type Filter = "all" | "passed" | "soon" | "undated" | "flagged" | "unchecked";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "passed", label: "Deadline passed" },
  { value: "soon", label: "Closing ≤ 14 days" },
  { value: "undated", label: "No deadline" },
  { value: "flagged", label: "Flagged" },
  { value: "unchecked", label: "Never checked" },
];

const isFilter = (value: string | null): value is Filter => FILTERS.some((f) => f.value === value);

const matches = (s: ApiScholarship, filter: Filter) => {
  const days = s.deadline ? daysFromToday(s.deadline) : null;
  switch (filter) {
    case "passed":
      return days !== null && days < 0;
    case "soon":
      return days !== null && days >= 0 && days <= 14;
    case "undated":
      return days === null;
    case "flagged":
      return s.infoCheck.isRisky;
    case "unchecked":
      return !s.last_verified;
    default:
      return true;
  }
};

const SOURCE_LABEL: Record<string, string> = {
  official: "official",
  organisation: "organisation",
  news: "news",
  social_media: "social media",
  unknown: "unknown",
};

function DeadlineCell({ s }: { s: ApiScholarship }) {
  if (!s.deadline) return <span className="text-gray-soft">{s.deadline_note || "Not announced"}</span>;
  const days = daysFromToday(s.deadline);
  return (
    <>
      <div className="font-mono text-xs">{formatDate(s.deadline)}</div>
      <div
        className={`text-xs ${days < 0 ? "text-rose-700 font-bold" : days <= 14 ? "text-amber-700 font-bold" : "text-gray-soft"}`}
      >
        {days < 0 ? "passed" : relativeDays(days)}
      </div>
    </>
  );
}

function Detail({
  s,
  onChecked,
}: {
  s: ApiScholarship;
  onChecked: (updated: ApiScholarship) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checkedToday = s.last_verified ? daysFromToday(s.last_verified) === 0 : false;

  const markChecked = async () => {
    setBusy(true);
    setError("");
    try {
      const { scholarship, infoCheck } = await markScholarshipChecked(s.id);
      onChecked({ ...scholarship, infoCheck });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="rounded-lg border border-sky/20 bg-white xl:sticky xl:top-6" aria-label="Scholarship detail">
      <header className="px-4 pt-4 pb-3 border-b border-sky/20">
        <p className="font-mono text-xs text-gray-soft">#{s.id}</p>
        <h2 className="text-base font-extrabold leading-snug mt-0.5">{s.title}</h2>
        <p className="text-xs text-gray-soft mt-0.5">{s.provider}</p>
      </header>

      <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 px-4 py-3 text-sm border-b border-sky/20">
        <dt className="text-gray-soft">Deadline</dt>
        <dd>
          {s.deadline ? (
            <>
              {formatDate(s.deadline, true)}{" "}
              {daysFromToday(s.deadline) < 0 && <span className="text-rose-700 font-bold">· passed</span>}
            </>
          ) : (
            <span className="text-gray-soft">{s.deadline_note || "Not announced"}</span>
          )}
        </dd>
        <dt className="text-gray-soft">Status</dt>
        <dd>{s.infoCheck.isRisky ? <Tag tone="red">Flagged</Tag> : <Tag tone="green">Auto-checked</Tag>}</dd>
        <dt className="text-gray-soft">Source</dt>
        <dd className="min-w-0">
          <span className="font-mono text-xs break-all">{hostOf(s.source_url) || "none"}</span>{" "}
          <Tag>{SOURCE_LABEL[s.source_type] ?? s.source_type}</Tag>
        </dd>
        <dt className="text-gray-soft">Checked</dt>
        <dd>
          {s.last_verified ? (
            <span className="text-emerald-700 font-bold">{formatDate(s.last_verified, true)}</span>
          ) : (
            <span className="text-gray-soft">Never by a person</span>
          )}
        </dd>
      </dl>

      {s.infoCheck.reasons.length > 0 && (
        <ul className="mx-4 mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-800 space-y-1">
          {s.infoCheck.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 px-4 py-3">
        <button
          type="button"
          onClick={markChecked}
          disabled={busy || checkedToday}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-deep px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {checkedToday ? "Checked today" : "Mark checked by me"}
        </button>
        {s.source_url && (
          <a
            href={s.source_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 rounded-md border border-sky/35 px-3 py-1.5 text-xs font-bold hover:bg-powder/70"
          >
            Open source <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <Link
          href={`/scholarships/${s.id}`}
          className="inline-flex items-center rounded-md px-2 py-1.5 text-xs font-bold text-gray-soft hover:text-blue-ink"
        >
          Public page
        </Link>
      </div>
      {error && <p className="px-4 pb-2 text-xs text-rose-700 font-medium">{error}</p>}

      <p className="px-4 py-3 border-t border-sky/20 text-xs text-gray-soft">
        Open the provider&apos;s own page and confirm the deadline and award before marking it checked. Students
        see the date as &ldquo;Last verified&rdquo;.
      </p>
    </aside>
  );
}

function ScholarshipsAdmin() {
  const params = useSearchParams();
  const requested = params.get("filter");
  const [filter, setFilter] = useState<Filter>(isFilter(requested) ? requested : "all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, setData, error, loading, reload } = useAdminLoad(fetchScholarships);

  const scholarships = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter(
      (s) =>
        matches(s, filter) &&
        (!q || [s.title, s.provider, hostOf(s.source_url)].some((field) => field.toLowerCase().includes(q)))
    );
  }, [scholarships, filter, query]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error} onRetry={reload} />;

  const selected = scholarships.find((s) => s.id === selectedId) ?? visible[0] ?? null;

  const onChecked = (updated: ApiScholarship) =>
    setData((prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? prev);

  return (
    <>
      <PageHeader
        title="Scholarships"
        aside="Read-only listing data · edit the scholarship sheet and re-seed to change it"
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, provider or domain"
          className={`${inputClass} w-64`}
          aria-label="Search scholarships"
        />
        <Segments
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: scholarships.filter((s) => matches(s, f.value)).length }))}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} w-10`}>#</th>
                <th className={thClass}>Scholarship</th>
                <th className={`${thClass} w-28`}>Deadline</th>
                <th className={`${thClass} w-28`}>Status</th>
                <th className={`${thClass} w-40`}>Source</th>
                <th className={`${thClass} w-24`}>Checked</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`cursor-pointer ${selected?.id === s.id ? "bg-sky/10" : "hover:bg-powder/70"}`}
                  aria-selected={selected?.id === s.id}
                >
                  <td className={`${tdClass} font-mono text-xs text-gray-soft`}>{s.id}</td>
                  <td className={`${tdClass} max-w-0`}>
                    <p className="font-bold truncate">{s.title}</p>
                    <p className="text-xs text-gray-soft truncate">{s.provider}</p>
                  </td>
                  <td className={tdClass}>
                    <DeadlineCell s={s} />
                  </td>
                  <td className={tdClass}>
                    {s.infoCheck.isRisky ? <Tag tone="red">Flagged</Tag> : <Tag tone="green">Auto-checked</Tag>}
                  </td>
                  <td className={`${tdClass} max-w-0`}>
                    <p className="font-mono text-xs truncate">{hostOf(s.source_url) || "—"}</p>
                    <p className="text-xs text-gray-soft">{SOURCE_LABEL[s.source_type] ?? s.source_type}</p>
                  </td>
                  <td className={`${tdClass} text-xs`}>
                    {s.last_verified ? (
                      <span className="text-emerald-700 font-bold">{formatDate(s.last_verified)}</span>
                    ) : (
                      <span className="text-gray-soft">Never</span>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-soft">
                    Nothing matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && <Detail key={selected.id} s={selected} onChecked={onChecked} />}
      </div>
    </>
  );
}

/** useSearchParams needs a Suspense boundary on a prerendered route. */
export default function AdminScholarshipsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ScholarshipsAdmin />
    </Suspense>
  );
}
