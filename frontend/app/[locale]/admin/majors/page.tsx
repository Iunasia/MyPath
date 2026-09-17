"use client";

import { useState } from "react";
import { Link } from "@/src/i18n";
import { BookOpen, FileText, GraduationCap } from "lucide-react";
import {
  archiveMajor,
  createMajor,
  exportMajorsCsv,
  fetchCareers,
  fetchMajorHistory,
  fetchMajors,
  fetchScholarships,
  fetchUniversities,
  restoreMajor,
  updateMajor,
  type ApiMajor,
  type MajorInput,
} from "@/app/lib/api";
import { linkUniversities, plainCategory, toUniversityViews } from "@/app/lib/catalogAdapters";
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
} from "../ui";
import { useContentEditor, type ContentResource } from "../useContentEditor";

const resource: ContentResource<ApiMajor, MajorInput> = {
  fetchAll: ({ includeArchived }) => fetchMajors({ includeArchived }),
  create: (input) => createMajor(input).then((r) => r.major),
  update: (id, input) => updateMajor(id, input).then((r) => r.major),
  archive: (id, reason) => archiveMajor(id, reason).then((r) => r.major),
  restore: (id) => restoreMajor(id).then((r) => r.major),
  history: fetchMajorHistory,
  exportCsv: exportMajorsCsv,
};

const loadOptions = () => Promise.all([fetchUniversities(), fetchCareers(), fetchScholarships()]);

const emptyForm = (): MajorInput => ({
  name: "",
  field: "Uncategorized",
  description: "",
  duration: "",
  degree_type: "",
  subjects: [],
  personality_fit: "",
  job_market_demand: "",
  related_careers: [],
  universities: [],
  related_scholarships: [],
});

const formFrom = (m: ApiMajor): MajorInput => ({
  name: m.name,
  field: m.field,
  description: m.description,
  duration: m.duration ?? "",
  degree_type: m.degree_type ?? "",
  subjects: m.subjects ?? [],
  personality_fit: m.personality_fit ?? "",
  job_market_demand: m.job_market_demand ?? "",
  related_careers: m.related_careers ?? [],
  universities: m.universities ?? [],
  related_scholarships: m.related_scholarships ?? [],
});

const MAJOR_FIELDS: (keyof MajorInput)[] = [
  "name", "field", "degree_type", "duration", "job_market_demand",
  "description", "personality_fit", "subjects",
  "universities", "related_careers", "related_scholarships",
];

function validateMajor(v: MajorInput): Partial<Record<keyof MajorInput, string>> {
  const e: Partial<Record<keyof MajorInput, string>> = {};
  if (!v.name?.trim()) e.name = "Add a name";
  if (!v.description?.trim()) e.description = "Add a description";
  return e;
}

