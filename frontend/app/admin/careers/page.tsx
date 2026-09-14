"use client";

import { useState } from "react";
import {
  archiveCareer,
  createCareer,
  exportCareersCsv,
  fetchCareerHistory,
  fetchCareers,
  fetchMajors,
  restoreCareer,
  updateCareer,
  type ApiCareer,
  type CareerInput,
} from "@/app/lib/api";
import { plainCategory } from "@/app/lib/catalogAdapters";
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  ConfirmDialog,
  ErrorBox,
  Field,
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

const resource: ContentResource<ApiCareer, CareerInput> = {
  fetchAll: ({ includeArchived }) => fetchCareers({ includeArchived }),
  create: (input) => createCareer(input).then((r) => r.career),
  update: (id, input) => updateCareer(id, input).then((r) => r.career),
  archive: (id, reason) => archiveCareer(id, reason).then((r) => r.career),
  restore: (id) => restoreCareer(id).then((r) => r.career),
  history: fetchCareerHistory,
  exportCsv: exportCareersCsv,
};

const loadMajorNames = () => fetchMajors();

const emptyForm = (): CareerInput => ({
  title: "",
  category: "Uncategorized",
  description: "",
  responsibilities: "",
  average_salary: "",
  growth_outlook: "",
  education_required: "",
  personality_fit: "",
  required_skills: [],
  related_majors: [],
});

const formFrom = (c: ApiCareer): CareerInput => ({
  title: c.title,
  category: c.category,
  description: c.description,
  responsibilities: c.responsibilities ?? "",
  average_salary: c.average_salary ?? "",
  growth_outlook: c.growth_outlook ?? "",
  education_required: c.education_required ?? "",
  personality_fit: c.personality_fit ?? "",
  required_skills: c.required_skills ?? [],
  related_majors: c.related_majors ?? [],
});

