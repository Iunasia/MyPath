"use client";

import { useState } from "react";
import { Link } from "@/src/i18n";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  BookOpen,
  GraduationCap,
  CircleDollarSign,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  Compass,
} from "lucide-react";
import { Button } from "./ui";

interface PathwayOption {
  id: string;
  title: string;
  subtitle: string;
  count: string;
  href: string;
  icon: typeof Briefcase;
  color: string;
  bg: string;
  highlight: string;
}

export default function InteractiveCTA() {
  const t = useTranslations("interactiveCTA");
  const [activePathway, setActivePathway] = useState<string>("careers");

  const PATHWAYS: PathwayOption[] = [
    {
      id: "careers",
      title: t("careerExplorer"),
      subtitle: t("careerExplorerSubtitle"),
      count: t("careerCount"),
      href: "/careers",
      icon: Briefcase,
      color: "text-sky-deep",
      bg: "bg-sitomo",
      highlight: t("careerHighlight"),
    },
    {
      id: "majors",
      title: t("majorExplorer"),
      subtitle: t("majorExplorerSubtitle"),
      count: t("majorCount"),
      href: "/majors",
      icon: BookOpen,
      color: "text-blue-ink",
      bg: "bg-momo",
      highlight: t("majorHighlight"),
    },
    {
      id: "universities",
      title: t("universityDirectory"),
      subtitle: t("universityDirectorySubtitle"),
      count: t("universityCount"),
      href: "/universities",
      icon: GraduationCap,
      color: "text-sky-deep",
      bg: "bg-sitomo",
      highlight: t("universityHighlight"),
    },
    {
      id: "scholarships",
      title: t("verifiedScholarships"),
      subtitle: t("verifiedScholarshipsSubtitle"),
      count: t("scholarshipCount"),
      href: "/scholarships",
      icon: CircleDollarSign,
      color: "text-blue-ink",
      bg: "bg-momo",
      highlight: t("scholarshipHighlight"),
    },
  ];

  return (
    <section id="start" className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-sky/10 via-powder/40 to-powder">
      {/* Ambient background glow accents */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-sky/15 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-momo/60 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-panel/90 to-panel/75 backdrop-blur-md border-2 border-sky/25 p-7 sm:p-12 lg:p-14 bubble-shadow relative overflow-hidden">

          {/* Top Header Badge */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-sitomo border border-sky/30 px-4 py-1.5 text-xs font-extrabold text-sky-deep mb-5 bubble-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("badge")}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight mb-4 leading-tight">
              {t("title1")} <br />
              <span className="text-sky-deep underline decoration-sky/40 decoration-wavy decoration-2 underline-offset-6">
                {t("titleHighlight")}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-body font-medium leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Interactive 4 Pathways Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {PATHWAYS.map((p) => {
              const Icon = p.icon;
              const isSelected = activePathway === p.id;

              return (
                <div
                  key={p.id}
                  onMouseEnter={() => setActivePathway(p.id)}
                  onFocus={() => setActivePathway(p.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl p-5 border-2 transition-[transform,box-shadow,border-color,background-color] duration-300 ${
                    isSelected
                      ? "bg-white border-sky-deep shadow-lg -translate-y-1"
                      : "bg-white/80 border-sky/20 hover:border-sky/50 hover:bg-white"
                  }`}
                >
                  <div>
                    {/* Top Row: Icon & Count */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center ${p.color} border border-sky/20`}>
                        <Icon className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-powder text-blue-ink">
                        {p.count}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-extrabold text-blue-ink mb-1 group-hover:text-sky-deep transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-body leading-relaxed mb-3">
                      {p.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-sky/10">
                    <p className="text-[11px] font-bold text-gray-faint mb-3">
                      {p.highlight}
                    </p>
                    <Link
                      href={p.href}
                      className="inline-flex items-center justify-between w-full rounded-xl bg-powder hover:bg-sky-deep text-blue-ink hover:text-white px-3.5 py-2 text-xs font-bold transition-colors"
                    >
                      <span>{t("exploreNow")}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 pb-8 border-t border-sky/15 max-w-3xl mx-auto">
            <Button href="/auth/signup" size="lg" className="w-full sm:w-auto">
              <span>{t("createFreeStudentAccount")}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button href="/verify" variant="secondary" size="lg" className="w-full sm:w-auto">
              <ShieldCheck className="w-4 h-4 text-sky-deep" aria-hidden="true" />
              <span>{t("testLinkVerifierTool")}</span>
            </Button>
            <Button href="/careers" variant="ghost" size="lg" className="w-full sm:w-auto">
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>{t("browseAllPathways")}</span>
            </Button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-gray-soft">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              {t("freeForAllStudents")}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              {t("moeysAuthenticated")}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              {t("zeroAdsOrPaywalls")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}