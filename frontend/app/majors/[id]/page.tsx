import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { MAJORS_DATA } from "@/app/data/majors";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

/* ── Static Generation for all 12 Majors ────────────────── */

export function generateStaticParams() {
  return MAJORS_DATA.map((major) => ({
    id: major.id,
  }));
}

/* ── Major Detail Page ─────────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MajorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const major = MAJORS_DATA.find((m) => m.id === id);

  if (!major) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Full-width responsive container: exactly 25px on mobile, 80px on desktop */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        
        {/* ── Top Header Component ────────────────────────── */}
        <Header
          backHref="/majors"
          backLabel="Back to Majors"
          showBackArrow={true}
          activeNav="majors"
          actions={
            <button
              className="p-1.5 text-blue-ink/75 hover:text-sky-deep transition-colors focus:outline-none cursor-pointer"
              aria-label="Share major"
              title="Share"
            >
              <Share2 className="w-5 h-5" strokeWidth={2} />
            </button>
          }
        />

        {/* ── Main Content: Full Screen with 80px Desktop Margins ── */}
        <main className="w-full pb-16 flex flex-col gap-10">
          
          {/* 1. Header & Hero Section */}
          <section className="w-full">
            {/* Category Pill */}
            <div className="mb-3">
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky/20 text-sky-deep text-xs font-extrabold uppercase tracking-wider border border-sky/20">
                {major.category}
              </span>
            </div>

            {/* Major Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-4">
              {major.name}
            </h1>

            {/* Overview Paragraph */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium mb-6 max-w-4xl">
              {major.description}
            </p>

            {/* Full Width Hero Image Banner */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[420px] rounded-3xl overflow-hidden mb-6 border border-sky/20 bubble-shadow-sm bg-sitomo/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={major.heroImage}
                alt={major.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs sm:text-sm font-bold">
                <div className="flex items-center gap-2">
                  <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                    {major.degreeType}
                  </span>
                  <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                    {major.duration}
                  </span>
                </div>
                {major.jobMarketDemand && (
                  <span className="bg-sky/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/25 text-white font-extrabold shadow-sm">
                    {major.jobMarketDemand} Demand
                  </span>
                )}
              </div>
            </div>

            {/* Save Major Button */}
            <div>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-sky text-white font-bold text-sm hover:bg-sky-bright transition-all bubble-shadow-sm cursor-pointer">
                <Bookmark className="w-4 h-4 fill-white" />
                <span>Save Major</span>
              </button>
            </div>
          </section>

          {/* 2. What you'll learn (Full Width Card, 2-column grid on desktop) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full rounded-br-[86px]">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-8">
              What you&apos;ll learn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {major.whatYouLearn.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-sitomo/20 border border-sky/10"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sitomo flex items-center justify-center shrink-0 border border-sky/15">
                      <Icon className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-blue-ink">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-body leading-relaxed mt-1 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Skills Developed (Full Width Card with spacious pills) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Skills Developed
            </h2>
            <div className="flex flex-wrap gap-3">
              {major.skillsDeveloped.map((skill) => (
                <span
                  key={skill}
                  className="bg-momo text-blue-ink text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full border border-momo/70 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* 4. Career Pathways (Centered, No Card Background) */}
          <section className="w-full">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-ink tracking-tight text-center mb-10">
              Career Pathways
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto w-full">
              {major.careerPathways.map((career) => {
                const Icon = career.icon;
                return (
                  <div
                    key={career.title}
                    className="flex flex-col items-center text-center px-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-momo text-sky-deep flex items-center justify-center mb-4 border border-momo/80 shadow-2xs">
                      <Icon className="w-8 h-8 text-sky-deep" strokeWidth={2.2} />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-2">
                      {career.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium max-w-xs">
                      {career.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Career Opportunities Sector Card */}
            {major.careerOpportunities && (
              <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-white border border-sky/15 bubble-shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-5xl mx-auto">
                <div>
                  <span className="text-xs font-bold text-gray-soft uppercase tracking-wider block mb-1">
                    Industry Hiring Sectors & Employers
                  </span>
                  <p className="font-display text-base sm:text-lg font-bold text-blue-ink">
                    {major.careerOpportunities}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sitomo text-xs font-bold text-sky-deep border border-sky/20 shadow-2xs">
                    Demand: {major.jobMarketDemand}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 5. Related Majors (Full Width 3-Column Grid) */}
          <section className="w-full">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight mb-6">
              Related Majors
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {major.relatedMajors.map((rel) => {
                const Icon = rel.icon;
                return (
                  <Link
                    key={rel.id}
                    href={`/majors/${rel.id}`}
                    className="flex flex-col items-center justify-center p-7 sm:p-8 bg-white border-2 border-sky/50 rounded-3xl rounded-br-[56px] bubble-shadow-sm hover:border-sky hover:shadow-md hover:scale-[1.02] transition-all text-center group cursor-pointer min-h-[160px]"
                  >
                    <div className="w-14 h-14 rounded-full bg-momo flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-blue-ink" strokeWidth={2} />
                    </div>
                    <span className="font-display text-base font-bold text-blue-ink group-hover:text-sky-deep transition-colors leading-snug">
                      {rel.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 6. Offer Universities (Full Width 4-Column Grid) */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight">
                Offer Universities
              </h2>
              <span className="text-xs font-semibold text-gray-soft">
                {major.offerUniversities.length} Institutions
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {major.offerUniversities.map((uni) => (
                <div
                  key={uni.name}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] border border-sky/15 bubble-shadow-sm bg-sitomo/40 hover:border-sky/40 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay for readable white text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                    <p className="text-xs sm:text-sm font-bold leading-tight drop-shadow-md">
                      {uni.name} ({uni.shortName})
                    </p>
                    <p className="text-[11px] text-white/85 font-medium mt-0.5">
                      {uni.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Related Opportunities (Full Width Grid) */}
          {major.relatedOpportunities.length > 0 && (
            <section className="w-full">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight mb-6">
                Related Opportunity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {major.relatedOpportunities.map((opp) => (
                  <div
                    key={opp.title}
                    className="flex flex-col sm:flex-row items-center gap-5 bg-white rounded-3xl p-5 border border-sky/15 bubble-shadow-sm hover:border-sky/35 transition-all"
                  >
                    <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden shrink-0 border border-sky/10 bg-sitomo/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={opp.image}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-3 py-1 rounded-full bg-sitomo text-sky-deep text-[10px] font-bold mb-2 border border-sky/10">
                        {opp.badgeText}
                      </span>
                      <h3 className="font-display text-base font-bold text-blue-ink leading-snug mb-2">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-gray-soft font-medium">
                        {opp.type} {opp.deadline && `· Deadline: ${opp.deadline}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 8. DMIL Information Verification Card (Full Width) */}
          <div className="rounded-3xl bg-momo p-6 sm:p-8 border border-momo w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-deep" />
                <span className="text-xs sm:text-sm font-bold text-blue-ink uppercase tracking-wider">
                  Information Check
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky/20 px-3 py-1 text-xs font-bold text-sky-deep">
                Verified Source
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-body mb-4 font-medium">
              Curricula standards and competencies for this major were cross-checked
              against certified accreditation bodies.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-blue-ink font-medium">
              <div>
                <span className="text-xs text-gray-soft block">Accreditation Source:</span>
                <span className="font-bold">{major.source}</span>
              </div>
              <div>
                <span className="text-xs text-gray-soft block">Last Verified:</span>
                <span className="font-bold">{major.lastVerified}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-ink/10 flex justify-end">
              <a
                href={major.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-deep hover:underline"
              >
                Official Standards <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </main>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}
