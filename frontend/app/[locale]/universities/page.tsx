"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Building2 } from "lucide-react";
import { Link, usePathname, useRouter } from "@/src/i18n";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  Button,
  EmptyState,
  FilterPill,
  FilterSelect,
  Pagination,
  SearchInput,
  type SelectOption,
} from "@/app/components/ui";
import {
  LOCATIONS,
  applyUniversityTranslations,
  type UniversityTranslations,
} from "@/app/data/universities";
import enUniversities from "@/app/data-translations/en/universities.json";
import kmUniversities from "@/app/data-translations/km/universities.json";

const ITEMS_PER_PAGE = 10;

function UniversitiesInner() {
  const t = useTranslations("universities");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const uniData = locale === "km" ? kmUniversities : enUniversities;

  const universities = useMemo(
    () =>
      applyUniversityTranslations(
        (uniData.items ?? {}) as unknown as Record<string, UniversityTranslations>
      ),
    [uniData]
  );

  const locations = useMemo(() => {
    const jsonLocations = uniData.locations;
    if (jsonLocations && jsonLocations.length > 0) {
      return jsonLocations.map((loc) => loc.name);
    }
    return LOCATIONS;
  }, [uniData]);

  const allLocations = locations[0] ?? "All Locations";

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedLocation = searchParams.get("location") ?? allLocations;
  const selectedType = searchParams.get("type");
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const updateUrl = (patch: {
    q?: string | null;
    location?: string | null;
    type?: string | null;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (key === "page") {
        if (value === 1) params.delete(key);
        else params.set(key, String(value));
      } else if (value && value !== allLocations) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onFilterChange = (patch: {
    q?: string | null;
    location?: string | null;
    type?: string | null;
  }) => updateUrl({ ...patch, page: 1 });

  const filteredUniversities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return universities.filter((uni) => {
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
        selectedLocation === allLocations || uni.location === selectedLocation;

      const matchesType = !selectedType || uni.type === selectedType;

      return Boolean(matchesSearch && matchesLocation && matchesType);
    });
  }, [searchQuery, selectedLocation, selectedType, allLocations, universities]);

  const totalPages = Math.max(1, Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUniversities = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredUniversities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUniversities, safePage]);

  const locationOptions: SelectOption[] = locations.map((loc) => ({ value: loc, label: loc }));

  const hasActiveFilters =
    searchQuery !== "" || selectedLocation !== allLocations || selectedType !== null;

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <section className="relative rounded-3xl overflow-hidden mb-10 border border-sky/20 bubble-shadow-sm min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.waca.or.jp/en/wp-content/uploads/2021/03/vasily-koloda-8CqDvPuo_kI-unsplash-860x573.jpg"
            alt=""
            role="presentation"
            width={860}
            height={573}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />

          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl w-full">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 drop-shadow-sm">
              {t("heroTitle")}
            </h1>

            <SearchInput
              name="q"
              value={searchQuery}
              onChange={(value) => onFilterChange({ q: value || null, location: selectedLocation, type: selectedType })}
              placeholder={t("searchPlaceholder")}
              ariaLabel={t("searchPlaceholder")}
              className="max-w-md"
            />
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-sky/15">
            <div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-blue-ink tracking-tight">
                {t("sectionTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">
                {t("sectionSubtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div role="group" aria-label={t("filterTypeLabel")} className="flex items-center gap-1.5 bg-white/80 p-1 rounded-full border border-sky/20 bubble-shadow-2xs">
                {[t("public"), t("private")].map((type) => {
                  const rawType = type === t("public") ? "Public" : "Private";
                  const isSelected = selectedType === rawType;
                  return (
                    <FilterPill
                      key={rawType}
                      label={type}
                      selected={isSelected}
                      onClick={() =>
                        onFilterChange({ q: searchQuery, location: selectedLocation, type: isSelected ? null : rawType })
                      }
                    />
                  );
                })}
              </div>

              <FilterSelect
                name="location"
                value={selectedLocation}
                onChange={(value) => onFilterChange({ q: searchQuery, location: value, type: selectedType })}
                options={locationOptions}
                ariaLabel={t("filterLocationLabel")}
              />

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onFilterChange({ q: null, location: null, type: null })}
                >
                  {tCommon("reset")}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs font-bold text-gray-soft uppercase tracking-wider mt-4">
            {selectedType
              ? t(`${selectedType.toLowerCase()}Institutions`)
              : selectedLocation !== allLocations
              ? t("institutionsIn", { location: selectedLocation })
              : t("allInstitutions")}
          </p>
        </section>

        <section className="flex-1 pb-16">
          {filteredUniversities.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t("noUniversitiesFound")}
              description={t("noUniversitiesHint")}
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onFilterChange({ q: null, location: null, type: null })}
                >
                  {tCommon("clearAllFilters")}
                </Button>
              }
            />
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {paginatedUniversities.map((uni) => (
                <li key={uni.id} className="h-full">
                  <Link
                    href={`/universities/${uni.id}`}
                    className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-[transform,box-shadow,border-color] duration-300 block h-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uni.image}
                      alt={uni.name}
                      width={600}
                      height={800}
                      decoding="async"
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                      <span className="bg-black/40 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15">
                        {uni.type}
                      </span>
                    </div>

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

                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                      <h3 className="font-display font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm mb-2 group-hover:text-sky-bright transition-colors">
                        {uni.name}
                      </h3>

                      <div className="flex items-center justify-between gap-1 text-white">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/90 font-medium truncate">
                          <MapPin className="w-3 h-3 text-sitomo shrink-0" aria-hidden="true" />
                          <span className="truncate">{uni.location}</span>
                        </span>

                        <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shrink-0 shadow-2xs">
                          {uni.shortName}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(page) => {
                updateUrl({ page });
                window.scrollTo({ top: 350, behavior: "smooth" });
              }}
              labels={{
                prev: tCommon("prev"),
                next: tCommon("next"),
                page: tCommon("pageLabel"),
                pageOf: tCommon("pageOf", { current: safePage, total: totalPages }),
              }}
            />
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <Suspense fallback={null}>
      <UniversitiesInner />
    </Suspense>
  );
}