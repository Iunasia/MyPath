/**
 * Screen-reader / keyboard skip link to jump straight to the main content.
 * Renders a tiny inline text atom used by [locale]/auth pages too.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:border focus:border-sky/30 focus:bg-sky-deep focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:outline-none"
    >
      Skip to main content
    </a>
  );
}