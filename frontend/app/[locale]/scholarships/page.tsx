"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Coins, Calendar, CheckCircle2 } from "lucide-react";
import { Link, usePathname, useRouter } from "@/src/i18n";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  Badge,
  Button,
  EmptyState,
  FilterPill,
  FilterSelect,
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

  const updateUrl = (patch: { q?: string | null; category?: string | null; coverage?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value && value !== "All Categories" && value !== "All Coverage") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

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

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All Categories" || selectedCoverage !== "All Coverage";

  const resetFilters = () => updateUrl({ q: null, category: null, coverage: null });

  const coverageOptions: SelectOption[] = COVERAGE_FILTERS.map((cov) => ({ value: cov, label: cov }));

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-8 md:px-10 lg:px-[80px] flex flex-col">
        <section className="mb-10 text-center max-w-3xl mx-auto w-full pt-4 sm:pt-6">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-4">
            {t("heroTitle1")}{" "}
            <span className="text-sky-deep decoration-sky/40 underline-offset-4">
              {t("heroTitleHighlight")}
            </span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-soft mb-8 max-w-xl mx-auto font-medium">
            {t("heroSubtitle")}
          </p>

          <SearchInput
            name="q"
            value={searchQuery}
            onChange={(value) => updateUrl({ q: value || null, category: selectedCategory, coverage: selectedCoverage })}
            placeholder={t("searchPlaceholder")}
            ariaLabel={t("searchPlaceholder")}
            className="max-w-xl mx-auto mb-6"
          />

          <div role="group" aria-label={t("filterCategoryLabel")} className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {SCHOLARSHIP_CATEGORIES.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onClick={() => updateUrl({ q: searchQuery, category: cat, coverage: selectedCoverage })}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col gap-4 pb-4 border-b border-sky/15">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <FilterSelect
                  name="coverage"
                  value={selectedCoverage}
                  onChange={(value) => updateUrl({ q: searchQuery, category: selectedCategory, coverage: value })}
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredScholarships.map((scholarship) => (
                <li key={scholarship.id} className="h-full">
                  <Link
                    href={`/scholarships/${scholarship.id}`}
                    className="group relative aspect-[4/3] min-h-[190px] rounded-3xl rounded-br-[72px] overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-[transform,box-shadow,border-color] duration-300 block bg-sitomo/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scholarship.image}
                      alt={scholarship.title}
                      width={600}
                      height={450}
                      decoding="async"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 right-3 z-20">
                      <SaveItemButton
                        variant="card-action"
                        item={{
                          id: scholarship.id,
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
          )}
        </section>

        <section className="rounded-3xl rounded-br-[86px] sm:rounded-br-[86px] bg-white border border-sky/15 p-6 sm:p-8 md:p-10 bubble-shadow-sm mb-16">
          <div className="max-w-3xl">
            <Badge tone="teal" className="uppercase tracking-wider mb-3">
              {t("transparencyVerification")}
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink mb-3">
              {t("howDoesDomnerVerify")}
            </h2>
            <p className="text-sm text-gray-body leading-relaxed font-medium mb-6">
              {t("howDoesDomnerVerifyDesc")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
              {[
                { title: t("directLinks"), desc: t("directLinksDesc") },
                { title: t("zeroHiddenFees"), desc: t("zeroHiddenFeesDesc") },
                { title: t("updatedDeadlines"), desc: t("updatedDeadlinesDesc") },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-2xl bg-powder border border-sky/10 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-deep shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-ink">{item.title}</h4>
                    <p className="text-[11px] text-gray-soft mt-0.5 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
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