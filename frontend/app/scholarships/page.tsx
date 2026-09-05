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
} from "lucide-react";
import Header from "@/app/components/Header";
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
        {/* ── Top Header ───────────────────────────────────── */}
        <Header backHref="/" backLabel="DOMNER" activeNav="scholarships" />

        {/* ── Hero Search Section (Same style as Majors page) ──── */}
        <section className="mb-10 text-center max-w-3xl mx-auto w-full pt-4 sm:pt-6">

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-4">
            Find the right Scholarship for{" "}
            <span className="text-sky-deep decoration-sky/40 underline-offset-4">
              your future
            </span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-soft mb-8 max-w-xl mx-auto font-medium">
            Explore verified Cambodian scholarship programs and tuition waivers to fund your undergraduate degree.
          </p>

          {/* Search Input Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-blue-ink/60" strokeWidth={2.2} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarship name, university, or major..."
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-white rounded-full text-sm text-blue-ink placeholder:text-gray-faint focus:outline-none focus:ring-2 focus:ring-sky focus:bg-white transition-all bubble-shadow-sm font-medium border border-sky/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-soft hover:text-blue-ink cursor-pointer z-10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>


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
                        ? "bg-sky text-white bubble-shadow-sm"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredScholarships.map((scholarship) => (
                <Link
                  key={scholarship.id}
                  href={`/scholarships/${scholarship.id}`}
                  className="group relative aspect-[4/3] min-h-[210px] rounded-3xl rounded-br-[86px] sm:rounded-br-[86px] overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl block bg-sitomo/40"
                >
                  {/* Full Card Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scholarship.image}
                    alt={scholarship.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                  />

                  {/* Gentle Darkening Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />

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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-5 z-10">
                    {/* Title */}
                    <h3 className="font-display text-base sm:text-lg md:text-lg lg:text-xl font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1 group-hover:text-sky-bright transition-colors line-clamp-2">
                      {scholarship.title}
                    </h3>

                    {/* Name of University / Provider */}
                    <p className="text-xs font-semibold text-white/90 drop-shadow-xs mb-1.5 truncate">
                      {scholarship.provider}
                    </p>

                    {/* Dateline (Deadline) */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/75 font-medium drop-shadow-xs">
                      <Calendar className="w-3.5 h-3.5 text-sky-bright shrink-0" />
                      <span>Deadline: {scholarship.deadline}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
