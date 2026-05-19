/**
 * Hero trang chủ — headline, bài viết được xem nhiều nhất (Firestore `viewCount`), thời tiết & bản đồ theo khu vực bài đó.
 *
 * Chức năng:
 * - Lấy bài `approved` có `viewCount` cao nhất; làm mới khi quay lại tab và định kỳ ~2 phút.
 * - Geocode theo `region`/`country` của bài → `place` → OpenWeather tại đó; bản đồ: điểm đến ngay cả khi chờ GPS, lộ trình khi có vị trí thiết bị.
 */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { useLocalizedPost } from "@/hooks/useLocalizedPost";
import type { AppLocale } from "@/i18n/routing";
import type { LocalizedString } from "@/lib/i18n/types";
import dynamic from "next/dynamic";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";

function HeroMapLoading() {
  const t = useTranslations("Hero");
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-black/25 px-4 text-center text-xs text-white/55">
      {t("mapLoading")}
    </div>
  );
}

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => <HeroMapLoading />,
});

type Place = {
  title: string;
  location: string;
  image: string;
  lat: number;
  lon: number;
  description: string;
};

type Weather = {
  temp: number;
  feels: number;
  condition: string;
};

type PopularPost = {
  id: string;
  name?: string | LocalizedString;
  title?: string | LocalizedString;
  description?: string | LocalizedString;
  image?: string;
  region?: string;
  country?: string;
  /** Lượt xem thực tế từ Firestore (`increment` trên trang chi tiết) */
  viewCount?: number;
  views?: number;
  number?: number;
};

type TransportOption = {
  mode: "airplane" | "car" | "motorbike" | "train";
  etaMinutes: number;
  estimatedCostK: number;
};

type GeoStatus = "pending" | "device" | "fallback";

const FALLBACK_USER_GEO = { lat: 10.7769, lon: 106.7009 };

const FEATURE_CARD =
  "rounded-2xl border border-white/20 bg-white/[0.07] text-white shadow-xl backdrop-blur-xl";

const HOI_AN_DEFAULT = {
  id: "",
  title: "Cố đô Huế",
  description:
    "Di sản UNESCO, sông Hương và ẩm thực cung đình — điểm đến nổi bật tại miền Trung.",
  image: "https://images.unsplash.com/photo-1583417319070-08ee3d0dde43?auto=format&fit=crop&w=900&q=80",
  region: "Huế",
  country: "Vietnam",
  viewCount: 0,
} satisfies PopularPost;

const INITIAL_PLACE: Place = {
  title: "Khám phá Hội An",
  location: "Việt Nam",
  image: HOI_AN_DEFAULT.image!,
  lat: 15.8801,
  lon: 108.338,
  description: HOI_AN_DEFAULT.description!,
};

