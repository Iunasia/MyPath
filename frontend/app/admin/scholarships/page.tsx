"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  Download,
  ExternalLink,
  History,
  Loader2,
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
  type ApiAuditEntry,
  type ApiScholarship,
  type ScholarshipInput,
} from "@/app/lib/api";
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  ConfirmDialog,
  daysFromToday,
  ErrorBox,
  Field,
  formatDate,
  HistoryList,
  hostOf,
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
  Toolbar,
  useAdminLoad,
  VerificationMark,
} from "../ui";

type Filter = "all" | "passed" | "soon" | "undated" | "flagged" | "unchecked";
type Mode = "view" | "edit" | "create";

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
      return s.infoCheck.isRisky;
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

/* ── The editor ────────────────────────────────────────── */

function ScholarshipForm({
  initial,
  submitLabel,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ScholarshipInput;
  submitLabel: string;
  busy: boolean;
  error: string;
  onSubmit: (input: ScholarshipInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ScholarshipInput>(initial);
  const set = (patch: Partial<ScholarshipInput>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          title: form.title?.trim(),
          provider: form.provider?.trim(),
          description: form.description?.trim(),
          application_link: form.application_link?.trim(),
        });
      }}
      className="grid gap-3"
    >
      <Field label="Title" htmlFor="f-title">
        <input
          id="f-title"
          className={inputClass}
          value={form.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          required
          maxLength={300}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Provider" htmlFor="f-provider">
          <input
            id="f-provider"
            className={inputClass}
            value={form.provider ?? ""}
            onChange={(e) => set({ provider: e.target.value })}
            required
          />
        </Field>
        <Field label="Provider type" htmlFor="f-provider-type">
          <select
            id="f-provider-type"
            className={selectClass}
            value={form.provider_type ?? "unknown"}
            onChange={(e) => set({ provider_type: e.target.value })}
          >
            {PROVIDER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" htmlFor="f-description">
        <textarea
          id="f-description"
          className={textareaClass}
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => set({ description: e.target.value })}
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Deadline" htmlFor="f-deadline" hint="Leaves blank for rolling deadlines.">
          <input
            id="f-deadline"
            type="datetime-local"
            className={inputClass}
            value={toLocalInput(form.deadline ?? null)}
            onChange={(e) => set({ deadline: fromLocalInput(e.target.value) })}
          />
        </Field>
        <Field label="Deadline note" htmlFor="f-note" hint="Used when the deadline is prose.">
          <input
            id="f-note"
            className={inputClass}
            value={form.deadline_note ?? ""}
            onChange={(e) => set({ deadline_note: e.target.value })}
            maxLength={300}
          />
        </Field>
      </div>

      <Field label="Application link" htmlFor="f-link">
        <input
          id="f-link"
          className={inputClass}
          value={form.application_link ?? ""}
          onChange={(e) => set({ application_link: e.target.value })}
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount" htmlFor="f-amount">
          <input id="f-amount" className={inputClass} value={form.amount ?? ""} onChange={(e) => set({ amount: e.target.value })} />
        </Field>
        <Field label="Country" htmlFor="f-country">
          <input id="f-country" className={inputClass} value={form.country ?? ""} onChange={(e) => set({ country: e.target.value })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Degree level" htmlFor="f-degree">
          <input id="f-degree" className={inputClass} value={form.degree_level ?? ""} onChange={(e) => set({ degree_level: e.target.value })} />
        </Field>
        <Field label="Field of study" htmlFor="f-field">
          <input id="f-field" className={inputClass} value={form.field_of_study ?? ""} onChange={(e) => set({ field_of_study: e.target.value })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" htmlFor="f-opp-type">
          <select
            id="f-opp-type"
            className={selectClass}
            value={form.opportunity_type ?? "scholarship"}
            onChange={(e) => set({ opportunity_type: e.target.value })}
          >
            {OPPORTUNITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Documents" htmlFor="f-documents" hint="Comma separated.">
          <input
            id="f-documents"
            className={inputClass}
            value={(form.documents ?? []).join(", ")}
            onChange={(e) => set({ documents: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
          />
        </Field>
      </div>

      <Field label="Eligibility" htmlFor="f-eligibility">
        <textarea id="f-eligibility" className={textareaClass} rows={2} value={form.eligibility ?? ""} onChange={(e) => set({ eligibility: e.target.value })} />
      </Field>

      <Field label="Coverage" htmlFor="f-coverage">
        <textarea id="f-coverage" className={textareaClass} rows={2} value={form.coverage ?? ""} onChange={(e) => set({ coverage: e.target.value })} />
      </Field>

      <Field label="Application process" htmlFor="f-process">
        <textarea id="f-process" className={textareaClass} rows={2} value={form.application_process ?? ""} onChange={(e) => set({ application_process: e.target.value })} />
      </Field>

      <Field label="Image URL" htmlFor="f-image">
        <input id="f-image" className={inputClass} value={form.image_url ?? ""} onChange={(e) => set({ image_url: e.target.value })} />
      </Field>

      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ── Page ──────────────────────────────────────────────── */

function ScholarshipsAdmin() {
  const params = useSearchParams();
  const requested = params.get("filter");
  const startCreating = params.get("create") === "1";

  const [filter, setFilter] = useState<Filter>(isFilter(requested) ? requested : "all");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>(startCreating ? "create" : "view");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmArchive, setConfirmArchive] = useState<ApiScholarship | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [historyState, setHistoryState] = useState<{ id: number; entries: ApiAuditEntry[] } | null>(null);

  const prefill = useMemo(
    () =>
      emptyForm({
        title: params.get("title") ?? "",
        application_link: params.get("url") ?? "",
        provider: params.get("provider") ?? "",
      }),
    [params]
  );

  const load = useCallback(
    () => fetchScholarships({ includeArchived: showArchived }),
    [showArchived]
  );
  const { data, setData, error, loading, reload } = useAdminLoad(load);

  const scholarships = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter(
      (s) =>
        (showArchived || !s.archived_at) &&
        matches(s, filter) &&
        (!q || [s.title, s.provider, hostOf(s.source_url)].some((field) => field.toLowerCase().includes(q)))
    );
  }, [scholarships, filter, query, showArchived]);

  const selected = scholarships.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  // Refresh the history whenever the open listing changes or is edited. The
  // result is tagged with its id, so a stale response never shows under a
  // different listing and no state has to be cleared on deselect.
  const historyTargetId = mode === "view" && selected ? selected.id : null;
  const historyVersion = mode === "view" && selected ? selected.edited_at : null;
  useEffect(() => {
    if (historyTargetId === null) return;
    let cancelled = false;
    fetchScholarshipHistory(historyTargetId)
      .then((entries) => {
        if (!cancelled) setHistoryState({ id: historyTargetId, entries });
      })
      .catch(() => {
        if (!cancelled) setHistoryState({ id: historyTargetId, entries: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [historyTargetId, historyVersion]);

  const history = historyState && historyState.id === historyTargetId ? historyState.entries : null;

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error} onRetry={reload} />;

  const applyUpdate = (updated: ApiScholarship) =>
    setData((prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? prev);

  const save = async (input: ScholarshipInput) => {
    setBusy(true);
    setFormError("");
    try {
      if (mode === "create") {
        const { scholarship } = await createScholarship(input);
        await reload();
        setSelectedId(scholarship.id);
        setMode("view");
        setNotice("Scholarship added");
      } else if (selected) {
        const { scholarship } = await updateScholarship(selected.id, input);
        applyUpdate(scholarship);
        setMode("view");
        setNotice("Changes saved");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const markChecked = async (s: ApiScholarship) => {
    setBusy(true);
    try {
      const { scholarship, infoCheck } = await markScholarshipChecked(s.id);
      applyUpdate({ ...scholarship, infoCheck });
      setNotice("Marked as checked");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const doArchive = async () => {
    if (!confirmArchive) return;
    setBusy(true);
    try {
      const { scholarship } = await archiveScholarship(confirmArchive.id, archiveReason.trim() || undefined);
      applyUpdate(scholarship);
      if (!showArchived) setSelectedId(null);
      setConfirmArchive(null);
      setArchiveReason("");
      setNotice("Scholarship archived");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not archive");
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async (s: ApiScholarship) => {
    setBusy(true);
    try {
      const { scholarship } = await restoreScholarship(s.id);
      applyUpdate(scholarship);
      setNotice("Scholarship restored");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not restore");
    } finally {
      setBusy(false);
    }
  };

  const doExport = async () => {
    try {
      const blob = await exportScholarshipsCsv(showArchived);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "scholarships.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Export failed");
    }
  };

  const startEdit = () => {
    setFormError("");
    setMode("edit");
  };
  const startCreate = () => {
    setFormError("");
    setSelectedId(null);
    setMode("create");
  };
  const closeForm = () => {
    setFormError("");
    setMode("view");
  };

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
          options={FILTERS.map((f) => ({ ...f, count: scholarships.filter((s) => matches(s, f.value)).length }))}
        />
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-body">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-sky/40 accent-sky-deep"
            />
            Show archived
          </label>
          <button type="button" onClick={doExport} className={btnSecondary}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button type="button" onClick={startCreate} className={btnPrimary}>
            <Plus className="w-3.5 h-3.5" />
            Add scholarship
          </button>
        </div>
      </Toolbar>

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
                    setSelectedId(s.id);
                    setMode("view");
                  }}
                  className={`cursor-pointer ${selected?.id === s.id ? "bg-sky/10" : "hover:bg-powder/60"}`}
                >
                  <td className={`${tdClass} tabular-nums text-xs text-gray-soft`}>{s.id}</td>
                  <td className={`${tdClass} max-w-0`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(s.id);
                        setMode("view");
                      }}
                      aria-pressed={selected?.id === s.id}
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
                    ) : s.infoCheck.isRisky ? (
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

        {mode === "create" ? (
          <aside className="rounded-2xl border border-sky/15 bg-white p-5" aria-label="New scholarship">
            <h2 className="mb-3 font-display text-sm font-extrabold text-blue-ink">Add a scholarship</h2>
            <ScholarshipForm
              key="create"
              initial={prefill}
              submitLabel="Add listing"
              busy={busy}
              error={formError}
              onSubmit={save}
              onCancel={closeForm}
            />
          </aside>
        ) : mode === "edit" && selected ? (
          <aside className="rounded-2xl border border-sky/15 bg-white p-5" aria-label="Edit scholarship">
            <h2 className="mb-3 font-display text-sm font-extrabold text-blue-ink">Editing #{selected.id}</h2>
            <ScholarshipForm
              key={selected.id}
              initial={formFrom(selected)}
              submitLabel="Save changes"
              busy={busy}
              error={formError}
              onSubmit={save}
              onCancel={closeForm}
            />
          </aside>
        ) : selected ? (
          <aside className="rounded-2xl border border-sky/15 bg-white xl:sticky xl:top-20" aria-label="Scholarship detail">
            <header className="border-b border-sky/15 px-4 pt-4 pb-3">
              <p className="tabular-nums text-xs text-gray-soft">#{selected.id}</p>
              <h2 className="mt-0.5 text-base font-extrabold leading-snug">{selected.title}</h2>
              <p className="mt-0.5 text-xs text-gray-soft">{selected.provider}</p>
            </header>

            <dl className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-sky/15 px-4 py-3 text-sm">
              <dt className="text-gray-soft">Deadline</dt>
              <dd>
                {selected.deadline ? (
                  <>
                    {formatDate(selected.deadline, true)}{" "}
                    {daysFromToday(selected.deadline) < 0 && <span className="font-bold text-rose-700">· passed</span>}
                  </>
                ) : (
                  <span className="text-gray-soft">{selected.deadline_note || "Not announced"}</span>
                )}
              </dd>
              <dt className="text-gray-soft">Status</dt>
              <dd>
                {selected.archived_at ? (
                  <Tag tone="neutral">Archived</Tag>
                ) : selected.infoCheck.isRisky ? (
                  <Tag tone="red">Flagged</Tag>
                ) : (
                  <Tag tone="green">Auto-checked</Tag>
                )}
              </dd>
              <dt className="text-gray-soft">Source</dt>
              <dd className="min-w-0">
                <span className="break-all text-xs tabular-nums">{hostOf(selected.source_url) || "none"}</span>{" "}
                <Tag>{SOURCE_LABEL[selected.source_type] ?? selected.source_type}</Tag>
              </dd>
              <dt className="text-gray-soft">Checked</dt>
              <dd>{selected.last_verified ? <VerificationMark date={selected.last_verified} /> : <VerificationMark pending />}</dd>
            </dl>

            {selected.infoCheck.reasons.length > 0 && (
              <ul className="mx-4 mt-3 space-y-1 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {selected.infoCheck.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2 px-4 py-3">
              <button type="button" onClick={startEdit} className={btnPrimary}>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              {selected.archived_at ? (
                <button type="button" onClick={() => doRestore(selected)} disabled={busy} className={btnSecondary}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setArchiveReason("");
                    setConfirmArchive(selected);
                  }}
                  className={btnSecondary}
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archive
                </button>
              )}
              <button
                type="button"
                onClick={() => markChecked(selected)}
                disabled={busy || (selected.last_verified ? daysFromToday(selected.last_verified) === 0 : false)}
                className={btnGhost}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Mark checked
              </button>
              {selected.source_url && (
                <a href={selected.source_url} target="_blank" rel="noopener noreferrer nofollow" className={btnGhost}>
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Link href={`/scholarships/${selected.id}`} className={btnGhost}>
                Public page
              </Link>
            </div>

            <details className="border-t border-sky/15" open>
              <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-blue-ink">
                <History className="w-3.5 h-3.5 text-gray-soft" />
                History
              </summary>
              <HistoryList entries={history} />
            </details>

            <p className="border-t border-sky/15 px-4 py-3 text-xs text-gray-soft">
              Open the provider&apos;s own page and confirm the deadline and award before marking it checked. Students
              see the date as &ldquo;Last verified&rdquo;.
            </p>
          </aside>
        ) : (
          <aside className="rounded-2xl border border-dashed border-sky/25 bg-white/60 p-6 text-sm text-gray-soft">
            Select a listing to edit it, or add a new one.
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmArchive)}
        title="Archive this scholarship?"
        description="Students stop seeing it and it drops out of the public catalogue. Nothing is deleted — saved items and history stay, and you can restore it."
        confirmLabel="Archive"
        busy={busy}
        onConfirm={doArchive}
        onCancel={() => setConfirmArchive(null)}
      >
        <Field label="Reason (optional)" htmlFor="archive-reason">
          <input
            id="archive-reason"
            className={inputClass}
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            placeholder="e.g. programme discontinued"
          />
        </Field>
      </ConfirmDialog>

      {notice && <Toast message={notice} />}
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
