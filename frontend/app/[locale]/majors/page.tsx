"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link, usePathname, useRouter } from "@/src/i18n";
import { Button, EmptyState, SearchInput } from "@/app/components/ui";
import {
  CATEGORIES,
  applyMajorTranslations,
  applyMajorCategoriesTranslations,
  type MajorTranslations,
} from "@/app/data/majors";
import enMajors from "@/app/data-translations/en/majors.json";
import kmMajors from "@/app/data-translations/km/majors.json";
import Footer from "@/app/components/Footer";

function MajorsInner() {
  const t = useTranslations("majors");
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

  const categories = useMemo(() => {
    const translated = applyMajorCategoriesTranslations(
      majorsData as { categories?: { id: string; name: string }[] }
    );
    return CATEGORIES.map((cat) => ({
      ...cat,
      name: translated.find((tc) => tc.id === cat.id)?.name ?? cat.name,
    }));
  }, [majorsData]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category");

  const updateUrl = (patch: { q?: string | null; category?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

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
                onChange={(value) => updateUrl({ q: value || null, category: selectedCategory })}
                placeholder={t("searchPlaceholder")}
                ariaLabel={t("searchPlaceholder")}
              />
            </div>
          </div>
        </section>

        {/* ── Browse by Interest ────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              {t("browseByInterest")}
            </h2>
            {selectedCategory && (
              <Button variant="ghost" size="xs" onClick={() => updateUrl({ q: searchQuery, category: null })}>
                {tCommon("resetFilter")}
              </Button>
            )}
          </div>

          <div role="group" aria-label={t("browseByInterest")} className="grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    updateUrl({
                      q: searchQuery,
                      category: isSelected ? null : cat.id,
                    })
                  }
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl rounded-br-[36px] sm:rounded-br-[48px] border-2 text-center group cursor-pointer min-h-[120px] sm:min-h-[135px] transition-[transform,box-shadow,border-color,background-color] duration-300 ${
                    isSelected
                      ? "border-[#7AB3B7] ring-2 ring-[#7AB3B7]/30 bg-[#7AB3B7]/10 bubble-shadow"
                      : "border-[#7AB3B7] bg-white hover:border-[#7AB3B7] bubble-shadow-sm hover:scale-[1.03] hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full ${cat.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-sky-deep" strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <span className="font-display text-xs sm:text-sm font-bold text-blue-ink leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Featured Majors ──────────────────────────────── */}
        <section className="flex-1 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink tracking-tight">
              {selectedCategory
                ? t("categoryMajors", { category: selectedCategory })
                : t("featuredMajors")}
            </h2>
            <Link
              href="/majors/all"
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-sky-deep hover:text-sky transition-colors cursor-pointer"
            >
              <span>{t("viewAllMajors")}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {filteredMajors.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t("noMajorsFound")}
              description={t("noMajorsHint")}
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => updateUrl({ q: null, category: null })}
                >
                  {tCommon("clearAllFilters")}
                </Button>
              }
            />
          ) : (
            <>
              <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredMajors.slice(0, 8).map((major) => (
                  <li key={major.id} className="h-full">
                    <article className="bg-white rounded-2xl border border-sky/20 overflow-hidden shadow-xs hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-[transform,box-shadow,border-color] duration-300 flex flex-col justify-between group cursor-pointer h-full">
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
                            <h3 className="font-display text-base font-bold text-blue-ink hover:text-sky-deep transition-colors leading-snug line-clamp-2 min-h-[44px]">
                              {major.name}
                            </h3>
                          </Link>
                        </div>
                      </div>

                      {/* Bottom: 2 text lines on left aligned with View more button on right */}
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
                          className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-[#7AB3B7] text-[#7AB3B7] hover:bg-[#7AB3B7] hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          {tCommon("viewMore")}
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

              {filteredMajors.length > 8 && (
                <div className="mt-10 text-center">
                  <Button href="/majors/all" variant="secondary" size="lg">
                    <span>{t("viewAllMajorsButton")}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default function MajorsPage() {
  return (
    <Suspense fallback={null}>
      <MajorsInner />
    </Suspense>
  );
}