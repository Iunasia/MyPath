"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  X,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { MAJORS_DATA, CATEGORIES, MajorItem } from "@/app/data/majors";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function AllMajorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter 12 majors by category and search keyword
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
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        
        {/* ── Top Header Component ────────────────────────── */}
        <Header backHref="/majors" backLabel="Back to Major Explorer" showBackArrow={true} activeNav="majors" />

        {/* ── Page Header & Search ─────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                All Majors &amp; Pathways
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                Explore our full catalog of university majors, curriculum requirements,
                accredited institutions, and verified career trajectories.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-4.5 w-4.5 text-blue-ink/60" strokeWidth={2.2} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all majors, skills, or fields..."
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

        {/* ── Category Filter Pills ────────────────────────── */}
        <section className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === null
                  ? "bg-sky text-white bubble-shadow-sm"
                  : "bg-white text-blue-ink border border-sky/20 hover:border-sky"
              }`}
            >
              All Majors
            </button>
            {CATEGORIES.map((cat) => {
              const count = MAJORS_DATA.filter((m) => m.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-sky text-white bubble-shadow-sm"
                      : "bg-white text-blue-ink border border-sky/20 hover:border-sky"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Majors Grid ───────────────────────────────────── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5">

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-sky-deep hover:underline cursor-pointer"
              >
                Reset filter
              </button>
            )}
          </div>

          {filteredMajors.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm max-w-lg mx-auto mt-6">
              <p className="font-bold text-blue-ink text-base">No majors match your search</p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5">
                Try searching for a different skill or reset your filters.
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
              {filteredMajors.map((major) => {
                const Icon = major.icon;

                return (
                  <article
                    key={major.id}
                    className="bg-white rounded-3xl p-6 lg:p-7 border border-sky/15 bubble-shadow-sm hover:border-sky/35 bubble-shadow-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Icon + Badge */}
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
                      <p className="text-xs sm:text-sm text-gray-body leading-relaxed mb-4 font-medium line-clamp-3">
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

                      {/* Explore Major Action linking to /majors/[id] */}
                      <Link
                        href={`/majors/${major.id}`}
                        className="block w-full rounded-full border-2 border-sky/50 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-sky-deep hover:bg-sky/10 hover:border-sky transition-colors text-center cursor-pointer"
                      >
                        Explore Major
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}

