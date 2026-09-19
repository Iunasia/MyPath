"use client";

import { Suspense, useMemo, useState } from "react";
import { Link } from "@/src/i18n";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  Calendar,
  Coins,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  History,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  archiveScholarship,
  createScholarship,
  exportScholarshipsCsv,
  fetchScholarships,
  fetchScholarshipHistory,
  markScholarshipChecked,
  restoreScholarship,
  updateScholarship,
  type ApiScholarship,
  type ScholarshipInput,
} from "@/app/lib/api";
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  ConfirmDialog,
  daysFromToday,
  EditorForm,
  EditorShell,
  ErrorBox,
  Field,
  FormSection,
  formatDate,
  HistoryList,
  hostOf,
  ImagePreview,
  inputClass,
  Loading,
  PageHeader,
  relativeDays,
  Segments,
  selectClass,
  tableClass,
  Tag,
  tdClass,
  textareaClass,
  thClass,
  Toast,
  TokenSelect,
  Toolbar,
  validateUrl,
  VerificationMark,
} from "../ui";
import { useContentEditor, type ContentResource } from "../useContentEditor";

type Filter = "all" | "passed" | "soon" | "undated" | "flagged" | "unchecked";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "passed", label: "Deadline passed" },
  { value: "soon", label: "Closing ≤ 14 days" },
  { value: "undated", label: "No deadline" },
  { value: "flagged", label: "Flagged" },
  { value: "unchecked", label: "Never checked" },
];

const isFilter = (value: string | null): value is Filter => FILTERS.some((f) => f.value === value);

const matches = (s: ApiScholarship, filter: Filter) => {
  const days = s.deadline ? daysFromToday(s.deadline) : null;
  switch (filter) {
    case "passed":
      return days !== null && days < 0;
    case "soon":
      return days !== null && days >= 0 && days <= 14;
    case "undated":
      return days === null;
    case "flagged":
      return Boolean(s.infoCheck?.isRisky);
    case "unchecked":
      return !s.last_verified;
    default:
      return true;
  }
};

const SOURCE_LABEL: Record<string, string> = {
  official: "official",
  organisation: "organisation",
  news: "news",
  social_media: "social media",
  unknown: "unknown",
};

const PROVIDER_TYPES = ["unknown", "government", "university", "foundation", "company", "organisation"];
const OPPORTUNITY_TYPES = ["scholarship", "exchange", "internship"];

const pad = (value: number) => String(value).padStart(2, "0");

/** ISO instant -> the value a <input type="datetime-local"> expects, in the viewer's zone. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

function emptyForm(prefill: Partial<ScholarshipInput> = {}): ScholarshipInput {
  return {
    title: "",
    provider: "",
    provider_type: "unknown",
    description: "",
    amount: "",
    coverage: "",
    eligibility: "",
    degree_level: "",
    field_of_study: "",
    documents: [],
    application_process: "",
    deadline: null,
    deadline_note: "",
    application_link: "",
    image_url: "",
    country: "Cambodia",
    opportunity_type: "scholarship",
    ...prefill,
  };
}

const formFrom = (s: ApiScholarship): ScholarshipInput => ({
  title: s.title,
  provider: s.provider,
  provider_type: s.provider_type ?? "unknown",
  description: s.description,
  amount: s.amount ?? "",
  coverage: s.coverage ?? "",
  eligibility: s.eligibility ?? "",
  degree_level: s.degree_level ?? "",
  field_of_study: s.field_of_study ?? "",
  documents: s.documents ?? [],
  application_process: s.application_process ?? "",
  deadline: s.deadline,
  deadline_note: s.deadline_note ?? "",
  application_link: s.application_link,
  image_url: s.image_url ?? "",
  country: s.country,
  opportunity_type: s.opportunity_type,
});

const resource: ContentResource<ApiScholarship, ScholarshipInput> = {
  fetchAll: ({ includeArchived }) => fetchScholarships({ includeArchived }),
  create: (input) => createScholarship(input).then((r) => r.scholarship),
  update: (id, input) => updateScholarship(id, input).then((r) => r.scholarship),
  archive: (id, reason) => archiveScholarship(id, reason).then((r) => r.scholarship),
  restore: (id) => restoreScholarship(id).then((r) => r.scholarship),
  history: fetchScholarshipHistory,
  exportCsv: exportScholarshipsCsv,
  verify: (id) => markScholarshipChecked(id).then((r) => ({ ...r.scholarship, infoCheck: r.infoCheck })),
};

/* ── The editor ────────────────────────────────────────── */

