import type { AppLocale } from "@/i18n/routing";
import { formatVnd, parseVndCost } from "@/lib/planner/parseCost";
import type { PlannerFormData, TripDay, TripPlan } from "@/lib/planner/types";

type MockDest = "danang" | "hanoi" | "haiphong" | "hcmc" | "generic";

type DayTemplate = {
  theme: Record<AppLocale, string>;
  activities: {
    time: string;
    place_name: Record<AppLocale, string>;
    description: Record<AppLocale, string>;
    estimated_cost: string;
    category: string;
    tips: Record<AppLocale, string>;
  }[];
};

type DestTemplate = {
  destination: Record<AppLocale, string>;
  tripTitle: Record<AppLocale, string>;
  days: DayTemplate[];
  hidden_gems: { name: Record<AppLocale, string>; description: Record<AppLocale, string> }[];
};

const TEMPLATES: Record<MockDest, DestTemplate> = {
  danang: {
    destination: { vi: "Đà Nẵng", en: "Da Nang", ko: "다낭" },
    tripTitle: {
      vi: "Đà Nẵng — Biển, núi & ẩm thực",
      en: "Da Nang — Beaches, hills & food",
      ko: "다낭 — 해변, 산 & 미식",
    },
    days: [
      {
        theme: {
          vi: "Khám phá biển Mỹ Khê & Sơn Trà",
          en: "My Khe Beach & Son Tra Peninsula",
          ko: "미케 해변 & 손짜 반도",
        },
        activities: [
          {
            time: "08:00",
            place_name: { vi: "Bãi biển Mỹ Khê", en: "My Khe Beach", ko: "미케 해변" },
            description: {
              vi: "Tắm biển buổi sáng, cà phê view biển.",
              en: "Morning swim and seaside coffee.",
              ko: "아침 수영과 바다 전망 카페.",
            },
            estimated_cost: "150.000 VND",
            category: "relax",
            tips: { vi: "Mang kem chống nắng.", en: "Bring sunscreen.", ko: "선크림을 챙기세요." },
          },
          {
            time: "12:00",
            place_name: { vi: "Mì Quảng Bà Mua", en: "Mi Quang Ba Mua", ko: "미꽝 바 무아" },
            description: {
              vi: "Món đặc sản Đà Nẵng.",
              en: "Da Nang noodle specialty.",
              ko: "다낭 대표 미꽝 국수.",
            },
            estimated_cost: "80.000 VND",
            category: "food",
            tips: { vi: "Gọi thêm chả.", en: "Add extra fish cake.", ko: "어묵 추가 추천." },
          },
          {
            time: "16:00",
            place_name: { vi: "Cầu Rồng", en: "Dragon Bridge", ko: "용 다리" },
            description: {
              vi: "Dạo phố sông Hàn, chụp ảnh cầu Rồng.",
              en: "Han River walk and Dragon Bridge photos.",
              ko: "한강 산책과 용 다리 사진.",
            },
            estimated_cost: "0 VND",
            category: "sightseeing",
            tips: { vi: "Cuối tuần có phun lửa.", en: "Fire show on weekends.", ko: "주말 불꽃 쇼." },
          },
        ],
      },
      {
        theme: {
          vi: "Bà Nà Hills",
          en: "Ba Na Hills day trip",
          ko: "바나힐스 당일",
        },
        activities: [
          {
            time: "09:00",
            place_name: { vi: "Bà Nà Hills", en: "Ba Na Hills", ko: "바나힐스" },
            description: {
              vi: "Cáp treo, Cầu Vàng, làng Pháp.",
              en: "Cable car, Golden Bridge, French village.",
              ko: "케이블카, 골든 브릿지, 프랑스 마을.",
            },
            estimated_cost: "900.000 VND",
            category: "adventure",
            tips: { vi: "Đặt vé online.", en: "Book tickets online.", ko: "온라인 예매." },
          },
          {
            time: "14:00",
            place_name: { vi: "Làng nghề Non Nước", en: "Non Nuoc craft village", ko: "논누억 공예 마을" },
            description: {
              vi: "Đá mỹ nghệ truyền thống.",
              en: "Traditional marble crafts.",
              ko: "대리석 공예 체험.",
            },
            estimated_cost: "100.000 VND",
            category: "culture",
            tips: { vi: "Mặc cả nhẹ nhàng.", en: "Bargain politely.", ko: "정중히 흥정." },
          },
          {
            time: "18:00",
            place_name: { vi: "Chợ đêm Helio", en: "Helio Night Market", ko: "헬리오 야시장" },
            description: {
              vi: "Ẩm thực đường phố buổi tối.",
              en: "Evening street food.",
              ko: "저녁 길거리 음식.",
            },
            estimated_cost: "200.000 VND",
            category: "food",
            tips: { vi: "Thử bánh tráng cuốn.", en: "Try rice paper rolls.", ko: "라이스페이퍼 롤." },
          },
        ],
      },
    ],
    hidden_gems: [
      {
        name: { vi: "Bán đảo Sơn Trà", en: "Son Tra Peninsula", ko: "손짜 반도" },
        description: {
          vi: "View toàn thành, ít đông hơn bãi chính.",
          en: "City views, quieter than main beaches.",
          ko: "도시 전망, 한적한 해변.",
        },
      },
    ],
  },
  hanoi: {
    destination: { vi: "Hà Nội", en: "Hanoi", ko: "하노이" },
    tripTitle: {
      vi: "Hà Nội — Phố cổ & văn hóa",
      en: "Hanoi — Old Quarter & culture",
      ko: "하노이 — 구시가 & 문화",
    },
    days: [
      {
        theme: {
          vi: "Phố cổ & hồ Hoàn Kiếm",
          en: "Old Quarter & Hoan Kiem Lake",
          ko: "구시가 & 호안끼엠 호수",
        },
        activities: [
          {
            time: "07:30",
            place_name: { vi: "Hồ Hoàn Kiếm", en: "Hoan Kiem Lake", ko: "호안끼엠 호수" },
            description: {
              vi: "Đi bộ sáng, ngắm Tháp Rùa.",
              en: "Morning walk around the lake.",
              ko: "아침 호수 산책.",
            },
            estimated_cost: "0 VND",
            category: "sightseeing",
            tips: { vi: "Mang áo khoác mỏn mùa đông.", en: "Layer up in winter.", ko: "겨울엔 겉옷." },
          },
          {
            time: "11:00",
            place_name: { vi: "Phở Thìn", en: "Pho Thin", ko: "푸띠인" },
            description: {
              vi: "Phở bò truyền thống Hà Nội.",
              en: "Classic Hanoi beef pho.",
              ko: "하노이 전통 쌀국수.",
            },
            estimated_cost: "70.000 VND",
            category: "food",
            tips: { vi: "Đến sớm tránh đông.", en: "Arrive early.", ko: "일찍 방문." },
          },
          {
            time: "15:00",
            place_name: { vi: "Văn Miếu", en: "Temple of Literature", ko: "문묘" },
            description: {
              vi: "Di tích lịch sử, kiến trúc cổ.",
              en: "Historic temple complex.",
              ko: "역사 유적 단지.",
            },
            estimated_cost: "70.000 VND",
            category: "culture",
            tips: { vi: "Thuê audio guide.", en: "Rent audio guide.", ko: "오디오 가이드." },
          },
        ],
      },
      {
        theme: {
          vi: "Lăng Bác & phố cổ về đêm",
          en: "Mausoleum & Old Quarter nights",
          ko: "영묘 & 야경 구시가",
        },
        activities: [
          {
            time: "08:00",
            place_name: { vi: "Lăng Chủ tịch Hồ Chí Minh", en: "Ho Chi Minh Mausoleum", ko: "호치민 영묘" },
            description: {
              vi: "Khu di tích Ba Đình.",
              en: "Ba Dinh historic site.",
              ko: "바딘 역사 구역.",
            },
            estimated_cost: "0 VND",
            category: "culture",
            tips: { vi: "Mặc lịch sự.", en: "Dress modestly.", ko: "단정한 복장." },
          },
          {
            time: "13:00",
            place_name: { vi: "Bún chả Hương Liên", en: "Bun cha Huong Lien", ko: "분짜 후엉리엔" },
            description: {
              vi: "Bún chả nổi tiếng.",
              en: "Famous bun cha spot.",
              ko: "유명 분짜 맛집.",
            },
            estimated_cost: "120.000 VND",
            category: "food",
            tips: { vi: "Chia sẻ món nếu ăn nhẹ.", en: "Share plates if light eater.", ko: "소식이면 나눠 드세요." },
          },
          {
            time: "17:00",
            place_name: { vi: "Phố Ta Hien", en: "Ta Hien Street", ko: "타히엔 거리" },
            description: {
              vi: "Beer hơi, nhạc đường phố.",
              en: "Bia hoi and street music.",
              ko: "비아 호이와 거리 공연.",
            },
            estimated_cost: "150.000 VND",
            category: "relax",
            tips: { vi: "Ngồi vỉa hè.", en: "Sidewalk seating.", ko: "길가 좌석." },
          },
        ],
      },
    ],
    hidden_gems: [
      {
        name: { vi: "Cầu Long Biên", en: "Long Bien Bridge", ko: "롱비엔 다리" },
        description: {
          vi: "Cầu sắt cổ, sunset đẹp.",
          en: "Historic railway bridge, great sunset.",
          ko: "노을 명소 철교.",
        },
      },
    ],
  },
  haiphong: {
    destination: { vi: "Hải Phòng", en: "Hai Phong", ko: "하이퐁" },
    tripTitle: {
      vi: "Hải Phòng — Biển & đảo",
      en: "Hai Phong — Coast & islands",
      ko: "하이퐁 — 바다 & 섬",
    },
    days: [
      {
        theme: {
          vi: "Thành phố cảng & ẩm thực",
          en: "Port city & local food",
          ko: "항구 도시 & 미식",
        },
        activities: [
          {
            time: "09:00",
            place_name: { vi: "Nhà thờ Hải Phòng", en: "Hai Phong Cathedral", ko: "하이퐁 대성당" },
            description: {
              vi: "Kiến trúc Pháp thuộc.",
              en: "French colonial architecture.",
              ko: "프랑스식 건축.",
            },
            estimated_cost: "0 VND",
            category: "culture",
            tips: { vi: "Kết hợp cafe phố.", en: "Stop for local coffee.", ko: "로컬 커피." },
          },
          {
            time: "12:30",
            place_name: { vi: "Bánh đa cua", en: "Ban da cua noodles", ko: "반다 크랩 국수" },
            description: {
              vi: "Đặc sản Hải Phòng.",
              en: "Crab noodle specialty.",
              ko: "하이퐁 게 국수.",
            },
            estimated_cost: "60.000 VND",
            category: "food",
            tips: { vi: "Thêm chả cua.", en: "Add crab cake.", ko: "게 어묵 추가." },
          },
          {
            time: "16:00",
            place_name: { vi: "Biển Đồ Sơn", en: "Do Son Beach", ko: "도선 해변" },
            description: {
              vi: "Hóng gió biển buổi chiều.",
              en: "Afternoon seaside breeze.",
              ko: "오후 해변 산책.",
            },
            estimated_cost: "100.000 VND",
            category: "relax",
            tips: { vi: "Thuê xe máy.", en: "Rent a motorbike.", ko: "오토바이 대여." },
          },
        ],
      },
      {
        theme: {
          vi: "Vịnh Lan Hạ / Cát Bà",
          en: "Lan Ha Bay day trip",
          ko: "란하 베이 당일",
        },
        activities: [
          {
            time: "07:00",
            place_name: { vi: "Phà Cát Bà", en: "Cat Ba ferry", ko: "깟바 페리" },
            description: {
              vi: "Di chuyển ra đảo Cát Bà.",
              en: "Ferry to Cat Ba Island.",
              ko: "깟바 섬 페리.",
            },
            estimated_cost: "250.000 VND",
            category: "transport",
            tips: { vi: "Mua vé sớm.", en: "Buy tickets early.", ko: "티켓 미리 구매." },
          },
          {
            time: "11:00",
            place_name: { vi: "Kayak vịnh Lan Hạ", en: "Lan Ha Bay kayaking", ko: "란하 카약" },
            description: {
              vi: "Khám phá hang động nhỏ.",
              en: "Explore limestone lagoons.",
              ko: "석회동굴 라군.",
            },
            estimated_cost: "400.000 VND",
            category: "adventure",
            tips: { vi: "Mang áo phao.", en: "Life vest included.", ko: "구명조끼 제공." },
          },
          {
            time: "17:00",
            place_name: { vi: "Hải sản Cát Bà", en: "Cat Ba seafood", ko: "깟바 해산물" },
            description: {
              vi: "Bữa tối hải sản tươi.",
              en: "Fresh seafood dinner.",
              ko: "신선 해산물 저녁.",
            },
            estimated_cost: "350.000 VND",
            category: "food",
            tips: { vi: "Chọn quán đông dân địa phương.", en: "Pick busy local spots.", ko: "현지인 많은 곳." },
          },
        ],
      },
    ],
    hidden_gems: [
      {
        name: { vi: "Vịnh Lan Hạ yên tĩnh", en: "Quiet Lan Ha coves", ko: "한적한 란하 만" },
        description: {
          vi: "Ít tour đông, nước trong.",
          en: "Less crowded coves, clear water.",
          ko: "한적하고 맑은 물.",
        },
      },
    ],
  },
  hcmc: {
    destination: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City", ko: "호치민" },
    tripTitle: {
      vi: "Sài Gòn — Ẩm thực & di sản",
      en: "Saigon — Food & heritage",
      ko: "사이공 — 미식 & 유산",
    },
    days: [
      {
        theme: {
          vi: "Quận 1 & Dinh Độc Lập",
          en: "District 1 & Independence Palace",
          ko: "1군 & 독립궁",
        },
        activities: [
          {
            time: "08:30",
            place_name: { vi: "Dinh Độc Lập", en: "Independence Palace", ko: "독립궁" },
            description: {
              vi: "Tham quan di tích lịch sử trung tâm.",
              en: "Central historic palace tour.",
              ko: "중심 역사 유적 관람.",
            },
            estimated_cost: "65.000 VND",
            category: "culture",
            tips: { vi: "Mặc lịch sự.", en: "Dress modestly.", ko: "단정한 복장." },
          },
          {
            time: "12:00",
            place_name: { vi: "Cơm tấm Ba Ghiền", en: "Com tam Ba Ghien", ko: "콤탐 바 지엔" },
            description: {
              vi: "Cơm tấm sườn nướng đặc trưng Sài Gòn.",
              en: "Classic Saigon broken rice.",
              ko: "사이공 대표 콤탐.",
            },
            estimated_cost: "80.000 VND",
            category: "food",
            tips: { vi: "Thêm bì chả.", en: "Add pork toppings.", ko: "토핑 추가." },
          },
          {
            time: "17:00",
            place_name: { vi: "Phố đi bộ Nguyễn Huệ", en: "Nguyen Hue Walking Street", ko: "응우옌후에 보행자 거리" },
            description: {
              vi: "Dạo phố, ngắm nhà hát thành phố.",
              en: "Evening stroll and city views.",
              ko: "저녁 산책과 야경.",
            },
            estimated_cost: "0 VND",
            category: "sightseeing",
            tips: { vi: "Cuối tuần có sự kiện.", en: "Events on weekends.", ko: "주말 이벤트." },
          },
        ],
      },
    ],
    hidden_gems: [
      {
        name: { vi: "Chợ Lớn", en: "Cholon", ko: "쵸론" },
        description: {
          vi: "Khu phố Hoa, chùa Bà Thiên Hậu.",
          en: "Chinatown temples and markets.",
          ko: "중국계 거리 사원.",
        },
      },
    ],
  },
  generic: {
    destination: { vi: "Việt Nam", en: "Vietnam", ko: "베트남" },
    tripTitle: {
      vi: "Hành trình khám phá Việt Nam",
      en: "Discover Vietnam journey",
      ko: "베트남 탐험 여행",
    },
    days: [
      {
        theme: {
          vi: "Ngày khám phá đầu tiên",
          en: "First discovery day",
          ko: "첫 탐험의 날",
        },
        activities: [
          {
            time: "09:00",
            place_name: { vi: "Điểm tham quan chính", en: "Main landmark", ko: "주요 랜드마크" },
            description: {
              vi: "Tham quan điểm đến nổi bật.",
              en: "Visit key highlights.",
              ko: "핵심 명소 방문.",
            },
            estimated_cost: "200.000 VND",
            category: "sightseeing",
            tips: { vi: "Đặt vé online.", en: "Book online.", ko: "온라인 예약." },
          },
          {
            time: "12:30",
            place_name: { vi: "Quán đặc sản", en: "Local lunch spot", ko: "로컬 점심" },
            description: {
              vi: "Thử món đặc trưng vùng.",
              en: "Try regional specialties.",
              ko: "지역 특색 음식.",
            },
            estimated_cost: "120.000 VND",
            category: "food",
            tips: { vi: "Hỏi người dân địa phương.", en: "Ask locals.", ko: "현지인에게 물어보세요." },
          },
          {
            time: "16:00",
            place_name: { vi: "Chợ đêm", en: "Night market", ko: "야시장" },
            description: {
              vi: "Khám phá văn hóa buổi tối.",
              en: "Evening culture walk.",
              ko: "저녁 문화 체험.",
            },
            estimated_cost: "150.000 VND",
            category: "culture",
            tips: { vi: "Mang tiền mặt.", en: "Bring cash.", ko: "현금 준비." },
          },
        ],
      },
    ],
    hidden_gems: [
      {
        name: { vi: "Góc ít người biết", en: "Hidden local spot", ko: "숨은 명소" },
        description: {
          vi: "Hỏi dân địa phương view đẹp.",
          en: "Ask locals for hidden viewpoints.",
          ko: "현지인 추천 뷰포인트.",
        },
      },
    ],
  },
};

