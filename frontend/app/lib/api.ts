/**
 * Typed client for the MyPath backend.
 *
 * Mirrors `backend/openapi.yaml`. Field names are the backend's snake_case —
 * translation into the shapes the pages render happens in `adapters.ts`, so
 * there is exactly one place to look when the API changes.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ApiInfoCheck {
  isRisky: boolean;
  reasons: string[];
  source: string | null;
  sourceUrl: string | null;
  sourceType: "official" | "organisation" | "news" | "social_media" | "unknown";
  verifiedStatus: "verified" | "flagged" | "unverified";
  lastVerified: string | null;
  summary: string;
}

export interface ApiScholarship {
  id: number;
  title: string;
  provider: string;
  provider_type: string;
  description: string;
  amount: string;
  coverage: string;
  eligibility: string;
  degree_level: string | null;
  field_of_study: string | null;
  documents: string[];
  application_process: string | null;
  deadline: string | null;
  deadline_note: string | null;
  application_link: string;
  image_url: string | null;
  country: string;
  opportunity_type: string;
  source: string;
  source_url: string;
  source_type: string;
  verified_status: string;
  last_verified: string | null;
  /** The admin who last checked it; null when nobody has, or the date came from the sheet. */
  last_verified_by: number | null;
  safety_warnings: string[];
  /** Soft delete: hidden from students, still visible and restorable in admin. */
  archived_at: string | null;
  archived_by: number | null;
  edited_at: string | null;
  edited_by: number | null;
  infoCheck: ApiInfoCheck;
}

/**
 * Detail-page shape: the API row plus the curated spreadsheet fields the page
 * falls back to when no backend row exists yet. `eligibility` and
 * `application_process` are widened because the sheet stores bullets.
 */
export type ScholarshipDetailData = {
  scholarship: Omit<ApiScholarship, "eligibility" | "application_process"> & {
    eligibility: string | string[];
    application_process: string | string[] | null;
    category?: string;
    benefits?: string[];
    target_majors?: string[];
    slug?: string;
  };
  infoCheck: ApiInfoCheck;
};

/** The editable fields an admin can write. Provenance is derived by the server. */
export interface ScholarshipInput {
  title?: string;
  provider?: string;
  provider_type?: string;
  description?: string;
  amount?: string | null;
  coverage?: string | null;
  eligibility?: string | null;
  degree_level?: string | null;
  field_of_study?: string | null;
  documents?: string[];
  application_process?: string | null;
  deadline?: string | null;
  deadline_note?: string | null;
  application_link?: string;
  image_url?: string | null;
  country?: string | null;
  opportunity_type?: string;
}

export interface ApiAuditEntry {
  id: number;
  entity: string;
  row_id: number;
  action: "create" | "update" | "archive" | "restore";
  actor_id: number | null;
  actor_name?: string | null;
  changes: Record<string, { from?: unknown; to?: unknown }>;
  reason: string | null;
  created_at: string;
}

export interface ApiCareer {
  id: number;
  title: string;
  category: string;
  description: string;
  responsibilities: string | null;
  average_salary: string | null;
  growth_outlook: string | null;
  education_required: string | null;
  personality_fit: string | null;
  required_skills: string[];
  related_majors: string[];
  source: string | null;
  source_url: string | null;
  archived_at: string | null;
  archived_by: number | null;
  edited_at: string | null;
  edited_by: number | null;
}

export interface ApiMajor {
  id: number;
  name: string;
  field: string;
  description: string;
  duration: string | null;
  degree_type: string | null;
  subjects: string[];
  personality_fit: string | null;
  job_market_demand: string | null;
  related_careers: string[];
  universities: string[];
  related_scholarships: string[];
  source: string | null;
  source_url: string | null;
  archived_at: string | null;
  archived_by: number | null;
  edited_at: string | null;
  edited_by: number | null;
}

