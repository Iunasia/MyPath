"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { CAREERS_DATA, CAREER_CATEGORIES } from "@/app/data/careers";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

/* ── Page Component ────────────────────────────────────── */

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCareers = useMemo(() => {
    return CAREERS_DATA.filter((career) => {
      const matchesCategory = selectedCategory
        ? career.category === selectedCategory
        : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === ""
          ? true
          : career.title.toLowerCase().includes(q) ||
            career.description.toLowerCase().includes(q) ||
            career.shortOverview.toLowerCase().includes(q) ||
            career.whatYouDo.toLowerCase().includes(q) ||
            career.category.toLowerCase().includes(q) ||
            career.educationRequired.toLowerCase().includes(q) ||
            career.keySkills.some((s) => s.toLowerCase().includes(q)) ||
            career.bestFitPersonality.some((p) => p.toLowerCase().includes(q)) ||
            career.relatedMajors.some((m) => m.name.toLowerCase().includes(q)) ||
            career.relatedMajorsText.some((m) => m.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col flex-1">
        <Header backHref="/" backLabel="DOMNER" activeNav="careers" />

        {/* ── Hero ────────────────────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                Explore Career
                <br />
                Pathways
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                Comprehensive guide to top career options, key skills, required education,
                best-fit personalities, and market demand.
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
                  placeholder="Search careers, skills, education, or personality..."
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

        {/* ── Category Filter ─────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-blue-ink tracking-tight">
              Browse by field
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {CAREER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : cat.id)
                  }
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all text-center group cursor-pointer min-h-[120px] sm:min-h-[135px] ${
                    isSelected
                      ? "border-sky ring-2 ring-sky/30 bg-sky/5 shadow-md"
                      : "border-sky/40 bg-white hover:border-sky shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full ${cat.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs`}
                  >
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6 text-black"
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="font-display text-xs sm:text-sm font-bold text-blue-ink leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Career Cards Grid ───────────────────────────── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              {selectedCategory
                ? `${selectedCategory} Careers`
                : "All Careers"}
            </h2>
          </div>

          {filteredCareers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm mt-4 max-w-lg mx-auto">
              <p className="font-bold text-blue-ink text-base">
                No careers found
              </p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5">
                Try searching for a different career, skill, or personality trait.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky text-white text-xs sm:text-sm font-bold hover:bg-sky-bright transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredCareers.map((career) => {
                return (
                  <article
                    key={career.id}
                    className="bg-white rounded-2xl border border-sky/20 overflow-hidden shadow-xs hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Top Image */}
                      <Link href={`/careers/${career.id}`} className="block w-full aspect-[16/10] overflow-hidden bg-sky/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={career.image}
                          alt={career.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>

                      {/* Card Content: Title & Important Text */}
                      <div className="p-4 sm:p-5 pb-2">
                        <Link href={`/careers/${career.id}`}>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink hover:text-sky-deep transition-colors leading-snug line-clamp-2">
                            {career.title}
                          </h3>
                        </Link>

                        <div className="mt-2.5 space-y-1">
                          <p className="text-xs text-gray-soft font-medium line-clamp-1">
                            {career.category}
                          </p>
                          <p className="text-xs font-semibold text-blue-ink">
                            Market Demand: <span className="font-bold text-sky-deep">{career.jobMarketDemand}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: View more Button */}
                    <div className="p-4 sm:p-5 pt-1 pb-4 sm:pb-5">
                      <Link
                        href={`/careers/${career.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-sky text-sky-deep hover:bg-sky hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        View more
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

