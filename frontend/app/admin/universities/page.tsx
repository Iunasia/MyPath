"use client";

import { useState } from "react";
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
  ErrorBox,
  Field,
  HistoryList,
  hostOf,
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

function UniversityForm({
  initial,
  submitLabel,
  busy,
  error,
  scholarshipOptions,
  onSubmit,
  onCancel,
}: {
  initial: UniversityInput;
  submitLabel: string;
  busy: boolean;
  error: string;
  scholarshipOptions: string[];
  onSubmit: (input: UniversityInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<UniversityInput>(initial);
  const set = (patch: Partial<UniversityInput>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          name: form.name?.trim(),
          description: form.description?.trim(),
          website: form.website?.trim(),
          slug: form.slug?.trim() ? form.slug.trim() : null,
        });
      }}
      className="grid gap-3"
    >
      <Field label="Name" htmlFor="u-name">
        <input id="u-name" className={inputClass} value={form.name ?? ""} onChange={(e) => set({ name: e.target.value })} required maxLength={250} />
      </Field>
      <Field
        label="Slug"
        htmlFor="u-slug"
        hint="The public URL segment, e.g. /universities/cadt. Changing it breaks existing links."
      >
        <input id="u-slug" className={inputClass} value={form.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} placeholder="derived from the name if blank" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Short name" htmlFor="u-short">
          <input id="u-short" className={inputClass} value={form.short_name ?? ""} onChange={(e) => set({ short_name: e.target.value })} />
        </Field>
        <Field label="Type" htmlFor="u-type" hint="Public / Private / International">
          <input id="u-type" className={inputClass} value={form.type ?? ""} onChange={(e) => set({ type: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country" htmlFor="u-country">
          <input id="u-country" className={inputClass} value={form.country ?? ""} onChange={(e) => set({ country: e.target.value })} />
        </Field>
        <Field label="City" htmlFor="u-city">
          <input id="u-city" className={inputClass} value={form.city ?? ""} onChange={(e) => set({ city: e.target.value })} />
        </Field>
      </div>
      <Field label="Description" htmlFor="u-description">
        <textarea id="u-description" className={textareaClass} rows={3} value={form.description ?? ""} onChange={(e) => set({ description: e.target.value })} required />
      </Field>
      <Field label="Website" htmlFor="u-website" hint="Used to derive the source.">
        <input id="u-website" className={inputClass} value={form.website ?? ""} onChange={(e) => set({ website: e.target.value })} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" htmlFor="u-phone">
          <input id="u-phone" className={inputClass} value={form.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Established" htmlFor="u-established">
          <input id="u-established" className={inputClass} value={form.established ?? ""} onChange={(e) => set({ established: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student count" htmlFor="u-students">
          <input id="u-students" className={inputClass} value={form.student_count ?? ""} onChange={(e) => set({ student_count: e.target.value })} />
        </Field>
        <Field label="Ranking" htmlFor="u-ranking">
          <input
            id="u-ranking"
            type="number"
            className={inputClass}
            value={form.ranking ?? ""}
            onChange={(e) => set({ ranking: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tuition range" htmlFor="u-tuition">
          <input id="u-tuition" className={inputClass} value={form.tuition_range ?? ""} onChange={(e) => set({ tuition_range: e.target.value })} />
        </Field>
        <Field label="Acceptance rate" htmlFor="u-acceptance">
          <input id="u-acceptance" className={inputClass} value={form.acceptance_rate ?? ""} onChange={(e) => set({ acceptance_rate: e.target.value })} />
        </Field>
      </div>
      <Field label="Image URL" htmlFor="u-image">
        <input id="u-image" className={inputClass} value={form.image_url ?? ""} onChange={(e) => set({ image_url: e.target.value })} />
      </Field>
      <Field label="Programs" hint="Type and press Enter to add.">
        <TokenSelect allowCustom inputId="u-programs" value={form.programs ?? []} onChange={(v) => set({ programs: v })} />
      </Field>
      <Field label="Scholarships" hint="Pick from the catalogue.">
        <TokenSelect inputId="u-scholarships" value={form.scholarships ?? []} onChange={(v) => set({ scholarships: v })} options={scholarshipOptions} />
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

export default function AdminUniversitiesPage() {
  const editor = useContentEditor({ resource });
  const { data: external } = useAdminLoad(loadExternal);

  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");

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
          <button type="button" onClick={editor.startCreate} className={btnPrimary}>
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

        {editor.mode === "create" ? (
          <aside className="rounded-2xl border border-sky/15 bg-white p-5" aria-label="New university">
            <h2 className="mb-3 font-display text-sm font-extrabold text-blue-ink">Add a university</h2>
            <UniversityForm
              key="create"
              initial={emptyForm()}
              submitLabel="Add university"
              busy={editor.busy}
              error={editor.formError}
              scholarshipOptions={scholarshipOptions}
              onSubmit={editor.save}
              onCancel={editor.closeForm}
            />
          </aside>
        ) : editor.mode === "edit" && editor.selected ? (
          <aside className="rounded-2xl border border-sky/15 bg-white p-5" aria-label="Edit university">
            <h2 className="mb-3 font-display text-sm font-extrabold text-blue-ink">Editing #{editor.selected.id}</h2>
            <UniversityForm
              key={editor.selected.id}
              initial={formFrom(editor.selected)}
              submitLabel="Save changes"
              busy={editor.busy}
              error={editor.formError}
              scholarshipOptions={scholarshipOptions}
              onSubmit={editor.save}
              onCancel={editor.closeForm}
            />
          </aside>
        ) : editor.selected ? (
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

      {editor.notice && <Toast message={editor.notice} />}
    </>
  );
}
