"use client";

import { useMemo } from "react";
import { Link } from "@/src/i18n";
import { useLocale, useTranslations } from "next-intl";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import ReportOutdatedButton from "@/app/components/ReportOutdatedButton";
import ShareButton from "@/app/components/ShareButton";
import BackLink from "@/app/components/BackLink";
import type { ApiScholarship, ScholarshipDetailData } from "@/app/lib/api";
import {
  deadlineLabel,
  deadlineState,
  relatedScholarships,
  toScholarshipView,
  toScholarshipViews,
} from "@/app/lib/adapters";
import {
  translateUniversityName,
  translateDegreeLevel,
  translateCoverage,
  translateCategory,
  translateScholarshipTitle,
  translateApplicationStep,
  toKhmerDigits,
} from "@/app/lib/dataTranslations";

export default function ScholarshipDetail({
  detail,
  all,
}: {
  detail: ScholarshipDetailData;
  all: ApiScholarship[];
}) {
  const t = useTranslations("scholarshipDetail");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isKm = locale === "km";

  const scholarship = useMemo(
    () => toScholarshipView({ ...detail.scholarship, infoCheck: detail.infoCheck }),
    [detail]
  );
  const related = useMemo(
    () => relatedScholarships(toScholarshipViews(all), scholarship, 4),
    [all, scholarship]
  );

  const displayTitle = isKm
    ? translateScholarshipTitle(scholarship.title, scholarship.provider, locale)
    : scholarship.title;
  const displayProvider = isKm
    ? translateUniversityName(scholarship.provider, locale)
    : scholarship.provider;
  const displayCategory = isKm
    ? translateCategory(scholarship.category, locale)
    : scholarship.category;
  const displayCoverage = isKm
    ? translateCoverage(scholarship.coverage, locale)
    : scholarship.coverage;
  const displayDegree = isKm
    ? translateDegreeLevel(scholarship.degreeLevel, locale)
    : scholarship.degreeLevel;

  const deadline = deadlineState(scholarship.deadlineAt);
  const deadlineRemaining = deadlineLabel(deadline, locale);

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-8 md:px-10 lg:px-[80px] flex flex-col">
        <BackLink href="/scholarships" label={t("allScholarships")} className="mb-4" />

        <main className="w-full pb-16 flex flex-col gap-12 md:gap-16 mt-2 sm:mt-4">
          {/* 1. Hero Section */}
          <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-deep">
                    {displayCategory}
                  </span>
                  <span className="text-gray-300">•</span>
                  {scholarship.infoCheck.isRisky ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {t("checkThisSource")}
                    </span>
                  ) : scholarship.infoCheck.verifiedStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {scholarship.infoCheck.sourceType === "official"
                        ? t("officialSourceVerified")
                        : t("sourceChecked")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-soft">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {t("notYetVerified")}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-3.5">
                  {displayTitle}
                </h1>

                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-soft mb-4">
                  <Building2 className="w-4 h-4 text-sky-deep shrink-0" />
                  <span>
                    {t("offeredBy")}{" "}
                    <strong className="text-blue-ink font-bold">
                      {displayProvider}
                    </strong>
                  </span>
                </div>

                <p className="text-xs sm:text-sm lg:text-base text-gray-body font-normal leading-relaxed mb-5 max-w-xl">
                  {isKm
                    ? `ការបញ្ចុះតម្លៃសិក្សា ឬអាហារូបករណ៍សម្រាប់និស្សិតកម្ពុជាដែលមានសិទ្ធិគ្រប់គ្រាន់ ថ្នាក់${displayDegree} សម្រាប់ឆ្នាំសិក្សា ២០២៦/២០២៧។`
                    : `${scholarship.benefits[0] || scholarship.coverage} for eligible Cambodian undergraduate students pursuing ${scholarship.degreeLevel} degrees for the 2026/2027 academic year.`}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-bold text-blue-ink mb-6">
                  <span className="flex items-center gap-2 bg-powder px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky">
                    <Coins className="w-4 h-4 text-sky-deep shrink-0" />
                    <strong className="font-bold">{displayCoverage}</strong>
                  </span>

                  <span className="flex items-center gap-2 bg-powder px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky">
                    <GraduationCap className="w-4 h-4 text-sky-deep shrink-0" />
                    <span>{t("degreeDegree", { level: displayDegree })}</span>
                  </span>

                  <span
                    className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border ${
                      deadline.kind === "closed"
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-powder border-sky"
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-[#D97736] shrink-0" />
                    <span>
                      {deadline.kind === "closed" ? t("deadlineClosed") : t("deadlineOpen")}: {scholarship.deadline}
                    </span>
                    {deadline.kind === "open" && (
                      <span className="text-sky-deep">· {deadlineRemaining}</span>
                    )}
                  </span>
                </div>

                {deadline.kind === "closed" && (
                  <p className="mb-5 max-w-xl rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                    {t("closedDeadlineMessage")}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                  <a
                    href={scholarship.officialSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-full border border-transparent bg-[#7AB3B7] text-white font-bold text-sm hover:bg-[#68A1A5] transition-colors duration-150 ease-out cursor-pointer"
                  >
                    <span>{deadline.kind === "closed" ? t("viewOfficialPage") : t("applyOnOfficialWebsite")}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <Link
                    href={`/scholarships/${scholarship.id}/quiz`}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full border-2 border-sky bg-white text-sky-deep font-bold text-sm hover:bg-sitomo/60 hover:border-sky-deep transition-colors duration-150 ease-out cursor-pointer"
                  >
                    <span>Attempt Quiz</span>
                  </Link>

                  <SaveItemButton
                    item={{
                      id: scholarship.id,
                      apiId: scholarship.apiId,
                      type: "scholarship",
                      title: displayTitle,
                      subtitle: displayProvider,
                      image: scholarship.image,
                      link: `/scholarships/${scholarship.id}`,
                    }}
                    label={t("saveScholarship")}
                    savedLabel={tCommon("saved")}
                    className="w-full sm:w-auto"
                  />

                  <div className="flex items-center gap-3">
                    <ShareButton title={displayTitle} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative w-full flex justify-center">
                <div className="relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/4] w-full max-w-lg lg:max-w-none rounded-lg overflow-hidden border-2 border-sky/25 bg-sitomo/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scholarship.image}
                    alt={displayTitle}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/images/scholarships/")) {
                        target.src = "/images/scholarships/campus.jpg";
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="w-full border-t border-sky/30" />

          {/* 2. Step-by-Step Application Process */}
          <section className="w-full">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-ink tracking-tight">
                {t("applyStepsTitle", {
                  count: isKm ? toKhmerDigits(scholarship.applicationProcess.length) : scholarship.applicationProcess.length,
                  stepText: scholarship.applicationProcess.length === 1 ? t("step") : t("easySteps"),
                })}
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft font-medium mt-2.5">
                {t("applyStepsSubtitle", { provider: displayProvider })}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
              <div className="lg:col-span-6 relative w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                <div className="bg-white rounded-lg px-6 py-5 sm:px-8 sm:py-6 border border-sky space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink leading-snug">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-gray-soft mt-0.5">
                        {t("officialSubmissionFor")} {displayProvider}
                      </p>
                    </div>

                    {/* Verified partner indicator — an inline badge, not a floating chip */}
                    <div className="inline-flex items-center gap-2 shrink-0 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold text-emerald-800">
                          {t("verifiedPartner")}
                        </p>
                        <p className="text-[9px] text-emerald-700/80 font-medium">
                          {t("intakeOfficial", { year: "2026" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <div className="flex items-center justify-between px-1 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-ink leading-tight">{t("onlineApplication")}</p>
                          <p className="text-[11px] text-gray-soft">{t("personalAcademicInfo")}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {t("ready")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1 py-3 border-t border-sky/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-ink leading-tight">{t("academicRecords")}</p>
                          <p className="text-[11px] text-gray-soft">{t("bacIICertificateVerified")}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {t("verified")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1 py-3 border-t border-sky/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sitomo text-sky-deep flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-ink leading-tight">{t("admissionsReview")}</p>
                          <p className="text-[11px] text-gray-soft">{t("committeeEvaluation")}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-sky-deep bg-sitomo/60 px-2.5 py-0.5 rounded-md">
                        {t("active")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1 py-3 border-t border-dashed border-gray-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-soft leading-tight">{t("scholarshipDecision")}</p>
                          <p className="text-[11px] text-gray-400">{t("finalAwardRegistry")}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {t("pending")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 relative w-full">
                <div className="rounded-lg px-6 py-5 sm:px-8 sm:py-6 space-y-4">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink leading-snug">
                      {t("applicationSteps")}
                    </h3>
                    <p className="text-xs text-gray-soft mt-0.5">
                      {t("officialProcessFor")} {displayProvider}
                    </p>
                  </div>

                  <div className="relative pt-2">
                    {scholarship.applicationProcess.map((step, i) => {
                      const details = translateApplicationStep(step, scholarship.provider, locale);
                      const isLast = i === scholarship.applicationProcess.length - 1;
                      return (
                        <div
                          key={i}
                          className="relative flex items-start gap-4 pb-6 last:pb-1"
                        >
                          {!isLast && (
                            <div
                              className="absolute left-4 top-8 bottom-0 w-0.5 bg-sky-deep -translate-x-1/2"
                              aria-hidden="true"
                            />
                          )}

                          <div className="w-8 h-8 rounded-full bg-sky-deep text-white text-xs font-extrabold flex items-center justify-center shrink-0 z-10 ring-4 ring-powder">
                            {isKm ? toKhmerDigits(i + 1) : i + 1}
                          </div>

                          <div className="pt-0.5">
                            <h4 className="font-display text-sm sm:text-base font-bold text-blue-ink leading-snug mb-1">
                              {details.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-normal">
                              {details.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4 & 5. Eligibility, Required Documents & Benefits (Side-by-side, align justify-between) ── */}
          <section className="w-full pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 w-full items-stretch">
              {/* Left Column: Eligibility & Required Documents */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-6 pb-4 border-b border-sky/15">
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink">
                      {t("eligibilityTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-soft font-medium mt-1">
                      {t("eligibilitySubtitle", { provider: displayProvider })}
                    </p>
                  </div>
                  {/* Eligibility Requirements */}
                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-ink">
                      <GraduationCap className="w-4 h-4 text-sky-deep" />
                      <h3>{t("eligibilityRequirements")}</h3>
                    </div>
                    <div className="space-y-3">
                      {scholarship.eligibility.map((req, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-gray-body leading-relaxed">
                            {req}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents Checklist (Below Eligibility Requirements) */}
                  {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
                    <div className="space-y-3.5 mb-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-ink">
                        <FileText className="w-4 h-4 text-sky-deep" />
                        <h3>{t("requiredDocumentsChecklist")}</h3>
                      </div>
                      <div className="space-y-3">
                        {scholarship.requiredDocuments.map((doc, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-gray-body leading-relaxed">
                              {doc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Eligible Majors & Programs Bar (pushed to bottom) */}
                {scholarship.targetMajors && scholarship.targetMajors.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-sky/15 flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-bold text-gray-soft uppercase tracking-wider shrink-0">
                      {t("eligibleMajors")}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scholarship.targetMajors.map((m) => (
                        <span
                          key={m}
                          className="px-2.5 py-1 rounded-lg bg-white text-blue-ink text-xs font-semibold border border-sky/15"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

             {/* Right Column: Benefits & Complete Award Coverage */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-6 pb-4 border-b border-sky/15">
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink">
                      {t("benefitsTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-soft font-medium mt-1">
                      {t("benefitsSubtitle", { provider: displayProvider })}
                    </p>
                  </div>

                  {/* Benefits List */}
                  <div className="divide-y divide-sky/15">
                    {scholarship.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 py-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-blue-ink leading-relaxed">
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Verification Breakdown */}
          <section className="rounded-lg bg-white border border-sky p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                {scholarship.infoCheck.isRisky ? (
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{t("informationCheck")}</span>
              </div>

              <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-2">
                {t("whyTrustThisInfo")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-normal mb-3">
                {scholarship.infoCheck.summary}
              </p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:text-sm mb-3">
                <div className="flex gap-2">
                  <dt className="font-bold text-blue-ink shrink-0">{t("sourceLabel")}</dt>
                  <dd className="text-gray-body truncate">
                    {scholarship.infoCheck.source ?? t("notRecorded")}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-bold text-blue-ink shrink-0">{t("providerLabel")}</dt>
                  <dd className="text-gray-body truncate">{displayProvider}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-bold text-blue-ink shrink-0">{t("sourceStatusLabel")}</dt>
                  <dd className="text-gray-body capitalize">
                    {scholarship.infoCheck.verifiedStatus} (
                    {scholarship.infoCheck.sourceType.replace("_", " ")})
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-bold text-blue-ink shrink-0">{t("lastVerifiedLabel")}</dt>
                  <dd className="text-gray-body">{scholarship.lastVerified}</dd>
                </div>
              </dl>

              {scholarship.infoCheck.reasons.length > 0 && (
                <ul className="space-y-1.5 rounded-md bg-momo/40 p-3.5">
                  {scholarship.infoCheck.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-blue-ink font-medium">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[11px] text-gray-soft mt-3 font-medium">
                &ldquo;Verified&rdquo; means this listing passed Domner&apos;s automated
                source checks — always confirm details on the official page before
                you apply.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              {scholarship.officialSource && (
                <a
                  href={scholarship.officialSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-deep hover:underline"
                >
                  <span>{t("viewOriginalSource")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <ReportOutdatedButton scholarshipId={scholarship.apiId} title={displayTitle} />
            </div>
          </section>

          {/* 7. Similar Opportunities */}
          {related.length > 0 && (
            <section className="w-full pt-4 border-t border-sky/15">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                    {t("similarScholarships")}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-soft font-medium">
                    {t("similarScholarshipsDesc")}
                  </p>
                </div>
                <Link
                  href="/scholarships"
                  className="text-xs font-bold text-sky-deep hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("exploreAll")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/scholarships/${item.id}`}
                    className="group relative aspect-[4/3] min-h-[190px] rounded-lg overflow-hidden cursor-pointer border border-sky/15 hover:border-sky transition-colors duration-150 ease-out block bg-sitomo/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />

                    {/* Floating Save Button on Image */}
                    <div className="absolute top-3 right-3 z-20">
                      <SaveItemButton
                        variant="card-action"
                        item={{
                          id: item.id,
                          apiId: item.apiId,
                          type: "scholarship",
                          title: item.title,
                          subtitle: item.provider,
                          image: item.image,
                          link: `/scholarships/${item.id}`,
                        }}
                      />
                    </div>

                    {/* Bottom Gradient Overlay for Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-3.5 sm:p-4 z-10">
                      <h3 className="font-display text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1.5 group-hover:text-sky-bright transition-colors line-clamp-2">
                        {isKm ? translateScholarshipTitle(item.title, item.provider, locale) : item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/75 font-medium drop-shadow-xs">
                        <Calendar className="w-3.5 h-3.5 text-sky-bright shrink-0" />
                        <span>{tCommon("deadline")}: {item.deadline}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
