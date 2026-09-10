import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Info,
  Briefcase,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";
import { getCareer, getMajors } from "@/app/lib/api.server";
import { linkMajors, toCareerView, toMajorViews } from "@/app/lib/catalogAdapters";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import BackLink from "@/app/components/BackLink";
import SaveItemButton from "@/app/components/SaveItemButton";
import CompareButton from "@/app/components/CompareButton";
import ShareButton from "@/app/components/ShareButton";

/**
 * Rendered per request. Prerendering would need the API up at build time, and
 * content changes whenever the team re-seeds.
 */
export const dynamic = "force-dynamic";

/* ── Career Detail Page ────────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CareerDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Majors are fetched too, so "Majors That Lead Here" can link by real id —
  // the spreadsheet stores the relationship as a plain name.
  const [row, majorRows] = await Promise.all([getCareer(id), getMajors()]);

  if (!row) {
    notFound();
  }

  const career = toCareerView(row);
  const { links: relatedMajors, unmatched: relatedMajorsUnmatched } = linkMajors(
    career.relatedMajorsText,
    toMajorViews(majorRows)
  );

  const Icon = career.icon;

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Header ────────────────────────────────────────── */}
        <Header activeNav="careers" />
        <BackLink href="/careers" label="All careers" className="mb-6" />

        {/* ── Main Content ──────────────────────────────────── */}
        <main className="w-full pb-16 flex flex-col gap-10">
          {/* 1. Hero Section */}
          <section className="w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky/20 text-sky-deep text-xs font-extrabold uppercase tracking-wider border border-sky/20">
                {career.categoryKey}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider border border-emerald-200">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Demand: {career.jobMarketDemand}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-sitomo flex items-center justify-center border border-sky/15 shrink-0">
                <Icon className="w-8 h-8 text-sky-deep" strokeWidth={2.2} />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {career.title}
              </h1>
            </div>

            {/* What You Do Banner */}
            <div className="p-5 bg-white rounded-2xl border border-sky/20 bubble-shadow-sm mb-6 max-w-4xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sitomo flex items-center justify-center text-sky-deep shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-deep mb-1">
                    What You Do
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-blue-ink leading-snug">
                    {career.whatYouDo}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mb-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-soft mb-2">
                Short Overview
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium">
                {career.shortOverview}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
              <SaveItemButton
                item={{
                  id: career.id,
                  type: "career",
                  title: career.title,
                  subtitle: career.categoryKey,
                  link: `/careers/${career.id}`,
                }}
                label="Save Career"
                className="w-full sm:w-auto"
              />
              <div className="flex items-center gap-3">
                <CompareButton
                  item={{
                    type: "career",
                    apiId: Number(career.id),
                    title: career.title,
                    subtitle: career.categoryKey,
                  }}
                  className="flex-1 sm:flex-none"
                />
                <ShareButton title={career.title} />
              </div>
            </div>
          </section>

          {/* 2. Key Specifications Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
            {/* Key Skills */}
            <div className="bg-white rounded-3xl p-6 border border-sky/15 bubble-shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-sitomo flex items-center justify-center text-sky-deep mb-4 border border-sky/15">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-blue-ink mb-3">
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {career.keySkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-sitomo text-sky-deep text-xs font-bold px-3 py-1 rounded-full border border-sky/15"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Education Required */}
            <div className="bg-white rounded-3xl p-6 border border-sky/15 bubble-shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-sitomo flex items-center justify-center text-sky-deep mb-4 border border-sky/15">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-blue-ink mb-2">
                  Education Required
                </h3>
                <p className="text-xs text-gray-body leading-relaxed font-medium">
                  {career.educationRequired}
                </p>
              </div>
            </div>

            {/* Best-Fit Personality */}
            <div className="bg-white rounded-3xl p-6 border border-sky/15 bubble-shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-momo flex items-center justify-center text-amber-800 mb-4 border border-momo">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-blue-ink mb-3">
                  Best-Fit Personality
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {career.bestFitPersonality.map((trait) => (
                    <span
                      key={trait}
                      className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Job-Market Demand */}
            <div className="bg-white rounded-3xl p-6 border border-sky/15 bubble-shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-4 border border-emerald-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-blue-ink mb-2">
                  Job-Market Demand
                </h3>
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  {career.jobMarketDemand}
                </span>
                <p className="text-xs text-gray-soft mt-2 font-medium">
                  Strong job market outlook and demand across industries.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Majors That Lead Here */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full rounded-br-[86px]">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-2">
              Majors That Lead Here
            </h2>
            <p className="text-xs sm:text-sm text-gray-soft mb-8 font-medium">
              Study one of these majors to pursue a career as a{" "}
              {career.title}.
            </p>

            {relatedMajors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedMajors.map((major) => {
                  const MajorIcon = major.icon;
                  return (
                    <Link
                      key={major.id}
                      href={`/majors/${major.id}`}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-sitomo/20 border border-sky/10 hover:border-sky/30 hover:bg-sitomo/40 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-sitomo flex items-center justify-center shrink-0 border border-sky/15 group-hover:scale-110 transition-transform">
                        <MajorIcon
                          className="w-6 h-6 text-sky-deep"
                          strokeWidth={2.2}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-bold text-blue-ink group-hover:text-sky-deep transition-colors">
                          {major.name}
                        </h3>
                        <p className="text-xs text-gray-soft font-medium mt-0.5">
                          View major details →
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            {/* Names the spreadsheet lists that have no major record yet —
                shown as plain chips rather than links that would 404. */}
            {relatedMajorsUnmatched.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {relatedMajorsUnmatched.map((m) => (
                  <span
                    key={m}
                    className="bg-momo text-blue-ink text-sm font-bold px-4 py-2 rounded-full border border-momo/70"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 4. Skills Developed */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-2">
              Key Skills Developed
            </h2>
            <p className="text-xs sm:text-sm text-gray-soft mb-6 font-medium">
              These core competencies are built through academic programs and are essential for success as a {career.title}.
            </p>
            <div className="flex flex-wrap gap-3">
              {career.keySkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-momo text-blue-ink text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full border border-momo/70 shadow-2xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-deep" />
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* 5. Where this comes from. No "verified" badge: career profiles
              haven't been checked against an official source. */}
          <div className="rounded-3xl bg-momo p-6 sm:p-8 border border-momo w-full">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-sky-deep" />
              <span className="text-xs sm:text-sm font-bold text-blue-ink uppercase tracking-wider">
                About this information
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-body mb-4 font-medium">
              This profile comes from Domner&apos;s careers dataset, written by our team. It
              hasn&apos;t been checked against an official source, and the demand level is an
              estimate rather than official job-market data. Use it as a starting point, and
              ask people who work in the field.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-blue-ink font-medium">
              <div>
                <span className="text-xs text-gray-soft block">
                  Category:
                </span>
                <span className="font-bold">{career.categoryKey}</span>
              </div>
              <div>
                <span className="text-xs text-gray-soft block">
                  Market Demand:
                </span>
                <span className="font-bold">{career.jobMarketDemand}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-ink/10 flex justify-end">
              <Link
                href="/careers"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-deep hover:underline"
              >
                Browse all careers <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

