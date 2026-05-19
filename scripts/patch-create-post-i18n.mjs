import fs from "fs";

const p = "components/create-post/CreatePostClient.tsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace(
  `import Link from "next/link";
import { useRouter } from "next/navigation";`,
  `import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { useTravelTimeLabels } from "@/hooks/useTravelTimeLabels";`,
);

s = s.replace(
  /import \{ labelForPostType, publicPageForPostType/,
  "import { publicPageForPostType",
);

s = s.replace(/const TRAVEL_TIMES = \[[^\]]+\];\n\n/, "");

s = s.replace(/function describeSubmitError\(err: unknown\): string \{[\s\S]*?\n\}\n\n/, "");

const hook = `  const t = useTranslations("CreatePost");
  const tn = useTranslations("Nav");
  const tc = useTranslations("Common");
  const { label: labelForPostType, sectionLabel } = usePostTypeLabels();
  const travelTimes = useTravelTimeLabels();

  const describeSubmitError = (err: unknown): string => {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "permission-denied":
          return t("errPermission");
        case "storage/unauthorized":
          return t("errStorage");
        case "storage/unauthenticated":
          return t("errStorageAuth");
        case "unauthenticated":
          return t("errUnauth");
        case "failed-precondition":
          return t("errPrecondition");
        default:
          return \`\${err.message} (\${err.code})\`;
      }
    }
    if (err instanceof Error) return err.message;
    return t("errSubmit");
  };

`;

s = s.replace(
  "export default function CreatePostClient() {\n  const router = useRouter();",
  `export default function CreatePostClient() {\n${hook}  const router = useRouter();`,
);

