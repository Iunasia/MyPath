"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fetchMajors, fetchUniversities } from "@/app/lib/api";
import { linkUniversities, toUniversityViews } from "@/app/lib/catalogAdapters";
import {
  Callout,
  ErrorBox,
  hostOf,
  inputClass,
  Loading,
  PageHeader,
  Segments,
  tableClass,
  tdClass,
  thClass,
  useAdminLoad,
} from "../ui";

const load = () => Promise.all([fetchUniversities(), fetchMajors()]);

export default function AdminUniversitiesPage() {
  const { data, error, loading, reload } = useAdminLoad(load);
  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");

  /**
   * Majors name universities in free text. Anything that doesn't resolve to a
   * record here is a name students see but can't open.
   */
  const analysis = useMemo(() => {
    if (!data) return null;
    const [universities, majors] = data;
    const views = toUniversityViews(universities);
    const inMajors = new Map<string, number>();
    const unknown = new Map<string, number>();

    for (const major of majors) {
      const { links, unmatched } = linkUniversities(major.universities, views);
      for (const id of new Set(links.map((l) => l.id))) inMajors.set(id, (inMajors.get(id) ?? 0) + 1);
      for (const name of unmatched) unknown.set(name, (unknown.get(name) ?? 0) + 1);
    }

    return {
      universities,
      views,
      inMajors,
      unknown: [...unknown.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    };
  }, [data]);

  if (loading) return <Loading />;
  if (error || !analysis) return <ErrorBox message={error} onRetry={reload} />;

  const { universities, views, inMajors, unknown } = analysis;
  const types = ["All", ...new Set(universities.map((u) => u.type).filter((t): t is string => Boolean(t)))];
  const q = query.trim().toLowerCase();
  const visible = universities.filter(
    (u) =>
      (type === "All" || u.type === type) &&
      (!q || u.name.toLowerCase().includes(q) || (u.short_name ?? "").toLowerCase().includes(q))
  );

  return (
    <>
      <PageHeader
        title="Universities"
        aside="Read-only · edit src/seeds/data/universities.json and re-seed to change them"
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
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
            count: t === "All" ? universities.length : universities.filter((u) => u.type === t).length,
          }))}
        />
      </div>

      {unknown.length > 0 && (
        <div className="mb-4">
          <Callout title={`Majors name ${unknown.length} universities that aren't in the catalogue`}>
            Students see these names on major pages but get no page to open. Add them to universities.json, or
            fix the name in the majors sheet.
            <p className="mt-1.5 text-blue-ink">
              {unknown.map(([name, count], i) => (
                <span key={name}>
                  {i > 0 && " · "}
                  {name} <span className="text-gray-soft">×{count}</span>
                </span>
              ))}
            </p>
          </Callout>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>University</th>
              <th className={`${thClass} w-28`}>Type</th>
              <th className={`${thClass} w-16`}>Est.</th>
              <th className={`${thClass} w-64`}>Tuition</th>
              <th className={`${thClass} w-24`}>In majors</th>
              <th className={`${thClass} w-40`}>Website</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => {
              const view = views.find((v) => v.apiId === u.id);
              return (
                <tr key={u.id} className="hover:bg-powder/70">
                  <td className={`${tdClass} max-w-0`}>
                    <Link href={`/universities/${view?.id ?? u.id}`} className="font-bold hover:text-sky-deep truncate block">
                      {u.name}
                    </Link>
                    <p className="text-xs text-gray-soft truncate">
                      {[u.short_name, u.city].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className={tdClass}>{u.type ?? <span className="text-amber-700">Not stated</span>}</td>
                  <td className={`${tdClass} font-mono text-xs`}>{u.established ?? "—"}</td>
                  <td className={`${tdClass} text-xs`}>
                    {u.tuition_range ?? <span className="text-amber-700 font-bold">Not stated</span>}
                  </td>
                  <td className={`${tdClass} font-mono text-xs`}>{inMajors.get(view?.id ?? "") ?? 0}</td>
                  <td className={`${tdClass} font-mono text-xs max-w-0 truncate`}>{hostOf(u.website)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
