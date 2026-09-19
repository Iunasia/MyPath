"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Briefcase } from "lucide-react";
import { Link, usePathname, useRouter } from "@/src/i18n";
import { Button, EmptyState, Pagination, SearchInput } from "@/app/components/ui";

import {
  CAREER_CATEGORIES,
  applyCareerTranslations,
  type CareerTranslations,
} from "@/app/data/careers";
import enCareers from "@/app/data-translations/en/careers.json";
import kmCareers from "@/app/data-translations/km/careers.json";
import Footer from "@/app/components/Footer";

const ITEMS_PER_PAGE = 8;

function CareersInner() {
  const t = useTranslations("careers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const careersData = locale === "km" ? kmCareers : enCareers;

  const careers = useMemo(
    () =>
      applyCareerTranslations(
        (careersData.items ?? {}) as Record<string, CareerTranslations>
      ),
    [careersData]
  );

  const categories = useMemo(() => {
    const translated = careersData.categories ?? [];
    return CAREER_CATEGORIES.map((cat) => ({
      ...cat,
      name: translated.find((tc) => tc.id === cat.id)?.name ?? cat.name,
    }));
  }, [careersData]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category");
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const updateUrl = (patch: { q?: string | null; category?: string | null; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (key === "page") {
        if (value === 1) params.delete(key);
        else params.set(key, String(value));
      } else if (value) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onFilterChange = (patch: { q?: string | null; category?: string | null }) =>
    updateUrl({ ...patch, page: 1 });

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
            career.relatedMajors.some((m) => m.name.toLowerCase().includes(q)) ||
            career.relatedMajorsText.some((m) => m.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, careers]);

  const totalPages = Math.max(1, Math.ceil(filteredCareers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCareers = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredCareers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCareers, safePage]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col flex-1">
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {t("heroTitle1")}
                <br />
                <span className="text-[#5B9DA2]">{t("heroTitle2")}</span>
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
                onChange={(value) => onFilterChange({ q: value || null, category: selectedCategory })}
                placeholder={t("searchPlaceholder")}
                ariaLabel={t("searchPlaceholder")}
              />
            </div>
          </div>
        </section>

        {/* ── Category Filter ─────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-blue-ink tracking-tight">
              {t("browseByField")}
            </h2>
            {selectedCategory && (
              <Button variant="ghost" size="xs" onClick={() => onFilterChange({ q: searchQuery, category: null })}>
                {tCommon("resetFilter")}
              </Button>
            )}
          </div>

          <div role="group" aria-label={t("browseByField")} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      q: searchQuery,
                      category: isSelected ? null : cat.id,
                    })
                  }
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 lg:p-6 rounded-lg border-2 text-center group cursor-pointer min-h-[120px] sm:min-h-[135px] transition-colors duration-150 ease-out ${
                    isSelected
                      ? "border-[#7AB3B7] ring-2 ring-[#7AB3B7]/30 bg-[#7AB3B7]/10"
                      : "border-[#7AB3B7] bg-white hover:border-[#7AB3B7]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full ${cat.bg} flex items-center justify-center mb-2.5`}
                  >
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6 text-sky-deep"
                      strokeWidth={2.2}
                      aria-hidden="true"
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
          <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight mb-5">
            {selectedCategory
              ? t("categoryCareers", { category: categories.find((c) => c.id === selectedCategory)?.name ?? selectedCategory })
              : t("allCareers")}
          </h2>

          {filteredCareers.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t("noCareersFound")}
              description={t("noCareersHint")}
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onFilterChange({ q: null, category: null })}
                >
                  {tCommon("clearAllFilters")}
                </Button>
              }
            />
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {paginatedCareers.map((career) => (
                  <li key={career.id} className="h-full">
                    <article className="bg-white rounded-lg border border-sky/20 overflow-hidden hover:border-sky transition-colors duration-150 ease-out flex flex-col justify-between group cursor-pointer h-full">
                      <div>
                        {/* Top Image */}
                        <Link href={`/careers/${career.id}`} className="block w-full h-[165px] overflow-hidden bg-sky/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={career.image}
                            alt={career.title}
                            width={640}
                            height={360}
                            decoding="async"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </Link>

                        {/* Card Content: Title */}
                        <div className="p-4 pb-3">
                          <Link href={`/careers/${career.id}`}>
                            <h3 className="font-display text-base font-bold text-blue-ink group-hover:text-sky-deep transition-colors leading-snug line-clamp-2 min-h-[44px]">
                              {career.title}
                            </h3>
                          </Link>
                        </div>
                      </div>

                      {/* Bottom: 2 text lines on left aligned with View more label on right */}
                      <div className="p-4 pt-3 pb-4 border-t border-sky/10 flex items-center justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs text-gray-soft font-medium line-clamp-1">
                            {career.categoryLabel ?? career.category}
                          </p>
                          <p className="text-xs font-semibold text-blue-ink line-clamp-1">
                            {t("marketDemand")} <span className="font-bold text-sky-deep">{career.jobMarketDemand}</span>
                          </p>
                        </div>

                        <Link
                          href={`/careers/${career.id}`}
                          className="inline-flex items-center justify-center text-[#7AB3B7] group-hover:text-blue-ink text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          {tCommon("viewMore")}
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

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
            </>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense fallback={null}>
      <CareersInner />
    </Suspense>
  );
}