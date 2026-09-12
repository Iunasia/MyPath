import Link from "next/link";
import { AlertTriangle, ArrowLeft, Info, Plus } from "lucide-react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { getComparison } from "@/app/lib/api.server";
import { plainCategory } from "@/app/lib/catalogAdapters";
import type { ApiCompareItem, ApiCompareRow, CompareType } from "@/app/lib/api";
import CompareEmpty from "./CompareEmpty";
import CompareSync from "./CompareSync";
import RemoveLink from "./RemoveLink";

/* ── Compare (MVP #5) ─────────────────────────────────────
   Rendered on the server from GET /compare. The URL is the state —
   `?type=scholarship&ids=1,2,26&diff=1` — so a comparison can be shared,
   and removing a column or hiding identical rows is just a link. */

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const NOUN: Record<CompareType, [string, string]> = {
  scholarship: ["scholarship", "scholarships"],
  university: ["university", "universities"],
  major: ["major", "majors"],
  career: ["career", "careers"],
};

const LIST_PAGE: Record<CompareType, string> = {
  scholarship: "/scholarships",
  university: "/universities",
  major: "/majors/all",
  career: "/careers",
};

const detailHref = (type: CompareType, id: number) =>
  `${type === "university" ? "/universities" : `/${type}s`}/${id}`;

const LABEL: Record<string, string> = {
  official: "Official site",
  organisation: "Provider's own site",
  news: "News article",
  social_media: "Social media post",
  unknown: "Unknown",
  verified: "Passed automated checks",
  unverified: "Not checked",
  scholarship: "Scholarship",
  exchange: "Exchange",
  internship: "Internship",
};

const PHNOM_PENH = "Asia/Phnom_Penh";
const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: PHNOM_PENH, day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );

/** Whole days until a deadline. Outside the components so rendering stays pure. */
const daysLeft = (iso: string) => Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000);

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const norm = (value: string) => value.trim().toLowerCase();

const NOT_STATED = <span className="italic font-semibold text-amber-700">Not stated</span>;

