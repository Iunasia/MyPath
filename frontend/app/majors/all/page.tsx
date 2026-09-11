import type { ApiMajor } from "@/app/lib/api";
import { getMajors } from "@/app/lib/api.server";
import AllMajorsBrowser from "./AllMajorsBrowser";

/** Fetched on the server so the page arrives filled in — see /scholarships. */
export const dynamic = "force-dynamic";

export default async function AllMajorsPage() {
  let rows: ApiMajor[] = [];
  try {
    rows = await getMajors();
  } catch {
    // The list simply stays empty; /majors reports load errors.
  }
  return <AllMajorsBrowser rows={rows} />;
}
