import fs from "fs";
import { applyEnPatches, applyKoPatches } from "./locale-en-ko-patches.mjs";

const vi = JSON.parse(fs.readFileSync("messages/vi.json", "utf8"));

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

const en = deepClone(vi);
en.Meta = {
  siteName: "VN Insight",
  defaultTitle: "VN Insight — Discover Vietnam",
  defaultDescription: "Explore destinations, tours, guides and community travel stories.",
};
Object.assign(en.Nav, {
  home: "Home",
  destinations: "Destinations",
  tours: "Tours",
  guides: "Guides",
  login: "Log in",
  getStarted: "Get started",
  loading: "Loading…",
  member: "Member",
  admin: "Administrator",
  viewProfile: "View profile",
  settings: "Settings / Profile",
  explore: "Explore",
  logout: "Log out",
});
Object.assign(en.Common, {
  save: "Save",
  cancel: "Cancel",
  loading: "Loading…",
  readMore: "Read more",
  backHome: "Back to home",
  notFound: "Not found",
  empty: "No content yet",
  search: "Search",
  views: "views",
  vietnam: "Vietnam",
  back: "Back",
});
Object.assign(en.Auth, {
  welcomeBack: "WELCOME BACK",
  loginTitle: "Log in to your account",
  noAccount: "Don't have an account?",
  signUp: "Sign up",
  orWith: "Or log in with",
  processing: "Processing…",
  loginSuccess: "Signed in successfully!",
  loginError: "Sign-in failed",
});
Object.assign(en.Features, {
  eyebrow: "Why choose us",
  title: "Explore Vietnam with confidence",
  f1Title: "Explore Vietnam",
  f1Desc: "Landscapes and vibrant cities nationwide.",
  f2Title: "Popular destinations",
  f2Desc: "Ha Long Bay, Sa Pa, Hoi An, Phu Quoc…",
  f3Title: "Travel guides",
  f3Desc: "Culture, food, transport and itineraries.",
  f4Title: "Featured tours",
  f4Desc: "Curated tours and memorable trips.",
});
Object.assign(en.Guide, {
  toursEyebrow: "Featured experiences",
  toursTitle: "Tours and Experiences",
  toursSubtitle: "Community itinerary ideas",
  viewAllTours: "View all tours",
  guidesEyebrow: "Articles & guides",
  guidesTitle: "Travel guides",
  guidesSubtitle: "Real tips from travelers",
  viewAllGuides: "View all articles",
});
Object.assign(en.Province, {
  cta: "View destination posts",
  countLabel: "{count} provinces & cities — select to view posts",
  vietnam: "VIETNAM",
  summaryTemplate: "Explore destinations, culture and suggested travel articles in {name}.",
  selectProvince: "Select {name}, {region}",
});
Object.assign(en.Regions, {
  capital: "Capital region",
  southeast: "Southeast",
  redRiverDelta: "Red River Delta",
  southCentral: "South Central Coast",
  northCentral: "North Central Coast",
  mekongDelta: "Mekong Delta",
  north: "Northern region",
  centralHighlands: "Central Highlands",
});
Object.assign(en.Hero, {
  mapLoading: "Loading map…",
  topPost: "Most viewed post",
  readFull: "Read full article",
  weather: "Weather",
  feels: "Feels like",
  nearYou: "Near your location",
  map: "Map",
  yourLocation: "Your location",
  gpsLocating: "Determining your location…",
  gpsEnableHint: "Enable location in your browser to see weather and routes from where you are.",
  weatherByPost: "Based on the featured post's region",
  mapPending: "Destination from the post — waiting for GPS to draw your route",
  mapRoute: "Route from your location to the post destination",
  communityStoryDesc: "Stories and itinerary tips from the travel community.",
  featuredFallbackTitle: "Featured destination",
  noFeaturedImage: "No cover image",
  updating: "Updating…",
  plane: "Flight",
  car: "Car",
  moto: "Motorbike",
  train: "Train",
  views: "{count} views",
  aiTitle: "AI distance & time estimate",
  calculating: "Calculating…",
  calculatingShort: "Calculating…",
  awaitingCoords: "Waiting for coordinates…",
  distanceLine: "Distance ~{km} km • Map mode: {mode}",
  feelsInline: "feels like",
  originFromGps: "From your GPS location",
  originFromPlace: "From {place}",
  originNoGps: "GPS unavailable — estimating from default (Ho Chi Minh City)",
  aiHeadlineTo: "{origin} to {dest}",
  travelInsightDevice:
    "Estimate from {place}. Priority: flight → car → motorbike → train. Distance {km} km. Suggested: flight (~{eta}).",
  travelInsightFallback:
    "Estimate (no GPS — using default). Priority: flight → car → motorbike → train. Distance {km} km. Suggested: flight (~{eta}).",
  mapModeDriving: "driving",
  mapModeWalking: "walking",
  mapModeCycling: "cycling",
});
Object.assign(en.Search, {
  placeholder: "Search provinces, cities, destinations…",
  aria: "Search destinations",
  explorePosts: "Search «{q}» in Explore",
  provinceSuggestions: "Province suggestions",
});
Object.assign(en.Footer, {
  discoverTitle: "Discover Vietnam",
  discoverDesc: "Timeless beauty from mountains to sea.",
  exploreNow: "EXPLORE NOW",
  explore: "Explore",
  company: "Company",
  support: "Support",
  stayInspired: "Stay inspired",
  newsletterDesc: "Get destination tips and deals.",
  emailPlaceholder: "Your email address",
  subscribe: "Subscribe",
  basedIn: "Based in Hanoi, Vietnam",
  rights: "© {year} VN Insight. All rights reserved.",
  backToTop: "Back to top",
  linkDestinations: "Destinations",
  linkTours: "Tours",
  linkGuides: "Guides",
  linkExperiences: "Experiences",
  linkAbout: "About us",
  linkContact: "Contact",
  linkHelp: "Help",
  linkPrivacy: "Privacy policy",
  trustedTitle: "Trust and safety",
  trustedDesc: "Community content is moderated.",
  support247Title: "24/7 support",
  support247Desc: "We're here to help anytime, anywhere.",
  localTitle: "Local expertise",
  localDesc: "Authentic experiences, local insights.",
  craftedTitle: "Crafted with care",
  craftedDesc: "Handpicked journeys just for you.",
});
Object.assign(en.Explore, {
  title: "Explore",
  desc: "Community destination reviews",
  empty: "No reviews yet.",
  noDesc: "No description",
});
Object.assign(en.Tours, {
  title: "Tours and Experiences",
  desc: "Community tours and highlights",
  community: "Community tour posts",
  empty: "No tour posts yet.",
  filterNorth: "North",
  filterCentral: "Central",
  filterSouth: "South",
});
Object.assign(en.GuidesPage, {
  breadcrumbHome: "Home",
  breadcrumb: "Guides",
  title: "Travel guides",
  desc: "Hotels, transport and practical tips",
  empty: "No guide articles yet.",
});
Object.assign(en.CreatePost, {
  title: "Create post",
  subtitle: "Choose type and content. Posts are reviewed before publishing.",
  publish: "Publish",
  myPosts: "Your posts",
  translating: "Translating content to English and Korean…",
});
Object.assign(en.Profile, { title: "Profile", writeBtn: "Write a post" });
Object.assign(en.Dashboard, {
  accessDenied: "Admins only.",
  memberPage: "Member page",
  memberHint: "Only admins can access the full dashboard.",
  newPost: "New post",
});
Object.assign(en.Posts, {
  backDestinations: "Back to Destinations",
  backTours: "Back to Tours",
  backGuides: "Back to Guides",
});
Object.assign(en.PostTypes.destination_review, {
  label: "Destination review",
  short: "Review",
  description: "Reviews and on-site experiences.",
});
Object.assign(en.PostTypes.tour_share, {
  label: "Tour share",
  short: "Tour",
  description: "Itineraries, costs and tour tips.",
});
Object.assign(en.PostTypes.guide_handbook, {
  label: "Travel handbook",
  short: "Handbook",
  description: "Food, culture and itineraries.",
});
Object.assign(en.PostTypes.guide_hotel, {
  label: "Hotel tips",
  short: "Hotels",
  description: "Rooms and homestays on a budget.",
});
Object.assign(en.PostTypes.guide_notes, {
  label: "Things to note",
  short: "Notes",
  description: "Best seasons and pitfalls.",
});
Object.assign(en.PostTypes.guide_transport, {
  label: "Getting around",
  short: "Transport",
  description: "Bus, train, flights and rentals.",
});
Object.assign(en.GuideChips, {
  all: "All",
  handbook: "Handbook",
  hotel: "Hotels",
  notes: "Notes",
  transport: "Transport",
});
Object.assign(en.Editor, {
  placeholder: "Share your trip, itinerary, costs…",
  imageHint: "Place the cursor in the text, then insert an image",
});

