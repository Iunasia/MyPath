import Link from "next/link";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import SaveItemButton from "./SaveItemButton";
import { deadlineLabel, deadlineState, type ScholarshipView } from "@/app/lib/adapters";

/**
 * A scholarship the way a student scans a list: who offers it, what it
 * covers, when it closes and whether the source checked out. The old card
 * was a full-bleed photo with only a title and a date on it.
 *
 * Used by /scholarships and the home page's "Closing soon".
 */
export default function ScholarshipCard({
  scholarship,
  variant = "photo",
  showProvider = false,
}: {
  scholarship: ScholarshipView;
  variant?: "photo" | "standard";
  showProvider?: boolean;
}) {
  const deadline = deadlineState(scholarship.deadlineAt);
  const closed = deadline.kind === "closed";
  const closingSoon = deadline.kind === "open" && deadline.daysLeft <= 14;
  const urgent = deadline.kind === "open" && deadline.daysLeft <= 3;
  const check = scholarship.infoCheck;

  // Standard detailed variant with scooped corner
  if (variant === "standard") {
    return (
      <Link
        href={`/scholarships/${scholarship.id}`}
        className={`group flex flex-col bg-white rounded-3xl rounded-br-[72px] overflow-hidden border border-sky/15 bubble-shadow-sm hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 ${
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
          {showProvider && scholarship.provider && (
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-deep line-clamp-1">
              {scholarship.provider}
            </p>
          )}
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
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-3 border-t border-sky/10 text-xs font-semibold">
              <span className={`flex items-center gap-1.5 ${closed ? "text-gray-soft" : "text-gray-body"}`}>
                <Calendar className="w-3.5 h-3.5 shrink-0 text-sky-deep" />
                <span>
                  {closed ? "Closed" : "Deadline"}: {scholarship.deadline}
                </span>
              </span>
              {check?.isRisky && (
                <span
                  className="inline-flex items-center gap-1 shrink-0 text-amber-700"
                  title={check.reasons?.join(" ")}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Check source
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Signature full-bleed photo card with rounded-3xl rounded-br-[72px] shape
  return (
    <Link
      href={`/scholarships/${scholarship.id}`}
      className={`group relative aspect-[4/3] min-h-[190px] rounded-3xl rounded-br-[72px] overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 block bg-sitomo/40 ${
        closed ? "opacity-80" : ""
      }`}
    >
      {/* Full Card Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scholarship.image}
        alt={scholarship.title}
        className={`absolute inset-0 w-full h-full object-cover object-center ${
          closed ? "grayscale" : ""
        }`}
      />

      {/* Floating Badges (Top Left) */}
      <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-20">
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
        ) : scholarship.coverage ? (
          <span className="rounded-full bg-sitomo/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-sky-deep shadow-sm border border-sky/20">
            {scholarship.coverage}
          </span>
        ) : null}
      </div>

      {/* Floating Save Button on Image (Top Right) */}
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

      {/* Bottom Gradient Overlay for Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-3.5 sm:p-4 z-10">
        {/* Provider */}
        {showProvider && scholarship.provider && (
          <p className="text-[10px] sm:text-[11px] font-bold text-sky-bright uppercase tracking-wider line-clamp-1 mb-0.5 drop-shadow-xs">
            {scholarship.provider}
          </p>
        )}

        {/* Title */}
        <h3 className="font-display text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1.5 group-hover:text-sky-bright transition-colors line-clamp-2">
          {scholarship.title}
        </h3>

        {/* Dateline (Deadline) */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/80 font-medium drop-shadow-xs">
          <Calendar className="w-3 h-3 text-sky-bright shrink-0" />
          <span>Deadline: {scholarship.deadline}</span>
        </div>
      </div>
    </Link>
  );
}
