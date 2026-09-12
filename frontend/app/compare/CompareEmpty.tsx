"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Coins, Compass, GraduationCap, Scale, X } from "lucide-react";
import { MIN_COMPARE, useCompare, type CompareType } from "@/app/context/CompareContext";

const OPTIONS: { type: CompareType; label: string; href: string; icon: typeof Coins; hint: string }[] = [
  {
    type: "scholarship",
    label: "Scholarships",
    href: "/scholarships",
    icon: Coins,
    hint: "Award, deadline, who can apply, and how trustworthy the source is.",
  },
  {
    type: "university",
    label: "Universities",
    href: "/universities",
    icon: GraduationCap,
    hint: "Tuition, programmes, public or private, and when they were founded.",
  },
  {
    type: "major",
    label: "Majors",
    href: "/majors/all",
    icon: BookOpen,
    hint: "What you study, job-market demand, and the careers they lead to.",
  },
  {
    type: "career",
    label: "Careers",
    href: "/careers",
    icon: Compass,
    hint: "Skills, growth outlook, the education you need, and who it suits.",
  },
];

/** /compare with nothing picked yet: explain how, and pick up where the tray left off. */
export default function CompareEmpty() {
  const { items, type, compareHref, isHydrated, remove, clear } = useCompare();
  const picked = isHydrated && items.length > 0 && type;

  return (
    <>
      <section>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Compare side by side</h1>
        <p className="text-sm sm:text-base text-gray-body font-medium mt-2 max-w-2xl">
          Pick {MIN_COMPARE} to 4 of the same kind and see them next to each other — with where every fact
          came from, what each one leaves out, and anything worth checking before you decide.
        </p>
      </section>

      {picked && (
        <section className="bg-white rounded-3xl border border-sky bubble-shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-extrabold">You&apos;ve picked {items.length}</h2>
              <ul className="flex flex-wrap gap-1.5 mt-2">
                {items.map((item) => (
                  <li
                    key={item.apiId}
                    className="inline-flex items-center gap-1 rounded-full bg-sitomo border border-sky/25 pl-3 pr-1 py-1 text-xs font-bold"
                  >
                    {item.title}
                    <button
                      type="button"
                      onClick={() => remove(item.type, item.apiId)}
                      className="p-0.5 rounded-full text-gray-soft hover:text-blue-ink hover:bg-white cursor-pointer"
                      aria-label={`Remove ${item.title}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clear}
                className="px-3 py-2 text-xs font-bold text-gray-soft hover:text-blue-ink cursor-pointer"
              >
                Clear
              </button>
              {compareHref ? (
                <Link
                  href={compareHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark transition-colors"
                >
                  Compare now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={OPTIONS.find((o) => o.type === type)?.href ?? "/"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-sky/40 px-5 py-2.5 text-sm font-bold text-sky-deep hover:border-sky"
                >
                  Pick one more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OPTIONS.map(({ type: optionType, label, href, icon: Icon, hint }) => (
          <Link
            key={optionType}
            href={href}
            className="group bg-white rounded-3xl border border-sky/15 bubble-shadow-sm bubble-shadow-hover p-6 flex flex-col"
          >
            <span className="w-11 h-11 rounded-2xl bg-sitomo flex items-center justify-center text-sky-deep mb-4">
              <Icon className="w-5 h-5" />
            </span>
            <span className="font-display text-lg font-extrabold group-hover:text-sky-deep transition-colors">
              Compare {label.toLowerCase()}
            </span>
            <span className="text-xs text-gray-body font-medium mt-1 flex-1">{hint}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-deep mt-4">
              Browse {label.toLowerCase()}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </section>

      <p className="flex items-center gap-2 text-xs text-gray-soft font-semibold">
        <Scale className="w-4 h-4 text-sky-deep" />
        Tap the scales button on any card or page to add it.
      </p>
    </>
  );
}
