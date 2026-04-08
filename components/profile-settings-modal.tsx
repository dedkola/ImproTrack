"use client";

import { useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { X, Upload, Loader2 } from "lucide-react";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { uploadUserAvatar, deleteUserAvatar } from "@/lib/firebase/storage";

type ProfileSettingsModalProps = {
  onClose: () => void;
};

export function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
  const { user } = useFirebaseAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The photo URL provided by Google Sign-In (from provider data)
  const googlePhotoUrl =
    user?.providerData.find((p) => p.providerId === "google.com")?.photoURL ??
    null;

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.photoURL ?? null,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError(null);
    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  function handleRemoveAvatar() {
    setPendingFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleUseGooglePhoto() {
    if (!googlePhotoUrl) return;
    setPendingFile(null);
    setPreviewUrl(googlePhotoUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!user) return;
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      let photoURL = user.photoURL;

      if (pendingFile) {
        // Upload a new custom avatar
        photoURL = await uploadUserAvatar(user.uid, pendingFile);
      } else if (previewUrl === googlePhotoUrl) {
        // Restoring the Google provider photo — no upload, just use the URL
        photoURL = googlePhotoUrl;
      } else if (previewUrl === null && user.photoURL) {
        // Explicitly removed avatar
        await deleteUserAvatar(user.uid);
        photoURL = null;
      }

      await updateProfile(getFirebaseAuth().currentUser!, {
        displayName: displayName.trim() || null,
        photoURL,
      });

      setSuccess(true);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const initial = (displayName || user?.email || "M")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.14)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-[16px] font-semibold text-ink-950">
            Profile Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-black/[0.05] hover:text-ink-950 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile avatar"
                className="h-20 w-20 rounded-2xl object-cover border border-black/[0.08]"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-[#6D28D9] to-[#C026D3] text-[28px] font-semibold text-white select-none">
                {initial}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload avatar"
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Upload className="h-5 w-5 text-white" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[12px] font-medium text-[#6D28D9] hover:underline"
            >
              Upload photo
            </button>
            {googlePhotoUrl && previewUrl !== googlePhotoUrl && (
              <>
                <span className="text-ink-400 text-[12px]">·</span>
                <button
                  type="button"
                  onClick={handleUseGooglePhoto}
                  className="text-[12px] font-medium text-ink-500 hover:text-ink-950 hover:underline"
                >
                  Use Google photo
                </button>
              </>
            )}
            {previewUrl && (
              <>
                <span className="text-ink-400 text-[12px]">·</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-[12px] font-medium text-ink-500 hover:text-red-600 hover:underline"
                >
                  Remove
                </button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {/* Display name */}
        <div className="mb-6">
          <label
            htmlFor="profile-display-name"
            className="block text-[12px] font-semibold text-ink-600 mb-1.5"
          >
            Display name
          </label>
          <input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-[14px] text-ink-950 placeholder:text-ink-400 outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/20 transition-shadow"
          />
        </div>

        {/* Error / Success */}
        {error && (
          <p className="mb-4 text-[12px] leading-5 text-red-700">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-[12px] leading-5 text-emerald-700">
            Profile saved!
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-10 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 hover:bg-black/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex-1 min-h-10 rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-1.5 transition-opacity"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
