"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fetchMajors, fetchUniversities } from "@/app/lib/api";
import { linkUniversities, plainCategory, toUniversityViews } from "@/app/lib/catalogAdapters";
import {
  Callout,
  ErrorBox,
  inputClass,
  Loading,
  PageHeader,
  Segments,
  tableClass,
  tdClass,
  thClass,
  useAdminLoad,
} from "../ui";

const load = () => Promise.all([fetchMajors(), fetchUniversities()]);

export default function AdminMajorsPage() {
  const { data, error, loading, reload } = useAdminLoad(load);
  const [field, setField] = useState("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!data) return null;
    const [majors, universities] = data;
    const views = toUniversityViews(universities);
    return majors.map((major) => ({
      major,
      field: plainCategory(major.field),
      noPage: linkUniversities(major.universities, views).unmatched.length,
    }));
  }, [data]);

  if (loading) return <Loading />;
  if (error || !rows) return <ErrorBox message={error} onRetry={reload} />;

  const fields = [...new Set(rows.map((r) => r.field))].sort();
  const noDemand = rows.filter((r) => !r.major.job_market_demand?.trim());
  const withUnknown = rows.filter((r) => r.noPage > 0);
  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (field === "All" || r.field === field) &&
      (!q ||
        r.major.name.toLowerCase().includes(q) ||
        r.major.related_careers.some((c) => c.toLowerCase().includes(q)))
  );

  return (
    <>
      <PageHeader title="Majors" aside="Read-only · edit the majors sheet and re-seed to change them" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
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
      </div>

      <div className="grid gap-2 mb-4">
        {noDemand.length > 0 && (
          <Callout
            title={`${noDemand.map((r) => r.major.name).join(", ")} ${noDemand.length === 1 ? "has" : "have"} no job-market demand`}
          >
            45% of students surveyed said job-market demand would help them choose a major. Fill in the demand
            column in the majors sheet.
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

      <div className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Major</th>
              <th className={`${thClass} w-44`}>Job-market demand</th>
              <th className={`${thClass} w-80`}>Careers</th>
              <th className={`${thClass} w-40`}>Universities</th>
              <th className={`${thClass} w-20`}>Subjects</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ major, field: f, noPage }) => (
              <tr key={major.id} className="hover:bg-powder/70">
                <td className={`${tdClass} max-w-0`}>
                  <Link href={`/majors/${major.id}`} className="font-bold hover:text-sky-deep truncate block">
                    {major.name}
                  </Link>
                  <p className="text-xs text-gray-soft truncate">{f}</p>
                </td>
                <td className={tdClass}>
                  {major.job_market_demand?.trim() || <span className="text-amber-700 font-bold">Not stated</span>}
                </td>
                <td className={`${tdClass} text-xs text-gray-body`}>
                  {major.related_careers.join(", ") || <span className="text-amber-700 font-bold">Not stated</span>}
                </td>
                <td className={`${tdClass} text-xs`}>
                  <span className="font-mono">{major.universities.length}</span>
                  {noPage > 0 && <span className="text-amber-700 font-bold"> · {noPage} no page</span>}
                </td>
                <td className={`${tdClass} font-mono text-xs`}>{major.subjects.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
