import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { type Locale } from "@/src/i18n/routing";
import { getScholarship, getScholarships } from "@/app/lib/api.server";
import { getScholarshipsTranslated } from "@/app/data/scholarships";
import type { ScholarshipDetailData } from "@/app/lib/api";
import ScholarshipDetail from "./ScholarshipDetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScholarshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const [detail, all] = await Promise.all([getScholarship(id), getScholarships()]);

  const translatedScholarships = await getScholarshipsTranslated(locale);
  const fallback = translatedScholarships.find(
    (s) => s.id.toLowerCase() === id.toLowerCase() || String(s.id) === id
  );

  if (!detail && !fallback) notFound();

  const resolvedDetail: ScholarshipDetailData = detail
    ? {
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
          application_process:
            fallback?.applicationProcess ?? detail.scholarship.application_process,
          target_majors: fallback?.targetMajors,
        },
      }
    : {
        scholarship: {
          id: 1,
          slug: fallback!.id,
          title: fallback!.title,
          provider: fallback!.provider,
          provider_type: "",
          coverage: fallback!.coverage,
          degree_level: fallback!.degreeLevel,
          deadline: fallback!.deadline,
          category: fallback!.category,
          source_url: fallback!.officialSource,
          image_url: fallback!.image,
          description: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
          eligibility: fallback!.eligibility,
          benefits: fallback!.benefits,
          documents: fallback!.requiredDocuments,
          application_process: fallback!.applicationProcess,
          target_majors: fallback!.targetMajors,
          amount: "",
          field_of_study: fallback!.targetMajors.join(", "),
          deadline_note: null,
          application_link: fallback!.officialSource,
          country: "Cambodia",
          opportunity_type: "scholarship",
          source: fallback!.officialSource,
          source_type: fallback!.isVerified ? "official" : "unknown",
          verified_status: fallback!.isVerified ? "verified" : "unverified",
          last_verified: fallback!.lastVerified,
          last_verified_by: null,
          safety_warnings: [],
          archived_at: null,
          archived_by: null,
          edited_at: null,
          edited_by: null,
          infoCheck: {
            verifiedStatus: fallback!.isVerified ? "verified" : "unverified",
            sourceType: "official",
            isRisky: false,
            lastVerified: fallback!.lastVerified,
            reasons: [],
            source: fallback!.officialSource,
            sourceUrl: fallback!.officialSource,
            summary: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
          },
        },
        infoCheck: {
          verifiedStatus: fallback!.isVerified ? "verified" : "unverified",
          sourceType: "official",
          isRisky: false,
          lastVerified: fallback!.lastVerified,
          reasons: [],
          source: fallback!.officialSource,
          sourceUrl: fallback!.officialSource,
          summary: `${fallback!.coverage} scholarship offered by ${fallback!.provider}.`,
        },
      };

  return <ScholarshipDetail detail={resolvedDetail} all={all ?? []} />;
}