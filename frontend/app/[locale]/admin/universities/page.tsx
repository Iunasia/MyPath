"use client";

import { useState } from "react";
import {
  BarChart3,
  Building2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  History,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  archiveUniversity,
  createUniversity,
  exportUniversitiesCsv,
  fetchMajors,
  fetchScholarships,
  fetchUniversities,
  fetchUniversityHistory,
  restoreUniversity,
  updateUniversity,
  type ApiUniversity,
  type UniversityInput,
} from "@/app/lib/api";
import { linkUniversities, toUniversityViews } from "@/app/lib/catalogAdapters";
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  Callout,
  ConfirmDialog,
  EditorForm,
  EditorShell,
  ErrorBox,
  Field,
  FormSection,
  HistoryList,
  hostOf,
  ImagePreview,
  inputClass,
  Loading,
  PageHeader,
  Segments,
  tableClass,
  Tag,
  tdClass,
  textareaClass,
  thClass,
  Toast,
  TokenSelect,
  Toolbar,
  useAdminLoad,
  validateUrl,
} from "../ui";
import { useContentEditor, type ContentResource } from "../useContentEditor";

const resource: ContentResource<ApiUniversity, UniversityInput> = {
  fetchAll: ({ includeArchived }) => fetchUniversities({ includeArchived }),
  create: (input) => createUniversity(input).then((r) => r.university),
  update: (id, input) => updateUniversity(id, input).then((r) => r.university),
  archive: (id, reason) => archiveUniversity(id, reason).then((r) => r.university),
  restore: (id) => restoreUniversity(id).then((r) => r.university),
  history: fetchUniversityHistory,
  exportCsv: exportUniversitiesCsv,
};

const loadExternal = () => Promise.all([fetchScholarships(), fetchMajors()]);

const emptyForm = (): UniversityInput => ({
  slug: "",
  name: "",
  short_name: "",
  country: "Cambodia",
  city: "Phnom Penh",
  type: "",
  ranking: null,
  description: "",
  website: "",
  phone: "",
  established: "",
  student_count: "",
  image_url: "",
  tuition_range: "",
  acceptance_rate: "",
  programs: [],
  scholarships: [],
});

const formFrom = (u: ApiUniversity): UniversityInput => ({
  slug: u.slug ?? "",
  name: u.name,
  short_name: u.short_name ?? "",
  country: u.country,
  city: u.city,
  type: u.type ?? "",
  ranking: u.ranking ?? null,
  description: u.description,
  website: u.website,
  phone: u.phone ?? "",
  established: u.established ?? "",
  student_count: u.student_count ?? "",
  image_url: u.image_url ?? "",
  tuition_range: u.tuition_range ?? "",
  acceptance_rate: u.acceptance_rate ?? "",
  programs: u.programs ?? [],
  scholarships: u.scholarships ?? [],
});

const UNIVERSITY_FIELDS: (keyof UniversityInput)[] = [
  "name", "slug", "short_name", "type", "country", "city",
  "description", "website", "phone", "image_url", "established",
  "student_count", "ranking", "tuition_range", "acceptance_rate",
  "programs", "scholarships",
];

function validateUniversity(v: UniversityInput): Partial<Record<keyof UniversityInput, string>> {
  const e: Partial<Record<keyof UniversityInput, string>> = {};
  if (!v.name?.trim()) e.name = "Add a name";
  if (!v.description?.trim()) e.description = "Add a short description";
  if (!v.website?.trim()) e.website = "Add the website";
  else {
    const urlErr = validateUrl(v.website, "website");
    if (urlErr) e.website = urlErr;
  }
  return e;
}