const Hero = () => {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Hero");
  const tc = useTranslations("Common");
  const geoLang = locale === "ko" ? "ko" : locale === "en" ? "en" : "vi";
  /** Khởi tạo ngay — tránh SSR/first paint không có hero (trước đây `place` là null tới khi useEffect chạy). */
  const [place, setPlace] = useState<Place>(INITIAL_PLACE);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [userWeather, setUserWeather] = useState<Weather | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("pending");
  const [userPlaceName, setUserPlaceName] = useState("");
  const [topPost, setTopPost] = useState<PopularPost | null>(null);
  const [loadingTopPost, setLoadingTopPost] = useState(true);
  const [aiTransport, setAiTransport] = useState<"driving" | "walking" | "cycling">("driving");
  const [travelInsight, setTravelInsight] = useState("");
  const [aiHeadline, setAiHeadline] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [transportPlan, setTransportPlan] = useState<TransportOption[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(FALLBACK_USER_GEO);
      setGeoStatus("fallback");
      return;
    }
    setGeoStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoStatus("device");
      },
      () => {
        setUserLocation(FALLBACK_USER_GEO);
        setGeoStatus("fallback");
      },
      { enableHighAccuracy: true, maximumAge: 120_000, timeout: 18_000 },
    );
  }, []);

  useEffect(() => {
    if (geoStatus !== "device" || !userLocation) {
      setUserPlaceName("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation.lat}&longitude=${userLocation.lon}&localityLanguage=${geoLang}`,
        );
        const data = await res.json();
        if (cancelled) return;
        const label =
          [data.city, data.principalSubdivision].filter(Boolean).join(", ") ||
          data.locality ||
          t("yourLocation");
        setUserPlaceName(label);
      } catch {
        if (!cancelled) setUserPlaceName(t("yourLocation"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userLocation, geoStatus, geoLang, t]);

  useEffect(() => {
    if (geoStatus !== "device" || !userLocation || !process.env.NEXT_PUBLIC_WEATHER_KEY) {
      setUserWeather(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`,
        );
        const data = await res.json();
        if (cancelled || !data?.main) return;
        setUserWeather({
          temp: Math.round(data.main.temp),
          feels: Math.round(data.main.feels_like),
          condition: data.weather?.[0]?.main ?? "",
        });
      } catch {
        if (!cancelled) setUserWeather(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userLocation, geoStatus]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_WEATHER_KEY;
    if (!key) return;
    (async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${place.lat}&lon=${place.lon}&units=metric&appid=${key}`,
        );
        const data = await res.json();
        if (!data?.main) return;
        setWeather({
          temp: Math.round(data.main.temp),
          feels: Math.round(data.main.feels_like),
          condition: data.weather?.[0]?.main ?? "",
        });
      } catch {
        /* no key / network */
      }
    })();
  }, [place]);

  useEffect(() => {
    const run = async () => {
      if (!topPost) return;
      const queryText = [topPost.region, topPost.country || "Vietnam"].filter(Boolean).join(", ");
      try {
        const geocodeRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryText)}&count=1&language=${geoLang}&format=json`,
        );
        const geocodeData = await geocodeRes.json();
        const result = geocodeData?.results?.[0];
        if (result?.latitude && result?.longitude) {
          const postTitle =
            pickLocalized(topPost.title ?? topPost.name, locale) ||
            t("explorePlace", { place: topPost.region || tc("vietnam") });
          setPlace({
            title: postTitle,
            location: result.name || topPost.region || tc("vietnam"),
            image: topPost.image || HOI_AN_DEFAULT.image!,
            lat: result.latitude,
            lon: result.longitude,
            description:
              pickLocalized(topPost.description, locale) || t("featuredDesc"),
          });
        }
      } catch {
        /* keep default place */
      }
    };
    run();
  }, [topPost, locale, geoLang, t, tc]);

  useEffect(() => {
    if (!userLocation) {
      setDistanceKm(null);
      setTransportPlan([]);
      setTravelInsight("");
      setAiHeadline("");
      return;
    }

    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(place.lat - userLocation.lat);
    const dLon = toRad(place.lon - userLocation.lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.lat)) *
        Math.cos(toRad(place.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    setDistanceKm(dist);
    setAiTransport("driving");

    const plan: TransportOption[] = [
      {
        mode: "airplane",
        etaMinutes: Math.max(55, Math.round((dist / 700) * 60 + 150)),
        estimatedCostK: Math.max(650, Math.round(dist * 2.8)),
      },
      {
        mode: "car",
        etaMinutes: Math.max(12, Math.round((dist / 55) * 60)),
        estimatedCostK: Math.max(80, Math.round(dist * 12)),
      },
      {
        mode: "motorbike",
        etaMinutes: Math.max(15, Math.round((dist / 40) * 60)),
        estimatedCostK: Math.max(40, Math.round(dist * 4.2)),
      },
      {
        mode: "train",
        etaMinutes: Math.max(35, Math.round((dist / 65) * 60 + 20)),
        estimatedCostK: Math.max(120, Math.round(dist * 2.2)),
      },
    ];
    setTransportPlan(plan);

    const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
    const destLabel = place.location;
    const destForHeadline = geoStatus === "fallback" ? tc("vietnam") : destLabel;
    const originNote =
      geoStatus === "device"
        ? userPlaceName
          ? t("originFromPlace", { place: userPlaceName })
          : t("originFromGps")
        : t("originNoGps");
    setAiHeadline(t("aiHeadlineTo", { origin: originNote, dest: destForHeadline }));
    const eta = fmt(plan[0].etaMinutes);
    const km = dist.toFixed(1);
    setTravelInsight(
      geoStatus === "fallback"
        ? t("travelInsightFallback", { km, eta })
        : t("travelInsightDevice", {
            place: userPlaceName || t("yourLocation"),
            km,
            eta,
          }),
    );
  }, [userLocation, place, geoStatus, userPlaceName, t, tc]);

  useEffect(() => {
    let alive = true;
    const postViewScore = (p: PopularPost) =>
      Number(p.viewCount ?? p.views ?? p.number ?? 0);

    const loadTopPost = async (showSpinner: boolean) => {
      if (showSpinner) setLoadingTopPost(true);
      try {
        let data: PopularPost[] = [];
        try {
          const qFast = query(
            collection(db, "posts"),
            where("status", "==", "approved"),
            orderBy("viewCount", "desc"),
            limit(5),
          );
          const snap = await getDocs(qFast);
          data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PopularPost[];
        } catch {
          const qCap = query(collection(db, "posts"), where("status", "==", "approved"), limit(120));
          const snap = await getDocs(qCap);
          data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PopularPost[];
          data.sort((a, b) => postViewScore(b) - postViewScore(a));
        }
        const sorted = [...data].sort((a, b) => postViewScore(b) - postViewScore(a));
        if (alive) setTopPost(sorted[0] ?? null);
      } catch {
        if (alive) setTopPost(null);
      } finally {
        if (alive && showSpinner) setLoadingTopPost(false);
      }
    };

    void loadTopPost(true);

    const onVisible = () => {
      if (document.visibilityState === "visible") void loadTopPost(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    const intervalId = window.setInterval(() => void loadTopPost(false), 120_000);

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(intervalId);
    };
  }, []);

  const displayPost: PopularPost = topPost ?? HOI_AN_DEFAULT;
  const localizedTop = useLocalizedPost(topPost);
  const featuredTitle = topPost
    ? localizedTop.title || t("featuredFallbackTitle")
    : t("defaultHeadline");
  const featuredDescription = topPost
    ? localizedTop.description || t("communityStoryDesc")
    : t("defaultDesc");
  const visitCount = Number(displayPost.viewCount ?? displayPost.views ?? displayPost.number ?? 0);
  const featuredHref = topPost?.id ? `/posts/${topPost.id}` : "/explore";

  const regionLabel = (displayPost.region ?? "").trim();
  const provinceForFeatured = regionLabel
    ? VIETNAM_PROVINCES.find((p) => p.name === regionLabel)
    : undefined;
  /** Đã khớp tỉnh trong catalog → chỉ dùng ảnh catalog (có thể rỗng); chưa khớp → ảnh bài / mặc định. */
  const featuredCardImage = provinceForFeatured
    ? provinceForFeatured.image
    : (displayPost.image || place.image || HOI_AN_DEFAULT.image!);

  /** Thời tiết gọi theo tọa độ `place` — luôn gắn với khu vực bài đang nổi bật */
  const weatherDestinationLine =
    place.location && place.location !== "Việt Nam"
      ? place.location
      : displayPost.region || displayPost.country || "Việt Nam";

  const mapModeLabel: Record<typeof aiTransport, string> = {
    driving: t("mapModeDriving"),
    walking: t("mapModeWalking"),
    cycling: t("mapModeCycling"),
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-stretch py-8 sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_auto_auto]">
          {/* Bài viết nổi bật — chiếm 2 hàng bên trái */}
          <div
            className={`${FEATURE_CARD} p-5 sm:p-6 lg:p-8 lg:row-span-2 lg:row-start-1 lg:col-start-1`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                {t("topPost")}
              </p>
              {loadingTopPost && (
                <span className="text-[10px] text-white/40">{t("updating")}</span>
              )}
            </div>

            <div className="grid items-center gap-5 md:grid-cols-2 md:gap-6">
                <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15 md:order-1">
                  {featuredCardImage.trim() ? (
                    <Image
                      src={featuredCardImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 380px"
                      priority
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-white/[0.08] text-[11px] text-white/40"
                      aria-hidden
                    >
                      {t("noFeaturedImage")}
                    </div>
                  )}
                </div>
                <div className="order-1 flex flex-col gap-4 md:order-2">
                  <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2rem] lg:leading-snug">
                    {featuredTitle}
                  </h1>
                  <p className="line-clamp-5 text-sm leading-relaxed text-white/85 sm:text-base">
                    {featuredDescription}
                  </p>
                  <p className="text-xs text-white/60">
                    {displayPost.region || tc("vietnam")} • {t("views", { count: visitCount.toLocaleString("vi-VN") })}
                  </p>
                  <Link
                    href={featuredHref}
                    className="w-fit rounded-xl bg-white/15 px-5 py-2.5 text-center text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25"
                  >
                    {t("readFull")}
                  </Link>
                </div>
              </div>
          </div>

          {/* Thời tiết — góc phải trên */}
          <div
            className={`${FEATURE_CARD} p-5 sm:p-5 lg:col-start-2 lg:row-start-1 self-start`}
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              {t("weather")}
            </p>
            <h3 className="text-lg font-bold text-white sm:text-xl">{weatherDestinationLine}</h3>
            <p className="mt-1 text-[11px] text-white/50">
              {t("weatherByPost")}
            </p>
            <div className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
              {weather?.temp ?? "—"}°C
            </div>
            <p className="mt-2 text-sm text-white/85">
              {t("feels")} {weather?.feels ?? "—"}°C • {weather?.condition || "—"}
            </p>

            {geoStatus === "device" && userWeather && (
              <div className="mt-4 border-t border-white/15 pt-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  {t("nearYou")}
                </p>
                <p className="text-lg font-semibold">
                  {userWeather.temp}°C
                  <span className="ml-2 text-xs font-normal text-white/65">
                    {t("feelsInline")} {userWeather.feels}°C • {userWeather.condition}
                  </span>
                </p>
                {userPlaceName && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/55">{userPlaceName}</p>
                )}
              </div>
            )}

            {geoStatus === "pending" && (
              <p className="mt-3 text-[11px] text-white/55">{t("gpsLocating")}</p>
            )}

            {geoStatus === "fallback" && (
              <p className="mt-4 text-xs leading-relaxed text-amber-200/95">
                {t("gpsEnableHint")}
              </p>
            )}
          </div>

          {/* Bản đồ — phải giữa */}
          <div className={`${FEATURE_CARD} p-5 lg:col-start-2 lg:row-start-2 self-start`}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              {t("map")}
            </p>
            <p className="mb-3 text-[11px] text-white/55">
              {geoStatus === "pending" ? t("mapPending") : t("mapRoute")}
            </p>
            <div className="aspect-[4/3] w-full max-h-[280px] overflow-hidden rounded-xl border border-white/10 sm:max-h-[320px] lg:max-h-none lg:aspect-square">
              <RouteMap
                userLocation={geoStatus === "pending" ? null : userLocation}
                place={place}
                transportMode={aiTransport}
              />
            </div>
          </div>

          {/* AI — full width dưới cùng */}
          <div className={`${FEATURE_CARD} p-5 sm:p-6 lg:col-span-2 lg:row-start-3`}>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              {t("aiTitle")}
            </p>
            {aiHeadline && (
              <p className="text-sm font-medium leading-relaxed text-white/90">{aiHeadline}</p>
            )}
            <p className={`text-sm leading-relaxed text-white/85 ${aiHeadline ? "mt-2" : ""}`}>
              {travelInsight || t("calculating")}
            </p>
            <p className="mt-3 text-xs text-white/60">
              {distanceKm !== null
                ? t("distanceLine", { km: distanceKm.toFixed(1), mode: mapModeLabel[aiTransport] })
                : userLocation
                  ? t("calculatingShort")
                  : t("awaitingCoords")}
            </p>
            {transportPlan.length > 0 && (
              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                {transportPlan.map((option, index) => (
                  <div
                    key={option.mode}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/80"
                  >
                    <span className="text-white/45">{index + 1}. </span>
                    {option.mode === "airplane" && t("plane")}
                    {option.mode === "car" && t("car")}
                    {option.mode === "motorbike" && t("moto")}
                    {option.mode === "train" && t("train")}
                    <span className="text-white/50"> — </span>~{Math.floor(option.etaMinutes / 60)}h{" "}
                    {option.etaMinutes % 60}m
                    <span className="text-white/50"> • ~</span>
                    {option.estimatedCostK.toLocaleString("vi-VN")}k VND
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