export interface ApiUniversity {
  id: number;
  slug: string | null;
  name: string;
  short_name: string | null;
  country: string;
  city: string;
  type: string | null;
  ranking: number | null;
  description: string;
  website: string;
  phone: string | null;
  established: string | null;
  student_count: string | null;
  image_url: string | null;
  tuition_range: string | null;
  acceptance_rate: string | null;
  programs: string[];
  scholarships: string[];
  source: string;
  source_url: string;
  archived_at: string | null;
  archived_by: number | null;
  edited_at: string | null;
  edited_by: number | null;
}

/** Editable fields for the catalogue write endpoints. */
export interface CareerInput {
  title?: string;
  category?: string;
  description?: string;
  responsibilities?: string | null;
  average_salary?: string | null;
  growth_outlook?: string | null;
  education_required?: string | null;
  personality_fit?: string | null;
  required_skills?: string[];
  related_majors?: string[];
}

export interface MajorInput {
  name?: string;
  field?: string;
  description?: string;
  duration?: string | null;
  degree_type?: string | null;
  subjects?: string[];
  personality_fit?: string | null;
  job_market_demand?: string | null;
  related_careers?: string[];
  universities?: string[];
  related_scholarships?: string[];
}

export interface UniversityInput {
  slug?: string | null;
  name?: string;
  short_name?: string | null;
  country?: string | null;
  city?: string | null;
  type?: string | null;
  ranking?: number | null;
  description?: string;
  website?: string;
  phone?: string | null;
  established?: string | null;
  student_count?: string | null;
  image_url?: string | null;
  tuition_range?: string | null;
  acceptance_rate?: string | null;
  programs?: string[];
  scholarships?: string[];
}

export type SavedItemType = "scholarship" | "major" | "career" | "university";

export interface ApiSavedItem {
  user_id: number;
  item_type: SavedItemType;
  item_id: number;
  slug?: string | null;
  saved_at: string;
  title: string;
  subtitle: string | null;
  image: string | null;
}

export type RiskLevel = "low" | "caution" | "high";
export type RequestStatus = "pending" | "reviewing" | "resolved";
export type Verdict = "legitimate" | "scam" | "outdated" | "unverifiable";

export interface ApiLinkCheck {
  score: number;
  level: RiskLevel;
  findings: string[];
  passed: string[];
  hostname: string | null;
  sourceType: string;
}

