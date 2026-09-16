"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
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
  CloudUpload,
  X,
} from "lucide-react";
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

const WARNING_SIGNS = [
  {
    title: "They ask you to pay to apply.",
    description: "Be cautious when a scholarship asks for an upfront fee or payment.",
  },
  {
    title: "They guarantee your acceptance.",
    description: "Legitimate scholarships cannot promise that you will be selected before reviewing your application.",
  },
  {
    title: "The link only appears on social media.",
    description: "Check whether the scholarship is listed on the university or organization’s official website.",
  },
  {
    title: "The website address looks suspicious.",
    description: "Watch for shortened links, strange domains, spelling mistakes, or unfamiliar websites.",
  },
  {
    title: "They ask you to move to Telegram or WhatsApp.",
    description: "Be careful when someone asks you to leave the official application process and continue through private messaging.",
  },
  {
    title: "They ask for sensitive information too early.",
    description: "Think twice if they request bank details, ID numbers, or other sensitive information before you have even applied.",
  },
  {
    title: "They pressure you to act immediately.",
    description: "Messages like “only 3 places left” or “closes in 24 hours” can be designed to rush your decision.",
  },
  {
    title: "They say you won something you never entered.",
    description: "If you never applied or entered, an unexpected scholarship or prize message is a major warning sign.",
  },
];

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

  // File upload state for "Upload here"
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    extension: string;
    progress: number;
    status: string;
  } | null>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split(".").pop() || "FILE").toUpperCase().slice(0, 4);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeInMB}MB of ${sizeInMB}MB`,
      extension: ext,
      progress: 78,
      status: "Uploading...... 78%",
    });
    setTimeout(() => {
      setSelectedFile((prev) =>
        prev ? { ...prev, progress: 100, status: "Ready to upload" } : null
      );
    }, 500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const ext = (file.name.split(".").pop() || "FILE").toUpperCase().slice(0, 4);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeInMB}MB of ${sizeInMB}MB`,
      extension: ext,
      progress: 78,
      status: "Uploading...... 78%",
    });
    setTimeout(() => {
      setSelectedFile((prev) =>
        prev ? { ...prev, progress: 100, status: "Ready to upload" } : null
      );
    }, 500);
  };

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
  };

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

        <main className="w-full pb-16 flex flex-col gap-10 max-w-4xl mx-auto">
          {/* Intro */}
          <section className="text-center pt-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              Is this scholarship <span className="text-sky-deep">real?</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-body font-medium max-w-2xl mx-auto">
              Found a scholarship on Facebook, Telegram, or a website? Send it to Domner and get a quick check before you share your information or apply.
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
              <div className="py-2 max-w-xl mx-auto w-full">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-ink text-center mb-6 sm:mb-8">
                  Upload here
                </h2>

                {/* Dashed dropzone */}
                <div
                  onClick={handleBrowseClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl py-8 px-4 sm:py-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-sky-deep bg-sitomo scale-[1.01]"
                      : "border-sky/40 hover:border-sky-deep hover:bg-sitomo/50 bg-sitomo/25"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />

                  {/* Cloud upload icon with our brand color */}
                  <div className="mb-3 text-sky-deep">
                    <svg
                      className="w-12 h-12 sm:w-14 sm:h-14 mx-auto"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M48 42a12 12 0 0 0-4-23.3 16 16 0 0 0-31 6A12 12 0 0 0 16 48h32" />
                      <polyline points="24 34 32 26 40 34" />
                      <line x1="32" y1="26" x2="32" y2="44" />
                    </svg>
                  </div>

                  <p className="text-sm sm:text-base text-gray-body font-medium">
                    Drag files here or{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrowseClick();
                      }}
                      className="text-sky-deep font-bold hover:underline cursor-pointer"
                    >
                      Browse
                    </button>
                  </p>
                </div>

                {/* File preview row */}
                {selectedFile && (
                  <div className="mt-6 flex items-center gap-3.5 px-1">
                    {/* Document Icon with folded corner and type stamp */}
                    <div className="relative w-9 h-11 shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 36 44" fill="none">
                        <path
                          d="M0 3C0 1.34315 1.34315 0 3 0H23L36 13V41C36 42.6569 34.6569 44 33 44H3C1.34315 44 0 42.6569 0 41V3Z"
                          fill="#2D3A3A"
                        />
                        <path
                          d="M23 0L36 13H26C24.3431 13 23 11.6569 23 10V0Z"
                          fill="#7AB3B7"
                        />
                        <text
                          x="18"
                          y="34"
                          fill="white"
                          fontSize="9.5"
                          fontWeight="800"
                          textAnchor="middle"
                          letterSpacing="0.5"
                          fontFamily="sans-serif"
                        >
                          {selectedFile.extension}
                        </text>
                      </svg>
                    </div>

                    {/* Progress track & labels */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-blue-ink mb-1.5">
                        <span className="truncate">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-gray-soft hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-full bg-sky/15 h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="bg-sky-deep h-full rounded-full transition-all duration-300"
                          style={{ width: `${selectedFile.progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-soft font-medium">
                        <span>{selectedFile.size}</span>
                        <span className="text-gray-body font-semibold">
                          {selectedFile.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Action Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="w-full sm:w-auto min-w-[260px] py-3.5 px-10 rounded-full bg-[#7AB3B7] hover:bg-[#68A1A5] text-white font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer text-center"
                  >
                    Upload
                  </button>
                </div>
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
                  className="inline-flex items-center gap-2 rounded-full bg-[#7AB3B7] px-6 py-3 text-sm font-bold text-white hover:bg-[#68A1A5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

          {/* How to spot a fake scholarship */}
          <section className="bg-white rounded-3xl rounded-br-[86px] p-6 sm:p-8 border border-sky/15 bubble-shadow-sm">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">
              How to spot a fake scholarship
            </h2>
            <p className="text-xs sm:text-sm text-gray-body font-semibold mb-6 max-w-2xl">
              Before you apply, look for these warning signs. A quick check can help you avoid scams and protect your information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {WARNING_SIGNS.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-base select-none shrink-0 mt-0.5 leading-none" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-blue-ink">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-body font-medium mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom tip */}
            <div className="mt-8 pt-6 border-t border-sky/15">
              <div className="bg-sitomo/40 border border-sky/20 rounded-2xl p-4 sm:p-5">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-sky-deep mb-1">
                  Bottom tip
                </span>
                <h4 className="font-display text-sm sm:text-base font-bold text-blue-ink mb-1.5">
                  Always verify it yourself.
                </h4>
                <p className="text-xs sm:text-sm text-gray-body font-medium leading-relaxed">
                  Find the university or organization&apos;s official website and look for the scholarship there.{" "}
                  <strong className="text-blue-ink font-bold">
                    If you cannot find it through an official source, pause before you apply or share your information.
                  </strong>
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Sign-in prompt modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sky/20 text-center relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-ink p-1.5 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-sitomo/80 border border-sky/30 text-sky-deep flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-2">
              Sign in to send a request
            </h3>
            <p className="text-sm text-gray-body font-medium mb-6 leading-relaxed">
              We need an account so we can send you the answer once our team checks your scholarship.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/signin?next=/verify"
                className="w-full py-3 rounded-full bg-[#7AB3B7] text-white font-bold text-sm hover:bg-[#68A1A5] transition-all shadow-md text-center block"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup?next=/verify"
                className="w-full py-2.5 rounded-full border border-sky/30 text-blue-ink font-bold text-sm hover:bg-sky/10 transition-all text-center block"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
