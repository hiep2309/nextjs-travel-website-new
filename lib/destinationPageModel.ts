import type { ProvinceDef } from "@/lib/vietnamProvinces";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { TRAVEL_IMAGE_ROTATION } from "@/lib/travelImageUrls";
import { provinceNameToSlug } from "@/lib/provinceSlug";

const TITLE_OVERRIDE: Partial<Record<string, string>> = {
  "Quảng Nam": "Hội An về đêm",
};

export type WhyCard = {
  key: string;
  title: string;
  body: string;
  accent: "purple" | "pink" | "orange";
};

export type ExperienceCard = { title: string; image: string };
export type CostRow = { item: string; price: string };
export type TocItem = { id: string; label: string; num: string };

export type RelatedDestination = {
  name: string;
  slug: string;
  image: string;
  views: number;
};

export type DestinationPageModel = {
  slug: string;
  headline: string;
  province: ProvinceDef;
  heroImage: string;
  readMinutes: number;
  views: number;
  rating: number;
  ratingCount: number;
  intro: string;
  whyCards: WhyCard[];
  experiences: ExperienceCard[];
  tips: string[];
  costs: CostRow[];
  quickInfo: {
    location: string;
    idealTime: string;
    estCost: string;
    suitability: string;
  };
  toc: TocItem[];
  gallery: string[];
  related: RelatedDestination[];
  starBreakdown: { star: number; pct: number }[];
};

function pseudoRand(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h) % max;
}

