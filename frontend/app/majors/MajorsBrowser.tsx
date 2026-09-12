"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, GraduationCap } from "lucide-react";
import { CATEGORIES } from "@/app/data/majors";
import type { ApiMajor } from "@/app/lib/api";
import { categoriesOf, plainCategory, toMajorViews } from "@/app/lib/catalogAdapters";
import Footer from "@/app/components/Footer";
import ListHero from "@/app/components/ListHero";

/* ── Page Component ────────────────────────────────────── */

/** Rows come from the server page; adapted here because views carry icons. */
export default function MajorsBrowser({
  rows,
  loadError,
}: {
  rows: ApiMajor[];
  loadError: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const majors = useMemo(() => toMajorViews(rows), [rows]);

  // Derived from the data, so a new spreadsheet category becomes a filter.
  const categories = useMemo(() => {
    return categoriesOf(majors).map((category) => {
      const styling = CATEGORIES.find(
        (c) => plainCategory(c.id) === plainCategory(category)
      );
      return {
        id: category,
        name: plainCategory(category),
        icon: styling?.icon ?? GraduationCap,
        bg: styling?.bg ?? "bg-sitomo",
        iconColor: styling?.iconColor ?? "text-sky-deep",
      };
    });
  }, [majors]);

  // Filter logic
  const filteredMajors = useMemo(() => {
    return majors.filter((major) => {
      const matchesCategory = selectedCategory
        ? major.category === selectedCategory
        : true;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        major.name.toLowerCase().includes(q) ||
        major.description.toLowerCase().includes(q) ||
        major.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        major.subjects.some((subject) => subject.toLowerCase().includes(q)) ||
        major.relatedCareersText.some((career) => career.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [majors, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">

        <ListHero
          title="Explore majors"
          description="What you'd study, the skills you'd build, and the careers each major leads to."
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search by major, skill or career",
          }}
        />

        {/* ── Browse by Interest (6 Categories on Desktop) ──── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              Browse by interest
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-sky-deep hover:underline cursor-pointer"
              >
                Reset filter
              </button>
            )}
          </div>

          {/* Stays in one row on desktop (md:grid-cols-6) and 3 columns on mobile */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : cat.id)
                  }
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl rounded-br-[36px] sm:rounded-br-[48px] border-2 transition-all text-center group cursor-pointer min-h-[120px] sm:min-h-[135px] ${
                    isSelected
                      ? "border-sky ring-2 ring-sky/30 bg-sky/5 bubble-shadow"
                      : "border-sky/40 bg-white hover:border-sky bubble-shadow-sm hover:scale-[1.03] hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full ${cat.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs`}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <span className="font-display text-xs sm:text-sm font-bold text-blue-ink leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Trending Majors (Multi-Column Grid) ───────────── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              {selectedCategory ? `${selectedCategory} Majors` : "Featured Majors"}
            </h2>
            <Link
              href="/majors/all"
              className="text-xs font-bold text-sky-deep hover:underline"
            >
              View all majors →
            </Link>
          </div>

          {loadError ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm mt-4 max-w-lg mx-auto">
              <AlertTriangle className="w-12 h-12 text-momo mx-auto mb-3" />
              <p className="font-bold text-blue-ink text-base">Couldn&apos;t load majors</p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5">
                {loadError}. Check that the API is running, then try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredMajors.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm mt-4 max-w-lg mx-auto">
              <p className="font-bold text-blue-ink text-base">No majors found</p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5">
                Try searching for a different skill or reset your category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Responsive Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop (Top 6 Majors) */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {filteredMajors.slice(0, 6).map((major) => {
                  const Icon = major.icon;

                  return (
                    <article
                      key={major.id}
                      className="bg-white rounded-3xl p-6 lg:p-7 border border-sky/15 bubble-shadow-sm hover:border-sky/35 bubble-shadow-hover transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Row: Icon + Optional Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-2xl ${major.iconBg} flex items-center justify-center`}
                          >
                            <Icon className={`w-6 h-6 ${major.iconColor}`} strokeWidth={2.2} />
                          </div>

                          {/* Was a curated badge; now the real demand signal
                              from the spreadsheet. */}
                          {major.jobMarketDemand !== "Not stated" && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-momo text-blue-ink">
                              {major.jobMarketDemand}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-display text-lg lg:text-xl font-bold text-blue-ink mb-2">
                          {major.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-body leading-relaxed mb-4 font-medium">
                          {major.description}
                        </p>
                      </div>

                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {major.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-sitomo/70 text-blue-ink text-xs font-semibold px-3 py-1 rounded-full border border-sky/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/majors/${major.id}`}
                            className="flex-1 rounded-full border-2 border-sky/50 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-sky-deep hover:bg-sky/10 hover:border-sky transition-colors text-center cursor-pointer block"
                          >
                            Explore Major
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredMajors.length > 6 && (
                <div className="mt-10 text-center">
                  <Link
                    href="/majors/all"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white border-2 border-sky/40 text-sky-deep font-bold text-sm hover:bg-sky/10 hover:border-sky transition-all bubble-shadow-sm cursor-pointer"
                  >
                    <span>View All Majors</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