function resolveMockDest(destination: string): MockDest {
  const d = destination.toLowerCase();
  if (/đà nẵng|da nang|danang|다낭/.test(d)) return "danang";
  if (/hà nội|ha noi|hanoi|하노이/.test(d)) return "hanoi";
  if (/hải phòng|hai phong|haiphong|하이퐁/.test(d)) return "haiphong";
  if (/sài gòn|saigon|ho chi minh|hcmc|hồ chí minh|호치민/.test(d)) return "hcmc";
  return "generic";
}

function pick<T>(map: Record<AppLocale, T>, locale: AppLocale): T {
  return map[locale] ?? map.vi ?? map.en;
}

function buildDayFromTemplate(template: DayTemplate, dayNum: number, locale: AppLocale): TripDay {
  return {
    day: dayNum,
    theme: pick(template.theme, locale),
    activities: template.activities.map((a) => ({
      time: a.time,
      place_name: pick(a.place_name, locale),
      description: pick(a.description, locale),
      estimated_cost: a.estimated_cost,
      category: a.category,
      tips: pick(a.tips, locale),
    })),
  };
}

function estimateTotal(days: TripDay[], budgetRaw: string, locale: AppLocale): string {
  let sum = 0;
  for (const day of days) {
    for (const act of day.activities) {
      sum += parseVndCost(act.estimated_cost);
    }
  }
  const budget = parseVndCost(budgetRaw);
  if (budget > 0 && sum > budget) sum = Math.round(budget * 0.85);
  if (sum <= 0) sum = budget > 0 ? Math.round(budget * 0.7) : 3_000_000;
  return formatVnd(sum, locale);
}

/** Local fallback itinerary when Gemini is unavailable. */
export function generateMockTripPlan(form: PlannerFormData, locale: AppLocale): TripPlan {
  const key = resolveMockDest(form.destination);
  const template = TEMPLATES[key];
  const destLabel = pick(template.destination, locale);

  const dayTemplates = template.days;
  const days: TripDay[] = [];
  for (let i = 0; i < form.days; i++) {
    const src = dayTemplates[i % dayTemplates.length]!;
    days.push(buildDayFromTemplate(src, i + 1, locale));
  }

  return {
    trip_title: pick(template.tripTitle, locale),
    destination: destLabel,
    total_estimated_cost: estimateTotal(days, form.budget, locale),
    days,
    hidden_gems: template.hidden_gems.map((g) => ({
      name: pick(g.name, locale),
      description: pick(g.description, locale),
    })),
  };
}
