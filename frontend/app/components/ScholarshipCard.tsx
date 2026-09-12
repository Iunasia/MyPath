import Link from "next/link";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import SaveItemButton from "./SaveItemButton";
import { deadlineLabel, deadlineState, type ScholarshipView } from "@/app/lib/adapters";

/**
 * Sreynith's photo tile, kept as she designed it: full-bleed image, dark
 * gradient, title and deadline. Added on top is only what a student needs to
 * choose between two of them — who offers it, what it covers, how long is
 * left, and whether the source looked wrong — as light overlays rather than a
 * second card design.
 *
 * Used by /scholarships and the home page's "Closing soon".
 */
export default function ScholarshipCard({ scholarship }: { scholarship: ScholarshipView }) {
  const deadline = deadlineState(scholarship.deadlineAt);
  const closed = deadline.kind === "closed";
  const closingSoon = deadline.kind === "open" && deadline.daysLeft <= 14;
  const urgent = deadline.kind === "open" && deadline.daysLeft <= 3;

  return (
    <Link
      href={`/scholarships/${scholarship.id}`}
      className={`group relative aspect-[4/3] min-h-[190px] rounded-3xl rounded-br-[72px] overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 block bg-sitomo/40 ${
        closed ? "opacity-85" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scholarship.image}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
          closed ? "grayscale" : ""
        }`}
      />

      {/* Deadline first, then the source warning: both are reasons to look
          twice before clicking through. */}
      <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5">
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
        {scholarship.infoCheck.isRisky && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-momo px-2.5 py-1 text-[10px] font-extrabold text-blue-ink shadow-sm"
            title={scholarship.infoCheck.reasons.join(" ")}
          >
            <AlertTriangle className="w-3 h-3" />
            Check source
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-20">
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

      {/* A touch deeper than the original: the provider line and title sit on
          some very bright photos. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent flex flex-col justify-end p-3.5 sm:p-4 z-10">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/95 drop-shadow-sm line-clamp-1 mb-1">
          {scholarship.provider}
        </p>

        <h3 className="font-display text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1.5 group-hover:text-sky-bright transition-colors line-clamp-2">
          {scholarship.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/85 font-medium drop-shadow-xs">
          <Calendar className="w-3 h-3 text-sky-bright shrink-0" />
          <span className="truncate">
            {closed ? "Closed" : "Deadline"}: {scholarship.deadline}
          </span>
        </div>

        <p className="mt-1.5 inline-flex w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
          {scholarship.coverage}
        </p>
      </div>
    </Link>
  );
}
