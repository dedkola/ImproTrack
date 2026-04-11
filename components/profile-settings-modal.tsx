"use client";

import { ProfileSettingsCard } from "@/components/profile-settings-card";

type ProfileSettingsModalProps = {
  onClose: () => void;
};

export function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-sm">
        <ProfileSettingsCard variant="modal" onClose={onClose} />
      </div>
    </div>
  );
}
