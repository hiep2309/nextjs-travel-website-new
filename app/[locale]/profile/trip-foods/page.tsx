"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import TripFoodsClient from "@/components/profile/TripFoodsClient";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function TripFoodsPage() {
  const t = useTranslations("Common");
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
        <p className="text-sm text-white/80">{t("loading")}</p>
      </div>
    );
  }

  return <TripFoodsClient />;
}