const reps = [
  ['"Đã lưu nháp vào trình duyệt của bạn."', 't("draftSaved")'],
  ['"Không lưu được nháp."', 't("draftFailed")'],
  ['throw new Error("Chưa đăng nhập")', 'throw new Error(t("notLoggedIn"))'],
  ["`Ảnh tối đa ${IMG_MAX_MB}MB`", 't("imageTooBig", { maxMb: IMG_MAX_MB })'],
  ["`Tiêu đề bắt buộc, tối đa ${TITLE_MAX} ký tự.`", 't("errTitle", { max: TITLE_MAX })'],
  ['"Vui lòng chọn điểm đến."', 't("errDest")'],
  ['"Chọn đủ loại bài và thời gian đi."', 't("errTypeTime")'],
  ["`Nội dung vượt ${MAX_CHARS} ký tự.`", 't("errContentMax", { max: MAX_CHARS })'],
  ['"Vui lòng viết nội dung bài viết."', 't("errContent")'],
  ['"Thêm ít nhất một ảnh minh họa (PNG/JPG)."', 't("errImages")'],
  ['country: "Việt Nam"', 'country: tc("vietnam")'],
  ['|| "Thành viên"', '|| tn("member")'],
  ['alert("Đã đăng bài! Bài đã được đăng công khai.")', 'alert(t("alertPublished"))'],
  [
    'alert("Đã gửi bài! Bạn có thể xem bài trong danh sách bên phải (chờ duyệt).")',
    'alert(t("alertPending"))',
  ],
  ["{TRAVEL_TIMES.map((c) => (", "{travelTimes.map(({ value: c, label }) => ("],
  [
    `<option key={c} value={c}>
                      {c}`,
    `<option key={c} value={c}>
                      {label}`,
  ],
  ["Chia sẻ hành trình", '{t("shareJourney")}'],
  [
    "Viết kinh nghiệm và gợi ý cho cộng đồng VN Insight.",
    '{t("shareDesc")}',
  ],
  ["Khám phá ngay", '{t("exploreNow")}'],
  ["Đăng bài mới", '{t("title")}'],
  ["Chia sẻ trải nghiệm du lịch", '{t("headline")}'],
  [
    "Chọn loại bài để phân loại đúng mục. Bạn có thể xem và mở lại mọi bài đã đăng ở cột bên phải.",
    '{t("intro")}',
  ],
  ["Tiêu đề bài viết", '{t("fieldTitle")}'],
  ['placeholder="Ví dụ: Săn mây Sapa trong 3 ngày 2 đêm"', 'placeholder={t("titlePlaceholder")}'],
  ["Điểm đến", '{t("fieldDest")}'],
  ['placeholder="Tìm tỉnh / thành phố…"', 'placeholder={t("destSearch")}'],
  ["Không thấy kết quả", '{t("noResults")}'],
  ['Đã chọn: {destination}', '{t("destSelected", { name: destination })}'],
  ["Thời gian đi", '{t("travelTime")}'],
  ['<option value="">— Chọn —</option>', '<option value="">{t("select")}</option>'],
  ["Nội dung bài viết", '{t("fieldContent")}'],
  [
    "Định dạng văn bản; chèn ảnh giữa bài tại vị trí con trỏ (icon ảnh trên thanh công cụ).",
    '{t("contentHint")}',
  ],
  ["Hình ảnh", '{t("fieldImages")}'],
  [
    "Kéo thả hoặc bấm chọn — PNG, JPG, JPEG · tối đa {IMG_MAX_MB}MB/ảnh · tối đa {IMG_MAX_FILES} ảnh. Ảnh được\n                  resize/nén (WebP/JPEG) trước khi tải lên để tiết kiệm dung lượng.",
    '{t("imagesHint", { maxMb: IMG_MAX_MB, maxFiles: IMG_MAX_FILES })}',
  ],
  ['"Đang tối ưu ảnh…"', 't("compressing")'],
  ['"Thêm ảnh từ thiết bị"', 't("addImages")'],
  ['aria-label="Xóa ảnh"', 'aria-label={t("removeImage")}'],
  ["Thẻ (tags)", '{t("fieldTags")}'],
  [
    'placeholder="biển, núi, ẩm thực (phân tách bằng dấu phẩy)"',
    'placeholder={t("tagsPlaceholder")}',
  ],
  ["Mẹo hữu ích", '{t("tipsTitle")}'],
  ["Viết tiêu đề rõ ràng, hấp dẫn.", '{t("tip1")}'],
  ["Nội dung chi tiết: lịch trình, chi phí, mẹo di chuyển.", '{t("tip2")}'],
  ["Ảnh sáng, đúng chủ đề sẽ dễ được duyệt hơn.", '{t("tip3")}'],
  ["Thêm thẻ liên quan để người đọc dễ tìm.", '{t("tip4")}'],
  ["Xem trước bài viết", '{t("preview")}'],
  ["Chưa có ảnh bìa", '{t("noCover")}'],
  ['{destination || "Điểm đến"}', '{destination || t("destFallback")}'],
  [': "Loại bài"}', ': t("postTypeFallback")}'],
  ['{title || "Tiêu đề bài viết"}', '{title || t("previewTitle")}'],
  [
    '{excerptPlain || "Đoạn mở đầu sẽ hiển thị tại đây…"}',
    '{excerptPlain || t("previewExcerpt")}',
  ],
  ["Chưa đăng", '{t("draft")}'],
  ["Lưu nháp", '{t("saveDraft")}'],
  ["Đăng bài", '{t("publish")}'],
  ["Đã lưu", '{t("saved")}'],
  ["Đã xem", '{t("viewed")}'],
  ["Đánh giá", '{t("reviews")}'],
  ["Khám phá", '{tn("explore")}'],
  ["Menu", '{t("menu")}'],
  ['Sau khi duyệt →', '{t("afterApprove")} →'],
];

for (const [a, b] of reps) {
  if (!s.includes(a)) console.warn("missing:", a.slice(0, 40));
  s = s.split(a).join(b);
}

// public page label
s = s.replace(
  /{publicPageForPostType\(postType\)\.label}/g,
  "{sectionLabel(publicPageForPostType(postType).section)}",
);

fs.writeFileSync(p, s);
console.log("done");
