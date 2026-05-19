import type { AppLocale } from "@/i18n/routing";
import { TRAVEL_IMAGE_URLS } from "@/lib/travelImageUrls";

export type GuideTourCard = {
  title: string;
  location: string;
  badge: string;
  duration: string;
  categories: string;
  price: string;
  image: string;
};

export type GuideArticleCard = {
  title: string;
  excerpt: string;
  badge: string;
  readTime: string;
  date: string;
  image: string;
  href?: string;
};

const TOURS: Record<AppLocale, GuideTourCard[]> = {
  vi: [
    {
      title: "Sapa Trekking 2N1Đ",
      location: "Sapa, Lào Cai",
      badge: "Bán chạy",
      duration: "2 ngày 1 đêm",
      categories: "Trekking, Văn hóa",
      price: "Từ 2.250.000 VND",
      image: TRAVEL_IMAGE_URLS.terraces,
    },
    {
      title: "Hạ Long trong ngày",
      location: "Quảng Ninh",
      badge: "Yêu thích",
      duration: "1 ngày",
      categories: "Biển đảo, Thuyền kayak",
      price: "Từ 1.890.000 VND",
      image: TRAVEL_IMAGE_URLS.boats,
    },
    {
      title: "Huế — Cố đô & sông Hương",
      location: "Huế, Bắc Trung Bộ",
      badge: "Bán chạy",
      duration: "3 ngày 2 đêm",
      categories: "Di sản, Ẩm thực",
      price: "Từ 3.400.000 VND",
      image: TRAVEL_IMAGE_URLS.oldTown,
    },
    {
      title: "Nha Trang biển xanh",
      location: "Nha Trang, Khánh Hòa",
      badge: "Mới",
      duration: "4 ngày 3 đêm",
      categories: "Biển, Resort",
      price: "Từ 4.990.000 VND",
      image: TRAVEL_IMAGE_URLS.beach,
    },
    {
      title: "Pù Luông — Thanh Hóa",
      location: "Pù Luông, Thanh Hóa",
      badge: "Yêu thích",
      duration: "2 ngày 1 đêm",
      categories: "Cảnh quan, Chụp ảnh",
      price: "Từ 2.050.000 VND",
      image: TRAVEL_IMAGE_URLS.mountains,
    },
  ],
  en: [
    {
      title: "Sapa Trekking 2D1N",
      location: "Sa Pa, Lao Cai",
      badge: "Best seller",
      duration: "2 days 1 night",
      categories: "Trekking, Culture",
      price: "From 2,250,000 VND",
      image: TRAVEL_IMAGE_URLS.terraces,
    },
    {
      title: "Ha Long day trip",
      location: "Quang Ninh",
      badge: "Favorite",
      duration: "1 day",
      categories: "Islands, Kayaking",
      price: "From 1,890,000 VND",
      image: TRAVEL_IMAGE_URLS.boats,
    },
    {
      title: "Hue — Imperial city & Perfume River",
      location: "Hue, North Central Coast",
      badge: "Best seller",
      duration: "3 days 2 nights",
      categories: "Heritage, Food",
      price: "From 3,400,000 VND",
      image: TRAVEL_IMAGE_URLS.oldTown,
    },
    {
      title: "Nha Trang blue sea",
      location: "Nha Trang, Khanh Hoa",
      badge: "New",
      duration: "4 days 3 nights",
      categories: "Beach, Resort",
      price: "From 4,990,000 VND",
      image: TRAVEL_IMAGE_URLS.beach,
    },
    {
      title: "Pu Luong — Thanh Hoa",
      location: "Pu Luong, Thanh Hoa",
      badge: "Favorite",
      duration: "2 days 1 night",
      categories: "Scenery, Photography",
      price: "From 2,050,000 VND",
      image: TRAVEL_IMAGE_URLS.mountains,
    },
  ],
  ko: [
    {
      title: "사파 트레킹 2박 1일",
      location: "사파, 라오까이",
      badge: "베스트셀러",
      duration: "2일 1박",
      categories: "트레킹, 문화",
      price: "2,250,000 VND부터",
      image: TRAVEL_IMAGE_URLS.terraces,
    },
    {
      title: "하롱 당일 투어",
      location: "꽝닌",
      badge: "인기",
      duration: "1일",
      categories: "섬, 카약",
      price: "1,890,000 VND부터",
      image: TRAVEL_IMAGE_URLS.boats,
    },
    {
      title: "후에 — 고도 & 향강",
      location: "후에, 북중부",
      badge: "베스트셀러",
      duration: "3일 2박",
      categories: "유산, 미식",
      price: "3,400,000 VND부터",
      image: TRAVEL_IMAGE_URLS.oldTown,
    },
    {
      title: "나트랑 푸른 바다",
      location: "나트랑, 카인호아",
      badge: "신규",
      duration: "4일 3박",
      categories: "해변, 리조트",
      price: "4,990,000 VND부터",
      image: TRAVEL_IMAGE_URLS.beach,
    },
    {
      title: "푸루옹 — 타인호아",
      location: "푸루옹, 타인호아",
      badge: "인기",
      duration: "2일 1박",
      categories: "풍경, 사진",
      price: "2,050,000 VND부터",
      image: TRAVEL_IMAGE_URLS.mountains,
    },
  ],
};

