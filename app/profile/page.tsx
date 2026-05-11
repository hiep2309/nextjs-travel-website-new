"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileDashboard from "@/components/ProfileDashboard";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/login");
    }
  }, [loading, profile, router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] pt-20 text-white">
        <p className="text-sm text-white/60">Đang tải hồ sơ…</p>
      </div>
    );
  }

  return <ProfileDashboard profile={profile} />;
}
