import { Search, X } from "lucide-react";
import BackLink from "./BackLink";

interface ListHeroProps {
  /** The plain part of the headline. */
  title: string;
  /** The tail of the headline, picked out in teal. Sreynith's "…your future". */
  accent?: string;
  description: string;
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  /**
   * "centred" is Sreynith's big centred headline over a pill search
   * (scholarships, majors); "split" puts the title left and the search beside
   * it (careers, all majors). Both are hers — the pages used them as a pair.
   */
  variant?: "centred" | "split";
  back?: { href: string; label: string };
}

function SearchField({
  search,
  rounded,
}: {
  search: ListHeroProps["search"];
  rounded: string;
}) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-soft pointer-events-none"
        strokeWidth={2.2}
        aria-hidden="true"
      />
      <input
        type="text"
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
        placeholder={search.placeholder}
        aria-label={search.placeholder}
        className={`w-full pl-12 pr-10 py-3.5 sm:py-4 bg-white ${rounded} border border-sky/20 text-sm text-blue-ink placeholder:text-gray-soft focus:outline-none focus:ring-2 focus:ring-sky-deep/40 focus:border-sky-deep transition-all bubble-shadow-sm font-medium`}
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
  );
}

/** The top of a list page, in Sreynith's two layouts. */
export default function ListHero({
  title,
  accent,
  description,
  search,
  variant = "split",
  back,
}: ListHeroProps) {
  const headline = (
    <>
      {title}
      {accent && (
        <>
          {" "}
          <span className="text-sky-deep">{accent}</span>
        </>
      )}
    </>
  );

  if (variant === "centred") {
    return (
      <section className="mb-10 text-center max-w-3xl mx-auto w-full pt-4 sm:pt-6">
        {back && (
          <div className="flex justify-center mb-5">
            <BackLink href={back.href} label={back.label} />
          </div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] mb-4 text-balance">
          {headline}
        </h1>
        <p className="text-sm sm:text-base text-gray-soft mb-8 max-w-xl mx-auto font-medium">
          {description}
        </p>
        <div className="max-w-xl mx-auto">
          <SearchField search={search} rounded="rounded-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 lg:mb-10">
      {back && <BackLink href={back.href} label={back.label} className="mb-5" />}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-10">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-ink tracking-tight leading-[1.15] text-balance">
            {headline}
          </h1>
          <p className="text-sm sm:text-base text-gray-soft mt-3 leading-relaxed font-medium">
            {description}
          </p>
        </div>
        <div className="w-full lg:max-w-md shrink-0">
          <SearchField search={search} rounded="rounded-2xl" />
        </div>
      </div>
    </section>
  );
}
