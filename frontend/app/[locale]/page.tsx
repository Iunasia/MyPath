import { Link } from "@/src/i18n";
import { getTranslations } from "next-intl/server";
import Footer from "@/app/components/Footer";
import HeroSlider from "@/app/components/HeroSlider";
import ScholarshipCard from "@/app/components/ScholarshipCard";
import InformationCheckDemo from "@/app/components/InformationCheckDemo";
import InteractiveCTA from "@/app/components/InteractiveCTA";
import FeaturedWorkshops from "@/app/components/FeaturedWorkshops";
import AdPopup from "@/app/components/AdPopup";
import { Button, WaveDivider } from "@/app/components/ui";
import { getScholarships, getCampaigns } from "@/app/lib/api.server";
import {
  deadlineState,
  sortByDeadline,
  toScholarshipViews,
  type ScholarshipView,
} from "@/app/lib/adapters";
import WorkshopIcon from "@/app/components/WorkshopIcon";
import {
  Briefcase,
  BookOpen,
  GraduationCap,
  CircleDollarSign,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Building2,
  CalendarCheck,
  RotateCw,
  Link2,
  Zap,
  Sparkles,
} from "lucide-react";

/* ── Data ──────────────────────────────────────────────── */

const STEP_TITLE_KEYS = [
  "stepDiscover",
  "stepSearch",
  "stepEvaluate",
  "stepVerify",
  "stepCompare",
  "stepOrganize",
  "stepDecide",
] as const;

const STEP_DESC_KEYS = [
  "descDiscover",
  "descSearch",
  "descEvaluate",
  "descVerify",
  "descCompare",
  "descOrganize",
  "descDecide",
] as const;

const MOBILE_STEP_POSITIONS = [
  { top: 16, isLeft: true },
  { top: 16, isLeft: false },
  { top: 196, isLeft: true },
  { top: 376, isLeft: false },
  { top: 556, isLeft: true },
  { top: 736, isLeft: false },
  { top: 916, isLeft: true },
];

const EXPLORER_ICONS = [Briefcase, BookOpen, GraduationCap, CircleDollarSign, WorkshopIcon] as const;

const EXPLORER_TITLE_KEYS = [
  "careerExplorer",
  "majorExplorer",
  "universityExplorer",
  "scholarshipExplorer",
  "workshopsMentorship",
] as const;

const EXPLORER_DESC_KEYS = [
  "careerExplorerDesc",
  "majorExplorerDesc",
  "universityExplorerDesc",
  "scholarshipExplorerDesc",
  "workshopsMentorshipDesc",
] as const;

const EXPLORER_HREFS = ["/careers", "/majors", "/universities", "/scholarships", "/opportunities"] as const;

const EXPLORER_STYLES = [
  { chip: "bg-sitomo text-sky-deep", border: "border-sky/20" },
  { chip: "bg-momo text-blue-ink", border: "border-momo" },
  { chip: "bg-sitomo text-blue-ink", border: "border-sitomo" },
  { chip: "bg-momo text-blue-ink", border: "border-momo" },
  { chip: "bg-momo text-blue-ink", border: "border-momo" },
];

const TRUST_ICONS = [RotateCw, Link2, Zap, Sparkles] as const;

const TRUST_TITLE_KEYS = [
  "sevenStepProcess",
  "sourceVerified",
  "realTimeChecking",
  "alwaysFree",
] as const;

const TRUST_DESC_KEYS = [
  "sevenStepProcessDesc",
  "sourceVerifiedDesc",
  "realTimeCheckingDesc",
  "alwaysFreeDesc",
] as const;

const TRUST_STYLES = [
  { border: "border-sky-deep", iconBg: "bg-sky-deep" },
  { border: "border-sky", iconBg: "bg-sky" },
  { border: "border-[#7AB3B7]", iconBg: "bg-[#7AB3B7]" },
  { border: "border-sky-deep", iconBg: "bg-sky-deep" },
] as const;

/* ── Page ──────────────────────────────────────────────── */

export const dynamic = "force-dynamic";

