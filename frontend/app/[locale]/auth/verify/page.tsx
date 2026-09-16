"use client";

import { Suspense, useEffect, useState, useRef, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/src/i18n";
import { useTranslations } from "next-intl";
import { verifyEmail, checkVerificationStatus, AuthError } from "@/app/lib/auth";
import { Button } from "@/app/components/ui";
import {
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

function VerifyEmailForm() {
  const t = useTranslations("auth.verifyEmail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const codeParam = searchParams.get("code") ?? "";

  const [code, setCode] = useState(codeParam);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Ref to prevent double-submission in StrictMode
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (!email) {
      router.push("/auth/signup");
    } else if (codeParam && !hasAutoSubmitted.current) {
      // User arrived via magic link! Auto-submit the verification
      hasAutoSubmitted.current = true;
      submitVerification(codeParam);
    }
  }, [email, codeParam, router]);

  // Premium Polling: Automatically login if verified on another device (e.g. phone)
  useEffect(() => {
    if (!email || verified) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await checkVerificationStatus();
        if (res.verified) {
          clearInterval(intervalId);
          setVerified(true);
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      } catch (err) {
        // Ignore network errors during polling to prevent UI flicker
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [email, verified]);

  async function submitVerification(codeToVerify: string) {
    setError("");
    setSubmitting(true);

    try {
      await verifyEmail(email, codeToVerify.trim());
      setVerified(true);
      setTimeout(() => {
        // Force a hard reload so AuthContext picks up the new session cookie!
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      if (err instanceof AuthError && err.status === 0) {
        setError(t("networkError"));
      } else {
        setError(err instanceof Error ? err.message : t("error"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    await submitVerification(code);
  }

  return (
    <div className="relative min-h-screen bg-powder flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-soft hover:text-blue-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {tCommon("backToDomner")}
      </Link>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-deep text-white text-base font-bold font-display">
              D
            </span>
            <span className="font-display text-xl font-bold text-blue-ink">
              {tCommon("domner")}
            </span>
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-ink tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-gray-body font-medium">
            {t("subtitle", { email })}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-sky/15 bg-white p-8 bubble-shadow">
          {verified ? (
            <div
              className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-6 text-center"
              aria-live="polite"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="text-base font-extrabold text-emerald-800">
                {t("successTitle")}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-700">
                {t("successDesc")}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm font-semibold text-red-700" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-bold text-blue-ink mb-1.5"
                  >
                    {t("codeLabel")}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-faint" />
                    <input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t("codePlaceholder")}
                      className="w-full rounded-2xl border border-sky/20 bg-powder py-3 pl-11 pr-4 text-sm text-blue-ink placeholder:text-gray-faint font-medium focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <Button type="submit" loading={submitting} className="w-full">
                  {submitting ? t("verifying") : t("verify")}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-body font-medium">
                {t("resendLink")}{" "}
                <Link
                  href="/auth/signup"
                  className="font-bold text-sky-deep hover:text-blue-ink transition-colors"
                >
                  {t("resendLinkAction")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}