const ko = deepClone(en);
ko.Meta = {
  siteName: "VN Insight",
  defaultTitle: "VN Insight — 베트남 여행",
  defaultDescription: "여행지, 투어, 가이드와 커뮤니티 여행 이야기.",
};
Object.assign(ko.Nav, {
  home: "홈",
  destinations: "여행지",
  tours: "투어",
  guides: "가이드",
  dashboard: "대시보드",
  login: "로그인",
  getStarted: "시작하기",
  loading: "로딩 중…",
  openMenu: "메뉴 열기",
  closeMenu: "메뉴 닫기",
  language: "언어",
  member: "회원",
  admin: "관리자",
  viewProfile: "프로필 보기",
  settings: "설정 / 프로필",
  explore: "탐색",
  logout: "로그아웃",
});
Object.assign(ko.Common, {
  save: "저장",
  cancel: "취소",
  submit: "제출",
  loading: "로딩 중…",
  readMore: "더 보기",
  backHome: "홈으로",
  notFound: "찾을 수 없음",
  empty: "콘텐츠 없음",
  search: "검색",
  views: "조회",
  vietnam: "베트남",
  back: "뒤로",
  share: "공유",
  close: "닫기",
  prev: "이전",
  next: "다음",
  all: "전체",
  readMin: "분 읽기",
});
Object.assign(ko.Errors, {
  generic: "오류가 발생했습니다. 다시 시도해 주세요.",
  network: "네트워크 오류.",
  unauthorized: "로그인이 필요합니다.",
  forbidden: "권한이 없습니다.",
});
Object.assign(ko.Auth, {
  welcomeBack: "다시 오신 것을 환영합니다",
  loginTitle: "계정에 로그인",
  noAccount: "계정이 없으신가요?",
  signUp: "가입하기",
  email: "이메일",
  password: "비밀번호",
  orWith: "또는",
  google: "Google",
  login: "로그인",
  processing: "처리 중…",
  loginSuccess: "로그인되었습니다!",
  loginError: "로그인 실패",
});
Object.assign(ko.Register, {
  startFree: "무료로 시작",
  createAccount: "새 계정 만들기",
  hasAccount: "이미 계정이 있으신가요?",
  logIn: "로그인",
  changeMethod: "가입 방법 변경",
  createBtn: "계정 만들기",
  creating: "생성 중…",
  welcomeTitle: "VN Insight에 오신 것을 환영합니다!",
  welcomeBody: "계정이 준비되었습니다.",
  exploreNow: "지금 탐색하기!",
  startExplore: "탐색 시작",
  close: "닫기",
});
Object.assign(ko.Guide, {
  toursEyebrow: "추천 체험",
  toursTitle: "투어 및 체험",
  toursSubtitle: "커뮤니티 일정 아이디어",
  viewAllTours: "모든 투어 보기",
  guidesEyebrow: "글 & 가이드",
  guidesTitle: "여행 가이드",
  guidesSubtitle: "여행자의 실전 팁",
  viewAllGuides: "모든 글 보기",
});
Object.assign(ko.Province, {
  cta: "여행지 글 보기",
  countLabel: "{count}개 성·시 — 선택하여 글 보기",
  vietnam: "베트남",
  prevProvince: "이전 성",
  nextProvince: "다음 성",
  summaryTemplate: "{name}의 여행지, 문화, 추천 여행 글을 탐색하세요.",
  selectProvince: "{region} {name} 선택",
});
Object.assign(ko.Regions, {
  capital: "수도권",
  southeast: "동남부",
  redRiverDelta: "홍강 삼각주",
  southCentral: "남중부",
  northCentral: "북중부",
  mekongDelta: "메콩 델타",
  north: "북부",
  centralHighlands: "중부 고원",
});
Object.assign(ko.Features, {
  eyebrow: "선택 이유",
  title: "자신 있게 베트남 여행",
  f1Title: "베트남 탐험",
  f1Desc: "전국의 아름다운 풍경과 도시.",
  f2Title: "인기 여행지",
  f2Desc: "하롱베이, 사파, 호이안, 푸꾸옥…",
  f3Title: "여행 가이드",
  f3Desc: "문화, 음식, 교통과 일정 팁.",
  f4Title: "추천 투어",
  f4Desc: "엄선된 투어와 잊지 못할 여행.",
});
Object.assign(ko.Search, {
  placeholder: "도·시·여행지 검색…",
  aria: "여행지 검색",
  explorePosts: "탐색에서 «{q}» 검색",
  provinceSuggestions: "지역 제안",
});
Object.assign(ko.Hero, {
  mapLoading: "지도 로딩 중…",
  topPost: "가장 많이 본 게시글",
  readFull: "전체 글 보기",
  weather: "날씨",
  feels: "체감",
  nearYou: "내 위치 근처",
  map: "지도",
  yourLocation: "내 위치",
  gpsPending: "GPS 가져오는 중…",
  gpsLocating: "위치 확인 중…",
  gpsFallback: "GPS를 가져올 수 없음",
  gpsEnableHint: "브라우저에서 위치를 허용하면 날씨와 경로를 볼 수 있습니다.",
  weatherByPost: "추천 게시글 지역 기준",
  mapPending: "게시글 목적지 — GPS 대기 중 경로 표시",
  mapRoute: "내 위치에서 게시글 목적지까지 경로",
  communityStoryDesc: "커뮤니티 여행 이야기와 일정 팁.",
  featuredFallbackTitle: "추천 여행지",
  noFeaturedImage: "대표 이미지 없음",
  updating: "업데이트 중…",
  plane: "항공",
  car: "자동차",
  moto: "오토바이",
  train: "기차",
  views: "조회 {count}회",
  defaultHeadline: "후에 고도",
  defaultDesc: "유네스코 유산, 향강과 궁중 요리.",
  aiTitle: "AI 거리·시간 예측",
  calculating: "계산 중…",
  calculatingShort: "계산 중…",
  awaitingCoords: "좌표 대기 중…",
  distanceLine: "거리 ~{km} km • 지도 모드: {mode}",
  feelsInline: "체감",
  originFromGps: "GPS 위치에서",
  originFromPlace: "{place}에서",
  originNoGps: "GPS 없음 — 기본 위치(호치민)로 추정",
  aiHeadlineTo: "{origin} → {dest}",
  travelInsightDevice:
    "{place} 기준 추정. 우선순위: 항공 → 자동차 → 오토바이 → 기차. 거리 {km} km. 추천: 항공 (~{eta}).",
  travelInsightFallback:
    "추정(GPS 없음 — 기본 위치 사용). 우선순위: 항공 → 자동차 → 오토바이 → 기차. 거리 {km} km. 추천: 항공 (~{eta}).",
  mapModeDriving: "운전",
  mapModeWalking: "도보",
  mapModeCycling: "자전거",
});
Object.assign(ko.Footer, {
  discoverTitle: "베트남 발견",
  discoverDesc: "산과 바다의 시대를 초월한 아름다움.",
  exploreNow: "지금 탐색",
  explore: "탐색",
  company: "회사",
  support: "지원",
  stayInspired: "영감 받기",
  newsletterDesc: "여행지 팁과 혜택을 받아보세요.",
  emailPlaceholder: "이메일 주소",
  subscribe: "구독",
  basedIn: "베트남 하노이 기반",
  rights: "© {year} VN Insight. 모든 권리 보유.",
  backToTop: "맨 위로",
  linkDestinations: "여행지",
  linkTours: "투어",
  linkGuides: "가이드",
  linkExperiences: "체험",
  linkAbout: "회사 소개",
  linkContact: "문의",
  linkHelp: "도움말",
  linkPrivacy: "개인정보 처리방침",
  trustedTitle: "신뢰와 안전",
  trustedDesc: "커뮤니티 콘텐츠를 검수합니다.",
  support247Title: "24시간 지원",
  support247Desc: "언제 어디서나 도와드립니다.",
  localTitle: "현지 전문성",
  localDesc: "진정한 경험과 현지 인사이트.",
  craftedTitle: "정성을 담아",
  craftedDesc: "당신만을 위한 엄선 여정.",
});
Object.assign(ko.Explore, { title: "탐색", desc: "커뮤니티 여행지 리뷰", empty: "리뷰 없음" });
Object.assign(ko.Tours, {
  title: "투어 및 체험",
  desc: "커뮤니티 투어와 하이라이트",
  community: "커뮤니티 투어 글",
  empty: "투어 글이 없습니다.",
  filterNorth: "북부",
  filterCentral: "중부",
  filterSouth: "남부",
});
Object.assign(ko.GuidesPage, { title: "여행 가이드", breadcrumb: "가이드", breadcrumbHome: "홈" });
Object.assign(ko.CreatePost, {
  title: "글 작성",
  publish: "게시",
  myPosts: "내 글",
  translating: "영어·한국어로 번역 중…",
});
Object.assign(ko.Profile, { title: "프로필", writeBtn: "글 쓰기" });
Object.assign(ko.Dashboard, { memberPage: "회원 페이지", newPost: "새 글" });
Object.assign(ko.GuideChips, {
  all: "전체",
  handbook: "가이드",
  hotel: "숙소",
  notes: "주의사항",
  transport: "이동",
});

applyEnPatches(en);
applyKoPatches(ko);

for (const [loc, data] of [
  ["vi", vi],
  ["en", en],
  ["ko", ko],
]) {
  fs.writeFileSync(`messages/${loc}.json`, JSON.stringify(data, null, 2));
}
console.log("messages written");