function UniversityEditor({
  initial,
  isCreate,
  busy,
  error,
  scholarshipOptions,
  onSubmit,
  onCancel,
  onDirtyChange,
}: {
  initial: UniversityInput;
  isCreate: boolean;
  busy: boolean;
  error: string;
  scholarshipOptions: string[];
  onSubmit: (input: UniversityInput, opts?: { keepCreating?: boolean }) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  return (
    <EditorForm<UniversityInput>
      key={isCreate ? "create" : initial.name}
      initial={initial}
      fields={UNIVERSITY_FIELDS}
      create={isCreate}
      validate={validateUniversity}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDirtyChange={onDirtyChange}
      busy={busy}
      error={error}
      submitLabel={isCreate ? "Add university" : "Save changes"}
      submitAnotherLabel="Save and add another"
    >
      {({ value, set, errors }) => (
        <>
          <FormSection
            title="Institution Identity"
            id="u-basics"
            icon={<Building2 className="w-4 h-4" />}
            empty={[!value.type?.trim(), !value.short_name?.trim()].filter(Boolean).length}
          >
            <Field label="University Name" htmlFor="u-name" error={errors.name} required>
              <input
                id="u-name"
                className={inputClass}
                value={value.name ?? ""}
                onChange={(e) => set({ name: e.target.value })}
                required
                maxLength={250}
                placeholder="e.g. Cambodia Academy of Digital Technology"
                autoFocus
              />
            </Field>
            <Field label="Public URL Slug" htmlFor="u-slug" hint="Segment for /universities/:slug (auto-derived if empty)">
              <input
                id="u-slug"
                className={inputClass}
                value={value.slug ?? ""}
                onChange={(e) => set({ slug: e.target.value })}
                placeholder="e.g. cadt"
              />
            </Field>
            <Field label="Short Name / Acronym" htmlFor="u-short">
              <input
                id="u-short"
                className={inputClass}
                value={value.short_name ?? ""}
                onChange={(e) => set({ short_name: e.target.value })}
                placeholder="e.g. CADT"
              />
            </Field>
            <Field label="Institution Type" htmlFor="u-type" hint="Public, Private, or International">
              <input
                id="u-type"
                className={inputClass}
                value={value.type ?? ""}
                onChange={(e) => set({ type: e.target.value })}
                placeholder="e.g. Public, Private, Semi-Public"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Location & Contact"
            id="u-location"
            icon={<MapPin className="w-4 h-4" />}
            empty={0}
          >
            <Field label="Country" htmlFor="u-country">
              <input
                id="u-country"
                className={inputClass}
                value={value.country ?? ""}
                onChange={(e) => set({ country: e.target.value })}
                placeholder="e.g. Cambodia"
              />
            </Field>
            <Field label="City / Province" htmlFor="u-city">
              <input
                id="u-city"
                className={inputClass}
                value={value.city ?? ""}
                onChange={(e) => set({ city: e.target.value })}
                placeholder="e.g. Phnom Penh"
              />
            </Field>
            <Field label="Official Website" htmlFor="u-website" error={errors.website} required>
              <input
                id="u-website"
                className={inputClass}
                value={value.website ?? ""}
                onChange={(e) => set({ website: e.target.value })}
                placeholder="https://www.cadt.edu.kh"
                required
              />
            </Field>
            <Field label="Phone / Hotline" htmlFor="u-phone">
              <input
                id="u-phone"
                className={inputClass}
                value={value.phone ?? ""}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="e.g. +855 23 999 999"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Overview & Campus Media"
            id="u-story"
            icon={<FileText className="w-4 h-4" />}
            empty={!value.description?.trim() ? 1 : 0}
          >
            <Field label="University Description" htmlFor="u-description" className="sm:col-span-2" error={errors.description} required>
              <textarea
                id="u-description"
                className={textareaClass}
                rows={3}
                value={value.description ?? ""}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Comprehensive overview of the institution, campus culture, and academic focus…"
                required
              />
            </Field>
            <div className="sm:col-span-2 flex items-end gap-3">
              <Field label="Campus Cover Image URL" htmlFor="u-image" className="flex-1 min-w-0" hint="Direct photo link (jpg, png, webp)">
                <input
                  id="u-image"
                  className={inputClass}
                  value={value.image_url ?? ""}
                  onChange={(e) => set({ image_url: e.target.value })}
                  placeholder="https://example.com/campus.jpg"
                />
              </Field>
              <ImagePreview url={value.image_url ?? ""} className="shrink-0 mb-0.5" />
            </div>
          </FormSection>

          <FormSection
            title="Institutional Facts"
            id="u-facts"
            icon={<BarChart3 className="w-4 h-4" />}
            empty={[!value.tuition_range?.trim(), !value.ranking, !value.acceptance_rate?.trim(), !value.student_count?.trim(), !value.established?.trim()].filter(Boolean).length}
          >
            <Field label="Established Year" htmlFor="u-established">
              <input
                id="u-established"
                className={inputClass}
                value={value.established ?? ""}
                onChange={(e) => set({ established: e.target.value })}
                placeholder="e.g. 2014"
              />
            </Field>
            <Field label="Student Population" htmlFor="u-students">
              <input
                id="u-students"
                className={inputClass}
                value={value.student_count ?? ""}
                onChange={(e) => set({ student_count: e.target.value })}
                placeholder="e.g. 3,500+"
              />
            </Field>
            <Field label="National Ranking" htmlFor="u-ranking">
              <input
                id="u-ranking"
                type="number"
                className={inputClass}
                value={value.ranking ?? ""}
                onChange={(e) => set({ ranking: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="e.g. 1"
              />
            </Field>
            <Field label="Tuition Fee Range" htmlFor="u-tuition">
              <input
                id="u-tuition"
                className={inputClass}
                value={value.tuition_range ?? ""}
                onChange={(e) => set({ tuition_range: e.target.value })}
                placeholder="e.g. $1,200 - $2,500 / year"
              />
            </Field>
            <Field label="Acceptance Rate" htmlFor="u-acceptance">
              <input
                id="u-acceptance"
                className={inputClass}
                value={value.acceptance_rate ?? ""}
                onChange={(e) => set({ acceptance_rate: e.target.value })}
                placeholder="e.g. 65%"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Programmes & Scholarships"
            id="u-links"
            icon={<GraduationCap className="w-4 h-4" />}
            empty={[value.programs?.length === 0, value.scholarships?.length === 0].filter(Boolean).length}
          >
            <Field label="Academic Programmes" hint="Type programme name and press Enter." className="sm:col-span-2">
              <TokenSelect
                allowCustom
                inputId="u-programs"
                placeholder="Type program name (e.g. Software Engineering) and press Enter…"
                value={value.programs ?? []}
                onChange={(v) => set({ programs: v })}
              />
            </Field>
            <Field label="Linked Scholarships" hint="Select matching opportunities from catalogue." className="sm:col-span-2">
              <TokenSelect
                inputId="u-scholarships"
                placeholder="Search scholarships in catalogue…"
                value={value.scholarships ?? []}
                onChange={(v) => set({ scholarships: v })}
                options={scholarshipOptions}
              />
            </Field>
          </FormSection>
        </>
      )}
    </EditorForm>
  );
}

export default function AdminUniversitiesPage() {
  const editor = useContentEditor({ resource });
  const { data: external } = useAdminLoad(loadExternal);

  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");
  const [formDirty, setFormDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  if (editor.loading) return <Loading />;
  if (editor.error) return <ErrorBox message={editor.error} onRetry={editor.reload} />;

  const [scholarships = [], majors = []] = external ?? [];
  const scholarshipOptions = scholarships.map((s) => s.title);

  const views = toUniversityViews(editor.rows);
  const inMajors = new Map<string, number>();
  const unknown = new Map<string, number>();
  for (const major of majors) {
    const { links, unmatched } = linkUniversities(major.universities, views);
    for (const id of new Set(links.map((l) => l.id))) inMajors.set(id, (inMajors.get(id) ?? 0) + 1);
    for (const name of unmatched) unknown.set(name, (unknown.get(name) ?? 0) + 1);
  }
  const unknowns = [...unknown.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const types = ["All", ...new Set(editor.rows.map((u) => u.type).filter((t): t is string => Boolean(t)))];
  const q = query.trim().toLowerCase();
  const visible = editor.rows.filter(
    (u) =>
      (type === "All" || u.type === type) &&
      (!q || u.name.toLowerCase().includes(q) || (u.short_name ?? "").toLowerCase().includes(q))
  );

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

  return (
    <>
      <PageHeader title="Universities" aside="Edit in place — changes are kept; re-seeding only fills gaps" />

      <Toolbar>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or short name"
          className={`${inputClass} w-64`}
          aria-label="Search universities"
        />
        <Segments
          value={type}
          onChange={setType}
          options={types.map((t) => ({
            value: t,
            label: t,
            count: t === "All" ? editor.rows.length : editor.rows.filter((u) => u.type === t).length,
          }))}
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
          <button type="button" onClick={() => editor.doExport("universities.csv")} className={btnSecondary}>
            Export CSV
          </button>
          <button type="button" onClick={handleCreate} className={btnPrimary}>
            Add university
          </button>
        </div>
      </Toolbar>

      {unknowns.length > 0 && (
        <div className="mb-4">
          <Callout title={`Majors name ${unknowns.length} universities that aren't in the catalogue`}>
            Students see these names on major pages but get no page to open. Add the university here, or fix the
            name in the major.
            <p className="mt-1.5 text-blue-ink">
              {unknowns.map(([name, count], i) => (
                <span key={name}>
                  {i > 0 && " · "}
                  {name} <span className="text-gray-soft">×{count}</span>
                </span>
              ))}
            </p>
          </Callout>
        </div>
      )}

      {editor.mode === "create" || (editor.mode === "edit" && editor.selected) ? (
        <EditorShell
          backLabel="universities"
          onBack={handleBack}
          title={
            editor.mode === "create"
              ? "New university"
              : editor.selected?.name ?? `#${editor.selected?.id}`
          }
          id={editor.mode === "edit" ? editor.selected?.id : undefined}
          tag={
            editor.mode === "edit" && editor.selected ? (
              editor.selected.archived_at ? <Tag tone="neutral">Archived</Tag> : <Tag tone="green">Live</Tag>
            ) : undefined
          }
        >
          <UniversityEditor
            key={editor.mode === "create" ? `create-${createKey}` : editor.selected!.id}
            initial={editor.mode === "create" ? emptyForm() : formFrom(editor.selected!)}
            isCreate={editor.mode === "create"}
            busy={editor.busy}
            error={editor.formError}
            scholarshipOptions={scholarshipOptions}
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
                  <th className={thClass}>University</th>
                  <th className={`${thClass} w-28`}>Type</th>
                  <th className={`${thClass} w-16`}>Est.</th>
                  <th className={`${thClass} w-56`}>Tuition</th>
                  <th className={`${thClass} w-24`}>In majors</th>
                  <th className={`${thClass} w-40`}>Website</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => {
                  const view = views.find((v) => v.apiId === u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => editor.open(u)}
                      className={`cursor-pointer ${editor.selected?.id === u.id ? "bg-sky/10" : "hover:bg-powder/60"}`}
                    >
                      <td className={`${tdClass} max-w-0`}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              editor.open(u);
                            }}
                            className="block max-w-full truncate text-left font-bold text-blue-ink hover:text-sky-deep cursor-pointer"
                          >
                            {u.name}
                          </button>
                          {u.archived_at && <Tag tone="neutral">Archived</Tag>}
                        </div>
                        <p className="text-xs text-gray-soft truncate">{[u.short_name, u.city].filter(Boolean).join(" · ")}</p>
                      </td>
                      <td className={tdClass}>{u.type ?? <span className="text-amber-700">Not stated</span>}</td>
                      <td className={`${tdClass} tabular-nums text-xs`}>{u.established ?? "—"}</td>
                      <td className={`${tdClass} text-xs`}>
                        {u.tuition_range ?? <span className="font-bold text-amber-700">Not stated</span>}
                      </td>
                      <td className={`${tdClass} tabular-nums text-xs`}>{inMajors.get(view?.id ?? "") ?? 0}</td>
                      <td className={`${tdClass} tabular-nums text-xs max-w-0 truncate`}>{hostOf(u.website)}</td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-soft">
                      Nothing matches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {editor.selected ? (
            <aside className="rounded-2xl border border-sky/15 bg-white xl:sticky xl:top-20" aria-label="University detail">
              <header className="border-b border-sky/15 px-4 pt-4 pb-3">
                <p className="tabular-nums text-xs text-gray-soft">#{editor.selected.id}</p>
                <h2 className="mt-0.5 text-base font-extrabold leading-snug">{editor.selected.name}</h2>
                <p className="mt-0.5 text-xs text-gray-soft">
                  {[editor.selected.short_name, editor.selected.city].filter(Boolean).join(" · ")}
                </p>
              </header>
              <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-sky/15 px-4 py-3 text-sm">
                <dt className="text-gray-soft">Status</dt>
                <dd>{editor.selected.archived_at ? <Tag tone="neutral">Archived</Tag> : <Tag tone="green">Live</Tag>}</dd>
                <dt className="text-gray-soft">Slug</dt>
                <dd className="min-w-0 break-all text-xs">{editor.selected.slug ?? <span className="text-gray-soft">none</span>}</dd>
                <dt className="text-gray-soft">Website</dt>
                <dd className="min-w-0 break-all text-xs">{hostOf(editor.selected.website) || "none"}</dd>
                <dt className="text-gray-soft">Tuition</dt>
                <dd>{editor.selected.tuition_range ?? <span className="text-gray-soft">Not stated</span>}</dd>
              </dl>

              <div className="flex flex-wrap gap-2 px-4 py-3">
                <button type="button" onClick={editor.startEdit} className={btnPrimary}>
                  Edit
                </button>
                {editor.selected.archived_at ? (
                  <button type="button" onClick={() => editor.doRestore(editor.selected!)} disabled={editor.busy} className={btnSecondary}>
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
                    Archive
                  </button>
                )}
                <a href={`/universities/${editor.selected.slug ?? editor.selected.id}`} className={btnGhost}>
                  Public page
                </a>
              </div>

              <details className="border-t border-sky/15" open>
                <summary className="cursor-pointer px-4 py-2.5 text-xs font-bold text-blue-ink">History</summary>
                <HistoryList entries={editor.history} />
              </details>
            </aside>
          ) : (
            <aside className="rounded-2xl border border-dashed border-sky/25 bg-white/60 p-6 text-sm text-gray-soft">
              Select a university to edit it, or add a new one.
            </aside>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(editor.confirmArchive)}
        title="Archive this university?"
        description="It disappears from the public site but is kept — saved items and history stay, and you can restore it. Majors that name it may show as having no page."
        confirmLabel="Archive"
        busy={editor.busy}
        onConfirm={editor.doArchive}
        onCancel={() => editor.setConfirmArchive(null)}
      >
        <Field label="Reason (optional)" htmlFor="university-archive-reason">
          <input
            id="university-archive-reason"
            className={inputClass}
            value={editor.archiveReason}
            onChange={(e) => editor.setArchiveReason(e.target.value)}
            placeholder="e.g. closed"
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