export interface ApiVerificationRequest {
  id: number;
  user_id: number | null;
  scholarship_id: number | null;
  submitted_url: string | null;
  submitted_title: string;
  note: string | null;
  auto_check: ApiLinkCheck | null;
  status: RequestStatus;
  verdict: Verdict | null;
  admin_response: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  read_by_user: boolean;
  created_at: string;
  submitted_by_name?: string | null;
  submitted_by_email?: string | null;
  reviewed_by_name?: string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });

  if (!res.ok) {
    // The backend always answers JSON, including for errors.
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const fetchScholarships = (options: { includeArchived?: boolean } = {}) =>
  get<ApiScholarship[]>(`/scholarships${options.includeArchived ? "?includeArchived=1" : ""}`);

export const fetchScholarship = (id: number | string) =>
  get<{ title: string; scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>(
    `/scholarships/${id}`
  );

/* ------------------------------------------------------------------ */
/* Catalogue editing — admins only                                     */
/* ------------------------------------------------------------------ */

export const createScholarship = (input: ScholarshipInput) =>
  sendJson<{ scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>("POST", "/scholarships", input);

export const updateScholarship = (id: number, input: ScholarshipInput) =>
  sendJson<{ scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>("PATCH", `/scholarships/${id}`, input);

export const archiveScholarship = (id: number, reason?: string) =>
  sendJson<{ scholarship: ApiScholarship }>("POST", `/scholarships/${id}/archive`, reason ? { reason } : {});

export const restoreScholarship = (id: number) =>
  sendJson<{ scholarship: ApiScholarship }>("POST", `/scholarships/${id}/restore`, {});

export const fetchScholarshipHistory = (id: number) => get<ApiAuditEntry[]>(`/scholarships/${id}/history`);

/** Download a CSV export as a blob, so the caller can trigger a download. */
export const exportCsv = async (path: string): Promise<Blob> => {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
  return res.blob();
};

const exportPath = (base: string, includeArchived: boolean) =>
  `${base}/export?includeArchived=${includeArchived ? 1 : 0}`;

export const exportScholarshipsCsv = (includeArchived = false) =>
  exportCsv(exportPath("/scholarships", includeArchived));
export const exportCareersCsv = (includeArchived = false) =>
  exportCsv(exportPath("/careers", includeArchived));
export const exportMajorsCsv = (includeArchived = false) =>
  exportCsv(exportPath("/majors", includeArchived));
export const exportUniversitiesCsv = (includeArchived = false) =>
  exportCsv(exportPath("/universities", includeArchived));

const listPath = (base: string, options: { includeArchived?: boolean } = {}) =>
  `${base}${options.includeArchived ? "?includeArchived=1" : ""}`;

export const fetchCareers = (options: { includeArchived?: boolean } = {}) =>
  get<ApiCareer[]>(listPath("/careers", options));
export const fetchCareer = (id: number | string) => get<ApiCareer>(`/careers/${id}`);

export const fetchMajors = (options: { includeArchived?: boolean } = {}) =>
  get<ApiMajor[]>(listPath("/majors", options));
export const fetchMajor = (id: number | string) => get<ApiMajor>(`/majors/${id}`);

export const fetchUniversities = (options: { includeArchived?: boolean } = {}) =>
  get<ApiUniversity[]>(listPath("/universities", options));
export const fetchUniversity = (id: number | string) => get<ApiUniversity>(`/universities/${id}`);

/* ------------------------------------------------------------------ */
/* Catalogue editing — admins only                                     */
/* ------------------------------------------------------------------ */

export const createCareer = (input: CareerInput) =>
  sendJson<{ career: ApiCareer }>("POST", "/careers", input);
export const updateCareer = (id: number, input: CareerInput) =>
  sendJson<{ career: ApiCareer }>("PATCH", `/careers/${id}`, input);
export const archiveCareer = (id: number, reason?: string) =>
  sendJson<{ career: ApiCareer }>("POST", `/careers/${id}/archive`, reason ? { reason } : {});
export const restoreCareer = (id: number) =>
  sendJson<{ career: ApiCareer }>("POST", `/careers/${id}/restore`, {});
export const fetchCareerHistory = (id: number) => get<ApiAuditEntry[]>(`/careers/${id}/history`);

export const createMajor = (input: MajorInput) =>
  sendJson<{ major: ApiMajor }>("POST", "/majors", input);
export const updateMajor = (id: number, input: MajorInput) =>
  sendJson<{ major: ApiMajor }>("PATCH", `/majors/${id}`, input);
export const archiveMajor = (id: number, reason?: string) =>
  sendJson<{ major: ApiMajor }>("POST", `/majors/${id}/archive`, reason ? { reason } : {});
export const restoreMajor = (id: number) =>
  sendJson<{ major: ApiMajor }>("POST", `/majors/${id}/restore`, {});
export const fetchMajorHistory = (id: number) => get<ApiAuditEntry[]>(`/majors/${id}/history`);

export const createUniversity = (input: UniversityInput) =>
  sendJson<{ university: ApiUniversity }>("POST", "/universities", input);
export const updateUniversity = (id: number, input: UniversityInput) =>
  sendJson<{ university: ApiUniversity }>("PATCH", `/universities/${id}`, input);
export const archiveUniversity = (id: number, reason?: string) =>
  sendJson<{ university: ApiUniversity }>("POST", `/universities/${id}/archive`, reason ? { reason } : {});
export const restoreUniversity = (id: number) =>
  sendJson<{ university: ApiUniversity }>("POST", `/universities/${id}/restore`, {});
export const fetchUniversityHistory = (id: number) =>
  get<ApiAuditEntry[]>(`/universities/${id}/history`);

/* ------------------------------------------------------------------ */
/* Saved items — all require a session                                 */
/* ------------------------------------------------------------------ */

export const fetchSavedItems = () => get<ApiSavedItem[]>("/saved");

async function send(method: "POST" | "DELETE", path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }
}

export const saveItem = (type: SavedItemType, id: number | string) =>
  send("POST", `/saved/${type}/${encodeURIComponent(id)}`);

export const unsaveItem = (type: SavedItemType, id: number | string) =>
  send("DELETE", `/saved/${type}/${encodeURIComponent(id)}`);

/* ------------------------------------------------------------------ */
/* Verification requests — the DMIL loop                               */
/* ------------------------------------------------------------------ */

async function sendJson<T>(method: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  return data as T;
}

export interface SubmitVerificationInput {
  url?: string;
  title?: string;
  note?: string;
  scholarshipId?: number;
}

export const submitVerificationRequest = (input: SubmitVerificationInput) =>
  sendJson<{ request: ApiVerificationRequest; autoCheck: ApiLinkCheck }>(
    "POST",
    "/verification-requests",
    input
  );

/** The student's own requests, with a count of answers they haven't opened. */
export const fetchMyVerificationRequests = () =>
  get<{ requests: ApiVerificationRequest[]; unread: number }>("/verification-requests");

export const fetchVerificationRequest = (id: number) =>
  get<ApiVerificationRequest>(`/verification-requests/${id}`);

/** Admin only. */
export const fetchVerificationQueue = (status?: RequestStatus) =>
  get<ApiVerificationRequest[]>(
    `/verification-requests/all${status ? `?status=${status}` : ""}`
  );

/** Admin only. */
export const reviewVerificationRequest = (
  id: number,
  input: { status: RequestStatus; verdict?: Verdict | null; response?: string }
) => sendJson<ApiVerificationRequest>("PATCH", `/verification-requests/${id}`, input);

/** Admin only. Records that you checked the listing against its source (MVP #8). */
export const markScholarshipChecked = (id: number) =>
  sendJson<{ scholarship: ApiScholarship; infoCheck: ApiInfoCheck }>(
    "POST",
    `/scholarships/${id}/verify`,
    {}
  );

/* ------------------------------------------------------------------ */
/* Marketing Campaigns & Ads — Admins + Public                         */
/* ------------------------------------------------------------------ */

export interface ApiCampaign {
  id: number;
  title: string;
  tagline: string | null;
  trigger_param: string | null;
  type: "image" | "video";
  media_url: string;
  link_url: string;
  cta_text: string;
  countdown_seconds: number;
  is_active: boolean;
  priority: number;
  clicks: number;
  impressions: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignInput {
  title: string;
  tagline?: string | null;
  trigger_param?: string | null;
  type: "image" | "video";
  media_url: string;
  link_url: string;
  cta_text?: string;
  countdown_seconds?: number;
  is_active?: boolean;
  priority?: number;
}

export const fetchPublicCampaigns = () => get<ApiCampaign[]>("/campaigns");
export const fetchAdminCampaigns = () => get<ApiCampaign[]>("/campaigns/admin");
export const createCampaign = (input: CampaignInput) => sendJson<ApiCampaign>("POST", "/campaigns", input);
export const updateCampaign = (id: number, input: Partial<CampaignInput>) => sendJson<ApiCampaign>("PATCH", `/campaigns/${id}`, input);
export const deleteCampaign = (id: number) => sendJson<{ message: string }>("DELETE", `/campaigns/${id}`, {});
export const trackCampaign = (id: number, metric: "click" | "impression") => sendJson<void>("POST", `/campaigns/${id}/track`, { metric });
export const resolveShortenedUrl = (url: string) => sendJson<{ resolvedUrl: string }>("POST", "/campaigns/resolve-url", { url });

export interface UploadMediaResponse {
  url: string;
  filename: string;
  type: "image" | "video";
}

export async function uploadCampaignMedia(file: File): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/campaigns/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    let errorMsg = "Failed to upload file";
    if (res.status === 413) {
      errorMsg = "File exceeds the 150MB limit. Please upload a file smaller than 150MB or use a YouTube / TikTok video link.";
    } else {
      try {
        const err = await res.json();
        if (err.error) errorMsg = err.error;
      } catch {
        // ignore
      }
    }
    throw new Error(errorMsg);
  }

  return await res.json();
}