const ARTICLES: Record<AppLocale, GuideArticleCard[]> = {
  vi: [
    {
      title: "Mùa vàng ở Mù Cang Chải — những điều cần biết",
      excerpt:
        "Thời điểm lý tưởng, lộ trình gợi ý và mẹo chụp ảnh ruộng bậc thang trong một chuyến đi.",
      badge: "Cẩm nang",
      readTime: "15 phút đọc",
      date: "20/05/2026",
      image: TRAVEL_IMAGE_URLS.terraces,
      href: "/guides",
    },
    {
      title: "Mẹo đặt homestay Hội An",
      excerpt: "So sánh khu phố cổ và biển An Bàng, thời điểm đặt phòng rẻ hơn.",
      badge: "Khách sạn",
      readTime: "8 phút đọc",
      date: "12/05/2026",
      image: TRAVEL_IMAGE_URLS.oldTown,
      href: "/guides",
    },
    {
      title: "Lịch trình 1 ngày khám phá cố đô Huế",
      excerpt: "Điểm tham quan nổi bật, phương tiện di chuyển và gợi ý thời gian hợp lý trong ngày.",
      badge: "Cẩm nang",
      readTime: "12 phút đọc",
      date: "02/05/2026",
      image: TRAVEL_IMAGE_URLS.landscape,
      href: "/guides",
    },
    {
      title: "Đi Sapa mùa đông — lưu ý sức khỏe",
      excerpt: "Trang phục, độ cao và cách tránh say xe trên đèo.",
      badge: "Lưu ý",
      readTime: "10 phút đọc",
      date: "28/04/2026",
      image: TRAVEL_IMAGE_URLS.beach,
      href: "/guides",
    },
    {
      title: "Di chuyển Hà Nội — Ninh Bình",
      excerpt: "Tàu, xe khách và thuê xe máy — ưu nhược từng cách.",
      badge: "Di chuyển",
      readTime: "6 phút đọc",
      date: "15/04/2026",
      image: TRAVEL_IMAGE_URLS.mountains,
      href: "/guides",
    },
  ],
  en: [
    {
      title: "Golden season in Mu Cang Chai — what to know",
      excerpt: "Best timing, sample routes and terrace photo tips for your trip.",
      badge: "Handbook",
      readTime: "15 min read",
      date: "20/05/2026",
      image: TRAVEL_IMAGE_URLS.terraces,
      href: "/guides",
    },
    {
      title: "Tips for booking Hoi An homestays",
      excerpt: "Old town vs An Bang beach and when rooms are cheaper.",
      badge: "Hotels",
      readTime: "8 min read",
      date: "12/05/2026",
      image: TRAVEL_IMAGE_URLS.oldTown,
      href: "/guides",
    },
    {
      title: "One-day Hue imperial city itinerary",
      excerpt: "Highlights, transport and a realistic hour-by-hour plan.",
      badge: "Handbook",
      readTime: "12 min read",
      date: "02/05/2026",
      image: TRAVEL_IMAGE_URLS.landscape,
      href: "/guides",
    },
    {
      title: "Sapa in winter — health notes",
      excerpt: "Clothing, altitude and avoiding motion sickness on mountain roads.",
      badge: "Notes",
      readTime: "10 min read",
      date: "28/04/2026",
      image: TRAVEL_IMAGE_URLS.beach,
      href: "/guides",
    },
    {
      title: "Hanoi to Ninh Binh transport",
      excerpt: "Train, bus and motorbike rental — pros and cons of each.",
      badge: "Transport",
      readTime: "6 min read",
      date: "15/04/2026",
      image: TRAVEL_IMAGE_URLS.mountains,
      href: "/guides",
    },
  ],
  ko: [
    {
      title: "무캉차이 황금 시즌 — 알아둘 점",
      excerpt: "최적 시기, 추천 코스와 계단식 논 사진 팁.",
      badge: "가이드",
      readTime: "15분 읽기",
      date: "20/05/2026",
      image: TRAVEL_IMAGE_URLS.terraces,
      href: "/guides",
    },
    {
      title: "호이안 홈스테이 예약 팁",
      excerpt: "구시가지 vs 안방 해변, 저렴한 예약 시기.",
      badge: "숙소",
      readTime: "8분 읽기",
      date: "12/05/2026",
      image: TRAVEL_IMAGE_URLS.oldTown,
      href: "/guides",
    },
    {
      title: "후에 고도 1일 일정",
      excerpt: "핵심 명소, 이동 수단과 하루 동선 제안.",
      badge: "가이드",
      readTime: "12분 읽기",
      date: "02/05/2026",
      image: TRAVEL_IMAGE_URLS.landscape,
      href: "/guides",
    },
    {
      title: "겨울 사파 — 건강 주의",
      excerpt: "복장, 고도, 산길 멀미 예방.",
      badge: "주의",
      readTime: "10분 읽기",
      date: "28/04/2026",
      image: TRAVEL_IMAGE_URLS.beach,
      href: "/guides",
    },
    {
      title: "하노이–닌빈 이동",
      excerpt: "기차, 버스, 오토바이 렌탈 비교.",
      badge: "이동",
      readTime: "6분 읽기",
      date: "15/04/2026",
      image: TRAVEL_IMAGE_URLS.mountains,
      href: "/guides",
    },
  ],
};

export function getGuideTours(locale: AppLocale): GuideTourCard[] {
  return TOURS[locale] ?? TOURS.vi;
}

export function getGuideArticles(locale: AppLocale): GuideArticleCard[] {
  return ARTICLES[locale] ?? ARTICLES.vi;
}
