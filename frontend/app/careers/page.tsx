import type { ApiCareer } from "@/app/lib/api";
import { getCareers } from "@/app/lib/api.server";
import CareersBrowser from "./CareersBrowser";

/** Fetched on the server so the page arrives filled in — see /scholarships. */
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  let rows: ApiCareer[] = [];
  let loadError: string | null = null;
  try {
    rows = await getCareers();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load careers";
  }
  return <CareersBrowser rows={rows} loadError={loadError} />;
}