export function buildDestinationPageModel(p: ProvinceDef): DestinationPageModel {
  const slug = provinceNameToSlug(p.name);
  const headline = TITLE_OVERRIDE[p.name] ?? `${p.name} — gợi ý du lịch`;
  const idx = VIETNAM_PROVINCES.findIndex((x) => x.name === p.name);
  const pool = TRAVEL_IMAGE_ROTATION;
  const heroImage = p.image;

  const readMinutes = 8 + (pseudoRand(p.name, 8) || 1);
  const views = 800 + pseudoRand(slug + "v", 9200);
  const rating = Math.min(5, 4.4 + pseudoRand(slug + "r", 7) / 10);
  const ratingCount = 120 + pseudoRand(slug + "c", 400);

  const intro = `${p.name} thuộc vùng ${p.region} là điểm đến được nhiều du khách quan tâm. ${p.summary} Bài viết tổng hợp gợi ý lịch trình, trải nghiệm và mức chi phí tham khảo để bạn lên kế hoạch thoải mái hơn.`;

  const whyCards: WhyCard[] = [
    {
      key: "1",
      title: "Không gian đặc trưng",
      body: `Tại ${p.name}, bạn dễ bắt gặp những góc phố, làng nghề và công trình mang dấu ấn địa phương — phù hợp đi bộ, chụp ảnh và cảm nhận nhịp sống chậm.`,
      accent: "purple",
    },
    {
      key: "2",
      title: "Văn hóa & lễ hội",
      body: `Nét văn hóa ${p.region} hiện rõ qua ẩm thực, phiên chợ và các hoạt động cộng đồng; hãy hỏi người dân về mùa lễ hội để không bỏ lỡ trải nghiệm.`,
      accent: "pink",
    },
    {
      key: "3",
      title: "Ẩm thực địa phương",
      body: `Từ quán vỉa hè đến nhà hàng đặc sản, ẩm thực tại ${p.name} đa dạng mức giá — nên dự trù tiền mặt nhỏ để thử món địa phương.`,
      accent: "orange",
    },
  ];

  const expTitles = [
    "Hoạt động ngoài trời",
    "Tham quan di tích & làng nghề",
    "Chợ đêm & ẩm thực",
    "Góc check-in nổi bật",
  ];
  const experiences: ExperienceCard[] = expTitles.map((title, i) => ({
    title,
    image: pool[(idx + i + 1) % pool.length],
  }));

  const tips = [
    "Khung giờ đẹp thường là chiều tối đến 22:00 — tránh nắng gắt và dễ chụp ảnh hơn.",
    "Ngày lễ đông đúc: đến sớm hoặc đặt chỗ nếu có tour kèm hướng dẫn.",
    "Mang tiền mặt vừa đủ; nhiều quán nhỏ chưa nhận thẻ.",
    "Giày thể thao hoặc sandal đi bộ êm — một số khu lát đá trơn khi mưa.",
  ];

  const costs: CostRow[] = [
    { item: "Tham quan điểm chính (ước lượng)", price: `${(50 + pseudoRand(p.name, 4) * 30).toLocaleString("vi-VN")} – ${(150 + pseudoRand(p.name + "x", 5) * 40).toLocaleString("vi-VN")} ₫` },
    { item: "Ăn uống trong ngày", price: `${(120 + pseudoRand(p.name + "e", 8) * 25).toLocaleString("vi-VN")} – ${(400 + pseudoRand(p.name + "f", 6) * 50).toLocaleString("vi-VN")} ₫` },
    { item: "Quà lưu niệm / trải nghiệm nhỏ", price: `${(80 + pseudoRand(p.name + "g", 10) * 20).toLocaleString("vi-VN")} – ${(300 + pseudoRand(p.name + "h", 7) * 40).toLocaleString("vi-VN")} ₫` },
    { item: "Thuê máy ảnh / gói chụp (tuỳ chọn)", price: `${(200 + pseudoRand(p.name + "i", 5) * 100).toLocaleString("vi-VN")} – ${(800 + pseudoRand(p.name + "j", 4) * 100).toLocaleString("vi-VN")} ₫` },
  ];

  const quickInfo = {
    location: `${p.name}, ${p.region}, Việt Nam`,
    idealTime: "Chiều – tối (khoảng 18:00 – 22:00)",
    estCost: "400.000 – 1.200.000 ₫ / người / ngày (tham khảo)",
    suitability: "Gia đình, cặp đôi, nhóm bạn",
  };

  const toc: TocItem[] = [
    { id: "gioi-thieu", label: "Giới thiệu", num: "01" },
    { id: "vi-sao", label: "Vì sao nên đến?", num: "02" },
    { id: "trai-nghiem", label: "Trải nghiệm", num: "03" },
    { id: "kinh-nghiem", label: "Kinh nghiệm", num: "04" },
    { id: "chi-phi", label: "Chi phí", num: "05" },
    { id: "hinh-anh", label: "Hình ảnh", num: "06" },
  ];

  const gallery = [0, 1, 2, 3].map((k) => pool[(idx + k) % pool.length]);

  const sameRegion = VIETNAM_PROVINCES.filter((x) => x.region === p.region && x.name !== p.name);
  const others = VIETNAM_PROVINCES.filter((x) => x.name !== p.name);
  const mix = [...sameRegion, ...others.filter((x) => !sameRegion.includes(x))];
  const related: RelatedDestination[] = mix.slice(0, 4).map((x, i) => ({
    name: TITLE_OVERRIDE[x.name] ?? x.name,
    slug: provinceNameToSlug(x.name),
    image: x.image,
    views: 600 + pseudoRand(x.name + String(i), 8000),
  }));

  const starBreakdown = [
    { star: 5, pct: 62 + pseudoRand(slug + "5", 12) },
    { star: 4, pct: 22 + pseudoRand(slug + "4", 8) },
    { star: 3, pct: 8 + pseudoRand(slug + "3", 4) },
    { star: 2, pct: 3 + pseudoRand(slug + "2", 3) },
    { star: 1, pct: 2 + pseudoRand(slug + "1", 2) },
  ];
  const sum = starBreakdown.reduce((a, b) => a + b.pct, 0);
  starBreakdown.forEach((row) => {
    row.pct = Math.round((row.pct / sum) * 100);
  });

  return {
    slug,
    headline,
    province: p,
    heroImage,
    readMinutes,
    views,
    rating,
    ratingCount,
    intro,
    whyCards,
    experiences,
    tips,
    costs,
    quickInfo,
    toc,
    gallery,
    related,
    starBreakdown,
  };
}
