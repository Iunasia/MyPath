"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import {
  fetchVerificationQueue,
  reviewVerificationRequest,
  type ApiVerificationRequest,
  type RequestStatus,
  type Verdict,
} from "@/app/lib/api";
import { formatAge, formatDate as formatDay, PageHeader, Segments } from "../ui";

const VERDICTS: Array<{ value: Verdict; label: string; cls: string }> = [
  { value: "legitimate", label: "Legitimate", cls: "bg-emerald-600 hover:bg-emerald-700" },
  { value: "scam", label: "Scam", cls: "bg-rose-600 hover:bg-rose-700" },
  { value: "outdated", label: "Out of date", cls: "bg-amber-600 hover:bg-amber-700" },
  { value: "unverifiable", label: "Can't verify", cls: "bg-gray-body hover:bg-blue-ink" },
];

const RISK_CLS: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  caution: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** "10 Sep, 12:12" — the shared day format ("Sept" from Intl otherwise), plus the time. */
const formatDate = (iso: string) =>
  `${formatDay(iso)}, ${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Phnom_Penh",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))}`;

/* ── One request in the queue ──────────────────────────── */

function RequestCard({
  request,
  onReviewed,
}: {
  request: ApiVerificationRequest;
  onReviewed: () => void;
}) {
  const [response, setResponse] = useState(request.admin_response ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const check = request.auto_check;

  const submit = async (status: RequestStatus, verdict?: Verdict) => {
    setBusy(true);
    setError("");
    try {
      await reviewVerificationRequest(request.id, { status, verdict, response });
      onReviewed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      id={`request-${request.id}`}
      className="scroll-mt-6 bg-white rounded-lg border border-sky/20 p-5 target:ring-2 target:ring-sky"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h3 className="font-bold text-blue-ink leading-snug min-w-0">
          <span className="font-mono text-xs text-gray-soft mr-1.5">#{request.id}</span>
          {request.submitted_title}
        </h3>
        <span
          className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
            request.status === "pending"
              ? "bg-sky/15 text-sky-deep"
              : request.status === "reviewing"
                ? "bg-amber-100 text-amber-800"
                : "bg-sitomo text-gray-body"
          }`}
        >
          {request.status}
        </span>
      </div>

      <p className="text-xs text-gray-soft mb-3">
        From {request.submitted_by_name ?? "a deleted account"}
        {request.submitted_by_email && ` (${request.submitted_by_email})`} · {formatDate(request.created_at)}
        {request.status !== "resolved" && (
          <span className="font-bold text-gray-body"> · waiting {formatAge(request.created_at)}</span>
        )}
        {request.scholarship_id && (
          <>
            {" · "}
            <a href={`/scholarships/${request.scholarship_id}`} className="font-bold text-sky-deep hover:underline">
              about listing #{request.scholarship_id}
            </a>
          </>
        )}
      </p>

      {request.submitted_url && (
        <a
          href={request.submitted_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-deep hover:underline mb-3 break-all"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-full">{request.submitted_url}</span>
        </a>
      )}

      {request.note && (
        <div className="rounded-md bg-powder/50 border border-sky/10 px-3.5 py-2.5 mb-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-soft mb-1">They said</p>
          <p className="text-sm text-gray-body">{request.note}</p>
        </div>
      )}

      {check && (
        <div className={`rounded-md border px-3.5 py-2.5 mb-4 ${RISK_CLS[check.level] ?? RISK_CLS.low}`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {check.level === "low" ? (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0" />
            )}
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Auto-check: {check.level} ({check.score}/100)
            </span>
          </div>
          {check.findings.map((finding, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{finding}</span>
            </p>
          ))}
          {check.findings.length === 0 && <p className="text-xs font-medium">No automatic warning signs.</p>}
        </div>
      )}

      {request.status === "resolved" ? (
        <div className="rounded-md bg-powder/50 border border-sky/10 px-3.5 py-2.5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-soft mb-1">
            Answered — {request.verdict}
          </p>
          <p className="text-sm text-gray-body">{request.admin_response}</p>
          {request.reviewed_by_name && <p className="text-[11px] text-gray-soft mt-1.5">by {request.reviewed_by_name}</p>}
          {!request.user_id && (
            <p className="text-[11px] text-amber-800 mt-1.5">
              The account that asked has been deleted, so nobody will read this answer.
            </p>
          )}
        </div>
      ) : (
        <>
          <label
            htmlFor={`r-${request.id}`}
            className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-soft mb-1.5"
          >
            Your reply to the student
          </label>
          <textarea
            id={`r-${request.id}`}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={3}
            placeholder="Explain what you found, and what they should do."
            className="w-full px-3.5 py-2.5 rounded-md border border-sky/35 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40 resize-none mb-3"
          />

          {request.scholarship_id && (
            <p className="text-[11px] text-gray-soft mb-2">
              Answering <strong>Legitimate</strong> also marks listing #{request.scholarship_id} as checked by you
              today.
            </p>
          )}
          {error && <p className="text-xs text-rose-600 font-medium mb-2">{error}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {VERDICTS.map((v) => (
              <button
                key={v.value}
                onClick={() => submit("resolved", v.value)}
                disabled={busy}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold text-white transition-colors disabled:opacity-50 cursor-pointer ${v.cls}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {v.label}
              </button>
            ))}

            {request.status === "pending" && (
              <button
                onClick={() => submit("reviewing")}
                disabled={busy}
                className="px-3.5 py-2 rounded-md text-xs font-bold text-gray-body border border-sky/35 hover:bg-powder/70 transition-colors disabled:opacity-50 cursor-pointer"
              >
                I&apos;m looking at this
              </button>
            )}

            {busy && <Loader2 className="w-4 h-4 animate-spin text-gray-soft" />}
          </div>
        </>
      )}
    </article>
  );
}

/* ── Page ──────────────────────────────────────────────── */

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ApiVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  const load = useCallback(async () => {
    try {
      setRequests(await fetchVerificationQueue(filter === "all" ? undefined : filter));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the queue");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // Wrapped so neither state update runs synchronously inside the effect,
    // which would cascade renders.
    void (async () => {
      setLoading(true);
      await load();
    })();
  }, [load]);

  // Links from "Needs attention" point at #request-12 — the cards load after
  // the browser's own jump to the anchor, so jump again once they're here.
  useEffect(() => {
    if (!loading && window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
    }
  }, [loading]);

  const waiting = requests.filter((r) => r.status !== "resolved").length;

  return (
    <>
      <PageHeader
        title="Verification requests"
        description={
          <>
            Students asking whether a scholarship is real.
            {waiting > 0 && <span className="font-bold text-blue-ink"> {waiting} waiting.</span>}
          </>
        }
      />

      <div className="mb-5">
        <Segments
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "reviewing", label: "Reviewing" },
            { value: "resolved", label: "Resolved" },
          ]}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center text-gray-soft">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Loading…</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg border border-rose-200 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="font-bold text-blue-ink">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg border border-sky/20 p-10 text-center">
          <Inbox className="w-10 h-10 text-gray-faint mx-auto mb-3" />
          <p className="font-bold text-blue-ink">Nothing here</p>
          <p className="text-sm text-gray-soft mt-1">
            {filter === "all" ? "No student has asked us to check anything yet." : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} onReviewed={load} />
          ))}
        </div>
      )}
    </>
  );
}