function CareerForm({
  initial,
  submitLabel,
  busy,
  error,
  majorOptions,
  onSubmit,
  onCancel,
}: {
  initial: CareerInput;
  submitLabel: string;
  busy: boolean;
  error: string;
  majorOptions: string[];
  onSubmit: (input: CareerInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CareerInput>(initial);
  const set = (patch: Partial<CareerInput>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, title: form.title?.trim(), description: form.description?.trim() });
      }}
      className="grid gap-3"
    >
      <Field label="Title" htmlFor="c-title">
        <input id="c-title" className={inputClass} value={form.title ?? ""} onChange={(e) => set({ title: e.target.value })} required maxLength={200} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" htmlFor="c-category">
          <input id="c-category" className={inputClass} value={form.category ?? ""} onChange={(e) => set({ category: e.target.value })} />
        </Field>
        <Field label="Growth outlook" htmlFor="c-growth">
          <input id="c-growth" className={inputClass} value={form.growth_outlook ?? ""} onChange={(e) => set({ growth_outlook: e.target.value })} />
        </Field>
      </div>
      <Field label="Description" htmlFor="c-description">
        <textarea id="c-description" className={textareaClass} rows={3} value={form.description ?? ""} onChange={(e) => set({ description: e.target.value })} required />
      </Field>
      <Field label="What you do" htmlFor="c-responsibilities">
        <textarea id="c-responsibilities" className={textareaClass} rows={2} value={form.responsibilities ?? ""} onChange={(e) => set({ responsibilities: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Education required" htmlFor="c-education">
          <input id="c-education" className={inputClass} value={form.education_required ?? ""} onChange={(e) => set({ education_required: e.target.value })} />
        </Field>
        <Field label="Average salary" htmlFor="c-salary">
          <input id="c-salary" className={inputClass} value={form.average_salary ?? ""} onChange={(e) => set({ average_salary: e.target.value })} />
        </Field>
      </div>
      <Field label="Personality fit" htmlFor="c-personality">
        <input id="c-personality" className={inputClass} value={form.personality_fit ?? ""} onChange={(e) => set({ personality_fit: e.target.value })} />
      </Field>
      <Field label="Skills" hint="Type and press Enter to add.">
        <TokenSelect allowCustom inputId="c-skills" value={form.required_skills ?? []} onChange={(v) => set({ required_skills: v })} />
      </Field>
      <Field label="Related majors" hint="Pick from existing majors.">
        <TokenSelect inputId="c-majors" value={form.related_majors ?? []} onChange={(v) => set({ related_majors: v })} options={majorOptions} />
      </Field>

      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminCareersPage() {
  const editor = useContentEditor({ resource });
  const { data: majors } = useAdminLoad(loadMajorNames);

  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  if (editor.loading) return <Loading />;
  if (editor.error) return <ErrorBox message={editor.error} onRetry={editor.reload} />;

  const majorOptions = (majors ?? []).map((m) => m.name);
  const rows = editor.rows.map((c) => ({ ...c, categoryKey: plainCategory(c.category) }));
  const categories = [...new Set(rows.map((c) => c.categoryKey))].sort();
  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (c) =>
      (category === "All" || c.categoryKey === category) &&
      (!q || c.title.toLowerCase().includes(q) || c.required_skills.some((s) => s.toLowerCase().includes(q)))
  );

  return (
    <>
      <PageHeader title="Careers" aside="Edit in place — changes are kept; re-seeding only fills gaps" />

      <Toolbar>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search careers or skills"
          className={`${inputClass} w-64`}
          aria-label="Search careers"
        />
        <Segments
          value={category}
          onChange={setCategory}
          options={["All", ...categories].map((c) => ({
            value: c,
            label: c,
            count: c === "All" ? rows.length : rows.filter((x) => x.categoryKey === c).length,
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
          <button type="button" onClick={() => editor.doExport("careers.csv")} className={btnSecondary}>
            Export CSV
          </button>
          <button type="button" onClick={editor.startCreate} className={btnPrimary}>
            Add career
          </button>
        </div>
      </Toolbar>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px] items-start">
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Career</th>
                <th className={`${thClass} w-44`}>Growth outlook</th>
                <th className={`${thClass} w-56`}>Education</th>
                <th className={`${thClass} w-64`}>Skills</th>
                <th className={`${thClass} w-28`}>Avg. salary</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => editor.open(c)}
                  className={`cursor-pointer ${editor.selected?.id === c.id ? "bg-sky/10" : "hover:bg-powder/60"}`}
                >
                  <td className={`${tdClass} max-w-0`}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          editor.open(c);
                        }}
                        className="block max-w-full truncate text-left font-bold text-blue-ink hover:text-sky-deep cursor-pointer"
                      >
                        {c.title}
                      </button>
                      {c.archived_at && <Tag tone="neutral">Archived</Tag>}
                    </div>
                    <p className="text-xs text-gray-soft truncate">{c.categoryKey}</p>
                  </td>
                  <td className={tdClass}>{c.growth_outlook ?? <span className="font-bold text-amber-700">Not stated</span>}</td>
                  <td className={`${tdClass} text-xs text-gray-body`}>
                    {c.education_required ?? <span className="font-bold text-amber-700">Not stated</span>}
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-1">
                      {c.required_skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded border border-sky/20 px-1.5 text-[11px] text-gray-body">
                          {skill}
                        </span>
                      ))}
                      {c.required_skills.length > 4 && (
                        <span className="text-[11px] text-gray-soft">+{c.required_skills.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className={`${tdClass} text-xs`}>
                    {c.average_salary ?? <span className="font-bold text-amber-700">Missing</span>}
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

        {editor.mode === "create" ? (
          <aside className="rounded-2xl border border-sky/15 bg-white p-5" aria-label="New career">
            <h2 className="mb-3 font-display text-sm font-extrabold text-blue-ink">Add a career</h2>
            <CareerForm
              key="create"
              initial={emptyForm()}
              submitLabel="Add career"
              busy={editor.busy}
              error={editor.formError}
              majorOptions={majorOptions}
              onSubmit={editor.save}
              onCancel={editor.closeForm}
            />
          </aside>
        ) : editor.mode === "edit" && editor.selected ? (
          <aside className="rounded-2xl border border-sky/15 bg-white p-5" aria-label="Edit career">
            <h2 className="mb-3 font-display text-sm font-extrabold text-blue-ink">Editing #{editor.selected.id}</h2>
            <CareerForm
              key={editor.selected.id}
              initial={formFrom(editor.selected)}
              submitLabel="Save changes"
              busy={editor.busy}
              error={editor.formError}
              majorOptions={majorOptions}
              onSubmit={editor.save}
              onCancel={editor.closeForm}
            />
          </aside>
        ) : editor.selected ? (
          <aside className="rounded-2xl border border-sky/15 bg-white xl:sticky xl:top-20" aria-label="Career detail">
            <header className="border-b border-sky/15 px-4 pt-4 pb-3">
              <p className="tabular-nums text-xs text-gray-soft">#{editor.selected.id}</p>
              <h2 className="mt-0.5 text-base font-extrabold leading-snug">{editor.selected.title}</h2>
              <p className="mt-0.5 text-xs text-gray-soft">{editor.selected.category}</p>
            </header>
            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-sky/15 px-4 py-3 text-sm">
              <dt className="text-gray-soft">Status</dt>
              <dd>{editor.selected.archived_at ? <Tag tone="neutral">Archived</Tag> : <Tag tone="green">Live</Tag>}</dd>
              <dt className="text-gray-soft">Growth</dt>
              <dd>{editor.selected.growth_outlook ?? <span className="text-gray-soft">Not stated</span>}</dd>
              <dt className="text-gray-soft">Education</dt>
              <dd>{editor.selected.education_required ?? <span className="text-gray-soft">Not stated</span>}</dd>
              <dt className="text-gray-soft">Salary</dt>
              <dd>{editor.selected.average_salary ?? <span className="text-gray-soft">Not stated</span>}</dd>
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
              <a href={`/careers/${editor.selected.id}`} className={btnGhost}>
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
            Select a career to edit it, or add a new one.
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(editor.confirmArchive)}
        title="Archive this career?"
        description="It disappears from the public site but is kept — saved items and history stay, and you can restore it."
        confirmLabel="Archive"
        busy={editor.busy}
        onConfirm={editor.doArchive}
        onCancel={() => editor.setConfirmArchive(null)}
      >
        <Field label="Reason (optional)" htmlFor="career-archive-reason">
          <input
            id="career-archive-reason"
            className={inputClass}
            value={editor.archiveReason}
            onChange={(e) => editor.setArchiveReason(e.target.value)}
            placeholder="e.g. no longer offered"
          />
        </Field>
      </ConfirmDialog>

      {editor.notice && <Toast message={editor.notice} />}
    </>
  );
}
