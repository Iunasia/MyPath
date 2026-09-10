"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Send,
  CheckCircle2,
  Clock,
  Search,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchMyVerificationRequests,
  submitVerificationRequest,
  type ApiLinkCheck,
  type ApiVerificationRequest,
  type RiskLevel,
  type Verdict,
} from "@/app/lib/api";

/* ── Presentation helpers ──────────────────────────────── */

const RISK: Record<RiskLevel, { label: string; cls: string }> = {
  high: { label: "High risk", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  caution: { label: "Be careful", cls: "bg-momo text-blue-ink border-momo" },
  low: { label: "Nothing obvious", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const VERDICT: Record<Verdict, { label: string; cls: string }> = {
  legitimate: { label: "Looks legitimate", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  scam: { label: "Scam — do not apply", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  outdated: { label: "Out of date", cls: "bg-momo text-blue-ink border-momo" },
  unverifiable: { label: "Could not verify", cls: "bg-slate-100 text-slate-700 border-slate-200" },
};

const STATUS: Record<string, { label: string; icon: typeof Clock }> = {
  pending: { label: "Waiting for review", icon: Clock },
  reviewing: { label: "Being checked", icon: Search },
  resolved: { label: "Answered", icon: CheckCircle2 },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Phnom_Penh",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

/* ── The automated first-pass result ───────────────────── */

function AutoCheckPanel({ check }: { check: ApiLinkCheck }) {
  const risk = RISK[check.level];

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${risk.cls}`}>
      <div className="flex items-center gap-2 mb-3">
        {check.level === "low" ? (
          <ShieldCheck className="w-5 h-5 shrink-0" />
        ) : (
          <ShieldAlert className="w-5 h-5 shrink-0" />
        )}
        <span className="font-display font-extrabold text-sm sm:text-base">
          Instant check: {risk.label}
        </span>
      </div>

      {check.findings.length > 0 && (
        <ul className="space-y-2 mb-3">
          {check.findings.map((finding, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      )}

      {check.passed.length > 0 && (
        <ul className="space-y-1.5">
          {check.passed.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-medium opacity-80">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] mt-4 opacity-75 font-medium">
        This is an automatic first look, not a final answer. A person from the
        Domner team will review it and reply here.
      </p>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────── */

export default function VerifyPage() {
  const { user, loading: authLoading } = useAuth();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastCheck, setLastCheck] = useState<ApiLinkCheck | null>(null);

  const [requests, setRequests] = useState<ApiVerificationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await fetchMyVerificationRequests();
      setRequests(data.requests);
    } catch {
      // Signed out, or the API is down — the form still explains what to do.
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // Wrapped so the state update happens in a task of its own rather than
    // synchronously inside the effect, which would cascade renders.
    void (async () => {
      if (!user) {
        setLoadingRequests(false);
        return;
      }
      await loadRequests();
    })();
    // `loadRequests` is stable enough for this page — it only reads the API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLastCheck(null);
    setSubmitting(true);

    try {
      const result = await submitVerificationRequest({
        url: url.trim() || undefined,
        title: title.trim() || undefined,
        note: note.trim() || undefined,
      });
      setLastCheck(result.autoCheck);
      setUrl("");
      setTitle("");
      setNote("");
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <Header activeNav="verify" />

        <main className="w-full pb-16 flex flex-col gap-10 max-w-4xl mx-auto">
          {/* Intro */}
          <section className="text-center pt-4">
            <span className="inline-block px-3 py-1 rounded-full bg-sitomo text-sky-deep text-[11px] font-extrabold uppercase tracking-wider mb-3">
              Information Check
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              Is this scholarship <span className="text-sky-deep">real?</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-body font-medium max-w-2xl mx-auto">
              Saw a scholarship on Facebook, Telegram or a website and you&apos;re not
              sure? Send it to us. You&apos;ll get an instant automatic check, and
              someone from our team will look at it properly and reply here.
            </p>
          </section>

          {/* Form */}
          <section className="bg-white rounded-3xl rounded-br-[86px] p-6 sm:p-8 border border-sky/15 bubble-shadow-sm">
            {authLoading ? (
              <div className="flex items-center justify-center gap-3 py-8 text-gray-soft">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-semibold">Loading…</span>
              </div>
            ) : !user ? (
              <div className="text-center py-6">
                <p className="font-bold text-blue-ink mb-2">Sign in to send a request</p>
                <p className="text-sm text-gray-body font-medium mb-5">
                  We need an account so we can send you the answer.
                </p>
                <Link
                  href="/auth/signin?next=/verify"
                  className="inline-flex items-center rounded-full bg-sky-deep px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-dark transition-colors"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
                    Link to the scholarship
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://facebook.com/… or the website address"
                    className="w-full px-4 py-3 rounded-2xl border border-sky/25 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
                    What is it called?
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={300}
                    placeholder="e.g. 100% Scholarship to Study Abroad"
                    className="w-full px-4 py-3 rounded-2xl border border-sky/25 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="note" className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
                    Anything else we should know?
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder="Where you saw it, what they're asking you to do, anything that felt strange…"
                    className="w-full px-4 py-3 rounded-2xl border border-sky/25 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all font-medium resize-none"
                  />
                  <p className="text-[11px] text-gray-soft mt-1.5 font-medium">
                    Tip: mention it if they ask for a fee, your bank details, or want
                    you to reply on Telegram or WhatsApp.
                  </p>
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || (!url.trim() && !title.trim())}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-deep px-6 py-3 text-sm font-bold text-white hover:bg-sky-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Check this scholarship
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

          {/* The instant result from the submission just made */}
          {lastCheck && (
            <section>
              <AutoCheckPanel check={lastCheck} />
            </section>
          )}

          {/* The student's own requests */}
          {user && (
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">
                Your requests
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft font-medium mb-5">
                Answers from our team appear here.
              </p>

              {loadingRequests ? (
                <div className="flex items-center gap-3 py-8 text-gray-soft">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-semibold">Loading…</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-sky/15 bubble-shadow-sm">
                  <p className="text-sm text-gray-soft font-medium">
                    You haven&apos;t sent anything to check yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => {
                    const status = STATUS[request.status] ?? STATUS.pending;
                    const StatusIcon = status.icon;
                    const verdict = request.verdict ? VERDICT[request.verdict] : null;

                    return (
                      <article
                        key={request.id}
                        className="bg-white rounded-3xl p-5 sm:p-6 border border-sky/15 bubble-shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <h3 className="font-display text-base sm:text-lg font-bold leading-snug min-w-0">
                            {request.submitted_title}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-soft shrink-0">
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-soft font-medium mb-3">
                          Sent {formatDate(request.created_at)}
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

                        {verdict && (
                          <div className={`rounded-2xl border px-4 py-3 mb-3 ${verdict.cls}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {request.verdict === "legitimate" ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 shrink-0" />
                              )}
                              <span className="font-extrabold text-sm">{verdict.label}</span>
                            </div>
                            {request.admin_response && (
                              <p className="text-xs sm:text-sm font-medium mt-1.5">
                                {request.admin_response}
                              </p>
                            )}
                            {request.reviewed_by_name && (
                              <p className="text-[11px] mt-2 opacity-75 font-medium">
                                Checked by {request.reviewed_by_name}
                                {request.reviewed_at && ` · ${formatDate(request.reviewed_at)}`}
                              </p>
                            )}
                          </div>
                        )}

                        {request.auto_check && <AutoCheckPanel check={request.auto_check} />}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* How to spot a fake — the same signals the checker uses */}
          <section className="bg-white rounded-3xl rounded-br-[86px] p-6 sm:p-8 border border-sky/15 bubble-shadow-sm">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">
              How to spot a fake scholarship
            </h2>
            <p className="text-xs sm:text-sm text-gray-soft font-medium mb-5">
              These are the same warning signs our automatic check looks for. Learning
              them means you can check anything yourself, anywhere.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {[
                "They ask for a fee to apply. Real scholarships give you money — they never ask for it.",
                "They guarantee you'll be accepted. Nobody can promise that before you apply.",
                "The link is a social media post, not the university's own website.",
                "The web address looks odd — a shortened link, or an ending like .xyz or .tk.",
                "They want you to continue on Telegram or WhatsApp instead of an official form.",
                "They ask for your bank details or ID number before you've even applied.",
                "You're told to hurry — 'only 3 places left', 'closes in 24 hours'.",
                "They congratulate you for winning something you never applied for.",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-momo shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-body font-medium">{tip}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-body font-medium mt-5 pt-4 border-t border-sky/15">
              <strong>Best habit of all:</strong> find the university&apos;s official
              website yourself and look for the scholarship there. If it only exists
              in the message you were sent, that&apos;s your answer.
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
