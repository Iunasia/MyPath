"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Bookmark,
  Search,
  X,
  Trash2,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  Building2,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import { useSaved, SavedItem } from "@/app/context/SavedContext";

type FilterTab = "all" | "scholarship" | "major" | "career" | "university";

export default function SavedPage() {
  const t = useTranslations("saved");
  const tCommon = useTranslations("common");
  const { savedItems, unsaveItem, clearAll, isHydrated } = useSaved();
  const [selectedTab, setSelectedTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredItems = useMemo(() => {
    return savedItems.filter((item) => {
      const matchesTab = selectedTab === "all" || item.type === selectedTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [savedItems, selectedTab, searchQuery]);

  const counts = useMemo(
    () => ({
      all: savedItems.length,
      scholarship: savedItems.filter((i) => i.type === "scholarship").length,
      major: savedItems.filter((i) => i.type === "major").length,
      career: savedItems.filter((i) => i.type === "career").length,
      university: savedItems.filter((i) => i.type === "university").length,
    }),
    [savedItems]
  );

  const getCategoryMeta = (type: SavedItem["type"]) => {
    switch (type) {
      case "scholarship":
        return {
          label: t("scholarship"),
          icon: Award,
          tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
          accentColor: "text-emerald-600",
        };
      case "major":
        return {
          label: t("universityMajor"),
          icon: GraduationCap,
          tagClass: "bg-sky/20 text-sky-deep border-sky/30",
          accentColor: "text-sky-deep",
        };
      case "career":
        return {
          label: t("careerPath"),
          icon: Briefcase,
          tagClass: "bg-amber-50 text-amber-700 border-amber-200",
          accentColor: "text-amber-600",
        };
      case "university":
        return {
          label: t("university"),
          icon: Building2,
          tagClass: "bg-sky/20 text-sky-deep border-sky/25",
          accentColor: "text-sky-deep",
        };
    }
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">

        <main className="w-full pb-16 flex flex-col mt-4 sm:mt-6">
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-sky/15">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-tight">
                  {t("savedOpportunities")}
                </h1>
                <p className="text-sm sm:text-base text-gray-body font-medium mt-2 max-w-2xl">
                  {t("savedOpportunitiesDesc")}
                </p>
              </div>

              {savedItems.length > 0 && (
                <div className="flex items-center gap-3">
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-red-200 bubble-shadow-sm animate-in fade-in">
                      <span className="text-xs text-red-600 font-bold">{t("clearAllSaved")}</span>
                      <button
                        onClick={() => {
                          clearAll();
                          setShowClearConfirm(false);
                        }}
                        className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        {tCommon("yes")}
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1 rounded-full bg-gray-100 text-blue-ink text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {tCommon("cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-sky/20 text-gray-soft hover:text-red-600 hover:border-red-200 text-xs font-bold transition-colors bubble-shadow-sm cursor-pointer"
                      title={t("clearAllSaved")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t("clearAll")}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(
                [
                  { id: "all", label: t("allItems") },
                  { id: "scholarship", label: t("scholarships") },
                  { id: "major", label: t("majors") },
                  { id: "career", label: t("careers") },
                  { id: "university", label: t("universities") },
                ] as const
              ).map((tab) => {
                const isActive = selectedTab === tab.id;
                const count = counts[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-sky-deep text-white bubble-shadow-sm"
                        : "bg-white text-blue-ink border border-sky/20 hover:border-sky bubble-shadow-sm"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive ? "bg-white/25 text-white" : "bg-sitomo text-sky-deep"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {savedItems.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-soft absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-sky/25 text-blue-ink placeholder:text-gray-soft text-xs font-semibold pl-9 pr-8 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-sky/30 hover:border-sky transition-colors bubble-shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-soft hover:text-blue-ink cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </section>

          {!isHydrated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-3xl bg-sitomo/30 border border-sky/15 animate-pulse"
                />
              ))}
            </div>
          ) : savedItems.length === 0 ? (
            <div className="bg-white rounded-3xl rounded-br-[86px] p-8 sm:p-14 border border-sky/15 bubble-shadow-sm text-center flex flex-col items-center justify-center my-6">
              <div className="w-20 h-20 rounded-full bg-sitomo/50 border border-sky/25 flex items-center justify-center text-sky-deep mb-5">
                <Bookmark className="w-10 h-10 text-sky-deep stroke-[1.5]" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-ink mb-2">
                {t("noSavedYet")}
              </h2>
              <p className="text-sm sm:text-base text-gray-body max-w-md mb-8">
                {t("noSavedHint")}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/scholarships"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-deep text-white text-xs sm:text-sm font-bold hover:bg-sky-dark transition-all bubble-shadow-sm cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{t("exploreScholarships")}</span>
                </Link>
                <Link
                  href="/majors"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-sky/25 text-blue-ink text-xs sm:text-sm font-bold hover:border-sky hover:bg-sitomo/40 transition-all bubble-shadow-sm cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-sky-deep" />
                  <span>{t("exploreMajors")}</span>
                </Link>
                <Link
                  href="/careers"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-sky/25 text-blue-ink text-xs sm:text-sm font-bold hover:border-sky hover:bg-sitomo/40 transition-all bubble-shadow-sm cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-sky-deep" />
                  <span>{t("exploreCareers")}</span>
                </Link>
                <Link
                  href="/universities"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-sky/25 text-blue-ink text-xs sm:text-sm font-bold hover:border-sky hover:bg-sitomo/40 transition-all bubble-shadow-sm cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-sky-deep" />
                  <span>{t("exploreUniversities")}</span>
                </Link>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sky/15 bubble-shadow-sm text-center flex flex-col items-center justify-center my-6">
              <Search className="w-12 h-12 text-sky-deep/50 mb-4" />
              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-2">
                {t("noResultsFound")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-body max-w-sm mb-5">
                {searchQuery
                  ? t("noResultsSearchHint", { query: searchQuery })
                  : t("noResultsTabHint", { tab: selectedTab })}
              </p>
              <button
                onClick={() => {
                  setSelectedTab("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2 rounded-full bg-sky-deep text-white text-xs font-bold hover:bg-sky-dark transition-colors cursor-pointer bubble-shadow-sm"
              >
                {tCommon("resetFilters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredItems.map((item) => {
                const meta = getCategoryMeta(item.type);
                const TypeIcon = meta.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl rounded-br-[86px] border border-sky/15 bubble-shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-sky/40 group"
                  >
                    <div>
                      {item.image ? (
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-sitomo/40 border-b border-sky/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          <div className="absolute top-3.5 left-3.5 z-10">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md bg-white/90 ${meta.tagClass}`}
                            >
                              <TypeIcon className="w-3 h-3" />
                              <span>{meta.label}</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => unsaveItem(item.id)}
                            aria-label={`Remove ${item.title} from saved`}
                            title={t("removeFromSaved")}
                            className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/90 text-sky-deep hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm cursor-pointer"
                          >
                            <Bookmark className="w-4 h-4 fill-sky-deep hover:fill-red-600 transition-colors" />
                          </button>

                          {item.badge && (
                            <div className="absolute bottom-3 left-3.5 z-10">
                              <span className="px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs text-[11px] font-bold border border-white/20">
                                {item.badge}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-5 pb-0 flex items-start justify-between gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${meta.tagClass}`}
                          >
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span>{meta.label}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => unsaveItem(item.id)}
                            aria-label={`Remove ${item.title} from saved`}
                            title={t("removeFromSaved")}
                            className="p-2 rounded-full bg-sitomo/60 text-sky-deep hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-4 h-4 fill-sky-deep hover:fill-red-600 transition-colors" />
                          </button>
                        </div>
                      )}

                      <div className="p-5 sm:p-6">
                        <h2 className="font-display text-lg sm:text-xl font-extrabold text-blue-ink tracking-tight leading-snug mb-1.5 group-hover:text-sky-deep transition-colors line-clamp-2">
                          <Link href={item.link}>{item.title}</Link>
                        </h2>

                        {item.subtitle && (
                          <p className="text-xs sm:text-sm text-gray-body font-medium mb-3 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}

                        {item.deadline && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-soft font-semibold mt-2">
                            <Calendar className="w-3.5 h-3.5 text-[#D97736] shrink-0" />
                            <span>{tCommon("deadline")}: {item.deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 flex items-center justify-between border-t border-sky/10">
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-deep hover:text-blue-ink transition-colors group-hover:translate-x-0.5"
                      >
                        <span>{t("viewDetails")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
