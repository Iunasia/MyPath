"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { Link, usePathname, useRouter } from "@/src/i18n";
import { Button, EmptyState, FilterPill, Pagination, SearchInput } from "@/app/components/ui";
import {
  applyMajorTranslations,
  applyMajorCategoriesTranslations,
  type MajorTranslations,
} from "@/app/data/majors";
import enMajors from "@/app/data-translations/en/majors.json";
import kmMajors from "@/app/data-translations/km/majors.json";
import Footer from "@/app/components/Footer";

const ITEMS_PER_PAGE = 8;

function AllMajorsInner() {
  const t = useTranslations("allMajors");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const majorsData = locale === "km" ? kmMajors : enMajors;

  const majors = useMemo(
    () =>
      applyMajorTranslations(
        (majorsData.items ?? {}) as Record<string, MajorTranslations>
      ),
    [majorsData]
  );

  const categories = useMemo(() => applyMajorCategoriesTranslations(majorsData), [majorsData]);

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

  const filteredMajors = useMemo(() => {
    return majors.filter((major) => {
      const matchesCategory = selectedCategory
        ? major.category === selectedCategory
        : true;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        major.name.toLowerCase().includes(q) ||
        major.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        major.skillsDeveloped.some((skill) => skill.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, majors]);

  const totalPages = Math.max(1, Math.ceil(filteredMajors.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMajors = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredMajors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMajors, safePage]);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Page Header & Search ─────────────────────────── */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {t("heroTitle")}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-soft mt-3 leading-relaxed font-medium">
                {t("heroSubtitle")}
              </p>
            </div>

            <SearchInput
              name="q"
              value={searchQuery}
              onChange={(value) => onFilterChange({ q: value || null, category: selectedCategory })}
              placeholder={t("searchPlaceholder")}
              ariaLabel={t("searchPlaceholder")}
              className="w-full lg:max-w-md"
            />
          </div>
        </section>

        {/* ── Category Filter Pills ────────────────────────── */}
        <section className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div role="group" aria-label={t("filterByCategory")} className="flex items-center gap-2 min-w-max">
            <FilterPill
              label={t("allMajors")}
              selected={selectedCategory === null}
              onClick={() => onFilterChange({ q: searchQuery, category: null })}
            />
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <FilterPill
                  key={cat.id}
                  label={cat.name}
                  selected={isSelected}
                  onClick={() =>
                    onFilterChange({ q: searchQuery, category: isSelected ? null : cat.id })
                  }
                />
              );
            })}
          </div>
        </section>

        {/* ── Majors Grid ───────────────────────────────────── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5 min-h-6">
            {selectedCategory && (
              <Button variant="ghost" size="xs" onClick={() => onFilterChange({ q: searchQuery, category: null })}>
                {tCommon("resetFilter")}
              </Button>
            )}
          </div>

          {filteredMajors.length === 0 ? (
            <EmptyState
              icon={Compass}
              title={t("noMajorsMatch")}
              description={t("noMajorsMatchHint")}
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
                {paginatedMajors.map((major) => (
                  <li key={major.id} className="h-full">
                    <article className="bg-white rounded-lg border border-sky/20 overflow-hidden hover:border-sky transition-colors duration-150 ease-out flex flex-col justify-between group cursor-pointer h-full">
                      <div>
                        {/* Top Image */}
                        <Link href={`/majors/${major.id}`} className="block w-full h-[165px] overflow-hidden bg-sky/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={major.heroImage}
                            alt={major.name}
                            width={640}
                            height={360}
                            decoding="async"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </Link>

                        {/* Card Content: Title */}
                        <div className="p-4 pb-3">
                          <Link href={`/majors/${major.id}`}>
                            <h3 className="font-display text-base font-bold text-blue-ink group-hover:text-sky-deep transition-colors leading-snug line-clamp-2 min-h-[44px]">
                              {major.name}
                            </h3>
                          </Link>
                        </div>
                      </div>

                      {/* Bottom: 2 text lines on left aligned with View more label on right */}
                      <div className="p-4 pt-3 pb-4 border-t border-sky/10 flex items-center justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs text-gray-soft font-medium line-clamp-1">
                            {major.category} • {major.duration}
                          </p>
                          <p className="text-xs font-semibold text-blue-ink line-clamp-1">
                            {t("marketDemand")} <span className="font-bold text-sky-deep">{major.jobMarketDemand}</span>
                          </p>
                        </div>

                        <Link
                          href={`/majors/${major.id}`}
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

export default function AllMajorsPage() {
  return (
    <Suspense fallback={null}>
      <AllMajorsInner />
    </Suspense>
  );
}