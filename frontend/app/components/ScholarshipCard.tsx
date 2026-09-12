import Link from "next/link";
import { AlertTriangle, Calendar, Clock, ShieldCheck } from "lucide-react";
import SaveItemButton from "./SaveItemButton";
import { deadlineLabel, deadlineState, type ScholarshipView } from "@/app/lib/adapters";

/**
 * A scholarship the way a student scans a list: who offers it, what it
 * covers, when it closes and whether the source checked out. The old card
 * was a full-bleed photo with only a title and a date on it.
 *
 * Used by /scholarships and the home page's "Closing soon".
 */
export default function ScholarshipCard({ scholarship }: { scholarship: ScholarshipView }) {
  const deadline = deadlineState(scholarship.deadlineAt);
  const closed = deadline.kind === "closed";
  const closingSoon = deadline.kind === "open" && deadline.daysLeft <= 14;
  const urgent = deadline.kind === "open" && deadline.daysLeft <= 3;
  const check = scholarship.infoCheck;

  return (
    <Link
      href={`/scholarships/${scholarship.id}`}
      className={`group flex flex-col bg-white rounded-3xl overflow-hidden border border-sky/15 bubble-shadow-sm hover:border-sky/40 hover:-translate-y-0.5 transition-all ${
        closed ? "opacity-80" : ""
      }`}
    >
      <div className="relative h-36 shrink-0 bg-sitomo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scholarship.image}
          alt=""
          className={`w-full h-full object-cover ${closed ? "grayscale" : ""}`}
        />

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {closed ? (
            <span className="rounded-full bg-blue-ink/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              Closed
            </span>
          ) : closingSoon ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm ${
                urgent ? "bg-rose-600 text-white" : "bg-white text-blue-ink"
              }`}
            >
              <Clock className="w-3 h-3" />
              {deadlineLabel(deadline)}
            </span>
          ) : null}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <SaveItemButton
            variant="card-action"
            item={{
              id: scholarship.id,
              type: "scholarship",
              title: scholarship.title,
              subtitle: scholarship.provider,
              image: scholarship.image,
              link: `/scholarships/${scholarship.id}`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-deep line-clamp-1">
          {scholarship.provider}
        </p>
        <h3 className="font-display text-lg font-extrabold text-blue-ink leading-snug mt-1 line-clamp-2 group-hover:text-sky-deep transition-colors">
          {scholarship.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="rounded-full bg-sitomo px-2.5 py-1 text-[11px] font-bold text-sky-deep">
            {scholarship.coverage}
          </span>
          <span className="rounded-full border border-sky/25 px-2.5 py-1 text-[11px] font-bold text-gray-body">
            {scholarship.degreeLevel}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {/* Wraps rather than truncates: a cut-off deadline time
              ("5:00 p…") is worse than the trust mark moving down a line. */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-3 border-t border-sky/10 text-xs font-semibold">
            <span className={`flex items-center gap-1.5 ${closed ? "text-gray-soft" : "text-gray-body"}`}>
              <Calendar className="w-3.5 h-3.5 shrink-0 text-sky-deep" />
              <span>
                {closed ? "Closed" : "Deadline"}: {scholarship.deadline}
              </span>
            </span>
            {check.isRisky ? (
              <span
                className="inline-flex items-center gap-1 shrink-0 text-amber-700"
                title={check.reasons.join(" ")}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Check source
              </span>
            ) : check.verifiedStatus === "verified" ? (
              <span
                className="inline-flex items-center gap-1 shrink-0 text-emerald-700"
                title="The link passed Domner's automated source checks"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Auto-checked
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
