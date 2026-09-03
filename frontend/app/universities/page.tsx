"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Building2,
  X,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  UNIVERSITIES_DATA,
  LOCATIONS,
} from "@/app/data/universities";

export default function UniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter universities based on search and filters
  const filteredUniversities = useMemo(() => {
    return UNIVERSITIES_DATA.filter((uni) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        uni.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        uni.shortName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        uni.location.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        uni.popularMajors.some((m) =>
          m.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );

      const matchesLocation =
        selectedLocation === "All Locations" || uni.location === selectedLocation;

      const matchesType = !selectedType || uni.type === selectedType;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [searchQuery, selectedLocation, selectedType]);

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
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80"
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
                <Search className="w-5 h-5 text-blue-ink/60" strokeWidth={2.2} />
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-blue-ink cursor-pointer z-10"
                >
                  <X className="h-4 w-4" />
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
                <span className="text-sky-deep underline decoration-sky/40 underline-offset-4">
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
                <MapPin className="w-3.5 h-3.5 text-sky-deep absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <SlidersHorizontal className="w-3 h-3 text-gray-soft absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              Showing {filteredUniversities.length} Institutions
            </span>
          </div>
        </section>

        {/* ── Universities Responsive Grid (6 cols desktop, 3 cols tablet, 2 cols mobile) ── */}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
              {filteredUniversities.map((uni) => (
                <Link
                  key={uni.id}
                  href={`/universities/${uni.id}`}
                  className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg block"
                >
                  {/* University Campus Image (Darkens on Hover) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-110 group-hover:brightness-75"
                  />

                  {/* Dark Gradient Overlay (Darkens on Hover while text stays white) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover:from-black/95 group-hover:via-black/55 group-hover:to-black/20 transition-all duration-300" />

                  {/* Type Badge on Top */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                    <span className="bg-black/40 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15">
                      {uni.type}
                    </span>
                  </div>

                  {/* Bottom Text Content (Always Crisp White) */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                    <h3 className="font-display font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm mb-2 group-hover:text-sitomo transition-colors">
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
        </section>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
