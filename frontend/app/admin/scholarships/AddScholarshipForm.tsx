"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import { createScholarship, type ApiScholarship, type ScholarshipInput } from "@/app/lib/api";
import { inputClass } from "../ui";

const EMPTY: Required<ScholarshipInput> = {
  title: "",
  provider: "",
  description: "",
  amount: "",
  application_link: "",
  coverage: "",
  eligibility: "",
  degree_level: "",
  field_of_study: "",
  documents: "",
  application_process: "",
  deadline: "",
  deadline_note: "",
  image_url: "",
  country: "Cambodia",
  opportunity_type: "scholarship",
};

const labelClass = "block text-[11px] font-extrabold uppercase tracking-wider text-gray-soft mb-1";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-gray-soft mt-1">{hint}</span>}
    </label>
  );
}

/**
 * Adds a listing by hand. The backend classifies the link and attaches the same
 * safety warnings the importer would, so a risky link is accepted but shows up
 * as Flagged straight away.
 */
export default function AddScholarshipForm({
  onCreated,
  onCancel,
}: {
  onCreated: (created: ApiScholarship) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const bind = (key: keyof ScholarshipInput) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { scholarship, infoCheck } = await createScholarship(form);
      onCreated({ ...scholarship, infoCheck });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this scholarship");
      setBusy(false);
    }
  };

  const areaClass = `${inputClass} w-full resize-y`;

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-sky/20 bg-white mb-5"
      aria-label="Add a scholarship"
    >
      <header className="px-4 pt-4 pb-3 border-b border-sky/20">
        <h2 className="text-base font-extrabold text-blue-ink">Add a scholarship</h2>
        <p className="text-xs text-gray-soft mt-0.5">
          Listings added here are kept when the sheet is re-seeded. The source and safety checks are worked out
          from the official link.
        </p>
      </header>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <Field label="Title" required hint="Must be unique.">
          <input {...bind("title")} required maxLength={300} className={`${inputClass} w-full`} />
        </Field>
        <Field label="Provider" required>
          <input {...bind("provider")} required maxLength={300} className={`${inputClass} w-full`} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Official link" required hint="The provider's own application page, e.g. https://cadt.edu.kh/…">
            <input {...bind("application_link")} type="url" required className={`${inputClass} w-full`} />
          </Field>
        </div>

        <Field label="Award" required hint='Short summary, e.g. "100% tuition".'>
          <input {...bind("amount")} required maxLength={300} className={`${inputClass} w-full`} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select {...bind("opportunity_type")} className={`${inputClass} w-full`}>
              <option value="scholarship">Scholarship</option>
              <option value="exchange">Exchange</option>
              <option value="internship">Internship</option>
            </select>
          </Field>
          <Field label="Country">
            <input {...bind("country")} maxLength={300} className={`${inputClass} w-full`} />
          </Field>
        </div>

        <Field label="Deadline" hint="Leave empty if there is no fixed date.">
          <input {...bind("deadline")} type="date" className={`${inputClass} w-full`} />
        </Field>
        <Field label="Deadline note" hint='Shown when there is no date, e.g. "Rolling".'>
          <input
            {...bind("deadline_note")}
            maxLength={300}
            disabled={Boolean(form.deadline)}
            className={`${inputClass} w-full disabled:opacity-50`}
          />
        </Field>

        <Field label="Degree level">
          <input {...bind("degree_level")} maxLength={300} placeholder="Bachelor" className={`${inputClass} w-full`} />
        </Field>
        <Field label="Field of study">
          <input {...bind("field_of_study")} maxLength={300} className={`${inputClass} w-full`} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Description" required>
            <textarea {...bind("description")} required rows={3} maxLength={5000} className={areaClass} />
          </Field>
        </div>

        <Field label="Coverage" hint="Full benefits. Defaults to “See official site”.">
          <textarea {...bind("coverage")} rows={3} maxLength={5000} className={areaClass} />
        </Field>
        <Field label="Eligibility" hint="Defaults to “See official site”.">
          <textarea {...bind("eligibility")} rows={3} maxLength={5000} className={areaClass} />
        </Field>

        <Field label="Documents" hint="One per line.">
          <textarea {...bind("documents")} rows={3} className={areaClass} />
        </Field>
        <Field label="How to apply">
          <textarea {...bind("application_process")} rows={3} maxLength={5000} className={areaClass} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Image URL" hint="Optional. A stock photo is used when empty.">
            <input {...bind("image_url")} type="url" className={`${inputClass} w-full`} />
          </Field>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-sky/20">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-deep px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add scholarship
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border border-sky/35 px-3 py-1.5 text-xs font-bold text-gray-body hover:bg-powder/70 cursor-pointer"
        >
          Cancel
        </button>
        {error && <p className="text-xs text-rose-700 font-medium">{error}</p>}
      </footer>
    </form>
  );
}
