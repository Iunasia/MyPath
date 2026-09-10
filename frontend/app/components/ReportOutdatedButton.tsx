"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { submitVerificationRequest } from "@/app/lib/api";

/**
 * "Report Outdated Information" (MVP #9).
 *
 * A report is a verification request about a listing we already hold, so it
 * lands in the same admin queue and the answer comes back to the student's
 * inbox on /verify — one review loop instead of two.
 */
export default function ReportOutdatedButton({
  scholarshipId,
  title,
}: {
  scholarshipId: number;
  title: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await submitVerificationRequest({ scholarshipId, note: note.trim() || undefined });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your report");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-sitomo/60 border border-sky/25 p-4 text-xs sm:text-sm text-blue-ink max-w-md">
        <p className="flex items-center gap-2 font-bold mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Thanks — we&apos;ll check it against the provider&apos;s own page.
        </p>
        <p className="text-gray-body">
          Our answer will appear in{" "}
          <Link href="/verify" className="font-bold text-sky-deep hover:underline">
            your requests on Verify
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-soft hover:text-blue-ink transition-colors cursor-pointer"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report outdated information</span>
      </button>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-white border border-sky/20 p-4 text-xs sm:text-sm max-w-md">
        <p className="text-blue-ink font-bold mb-1">Sign in to report this listing</p>
        <p className="text-gray-body mb-3">
          We&apos;ll check it and send you what we found, so we need to know who to answer.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-full bg-sky-deep px-4 py-2 text-xs font-bold text-white hover:bg-sky-dark transition-colors"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-bold text-gray-soft hover:text-blue-ink cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="rounded-2xl bg-white border border-sky/20 p-4 max-w-md w-full">
      <label htmlFor={`report-${scholarshipId}`} className="block text-xs font-extrabold text-blue-ink mb-1.5">
        What looks wrong or out of date?
      </label>
      <textarea
        id={`report-${scholarshipId}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="e.g. The university's own page now says the deadline is 30 September."
        className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-sm text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky/40 resize-none mb-2"
        aria-describedby={`report-${scholarshipId}-hint`}
      />
      <p id={`report-${scholarshipId}-hint`} className="text-[11px] text-gray-soft mb-3">
        About: {title}
      </p>
      {error && <p className="text-xs text-rose-600 font-medium mb-2">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-sky-deep px-4 py-2 text-xs font-bold text-white hover:bg-sky-dark transition-colors disabled:opacity-60 cursor-pointer"
        >
          {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Send report
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-bold text-gray-soft hover:text-blue-ink cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
