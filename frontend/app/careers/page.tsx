"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ArrowRight,
  Briefcase,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { CAREER_CATEGORIES } from "@/app/data/careers";
import { fetchCareers } from "@/app/lib/api";
import {
  categoriesOf,
  plainCategory,
  toCareerViews,
  type CareerView,
} from "@/app/lib/catalogAdapters";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

/* ── Page Component ────────────────────────────────────── */

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [careers, setCareers] = useState<CareerView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCareers()
      .then((rows) => {
        if (!cancelled) setCareers(toCareerViews(rows));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load careers");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Built from the data rather than a constant, so a category added to the
  // spreadsheet becomes a filter without a code change.
  const categories = useMemo(() => {
    return categoriesOf(careers).map((category) => {
      const styling = CAREER_CATEGORIES.find(
        (c) => plainCategory(c.id) === plainCategory(category)
      );
      return {
        id: category,
        name: plainCategory(category),
        icon: styling?.icon ?? Briefcase,
        bg: styling?.bg ?? "bg-sitomo",
        iconColor: styling?.iconColor ?? "text-sky-deep",
      };
    });
  }, [careers]);

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
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
            career.relatedMajorsText.some((m) => m.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [careers, searchQuery, selectedCategory]);

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
                  <Search className="h-4 w-4 text-gray-soft" />
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-soft hover:text-blue-ink cursor-pointer"
                  >
                    <X className="h-4 w-4" />
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
            {categories.map((cat) => {
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
                      ? "border-sky ring-2 ring-sky/30 bg-sky/5 bubble-shadow"
                      : "border-sky/40 bg-white hover:border-sky bubble-shadow-sm hover:scale-[1.03] hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full ${cat.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs`}
                  >
                    <Icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.iconColor}`}
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
                : `All Careers (${filteredCareers.length})`}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-soft">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Loading careers…</span>
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm mt-4 max-w-lg mx-auto">
              <AlertTriangle className="w-12 h-12 text-momo mx-auto mb-3" />
              <p className="font-bold text-blue-ink text-base">Couldn&apos;t load careers</p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5">
                {loadError}. Check that the API is running, then try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky text-white text-xs sm:text-sm font-bold hover:bg-sky-bright transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredCareers.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCareers.map((career) => {
                const Icon = career.icon;

                return (
                  <article
                    key={career.id}
                    className="bg-white rounded-3xl p-6 lg:p-7 border border-sky/15 bubble-shadow-sm hover:border-sky/35 bubble-shadow-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-sitomo flex items-center justify-center border border-sky/15">
                          <Icon
                            className="w-6 h-6 text-sky-deep"
                            strokeWidth={2.2}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-sitomo text-sky-deep border border-sky/10">
                            {career.category}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            {career.jobMarketDemand}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-xl font-extrabold text-blue-ink mb-2 leading-tight">
                        {career.title}
                      </h3>

                      {/* What You Do Banner */}
                      <div className="p-3 bg-sky/5 rounded-2xl border border-sky/15 mb-3.5">
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-sky-deep shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-ink font-semibold leading-snug">
                            <span className="font-extrabold text-sky-deep">What You Do: </span>
                            {career.whatYouDo}
                          </p>
                        </div>
                      </div>

                      {/* Short Overview */}
                      <p className="text-xs text-gray-body leading-relaxed mb-4 line-clamp-3 font-medium">
                        {career.shortOverview}
                      </p>

                      {/* Education Required */}
                      <div className="mb-4 text-xs font-medium text-gray-body flex items-start gap-1.5 bg-powder/50 p-2.5 rounded-xl border border-sky/10">
                        <GraduationCap className="w-4 h-4 text-sky-deep shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-ink block text-[11px]">Education Required:</span>
                          <span className="text-[11px] text-gray-body leading-tight block">{career.educationRequired}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Link
                        href={`/careers/${career.id}`}
                        className="w-full rounded-full border-2 border-sky/50 py-2.5 text-xs font-extrabold text-sky-deep hover:bg-sky/10 hover:border-sky transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        View Full Career Details
                        <ArrowRight className="w-3.5 h-3.5" />
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