function MajorEditor({
  initial,
  isCreate,
  busy,
  error,
  universityOptions,
  careerOptions,
  scholarshipOptions,
  onSubmit,
  onCancel,
  onDirtyChange,
}: {
  initial: MajorInput;
  isCreate: boolean;
  busy: boolean;
  error: string;
  universityOptions: string[];
  careerOptions: string[];
  scholarshipOptions: string[];
  onSubmit: (input: MajorInput, opts?: { keepCreating?: boolean }) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  return (
    <EditorForm<MajorInput>
      key={isCreate ? "create" : initial.name}
      initial={initial}
      fields={MAJOR_FIELDS}
      create={isCreate}
      validate={validateMajor}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDirtyChange={onDirtyChange}
      busy={busy}
      error={error}
      submitLabel={isCreate ? "Add major" : "Save changes"}
      submitAnotherLabel="Save and add another"
    >
      {({ value, set, errors }) => (
        <>
          <FormSection
            title="Major Overview"
            id="m-basics"
            icon={<BookOpen className="w-4 h-4" />}
            empty={[!value.field?.trim(), !value.degree_type?.trim(), !value.duration?.trim(), !value.job_market_demand?.trim()].filter(Boolean).length}
          >
            <Field label="Major Name" htmlFor="m-name" className="sm:col-span-2" error={errors.name} required>
              <input
                id="m-name"
                className={inputClass}
                value={value.name ?? ""}
                onChange={(e) => set({ name: e.target.value })}
                required
                maxLength={200}
                placeholder="e.g. Computer Science & Software Engineering"
                autoFocus
              />
            </Field>
            <Field label="Academic Field" htmlFor="m-field">
              <input
                id="m-field"
                className={inputClass}
                value={value.field ?? ""}
                onChange={(e) => set({ field: e.target.value })}
                placeholder="e.g. Information Technology"
              />
            </Field>
            <Field label="Degree Type" htmlFor="m-degree">
              <input
                id="m-degree"
                className={inputClass}
                value={value.degree_type ?? ""}
                onChange={(e) => set({ degree_type: e.target.value })}
                placeholder="e.g. Bachelor of Science"
              />
            </Field>
            <Field label="Programme Duration" htmlFor="m-duration">
              <input
                id="m-duration"
                className={inputClass}
                value={value.duration ?? ""}
                onChange={(e) => set({ duration: e.target.value })}
                placeholder="e.g. 4 years"
              />
            </Field>
            <Field label="Job Market Demand" htmlFor="m-demand" hint="High, Moderate, Growing">
              <input
                id="m-demand"
                className={inputClass}
                value={value.job_market_demand ?? ""}
                onChange={(e) => set({ job_market_demand: e.target.value })}
                placeholder="e.g. Very High / High Growth"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Curriculum & Student Fit"
            id="m-story"
            icon={<FileText className="w-4 h-4" />}
            empty={!value.description?.trim() ? 1 : 0}
          >
            <Field label="Description" htmlFor="m-description" className="sm:col-span-2" error={errors.description} required>
              <textarea
                id="m-description"
                className={textareaClass}
                rows={3}
                value={value.description ?? ""}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Overview of what students learn and master in this major…"
                required
              />
            </Field>
            <Field label="Personality & Trait Fit" htmlFor="m-personality" className="sm:col-span-2" hint="Ideal qualities (e.g. analytical thinking, problem solver)">
              <input
                id="m-personality"
                className={inputClass}
                value={value.personality_fit ?? ""}
                onChange={(e) => set({ personality_fit: e.target.value })}
                placeholder="e.g. Analytical thinker, curious problem solver, detail-oriented"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Connected Catalogues & Pathways"
            id="m-links"
            icon={<GraduationCap className="w-4 h-4" />}
            empty={[value.universities?.length === 0, value.related_careers?.length === 0].filter(Boolean).length}
          >
            <Field label="Key Subjects / Coursework" hint="Type and press Enter to add." className="sm:col-span-2">
              <TokenSelect
                allowCustom
                inputId="m-subjects"
                placeholder="Type course subject (e.g. Data Structures) and press Enter…"
                value={value.subjects ?? []}
                onChange={(v) => set({ subjects: v })}
              />
            </Field>
            <Field label="Offering Universities" hint="Pick institutions from catalogue." className="sm:col-span-2">
              <TokenSelect
                inputId="m-universities"
                placeholder="Search offering universities…"
                value={value.universities ?? []}
                onChange={(v) => set({ universities: v })}
                options={universityOptions}
              />
            </Field>
            <Field label="Related Career Pathways" hint="Pick careers from catalogue." className="sm:col-span-2">
              <TokenSelect
                inputId="m-careers"
                placeholder="Search related career options…"
                value={value.related_careers ?? []}
                onChange={(v) => set({ related_careers: v })}
                options={careerOptions}
              />
            </Field>
            <Field label="Related Scholarships" hint="Pick scholarships from catalogue." className="sm:col-span-2">
              <TokenSelect
                inputId="m-scholarships"
                placeholder="Search applicable scholarships…"
                value={value.related_scholarships ?? []}
                onChange={(v) => set({ related_scholarships: v })}
                options={scholarshipOptions}
              />
            </Field>
          </FormSection>
        </>
      )}
    </EditorForm>
  );
}

export default function AdminMajorsPage() {
  const editor = useContentEditor({ resource });
  const { data: options } = useAdminLoad(loadOptions);

  const [field, setField] = useState("All");
  const [query, setQuery] = useState("");
  const [formDirty, setFormDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  if (editor.loading) return <Loading />;
  if (editor.error) return <ErrorBox message={editor.error} onRetry={editor.reload} />;

  const [universities = [], careers = [], scholarships = []] = options ?? [];
  const universityOptions = universities.map((u) => u.name);
  const careerOptions = careers.map((c) => c.title);
  const scholarshipOptions = scholarships.map((s) => s.title);
  const views = toUniversityViews(universities);

  const rows = editor.rows.map((major) => ({
    major,
    field: plainCategory(major.field),
    noPage: linkUniversities(major.universities, views).unmatched.length,
  }));
  const fields = [...new Set(rows.map((r) => r.field))].sort();
  const noDemand = rows.filter((r) => !r.major.job_market_demand?.trim());
  const withUnknown = rows.filter((r) => r.noPage > 0);
  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (field === "All" || r.field === field) &&
      (!q || r.major.name.toLowerCase().includes(q) || r.major.related_careers.some((c) => c.toLowerCase().includes(q)))
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
      <PageHeader title="Majors" aside="Edit in place — changes are kept; re-seeding only fills gaps" />

      <Toolbar>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search majors or careers"
          className={`${inputClass} w-64`}
          aria-label="Search majors"
        />
        <Segments
          value={field}
          onChange={setField}
          options={["All", ...fields].map((f) => ({
            value: f,
            label: f,
            count: f === "All" ? rows.length : rows.filter((r) => r.field === f).length,
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
          <button type="button" onClick={() => editor.doExport("majors.csv")} className={btnSecondary}>
            Export CSV
          </button>
          <button type="button" onClick={handleCreate} className={btnPrimary}>
            Add major
          </button>
        </div>
      </Toolbar>

      <div className="grid gap-2 mb-4">
        {noDemand.length > 0 && (
          <Callout
            title={`${noDemand.map((r) => r.major.name).join(", ")} ${noDemand.length === 1 ? "has" : "have"} no job-market demand`}
          >
            45% of students surveyed said job-market demand would help them choose a major. Open a major to fill
            it in.
          </Callout>
        )}
        {withUnknown.length > 0 && (
          <Callout title={`${withUnknown.length} of ${rows.length} majors name universities that have no page`}>
            The names are listed on the{" "}
            <Link href="/admin/universities" className="font-bold underline">
              Universities
            </Link>{" "}
            screen.
          </Callout>
        )}
      </div>

      {editor.mode === "create" || (editor.mode === "edit" && editor.selected) ? (
        <EditorShell
          backLabel="majors"
          onBack={handleBack}
          title={
            editor.mode === "create"
              ? "New major"
              : editor.selected?.name ?? `#${editor.selected?.id}`
          }
          id={editor.mode === "edit" ? editor.selected?.id : undefined}
          tag={
            editor.mode === "edit" && editor.selected ? (
              editor.selected.archived_at ? <Tag tone="neutral">Archived</Tag> : <Tag tone="green">Live</Tag>
            ) : undefined
          }
        >
          <MajorEditor
            key={editor.mode === "create" ? `create-${createKey}` : editor.selected!.id}
            initial={editor.mode === "create" ? emptyForm() : formFrom(editor.selected!)}
            isCreate={editor.mode === "create"}
            busy={editor.busy}
            error={editor.formError}
            universityOptions={universityOptions}
            careerOptions={careerOptions}
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
                  <th className={thClass}>Major</th>
                  <th className={`${thClass} w-44`}>Job-market demand</th>
                  <th className={`${thClass} w-72`}>Careers</th>
                  <th className={`${thClass} w-40`}>Universities</th>
                  <th className={`${thClass} w-20`}>Subjects</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ major, field: f, noPage }) => (
                  <tr
                    key={major.id}
                    onClick={() => editor.open(major)}
                    className={`cursor-pointer transition-colors ${editor.selected?.id === major.id ? "bg-sky/10 dark:bg-sky/15" : "hover:bg-powder/60 dark:hover:bg-white/5"}`}
                  >
                    <td className={`${tdClass} max-w-0`}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            editor.open(major);
                          }}
                          className="block max-w-full truncate text-left font-bold text-blue-ink hover:text-sky-deep cursor-pointer"
                        >
                          {major.name}
                        </button>
                        {major.archived_at && <Tag tone="neutral">Archived</Tag>}
                      </div>
                      <p className="text-xs text-gray-soft truncate">{f}</p>
                    </td>
                    <td className={tdClass}>
                      {major.job_market_demand?.trim() || <span className="font-bold text-amber-700">Not stated</span>}
                    </td>
                    <td className={`${tdClass} text-xs text-gray-body`}>
                      {major.related_careers.join(", ") || <span className="font-bold text-amber-700">Not stated</span>}
                    </td>
                    <td className={`${tdClass} text-xs`}>
                      <span className="tabular-nums">{major.universities.length}</span>
                      {noPage > 0 && <span className="font-bold text-amber-700"> · {noPage} no page</span>}
                    </td>
                    <td className={`${tdClass} tabular-nums text-xs`}>{major.subjects.length}</td>
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
            <aside className="rounded-2xl border border-sky/15 bg-white xl:sticky xl:top-20" aria-label="Major detail">
              <header className="border-b border-sky/15 px-4 pt-4 pb-3">
                <p className="tabular-nums text-xs text-gray-soft">#{editor.selected.id}</p>
                <h2 className="mt-0.5 text-base font-extrabold leading-snug">{editor.selected.name}</h2>
                <p className="mt-0.5 text-xs text-gray-soft">{editor.selected.field}</p>
              </header>
              <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-sky/15 px-4 py-3 text-sm">
                <dt className="text-gray-soft">Status</dt>
                <dd>{editor.selected.archived_at ? <Tag tone="neutral">Archived</Tag> : <Tag tone="green">Live</Tag>}</dd>
                <dt className="text-gray-soft">Duration</dt>
                <dd>{editor.selected.duration ?? <span className="text-gray-soft">Not stated</span>}</dd>
                <dt className="text-gray-soft">Degree</dt>
                <dd>{editor.selected.degree_type ?? <span className="text-gray-soft">Not stated</span>}</dd>
                <dt className="text-gray-soft">Demand</dt>
                <dd>{editor.selected.job_market_demand ?? <span className="text-gray-soft">Not stated</span>}</dd>
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
                <a href={`/majors/${editor.selected.id}`} className={btnGhost}>
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
              Select a major to edit it, or add a new one.
            </aside>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(editor.confirmArchive)}
        title="Archive this major?"
        description="It disappears from the public site but is kept — saved items and history stay, and you can restore it."
        confirmLabel="Archive"
        busy={editor.busy}
        onConfirm={editor.doArchive}
        onCancel={() => editor.setConfirmArchive(null)}
      >
        <Field label="Reason (optional)" htmlFor="major-archive-reason">
          <input
            id="major-archive-reason"
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
