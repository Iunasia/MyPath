/**
 * Server-side API client, for React Server Components.
 *
 * The browser reaches the API on the host port (`localhost:5000`), but code
 * running inside the frontend container has to use the Compose service name
 * (`backend:5000`). `BACKEND_INTERNAL_URL` is already set for that in
 * docker-compose.dev.yml; outside Docker it falls back to the public URL.
 *
 * Client components must keep using `./api` — importing this on the client
 * would leak a URL the browser cannot resolve.
 */
import type {
  ApiCareer,
  ApiMajor,
  ApiScholarship,
  ApiUniversity,
  ApiInfoCheck,
} from "./api";

const SERVER_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/**
 * Returns null for 4xx (missing/malformed), throws for 5xx and network faults.
 * Callers turn null into `notFound()`; a genuine outage should surface as an
 * error rather than a misleading "not found" page.
 */
async function getOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${SERVER_BASE}${path}`, {
    // Content changes when the team re-seeds, so never serve a stale cache.
    cache: "no-store",
  });

  if (res.status >= 400 && res.status < 500) return null;
  if (!res.ok) throw new Error(`Upstream API error ${res.status} for ${path}`);

  return res.json() as Promise<T>;
}

async function getList<T>(path: string): Promise<T[]> {
  const rows = await getOrNull<T[]>(path);
  return rows ?? [];
}

export const getCareers = () => getList<ApiCareer>("/careers");
export const getCareer = (id: string) => getOrNull<ApiCareer>(`/careers/${id}`);

export const getMajors = () => getList<ApiMajor>("/majors");
export const getMajor = (id: string) => getOrNull<ApiMajor>(`/majors/${id}`);

export const getUniversities = () => getList<ApiUniversity>("/universities");
export const getUniversity = (idOrSlug: string) =>
  getOrNull<ApiUniversity>(`/universities/${encodeURIComponent(idOrSlug)}`);

export const getScholarships = () => getList<ApiScholarship>("/scholarships");
export const getScholarship = (id: string) =>
  getOrNull<{ title: string; scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>(
    `/scholarships/${id}`
  );

