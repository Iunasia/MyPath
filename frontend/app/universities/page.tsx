"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MapPin, SlidersHorizontal, Building2, AlertTriangle, Loader2 } from "lucide-react";
import Footer from "@/app/components/Footer";
import ListHero from "@/app/components/ListHero";
import SaveItemButton from "@/app/components/SaveItemButton";
import CompareButton from "@/app/components/CompareButton";
import { fetchUniversities } from "@/app/lib/api";
import { toUniversityViews, type UniversityView } from "@/app/lib/catalogAdapters";

export default function UniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [universities, setUniversities] = useState<UniversityView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchUniversities()
      .then((rows) => {
        if (!cancelled) setUniversities(toUniversityViews(rows));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load universities");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Locations come from the data, so a university in a new city filters
  // correctly without editing a constant.
  const locations = useMemo(
    () => ["All Locations", ...new Set(universities.map((u) => u.location))],
    [universities]
  );

  // Filter universities based on search and filters
  const filteredUniversities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return universities.filter((uni) => {
      const matchesSearch =
        q === "" ||
        uni.name.toLowerCase().includes(q) ||
        uni.shortName.toLowerCase().includes(q) ||
        uni.location.toLowerCase().includes(q) ||
        uni.popularMajors.some((m) => m.toLowerCase().includes(q)) ||
        uni.scholarshipsList.some((s) => s.toLowerCase().includes(q));

      const matchesLocation =
        selectedLocation === "All Locations" || uni.location === selectedLocation;

      const matchesType = !selectedType || uni.type === selectedType;

      return Boolean(matchesSearch && matchesLocation && matchesType);
    });
  }, [universities, searchQuery, selectedLocation, selectedType]);

  const hasActiveFilters = selectedLocation !== "All Locations" || selectedType !== null || searchQuery !== "";

  const resetFilters = () => {
    setSelectedLocation("All Locations");
    setSelectedType(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Responsive Viewport Container: 25px on mobile, 80px on desktop */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">

        <ListHero
          title="Find a university"
          description="Public, private and international universities in Cambodia, with their programmes, tuition and scholarships."
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search by name, major or scholarship",
          }}
        />

        {/* ── Filter Controls ─────────────────────────────── */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sky/15">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Location Selector */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  aria-label="Location"
                  className="appearance-none bg-white border border-sky/25 text-blue-ink text-xs font-bold pl-8 pr-8 py-2 rounded-full cursor-pointer hover:border-sky transition-colors focus:outline-none focus:ring-2 focus:ring-sky/30 bubble-shadow-sm"
                >
                  {locations.map((loc) => (
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
                    aria-pressed={isSelected}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-deep text-white bubble-shadow-sm"
                        : "bg-white text-blue-ink border border-sky/20 hover:border-sky bubble-shadow-sm"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-sky-deep hover:underline px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {!loading && !loadError && (
              <span className="text-xs font-bold text-gray-soft uppercase tracking-wider">
                {filteredUniversities.length}{" "}
                {filteredUniversities.length === 1 ? "university" : "universities"}
              </span>
            )}
          </div>
        </section>

        {/* ── Universities Grid (6 cols desktop, 3 tablet, 2 mobile) ──
            All on one page: the catalogue is small enough that paging split
            twelve universities into ten and two. */}
        <section className="flex-1 pb-16">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-soft">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Loading universities…</span>
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm max-w-lg mx-auto mt-6">
              <AlertTriangle className="w-12 h-12 text-momo mx-auto mb-3" />
              <p className="font-bold text-blue-ink text-base">
                Couldn&apos;t load universities
              </p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                {loadError}. Check that the API is running, then try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-sky/15 bubble-shadow-sm max-w-lg mx-auto mt-6">
              <Building2 className="w-12 h-12 text-sky-deep mx-auto mb-3 opacity-60" />
              <p className="font-bold text-blue-ink text-base">
                No universities found
              </p>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                Try clearing your search or picking a different location filter.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-colors cursor-pointer"
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
                  className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 block"
                >
                  {/* University Campus Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                  {/* Type Badge on Top */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                    <span className="bg-black/40 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15">
                      {uni.type}
                    </span>
                  </div>

                  {/* Compare + Save Buttons on Card Image */}
                  <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1">
                    <CompareButton
                      variant="card-action"
                      item={{
                        type: "university",
                        apiId: uni.apiId,
                        title: uni.name,
                        subtitle: uni.location,
                      }}
                    />
                    <SaveItemButton
                      variant="card-action"
                      item={{
                        id: uni.id,
                        apiId: uni.apiId,
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
        </section>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
