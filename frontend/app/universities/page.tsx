import type { ApiUniversity } from "@/app/lib/api";
import { getUniversities } from "@/app/lib/api.server";
import UniversitiesBrowser from "./UniversitiesBrowser";

/** Fetched on the server so the page arrives filled in — see /scholarships. */
export const dynamic = "force-dynamic";

export default async function UniversitiesPage() {
  let rows: ApiUniversity[] = [];
  let loadError: string | null = null;
  try {
    rows = await getUniversities();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load universities";
  }
  return <UniversitiesBrowser rows={rows} loadError={loadError} />;
}