async function getClosingSoon(): Promise<ScholarshipView[]> {
  try {
    return sortByDeadline(toScholarshipViews(await getScholarships()))
      .filter((s) => deadlineState(s.deadlineAt).kind === "open")
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [closingSoon, t, campaigns] = await Promise.all([
    getClosingSoon(),
    getTranslations("home"),
    getCampaigns(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Marketing Campaign Pop-up (Shows when URL has ?campaign=... or ?test_ad=1) ── */}
      <AdPopup
        ads={campaigns}
        countdownSeconds={3}
      />

      {/* ── Hero Slider ────────────────────────────────────── */}
      <HeroSlider />

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight">
              {t("howItWorksTitle")}
              <br />
              <span className="text-[#5B9DA2]">{t("howItWorksHighlight")}</span>
            </h2>
          </div>

          {/* ── Desktop & Tablet View ── */}
          <div className="hidden md:block relative pt-2">
            <div
              className="absolute top-1 left-0 right-0 h-12 md:h-14 lg:h-16 pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 1000 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M 71 28
                     C 130 46, 165 46, 214 24
                     C 265 6, 305 6, 357 30
                     C 410 48, 450 48, 500 22
                     C 550 6, 590 6, 643 30
                     C 695 48, 735 48, 786 24
                     C 835 6, 870 6, 929 28"
                  stroke="#7AB3B7"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </svg>
            </div>

            <div className="flex flex-row items-start justify-between">
              {STEP_TITLE_KEYS.map((titleKey, i) => {
                const offsetClass =
                  i % 2 === 1 ? "-translate-y-1 md:-translate-y-1.5" : "translate-y-0.5";

                return (
                  <div
                    key={`desktop-${titleKey}`}
                    className={`group flex flex-col items-center text-center flex-1 relative z-10 transition-transform ${offsetClass}`}
                  >
                    <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-white border-2 border-sky/30 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-110 transition-[transform,border-color,box-shadow] duration-300">
                      <span className="font-display font-extrabold text-sm md:text-base lg:text-xl text-blue-ink group-hover:text-sky-deep transition-colors">
                        {i + 1}
                      </span>
                    </div>

                    <h3 className="font-display text-xs md:text-sm lg:text-base font-bold text-blue-ink mt-2 md:mt-3 lg:mt-4 mb-1 md:mb-1.5 group-hover:text-sky-deep transition-colors">
                      {t(titleKey)}
                    </h3>

                    <p className="text-[10px] md:text-[11px] lg:text-xs text-gray-body leading-snug md:leading-relaxed max-w-[95px] md:max-w-[115px] lg:max-w-[135px] mx-auto font-normal">
                      {t(STEP_DESC_KEYS[i])}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mobile View ── */}
          <div className="md:hidden relative w-[330px] mx-auto h-[1080px] pt-1">
            <div
              className="absolute inset-0 pointer-events-none z-0"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 330 1080"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M 66 44 L 264 44
                     M 264 158 L 264 196 A 28 28 0 0 1 236 224 L 66 224
                     M 66 338 L 66 376 A 28 28 0 0 0 94 404 L 264 404
                     M 264 518 L 264 556 A 28 28 0 0 1 236 584 L 66 584
                     M 66 698 L 66 736 A 28 28 0 0 0 94 764 L 264 764
                     M 264 878 L 264 916 A 28 28 0 0 1 236 944 L 66 944"
                  stroke="#7AB3B7"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {STEP_TITLE_KEYS.map((titleKey, i) => {
              const pos = MOBILE_STEP_POSITIONS[i];

              return (
                <div
                  key={`mobile-${titleKey}`}
                  style={{ top: `${pos.top}px` }}
                  className={`absolute ${
                    pos.isLeft ? "left-0.5" : "right-0.5"
                  } w-[132px] flex flex-col items-center text-center z-10 group`}
                >
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-sky/35 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-105 transition-[transform,border-color,box-shadow] duration-300 shrink-0">
                    <span className="font-display font-extrabold text-lg text-blue-ink group-hover:text-sky-deep transition-colors">
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-blue-ink mt-2.5 mb-1 group-hover:text-sky-deep transition-colors">
                    {t(titleKey)}
                  </h3>

                  <p className="text-[11px] text-gray-body leading-relaxed font-normal">
                    {t(STEP_DESC_KEYS[i])}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider tone="powder" direction="top" />

      {/* ── Five Explorers ─────────────────────────────────── */}
      <section id="explorers" className="py-20 lg:py-24 bg-powder scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink tracking-tight">
              {t("explorersTitle")}
            </h2>
            <p className="text-sm sm:text-base text-gray-body mt-3 font-medium">
              {t("explorersSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-4.5 lg:gap-5">
            {EXPLORER_TITLE_KEYS.map((titleKey, i) => {
              const Icon = EXPLORER_ICONS[i];
              return (
                <Link
                  key={titleKey}
                  href={EXPLORER_HREFS[i]}
                  className="group flex flex-col items-center text-center rounded-2xl md:rounded-[24px] lg:rounded-[28px] bg-white p-5 sm:p-4.5 md:p-5 lg:p-6 border border-sky/20 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer h-full"
                >
                  <div
                    className={`w-13 h-13 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-15 lg:h-15 rounded-full ${EXPLORER_STYLES[i].chip} border-2 border-sky/15 flex items-center justify-center mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 group-hover:scale-105 transition-transform duration-300 shrink-0`}
                  >
                    <Icon className="w-6 h-6 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 lg:w-7.5 lg:h-7.5" strokeWidth={2} aria-hidden="true" />
                  </div>

                  <h3 className="font-display text-sm sm:text-xs md:text-sm lg:text-base font-extrabold text-blue-ink uppercase tracking-wider group-hover:text-sky-deep transition-colors mb-2 text-center">
                    {t(titleKey)}
                  </h3>

                  <p className="text-xs sm:text-xs md:text-xs lg:text-sm text-gray-body leading-relaxed font-normal text-center">
                    {t(EXPLORER_DESC_KEYS[i])}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider tone="powder" direction="bottom" />

      {/* ── Featured Workshops ──────────────────────────────── */}
      <FeaturedWorkshops />

      {/* ── Information Check ──────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white scroll-mt-20" id="verification">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sitomo px-3.5 py-1 text-xs font-bold text-sky-deep border border-sky/20 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span>{t("dmilBadge")}</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink tracking-tight mb-4 leading-tight">
                  {t("infoCheckTitle")} <br />
                  <span className="text-[#5B9DA2]">{t("infoCheckHighlight")}</span>
                </h2>

                <p className="text-gray-body leading-relaxed mb-6 font-medium text-sm sm:text-base">
                  {t("infoCheckDescription")}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-powder/40 dark:bg-panel-raised/40 border border-sky/15 dark:border-white/5 transition-colors hover:border-sky/30">
                    <div className="w-9 h-9 rounded-xl bg-sitomo dark:bg-sitomo/30 flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-sky/20 dark:border-white/10">
                      <Building2 className="w-4.5 h-4.5" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-blue-ink">
                        {t("officialInstitutionMatching")}
                      </h4>
                      <p className="text-xs text-gray-body mt-0.5 leading-relaxed">
                        {t("officialInstitutionMatchingDesc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-powder/40 dark:bg-panel-raised/40 border border-sky/15 dark:border-white/5 transition-colors hover:border-sky/30">
                    <div className="w-9 h-9 rounded-xl bg-sitomo dark:bg-sitomo/30 flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-sky/20 dark:border-white/10">
                      <CalendarCheck className="w-4.5 h-4.5" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-blue-ink">
                        {t("auditedLiveDeadlines")}
                      </h4>
                      <p className="text-xs text-gray-body mt-0.5 leading-relaxed">
                        {t("auditedLiveDeadlinesDesc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-powder/40 dark:bg-panel-raised/40 border border-sky/15 dark:border-white/5 transition-colors hover:border-sky/30">
                    <div className="w-9 h-9 rounded-xl bg-momo dark:bg-momo/30 flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-momo/40 dark:border-white/10">
                      <ShieldAlert className="w-4.5 h-4.5 text-sky-deep" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-blue-ink">
                        {t("scamDiscrepancyAlerts")}
                      </h4>
                      <p className="text-xs text-gray-body mt-0.5 leading-relaxed">
                        {t("scamDiscrepancyAlertsDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button href="/verify" size="lg">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>{t("openLinkVerifierTool")}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <InformationCheckDemo className="h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust tiles ────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-powder">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight">
              {t("trustTitle")}
            </h2>
            <p className="mt-3 text-gray-body max-w-md mx-auto font-medium">
              {t("trustSubtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {TRUST_TITLE_KEYS.map((titleKey, i) => {
              const Icon = TRUST_ICONS[i];
              const descKey = TRUST_DESC_KEYS[i];
              const style = TRUST_STYLES[i];
              return (
                <div key={titleKey} className="relative group pt-3 pl-3 pr-2">
                  {/* Offset colored outline behind the card */}
                  <div
                    className={`absolute top-0 left-0 right-3 bottom-3 rounded-3xl border-2 ${style.border} pointer-events-none transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}
                  />

                  {/* Foreground white card */}
                  <div className="relative z-10 bg-white rounded-3xl p-6 shadow-sm border border-sky/15 flex flex-col justify-center min-h-[160px] transition-shadow duration-300 group-hover:shadow-md">
                    {/* Floating circular icon badge at top right */}
                    <div
                      className={`absolute -top-3 -right-2 sm:-top-3.5 sm:-right-2.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full ${style.iconBg} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.2} />
                    </div>

                    {/* Title & Description */}
                    <div className="pr-4">
                      <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#5B9DA2] mb-2">
                        {t(titleKey)}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-gray-body leading-relaxed font-medium">
                        {t(descKey)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive CTA ────────────────────────────────── */}
      <InteractiveCTA />

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}