/**
 * Curated Vietnamese cuisine dataset for the AI Food Explorer.
 * Images served from Unsplash (whitelisted in next.config.js).
 */
import type { AppLocale } from "@/i18n/routing";
import type { Dish, LocalizedText } from "@/lib/food/types";

export function pickFoodText(text: LocalizedText, locale: AppLocale): string {
  return text[locale]?.trim() || text.vi;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const DISHES: Dish[] = [
  {
    id: "pho-bo",
    name: { vi: "Phở bò", en: "Beef Phở", ko: "소고기 쌀국수 (퍼)" },
    tagline: {
      vi: "Linh hồn ẩm thực Hà Nội",
      en: "The soul of Hanoi cuisine",
      ko: "하노이 미식의 영혼",
    },
    description: {
      vi: "Nước dùng ninh xương bò hơn 12 giờ cùng quế, hồi, gừng nướng — bánh phở mềm, thịt bò thái mỏng và hành lá tươi.",
      en: "A 12-hour beef bone broth perfumed with cinnamon, star anise and charred ginger, served with silky rice noodles, thin-sliced beef and fresh herbs.",
      ko: "계피·팔각·구운 생강으로 12시간 우린 소고기 육수에 부드러운 쌀국수와 얇게 썬 소고기, 신선한 허브를 올린 한 그릇.",
    },
    image: img("photo-1582878826629-29b7ad1cdc43"),
    category: "local_specialties",
    region: "north",
    destinations: ["Hà Nội", "Hanoi"],
    priceVnd: 55000,
    budgetTier: "budget",
    bestTime: ["breakfast", "late_night"],
    season: "all_year",
    popularity: 98,
    trending: true,
    map: { x: 24, y: 22 },
    culture: {
      history: {
        vi: "Phở ra đời đầu thế kỷ 20 tại miền Bắc, giao thoa giữa kỹ thuật hầm xương của người Việt và ảnh hưởng ẩm thực Pháp - Hoa.",
        en: "Phở emerged in early-20th-century northern Vietnam, blending Vietnamese bone-broth craft with French and Chinese culinary influences.",
        ko: "퍼는 20세기 초 베트남 북부에서 등장했으며, 베트남식 육수 기법에 프랑스·중국 요리의 영향이 어우러진 음식입니다.",
      },
      significance: {
        vi: "Là món ăn quốc dân, biểu tượng của Việt Nam trên bản đồ ẩm thực thế giới.",
        en: "A national dish and one of Vietnam's most recognized culinary symbols worldwide.",
        ko: "베트남을 대표하는 국민 음식이자 세계적으로 가장 잘 알려진 베트남 요리입니다.",
      },
      traditions: {
        vi: "Người Hà Nội thường ăn phở vào buổi sáng, thêm quẩy giòn và chút giấm tỏi.",
        en: "Hanoians traditionally eat phở for breakfast, paired with crispy dough sticks and a touch of garlic vinegar.",
        ko: "하노이 사람들은 보통 아침에 바삭한 꽈배기와 마늘 식초를 곁들여 퍼를 먹습니다.",
      },
    },
    restaurants: [
      { name: "Phở Gia Truyền", area: { vi: "Bát Đàn, Hoàn Kiếm", en: "Bat Dan, Hoan Kiem", ko: "밧단, 호안끼엠" }, distanceKm: 1.2, priceRange: "budget", rating: 4.7, reviews: 5230 },
      { name: "Phở Thìn Lò Đúc", area: { vi: "Lò Đúc, Hai Bà Trưng", en: "Lo Duc, Hai Ba Trung", ko: "로둑, 하이바쯩" }, distanceKm: 2.4, priceRange: "budget", rating: 4.6, reviews: 8120 },
      { name: "Phở 10 Lý Quốc Sư", area: { vi: "Lý Quốc Sư, Hoàn Kiếm", en: "Ly Quoc Su, Hoan Kiem", ko: "리꾸옥수, 호안끼엠" }, distanceKm: 0.8, priceRange: "mid", rating: 4.5, reviews: 6740 },
    ],
    nearbyAttractions: [
      { vi: "Hồ Hoàn Kiếm", en: "Hoan Kiem Lake", ko: "호안끼엠 호수" },
      { vi: "Phố cổ Hà Nội", en: "Hanoi Old Quarter", ko: "하노이 구시가" },
    ],
  },
  {
    id: "banh-mi",
    name: { vi: "Bánh mì", en: "Bánh Mì", ko: "반미 (베트남식 샌드위치)" },
    tagline: {
      vi: "Bản giao hưởng giòn tan",
      en: "A crackling East-meets-West symphony",
      ko: "바삭함이 살아있는 동서양의 조화",
    },
    description: {
      vi: "Vỏ bánh giòn rụm kẹp pa-tê, thịt nguội, đồ chua, rau mùi và tương ớt — bữa sáng đường phố nhanh gọn mà đậm đà.",
      en: "A shatteringly crisp baguette filled with pâté, cold cuts, pickled vegetables, cilantro and chili — fast, bold street-food breakfast.",
      ko: "바삭한 바게트에 파테, 햄, 절임 채소, 고수, 칠리를 넣은 빠르고 풍부한 길거리 아침 식사.",
    },
    image: img("photo-1600688640154-9619e002df30"),
    category: "street_food",
    region: "south",
    destinations: ["Hồ Chí Minh", "Ho Chi Minh", "Hội An", "Hoi An"],
    priceVnd: 30000,
    budgetTier: "budget",
    bestTime: ["breakfast", "afternoon"],
    season: "all_year",
    popularity: 95,
    trending: true,
    map: { x: 70, y: 78 },
    culture: {
      history: {
        vi: "Bánh mì là kết quả của thời thuộc địa Pháp, được người Việt biến tấu thành món ăn đường phố độc đáo.",
        en: "Bánh mì descends from the French colonial baguette, reinvented by Vietnamese cooks into a unique street food.",
        ko: "반미는 프랑스 식민지 시기의 바게트에서 비롯되어 베트남인이 독창적인 길거리 음식으로 재탄생시킨 메뉴입니다.",
      },
      significance: {
        vi: "Từ \"bánh mì\" đã được đưa vào từ điển Oxford như một danh từ riêng của Việt Nam.",
        en: "The word \"bánh mì\" entered the Oxford English Dictionary as a distinctly Vietnamese term.",
        ko: "\"반미\"라는 단어는 베트남 고유어로 옥스퍼드 영어사전에 등재되었습니다.",
      },
      traditions: {
        vi: "Mỗi vùng miền có công thức riêng: bánh mì Hội An, bánh mì Sài Gòn, bánh mì chảo...",
        en: "Each region keeps its own recipe: Hoi An bánh mì, Saigon bánh mì, skillet bánh mì and more.",
        ko: "지역마다 고유 레시피가 있습니다: 호이안 반미, 사이공 반미, 철판 반미 등.",
      },
    },
    restaurants: [
      { name: "Bánh Mì Phượng", area: { vi: "Hội An", en: "Hoi An", ko: "호이안" }, distanceKm: 0.5, priceRange: "budget", rating: 4.8, reviews: 9900 },
      { name: "Bánh Mì Huỳnh Hoa", area: { vi: "Lê Thị Riêng, Q.1", en: "Le Thi Rieng, D.1", ko: "레티리엥, 1군" }, distanceKm: 1.0, priceRange: "mid", rating: 4.6, reviews: 7300 },
      { name: "Bánh Mì 37 Nguyễn Trãi", area: { vi: "Nguyễn Trãi, Q.1", en: "Nguyen Trai, D.1", ko: "응우옌짜이, 1군" }, distanceKm: 1.6, priceRange: "budget", rating: 4.5, reviews: 4100 },
    ],
    nearbyAttractions: [
      { vi: "Chợ Bến Thành", en: "Ben Thanh Market", ko: "벤탄 시장" },
      { vi: "Phố đi bộ Nguyễn Huệ", en: "Nguyen Hue Walking Street", ko: "응우옌후에 보행자 거리" },
    ],
  },
  {
    id: "bun-cha",
    name: { vi: "Bún chả", en: "Bún Chả", ko: "분짜" },
    tagline: {
      vi: "Khói thơm trên than hồng",
      en: "Smoky charcoal-grilled pork over noodles",
      ko: "숯불 향 가득한 돼지구이 국수",
    },
    description: {
      vi: "Thịt lợn nướng than hoa thả vào bát nước mắm chua ngọt, ăn kèm bún tươi, rau sống và chả viên.",
      en: "Charcoal-grilled pork patties and belly steeped in sweet-sour fish sauce, served with fresh vermicelli and herbs.",
      ko: "숯불에 구운 돼지고기를 새콤달콤한 느억맘 소스에 담가 신선한 쌀국수, 허브와 함께 즐기는 요리.",
    },
    image: img("photo-1632789395770-20e6f63be806"),
    category: "local_specialties",
    region: "north",
    destinations: ["Hà Nội", "Hanoi"],
    priceVnd: 50000,
    budgetTier: "budget",
    bestTime: ["lunch"],
    season: "all_year",
    popularity: 90,
    map: { x: 28, y: 18 },
    culture: {
      history: {
        vi: "Bún chả gắn liền với Hà Nội từ những năm 1950, nổi tiếng toàn cầu sau bữa ăn của Tổng thống Obama.",
        en: "A Hanoi staple since the 1950s, bún chả went global after President Obama's famous meal here.",
        ko: "1950년대부터 하노이를 대표해 온 음식으로, 오바마 대통령의 식사로 세계적으로 유명해졌습니다.",
      },
      significance: {
        vi: "Biểu tượng của văn hóa ăn trưa bình dân nhưng tinh tế của người Hà Nội.",
        en: "An emblem of Hanoi's humble yet refined lunchtime culture.",
        ko: "소박하면서도 정교한 하노이 점심 문화의 상징입니다.",
      },
      traditions: {
        vi: "Thường chỉ bán vào buổi trưa, ăn khi nước chấm còn ấm và thịt vừa nướng xong.",
        en: "Usually sold only at lunch, eaten while the dipping sauce is warm and the pork freshly grilled.",
        ko: "보통 점심에만 판매하며, 소스가 따뜻하고 고기가 막 구워졌을 때 먹습니다.",
      },
    },
    restaurants: [
      { name: "Bún Chả Hương Liên", area: { vi: "Lê Văn Hưu", en: "Le Van Huu", ko: "레반흐우" }, distanceKm: 2.0, priceRange: "budget", rating: 4.4, reviews: 6200 },
      { name: "Bún Chả Đắc Kim", area: { vi: "Hàng Mành", en: "Hang Manh", ko: "항만" }, distanceKm: 0.9, priceRange: "mid", rating: 4.3, reviews: 5100 },
    ],
    nearbyAttractions: [
      { vi: "Nhà hát Lớn Hà Nội", en: "Hanoi Opera House", ko: "하노이 오페라 하우스" },
      { vi: "Hồ Gươm", en: "Sword Lake", ko: "검호" },
    ],
  },
  {
    id: "cao-lau",
    name: { vi: "Cao lầu", en: "Cao Lầu", ko: "까오러우" },
    tagline: {
      vi: "Đặc sản chỉ có ở Hội An",
      en: "A noodle found only in Hoi An",
      ko: "호이안에서만 맛보는 면 요리",
    },
    description: {
      vi: "Sợi mì dai vàng óng làm từ nước giếng Bá Lễ, ăn cùng thịt xá xíu, rau sống và tóp mỡ giòn.",
      en: "Chewy golden noodles made with Ba Le well water, topped with char siu pork, herbs and crispy croutons.",
      ko: "바레 우물물로 만든 쫄깃한 황금빛 면에 차슈 돼지고기, 허브, 바삭한 크루통을 올린 요리.",
    },
    image: img("photo-1604908176997-125f25cc6f3d"),
    category: "local_specialties",
    region: "central",
    destinations: ["Hội An", "Hoi An", "Quảng Nam"],
    priceVnd: 45000,
    budgetTier: "budget",
    bestTime: ["lunch", "dinner"],
    season: "all_year",
    popularity: 84,
    map: { x: 52, y: 50 },
    culture: {
      history: {
        vi: "Cao lầu mang dấu ấn giao thương của thương cảng Hội An xưa, pha trộn ảnh hưởng Nhật Bản và Trung Hoa.",
        en: "Cao lầu reflects old Hoi An's trading port, mixing Japanese and Chinese culinary influences.",
        ko: "까오러우는 옛 호이안 무역항의 흔적으로 일본과 중국 요리의 영향이 섞여 있습니다.",
      },
      significance: {
        vi: "Món ăn không thể sao chép vì cần đúng nước giếng cổ và tro củi địa phương.",
        en: "An irreproducible dish — it needs the ancient well water and local wood ash to be authentic.",
        ko: "고대 우물물과 현지 나무 재가 있어야 제맛이 나는, 복제할 수 없는 음식입니다.",
      },
      traditions: {
        vi: "Gắn liền với phố cổ Hội An, thường thưởng thức bên bờ sông Hoài.",
        en: "Tied to Hoi An's ancient town, often enjoyed by the Hoai riverside.",
        ko: "호이안 구시가와 연결되어 있으며 호아이 강변에서 즐기곤 합니다.",
      },
    },
    restaurants: [
      { name: "Cao Lầu Thanh", area: { vi: "Thái Phiên, Hội An", en: "Thai Phien, Hoi An", ko: "타이피엔, 호이안" }, distanceKm: 0.4, priceRange: "budget", rating: 4.5, reviews: 2300 },
      { name: "Cao Lầu Bà Bé", area: { vi: "Chợ Hội An", en: "Hoi An Market", ko: "호이안 시장" }, distanceKm: 0.3, priceRange: "budget", rating: 4.4, reviews: 1800 },
    ],
    nearbyAttractions: [
      { vi: "Chùa Cầu", en: "Japanese Covered Bridge", ko: "일본 다리" },
      { vi: "Phố cổ Hội An", en: "Hoi An Ancient Town", ko: "호이안 고대 도시" },
    ],
  },
  {
    id: "hai-san-nha-trang",
    name: { vi: "Hải sản Nha Trang", en: "Nha Trang Seafood", ko: "나트랑 해산물" },
    tagline: {
      vi: "Vị biển tươi rói mỗi sớm mai",
      en: "Ocean-fresh catch every morning",
      ko: "매일 아침 잡아 올린 신선한 바다의 맛",
    },
    description: {
      vi: "Tôm hùm, ghẹ, sò điệp nướng mỡ hành và mực hấp gừng — hải sản đánh bắt trong ngày tại vịnh Nha Trang.",
      en: "Lobster, crab, scallops with scallion oil and ginger-steamed squid — day-boat seafood from Nha Trang bay.",
      ko: "랍스터, 게, 파기름 가리비, 생강 찐 오징어 등 나트랑 만에서 당일 잡은 해산물.",
    },
    image: img("photo-1559737558-2f5a35f4523b"),
    category: "seafood",
    region: "central",
    destinations: ["Nha Trang", "Khánh Hòa"],
    priceVnd: 350000,
    budgetTier: "premium",
    bestTime: ["dinner"],
    season: "summer",
    popularity: 80,
    map: { x: 60, y: 60 },
    culture: {
      history: {
        vi: "Nha Trang là làng chài lâu đời, nơi nghề biển nuôi sống cộng đồng qua nhiều thế hệ.",
        en: "Nha Trang is an age-old fishing town where the sea has sustained communities for generations.",
        ko: "나트랑은 오랜 어촌으로, 바다가 여러 세대에 걸쳐 지역 공동체를 지탱해 왔습니다.",
      },
      significance: {
        vi: "Ẩm thực biển phản ánh nhịp sống gắn với đại dương của người miền Trung.",
        en: "Its seafood cuisine reflects central Vietnam's life rhythm tied to the ocean.",
        ko: "해산물 요리는 바다와 함께하는 베트남 중부의 삶의 리듬을 보여줍니다.",
      },
      traditions: {
        vi: "Người dân thường ăn hải sản nướng ven biển vào buổi tối, kèm muối ớt xanh.",
        en: "Locals enjoy grilled seafood by the shore at night, with green chili salt.",
        ko: "현지인들은 밤에 해변에서 청고추 소금을 곁들여 해산물 구이를 즐깁니다.",
      },
    },
    restaurants: [
      { name: "Hải Sản Bờ Kè", area: { vi: "Tháp Bà, Nha Trang", en: "Thap Ba, Nha Trang", ko: "탑바, 나트랑" }, distanceKm: 3.5, priceRange: "mid", rating: 4.3, reviews: 3400 },
      { name: "Nhà hàng Yến's", area: { vi: "Trần Phú, Nha Trang", en: "Tran Phu, Nha Trang", ko: "쩐푸, 나트랑" }, distanceKm: 1.2, priceRange: "premium", rating: 4.6, reviews: 2900 },
    ],
    nearbyAttractions: [
      { vi: "Vinpearl Nha Trang", en: "Vinpearl Nha Trang", ko: "빈펄 나트랑" },
      { vi: "Tháp Bà Ponagar", en: "Po Nagar Towers", ko: "포나가르 탑" },
    ],
  },
  {
    id: "com-chay-hue",
    name: { vi: "Cơm chay Huế", en: "Hue Vegetarian Cuisine", ko: "후에 사찰 채식" },
    tagline: {
      vi: "Thanh tịnh giữa cố đô",
      en: "Serene flavors of the old capital",
      ko: "옛 수도의 정갈한 채식",
    },
    description: {
      vi: "Mâm cơm chay tinh tế mô phỏng món mặn, chế biến từ rau củ, nấm và đậu theo triết lý nhà Phật.",
      en: "Refined vegetarian platters mimicking meat dishes, crafted from vegetables, mushrooms and tofu in Buddhist tradition.",
      ko: "채소·버섯·두부로 고기 요리를 본떠 만든 정교한 채식 한 상, 불교 전통을 담았습니다.",
    },
    image: img("photo-1512621776951-a57141f2eefd"),
    category: "vegetarian",
    region: "central",
    destinations: ["Huế", "Hue", "Thừa Thiên Huế"],
    priceVnd: 120000,
    budgetTier: "mid",
    bestTime: ["lunch", "dinner"],
    season: "all_year",
    popularity: 72,
    map: { x: 48, y: 42 },
    culture: {
      history: {
        vi: "Cơm chay Huế gắn với hệ thống chùa chiền và đời sống cung đình triều Nguyễn.",
        en: "Hue vegetarian food is rooted in its many pagodas and the Nguyen dynasty's royal life.",
        ko: "후에 채식은 수많은 사찰과 응우옌 왕조의 궁중 생활에 뿌리를 두고 있습니다.",
      },
      significance: {
        vi: "Thể hiện nghệ thuật ẩm thực cầu kỳ và tinh thần từ bi của xứ Huế.",
        en: "It embodies Hue's meticulous culinary artistry and compassionate spirit.",
        ko: "후에의 섬세한 요리 예술과 자비의 정신을 담고 있습니다.",
      },
      traditions: {
        vi: "Người Huế ăn chay vào ngày rằm, mùng một và các dịp lễ Phật.",
        en: "Hue locals eat vegetarian on full-moon days, the first of the lunar month and Buddhist holidays.",
        ko: "후에 사람들은 보름, 음력 초하루, 불교 명절에 채식을 합니다.",
      },
    },
    restaurants: [
      { name: "Tịnh Tâm Chay", area: { vi: "Lê Quý Đôn, Huế", en: "Le Quy Don, Hue", ko: "레꾸이돈, 후에" }, distanceKm: 1.1, priceRange: "mid", rating: 4.5, reviews: 1500 },
      { name: "Liên Hoa", area: { vi: "Lê Quý Đôn, Huế", en: "Le Quy Don, Hue", ko: "레꾸이돈, 후에" }, distanceKm: 1.3, priceRange: "budget", rating: 4.4, reviews: 2100 },
    ],
    nearbyAttractions: [
      { vi: "Đại Nội Huế", en: "Hue Imperial City", ko: "후에 황성" },
      { vi: "Chùa Thiên Mụ", en: "Thien Mu Pagoda", ko: "티엔무 사원" },
    ],
  },
  {
    id: "lau-mam",
    name: { vi: "Lẩu mắm miền Tây", en: "Mekong Fermented Fish Hotpot", ko: "메콩 젓갈 핫팟 (러우맘)" },
    tagline: {
      vi: "Hương vị sông nước Cửu Long",
      en: "The taste of the Mekong Delta",
      ko: "메콩 델타의 강물 풍미",
    },
    description: {
      vi: "Nước lẩu đậm đà từ mắm cá linh, ăn kèm hàng chục loại rau đồng, cá, tôm và thịt heo quay.",
      en: "A bold broth from fermented linh fish, served with dozens of wild greens, fish, prawns and roast pork.",
      ko: "린 생선 젓갈로 낸 진한 육수에 수십 가지 들나물, 생선, 새우, 돼지고기 구이를 곁들입니다.",
    },
    image: img("photo-1569718212165-3a8278d5f624"),
    category: "local_specialties",
    region: "south",
    destinations: ["Cần Thơ", "Can Tho", "Miền Tây"],
    priceVnd: 200000,
    budgetTier: "mid",
    bestTime: ["dinner"],
    season: "autumn",
    popularity: 68,
    map: { x: 66, y: 88 },
    culture: {
      history: {
        vi: "Lẩu mắm bắt nguồn từ cách bảo quản cá của người miền Tây vào mùa nước nổi.",
        en: "Mam hotpot grew from how Mekong locals preserved fish during the floating season.",
        ko: "러우맘은 메콩 주민들이 홍수철에 생선을 보존하던 방식에서 발전했습니다.",
      },
      significance: {
        vi: "Đại diện cho sự trù phú và phóng khoáng của ẩm thực Nam Bộ.",
        en: "It represents the abundance and generosity of southern Vietnamese cuisine.",
        ko: "베트남 남부 요리의 풍요로움과 넉넉함을 대표합니다.",
      },
      traditions: {
        vi: "Thường ăn quây quần đông người vào mùa nước nổi tháng 9–11.",
        en: "Usually shared in big groups during the floating season from September to November.",
        ko: "보통 9~11월 홍수철에 여럿이 모여 함께 즐깁니다.",
      },
    },
    restaurants: [
      { name: "Lẩu Mắm Dạ Lý", area: { vi: "Ninh Kiều, Cần Thơ", en: "Ninh Kieu, Can Tho", ko: "닌끼에우, 껀터" }, distanceKm: 2.2, priceRange: "mid", rating: 4.3, reviews: 1700 },
      { name: "Quán Cây Bưởi", area: { vi: "Cái Răng, Cần Thơ", en: "Cai Rang, Can Tho", ko: "까이랑, 껀터" }, distanceKm: 4.0, priceRange: "budget", rating: 4.2, reviews: 980 },
    ],
    nearbyAttractions: [
      { vi: "Chợ nổi Cái Răng", en: "Cai Rang Floating Market", ko: "까이랑 수상시장" },
      { vi: "Bến Ninh Kiều", en: "Ninh Kieu Wharf", ko: "닌끼에우 부두" },
    ],
  },
  {
    id: "fine-dining-saigon",
    name: { vi: "Fine dining Việt đương đại", en: "Modern Vietnamese Fine Dining", ko: "현대 베트남 파인다이닝" },
    tagline: {
      vi: "Ẩm thực Việt nâng tầm nghệ thuật",
      en: "Vietnamese flavors elevated to art",
      ko: "예술로 승화된 베트남의 맛",
    },
    description: {
      vi: "Thực đơn nhiều món (tasting menu) tái hiện món Việt truyền thống bằng kỹ thuật hiện đại và trình bày tinh xảo.",
      en: "Multi-course tasting menus reimagining traditional Vietnamese dishes with modern technique and exquisite plating.",
      ko: "현대 기법과 정교한 플레이팅으로 전통 베트남 요리를 재해석한 다채로운 테이스팅 메뉴.",
    },
    image: img("photo-1414235077428-338989a2e8c0"),
    category: "fine_dining",
    region: "south",
    destinations: ["Hồ Chí Minh", "Ho Chi Minh", "Hà Nội", "Hanoi"],
    priceVnd: 1500000,
    budgetTier: "premium",
    bestTime: ["dinner"],
    season: "all_year",
    popularity: 64,
    trending: true,
    map: { x: 72, y: 74 },
    culture: {
      history: {
        vi: "Làn sóng fine dining Việt bùng nổ từ 2015 khi các đầu bếp trẻ trở về từ nước ngoài.",
        en: "Vietnam's fine-dining wave took off around 2015 as young chefs returned from abroad.",
        ko: "베트남 파인다이닝 열풍은 해외에서 돌아온 젊은 셰프들이 늘면서 2015년경 본격화되었습니다.",
      },
      significance: {
        vi: "Đưa nguyên liệu bản địa và câu chuyện văn hóa Việt lên bàn tiệc đẳng cấp quốc tế.",
        en: "It brings native ingredients and Vietnamese cultural stories to world-class tables.",
        ko: "토착 식재료와 베트남 문화 이야기를 세계적 수준의 식탁으로 끌어올립니다.",
      },
      traditions: {
        vi: "Thường đặt bàn trước, trải nghiệm kéo dài cùng rượu vang pairing.",
        en: "Typically reservation-only, with a long experience paired with curated wines.",
        ko: "보통 예약제로 운영되며 와인 페어링과 함께 긴 코스를 경험합니다.",
      },
    },
    restaurants: [
      { name: "Anan Saigon", area: { vi: "Tôn Thất Đạm, Q.1", en: "Ton That Dam, D.1", ko: "똔텃담, 1군" }, distanceKm: 1.4, priceRange: "premium", rating: 4.7, reviews: 1200 },
      { name: "Gia Restaurant", area: { vi: "Tống Duy Tân, Hà Nội", en: "Tong Duy Tan, Hanoi", ko: "똥주이떤, 하노이" }, distanceKm: 1.0, priceRange: "premium", rating: 4.8, reviews: 860 },
    ],
    nearbyAttractions: [
      { vi: "Nhà thờ Đức Bà", en: "Notre-Dame Cathedral", ko: "노트르담 대성당" },
      { vi: "Bưu điện Trung tâm", en: "Central Post Office", ko: "중앙우체국" },
    ],
  },
];

export function getDishById(id: string): Dish | undefined {
  return DISHES.find((d) => d.id === id);
}
