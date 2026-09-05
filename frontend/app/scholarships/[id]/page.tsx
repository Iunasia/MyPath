"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  ExternalLink,
  GraduationCap,
  Share2,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  getScholarshipById,
  getRelatedScholarships,
} from "@/app/data/scholarships";

function getStepDetails(stepText: string): { title: string; description: string } {
  if (stepText.includes(" - ")) {
    const parts = stepText.split(" - ");
    const cleanTitle = parts[0].replace(/^\d+[\.\)]\s*/, "").trim();
    return {
      title: cleanTitle,
      description: parts.slice(1).join(" - ").trim(),
    };
  }

  if (stepText.includes(": ")) {
    const parts = stepText.split(": ");
    const cleanTitle = parts[0].replace(/^\d+[\.\)]\s*/, "").trim();
    return {
      title: cleanTitle,
      description: parts.slice(1).join(": ").trim(),
    };
  }

  const clean = stepText.replace(/^\d+[\.\)]\s*/, "").trim();
  const lower = clean.toLowerCase();

  let title = "";
  if (lower.startsWith("visit") || lower.includes("campus") || lower.includes("portal")) {
    title = "Visit Campus or Official Portal";
  } else if (lower.startsWith("register online and pay")) {
    title = "Online Registration & Exam Fee";
  } else if (lower.startsWith("register") || lower.includes("registration")) {
    title = "Register Online for Intake";
  } else if (lower.startsWith("complete the online application")) {
    title = "Complete Online Application";
  } else if (lower.startsWith("submit") && (lower.includes("form") || lower.includes("application"))) {
    title = "Submit Application Forms";
  } else if (lower.startsWith("upload") || lower.includes("house photos")) {
    title = "Upload Required Documents";
  } else if (lower.startsWith("provide") || lower.includes("proof") || lower.includes("income status")) {
    title = "Verify Financial & Academic Records";
  } else if (lower.includes("mock exam")) {
    title = "Preparatory Mock Exam";
  } else if (lower.includes("fee") || lower.includes("payment")) {
    title = "Pay Exam Registration Fee";
  } else if (lower.includes("part 1 exam")) {
    title = "Sit for Part 1 Examination";
  } else if (lower.includes("part 2 exam")) {
    title = "Sit for Part 2 Examination";
  } else if (lower.includes("sit for") || lower.includes("entrance exam") || lower.includes("scholarship exam") || lower.includes("evaluation exam")) {
    title = "Take Scholarship Entrance Exam";
  } else if (lower.includes("interview") || lower.includes("panel")) {
    title = "Attend Committee Interview";
  } else if (lower.includes("results announcement") || lower.includes("registry")) {
    title = "Results Announcement & Registry";
  } else if (lower.includes("award letter") || lower.includes("confirmation") || lower.includes("enrollment")) {
    title = "Confirm Award & Finalize Enrollment";
  } else if (lower.includes("cutoff") || lower.includes("verify national")) {
    title = "Verify Grade Cutoff Percentiles";
  } else {
    const words = clean.split(" ");
    title = words.slice(0, Math.min(words.length, 5)).join(" ");
  }

  return {
    title,
    description: clean,
  };
}

