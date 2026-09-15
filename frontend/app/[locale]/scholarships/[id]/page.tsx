import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { type Locale } from "@/src/i18n/routing";
import { getScholarship, getScholarships } from "@/app/lib/api.server";
import { getScholarshipsTranslated } from "@/app/data/scholarships";
import ScholarshipDetail from "./ScholarshipDetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScholarshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("scholarshipDetail");
  const locale = (await getLocale()) as Locale;
  const [detail, all] = await Promise.all([getScholarship(id), getScholarships()]);

  const translatedScholarships = await getScholarshipsTranslated(locale);
  const fallback = translatedScholarships.find(
    (s) => s.id.toLowerCase() === id.toLowerCase() || String(s.id) === id
  );

  if (!detail && !fallback) notFound();

  const resolvedDetail = detail
    ? ({
        ...detail,
        scholarship: {
          ...detail.scholarship,
          title: fallback?.title ?? detail.scholarship.title,
          provider: fallback?.provider ?? detail.scholarship.provider,
          coverage: fallback?.coverage ?? detail.scholarship.coverage,
          degree_level: fallback?.degreeLevel ?? detail.scholarship.degree_level,
          category: fallback?.category,
          eligibility: fallback?.eligibility ?? detail.scholarship.eligibility,
          benefits: fallback?.benefits,
          documents: fallback?.requiredDocuments ?? detail.scholarship.documents,
          application_process: fallback?.applicationProcess ?? detail.scholarship.application_process,
          target_majors: fallback?.targetMajors,
        },
      } as any)
    : ({
        title: fallback!.title,
        scholarship: {
          id: 1,
          slug: fallback!.id,
          title: fallback!.title,
          provider: fallback!.provider,
          coverage: fallback!.coverage,
          degree_level: fallback!.degreeLevel,
          deadline: fallback!.deadline,
          category: fallback!.category,
          source_url: fallback!.officialSource,
          image_url: fallback!.image,
          description: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
          eligibility: fallback!.eligibility,
          benefits: fallback!.benefits,
          requirements: fallback!.requiredDocuments,
          application_process: fallback!.applicationProcess,
          target_majors: fallback!.targetMajors,
          last_verified_at: fallback!.lastVerified,
          is_verified: fallback!.isVerified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
        infoCheck: {
          verifiedStatus: fallback!.isVerified ? ("verified" as const) : ("unverified" as const),
          sourceType: "official" as const,
          isRisky: false,
          lastChecked: fallback!.lastVerified,
          reasons: [],
          source: fallback!.officialSource,
          sourceUrl: fallback!.officialSource,
          lastVerified: fallback!.lastVerified,
          summary: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
        } as any,
      } as any);

  return <ScholarshipDetail detail={resolvedDetail} all={all ?? []} />;
}
