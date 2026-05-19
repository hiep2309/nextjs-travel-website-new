import fs from "fs";

const p = "app/[locale]/posts/[id]/PostDetailClient.tsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace('import Link from "next/link";', `import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";`);
s = s.replace(
  'import { labelForPostType, resolvePostType } from "@/lib/postCategories";',
  'import { resolvePostType } from "@/lib/postCategories";\nimport { usePostTypeLabels } from "@/hooks/usePostTypeLabels";',
);

s = s.replace(
  "export default function PostDetailClient() {\n  const params = useParams();",
  `export default function PostDetailClient() {
  const t = useTranslations("Posts");
  const tc = useTranslations("Common");
  const { label: labelForPostType } = usePostTypeLabels();
  const params = useParams();`,
);

const reps = [
  ['setErr("Không tìm thấy bài viết.");', 'setErr(t("notFound"));'],
  ['setErr("Lỗi tải bài viết.");', 'setErr(t("loadError"));'],
  ['post.title || post.name || "Bài viết"', 'post.title || post.name || t("defaultTitle")'],
  ['showToast(next ? "Đã lưu bài viết" : "Đã bỏ lưu")', 'showToast(next ? t("saveToast") : t("unsaveToast"))'],
  [
    'showToast(`Đã lưu ${stars} sao — xem tại trang cá nhân`)',
    'showToast(t("rateToast", { stars }))',
  ],
  ['? "Quay lại Tours"', '? t("backTours")'],
  ['? "Quay lại Cẩm nang"', '? t("backGuides")'],
  [': "Quay lại Destinations"', ': t("backDestinations")'],
  [
    '"Bài viết đang chờ admin duyệt. Sau khi được duyệt, bài sẽ hiển thị trên trang Khám phá."',
    't("pendingNotice")',
  ],
  ['{post.region || "Việt Nam"}', '{post.region || tc("vietnam")}'],
  ['} lượt xem', `} {tc("views")}`],
  ['{saved ? "Đã lưu" : "Lưu bài viết"}', '{saved ? t("saved") : t("savePost")}'],
  ['<p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">Đánh giá của bạn</p>', '<p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">{t("yourRating")}</p>'],
  [
    '{myStars ? `Đã chấm ${myStars} sao — hiển thị trong Hồ sơ.` : "Chạm sao để lưu điểm của bạn."}',
    '{myStars ? t("ratedHint", { stars: myStars }) : t("rateHint")}',
  ],
  ['aria-label="Chấm điểm 1–5 sao"', 'aria-label={t("rateAria")}'],
];

for (const [a, b] of reps) {
  if (!s.includes(a)) console.warn("missing:", a.slice(0, 50));
  s = s.split(a).join(b);
}

fs.writeFileSync(p, s);
console.log("done");
