"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Coins,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Rocket,
  Lightbulb,
  Target,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  SCHOLARSHIPS_DATA,
  SCHOLARSHIP_CATEGORIES,
  COVERAGE_FILTERS,
} from "@/app/data/scholarships";

export default function ScholarshipsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("All Coverage");

  // Filtering logic (Cambodia only - no study abroad)
  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATA.filter((item) => {
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
    });
  }, [searchQuery, selectedCategory, selectedCoverage]);

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
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                Make your education more
                <br />
                <span className="text-sky-deep">affordable</span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                Discover scholarships and funding opportunities that can help you reach your goals.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-black" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, provider, or major..."
                  className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl border border-sky/20 text-sm text-blue-ink placeholder:text-gray-faint focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-all bubble-shadow-sm font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black hover:opacity-70 cursor-pointer"
                  >
                    <X className="h-4 w-4 text-black" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Category & Filter Controls ─────────────────────── */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-sky/15">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {SCHOLARSHIP_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#33666A] text-white bubble-shadow-sm"
                        : "bg-white text-blue-ink border border-sky/25 hover:border-sky bubble-shadow-2xs"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
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
        </section>

        {/* ── Scholarships Grid (Tablet Responsive: 1 col on mobile, 2 cols on tablet, 3 cols on desktop) ── */}
        <section className="flex-1 pb-16">
          {filteredScholarships.length === 0 ? (
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
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky text-white text-xs sm:text-sm font-bold hover:bg-sky-bright transition-colors cursor-pointer bubble-shadow-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredScholarships.map((scholarship) => (
                <Link
                  key={scholarship.id}
                  href={`/scholarships/${scholarship.id}`}
                  className="group relative aspect-[4/3] min-h-[190px] rounded-3xl rounded-br-[72px] overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 block bg-sitomo/40"
                >
                  {/* Full Card Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scholarship.image}
                    alt={scholarship.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />

                  {/* Floating Save Button on Image */}
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
                    {/* Title */}
                    <h3 className="font-display text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1.5 group-hover:text-sky-bright transition-colors line-clamp-2">
                      {scholarship.title}
                    </h3>

                    {/* Dateline (Deadline) */}
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/75 font-medium drop-shadow-xs">
                      <Calendar className="w-3 h-3 text-sky-bright shrink-0" />
                      <span>Deadline: {scholarship.deadline}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Section Divider Line ──────────────────────────────── */}
        <div className="w-full border-t border-sky/25 mb-14" />

        {/* ── Information Check & Trust Guarantee Section (No background card, infographic style) ── */}
        <section className="w-full mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink tracking-tight">
              How does Domner verify scholarships?
            </h2>
            <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium mt-2">
              Every scholarship featured on Domner is verified directly against official ministry notices and university admissions registries in Cambodia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-2 max-w-5xl mx-auto">
            {/* Step 1: Direct Links (Rocket) */}
            <div className="relative group pt-3 pl-3 pr-2 ">
              <div className="absolute top-0 left-0 right-3 bottom-3 rounded-3xl border-2 border-sky-deep pointer-events-none transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 bg-sky-deep " />
              <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-sky/15 flex flex-col items-center text-center justify-center min-h-[160px] transition-shadow duration-300 group-hover:shadow-md">
                <div className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-deep text-white flex items-center justify-center shadow-md">
                  <Rocket className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                  Direct Links
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                  Apply directly on the university or ministry official portal with zero middleman redirection.
                </p>
              </div>
            </div>

            {/* Step 2: Zero Hidden Fees (Lightbulb) */}
            <div className="relative group pt-3 pl-3 pr-2">
              <div className="absolute top-0 left-0 right-3 bottom-3 rounded-3xl border-2 border-sky-deep pointer-events-none transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 bg-sky-deep" />
              <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-sky/15 flex flex-col items-center text-center justify-center min-h-[160px] transition-shadow duration-300 group-hover:shadow-md">
                <div className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-deep text-white flex items-center justify-center shadow-md">
                  <Lightbulb className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                  Zero Hidden Fees
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                  All listed Cambodian government & university grants are 100% verified and free to explore.
                </p>
              </div>
            </div>

            {/* Step 3: Updated Deadlines (Target) */}
            <div className="relative group pt-3 pl-3 pr-2">
              <div className="absolute top-0 left-0 right-3 bottom-3 rounded-3xl border-2 border-sky-deep pointer-events-none transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 bg-sky-deep" />
              <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col items-center text-center justify-center min-h-[160px] transition-shadow duration-300 group-hover:shadow-md">
                <div className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-deep text-white flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                  Updated Deadlines
                </h3>
                <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                  Current dates and application deadlines verified for the 2026/2027 Cambodian academic year.
                </p>
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