export default function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const scholarship = getScholarshipById(resolvedParams.id);
  const [copied, setCopied] = useState(false);

  if (!scholarship) {
    notFound();
  }

  const related = getRelatedScholarships(scholarship.id, 3);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Responsive Viewport Container: 25px on mobile, 32px-40px on tablet, 80px on desktop */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-8 md:px-10 lg:px-[80px] flex flex-col">
        {/* ── Top Header Component ────────────────────────── */}
        <Header
          backHref="/scholarships"
          backLabel="All Scholarships"
          activeNav="scholarships"
          showBackArrow={true}
          actions={
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-blue-ink/75 hover:text-sky-deep hover:bg-sitomo/50 transition-colors focus:outline-none cursor-pointer"
              aria-label="Share scholarship"
              title="Share link"
            >
              <Share2 className="w-5 h-5" strokeWidth={2} />
            </button>
          }
        />

        {copied && (
          <div className="fixed bottom-6 right-6 z-50 bg-blue-ink text-white text-xs font-bold px-4 py-2.5 rounded-full bubble-shadow-sm flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Link copied to clipboard!
          </div>
        )}

        {/* ── Main Content Area (Clean text-focused editorial layout) ── */}
        <main className="w-full pb-16 flex flex-col gap-12 md:gap-16 mt-2 sm:mt-4">
          {/* ── 1. Hero Section (Split 2-Column: Clean text on left, Image on right) ── */}
          <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Pure Typography & Action Buttons */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {/* Clean Category & Verified Line */}
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-deep">
                    {scholarship.category}
                  </span>
                  <span className="text-gray-300">•</span>
                  {scholarship.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Official Cambodia Verified
                    </span>
                  )}
                </div>

                {/* Main Scholarship Title */}
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-3.5">
                  {scholarship.title}
                </h1>

                {/* University / Provider */}
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-soft mb-4">
                  <Building2 className="w-4 h-4 text-sky-deep shrink-0" />
                  <span>
                    Offered by{" "}
                    <strong className="text-blue-ink font-bold">
                      {scholarship.provider}
                    </strong>
                  </span>
                </div>

                {/* Key Summary Lead */}
                <p className="text-xs sm:text-sm lg:text-base text-gray-body font-normal leading-relaxed mb-5 max-w-xl">
                  {scholarship.benefits[0]} for eligible Cambodian undergraduate students pursuing {scholarship.degreeLevel} degrees for the 2026/2027 academic year.
                </p>

                {/* Key Highlight Pills (Placed above Save & Apply buttons) */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-bold text-blue-ink mb-6">
                  <span className="flex items-center gap-2 bg-powder px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky">
                    <Coins className="w-4 h-4 text-sky-deep shrink-0" />
                    <strong className="font-bold">{scholarship.coverage}</strong>
                  </span>

                  <span className="flex items-center gap-2 bg-powder px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky">
                    <GraduationCap className="w-4 h-4 text-sky-deep shrink-0" />
                    <span>{scholarship.degreeLevel} Degree</span>
                  </span>

                  <span className="flex items-center gap-2 bg-powder px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky">
                    <Calendar className="w-4 h-4 text-[#D97736] shrink-0" />
                    <span>Deadline: {scholarship.deadline}</span>
                  </span>
                </div>

                {/* Call to Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <a
                    href={scholarship.officialSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-sky text-white font-bold text-xs sm:text-sm hover:bg-sky-bright transition-all bubble-shadow-sm cursor-pointer"
                  >
                    <span>Apply on Official Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <SaveItemButton
                    item={{
                      id: scholarship.id,
                      type: "scholarship",
                      title: scholarship.title,
                      subtitle: scholarship.provider,
                      image: scholarship.image,
                      link: `/scholarships/${scholarship.id}`,
                    }}
                    label="Save Scholarship"
                    savedLabel="Saved"
                  />
                </div>
              </div>

              {/* Right Column: Hero Graphic Frame (Clean image without overlays) */}
              <div className="lg:col-span-5 relative w-full flex justify-start">
                <div className="relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[5/4] w-full max-w-lg lg:max-w-none rounded-3xl rounded-br-[86px] sm:rounded-br-[86px] overflow-hidden border-2 border-sky/25 bubble-shadow-sm bg-sitomo/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scholarship.image}
                    alt={scholarship.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Divider Line between Hero and Apply Section */}
          <div className="w-full border-t border-sky/30" />

          {/* ── 2. Step-by-Step Application Process (Matches reference design) ── */}
          <section className="w-full">
            {/* Section Title */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-ink tracking-tight">
                Apply for this scholarship in {scholarship.applicationProcess.length} easy steps
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft font-medium mt-2.5">
                Follow these official steps to complete your admission and scholarship submission to {scholarship.provider}.
              </p>
            </div>

            {/* Split 2-Column: Left Application Card + Right Clean Steps Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
              {/* Left Column: Sleek Application Preview Card (Wider 6-column presentation, compact height) */}
              <div className="lg:col-span-6 relative w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                <div className="bg-white rounded-3xl px-6 py-5 sm:px-8 sm:py-6 border border-sky bubble-shadow-sm space-y-4">
                  {/* Card Header */}
                  <div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink leading-snug">
                      {scholarship.title}
                    </h3>
                    <p className="text-xs text-gray-soft mt-0.5">
                      Official submission for {scholarship.provider}
                    </p>
                  </div>

                  {/* Clean Status Checklist Mockup */}
                  <div className="space-y-2.5 pt-0.5">
                    <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-powder/70 border border-sky/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-ink leading-tight">Online Application</p>
                          <p className="text-[11px] text-gray-soft">Personal & academic info</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        Ready
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-powder/70 border border-sky/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-ink leading-tight">Academic Records</p>
                          <p className="text-[11px] text-gray-soft">Bac II certificate verified</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-sky/15">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sitomo text-sky-deep flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-blue-ink leading-tight">Admissions Review</p>
                          <p className="text-[11px] text-gray-soft">Committee evaluation</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-sky-deep bg-sitomo/60 px-2.5 py-0.5 rounded-md">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-dashed border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-soft leading-tight">Scholarship Decision</p>
                          <p className="text-[11px] text-gray-400">Final award registry</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400">
                        Pending
                      </span>
                    </div>
                  </div>

 
                </div>

                {/* Floating Overlapping Badge (Matching Reference Design) */}
                <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 border border-sky/20 bubble-shadow flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-ink leading-tight">
                      Verified Partner
                    </p>
                    <p className="text-[10px] text-gray-soft font-medium">
                      2026 Intake Official
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Step-by-Step Roadmap Card (Aligned with left card, border as button color, no card bg) */}
              <div className="lg:col-span-6 relative w-full">
                <div className="rounded-3xl px-6 py-5 sm:px-8 sm:py-6  space-y-4">
                  {/* Card Header */}
                  <div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink leading-snug">
                      Application Steps
                    </h3>
                    <p className="text-xs text-gray-soft mt-0.5">
                      Official process for {scholarship.provider}
                    </p>
                  </div>

                  {/* Vertical Stepper Timeline (Matching reference with connected lines & number circles) */}
                  <div className="relative pt-2">
                    {scholarship.applicationProcess.map((step, i) => {
                      const details = getStepDetails(step);
                      const isLast = i === scholarship.applicationProcess.length - 1;
                      return (
                        <div
                          key={i}
                          className="relative flex items-start gap-4 pb-6 last:pb-1"
                        >
                          {/* Connecting vertical line to next step */}
                          {!isLast && (
                            <div
                              className="absolute left-4 top-8 bottom-0 w-0.5 bg-sky -translate-x-1/2"
                              aria-hidden="true"
                            />
                          )}

                          {/* Number Circle */}
                          <div className="w-8 h-8 rounded-full bg-sky text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs z-10 ring-4 ring-powder">
                            {i + 1}
                          </div>

                          {/* Step Title & Description */}
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

          {/* ── 4. Eligibility & Requirements (Clean typography layout, no box clutter) ── */}
          <section className="w-full pt-4">
            <div className="mb-8 pb-4 border-b border-sky/15">

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink mt-1">
                Eligibility & Required Documents
              </h2>
              <p className="text-xs sm:text-sm text-gray-soft font-medium mt-1">
                Academic and admission qualifications to prepare for your application to {scholarship.provider}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
              {/* Left Column: Eligibility Requirements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-ink">
                  <GraduationCap className="w-4 h-4 text-sky-deep" />
                  <h3>Eligibility Requirements</h3>
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

              {/* Right Column: Required Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-ink">
                  <FileText className="w-4 h-4 text-sky-deep" />
                  <h3>Required Documents Checklist</h3>
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
            </div>

            {/* Eligible Majors & Programs Bar */}
            <div className="mt-8 pt-6 border-t border-sky/15 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-bold text-gray-soft uppercase tracking-wider shrink-0">
                Eligible Majors:
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
          </section>

          {/* ── 5. Benefits & Financial Coverage (Clean text layout, no box inside box) ── */}
          <section className="w-full pt-4 ">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky/15">
              <div>

                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink mt-1">
                  Benefits & Complete Award Coverage
                </h2>
                <p className="text-xs sm:text-sm text-gray-soft font-medium mt-1">
                  Tuition waiver allowances and academic advantages provided by {scholarship.provider}
                </p>
              </div>


            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {scholarship.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-blue-ink leading-relaxed">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 6. Official Verification Guarantee (Clean text section, no card box) ── */}
          <section className="w-full pt-6 pb-2 border-t border-sky/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-deep mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Domner Information Guarantee</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-1">
                Official Source Verification
              </h3>
              <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-normal">
                This scholarship profile was validated directly against official Cambodian higher education notices from{" "}
                <strong>{scholarship.provider}</strong>. Last confirmed: <strong>{scholarship.lastVerified}</strong>.
              </p>
            </div>

            <a
              href={scholarship.officialSource}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-deep hover:underline shrink-0"
            >
              <span>Verify on university portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </section>

          {/* ── 7. Similar Opportunities ── */}
          {related.length > 0 && (
            <section className="w-full pt-4 border-t border-sky/15">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                    Similar Scholarships
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-soft font-medium">
                    Other verified programs in Cambodian universities
                  </p>
                </div>
                <Link
                  href="/scholarships"
                  className="text-xs font-bold text-sky-deep hover:underline inline-flex items-center gap-1"
                >
                  <span>Explore all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/scholarships/${item.id}`}
                    className="group relative aspect-[4/3] min-h-[200px] rounded-3xl rounded-br-[86px] sm:rounded-br-[86px] overflow-hidden cursor-pointer bubble-shadow-sm border border-sky/15 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg block bg-sitomo/40"
                  >
                    {/* Full Card Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                    />

                    {/* Gentle Darkening Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />

                    {/* Bottom Gradient Overlay for Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-5 z-10">
                      <h3 className="font-display text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug drop-shadow-sm mb-1 group-hover:text-sky-bright transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-white/90 drop-shadow-xs mb-1.5 truncate">
                        {item.provider}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/75 font-medium drop-shadow-xs">
                        <Calendar className="w-3.5 h-3.5 text-sky-bright shrink-0" />
                        <span>Deadline: {item.deadline}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