/** One cell. `kind` says how the API shaped the value. */
function Value({ row, value }: { row: ApiCompareRow; value: unknown }) {
  switch (row.kind) {
    case "list": {
      const list = Array.isArray(value) ? value.map(String) : [];
      if (row.key === "safety_warnings") {
        if (list.length === 0) return <span className="text-gray-soft">None</span>;
        return (
          <ul className="space-y-1.5">
            {list.map((warning) => (
              <li key={warning} className="flex items-start gap-1.5 font-semibold text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (list.length === 0) return NOT_STATED;
      const shared = new Set((row.common ?? []).map(norm));
      return (
        <div className="flex flex-wrap gap-1.5">
          {list.map((entry) => (
            <span
              key={entry}
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                shared.has(norm(entry))
                  ? "bg-sky-deep text-white border-sky"
                  : "bg-sitomo/70 text-blue-ink border-sky/10"
              }`}
            >
              {entry}
            </span>
          ))}
        </div>
      );
    }

    case "deadline": {
      const deadline = value as { date: string | null; note: string | null } | null;
      if (deadline?.date) {
        const days = daysLeft(deadline.date);
        return (
          <div>
            <div className="font-bold">{formatDay(deadline.date)}</div>
            <div
              className={`text-xs font-bold ${
                days < 0 ? "text-rose-700" : days <= 14 ? "text-amber-700" : "text-gray-soft"
              }`}
            >
              {days < 0 ? "Closed" : days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
            </div>
          </div>
        );
      }
      if (deadline?.note) return <span className="font-semibold text-amber-700">{deadline.note}</span>;
      return NOT_STATED;
    }

    case "date":
      if (typeof value === "string") return <>{formatDay(value)}</>;
      return row.key === "last_verified" ? (
        <span className="italic text-gray-soft">Never checked by a person</span>
      ) : (
        NOT_STATED
      );

    case "url":
      if (typeof value !== "string" || !value) return NOT_STATED;
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-bold text-sky-deep hover:underline break-all"
        >
          {hostOf(value)} ↗
        </a>
      );

    case "number":
      return typeof value === "number" ? <>{value}</> : NOT_STATED;

    default: {
      if (typeof value !== "string" || !value.trim()) return NOT_STATED;
      if (row.key === "verified_status" && value === "flagged") {
        return <span className="font-bold text-amber-800">Flagged</span>;
      }
      if (LABEL[value] && (row.group === "Trust" || row.key === "opportunity_type")) return <>{LABEL[value]}</>;
      if (row.key === "category" || row.key === "field") return <>{plainCategory(value)}</>;
      return <span className="whitespace-pre-line">{value}</span>;
    }
  }
}

function TrustBadge({ item }: { item: ApiCompareItem }) {
  const check = item.infoCheck;
  if (!check) return null;
  if (check.isRisky) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-momo px-2.5 py-1 text-[11px] font-extrabold text-amber-800">
        <AlertTriangle className="w-3 h-3" />
        Check this source
      </span>
    );
  }
  if (check.sourceType === "official") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Official source
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-sitomo px-2.5 py-1 text-[11px] font-extrabold text-sky-deep">
      {LABEL[check.sourceType] ?? check.sourceType}
    </span>
  );
}

async function Comparison({ type, ids, onlyDifferences }: { type: string; ids: string; onlyDifferences: boolean }) {
  const result = await getComparison(type, ids);

  if (!result.ok) {
    return (
      <section className="bg-white rounded-3xl border border-sky/15 bubble-shadow-sm p-8 text-center max-w-xl mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="font-display text-xl font-extrabold mb-1">We couldn&apos;t compare those</h1>
        <p className="text-sm text-gray-body mb-5">{result.error}</p>
        <Link
          href="/compare"
          className="inline-flex items-center rounded-full bg-sky-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark transition-colors"
        >
          Start a new comparison
        </Link>
      </section>
    );
  }

  const c = result.comparison;
  const [one, many] = NOUN[c.type];
  const allIds = c.items.map((i) => i.id);

  const hrefFor = (list: number[], diff: boolean) =>
    list.length >= 2 ? `/compare?type=${c.type}&ids=${list.join(",")}${diff ? "&diff=1" : ""}` : "/compare";

  const visible = onlyDifferences ? c.rows.filter((r) => r.differs) : c.rows;
  const groups: { name: string; rows: ApiCompareRow[] }[] = [];
  for (const row of visible) {
    const last = groups[groups.length - 1];
    if (last && last.name === row.group) last.rows.push(row);
    else groups.push({ name: row.group, rows: [row] });
  }

  const withSlot = c.items.length < 4;
  const columns = `minmax(130px, 170px) repeat(${c.items.length}, minmax(210px, 1fr))${withSlot ? " minmax(150px, 190px)" : ""}`;
  const warnings = c.notes.filter((n) => n.level === "warning");
  const info = c.notes.filter((n) => n.level === "info");

  return (
    <>
      <CompareSync
        items={c.items.map((i) => ({ type: c.type, apiId: i.id, title: i.title, subtitle: i.subtitle ?? undefined }))}
      />

      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href={LIST_PAGE[c.type]}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-soft hover:text-blue-ink mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {many}
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Compare {many}</h1>
          <p className="text-sm text-gray-body font-medium mt-1 max-w-2xl">
            Side by side, with where each piece of information came from. Highlighted rows are where they differ.
          </p>
        </div>
        <Link
          href={hrefFor(allIds, !onlyDifferences)}
          className={`inline-flex items-center gap-2 self-start sm:self-auto rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
            onlyDifferences
              ? "bg-sky-deep text-white border-sky"
              : "bg-white text-sky-deep border-sky/30 hover:border-sky"
          }`}
          aria-pressed={onlyDifferences}
        >
          <span
            className={`w-7 h-4 rounded-full relative ${onlyDifferences ? "bg-white/40" : "bg-sky/25"}`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow ${onlyDifferences ? "right-0.5" : "left-0.5"}`}
            />
          </span>
          Only show differences
        </Link>
      </section>

      {c.notes.length > 0 && (
        <section className="bg-white rounded-3xl border border-sky/15 bubble-shadow-sm p-5 sm:p-6">
          <h2 className="font-display text-base font-extrabold mb-3">Before you decide</h2>
          <ul className="space-y-2">
            {warnings.map((note, i) => (
              <li key={`w${i}`} className="flex items-start gap-2.5 text-sm font-semibold text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{note.text}</span>
              </li>
            ))}
            {info.map((note, i) => (
              <li key={`i${i}`} className="flex items-start gap-2.5 text-sm font-medium text-gray-body">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-deep" />
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="overflow-x-auto -mx-[25px] px-[25px] sm:mx-0 sm:px-0" aria-label={`Comparison of ${many}`}>
        <div
          className="grid bg-white rounded-3xl border border-sky/15 bubble-shadow-sm overflow-hidden min-w-fit"
          style={{ gridTemplateColumns: columns }}
          role="table"
        >
          {/* Column headings */}
          <div className="p-4 border-b-2 border-sky/20 flex items-end text-xs font-bold text-gray-soft" role="columnheader">
            {c.items.length} of 4
          </div>
          {c.items.map((item) => (
            <div key={item.id} className="relative p-4 border-b-2 border-sky/20 border-l border-l-sky/10" role="columnheader">
              <RemoveLink
                href={hrefFor(allIds.filter((id) => id !== item.id), onlyDifferences)}
                type={c.type}
                apiId={item.id}
                title={item.title}
              />
              <Link
                href={detailHref(c.type, item.id)}
                className="block font-display text-base font-extrabold leading-snug pr-7 hover:text-sky-deep transition-colors"
              >
                {item.title}
              </Link>
              {item.subtitle && (
                <p className="text-xs text-gray-soft font-semibold mt-1">{plainCategory(item.subtitle)}</p>
              )}
              <div className="mt-2.5">
                <TrustBadge item={item} />
              </div>
            </div>
          ))}
          {withSlot && (
            <div className="p-3 border-b-2 border-sky/20 border-l border-l-sky/10 flex" role="columnheader">
              <Link
                href={LIST_PAGE[c.type]}
                className="flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-sky/30 text-sky-deep hover:border-sky hover:bg-sitomo/40 transition-colors p-3 text-center"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-bold">Add a {one}</span>
              </Link>
            </div>
          )}

          {groups.length === 0 && (
            <div className="p-6 text-sm text-gray-body font-medium" style={{ gridColumn: "1 / -1" }}>
              These {many} say the same thing on every row.
            </div>
          )}

          {groups.map((group) => (
            <div key={group.name} className="contents" role="rowgroup">
              <div
                className="px-4 pt-5 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-sky-deep bg-powder/40 border-b border-sky/10"
                style={{ gridColumn: "1 / -1" }}
              >
                {group.name}
              </div>
              {group.rows.map((row) => (
                <div key={row.key} className="contents" role="row">
                  <div
                    className={`p-4 border-b border-sky/10 text-xs ${
                      row.differs ? "font-extrabold text-blue-ink shadow-[inset_3px_0_0_var(--sky)]" : "font-bold text-gray-soft"
                    }`}
                    role="rowheader"
                  >
                    {row.label}
                    {row.common && row.common.length > 0 && (
                      <span className="block mt-1 text-[11px] font-bold text-sky-deep">
                        {row.common.length} in common
                      </span>
                    )}
                  </div>
                  {row.values.map((value, i) => (
                    <div
                      key={i}
                      className={`p-4 border-b border-sky/10 border-l border-l-sky/10 text-sm ${
                        row.differs ? "text-blue-ink" : "text-gray-body"
                      }`}
                      role="cell"
                    >
                      <Value row={row} value={value} />
                    </div>
                  ))}
                  {withSlot && <div className="border-b border-sky/10 border-l border-l-sky/10" role="cell" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-soft font-medium">
        Facts come from each provider&apos;s listing in Domner. &ldquo;Not stated&rdquo; means the source doesn&apos;t
        say — ask before you rely on it.
      </p>
    </>
  );
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const type = one(params.type);
  const ids = one(params.ids);
  const onlyDifferences = one(params.diff) === "1";

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <Header backHref="/" backLabel="DOMNER" activeNav="compare" />
        <main className="w-full pb-24 flex flex-col gap-6">
          {type && ids ? (
            <Comparison type={type} ids={ids} onlyDifferences={onlyDifferences} />
          ) : (
            <CompareEmpty />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
