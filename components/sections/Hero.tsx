"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

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
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  region?: string;
  country?: string;
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

const HOI_AN_DEFAULT: PopularPost = {
  id: "",
  title: "Hội An về đêm",
  description:
    "Phố cổ lung linh về đêm Văn hóa giao thoa Đông – Tây Thu hút khách du lịch quốc tế",
  image: "https://media.vietravel.com/images/Content/du-lich-hoi-an-ve-dem-4.jpg",
  region: "Quảng Nam",
  country: "Vietnam",
  views: 0,
};

const Hero = () => {
  const [place, setPlace] = useState<Place | null>(null);
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
    setPlace({
      title: "Khám phá Hội An",
      location: "Việt Nam",
      image: HOI_AN_DEFAULT.image!,
      lat: 15.8801,
      lon: 108.338,
      description: HOI_AN_DEFAULT.description!,
    });
  }, []);

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
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation.lat}&longitude=${userLocation.lon}&localityLanguage=vi`,
        );
        const data = await res.json();
        if (cancelled) return;
        const label =
          [data.city, data.principalSubdivision].filter(Boolean).join(", ") ||
          data.locality ||
          "Vị trí của bạn";
        setUserPlaceName(label);
      } catch {
        if (!cancelled) setUserPlaceName("Vị trí của bạn");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userLocation, geoStatus]);

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
    if (!place) return;
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
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryText)}&count=1&language=vi&format=json`,
        );
        const geocodeData = await geocodeRes.json();
        const result = geocodeData?.results?.[0];
        if (result?.latitude && result?.longitude) {
          setPlace({
            title: topPost.title || topPost.name || `Khám phá ${topPost.region || "Việt Nam"}`,
            location: result.name || topPost.region || "Việt Nam",
            image: topPost.image || HOI_AN_DEFAULT.image!,
            lat: result.latitude,
            lon: result.longitude,
            description:
              topPost.description ||
              "Điểm đến được nhiều du khách quan tâm — khám phá qua bài viết cộng đồng.",
          });
        }
      } catch {
        /* keep default place */
      }
    };
    run();
  }, [topPost]);

  useEffect(() => {
    if (!place || !userLocation) {
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
    const destForHeadline = geoStatus === "fallback" ? "Vietnam" : destLabel;
    const originNote =
      geoStatus === "device"
        ? userPlaceName
          ? `Từ ${userPlaceName}`
          : "Từ vị trí GPS của bạn"
        : "Không lấy được GPS — đang ước lượng từ điểm mặc định (TP.HCM)";
    setAiHeadline(`${originNote} đến ${destForHeadline}`);
    setTravelInsight(
      geoStatus === "fallback"
        ? `Ước lượng (không lấy được GPS — dùng điểm mặc định). Ưu tiên: máy bay → ô tô → xe máy → tàu. Khoảng cách ${dist.toFixed(1)} km. Gợi ý hiện tại: máy bay (~${fmt(plan[0].etaMinutes)}).`
        : `Ước lượng từ ${userPlaceName || "vị trí của bạn"}. Ưu tiên: máy bay → ô tô → xe máy → tàu. Khoảng cách ${dist.toFixed(1)} km. Gợi ý hiện tại: máy bay (~${fmt(plan[0].etaMinutes)}).`,
    );
  }, [userLocation, place, geoStatus, userPlaceName]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingTopPost(true);
      try {
        const q = query(collection(db, "posts"), where("status", "==", "approved"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PopularPost[];
        const sorted = data.sort(
          (a, b) => Number(b.views ?? b.number ?? 0) - Number(a.views ?? a.number ?? 0),
        );
        if (alive) setTopPost(sorted[0] ?? null);
      } catch {
        if (alive) setTopPost(null);
      } finally {
        if (alive) setLoadingTopPost(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!place) return null;

  const displayPost = topPost ?? HOI_AN_DEFAULT;
  const visitCount = Number(displayPost.views ?? displayPost.number ?? 0);
  const featuredHref = topPost?.id ? `/posts/${topPost.id}` : "/explore";

  const weatherCardTitle =
    displayPost.country && displayPost.country.toLowerCase().includes("viet")
      ? "Vietnam"
      : displayPost.country || "Vietnam";

  const mapModeLabel: Record<typeof aiTransport, string> = {
    driving: "driving",
    walking: "walking",
    cycling: "cycling",
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
                Bài viết được xem nhiều nhất
              </p>
              {loadingTopPost && (
                <span className="text-[10px] text-white/40">Đang cập nhật…</span>
              )}
            </div>

            <div className="grid items-center gap-5 md:grid-cols-2 md:gap-6">
                <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15 md:order-1">
                  <Image
                    src={displayPost.image || place.image || HOI_AN_DEFAULT.image!}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 380px"
                    priority
                  />
                </div>
                <div className="order-1 flex flex-col gap-4 md:order-2">
                  <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2rem] lg:leading-snug">
                    {displayPost.title || displayPost.name || "Điểm đến nổi bật"}
                  </h1>
                  <p className="line-clamp-5 text-sm leading-relaxed text-white/85 sm:text-base">
                    {displayPost.description ||
                      "Khám phá câu chuyện và gợi ý lịch trình từ cộng đồng du lịch."}
                  </p>
                  <p className="text-xs text-white/60">
                    {displayPost.region || "Việt Nam"} • {visitCount.toLocaleString("vi-VN")} lượt xem
                  </p>
                  <Link
                    href={featuredHref}
                    className="w-fit rounded-xl bg-white/15 px-5 py-2.5 text-center text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25"
                  >
                    Đọc bài đầy đủ
                  </Link>
                </div>
              </div>
          </div>

          {/* Thời tiết — góc phải trên */}
          <div
            className={`${FEATURE_CARD} p-5 sm:p-5 lg:col-start-2 lg:row-start-1 self-start`}
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Thời tiết
            </p>
            <h3 className="text-lg font-bold text-white sm:text-xl">{weatherCardTitle}</h3>
            <div className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
              {weather?.temp ?? "—"}°C
            </div>
            <p className="mt-2 text-sm text-white/85">
              Cảm giác {weather?.feels ?? "—"}°C • {weather?.condition || "—"}
            </p>

            {geoStatus === "device" && userWeather && (
              <div className="mt-4 border-t border-white/15 pt-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Gần vị trí bạn
                </p>
                <p className="text-lg font-semibold">
                  {userWeather.temp}°C
                  <span className="ml-2 text-xs font-normal text-white/65">
                    cảm giác {userWeather.feels}°C • {userWeather.condition}
                  </span>
                </p>
                {userPlaceName && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/55">{userPlaceName}</p>
                )}
              </div>
            )}

            {geoStatus === "pending" && (
              <p className="mt-3 text-[11px] text-white/55">Đang xác định vị trí của bạn…</p>
            )}

            {geoStatus === "fallback" && (
              <p className="mt-4 text-xs leading-relaxed text-amber-200/95">
                Bật định vị trong trình duyệt để xem thời tiết và lộ trình theo đúng chỗ bạn đang đứng.
              </p>
            )}
          </div>

          {/* Bản đồ — phải giữa */}
          <div className={`${FEATURE_CARD} p-5 lg:col-start-2 lg:row-start-2 self-start`}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Bản đồ
            </p>
            <p className="mb-3 text-[11px] text-white/55">Lộ trình đường đến điểm đang hiển thị</p>
            <div className="aspect-[4/3] w-full max-h-[280px] overflow-hidden rounded-xl border border-white/10 sm:max-h-[320px] lg:max-h-none lg:aspect-square">
              {userLocation ? (
                <RouteMap userLocation={userLocation} place={place} transportMode={aiTransport} />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center bg-black/25 px-4 text-center text-xs text-white/55">
                  Đang lấy vị trí để vẽ bản đồ…
                </div>
              )}
            </div>
          </div>

          {/* AI — full width dưới cùng */}
          <div className={`${FEATURE_CARD} p-5 sm:p-6 lg:col-span-2 lg:row-start-3`}>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              AI ước tính quãng đường &amp; thời gian
            </p>
            {aiHeadline && (
              <p className="text-sm font-medium leading-relaxed text-white/90">{aiHeadline}</p>
            )}
            <p className={`text-sm leading-relaxed text-white/85 ${aiHeadline ? "mt-2" : ""}`}>
              {travelInsight || "Đang tính toán…"}
            </p>
            <p className="mt-3 text-xs text-white/60">
              {distanceKm !== null
                ? `Khoảng cách ~${distanceKm.toFixed(1)} km • Chế độ bản đồ: ${mapModeLabel[aiTransport]}`
                : userLocation
                  ? "Đang tính…"
                  : "Đang chờ tọa độ…"}
            </p>
            {transportPlan.length > 0 && (
              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                {transportPlan.map((option, index) => (
                  <div
                    key={option.mode}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/80"
                  >
                    <span className="text-white/45">{index + 1}. </span>
                    {option.mode === "airplane" && "Máy bay"}
                    {option.mode === "car" && "Ô tô"}
                    {option.mode === "motorbike" && "Xe máy"}
                    {option.mode === "train" && "Tàu hỏa"}
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
