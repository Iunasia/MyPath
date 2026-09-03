import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { CAREERS_DATA } from "@/app/data/careers";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

/* ── Static Generation for all Careers ─────────────────── */

export function generateStaticParams() {
  return CAREERS_DATA.map((career) => ({
    id: career.id,
  }));
}

/* ── Career Detail Page ────────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CareerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const career = CAREERS_DATA.find((c) => c.id === id);

  if (!career) {
    notFound();
  }

  const Icon = career.icon;

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Header ────────────────────────────────────────── */}
        <Header
          backHref="/careers"
          backLabel="Back to Careers"
          activeNav="careers"
          actions={
            <>
              <button
                className="p-2.5 rounded-2xl text-blue-ink bg-white border border-sky/15 hover:bg-sitomo/80 transition-colors focus:outline-none cursor-pointer bubble-shadow-sm"
                aria-label="Save career"
                title="Save to favorites"
              >
                <Bookmark className="w-5 h-5 text-sky-deep" />
              </button>
              <button
                className="p-2.5 rounded-2xl text-blue-ink bg-white border border-sky/15 hover:bg-sitomo/80 transition-colors focus:outline-none cursor-pointer bubble-shadow-sm"
                aria-label="Share career"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-sky-deep" />
              </button>
            </>
          }
        />

        {/* ── Main Content ──────────────────────────────────── */}
        <main className="w-full pb-16 flex flex-col gap-10">
          {/* 1. Hero Section */}
          <section className="w-full">
            <div className="mb-3">
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky/20 text-sky-deep text-xs font-extrabold uppercase tracking-wider border border-sky/20">
                {career.category}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-sitomo flex items-center justify-center border border-sky/15">
                <Icon className="w-8 h-8 text-sky-deep" strokeWidth={2.2} />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {career.title}
              </h1>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium mb-6 max-w-4xl">
              {career.description}
            </p>

            <div>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-sky text-white font-bold text-sm hover:bg-sky-bright transition-all bubble-shadow-sm cursor-pointer">
                <Bookmark className="w-4 h-4 fill-white" />
                <span>Save Career</span>
              </button>
            </div>
          </section>

          {/* 2. Majors That Lead Here */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full rounded-br-[86px]">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-2">
              Majors That Lead Here
            </h2>
            <p className="text-xs sm:text-sm text-gray-soft mb-8 font-medium">
              Study one of these majors to pursue a career as a{" "}
              {career.title}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {career.relatedMajors.map((major) => {
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
          </section>

          {/* 3. Skills You'll Develop */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-sky/15 bubble-shadow-sm w-full">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-2">
              Skills You&apos;ll Develop
            </h2>
            <p className="text-xs sm:text-sm text-gray-soft mb-6 font-medium">
              These skills are built across the related majors and are highly
              valued for this career.
            </p>
            <div className="flex flex-wrap gap-3">
              {career.skillsFromMajors.map((skill) => (
                <span
                  key={skill}
                  className="bg-momo text-blue-ink text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full border border-momo/70 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* 4. Career Overview */}
          <section className="w-full">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-blue-ink tracking-tight text-center mb-10">
              About This Career
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto w-full">
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-momo text-sky-deep flex items-center justify-center mb-4 border border-momo/80 shadow-2xs">
                  <Icon className="w-8 h-8 text-sky-deep" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-2">
                  Field
                </h3>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium max-w-xs">
                  {career.category}
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-momo text-sky-deep flex items-center justify-center mb-4 border border-momo/80 shadow-2xs">
                  <span className="text-2xl font-bold text-sky-deep">
                    {career.relatedMajors.length}
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-2">
                  Related Majors
                </h3>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium max-w-xs">
                  Majors that directly prepare you for this career path.
                </p>
              </div>

              <div className="flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-momo text-sky-deep flex items-center justify-center mb-4 border border-momo/80 shadow-2xs">
                  <span className="text-2xl font-bold text-sky-deep">
                    {career.skillsFromMajors.length}
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-blue-ink mb-2">
                  Key Skills
                </h3>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium max-w-xs">
                  Core competencies you&apos;ll build through related programs.
                </p>
              </div>
            </div>
          </section>

          {/* 5. DMIL Verification Card */}
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
              Career pathway data is aggregated from accredited major curricula
              and cross-referenced with industry standards.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-blue-ink font-medium">
              <div>
                <span className="text-xs text-gray-soft block">
                  Data Source:
                </span>
                <span className="font-bold">
                  Aggregated from {career.relatedMajors.length} related major
                  {career.relatedMajors.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-soft block">
                  Career Field:
                </span>
                <span className="font-bold">{career.category}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-ink/10 flex justify-end">
              <Link
                href="/careers"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-deep hover:underline"
              >
                Browse All Careers <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
