import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function InteractiveCTA() {
  return (
    <section id="start" className="py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight mb-4 leading-tight">
          Your future deserves more than <br />
          <span className="text-sky-deep">
            a random Google search.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-gray-body font-medium leading-relaxed max-w-2xl mx-auto mb-8">
          Explore verified Cambodian universities, majors, and scholarships — or create a free student account to track deadlines and save bookmarks.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pb-8 max-w-3xl mx-auto">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#7AB3B7] px-8 py-3.5 text-sm font-extrabold text-white hover:bg-[#68A1A5] transition-all duration-200 bubble-shadow hover:-translate-y-0.5"
          >
            <span>Create Free Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border-2 border-sky/30 px-7 py-3.5 text-sm font-extrabold text-blue-ink hover:bg-sky/10 hover:border-sky transition-all duration-200"
          >
            <ShieldCheck className="w-4 h-4 text-sky-deep" />
            <span>Test Link Verifier Tool</span>
          </Link>
          <Link
            href="#explorers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-sitomo/80 border border-sky/20 px-6 py-3.5 text-sm font-bold text-sky-deep hover:bg-sitomo transition-all duration-200 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Browse All Pathways</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
