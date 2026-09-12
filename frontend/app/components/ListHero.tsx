import { Search, X } from "lucide-react";
import BackLink from "./BackLink";

interface ListHeroProps {
  title: string;
  description: string;
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  back?: { href: string; label: string };
}

/**
 * The top of every list page: title and one line on the left, search on the
 * right. One layout, so moving between Careers, Majors, Universities and
 * Scholarships doesn't feel like four different sites.
 */
export default function ListHero({ title, description, search, back }: ListHeroProps) {
  return (
    <section className="mb-8 lg:mb-10">
      {back && <BackLink href={back.href} label={back.label} className="mb-5" />}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-10">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15]">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-soft mt-3 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <div className="relative w-full lg:max-w-md shrink-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-soft pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder}
            aria-label={search.placeholder}
            className="w-full pl-11 pr-10 py-3.5 bg-white rounded-full border border-sky/25 text-sm text-blue-ink placeholder:text-gray-soft focus:outline-none focus:ring-2 focus:ring-sky-deep/40 focus:border-sky-deep transition-all bubble-shadow-sm font-medium"
          />
          {search.value && (
            <button
              type="button"
              onClick={() => search.onChange("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-soft hover:text-blue-ink cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
