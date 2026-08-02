"use client";

import { useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { Loader2, Upload, X } from "lucide-react";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { useTranslation } from "@/components/i18n-provider";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { getSafeImageUrl } from "@/lib/safe-image-url";
import { deleteUserAvatar, uploadUserAvatar } from "@/lib/firebase/storage";

type ProfileSettingsCardProps = {
  title?: string;
  description?: string;
  variant?: "page" | "modal";
  onClose?: () => void;
};

export function ProfileSettingsCard({
  title,
  description,
  variant = "page",
  onClose,
}: ProfileSettingsCardProps) {
  const { t } = useTranslation();
  const { user } = useFirebaseAuth();
  const resolvedTitle = title ?? t("profile_settings_title");
  const resolvedDescription = description ?? t("profile_settings_desc");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const googlePhotoUrl =
    user?.providerData.find((provider) => provider.providerId === "google.com")
      ?.photoURL ?? null;

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const previewImageUrl = getSafeImageUrl(previewUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearPendingPreview = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearPendingPreview();
    };
  }, []);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setPreviewUrl(user?.photoURL ?? null);
    setPendingFile(null);
    setError(null);
    setSuccess(null);
    clearPendingPreview();
  }, [user?.displayName, user?.photoURL]);

  useEffect(() => {
    const handleClose = onClose;

    if (!handleClose) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose?.();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    clearPendingPreview();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;

    setError(null);
    setSuccess(null);
    setPendingFile(file);
    setPreviewUrl(objectUrl);
  }

  function handleRemoveAvatar() {
    clearPendingPreview();
    setPendingFile(null);
    setPreviewUrl(null);
    setSuccess(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleUseGooglePhoto() {
    if (!googlePhotoUrl) return;

    clearPendingPreview();
    setPendingFile(null);
    setPreviewUrl(googlePhotoUrl);
    setSuccess(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!user) return;

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      let photoURL = user.photoURL;

      if (pendingFile) {
        photoURL = await uploadUserAvatar(user.uid, pendingFile);
      } else if (previewUrl === googlePhotoUrl) {
        photoURL = googlePhotoUrl;
      } else if (previewUrl === null && user.photoURL) {
        await deleteUserAvatar(user.uid);
        photoURL = null;
      }

      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        throw new Error("Your session expired. Please sign in again.");
      }

      await updateProfile(currentUser, {
        displayName: displayName.trim() || null,
        photoURL,
      });

      clearPendingPreview();
      setPendingFile(null);
      setPreviewUrl(photoURL ?? null);
      setSuccess("Profile saved.");

      if (variant === "modal" && onClose) {
        window.setTimeout(onClose, 800);
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Failed to save profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const initial = (displayName || user?.email || "M")
    .trim()
    .charAt(0)
    .toUpperCase();
  const actionButtonClassName =
    "pill-btn inline-flex min-h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-[12px] font-semibold text-ink-950 transition-colors hover:bg-black/[0.025]";

  const containerClassName =
    variant === "modal"
      ? "relative w-full max-w-sm rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
      : "surface-panel min-w-0 overflow-hidden rounded-[20px] p-4 sm:p-5";

  return (
    <section className={containerClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[18px] font-semibold tracking-tight text-ink-950 sm:text-[20px]">
            {resolvedTitle}
          </h2>
          {resolvedDescription ? (
            <p className="mt-1 text-[13px] leading-6 text-ink-700">
              {resolvedDescription}
            </p>
          ) : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("profile_close_settings")}
            className="tap-target-compact flex items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-black/[0.05] hover:text-ink-950"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:mt-5">
        <div>
          <div className="flex items-center gap-4">
            <div className="group relative shrink-0">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt={t("profile_avatar_alt")}
                  className="h-16 w-16 rounded-[18px] border border-black/[0.08] object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              ) : (
                <div className="primary-action flex h-16 w-16 select-none items-center justify-center rounded-[18px] text-[24px] font-semibold sm:h-[4.5rem] sm:w-[4.5rem] sm:text-[26px]">
                  {initial}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t("profile_upload_avatar")}
                className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Upload className="h-5 w-5 text-white" strokeWidth={1.5} />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-ink-950 sm:text-[16px]">
                {displayName.trim() || user?.displayName || t("profile_your_profile")}
              </p>
              <p className="mt-1 truncate text-[13px] text-ink-600">
                {user?.email ?? t("profile_signed_in_account")}
              </p>
            </div>
          </div>

          <div className="comparison-scroll -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`${actionButtonClassName} shrink-0`}
            >
              {t("profile_upload_photo")}
            </button>
            {googlePhotoUrl && previewUrl !== googlePhotoUrl ? (
              <button
                type="button"
                onClick={handleUseGooglePhoto}
                className={`${actionButtonClassName} shrink-0`}
              >
                {t("profile_use_google_photo")}
              </button>
            ) : null}
            {previewUrl ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className={`${actionButtonClassName} shrink-0 text-red-700`}
              >
                {t("profile_remove_photo")}
              </button>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label={t("profile_choose_photo")}
            onChange={handleFileChange}
          />
        </div>

        <div className="border-t border-black/[0.06] pt-4">
          <label
            htmlFor={`profile-display-name-${variant}`}
            className="mb-1.5 block text-[12px] font-semibold text-ink-700"
          >
            {t("profile_display_name")}
          </label>
          <input
            id={`profile-display-name-${variant}`}
            type="text"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setSuccess(null);
            }}
            placeholder={t("profile_your_name")}
            maxLength={60}
            className="w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-[14px] text-ink-950 outline-none transition-shadow placeholder:text-ink-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        {error ? (
          <p className="text-[12px] leading-5 text-red-700">{error}</p>
        ) : null}
        {success ? (
          <p className="text-[12px] leading-5 text-emerald-700">{success}</p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-11 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-black/[0.02]"
            >
              {t("cancel")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !user}
            className="primary-action flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-32"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("save_changes")
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
