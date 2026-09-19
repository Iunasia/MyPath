"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Coins, Calendar, Rocket, Lightbulb, Target } from "lucide-react";
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
  SCHOLARSHIP_CATEGORIES,
  COVERAGE_FILTERS,
  applyScholarshipTranslations,
  type ScholarshipTranslations,
} from "@/app/data/scholarships";
import enScholarships from "@/app/data-translations/en/scholarships.json";
import kmScholarships from "@/app/data-translations/km/scholarships.json";

const ITEMS_PER_PAGE = 8;

function ScholarshipsInner() {
  const t = useTranslations("scholarships");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const scholarshipsData = locale === "km" ? kmScholarships : enScholarships;

  const scholarships = useMemo(
    () =>
      applyScholarshipTranslations(
        (scholarshipsData.items ?? {}) as unknown as Record<
          string,
          ScholarshipTranslations
        >
      ),
    [scholarshipsData]
  );

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "All Categories";
  const selectedCoverage = searchParams.get("coverage") ?? "All Coverage";
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const updateUrl = (patch: {
    q?: string | null;
    category?: string | null;
    coverage?: string | null;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (key === "page") {
        if (value === 1) params.delete(key);
        else params.set(key, String(value));
      } else if (value && value !== "All Categories" && value !== "All Coverage") {
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
    category?: string | null;
    coverage?: string | null;
  }) => updateUrl({ ...patch, page: 1 });

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
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
  }, [searchQuery, selectedCategory, selectedCoverage, scholarships]);

  const totalPages = Math.max(1, Math.ceil(filteredScholarships.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedScholarships = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredScholarships.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredScholarships, safePage]);

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All Categories" || selectedCoverage !== "All Coverage";

  const resetFilters = () => updateUrl({ q: null, category: null, coverage: null, page: 1 });

  const coverageOptions: SelectOption[] = COVERAGE_FILTERS.map((cov) => ({ value: cov, label: cov }));

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {t("heroTitle1")}{" "}
                <span className="text-[#5B9DA2] decoration-sky/40 underline-offset-4">
                  {t("heroTitleHighlight")}
                </span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                {t("heroSubtitle")}
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <SearchInput
                name="q"
                size="sm"
                value={searchQuery}
                onChange={(value) => onFilterChange({ q: value || null, category: selectedCategory, coverage: selectedCoverage })}
                placeholder={t("searchPlaceholder")}
                ariaLabel={t("searchPlaceholder")}
              />
            </div>
          </div>
        </section>

        {/* ── Filters ─────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 pb-4 border-b border-sky/15">
            <div role="group" aria-label={t("filterCategoryLabel")} className="flex flex-wrap items-center gap-2">
              {SCHOLARSHIP_CATEGORIES.map((cat) => (
                <FilterPill
                  key={cat}
                  label={cat}
                  selected={selectedCategory === cat}
                  onClick={() => onFilterChange({ q: searchQuery, category: cat, coverage: selectedCoverage })}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <FilterSelect
                  name="coverage"
                  value={selectedCoverage}
                  onChange={(value) => onFilterChange({ q: searchQuery, category: selectedCategory, coverage: value })}
                  options={coverageOptions}
                  ariaLabel={t("filterCoverageLabel")}
                />

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={resetFilters}
                    className="px-2"
                  >
                    {tCommon("resetFilters")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 pb-16">
          {filteredScholarships.length === 0 ? (
            <EmptyState
              icon={Coins}
              title={t("noScholarshipsMatch")}
              description={t("noScholarshipsHint")}
              action={
                <Button variant="primary" size="md" onClick={resetFilters}>
                  {tCommon("clearAllFilters")}
                </Button>
              }
            />
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {paginatedScholarships.map((scholarship) => (
                  <li key={scholarship.id} className="h-full">
                    <Link
                      href={`/scholarships/${scholarship.id}`}
                      className="group relative aspect-[4/3] min-h-[190px] rounded-lg overflow-hidden cursor-pointer border border-sky/15 hover:border-sky transition-colors duration-150 ease-out block bg-sitomo/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scholarship.image}
                        alt={scholarship.title}
                        width={600}
                        height={450}
                        decoding="async"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />

                      <div className="absolute top-3 right-3 z-20">
                        <SaveItemButton
                          variant="card-action"
                          item={{
                            id: scholarship.id,
                            apiId: scholarship.apiId,
                            type: "scholarship",
                            title: scholarship.title,
                            subtitle: scholarship.provider,
                            image: scholarship.image,
                            link: `/scholarships/${scholarship.id}`,
                          }}
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-3.5 sm:p-4 z-10">
                        <h3 className="font-display text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1.5 group-hover:text-sky-bright transition-colors line-clamp-2">
                          {scholarship.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/75 font-medium drop-shadow-xs">
                          <Calendar className="w-3 h-3 text-sky-bright shrink-0" aria-hidden="true" />
                          <span>{tCommon("deadline")}: {scholarship.deadline}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    updateUrl({ page });
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  labels={{
                    prev: tCommon("prev"),
                    next: tCommon("next"),
                    page: tCommon("pageLabel"),
                    pageOf: tCommon("pageOf", { current: safePage, total: totalPages }),
                  }}
                />
              )}
            </>
          )}
        </section>

        {/* ── Section Divider Line ──────────────────────────────── */}
        <div className="w-full border-t border-sky/25 mb-14" />

        {/* ── Information Check & Trust Guarantee Section (No background card, infographic style) ── */}
        <section className="w-full mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink tracking-tight">
              {t("howDoesDomnerVerify")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium mt-2">
              {t("howDoesDomnerVerifyDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-2 max-w-5xl mx-auto">
            {/* Step 1: Direct Links (Rocket) */}
            <div className="group relative bg-white rounded-lg p-6 sm:p-7 border border-sky/15 hover:border-sky transition-colors duration-150 ease-out flex flex-col items-center text-center justify-center min-h-[160px]">
              <div className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-deep text-white flex items-center justify-center">
                <Rocket className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
              </div>
              <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                {t("directLinks")}
              </h3>
              <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                {t("directLinksDesc")}
              </p>
            </div>

            {/* Step 2: Zero Hidden Fees (Lightbulb) */}
            <div className="group relative bg-white rounded-lg p-6 sm:p-7 border border-sky/15 hover:border-sky transition-colors duration-150 ease-out flex flex-col items-center text-center justify-center min-h-[160px]">
              <div className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-deep text-white flex items-center justify-center">
                <Lightbulb className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
              </div>
              <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                {t("zeroHiddenFees")}
              </h3>
              <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                {t("zeroHiddenFeesDesc")}
              </p>
            </div>

            {/* Step 3: Updated Deadlines (Target) */}
            <div className="group relative bg-white rounded-lg p-6 sm:p-7 border border-sky/15 hover:border-sky transition-colors duration-150 ease-out flex flex-col items-center text-center justify-center min-h-[160px]">
              <div className="absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-deep text-white flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
              </div>
              <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                {t("updatedDeadlines")}
              </h3>
              <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                {t("updatedDeadlinesDesc")}
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={null}>
      <ScholarshipsInner />
    </Suspense>
  );
}