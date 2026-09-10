"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  UNIVERSITIES_DATA,
  LOCATIONS,
} from "@/app/data/universities";

export default function UniversitiesPage() {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter universities based on search and filters
  const filteredUniversities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return UNIVERSITIES_DATA.filter((uni) => {
      const matchesSearch =
        q === "" ||
        uni.name.toLowerCase().includes(q) ||
        uni.shortName.toLowerCase().includes(q) ||
        uni.location.toLowerCase().includes(q) ||
        uni.popularMajors.some((m) => m.toLowerCase().includes(q)) ||
        uni.facultiesList?.some(
          (f) =>
            f.facultyName.toLowerCase().includes(q) ||
            f.majors.some((m) => m.toLowerCase().includes(q))
        );

      const matchesLocation =
        selectedLocation === "All Locations" || uni.location === selectedLocation;

      const matchesType = !selectedType || uni.type === selectedType;

      return Boolean(matchesSearch && matchesLocation && matchesType);
    });
  }, [searchQuery, selectedLocation, selectedType]);

  // Reset page on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocation, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE));
  const paginatedUniversities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUniversities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUniversities, currentPage]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Responsive Viewport Container: 25px on mobile, 80px on desktop */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Top Header Component ────────────────────────── */}
        <Header backHref="/" backLabel="DOMNER" activeNav="universities" />

        {/* ── Hero Banner: Discover Universities ───────────── */}
        <section className="relative rounded-3xl overflow-hidden mb-10 border border-sky/20 bubble-shadow-sm min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex items-center">
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.waca.or.jp/en/wp-content/uploads/2021/03/vasily-koloda-8CqDvPuo_kI-unsplash-860x573.jpg"
            alt="University Graduation and Campus"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl w-full">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-[11px] font-extrabold uppercase tracking-wider mb-3 border border-white/25">
              Higher Education Directory
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 drop-shadow-sm">
              Discover Universities
            </h1>

            {/* Search Bar inside Hero */}
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none z-10">
                <Search className="w-5 h-5 text-black" strokeWidth={2.2} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for University..."
                className="w-full pl-12 pr-10 py-3.5 bg-white rounded-full text-sm text-blue-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky focus:bg-white transition-all bubble-shadow-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black hover:opacity-70 cursor-pointer z-10"
                >
                  <X className="h-4 w-4 text-black" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Section Title & Filter Controls ──────────────── */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-sky/15">
            <div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-blue-ink tracking-tight">
                Have you considered{" "}
                <span className="text-sky-deep">
                  where to study?
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                Discover Universities and find the right one for you
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Location Selector */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none bg-white border border-sky/25 text-blue-ink text-xs font-bold pl-8 pr-8 py-2 rounded-full cursor-pointer hover:border-sky transition-colors focus:outline-none focus:ring-2 focus:ring-sky/30 bubble-shadow-sm"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <MapPin className="w-3.5 h-3.5 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <SlidersHorizontal className="w-3 h-3 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Type Filters */}
              {["Public", "Private", "International"].map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(isSelected ? null : type)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky text-white bubble-shadow-sm"
                        : "bg-white text-blue-ink border border-sky/20 hover:border-sky bubble-shadow-sm"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}

              {(selectedLocation !== "All Locations" || selectedType || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedLocation("All Locations");
                    setSelectedType(null);
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-sky-deep hover:underline px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-gray-soft uppercase tracking-wider">
              {selectedType
                ? `${selectedType} Institutions`
                : selectedLocation !== "All Locations"
                ? `Institutions in ${selectedLocation}`
                : "All Institutions"}
            </span>
          </div>
        </section>

        {/* ── Universities Responsive Grid (5 cols desktop, 3 cols tablet, 2 cols mobile) ── */}
        <section className="flex-1 pb-16">
          {filteredUniversities.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm max-w-lg mx-auto mt-6">
              <Building2 className="w-12 h-12 text-sky-deep mx-auto mb-3 opacity-60" />
              <p className="font-bold text-blue-ink text-base">
                No universities found
              </p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                Try clearing your search or picking a different location filter.
              </p>
              <button
                onClick={() => {
                  setSelectedLocation("All Locations");
                  setSelectedType(null);
                  setSearchQuery("");
                }}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky text-white text-xs sm:text-sm font-bold hover:bg-sky-bright transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {paginatedUniversities.map((uni) => (
                <Link
                  key={uni.id}
                  href={`/universities/${uni.id}`}
                  className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 block"
                >
                  {/* University Campus Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                  {/* Type Badge on Top */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                    <span className="bg-black/40 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15">
                      {uni.type}
                    </span>
                  </div>

                  {/* Save Button on Card Image */}
                  <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20">
                    <SaveItemButton
                      variant="card-action"
                      item={{
                        id: uni.id,
                        type: "university",
                        title: uni.name,
                        subtitle: uni.location,
                        image: uni.image,
                        badge: uni.type,
                        link: `/universities/${uni.id}`,
                      }}
                    />
                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                    <h3 className="font-display font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm mb-2 group-hover:text-sky-bright transition-colors">
                      {uni.name}
                    </h3>

                    <div className="flex items-center justify-between gap-1 text-white">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/90 font-medium truncate">
                        <MapPin className="w-3 h-3 text-sitomo shrink-0" />
                        <span className="truncate">{uni.location}</span>
                      </span>

                      <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shrink-0 shadow-2xs">
                        {uni.shortName}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-sky/20">
              <span className="text-xs font-bold text-gray-soft">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sky/30 bg-white text-blue-ink text-xs font-bold hover:bg-sitomo/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all bubble-shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 350, behavior: "smooth" });
                      }}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-sky text-white bubble-shadow-sm"
                          : "bg-white border border-sky/20 text-blue-ink hover:bg-sitomo/60"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sky/30 bg-white text-blue-ink text-xs font-bold hover:bg-sitomo/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all bubble-shadow-sm cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
