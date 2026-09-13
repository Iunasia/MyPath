"use client";

import { useState, useMemo } from "react";
import { Coins, CheckCircle2, SlidersHorizontal, AlertTriangle } from "lucide-react";
import Footer from "@/app/components/Footer";
import ListHero from "@/app/components/ListHero";
import ScholarshipCard from "@/app/components/ScholarshipCard";
import {
  SCHOLARSHIP_CATEGORIES,
  COVERAGE_FILTERS,
} from "@/app/data/scholarships";
import type { ApiScholarship } from "@/app/lib/api";
import { deadlineState, sortByDeadline, toScholarshipViews } from "@/app/lib/adapters";

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6";

/** Rows come from the server page, so the list is there on first paint. */
export default function ScholarshipsBrowser({
  rows,
  loadError,
}: {
  rows: ApiScholarship[];
  loadError: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("All Coverage");

  const scholarships = useMemo(() => toScholarshipViews(rows), [rows]);

  // Filtering logic (Cambodia only - no study abroad)
  const filteredScholarships = useMemo(() => {
    return sortByDeadline(scholarships.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.provider.toLowerCase().includes(q) ||
        item.targetMajors.some((m) => m.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "All Categories" || item.category === selectedCategory;

      const matchesCoverage =
        selectedCoverage === "All Coverage" || item.coverage === selectedCoverage;

      return matchesSearch && matchesCategory && matchesCoverage;
    }));
  }, [scholarships, searchQuery, selectedCategory, selectedCoverage]);

  const openScholarships = filteredScholarships.filter(
    (s) => deadlineState(s.deadlineAt).kind !== "closed"
  );
  const closedScholarships = filteredScholarships.filter(
    (s) => deadlineState(s.deadlineAt).kind === "closed"
  );

  const hasActiveFilters =
    selectedCategory !== "All Categories" ||
    selectedCoverage !== "All Coverage" ||
    searchQuery !== "";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedCoverage("All Coverage");
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Responsive Viewport Container: 25px on mobile, 32px on tablet, 80px on desktop */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-8 md:px-10 lg:px-[80px] flex flex-col">

        <ListHero
          title="Make your education more affordable"
          description="Discover scholarships and funding opportunities that can help you reach your goals."
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search by name, university or major",
          }}
        />


        {/* ── Category & Filter Controls (Responsive for Tablet & Desktop) ── */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 pb-4 border-b border-sky/15">
            {/* Category Pills (Scrollable on mobile, wrapped on tablet/desktop) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-wrap">
              {SCHOLARSHIP_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-deep text-white bubble-shadow-sm"
                        : "bg-white text-blue-ink border border-sky/20 hover:border-sky bubble-shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Secondary Filter Row: Coverage Selector + Reset + Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Coverage Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCoverage}
                    onChange={(e) => setSelectedCoverage(e.target.value)}
                    className="appearance-none bg-white border border-sky/25 text-blue-ink text-xs font-bold pl-8 pr-8 py-2 rounded-full cursor-pointer hover:border-sky transition-colors focus:outline-none focus:ring-2 focus:ring-sky/30 bubble-shadow-sm"
                  >
                    {COVERAGE_FILTERS.map((cov) => (
                      <option key={cov} value={cov}>
                        {cov}
                      </option>
                    ))}
                  </select>
                  <Coins className="w-3.5 h-3.5 text-sky-deep absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <SlidersHorizontal className="w-3 h-3 text-gray-soft absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-sky-deep hover:underline px-2 py-1 cursor-pointer"
                  >
                    Reset filters
                  </button>
                )}
              </div>


            </div>
          </div>
        </section>

        {/* ── Scholarships Grid (Tablet Responsive: 1 col on mobile, 2 cols on tablet, 3 cols on desktop) ── */}
        <section className="flex-1 pb-16">
          {loadError ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm max-w-lg mx-auto mt-6">
              <AlertTriangle className="w-12 h-12 text-momo mx-auto mb-3" />
              <p className="font-bold text-blue-ink text-base">
                Couldn&apos;t load scholarships
              </p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                {loadError}. Check that the API is running, then try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-colors cursor-pointer bubble-shadow-sm"
              >
                Retry
              </button>
            </div>
          ) : filteredScholarships.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm max-w-lg mx-auto mt-6">
              <Coins className="w-12 h-12 text-sky-deep mx-auto mb-3 opacity-60" />
              <p className="font-bold text-blue-ink text-base">
                No scholarships match your filters
              </p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                Try clearing your search keyword or switching back to All Categories.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-colors cursor-pointer bubble-shadow-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {openScholarships.length > 0 && (
                <div className={GRID}>
                  {openScholarships.map((scholarship) => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                  ))}
                </div>
              )}

              {/* Closed ones stay visible for reference, but below the open
                  ones and greyed out — they used to lead the list. */}
              {closedScholarships.length > 0 && (
                <div className={openScholarships.length > 0 ? "mt-14" : ""}>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight">
                    Closed
                  </h2>
                  <p className="text-sm text-gray-soft font-medium mt-1 mb-5">
                    The deadline has passed. Kept for reference — providers often run the same
                    scholarship again, so check their page for the next round.
                  </p>
                  <div className={GRID}>
                    {closedScholarships.map((scholarship) => (
                      <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Information Check & Trust Guarantee Section (Tablet Responsive) ── */}
        <section className="rounded-3xl rounded-br-[86px] sm:rounded-br-[86px] bg-white border border-sky/15 p-6 sm:p-8 md:p-10 bubble-shadow-sm mb-16">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-sitomo text-sky-deep text-[11px] font-extrabold uppercase tracking-wider mb-3">
              Transparency & Verification
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink mb-3">
              How does Domner verify scholarships?
            </h2>
            <p className="text-sm text-gray-body leading-relaxed font-medium mb-6">
              Every scholarship featured on Domner is verified directly against official ministry notices and university admissions registries in Cambodia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-powder border border-sky/10 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-deep shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-ink">Direct Links</h4>
                  <p className="text-[11px] text-gray-soft mt-0.5 leading-normal">
                    Apply directly on the university or ministry official portal.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-powder border border-sky/10 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-deep shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-ink">Zero Hidden Fees</h4>
                  <p className="text-[11px] text-gray-soft mt-0.5 leading-normal">
                    All listed Cambodian government & university grants are verified.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-powder border border-sky/10 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-deep shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-ink">Updated Deadlines</h4>
                  <p className="text-[11px] text-gray-soft mt-0.5 leading-normal">
                    Current dates verified for the 2026/2027 Cambodian academic year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
