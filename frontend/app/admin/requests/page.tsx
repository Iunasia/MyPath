"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import RequireAdmin from "@/app/components/RequireAdmin";
import {
  fetchVerificationQueue,
  reviewVerificationRequest,
  type ApiVerificationRequest,
  type RequestStatus,
  type Verdict,
} from "@/app/lib/api";

const VERDICTS: Array<{ value: Verdict; label: string; cls: string }> = [
  { value: "legitimate", label: "Legitimate", cls: "bg-emerald-600 hover:bg-emerald-700" },
  { value: "scam", label: "Scam", cls: "bg-rose-600 hover:bg-rose-700" },
  { value: "outdated", label: "Out of date", cls: "bg-amber-600 hover:bg-amber-700" },
  { value: "unverifiable", label: "Can't verify", cls: "bg-slate-600 hover:bg-slate-700" },
];

const RISK_CLS: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  caution: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Phnom_Penh",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

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
    <article className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h3 className="font-bold text-slate-900 leading-snug min-w-0">
          #{request.id} · {request.submitted_title}
        </h3>
        <span
          className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
            request.status === "pending"
              ? "bg-sky-100 text-sky-800"
              : request.status === "reviewing"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {request.status}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        From {request.submitted_by_name ?? "a deleted account"}
        {request.submitted_by_email && ` (${request.submitted_by_email})`} ·{" "}
        {formatDate(request.created_at)}
      </p>

      {request.submitted_url && (
        <a
          href={request.submitted_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:underline mb-3 break-all"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-full">{request.submitted_url}</span>
        </a>
      )}

      {request.note && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5 mb-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            They said
          </p>
          <p className="text-sm text-slate-700">{request.note}</p>
        </div>
      )}

      {check && (
        <div className={`rounded-xl border px-3.5 py-2.5 mb-4 ${RISK_CLS[check.level] ?? RISK_CLS.low}`}>
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
          {check.findings.length === 0 && (
            <p className="text-xs font-medium">No automatic warning signs.</p>
          )}
        </div>
      )}

      {request.status === "resolved" ? (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Answered — {request.verdict}
          </p>
          <p className="text-sm text-slate-700">{request.admin_response}</p>
          {request.reviewed_by_name && (
            <p className="text-[11px] text-slate-400 mt-1.5">by {request.reviewed_by_name}</p>
          )}
        </div>
      ) : (
        <>
          <label htmlFor={`r-${request.id}`} className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Your reply to the student
          </label>
          <textarea
            id={`r-${request.id}`}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={3}
            placeholder="Explain what you found, and what they should do."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 resize-none mb-3"
          />

          {error && <p className="text-xs text-rose-600 font-medium mb-2">{error}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {VERDICTS.map((v) => (
              <button
                key={v.value}
                onClick={() => submit("resolved", v.value)}
                disabled={busy}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-50 cursor-pointer ${v.cls}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {v.label}
              </button>
            ))}

            {request.status === "pending" && (
              <button
                onClick={() => submit("reviewing")}
                disabled={busy}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                I&apos;m looking at this
              </button>
            )}

            {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
        </>
      )}
    </article>
  );
}

/* ── Page ──────────────────────────────────────────────── */

function QueueContent() {
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

  const pending = requests.filter((r) => r.status !== "resolved").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin dashboard
        </Link>

        <header className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Verification requests
          </h1>
          <p className="text-sm text-slate-500">
            Students asking whether a scholarship is real.
            {pending > 0 && (
              <span className="font-bold text-slate-800"> {pending} waiting.</span>
            )}
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(["all", "pending", "reviewing", "resolved"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-16 justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading…</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="font-bold text-slate-900">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-900">Nothing here</p>
            <p className="text-sm text-slate-500 mt-1">
              {filter === "all"
                ? "No student has asked us to check anything yet."
                : `No ${filter} requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} onReviewed={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <RequireAdmin>
      <QueueContent />
    </RequireAdmin>
  );
}