const SCHOLARSHIP_FIELDS: (keyof ScholarshipInput)[] = [
  "title", "provider", "provider_type", "amount", "country", "opportunity_type",
  "description", "coverage", "eligibility", "application_process",
  "deadline", "deadline_note", "application_link", "documents", "image_url",
  "degree_level", "field_of_study",
];

function validateScholarship(v: ScholarshipInput): Partial<Record<keyof ScholarshipInput, string>> {
  const e: Partial<Record<keyof ScholarshipInput, string>> = {};
  if (!v.title?.trim()) e.title = "Add a title";
  if (!v.provider?.trim()) e.provider = "Add a provider";
  if (!v.description?.trim()) e.description = "Add a description";
  if (!v.application_link?.trim()) e.application_link = "Add the application link";
  else {
    const urlErr = validateUrl(v.application_link, "application link");
    if (urlErr) e.application_link = urlErr;
  }
  return e;
}

function ScholarshipEditor({
  initial,
  isCreate,
  busy,
  error,
  onSubmit,
  onCancel,
  onDirtyChange,
}: {
  initial: ScholarshipInput;
  isCreate: boolean;
  busy: boolean;
  error: string;
  onSubmit: (input: ScholarshipInput, opts?: { keepCreating?: boolean }) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  return (
    <EditorForm<ScholarshipInput>
      key={isCreate ? "create" : initial.title}
      initial={initial}
      fields={SCHOLARSHIP_FIELDS}
      create={isCreate}
      validate={validateScholarship}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDirtyChange={onDirtyChange}
      busy={busy}
      error={error}
      submitLabel={isCreate ? "Add listing" : "Save changes"}
      submitAnotherLabel="Save and add another"
    >
      {({ value, set, errors }) => (
        <>
          <FormSection
            title="Core Information"
            id="s-basics"
            icon={<Coins className="w-4 h-4" />}
            empty={[!value.title?.trim(), !value.provider?.trim(), !value.amount?.trim()].filter(Boolean).length}
          >
            <Field label="Scholarship Title" htmlFor="f-title" className="sm:col-span-2" error={errors.title} required>
              <input
                id="f-title"
                className={inputClass}
                value={value.title ?? ""}
                onChange={(e) => set({ title: e.target.value })}
                required
                maxLength={300}
                placeholder="e.g. Techo Digital Talent Scholarship 2026"
                autoFocus
              />
            </Field>
            <Field label="Provider / Organization" htmlFor="f-provider" error={errors.provider} required>
              <input
                id="f-provider"
                className={inputClass}
                value={value.provider ?? ""}
                onChange={(e) => set({ provider: e.target.value })}
                placeholder="e.g. Ministry of Post and Telecommunications (MPTC)"
                required
              />
            </Field>
            <Field label="Provider Type" htmlFor="f-provider-type">
              <select
                id="f-provider-type"
                className={selectClass}
                value={value.provider_type ?? "unknown"}
                onChange={(e) => set({ provider_type: e.target.value })}
              >
                {PROVIDER_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Field>
            <Field label="Coverage Amount / Value" htmlFor="f-amount" hint="e.g. 100% Full Tuition, $5,000">
              <input
                id="f-amount"
                className={inputClass}
                value={value.amount ?? ""}
                onChange={(e) => set({ amount: e.target.value })}
                placeholder="e.g. 100% Full Tuition"
              />
            </Field>
            <Field label="Country" htmlFor="f-country">
              <input
                id="f-country"
                className={inputClass}
                value={value.country ?? ""}
                onChange={(e) => set({ country: e.target.value })}
                placeholder="e.g. Cambodia"
              />
            </Field>
            <Field label="Opportunity Type" htmlFor="f-opp-type">
              <select
                id="f-opp-type"
                className={selectClass}
                value={value.opportunity_type ?? "scholarship"}
                onChange={(e) => set({ opportunity_type: e.target.value })}
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Field>
          </FormSection>

          <FormSection
            title="Description & Eligibility"
            id="s-story"
            icon={<FileText className="w-4 h-4" />}
            empty={!value.description?.trim() ? 1 : 0}
          >
            <Field label="Description" htmlFor="f-description" className="sm:col-span-2" error={errors.description} required>
              <textarea
                id="f-description"
                className={textareaClass}
                rows={3}
                value={value.description ?? ""}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Brief summary of the scholarship opportunity and purpose…"
                required
              />
            </Field>
            <Field label="Coverage Details" htmlFor="f-coverage" className="sm:col-span-2" hint="What is included (tuition, living allowance, stipend, laptop, etc.)">
              <textarea
                id="f-coverage"
                className={textareaClass}
                rows={2}
                value={value.coverage ?? ""}
                onChange={(e) => set({ coverage: e.target.value })}
                placeholder="e.g. Full 4-year tuition, monthly stipend of $120, student accommodation"
              />
            </Field>
            <Field label="Eligibility Criteria" htmlFor="f-eligibility" className="sm:col-span-2" hint="Semicolon or newline separated requirements">
              <textarea
                id="f-eligibility"
                className={textareaClass}
                rows={2}
                value={value.eligibility ?? ""}
                onChange={(e) => set({ eligibility: e.target.value })}
                placeholder="e.g. Cambodian citizen; Grade A, B, or C in Bac II; under 22 years old"
              />
            </Field>
            <Field label="Application Process" htmlFor="f-process" className="sm:col-span-2" hint="Step-by-step submission steps">
              <textarea
                id="f-process"
                className={textareaClass}
                rows={2}
                value={value.application_process ?? ""}
                onChange={(e) => set({ application_process: e.target.value })}
                placeholder="e.g. Submit online application; pass aptitude test; attend interview"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Deadlines & Timeline"
            id="s-dates"
            icon={<Calendar className="w-4 h-4" />}
            empty={[!value.deadline, !value.deadline_note?.trim()].filter(Boolean).length}
          >
            <Field label="Application Deadline" htmlFor="f-deadline" hint="Phnom Penh time. Leave blank for rolling/continuous.">
              <input
                id="f-deadline"
                type="datetime-local"
                className={inputClass}
                value={toLocalInput(value.deadline ?? null)}
                onChange={(e) => set({ deadline: fromLocalInput(e.target.value) })}
              />
            </Field>
            <Field label="Deadline Note" htmlFor="f-note" hint="Prose note for rolling or tentative dates">
              <input
                id="f-note"
                className={inputClass}
                value={value.deadline_note ?? ""}
                onChange={(e) => set({ deadline_note: e.target.value })}
                maxLength={300}
                placeholder="e.g. Early round closes 15 May; final intake in August"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Application Links & Media"
            id="s-application"
            icon={<Link2 className="w-4 h-4" />}
            empty={[!value.application_link?.trim()].filter(Boolean).length}
          >
            <Field label="Official Application Link" htmlFor="f-link" className="sm:col-span-2" error={errors.application_link} required>
              <input
                id="f-link"
                className={inputClass}
                value={value.application_link ?? ""}
                onChange={(e) => set({ application_link: e.target.value })}
                placeholder="https://example.gov.kh/apply"
                required
              />
            </Field>
            <Field label="Required Documents" hint="Type document name and press Enter to add as a tag." className="sm:col-span-2">
              <TokenSelect
                allowCustom
                inputId="f-documents"
                value={value.documents ?? []}
                onChange={(docs: string[]) => set({ documents: docs })}
                placeholder="e.g. High school certificate, National ID card, Academic Transcript..."
              />
            </Field>
            <div className="sm:col-span-2 flex items-end gap-3">
              <Field label="Cover Image URL" htmlFor="f-image" className="flex-1 min-w-0" hint="Direct link to cover image (JPG, PNG, WebP)">
                <input
                  id="f-image"
                  className={inputClass}
                  value={value.image_url ?? ""}
                  onChange={(e) => set({ image_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </Field>
              <ImagePreview url={value.image_url ?? ""} className="shrink-0 mb-0.5" />
            </div>
          </FormSection>

          <FormSection
            title="Academic Scope"
            id="s-study"
            icon={<GraduationCap className="w-4 h-4" />}
            empty={0}
          >
            <Field label="Degree Level" htmlFor="f-degree">
              <input
                id="f-degree"
                className={inputClass}
                value={value.degree_level ?? ""}
                onChange={(e) => set({ degree_level: e.target.value })}
                placeholder="e.g. Bachelor, Master, TVET"
              />
            </Field>
            <Field label="Field of Study / Majors" htmlFor="f-field" hint="Target academic disciplines">
              <input
                id="f-field"
                className={inputClass}
                value={value.field_of_study ?? ""}
                onChange={(e) => set({ field_of_study: e.target.value })}
                placeholder="e.g. Computer Science, Engineering, Law"
              />
            </Field>
          </FormSection>
        </>
      )}
    </EditorForm>
  );
}

/* ── Page ──────────────────────────────────────────────── */

function ScholarshipsAdmin() {
  const params = useSearchParams();
  const requested = params.get("filter");
  const startCreating = params.get("create") === "1";

  const prefill = useMemo(
    () =>
      emptyForm({
        title: params.get("title") ?? "",
        application_link: params.get("url") ?? "",
        provider: params.get("provider") ?? "",
      }),
    [params]
  );

  const editor = useContentEditor<ApiScholarship, ScholarshipInput>({
    resource,
    initialMode: startCreating ? "create" : "view",
  });

  const [filter, setFilter] = useState<Filter>(isFilter(requested) ? requested : "all");
  const [query, setQuery] = useState("");
  const [formDirty, setFormDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return editor.rows.filter(
      (s) =>
        (editor.includeArchived || !s.archived_at) &&
        matches(s, filter) &&
        (!q || [s.title, s.provider, hostOf(s.source_url)].some((field) => field.toLowerCase().includes(q)))
    );
  }, [editor.rows, filter, query, editor.includeArchived]);

  const handleCreate = () => {
    if (formDirty) {
      setConfirmDiscard(true);
    } else {
      setCreateKey((k) => k + 1);
      editor.startCreate();
    }
  };

  const handleBack = () => {
    if (formDirty) {
      setConfirmDiscard(true);
    } else {
      editor.closeForm();
    }
  };

  if (editor.loading) return <Loading />;
  if (editor.error) return <ErrorBox message={editor.error} onRetry={editor.reload} />;

  return (
    <>
      <PageHeader
        title="Scholarships"
        aside="Fixes made here are kept — re-seeding only fills gaps unless run with --sync"
      />

      <Toolbar>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, provider or domain"
          className={`${inputClass} w-64`}
          aria-label="Search scholarships"
        />
        <Segments
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: editor.rows.filter((s) => matches(s, f.value)).length }))}
        />
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-body">
            <input
              type="checkbox"
              checked={editor.includeArchived}
              onChange={(e) => editor.setIncludeArchived(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-sky/40 accent-sky-deep"
            />
            Show archived
          </label>
          <button type="button" onClick={() => editor.doExport("scholarships.csv")} className={btnSecondary}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button type="button" onClick={handleCreate} className={btnPrimary}>
            <Plus className="w-3.5 h-3.5" />
            Add scholarship
          </button>
        </div>
      </Toolbar>

      {editor.mode === "create" || (editor.mode === "edit" && editor.selected) ? (
        <EditorShell
          backLabel="scholarships"
          onBack={handleBack}
          title={
            editor.mode === "create"
              ? "New scholarship"
              : editor.selected?.title ?? `#${editor.selected?.id}`
          }
          id={editor.mode === "edit" ? editor.selected?.id : undefined}
          tag={
            editor.mode === "edit" && editor.selected ? (
              editor.selected.archived_at ? (
                <Tag tone="neutral">Archived</Tag>
              ) : editor.selected.infoCheck?.isRisky ? (
                <Tag tone="red">Flagged</Tag>
              ) : (
                <Tag tone="green">Auto-checked</Tag>
              )
            ) : undefined
          }
        >
          <ScholarshipEditor
            key={editor.mode === "create" ? `create-${createKey}` : editor.selected!.id}
            initial={editor.mode === "create" ? prefill : formFrom(editor.selected!)}
            isCreate={editor.mode === "create"}
            busy={editor.busy}
            error={editor.formError}
            onSubmit={editor.save}
            onCancel={editor.closeForm}
            onDirtyChange={setFormDirty}
          />
        </EditorShell>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] items-start">
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={`${thClass} w-10`}>#</th>
                  <th className={thClass}>Scholarship</th>
                  <th className={`${thClass} w-28`}>Deadline</th>
                  <th className={`${thClass} w-28`}>Status</th>
                  <th className={`${thClass} w-24`}>Checked</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => {
                      editor.open(s);
                    }}
                    className={`cursor-pointer transition-colors ${editor.selected?.id === s.id ? "bg-sky/10 dark:bg-sky/15" : "hover:bg-powder/60 dark:hover:bg-white/5"}`}
                  >
                    <td className={`${tdClass} tabular-nums text-xs text-gray-soft`}>{s.id}</td>
                    <td className={`${tdClass} max-w-0`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          editor.open(s);
                        }}
                        aria-pressed={editor.selected?.id === s.id}
                        className="block max-w-full truncate text-left font-bold text-blue-ink hover:text-sky-deep cursor-pointer"
                      >
                        {s.title}
                      </button>
                      <p className="truncate text-xs text-gray-soft">{s.provider}</p>
                    </td>
                    <td className={tdClass}>
                      {s.deadline ? (
                        <>
                          <div className="tabular-nums text-xs">{formatDate(s.deadline)}</div>
                          <div
                            className={`text-xs ${
                              daysFromToday(s.deadline) < 0
                                ? "font-bold text-rose-700"
                                : daysFromToday(s.deadline) <= 14
                                  ? "font-bold text-amber-700"
                                  : "text-gray-soft"
                            }`}
                          >
                            {daysFromToday(s.deadline) < 0 ? "passed" : relativeDays(daysFromToday(s.deadline))}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-soft">{s.deadline_note || "Not announced"}</span>
                      )}
                    </td>
                    <td className={tdClass}>
                      {s.archived_at ? (
                        <Tag tone="neutral">Archived</Tag>
                      ) : s.infoCheck?.isRisky ? (
                        <Tag tone="red">Flagged</Tag>
                      ) : (
                        <Tag tone="green">Auto-checked</Tag>
                      )}
                    </td>
                    <td className={`${tdClass} text-xs`}>
                      {s.last_verified ? (
                        <span className="font-bold text-emerald-700">{formatDate(s.last_verified)}</span>
                      ) : (
                        <span className="text-gray-soft">Never</span>
                      )}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-soft">
                      Nothing matches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {editor.selected ? (
            <aside className="rounded-lg border border-sky/15 bg-white xl:sticky xl:top-20" aria-label="Scholarship detail">
              <header className="border-b border-sky/15 px-4 pt-4 pb-3">
                <p className="tabular-nums text-xs text-gray-soft">#{editor.selected.id}</p>
                <h2 className="mt-0.5 text-base font-extrabold leading-snug">{editor.selected.title}</h2>
                <p className="mt-0.5 text-xs text-gray-soft">{editor.selected.provider}</p>
              </header>

              <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-sky/15 px-4 py-3 text-sm">
                <dt className="text-gray-soft">Deadline</dt>
                <dd>
                  {editor.selected.deadline ? (
                    <>
                      {formatDate(editor.selected.deadline, true)}{" "}
                      {daysFromToday(editor.selected.deadline) < 0 && <span className="font-bold text-rose-700">· passed</span>}
                    </>
                  ) : (
                    <span className="text-gray-soft">{editor.selected.deadline_note || "Not announced"}</span>
                  )}
                </dd>
                <dt className="text-gray-soft">Status</dt>
                <dd>
                  {editor.selected.archived_at ? (
                    <Tag tone="neutral">Archived</Tag>
                  ) : editor.selected.infoCheck?.isRisky ? (
                    <Tag tone="red">Flagged</Tag>
                  ) : (
                    <Tag tone="green">Auto-checked</Tag>
                  )}
                </dd>
                <dt className="text-gray-soft">Source</dt>
                <dd className="min-w-0">
                  <span className="break-all text-xs tabular-nums">{hostOf(editor.selected.source_url) || "none"}</span>{" "}
                  <Tag>{SOURCE_LABEL[editor.selected.source_type] ?? editor.selected.source_type}</Tag>
                </dd>
                <dt className="text-gray-soft">Checked</dt>
                <dd>{editor.selected.last_verified ? <VerificationMark date={editor.selected.last_verified} /> : <VerificationMark pending />}</dd>
              </dl>

              {(editor.selected.infoCheck?.reasons?.length ?? 0) > 0 && (
                <ul className="mx-4 mt-3 space-y-1 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  {editor.selected.infoCheck?.reasons?.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2 px-4 py-3">
                <button type="button" onClick={editor.startEdit} className={btnPrimary}>
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {editor.selected.archived_at ? (
                  <button type="button" onClick={() => editor.doRestore(editor.selected!)} disabled={editor.busy} className={btnSecondary}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      editor.setArchiveReason("");
                      editor.setConfirmArchive(editor.selected);
                    }}
                    className={btnSecondary}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => editor.doVerify(editor.selected!.id)}
                  disabled={editor.busy || (editor.selected.last_verified ? daysFromToday(editor.selected.last_verified) === 0 : false)}
                  className={btnGhost}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Mark checked
                </button>
                {editor.selected.source_url && (
                  <a href={editor.selected.source_url} target="_blank" rel="noopener noreferrer nofollow" className={btnGhost}>
                    Source <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <Link href={`/scholarships/${editor.selected.id}`} className={btnGhost}>
                  Public page
                </Link>
              </div>

              <details className="border-t border-sky/15" open>
                <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-blue-ink">
                  <History className="w-3.5 h-3.5 text-gray-soft" />
                  History
                </summary>
                <HistoryList entries={editor.history} />
              </details>

              <p className="border-t border-sky/15 px-4 py-3 text-xs text-gray-soft">
                Open the provider&apos;s own page and confirm the deadline and award before marking it checked. Students
                see the date as &ldquo;Last verified&rdquo;.
              </p>
            </aside>
          ) : (
            <aside className="rounded-lg border border-dashed border-sky/25 bg-white/60 p-6 text-sm text-gray-soft">
              Select a listing to edit it, or add a new one.
            </aside>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(editor.confirmArchive)}
        title="Archive this scholarship?"
        description="Students stop seeing it and it drops out of the public catalogue. Nothing is deleted — saved items and history stay, and you can restore it."
        confirmLabel="Archive"
        busy={editor.busy}
        onConfirm={editor.doArchive}
        onCancel={() => editor.setConfirmArchive(null)}
      >
        <Field label="Reason (optional)" htmlFor="archive-reason">
          <input
            id="archive-reason"
            className={inputClass}
            value={editor.archiveReason}
            onChange={(e) => editor.setArchiveReason(e.target.value)}
            placeholder="e.g. programme discontinued"
          />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        description="You have unsaved edits. If you leave now they will be lost."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmDiscard(false);
          setFormDirty(false);
          editor.closeForm();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />

      {editor.notice && <Toast message={editor.notice} />}
    </>
  );
}

/** useSearchParams needs a Suspense boundary on a prerendered route. */
export default function AdminScholarshipsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ScholarshipsAdmin />
    </Suspense>
  );
}
