import { LucideIcon } from "lucide-react";
import { MAJORS_DATA, CATEGORIES } from "./majors";

/* ── Interfaces ────────────────────────────────────────── */

export interface CareerMajorLink {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface CareerItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  relatedMajors: CareerMajorLink[];
  skillsFromMajors: string[];
}

/* ── Slug helper ───────────────────────────────────────── */

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ── Aggregate careers from all majors ─────────────────── */

const careerMap = new Map<
  string,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    category: string;
    relatedMajors: CareerMajorLink[];
    skillsFromMajors: Set<string>;
  }
>();

for (const major of MAJORS_DATA) {
  for (const pathway of major.careerPathways) {
    const slug = toSlug(pathway.title);

    if (careerMap.has(slug)) {
      const existing = careerMap.get(slug)!;
      // Avoid duplicate major links
      if (!existing.relatedMajors.some((m) => m.id === major.id)) {
        existing.relatedMajors.push({
          id: major.id,
          name: major.name,
          icon: major.icon,
        });
      }
      // Aggregate skills
      for (const skill of major.skillsDeveloped) {
        existing.skillsFromMajors.add(skill);
      }
    } else {
      const skillSet = new Set<string>(major.skillsDeveloped);
      careerMap.set(slug, {
        title: pathway.title,
        description: pathway.description,
        icon: pathway.icon,
        category: major.category,
        relatedMajors: [
          { id: major.id, name: major.name, icon: major.icon },
        ],
        skillsFromMajors: skillSet,
      });
    }
  }
}

/* ── Exported career data ──────────────────────────────── */

export const CAREERS_DATA: CareerItem[] = Array.from(careerMap.entries()).map(
  ([id, data]) => ({
    id,
    title: data.title,
    description: data.description,
    icon: data.icon,
    category: data.category,
    relatedMajors: data.relatedMajors,
    skillsFromMajors: Array.from(data.skillsFromMajors),
  })
);

/* ── Career categories (derived from CATEGORIES) ───────── */

export const CAREER_CATEGORIES = CATEGORIES.map((cat) => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  bg: cat.bg,
  iconColor: cat.iconColor,
}));
