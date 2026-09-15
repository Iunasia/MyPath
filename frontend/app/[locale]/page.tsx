import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Footer from "@/app/components/Footer";
import HeroSlider from "@/app/components/HeroSlider";
import ScholarshipCard from "@/app/components/ScholarshipCard";
import InformationCheckDemo from "@/app/components/InformationCheckDemo";
import InteractiveCTA from "@/app/components/InteractiveCTA";
import { getScholarships } from "@/app/lib/api.server";
import {
  deadlineState,
  sortByDeadline,
  toScholarshipViews,
  type ScholarshipView,
} from "@/app/lib/adapters";
import WorkshopIcon from "@/app/components/WorkshopIcon";
import {
  Compass,
  Search,
  Scale,
  ShieldCheck,
  ArrowLeftRight,
  FolderTree,
  CheckCircle2,
  Briefcase,
  BookOpen,
  GraduationCap,
  CircleDollarSign,
  RotateCw,
  Link2,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  CalendarCheck,
} from "lucide-react";

/* ── Wave Divider (inline SVG) ─────────────────────────── */
function WaveTop({ fill = "#E2F1F1" }: { fill?: string }) {
  return (
    <div className="w-full leading-none" aria-hidden="true">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V0H0V30Z" fill={fill} />
      </svg>
    </div>
  );
}

function WaveBottom({ fill = "#E2F1F1" }: { fill?: string }) {
  return (
    <div className="w-full leading-none" aria-hidden="true">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        <path d="M0 30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0V30Z" fill={fill} />
      </svg>
    </div>
  );
}

/* ── Data ──────────────────────────────────────────────── */

const DMIL_STEP_ICONS = [
  Compass,
  Search,
  Scale,
  ShieldCheck,
  ArrowLeftRight,
  FolderTree,
  CheckCircle2,
] as const;

const DMIL_STEP_STYLES = [
  { bg: "bg-sitomo", color: "text-sky-deep" },
  { bg: "bg-momo", color: "text-blue-ink" },
  { bg: "bg-sitomo", color: "text-blue-ink" },
  { bg: "bg-sky/25", color: "text-blue-ink" },
  { bg: "bg-sitomo", color: "text-sky-deep" },
  { bg: "bg-momo", color: "text-blue-ink" },
  { bg: "bg-sitomo", color: "text-blue-ink" },
];

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

const EXPLORER_HREFS = ["/careers", "/majors", "/universities", "/scholarships", "/workshops"] as const;

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

const TRUST_BGS = ["bg-sitomo", "bg-momo", "bg-sitomo", "bg-momo"];

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
  const [closingSoon, t] = await Promise.all([getClosingSoon(), getTranslations("home")]);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Hero Slider (EduBlock Style with Left Slide Animation) ── */}
      <HeroSlider />

      {/* ── Closing soon ──────────────────────────────────── */}
      {closingSoon.length > 0 && (
        <section className="pt-16 lg:pt-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight">
                  {t("closingSoon")}
                </h2>
                <p className="mt-2 text-gray-body font-medium">
                  {t("openScholarshipsNearest")}
                </p>
              </div>
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-deep hover:text-blue-ink shrink-0"
              >
                {t("allScholarships")} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {closingSoon.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DMIL Step Flow ───────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight">
              {t("howItWorksTitle")}
              <br />
              <span className="text-sky-deep">{t("howItWorksHighlight")}</span>
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
                    <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-white border-2 border-sky/30 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
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
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-sky/35 shadow-md shadow-slate-200/60 group-hover:border-sky-deep group-hover:scale-105 transition-all duration-300 shrink-0">
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

      <WaveTop fill="#E2F1F1" />

      {/* ── Five Explorers ───────────────────────────────── */}
      <section id="explorers" className="py-20 lg:py-28 bg-powder scroll-mt-20">
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
                  className="group flex flex-col items-center text-center rounded-2xl md:rounded-[24px] lg:rounded-[28px] bg-white p-5 sm:p-4.5 md:p-5 lg:p-6 border border-sky/20 hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full"
                >
                  <div
                    className={`w-13 h-13 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-15 lg:h-15 rounded-full ${EXPLORER_STYLES[i].chip} border-2 border-sky/15 flex items-center justify-center mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0`}
                  >
                    <Icon className="w-6 h-6 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 lg:w-7.5 lg:h-7.5" strokeWidth={2} aria-hidden="true" />
                  </div>

                  <h3 className="font-display text-sm sm:text-xs md:text-sm lg:text-base font-extrabold text-blue-ink uppercase tracking-wider group-hover:text-sky-deep transition-colors mb-2 text-center">
                    <span className="inline-flex items-center justify-center">
                      <span className="w-3.5 mr-1 invisible select-none shrink-0" aria-hidden="true">
                        →
                      </span>
                      <span>{t(titleKey)}</span>
                      <span
                        className="w-3.5 ml-1 inline-block transition-all duration-200 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-sky-deep font-bold shrink-0 text-left"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </span>
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

      <WaveBottom fill="#FFFFFF" />

      {/* ── Information Check ─────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white scroll-mt-20" id="verification">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-sitomo px-3.5 py-1 text-xs font-bold text-sky-deep border border-sky/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span>{t("dmilBadge")}</span>
              </div>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-blue-ink tracking-tight mt-1 mb-4 leading-tight">
                {t("infoCheckTitle")} <br />
                <span className="text-sky-deep">{t("infoCheckHighlight")}</span>
              </h2>

              <p className="text-gray-body leading-relaxed mb-7 font-medium text-sm sm:text-base">
                {t("infoCheckDescription")}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-sitomo flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-sky/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-blue-ink">
                      {t("officialInstitutionMatching")}
                    </h4>
                    <p className="text-xs text-gray-body mt-0.5">
                      {t("officialInstitutionMatchingDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-sitomo flex items-center justify-center text-sky-deep shrink-0 mt-0.5 border border-sky/20">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-blue-ink">
                      {t("auditedLiveDeadlines")}
                    </h4>
                    <p className="text-xs text-gray-body mt-0.5">
                      {t("auditedLiveDeadlinesDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-momo flex items-center justify-center text-blue-ink shrink-0 mt-0.5 border border-momo">
                    <ShieldAlert className="w-4 h-4 text-sky-deep" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-blue-ink">
                      {t("scamDiscrepancyAlerts")}
                    </h4>
                    <p className="text-xs text-gray-body mt-0.5">
                      {t("scamDiscrepancyAlertsDesc")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-deep px-7 py-3.5 text-sm font-bold text-white hover:bg-sky-dark transition-all bubble-shadow hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t("openLinkVerifierTool")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <InformationCheckDemo />
            </div>
          </div>
        </div>
      </section>

      <WaveTop fill="#E2F1F1" />

      {/* ── Trust Tiles ───────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-powder">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-blue-ink tracking-tight">
              {t("trustTitle")}
            </h2>
            <p className="mt-3 text-gray-body max-w-md mx-auto font-medium">
              {t("trustSubtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_TITLE_KEYS.map((titleKey, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div key={titleKey} className={`rounded-2xl ${TRUST_BGS[i]} p-5 border border-white/60`}>
                  <Icon className="w-7 h-7 text-blue-ink mb-3" strokeWidth={2} aria-hidden="true" />
                  <h3 className="font-display text-sm font-bold text-blue-ink mb-1">{t(titleKey)}</h3>
                  <p className="text-xs text-gray-body leading-relaxed font-medium">{t(TRUST_DESC_KEYS[i])}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <WaveBottom fill="#FFFFFF" />

      {/* ── Interactive CTA Launchpad ───────────────────────── */}
      <InteractiveCTA />

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
