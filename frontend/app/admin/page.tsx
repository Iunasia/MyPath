"use client";

import Link from "next/link";
import {
  fetchScholarships,
  fetchVerificationQueue,
  type ApiScholarship,
  type ApiVerificationRequest,
} from "@/app/lib/api";
import {
  daysFromToday,
  ErrorBox,
  formatAge,
  formatDate,
  hostOf,
  Loading,
  PHNOM_PENH,
  relativeDays,
  RISK_TAG,
  Tag,
  useAdminLoad,
  waitedMoreThan,
} from "./ui";

/* ── Needs attention ──────────────────────────────────────
   The admin home. Everything here is something a person can act on today;
   totals that don't lead anywhere were left out on purpose. */

const load = () => Promise.all([fetchVerificationQueue(), fetchScholarships()]);

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function Box({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-sky/20 bg-white overflow-hidden">
      <header className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-sky/20">
        <h2 className="text-sm font-extrabold">{title}</h2>
        {meta && <span className="text-xs text-gray-soft">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-5 text-sm text-gray-soft">{children}</p>;
}

function RequestRow({ request }: { request: ApiVerificationRequest }) {
  const age = formatAge(request.created_at);
  const waitingLong = waitedMoreThan(request.created_at, 24);
  const risk = request.auto_check ? RISK_TAG[request.auto_check.level] : null;
  const where = request.submitted_url
    ? hostOf(request.submitted_url)
    : request.scholarship_id
      ? `About listing #${request.scholarship_id}`
      : "No link given";

  return (
    <li className="grid grid-cols-[56px_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-2.5 border-b border-sky/10 last:border-b-0">
      <span className={`font-mono text-xs ${waitingLong ? "text-rose-700 font-bold" : "text-gray-soft"}`}>{age}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate">{request.submitted_title}</p>
        <p className="text-xs text-gray-soft truncate">
          {where} · {request.status === "reviewing" ? "being reviewed" : (request.submitted_by_name ?? "deleted account")}
        </p>
      </div>
      {risk ? <Tag tone={risk.tone}>{risk.label}</Tag> : <span />}
      <Link
        href={`/admin/requests#request-${request.id}`}
        className="rounded-md bg-sky-deep px-3 py-1 text-xs font-bold text-white hover:opacity-90"
      >
        Answer
      </Link>
    </li>
  );
}

function ScholarshipLine({ s, right }: { s: ApiScholarship; right: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-sky/10 last:border-b-0">
      <Link href={`/scholarships/${s.id}`} className="min-w-0 group">
        <p className="text-sm font-bold truncate group-hover:text-sky-deep">{s.title}</p>
        <p className="text-xs text-gray-soft truncate">{s.provider}</p>
      </Link>
      <span className="shrink-0 text-xs text-right">{right}</span>
    </li>
  );
}

export default function NeedsAttentionPage() {
  const { data, error, loading, reload } = useAdminLoad(load);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error} onRetry={reload} />;

  const [requests, scholarships] = data;

  const open = requests
    .filter((r) => r.status !== "resolved")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  const dated = scholarships
    .filter((s): s is ApiScholarship & { deadline: string } => Boolean(s.deadline))
    .map((s) => ({ s, days: daysFromToday(s.deadline) }));
  const expired = dated.filter((x) => x.days < 0).sort((a, b) => a.days - b.days);
  const soon = dated.filter((x) => x.days >= 0 && x.days <= 14).sort((a, b) => a.days - b.days);
  const urgent = soon.filter((x) => x.days <= 1);

  const checkedByPerson = scholarships.filter((s) => s.last_verified).length;
  const flagged = scholarships.filter((s) => s.infoCheck.isRisky);
  const undated = scholarships.filter((s) => !s.deadline);

  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: PHNOM_PENH,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const summary: React.ReactNode[] = [];
  if (open.length) summary.push(<Link key="o" href="/admin/requests">{plural(open.length, "student")}</Link>);
  if (expired.length)
    summary.push(
      <Link key="e" href="/admin/scholarships?filter=passed">
        {plural(expired.length, "closed scholarship")}
      </Link>
    );
  if (urgent.length)
    summary.push(
      <Link key="u" href="/admin/scholarships?filter=soon">
        {plural(urgent.length, "deadline")}
      </Link>
    );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
        <h1 className="text-xl font-extrabold tracking-tight">Needs attention</h1>
        <span className="text-sm text-gray-soft">{today}</span>
      </div>
      <p className="text-sm text-gray-body mb-6 [&_a]:font-bold [&_a]:text-blue-ink [&_a]:underline [&_a]:decoration-sky [&_a]:underline-offset-4">
        {summary.length === 0 ? (
          "Nothing needs you right now."
        ) : (
          <>
            {open.length > 0 && <>{summary.shift()} waiting for an answer{summary.length ? ", " : "."} </>}
            {expired.length > 0 && <>{summary.shift()} still shown to students{summary.length ? ", and " : "."} </>}
            {urgent.length > 0 && <>{summary.shift()} today or tomorrow.</>}
          </>
        )}
      </p>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] items-start">
        <div className="grid gap-5 min-w-0">
          <Box title="Students waiting for an answer" meta="Oldest first">
            {open.length ? (
              <ul>
                {open.map((r) => (
                  <RequestRow key={r.id} request={r} />
                ))}
              </ul>
            ) : (
              <Empty>No one is waiting. New requests also arrive in the team&apos;s Telegram group.</Empty>
            )}
          </Box>

          <Box title="Deadline passed, still listed" meta="Students can still see these">
            {expired.length ? (
              <>
                <ul>
                  {expired.map(({ s, days }) => (
                    <ScholarshipLine
                      key={s.id}
                      s={s}
                      right={
                        <>
                          <span className="font-mono">{formatDate(s.deadline!)}</span>{" "}
                          <span className="text-rose-700 font-bold">{relativeDays(days)}</span>
                        </>
                      }
                    />
                  ))}
                </ul>
                <p className="px-4 py-2.5 text-xs text-gray-soft bg-powder/50 border-t border-sky/10">
                  Update the date or remove the row in the scholarship sheet, then re-seed.
                </p>
              </>
            ) : (
              <Empty>Every dated listing is still open.</Empty>
            )}
          </Box>
        </div>

        <div className="grid gap-5 min-w-0">
          <Box title="Closing soon" meta="Next 14 days">
            {soon.length ? (
              <ul>
                {soon.map(({ s, days }) => (
                  <ScholarshipLine
                    key={s.id}
                    s={s}
                    right={
                      <>
                        <span className="font-mono">{formatDate(s.deadline!)}</span>{" "}
                        <span className={days <= 1 ? "text-amber-700 font-bold" : "text-gray-soft"}>
                          {relativeDays(days)}
                        </span>
                      </>
                    }
                  />
                ))}
              </ul>
            ) : (
              <Empty>Nothing closes in the next two weeks.</Empty>
            )}
          </Box>

          <Box title="Checked by a person">
            <div className="px-4 py-3 border-b border-sky/10">
              <p className="text-sm">
                <span className="text-2xl font-extrabold">{checkedByPerson}</span>{" "}
                <span className="text-gray-soft">of {scholarships.length} scholarships</span>
              </p>
              <div className="h-1.5 rounded bg-sitomo mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${scholarships.length ? (checkedByPerson / scholarships.length) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-soft mt-2">
                &ldquo;Verified&rdquo; on the public site means the link passed automated checks. Mark a listing
                checked once you&apos;ve confirmed it on the provider&apos;s own page.
              </p>
              <Link
                href="/admin/scholarships?filter=unchecked"
                className="inline-block mt-2 text-xs font-bold text-sky-deep hover:underline"
              >
                Start checking →
              </Link>
            </div>
            <ul>
              {flagged.map((s) => (
                <ScholarshipLine key={s.id} s={s} right={<Tag tone="red">Flagged</Tag>} />
              ))}
              {undated.length > 0 && (
                <li className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-bold">{plural(undated.length, "scholarship")}</p>
                    <p className="text-xs text-gray-soft">Deadline not announced</p>
                  </div>
                  <Link
                    href="/admin/scholarships?filter=undated"
                    className="rounded-md border border-sky/35 px-2.5 py-1 text-xs font-bold hover:bg-powder/70"
                  >
                    View
                  </Link>
                </li>
              )}
            </ul>
          </Box>
        </div>
      </div>
    </>
  );
}
