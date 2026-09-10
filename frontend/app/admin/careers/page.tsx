"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchCareers } from "@/app/lib/api";
import { plainCategory } from "@/app/lib/catalogAdapters";
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

export default function AdminCareersPage() {
  const { data, error, loading, reload } = useAdminLoad(fetchCareers);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error} onRetry={reload} />;

  const careers = data.map((c) => ({ ...c, categoryKey: plainCategory(c.category) }));
  const categories = [...new Set(careers.map((c) => c.categoryKey))].sort();
  const noSalary = careers.filter((c) => !c.average_salary?.trim());
  const q = query.trim().toLowerCase();
  const visible = careers.filter(
    (c) =>
      (category === "All" || c.categoryKey === category) &&
      (!q || c.title.toLowerCase().includes(q) || c.required_skills.some((s) => s.toLowerCase().includes(q)))
  );

  return (
    <>
      <PageHeader title="Careers" aside="Read-only · edit the careers sheet and re-seed to change them" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
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
            count: c === "All" ? careers.length : careers.filter((x) => x.categoryKey === c).length,
          }))}
        />
      </div>

      {noSalary.length > 0 && (
        <div className="mb-4">
          <Callout
            title={
              noSalary.length === careers.length
                ? `Average salary is blank for all ${careers.length} careers`
                : `${noSalary.length} careers have no average salary`
            }
          >
            A third of students surveyed (33%) said expected salary would help them choose. Add a salary column to
            the careers sheet and re-seed — no code change needed.
          </Callout>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Career</th>
              <th className={`${thClass} w-44`}>Growth outlook</th>
              <th className={`${thClass} w-64`}>Education</th>
              <th className={`${thClass} w-72`}>Skills</th>
              <th className={`${thClass} w-28`}>Avg. salary</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id} className="hover:bg-powder/70">
                <td className={`${tdClass} max-w-0`}>
                  <Link href={`/careers/${c.id}`} className="font-bold hover:text-sky-deep truncate block">
                    {c.title}
                  </Link>
                  <p className="text-xs text-gray-soft truncate">{c.categoryKey}</p>
                </td>
                <td className={tdClass}>
                  {c.growth_outlook ?? <span className="text-amber-700 font-bold">Not stated</span>}
                </td>
                <td className={`${tdClass} text-xs text-gray-body`}>
                  {c.education_required ?? <span className="text-amber-700 font-bold">Not stated</span>}
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
                  {c.average_salary ?? <span className="text-amber-700 font-bold">Missing</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
