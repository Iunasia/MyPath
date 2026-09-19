"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  Save,
  UserCircle,
  Mail,
  Calendar,
  Camera,
  MapPin,
  Globe,
  Cake,
  Users,
  Lock,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import { Button, Badge } from "@/app/components/ui";
import Avatar from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BIO_LENGTH = 500;
const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"] as const;

const INPUT_CLS =
  "w-full px-4 py-3 rounded-md border border-sky/25 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky/40 focus:border-sky transition-[border-color,box-shadow] font-medium";

const LABEL_CLS = "block text-xs font-extrabold uppercase tracking-wider text-blue-ink mb-1.5";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Phnom_Penh",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Validate a URL field. Returns an error message or empty. */
const validateUrl = (value: string, label = "URL"): string => {
  if (!value.trim()) return "";
  try {
    const u = new URL(value.trim());
    if (!u.protocol.startsWith("http")) return `Enter a full ${label} starting with https://`;
    return "";
  } catch {
    return `Enter a full ${label} starting with https://`;
  }
};

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { user, loading: authLoading, updateProfile, uploadAvatar, removeAvatar, changePassword } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    setWebsite(user.website ?? "");
    setDateOfBirth(user.date_of_birth ?? "");
    setGender(user.gender ?? "");
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("nameRequired"));
      return;
    }

    const websiteError = validateUrl(website, t("websiteLabel"));
    if (websiteError) {
      setError(t("websiteInvalid"));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: trimmedName,
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        date_of_birth: dateOfBirth,
        gender,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(t("passwordMismatch"));
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setPwSaving(false);
    }
  }

  async function handleAvatarSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError("");
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError(t("avatarTypeError"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t("avatarSizeError"));
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarError("");
    setAvatarUploading(true);
    try {
      await removeAvatar();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setAvatarUploading(false);
    }
  }

  const trimmedName = name.trim();
  const isUnchanged =
    !!user &&
    trimmedName === user.name &&
    bio.trim() === (user.bio ?? "") &&
    location.trim() === (user.location ?? "") &&
    website.trim() === (user.website ?? "") &&
    dateOfBirth === (user.date_of_birth ?? "") &&
    gender === (user.gender ?? "");

  const isLocalAccount = user?.auth_provider === "local";

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">
        <div className="w-full pb-16 flex flex-col gap-10 max-w-2xl mx-auto">
          <section className="text-center pt-4">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.15] mb-3">
              {t("heading")}
            </h1>
            <p className="text-sm sm:text-base text-gray-body font-medium max-w-xl mx-auto">
              {t("subheading")}
            </p>
          </section>

          {authLoading ? (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-soft">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span className="text-sm font-semibold">{tCommon("loading")}</span>
            </div>
          ) : !user ? (
            <section className="bg-white rounded-lg p-6 sm:p-8 border border-sky/15 text-center">
              <p className="font-bold text-blue-ink mb-2">{t("signInToView")}</p>
              <p className="text-sm text-gray-body font-medium mb-5">
                {t("signInToViewDesc")}
              </p>
              <Button href="/auth/signin?next=/profile" size="md">
                {tCommon("signIn")}
              </Button>
            </section>
          ) : (
            <>
              <section className="bg-white rounded-lg p-6 sm:p-8 border border-sky/15">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative mx-auto sm:mx-0 shrink-0">
                    <Avatar user={user} size={80} className="text-2xl" />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-sky/25 flex items-center justify-center cursor-pointer"
                      aria-label={t("changePhoto")}
                    >
                      {avatarUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-deep" aria-hidden="true" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-sky-deep" aria-hidden="true" />
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleAvatarSelect}
                      disabled={avatarUploading}
                    />
                  </div>

                  <div className="min-w-0 text-center sm:text-left">
                    <h2 className="font-display text-xl sm:text-2xl font-bold truncate">
                      {user.name}
                    </h2>
                    <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-soft font-medium mt-1 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      {user.email}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <Badge tone="teal">
                        {user.role === "admin" ? t("role.admin") : t("role.student")}
                      </Badge>
                      {user.auth_provider === "google" && (
                        <Badge tone="outline">{t("signedInWithGoogle")}</Badge>
                      )}
                    </div>

                    <p className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-gray-soft font-medium mt-3">
                      <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      {t("memberSince", { date: formatDate(user.created_at) })}
                    </p>

                    {(user.avatar_url || user.avatar_updated_at) && (
                      <button
                        type="button"
                        onClick={handleAvatarRemove}
                        disabled={avatarUploading}
                        className="text-xs font-bold text-sky-deep hover:underline mt-3 disabled:opacity-50"
                      >
                        {t("removePhoto")}
                      </button>
                    )}
                  </div>
                </div>

                {avatarError && (
                  <div
                    role="alert"
                    className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium mt-4"
                  >
                    {avatarError}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-lg p-6 sm:p-8 border border-sky/15">
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-sky-deep" aria-hidden="true" />
                  {t("editSection")}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className={LABEL_CLS}>
                      {t("nameLabel")}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setSuccess(false);
                      }}
                      maxLength={100}
                      placeholder={t("namePlaceholder")}
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="bio" className={LABEL_CLS + " mb-0"}>
                        {t("bioLabel")}
                      </label>
                      <span className="text-[11px] text-gray-soft font-medium">
                        {bio.length}/{MAX_BIO_LENGTH}
                      </span>
                    </div>
                    <textarea
                      id="bio"
                      name="bio"
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value);
                        setSuccess(false);
                      }}
                      maxLength={MAX_BIO_LENGTH}
                      rows={3}
                      placeholder={t("bioPlaceholder")}
                      className={INPUT_CLS + " resize-none"}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className={LABEL_CLS}>
                        <MapPin className="inline w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
                        {t("locationLabel")}
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setSuccess(false);
                        }}
                        maxLength={100}
                        placeholder={t("locationPlaceholder")}
                        className={INPUT_CLS}
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className={LABEL_CLS}>
                        <Globe className="inline w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
                        {t("websiteLabel")}
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="text"
                        value={website}
                        onChange={(e) => {
                          setWebsite(e.target.value);
                          setSuccess(false);
                        }}
                        maxLength={200}
                        placeholder={t("websitePlaceholder")}
                        className={INPUT_CLS}
                      />
                    </div>

                    <div>
                      <label htmlFor="dateOfBirth" className={LABEL_CLS}>
                        <Cake className="inline w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
                        {t("dateOfBirthLabel")}
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        max={todayIso()}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value);
                          setSuccess(false);
                        }}
                        className={INPUT_CLS}
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className={LABEL_CLS}>
                        <Users className="inline w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
                        {t("genderLabel")}
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value);
                          setSuccess(false);
                        }}
                        className={INPUT_CLS}
                      >
                        <option value="">{t("genderPlaceholder")}</option>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {t(`gender.${option}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium"
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      role="status"
                      className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium"
                    >
                      {t("saveSuccess")}
                    </div>
                  )}

                  <Button type="submit" loading={saving} disabled={!trimmedName || isUnchanged || saving}>
                    <Save className="w-4 h-4" aria-hidden="true" />
                    {saving ? t("saving") : t("saveChanges")}
                  </Button>
                </form>
              </section>

              {isLocalAccount && (
                <section className="bg-white rounded-lg p-6 sm:p-8 border border-sky/15">
                  <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-sky-deep" aria-hidden="true" />
                    {t("changePasswordSection")}
                  </h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className={LABEL_CLS}>
                        {t("currentPasswordLabel")}
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPwSuccess(false);
                        }}
                        autoComplete="current-password"
                        className={INPUT_CLS}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="newPassword" className={LABEL_CLS}>
                          {t("newPasswordLabel")}
                        </label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPwSuccess(false);
                          }}
                          autoComplete="new-password"
                          className={INPUT_CLS}
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={LABEL_CLS}>
                          {t("confirmNewPasswordLabel")}
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPwSuccess(false);
                          }}
                          autoComplete="new-password"
                          className={INPUT_CLS}
                        />
                      </div>
                    </div>

                    {pwError && (
                      <div
                        role="alert"
                        className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium"
                      >
                        {pwError}
                      </div>
                    )}

                    {pwSuccess && (
                      <div
                        role="status"
                        className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium"
                      >
                        {t("passwordUpdateSuccess")}
                      </div>
                    )}

                    <Button
                      type="submit"
                      loading={pwSaving}
                      disabled={!currentPassword || !newPassword || !confirmPassword || pwSaving}
                    >
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      {pwSaving ? t("saving") : t("updatePassword")}
                    </Button>
                  </form>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
