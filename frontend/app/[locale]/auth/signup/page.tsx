"use client";

import { useState, FormEvent } from "react";
import { Link, useRouter } from "@/src/i18n";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { AuthError } from "@/app/lib/auth";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const t = useTranslations("auth.signup");
  const tCommon = useTranslations("common");
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password);
      setSuccess(t("checkYourEmail"));
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      if (err instanceof AuthError && err.status === 429) {
        setError(t("tooManyAttempts"));
      } else {
        setError(err instanceof Error ? err.message : t("registrationFailed"));
      }
    } finally {
      setSubmitting(false);
    }
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
            {t("createYourAccount")}
          </h1>
          <p className="mt-2 text-sm text-gray-body font-medium">
            {t("startNavigating")}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-sky/15 bg-white p-8 bubble-shadow">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-blue-ink mb-1.5"
              >
                {t("fullName")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-faint" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  className="w-full rounded-2xl border border-sky/20 bg-powder py-3 pl-11 pr-4 text-sm text-blue-ink placeholder:text-gray-faint font-medium focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-blue-ink mb-1.5"
              >
                {t("emailAddress")}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-faint" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-2xl border border-sky/20 bg-powder py-3 pl-11 pr-4 text-sm text-blue-ink placeholder:text-gray-faint font-medium focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-blue-ink mb-1.5"
              >
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-faint" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-2xl border border-sky/20 bg-powder py-3 pl-11 pr-11 text-sm text-blue-ink placeholder:text-gray-faint font-medium focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-faint hover:text-gray-soft transition-colors"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-blue-ink mb-1.5"
              >
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-faint" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
                  className="w-full rounded-2xl border border-sky/20 bg-powder py-3 pl-11 pr-4 text-sm text-blue-ink placeholder:text-gray-faint font-medium focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#7AB3B7] py-3 text-sm font-bold text-white hover:bg-[#68A1A5] transition-colors bubble-shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? t("creatingAccount") : t("createAccount")}
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 my-6">
          <hr className="flex-1 border-sky/20" />
          <span className="text-xs font-bold text-gray-faint uppercase tracking-wider">
            {tCommon("or")}
          </span>
          <hr className="flex-1 border-sky/20" />
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-full border-2 border-sky/20 bg-white py-3 text-sm font-bold text-blue-ink hover:bg-sky/5 transition-colors bubble-shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t("continueWithGoogle")}
        </button>

        <p className="mt-6 text-center text-sm text-gray-body font-medium">
          {t("hasAccount")}{" "}
          <Link
            href="/auth/signin"
            className="font-bold text-sky-deep hover:text-blue-ink transition-colors"
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
