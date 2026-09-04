"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  ArrowLeft,
  Home,
  BookOpen,
  Compass,
  Coins,
  Laptop,
  FlaskConical,
  Briefcase,
  Palette,
  GraduationCap,
  HeartPulse,
  Binary,
  Leaf,
  Brain,
  BarChart3,
  Sparkles,
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";

import { MAJORS_DATA, CATEGORIES, MajorItem } from "@/app/data/majors";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

/* ── Page Component ────────────────────────────────────── */

export default function MajorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<MajorItem | null>(null);

  // Filter logic
  const filteredMajors = useMemo(() => {
    return MAJORS_DATA.filter((major) => {
      const matchesCategory = selectedCategory
        ? major.category === selectedCategory
        : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === ""
          ? true
          : major.name.toLowerCase().includes(q) ||
            major.description.toLowerCase().includes(q) ||
            major.category.toLowerCase().includes(q) ||
            major.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Responsive Viewport Container: 25px on mobile, 80px on desktop */}
      <div className="w-full px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        
        {/* ── Top App Header Component ─────────────────────── */}
        <Header backHref="/" backLabel="DOMNER" activeNav="majors" />

        {/* ── Hero Heading & Search ────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                Discover Your
                <br />
                Major &amp; Career
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                Explore thousands of majors and careers pathways, find the perfect fit
                for your passions, skills, and future goals.
              </p>
            </div>

            {/* Search Bar: Compact on desktop, full width on mobile */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-soft" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for major, career, or skill..."
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

        {/* ── Browse by Interest (1 Row on Desktop, 3 Cols on Mobile) ── */}
        <section className="mb-10  ">
          <div className="flex items-center justify-between mb-4 ">
            <h2 className="font-display text-base sm:text-lg font-bold text-blue-ink tracking-tight ">
              Browse by interest
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-sky-deep hover:underline cursor-pointer "
              >
                Reset filter
              </button>
            )}
          </div>

          {/* Stays in one row on desktop (md:grid-cols-6) and 3 columns on mobile */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {CATEGORIES.map((cat) => {
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

        {/* ── Trending Majors (Bigger Multi-Column Cards on Desktop) ── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              {selectedCategory ? `${selectedCategory} Majors` : "Trending Majors"}
            </h2>
            <Link
              href="/majors/all"
              className="text-xs sm:text-sm font-bold text-sky-deep hover:text-sky transition-colors flex items-center gap-1 cursor-pointer"
            >
              View All <span>→</span>
            </Link>
          </div>

          {filteredMajors.length === 0 ? (
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
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky text-white text-xs sm:text-sm font-bold hover:bg-sky-bright transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Responsive Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop (Top 5 Majors) */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {filteredMajors.slice(0, 5).map((major) => {
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

                          {major.badge && (
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${major.badge.bg} ${major.badge.textColor}`}
                            >
                              {major.badge.text}
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

                        {/* Action Button */}
                        <Link
                          href={`/majors/${major.id}`}
                          className="w-full rounded-full border-2 border-sky/50 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-sky-deep hover:bg-sky/10 hover:border-sky transition-colors text-center cursor-pointer block"
                        >
                          Explore Major
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredMajors.length > 5 && (
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

        {/* ── Detail & Verification Modal ──────────────────── */}
        {selectedMajor && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
            <div
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6 bubble-shadow border border-sky/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl ${selectedMajor.iconBg} flex items-center justify-center`}
                  >
                    <selectedMajor.icon
                      className={`w-6 h-6 ${selectedMajor.iconColor}`}
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-blue-ink">
                      {selectedMajor.name}
                    </h3>
                    <p className="text-xs text-gray-soft font-semibold">
                      {selectedMajor.degreeType} · {selectedMajor.duration}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMajor(null)}
                  className="p-1.5 rounded-full hover:bg-powder text-gray-soft hover:text-blue-ink transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-body leading-relaxed mb-5 font-medium">
                {selectedMajor.description}
              </p>

              {/* Related Pathways */}
              <div className="rounded-2xl bg-powder p-4 border border-sky/15 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-ink mb-2">
                  Related Career Pathways
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMajor.careerPathways.map((c) => (
                    <span
                      key={c.title}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-ink border border-sky/15"
                    >
                      <Check className="w-3 h-3 text-sky-deep" />
                      {c.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* DMIL Verification Card */}
              <div className="rounded-2xl bg-momo p-4 border border-momo mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-deep" />
                    <span className="text-xs font-bold text-blue-ink uppercase tracking-wider">
                      Information Check
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-deep">
                    Verified Source
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-blue-ink mt-2 font-medium">
                  <div>
                    <span className="text-[11px] text-gray-soft block">Curriculum Source:</span>
                    <span className="font-bold">{selectedMajor.source}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-soft block">Last Checked:</span>
                    <span className="font-bold">{selectedMajor.lastVerified}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={`/majors/${selectedMajor.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-sky py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky-bright transition-colors bubble-shadow-sm text-center"
                >
                  View Full Major Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setSelectedMajor(null)}
                  className="px-5 py-3 rounded-full border-2 border-sky/20 text-xs sm:text-sm font-bold text-gray-soft hover:bg-powder transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}

