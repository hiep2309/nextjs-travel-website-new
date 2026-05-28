# VietNam Insight — Website du lịch (Next.js)

Ứng dụng web giới thiệu điểm đến Việt Nam: khám phá tỉnh thành, bài viết cộng đồng, bản đồ và tích hợp Firebase (đăng nhập, Firestore, Storage).

## Công nghệ

| Lớp | Công nghệ |
|-----|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript |
| Giao diện | Tailwind CSS, Lucide React |
| Backend / dữ liệu | [Firebase](https://firebase.google.com/) — Auth (email + Google), Firestore, Storage |
| Soạn thảo bài | TipTap |
| Bản đồ | Leaflet, React-Leaflet |

## Tính năng chính

- **Trang chủ**: tìm kiếm địa điểm/bài viết, hero bài xem nhiều (Firestore), thời tiết (OpenWeather — tùy chọn), bản đồ lộ trình.
- **34 tỉnh/thành (chuẩn hiển thị 2025)**: carousel chọn tỉnh, ảnh từ `public/`, trang tĩnh `/destinations/[slug]`.
- **Khám phá / Blog**: danh sách bài đã duyệt, lọc theo tỉnh và từ khóa `?q=`.
- **Đăng ký / Đăng nhập**, **Hồ sơ**: bài và địa điểm đã lưu, lịch sử xem, đánh giá (kết hợp localStorage theo từng tài khoản).
- **Đăng bài**: rich text + ảnh, gửi chờ duyệt (hoặc đăng ngay nếu admin).
- **Dashboard admin**: duyệt bài, quản trị (role `admin` trong `users/{uid}`).
- **Tours / Guides**: nội dung gợi ý trong repo.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # build production
npm run start    # chạy bản build
npm run lint     # ESLint
```

## Biến môi trường

Tạo file **`.env.local`** ở thư mục gốc:

```env
# Bắt buộc cho AI Trip Planner + dịch bài (Gemini)
GEMINI_API_KEY=<Google AI Studio API key>

# Tùy chọn — thời tiết theo GPS trên hero (OpenWeatherMap)
NEXT_PUBLIC_WEATHER_KEY=<API key OpenWeatherMap>

# URL gốc site (SEO: Open Graph, sitemap) — production ví dụ: https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Tùy chọn — xác thực token server + cache/quota Firestore cho AI planner
# JSON một dòng của Firebase service account (Admin SDK)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Tùy chọn — ghi đè model Gemini
# GEMINI_MODEL=gemini-flash-latest
# GEMINI_MODEL_PREMIUM=gemini-2.5-flash
```

| Biến | Mô tả |
|------|--------|
| `GEMINI_API_KEY` | Dịch máy (`/api/translate/post`), dịch bài đăng, AI lập lịch trình. Không có key → bài lưu tiếng Việt; planner dùng mock. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Cho phép API verify Bearer token, lưu cache lịch trình và quota ngày trên Firestore. Không có → chỉ cache bộ nhớ (mất khi restart). |
| `NEXT_PUBLIC_WEATHER_KEY` | Thời tiết theo vị trí thiết bị. Không có → bỏ qua phần thời tiết. |
| `NEXT_PUBLIC_SITE_URL` | Mặc định `http://localhost:3000` — **nên đặt đúng domain** khi deploy. |

**Lưu ý bảo mật:** các route `/api/translate`, `/api/translate/post`, `/api/ai-trip` yêu cầu đăng nhập (Firebase ID token). Không commit `.env.local` lên git.

## SEO & ảnh

- **Metadata**: [`app/layout.tsx`](app/layout.tsx) — `metadataBase`, Open Graph/Twitter mặc định; [`app/destinations/[slug]/page.tsx`](app/destinations/[slug]/page.tsx) — OG theo tỉnh; [`app/posts/[id]/page.tsx`](app/posts/[id]/page.tsx) — `generateMetadata` đọc bài `approved` qua [`lib/firestoreServer.ts`](lib/firestoreServer.ts) (bài chờ duyệt không đọc được từ server → meta chung + `noindex`).
- **Sitemap / robots**: [`app/sitemap.ts`](app/sitemap.ts), [`app/robots.ts`](app/robots.ts).
- **JSON-LD**: `TouristDestination` trên trang địa điểm, `Article` trên trang bài (client).
- **`next/image`**: định dạng AVIF/WebP ([`next.config.js`](next.config.js)); blur placeholder dùng [`lib/imagePlaceholder.ts`](lib/imagePlaceholder.ts).
- **Upload ảnh bài**: resize + nén WebP/JPEG trước khi gửi Storage — [`lib/imageUploadPrep.ts`](lib/imageUploadPrep.ts).

## Firestore — cấu trúc & mở rộng

- Tóm tắt collection hiện tại + gợi ý `locations`, `comments`, `favorites`…: [`lib/firestoreCollections.ts`](lib/firestoreCollections.ts).

## Firebase

- Cấu hình client: [`lib/firebaseConfig.ts`](lib/firebaseConfig.ts) + [`lib/firebase.ts`](lib/firebase.ts) (Auth, Firestore, Storage).
- **Security Rules**: [`firestore.rules`](firestore.rules) — cần publish lên Firebase Console (hoặc CLI) cho khớp app.
- **Index gợi ý** (query bài theo `status` + `viewCount`): [`firestore.indexes.json`](firestore.indexes.json) — triển khai:  
  `firebase deploy --only firestore:indexes`  
  hoặc làm theo link trong Console khi query báo thiếu index.

## Thư mục đáng chú ý

```
app/                  # App Router: page, layout, API routes (nếu có)
components/           # UI: Navbar, ProvinceShowcase, Hero, ...
lib/                  # Firebase, slug tỉnh, nội dung tours/guides, ...
hooks/                # useAuth, useUserProfile, ...
public/               # ảnh tĩnh, logo, ảnh địa danh đặt tên theo tỉnh
```

## Ghi chú

- Ảnh nền chung toàn site được gắn trong [`components/AppShell.tsx`](components/AppShell.tsx).
- Danh sách 34 đơn vị và map ảnh carousel: [`lib/vietnamProvinces.ts`](lib/vietnamProvinces.ts).

---

Dự án phục vụ mục đích học tập / đồ án; chỉnh sửa rules Firestore và quyền admin trước khi deploy production.
