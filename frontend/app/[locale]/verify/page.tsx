"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n";
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
  X,
  ImagePlus,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import AttachmentGallery from "@/app/components/AttachmentGallery";
import { downscaleImage, MAX_SCREENSHOTS } from "@/app/lib/imageResize";
import { Button, EmptyState } from "@/app/components/ui";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchMyVerificationRequests,
  submitVerificationRequest,
  type ApiLinkCheck,
  type ApiVerificationRequest,
  type RiskLevel,
  type Verdict,
} from "@/app/lib/api";

function AutoCheckPanel({ check }: { check: ApiLinkCheck }) {
  const t = useTranslations("verify");
  const risk = RISK[check.level];

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${risk.cls}`} aria-live="polite">
      <div className="flex items-center gap-2 mb-3">
        {check.level === "low" ? (
          <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
        ) : (
          <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
        )}
        <span className="font-display font-extrabold text-sm sm:text-base">
          {t("autoCheckLabel", { risk: risk.label })}
        </span>
      </div>

      {check.findings.length > 0 && (
        <ul className="space-y-2 mb-3">
          {check.findings.map((finding, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      )}

      {check.passed.length > 0 && (
        <ul className="space-y-1.5">
          {check.passed.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-medium opacity-80">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] mt-4 opacity-75 font-medium">
        {t("autoCheckDisclaimer")}
      </p>
    </div>
  );
}

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

const INPUT_CLS =
  "w-full px-4 py-3 rounded-2xl border border-sky/25 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-[border-color,box-shadow] font-medium";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Phnom_Penh",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export default function VerifyPage() {
  const t = useTranslations("verify");
  const tCommon = useTranslations("common");
  const { user, loading: authLoading } = useAuth();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastCheck, setLastCheck] = useState<ApiLinkCheck | null>(null);

  const [requests, setRequests] = useState<ApiVerificationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Screenshots attached to the signed-in form: the original file plus a preview URL.
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [screenshots, setScreenshots] = useState<Array<{ file: File; preview: string }>>([]);
  const [preparing, setPreparing] = useState(false);

  const addScreenshots = (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = Math.max(MAX_SCREENSHOTS - screenshots.length, 0);

    if (incoming.length > room) setError(t("tooManyScreenshots", { max: MAX_SCREENSHOTS }));
    else if (incoming.length < files.length) setError(t("onlyImages"));

    const added = incoming.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setScreenshots([...screenshots, ...added]);
    if (screenshotInputRef.current) screenshotInputRef.current.value = "";
  };

  const removeScreenshot = (index: number) => {
    URL.revokeObjectURL(screenshots[index].preview);
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

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
      // Signed out, or the API is down
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    void (async () => {
      if (!user) {
        setLoadingRequests(false);
        return;
      }
      await loadRequests();
    })();
  }, [authLoading, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLastCheck(null);
    setSubmitting(true);

    try {
      let images: Blob[] = [];
      if (screenshots.length > 0) {
        setPreparing(true);
        try {
          images = await Promise.all(screenshots.map((s) => downscaleImage(s.file)));
        } catch {
          setError(t("notAnImage"));
          return;
        } finally {
          setPreparing(false);
        }
      }

      const result = await submitVerificationRequest({
        url: url.trim() || undefined,
        title: title.trim() || undefined,
        note: note.trim() || undefined,
        images,
      });
      setLastCheck(result.autoCheck);
      setUrl("");
      setTitle("");
      setNote("");
      screenshots.forEach((s) => URL.revokeObjectURL(s.preview));
      setScreenshots([]);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <div className="w-full pb-16 flex flex-col gap-10 max-w-4xl mx-auto">
          <section className="text-center pt-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              {t("heroTitle")} <span className="text-[#5B9DA2]">{t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-body font-medium max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>
          </section>

          <section className="bg-white rounded-3xl rounded-br-[86px] p-6 sm:p-8 border border-sky/15 bubble-shadow-sm">
            {authLoading ? (
              <div className="flex items-center justify-center gap-3 py-8 text-gray-soft">
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span className="text-sm font-semibold">{tCommon("loading")}</span>
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

                  {/* Cloud upload icon with brand color */}
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
                    {t("linkToScholarship")}
                  </label>
                  <input
                    id="url"
                    name="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t("linkPlaceholder")}
                    autoComplete="url"
                    className={INPUT_CLS}
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
                    {t("whatIsItCalled")}
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={300}
                    placeholder={t("titlePlaceholder")}
                    className={INPUT_CLS}
                  />
                </div>

                <div>
                  <label htmlFor="note" className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
                    {t("anythingElse")}
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder={t("notePlaceholder")}
                    className={`${INPUT_CLS} resize-none`}
                  />
                  <p className="text-[11px] text-gray-soft mt-1.5 font-medium">
                    {t("tip")}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5">
                    {t("screenshotsLabel")}
                  </span>
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => addScreenshots(e.target.files)}
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <div
                    className="flex flex-wrap gap-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addScreenshots(e.dataTransfer.files);
                    }}
                  >
                    {screenshots.map((s, i) => (
                      <div key={s.preview} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-sky/25 bg-white">
                        {/* Local preview of a file not yet uploaded. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.preview} alt={s.file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          aria-label={t("removeScreenshot")}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/55 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {screenshots.length < MAX_SCREENSHOTS && (
                      <button
                        type="button"
                        onClick={() => screenshotInputRef.current?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-sky/40 bg-sitomo/25 hover:border-sky-deep hover:bg-sitomo/50 text-sky-deep flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ImagePlus className="w-5 h-5" aria-hidden="true" />
                        <span className="text-[10px] font-bold px-1 leading-tight">{t("addScreenshot")}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-soft mt-1.5 font-medium">
                    {t("screenshotsHint", { max: MAX_SCREENSHOTS })}
                  </p>
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium" role="alert">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting || (!url.trim() && !title.trim() && screenshots.length === 0)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#7AB3B7] px-6 py-3 text-sm font-bold text-white hover:bg-[#68A1A5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {preparing ? t("preparingImages") : submitting ? t("checking") : t("checkThisScholarship")}
                </Button>
              </form>
            )}
          </section>

          {lastCheck && (
            <section>
              <AutoCheckPanel check={lastCheck} />
            </section>
          )}

          {user && (
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">
                {t("yourRequests")}
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft font-medium mb-5">
                {t("answersAppearHere")}
              </p>

              {loadingRequests ? (
                <div className="flex items-center gap-3 py-8 text-gray-soft">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span className="text-sm font-semibold">{tCommon("loading")}</span>
                </div>
              ) : requests.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title={t("noRequestsYet")}
                  description={t("answersAppearHere")}
                />
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
                            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                            {status.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-soft font-medium mb-3">
                          {t("sentDate", { date: formatDate(request.created_at) })}
                        </p>

                        {request.submitted_url && (
                          <a
                            href={request.submitted_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-deep hover:underline mb-3 break-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-full">{request.submitted_url}</span>
                          </a>
                        )}

                        {request.attachments && request.attachments.length > 0 && (
                          <AttachmentGallery
                            requestId={request.id}
                            attachments={request.attachments}
                            labels={{
                              heading: t("yourScreenshots"),
                              unavailable: t("imageUnavailable"),
                              open: t("openImage"),
                              close: t("closeImage"),
                            }}
                          />
                        )}

                        {verdict && (
                          <div className={`rounded-2xl border px-4 py-3 mb-3 ${verdict.cls}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {request.verdict === "legitimate" ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                              ) : (
                                <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
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
                                {t("checkedBy", { name: request.reviewed_by_name })}
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

          <section className="bg-white rounded-3xl rounded-br-[86px] p-6 sm:p-8 border border-sky/15 bubble-shadow-sm">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-1">
              {t("howToSpotFake")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-soft font-medium mb-6 leading-relaxed">
              {t("howToSpotFakeDesc")}
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {[
                { title: t("tip1Title"), desc: t("tip1Desc") },
                { title: t("tip2Title"), desc: t("tip2Desc") },
                { title: t("tip3Title"), desc: t("tip3Desc") },
                { title: t("tip4Title"), desc: t("tip4Desc") },
                { title: t("tip5Title"), desc: t("tip5Desc") },
                { title: t("tip6Title"), desc: t("tip6Desc") },
                { title: t("tip7Title"), desc: t("tip7Desc") },
                { title: t("tip8Title"), desc: t("tip8Desc") },
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-blue-ink leading-snug">
                      {tip.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-soft font-medium mt-1 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-sky/15">
              <div className="bg-sitomo/40 border border-sky/20 rounded-2xl p-4 sm:p-5">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#5B9DA2] mb-1">
                  {t("bestHabit")}
                </span>
                <p className="text-xs sm:text-sm text-gray-body font-medium leading-relaxed">
                  {t("bestHabitDesc")}
                </p>
              </div>
            </div>
          </section>
        </div>
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