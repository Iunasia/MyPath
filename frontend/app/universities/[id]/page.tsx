import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Globe,
  Briefcase,
  Database,
  Heart,
  Building2,
  ShieldCheck,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SaveItemButton from "@/app/components/SaveItemButton";
import {
  UNIVERSITIES_DATA,
  getUniversityById,
} from "@/app/data/universities";

/* ── Static Generation for All Universities ──────────────── */

export function generateStaticParams() {
  return UNIVERSITIES_DATA.map((uni) => ({
    id: uni.id,
  }));
}

/* ── Icon Selector Helper ────────────────────────────────── */

function getProgramIcon(iconName: string) {
  switch (iconName) {
    case "laptop":
      return Laptop;
    case "globe":
      return Globe;
    case "briefcase":
      return Briefcase;
    case "database":
      return Database;
    case "heart":
      return Heart;
    case "shield":
      return ShieldCheck;
    default:
      return Building2;
  }
}

/* ── University Detail Page ──────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const university = getUniversityById(id);

  if (!university) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* Full-width responsive container: exactly 25px on mobile, 80px on desktop */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        {/* ── Top Header Component ────────────────────────── */}
        <Header
          backHref="/universities"
          backLabel="Back to Universities"
          showBackArrow={true}
          activeNav="universities"
        />

        {/* ── Main Content Container ────────────────────────── */}
        <main className="w-full pb-16 flex flex-col gap-10 mt-4">
          {/* 1. Hero Campus Image Banner */}
          <section className="w-full">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[420px] rounded-3xl overflow-hidden mb-6 border border-sky/20 bubble-shadow-sm bg-sitomo/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={university.heroImage || university.image}
                alt={university.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Save Button on Image Banner */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                <SaveItemButton
                  item={{
                    id: university.id,
                    type: "university",
                    title: university.name,
                    subtitle: university.location,
                    image: university.heroImage || university.image,
                    badge: university.type,
                    link: `/universities/${university.id}`,
                  }}
                  variant="pill"
                />
              </div>

              {/* Bottom Badges on Hero Banner */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs sm:text-sm font-bold">
                <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                  {university.type} University
                </span>
                <span className="bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                  {university.location}
                </span>
              </div>
            </div>

            {/* University Tagline / Slogan */}
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
                {university.taglinePrefix}{" "}
                <span className="text-sky-deep underline decoration-sky/40 underline-offset-4">
                  {university.taglineHighlight}
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-body leading-relaxed font-medium mt-3">
                {university.description}
              </p>
            </div>
          </section>

          {/* 2. Degree Levels: Undergraduate & Graduate (Side-by-side on desktop, stacked on mobile) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Undergraduate Degree */}
            <div className="flex flex-col">
              <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden mb-3.5 border border-sky/15 bubble-shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.undergraduate.image}
                  alt={university.undergraduate.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="border-l-4 border-sky pl-3.5 py-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink">
                  {university.undergraduate.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium mt-1">
                  {university.undergraduate.description}
                </p>
              </div>
            </div>

            {/* Graduate Degree */}
            <div className="flex flex-col">
              <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden mb-3.5 border border-sky/15 bubble-shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.graduate.image}
                  alt={university.graduate.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="border-l-4 border-sky pl-3.5 py-1">
                <h2 className="font-display text-lg sm:text-xl font-bold text-blue-ink">
                  {university.graduate.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium mt-1">
                  {university.graduate.description}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Academic Programs (3-Column Layout with Asymmetrical Rounded Cards) */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Academic Programs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {university.programs.map((program) => {
                const Icon = getProgramIcon(program.iconName);
                return (
                  <div
                    key={program.title}
                    className="rounded-3xl border-2 border-sky/35 bg-white/80 backdrop-blur-xs p-6 sm:p-7 text-center bubble-shadow-sm hover:border-sky transition-all flex flex-col items-center rounded-br-[56px]"
                  >
                    {/* Centered Cream Circular Icon Badge */}
                    <div className="w-14 h-14 rounded-full bg-momo flex items-center justify-center mb-4 border border-sky/20 shadow-2xs">
                      <Icon className="w-6 h-6 text-blue-ink" strokeWidth={2.2} />
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-2">
                      {program.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-body leading-relaxed font-medium">
                      {program.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Admission Requirements & Deadline */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Admission
            </h2>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/15 bubble-shadow-sm max-w-3xl">
              {/* Checklist Requirements */}
              <div className="space-y-3.5 mb-6">
                {university.admissionRequirements.map((req) => (
                  <div key={req} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-sky-deep shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-ink">
                      {req}
                    </span>
                  </div>
                ))}
              </div>

              {/* Application Deadline Box */}
              <div className="bg-sitomo/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-sky/20">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-soft block">
                    Application Deadline
                  </span>
                  <span className="font-display text-sm sm:text-base font-extrabold text-sky-deep mt-0.5 block">
                    {university.applicationDeadline}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-sky/20 shadow-2xs shrink-0">
                  <Calendar className="w-5 h-5 text-sky-deep" />
                </div>
              </div>
            </div>
          </section>

          {/* 5. Campus Facilities */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Campus Facilities
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {university.facilities.map((fac) => (
                <div key={fac.name} className="flex flex-col group">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-sky/15 bubble-shadow-sm mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fac.image}
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-blue-ink leading-snug">
                    {fac.name}
                  </h3>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Scholarship Opportunity */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Scholarship
            </h2>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky/15 bubble-shadow-sm max-w-3xl flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden shrink-0 border border-sky/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.scholarship.image}
                  alt={university.scholarship.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-2">
                  {university.scholarship.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-100 w-fit">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Deadline: {university.scholarship.deadline}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Location & Map */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink mb-6">
              Location
            </h2>

            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-sky/15 bubble-shadow-sm max-w-3xl">
              <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-sky/15 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={university.mapImage}
                  alt={`${university.name} Location Map`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-blue-ink flex items-center gap-1.5 shadow-sm border border-sky/15">
                  <MapPin className="w-3.5 h-3.5 text-sky-deep" />
                  <span>{university.location}</span>
                </div>
              </div>

              <a
                href={university.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-sky-deep hover:underline bg-sitomo/60 px-4 py-2.5 rounded-full border border-sky/20 transition-colors"
              >
                <span>{university.mapUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>
        </main>
      </div>

      {/* ── Reusable Footer Component ────────────────────── */}
      <Footer />
    </div>
  );
}

