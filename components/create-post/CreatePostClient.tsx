/**
 * Luồng đăng bài đầy đủ — form, editor TipTap, upload ảnh Storage, ghi document `posts`.
 *
 * Chức năng:
 * - Kiểm tra đăng nhập; nháp trong `localStorage` theo uid.
 * - User thường: `status: pending`; admin (đọc `users/{uid}.role`): `approved`.
 * - Hiển thị lỗi Firebase chi tiết qua `describeSubmitError`.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronRight,
  Compass,
  FolderOpen,
  History,
  ImagePlus,
  Loader2,
  Plane,
  Search,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { FirebaseError } from "firebase/app";
import { auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { useAuth } from "@/hooks/useAuth";
import { CreatePostRichEditor, MAX_CHARS } from "./CreatePostRichEditor";

const glass = "rounded-2xl border border-white/12 bg-white/[0.06] shadow-xl backdrop-blur-xl";

const TITLE_MAX = 100;
const IMG_MAX_MB = 10;
const IMG_MAX_FILES = 4;

const CATEGORIES = ["Khám phá", "Ẩm thực", "Nghỉ dưỡng", "Văn hóa", "Sinh thái", "Phiêu lưu", "Khác"];
const TRAVEL_TIMES = ["Trong ngày", "1–3 ngày", "4–7 ngày", "1–2 tuần", "Trên 2 tuần"];

function draftKey(uid: string) {
  return `vninsight_create_post_draft:${uid}`;
}

function sanitizeBasicHtml(html: string): string {
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/\son\w+\s*=/gi, " data-blocked=");
  return s;
}

function describeSubmitError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "permission-denied":
        return "Firestore từ chối ghi bài (permission-denied). Cập nhật Firestore Rules: cho phép user đã đăng nhập tạo bài với authorId = uid và status = pending — xem file firestore.rules trong repo.";
      case "storage/unauthorized":
        return "Storage từ chối tải ảnh (storage/unauthorized). Thêm rule cho path posts/{userId}/... — xem storage.rules trong repo.";
      case "storage/unauthenticated":
        return "Chưa đăng nhập Storage — đăng nhập lại.";
      case "unauthenticated":
        return "Phiên đăng nhập hết hạn — đăng nhập lại.";
      case "failed-precondition":
        return "Firestore báo failed-precondition (thiếu composite index hoặc query không khớp rules). Xem Console → Firestore → Indexes.";
      default:
        return `${err.message} (${err.code})`;
    }
  }
  return "Gửi bài thất bại. Kiểm tra mạng và console trình duyệt (F12).";
}

export default function CreatePostClient() {
  const router = useRouter();
  const { user, loading, role } = useAuth();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [destOpen, setDestOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [docHtml, setDocHtml] = useState("");
  const initialHtmlRef = useRef<string>("");
  const destRootRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  const [files, setFiles] = useState<{ id: string; file: File; preview: string }[]>([]);

  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const provincesFiltered = useMemo(() => {
    const q = normalizeVietnameseText(destQuery.trim());
    if (!q) return VIETNAM_PROVINCES.slice(0, 80);
    return VIETNAM_PROVINCES.filter((p) => normalizeVietnameseText(p.name).includes(q)).slice(0, 40);
  }, [destQuery]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || hydrated) return;
    try {
      const raw = localStorage.getItem(draftKey(user.uid));
      if (raw) {
        const d = JSON.parse(raw) as {
          title?: string;
          destination?: string;
          category?: string;
          travelTime?: string;
          tagsRaw?: string;
          html?: string;
        };
        setTitle(d.title ?? "");
        setDestination(d.destination ?? "");
        setDestQuery(d.destination ?? "");
        setCategory(d.category ?? "");
        setTravelTime(d.travelTime ?? "");
        setTagsRaw(d.tagsRaw ?? "");
        initialHtmlRef.current = d.html ?? "";
        setDocHtml(d.html ?? "");
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [user, hydrated]);

  useEffect(() => () => files.forEach((x) => URL.revokeObjectURL(x.preview)), [files]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 3800);
    return () => clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = destRootRef.current;
      if (el && !el.contains(e.target as Node)) setDestOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const onDocChange = useCallback(({ html }: { html: string; plain: string; plainLength: number }) => {
    setDocHtml(html);
  }, []);

  const pickProvince = (name: string) => {
    setDestination(name);
    setDestQuery(name);
    setDestOpen(false);
  };

  const tagsArray = tagsRaw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const excerptPlain = useMemo(() => {
    try {
      const stripped = docHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return stripped.slice(0, 220) + (stripped.length > 220 ? "…" : "");
    } catch {
      return "";
    }
  }, [docHtml]);

  const saveDraft = () => {
    if (!user) return;
    try {
      localStorage.setItem(
        draftKey(user.uid),
        JSON.stringify({
          title,
          destination,
          category,
          travelTime,
          tagsRaw,
          html: docHtml,
        }),
      );
      setBanner({ kind: "ok", text: "Đã lưu nháp vào trình duyệt của bạn." });
    } catch {
      setBanner({ kind: "err", text: "Không lưu được nháp." });
    }
  };

  const removeFile = (id: string) =>
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });

  const onFilesChosen = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...files];
    for (let i = 0; i < list.length; i++) {
      if (next.length >= IMG_MAX_FILES) break;
      const file = list[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > IMG_MAX_MB * 1024 * 1024) continue;
      next.push({
        id: `${Date.now()}_${i}_${file.name}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setFiles(next);
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cur = auth.currentUser;
    if (!cur) return;

    const t = title.trim();
    if (!t || t.length > TITLE_MAX) {
      setBanner({ kind: "err", text: `Tiêu đề bắt buộc, tối đa ${TITLE_MAX} ký tự.` });
      return;
    }
    const dest = destination.trim();
    if (!dest) {
      setBanner({ kind: "err", text: "Vui lòng chọn điểm đến." });
      return;
    }
    if (!category || !travelTime) {
      setBanner({ kind: "err", text: "Chọn đủ danh mục và thời gian đi." });
      return;
    }
    const plainText = docHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const contentLen = plainText.length;
    if (!plainText || contentLen > MAX_CHARS) {
      setBanner({
        kind: "err",
        text: contentLen > MAX_CHARS ? `Nội dung vượt ${MAX_CHARS} ký tự.` : "Vui lòng viết nội dung bài viết.",
      });
      return;
    }
    if (files.length === 0) {
      setBanner({ kind: "err", text: "Thêm ít nhất một ảnh minh họa (PNG/JPG)." });
      return;
    }

    setBusy(true);
    setBanner(null);
    try {
      let isAdminPoster = false;
      try {
        const userSnap = await getDoc(doc(db, "users", cur.uid));
        if (userSnap.exists() && userSnap.data().role === "admin") {
          isAdminPoster = true;
        }
      } catch {
        isAdminPoster = role === "admin";
      }

      const urls: string[] = [];
      let i = 0;
      for (const slot of files) {
        const ext = slot.file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "jpg";
        const path = `posts/${cur.uid}/${Date.now()}_${i}.${ext}`;
        const sref = ref(storage, path);
        await uploadBytes(sref, slot.file, { contentType: slot.file.type });
        urls.push(await getDownloadURL(sref));
        i += 1;
      }

      const primary = urls[0]!;
      const slugSafe = `${t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-${Date.now()}`.replace(/-+/g, "-");
      const status = isAdminPoster ? "approved" : "pending";

      await addDoc(collection(db, "posts"), {
        name: t,
        title: t,
        description: plainText,
        contentHtml: sanitizeBasicHtml(docHtml),
        region: dest,
        country: "Việt Nam",
        category,
        travelTime,
        tags: tagsArray,
        images: urls,
        image: primary,
        thumb: primary,
        status,
        authorId: cur.uid,
        authorName: cur.displayName || cur.email?.split("@")[0] || "Thành viên",
        createdAt: serverTimestamp(),
        slug: slugSafe,
        number: 0,
        viewCount: 0,
      });

      try {
        localStorage.removeItem(draftKey(cur.uid));
      } catch {
        /* */
      }

      if (isAdminPoster) {
        alert("Đã đăng bài! Bài đã được đăng công khai.");
        router.push("/explore");
      } else {
        alert("Đã gửi bài! Vui lòng chờ admin duyệt.");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setBanner({ kind: "err", text: describeSubmitError(err) });
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="relative flex min-h-[50vh] items-center justify-center pt-24 text-white">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/signup_pic.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/35 to-black/70" />
        <Loader2 className="size-8 animate-spin text-violet-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 pt-24 text-white">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/signup_pic.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/35 to-black/70" />

      {banner ? (
        <div
          className={`fixed bottom-6 left-1/2 z-[90] max-w-[min(90vw,420px)] -translate-x-1/2 rounded-xl border px-4 py-3 text-sm shadow-xl ${
            banner.kind === "ok"
              ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-100"
              : "border-red-500/40 bg-red-950/95 text-red-100"
          }`}
          role="status"
        >
          {banner.text}
        </div>
      ) : null}

      <div className="mx-auto max-w-[1400px] gap-8 px-4 lg:flex lg:px-8">
        <aside className={`${glass} mb-8 shrink-0 p-4 lg:mb-0 lg:w-56 xl:w-60`}>
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Menu</p>
          <nav className="mt-3 space-y-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/10"
            >
              <Bookmark className="size-4 opacity-80" />
              Đã lưu
            </Link>
            <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/35">
              <History className="size-4 opacity-80" />
              Đã xem
            </span>
            <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/35">
              <Star className="size-4 opacity-80" />
              Đánh giá
            </span>
            <Link
              href="/explore"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/10"
            >
              <Compass className="size-4" />
              Khám phá
            </Link>
            <div className="flex items-center gap-3 rounded-xl bg-violet-600/35 px-3 py-2.5 text-sm font-bold text-white ring-1 ring-violet-400/40">
              <Plane className="size-4" />
              Đăng bài
            </div>
          </nav>
          <div className={`${glass} relative mt-4 overflow-hidden border-white/10 p-4`}>
            <Sparkles className="absolute right-2 top-2 size-7 text-violet-400/30" aria-hidden />
            <p className="text-sm font-bold">Chia sẻ hành trình</p>
            <p className="mt-2 text-xs text-white/55">Viết kinh nghiệm và gợi ý cho cộng đồng VN Insight.</p>
            <Link
              href="/explore"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-500"
            >
              Khám phá ngay
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/70">Đăng bài mới</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Chia sẻ trải nghiệm du lịch</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Điền tiêu đề, điểm đến, ảnh và nội dung — bài sẽ ở trạng thái chờ duyệt trước khi hiển thị công khai.
          </p>

          <form onSubmit={submitPost} className="mt-8 space-y-6">
            <div className={`${glass} space-y-6 p-5 sm:p-7`}>
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-white/80">
                  Tiêu đề bài viết
                  <span className={`text-xs font-medium ${title.length > TITLE_MAX ? "text-amber-400" : "text-white/45"}`}>
                    {title.length}/{TITLE_MAX}
                  </span>
                </label>
                <input
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30"
                  placeholder="Ví dụ: Săn mây Sapa trong 3 ngày 2 đêm"
                  required
                />
              </div>

              <div
                ref={destRootRef}
                className="relative"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <label className="text-sm font-semibold text-white/80">Điểm đến</label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setDestOpen(true);
                    }}
                    onFocus={() => setDestOpen(true)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-500/50"
                    placeholder="Tìm tỉnh / thành phố…"
                    autoComplete="off"
                  />
                </div>
                {destOpen ? (
                  <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1a1225] py-1 text-sm shadow-2xl">
                    {provincesFiltered.map((p) => (
                      <li key={p.name}>
                        <button
                          type="button"
                          className="flex w-full px-4 py-2.5 text-left text-white/90 hover:bg-violet-600/25"
                          onClick={() => pickProvince(p.name)}
                        >
                          <span>{p.name}</span>
                          <span className="ml-auto text-xs text-white/40">{p.region}</span>
                        </button>
                      </li>
                    ))}
                    {provincesFiltered.length === 0 ? (
                      <li className="px-4 py-3 text-white/45">Không thấy kết quả</li>
                    ) : null}
                  </ul>
                ) : null}
                {destination ? <p className="mt-1.5 text-xs text-violet-300/80">Đã chọn: {destination}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-white/80">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                    required
                  >
                    <option value="">— Chọn —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/80">Thời gian đi</label>
                  <select
                    value={travelTime}
                    onChange={(e) => setTravelTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                    required
                  >
                    <option value="">— Chọn —</option>
                    {TRAVEL_TIMES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">Nội dung bài viết</label>
                <p className="mb-2 mt-1 text-xs text-white/45">Định dạng đậm, nghiêng, danh sách, trích dẫn và liên kết.</p>
                {hydrated ? (
                  <CreatePostRichEditor
                    key={`editor-${user.uid}`}
                    initialHtml={initialHtmlRef.current}
                    onDocChange={onDocChange}
                  />
                ) : (
                  <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">Hình ảnh</label>
                <p className="mt-1 text-xs text-white/45">
                  Kéo thả hoặc bấm chọn — PNG, JPG, JPEG · tối đa {IMG_MAX_MB}MB/ảnh · tối đa {IMG_MAX_FILES} ảnh.
                </p>
                <label
                  htmlFor="post-images"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    onFilesChosen(e.dataTransfer.files);
                  }}
                  className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/35 bg-violet-500/[0.07] px-4 py-10 transition hover:border-violet-400/55 hover:bg-violet-500/10"
                >
                  <ImagePlus className="size-10 text-violet-300/80" />
                  <span className="mt-2 text-sm font-medium text-white/70">Thêm ảnh từ thiết bị</span>
                  <input
                    id="post-images"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    className="hidden"
                    onChange={(e) => onFilesChosen(e.target.files)}
                  />
                </label>
                {files.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {files.map((f) => (
                      <div key={f.id} className="relative size-24 overflow-hidden rounded-xl border border-white/15 sm:size-28">
                        <Image src={f.preview} alt="" fill className="object-cover" sizes="112px" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                          aria-label="Xóa ảnh"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">Thẻ (tags)</label>
                <input
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-500/50"
                  placeholder="biển, núi, ẩm thực (phân tách bằng dấu phẩy)"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                >
                  <FolderOpen className="size-4" />
                  Lưu nháp
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Đăng bài
                </button>
              </div>
            </div>
          </form>
        </div>

        <aside className="mt-10 w-full shrink-0 space-y-6 lg:mt-0 lg:w-72 xl:w-80">
          <div className={`${glass} p-5`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300/90">Mẹo hữu ích</h3>
            <ul className="mt-4 list-inside space-y-3 text-sm text-white/65">
              <li>Viết tiêu đề rõ ràng, hấp dẫn.</li>
              <li>Nội dung chi tiết: lịch trình, chi phí, mẹo di chuyển.</li>
              <li>Ảnh sáng, đúng chủ đề sẽ dễ được duyệt hơn.</li>
              <li>Thêm thẻ liên quan để người đọc dễ tìm.</li>
            </ul>
          </div>

          <div className={`${glass} overflow-hidden`}>
            <h3 className="border-b border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-wider text-violet-300/90">
              Xem trước bài viết
            </h3>
            <div className="p-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {files[0] ? (
                  <Image src={files[0].preview} alt="" fill className="object-cover" sizes="320px" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/35">Chưa có ảnh bìa</div>
                )}
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/45">
                {destination || "Điểm đến"} · {category || "Danh mục"}
              </p>
              <p className="mt-2 line-clamp-2 text-lg font-bold leading-snug">{title || "Tiêu đề bài viết"}</p>
              <p className="mt-2 line-clamp-3 text-sm text-white/55">{excerptPlain || "Đoạn mở đầu sẽ hiển thị tại đây…"}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                <span>👁 0</span>
                <span>💬 0</span>
              </div>
              <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                Chưa đăng
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
