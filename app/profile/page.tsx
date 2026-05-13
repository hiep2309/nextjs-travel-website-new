/**
 * Trang hồ sơ người dùng — bảo vệ route (chưa đăng nhập thì chuyển sang `/login`).
 *
 * Hiển thị ProfileDashboard: thông tin tài khoản, hoạt động đã lưu / đã xem / đánh giá (local + Firestore).
 */
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
      <div className="relative flex min-h-screen items-center justify-center pt-20 text-white">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/signup_pic.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/35 to-black/70" />
        <p className="relative text-sm text-white/80">Đang tải hồ sơ…</p>
      </div>
    );
  }

  return <ProfileDashboard profile={profile} />;
}
