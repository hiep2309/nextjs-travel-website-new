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
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { canEditPost } from "@/lib/posts/permissions";
import { usePostTypeLabels } from "@/hooks/usePostTypeLabels";
import { useTravelTimeLabels } from "@/hooks/useTravelTimeLabels";
import { requestPostTranslation } from "@/lib/translation/requestPostTranslation";
import { normalizeLocalizedSlug, normalizeLocalizedString } from "@/lib/firestore/multilingual";
import type { LocalizedSlug } from "@/lib/i18n/types";
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
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { VIETNAM_PROVINCES } from "@/lib/vietnamProvinces";
import { normalizeVietnameseText } from "@/lib/normalizeVn";
import { useAuth } from "@/hooks/useAuth";
import { prepareImageForUpload } from "@/lib/imageUploadPrep";
import { CreatePostRichEditor, MAX_CHARS } from "./CreatePostRichEditor";
import { publicPageForPostType, sectionForPostType, type PostType } from "@/lib/postCategories";
import PostTypePicker from "./PostTypePicker";
import MyPostsPanel from "./MyPostsPanel";

const glass = "rounded-2xl border border-white/12 bg-white/[0.06] shadow-xl backdrop-blur-xl";
const POST_SAVED_TOAST_KEY = "vninsight_post_saved";

const TITLE_MAX = 100;
const IMG_MAX_MB = 10;
const IMG_MAX_FILES = 4;

function draftKey(uid: string) {
  return `vninsight_create_post_draft:${uid}`;
}

function sanitizeBasicHtml(html: string): string {
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/\son\w+\s*=/gi, " data-blocked=");
  return s;
}

export default function CreatePostClient() {
  const t = useTranslations("CreatePost");
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
          return `${err.message} (${err.code})`;
      }
    }
    if (err instanceof Error) return err.message;
    return t("errSubmit");
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams.get("edit");
  const { user, loading, role } = useAuth();

  const [editMeta, setEditMeta] = useState<{
    id: string;
    status: string;
    existingUrls: string[];
    existingSlugs?: LocalizedSlug;
  } | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(Boolean(editPostId));

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [destOpen, setDestOpen] = useState(false);
  const [postType, setPostType] = useState<PostType | "">("");
  const [travelTime, setTravelTime] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [docHtml, setDocHtml] = useState("");
  const initialHtmlRef = useRef<string>("");
  const destRootRef = useRef<HTMLDivElement>(null);
  const editLoadedIdRef = useRef<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [files, setFiles] = useState<{ id: string; file: File; preview: string }[]>([]);

  const [busy, setBusy] = useState(false);
  const [compressingImages, setCompressingImages] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [myPostsRefresh, setMyPostsRefresh] = useState(0);

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
    if (!editPostId || !user) {
      editLoadedIdRef.current = null;
      setEditMeta(null);
      setLoadingEdit(false);
      if (!editPostId) setHydrated(false);
      return;
    }

    if (editLoadedIdRef.current === editPostId) return;

    let alive = true;
    (async () => {
      setLoadingEdit(true);
      try {
        let effectiveRole = role;
        if (effectiveRole == null) {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          effectiveRole = userSnap.exists() ? String(userSnap.data().role || "user") : "user";
        }

        const snap = await getDoc(doc(db, "posts", editPostId));
        if (!snap.exists()) {
          if (alive) {
            setBanner({ kind: "err", text: t("loadEditErr") });
            setHydrated(true);
          }
          return;
        }
        const data = snap.data() as Record<string, unknown>;
        const authorId = String(data.authorId ?? "");
        const status = String(data.status ?? "pending");
        if (!canEditPost(effectiveRole, user.uid, authorId, status)) {
          if (alive) {
            setBanner({ kind: "err", text: t("editForbidden") });
            router.replace("/create-post");
          }
          return;
        }
        if (!alive) return;

        const titleVi = pickLocalized(
          (data.title as string | { vi?: string }) ?? (data.name as string),
          "vi",
        );
        const htmlVi = pickLocalized(data.contentHtml as string | { vi?: string }, "vi");
        const images = Array.isArray(data.images)
          ? (data.images as string[]).filter(Boolean)
          : data.image
            ? [String(data.image)]
            : [];

        const existingSlugs = normalizeLocalizedSlug(
          data.slugs,
          typeof data.slug === "string" ? data.slug : undefined,
          normalizeLocalizedString(data.title, typeof data.name === "string" ? data.name : undefined),
        );

        setTitle(titleVi);
        setDestination(String(data.region ?? ""));
        setDestQuery(String(data.region ?? ""));
        setPostType((data.postType as PostType) || "");
        setTravelTime(String(data.travelTime ?? ""));
        setTagsRaw(Array.isArray(data.tags) ? (data.tags as string[]).join(", ") : "");
        setDocHtml(htmlVi);
        initialHtmlRef.current = htmlVi;
        setEditMeta({ id: editPostId, status, existingUrls: images, existingSlugs });
        editLoadedIdRef.current = editPostId;
        setHydrated(true);
      } catch {
        if (alive) {
          setBanner({ kind: "err", text: t("loadEditErr") });
          setHydrated(true);
        }
      } finally {
        if (alive) setLoadingEdit(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [editPostId, user, role, router, t]);

  useEffect(() => {
    if (!user || hydrated || editPostId) return;
    try {
      const raw = localStorage.getItem(draftKey(user.uid));
      if (raw) {
        const d = JSON.parse(raw) as {
          title?: string;
          destination?: string;
          postType?: PostType;
          travelTime?: string;
          tagsRaw?: string;
          html?: string;
        };
        setTitle(d.title ?? "");
        setDestination(d.destination ?? "");
        setDestQuery(d.destination ?? "");
        setPostType(d.postType ?? "");
        setTravelTime(d.travelTime ?? "");
        setTagsRaw(d.tagsRaw ?? "");
        initialHtmlRef.current = d.html ?? "";
        setDocHtml(d.html ?? "");
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [user, hydrated, editPostId]);

  useEffect(() => () => files.forEach((x) => URL.revokeObjectURL(x.preview)), [files]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 3800);
    return () => clearTimeout(timer);
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
          postType,
          travelTime,
          tagsRaw,
          html: docHtml,
        }),
      );
      setBanner({ kind: "ok", text: t("draftSaved") });
    } catch {
      setBanner({ kind: "err", text: t("draftFailed") });
    }
  };

  const removeFile = (id: string) =>
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });

  const uploadInlineImage = useCallback(async (file: File) => {
    const cur = auth.currentUser;
    if (!cur) throw new Error(t("notLoggedIn"));
    const prepared = await prepareImageForUpload(file);
    if (prepared.size > IMG_MAX_MB * 1024 * 1024) {
      throw new Error(t("imageTooBig", { maxMb: IMG_MAX_MB }));
    }
    const ext = prepared.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "jpg";
    const path = `posts/${cur.uid}/inline/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const sref = ref(storage, path);
    await uploadBytes(sref, prepared, { contentType: prepared.type });
    return getDownloadURL(sref);
  }, []);

  const onFilesChosen = async (list: FileList | null) => {
    if (!list?.length) return;
    setCompressingImages(true);
    try {
      const additions: { id: string; file: File; preview: string }[] = [];
      for (let i = 0; i < list.length; i++) {
        const raw = list[i];
        if (!raw.type.startsWith("image/")) continue;
        if (raw.size > IMG_MAX_MB * 1024 * 1024) continue;

        const file = await prepareImageForUpload(raw);
        if (file.size > IMG_MAX_MB * 1024 * 1024) continue;

        additions.push({
          id: `${Date.now()}_${i}_${file.name}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }
      const keptCount = editMeta?.existingUrls.length ?? 0;
      const maxNew = Math.max(0, IMG_MAX_FILES - keptCount);
      setFiles((prev) => [...prev, ...additions].slice(0, maxNew));
    } finally {
      setCompressingImages(false);
    }
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cur = auth.currentUser;
    if (!cur) return;

    const titleTrim = title.trim();
    if (!titleTrim || titleTrim.length > TITLE_MAX) {
      setBanner({ kind: "err", text: t("errTitle", { max: TITLE_MAX }) });
      return;
    }
    const dest = destination.trim();
    if (!dest) {
      setBanner({ kind: "err", text: t("errDest") });
      return;
    }
    if (!postType || !travelTime) {
      setBanner({ kind: "err", text: t("errTypeTime") });
      return;
    }
    const plainText = docHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const contentLen = plainText.length;
    if (!plainText || contentLen > MAX_CHARS) {
      setBanner({
        kind: "err",
        text: contentLen > MAX_CHARS ? t("errContentMax", { max: MAX_CHARS }) : t("errContent"),
      });
      return;
    }
    const hasImages = files.length > 0 || (editMeta?.existingUrls.length ?? 0) > 0;
    if (!hasImages) {
      setBanner({ kind: "err", text: t("errImages") });
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

      const kept = editMeta?.existingUrls ?? [];
      const allUrls = [...kept, ...urls];
      const primary = allUrls[0]!;

      setBanner({ kind: "ok", text: t("translating") });
      const localePayload = await requestPostTranslation({
        title: titleTrim,
        description: plainText,
        contentHtml: sanitizeBasicHtml(docHtml),
        sourceLocale: "vi",
        existingSlugs: editMeta?.existingSlugs,
        slugSuffix: Date.now().toString(36),
      });

      if (editMeta) {
        await updateDoc(doc(db, "posts", editMeta.id), {
          ...localePayload,
          region: dest,
          postType,
          category: labelForPostType(postType),
          travelTime,
          tags: tagsArray,
          images: allUrls,
          image: primary,
          thumb: primary,
          updatedAt: serverTimestamp(),
        });
        setMyPostsRefresh((n) => n + 1);
        try {
          sessionStorage.setItem(POST_SAVED_TOAST_KEY, editMeta.id);
        } catch {
          /* ignore */
        }
        alert(t("alertUpdated"));
        router.push(`/posts/${editMeta.id}`);
        return;
      }

      const status = isAdminPoster ? "approved" : "pending";

      await addDoc(collection(db, "posts"), {
        ...localePayload,
        region: dest,
        country: tc("vietnam"),
        postType,
        category: labelForPostType(postType),
        travelTime,
        tags: tagsArray,
        images: urls,
        image: primary,
        thumb: primary,
        status,
        authorId: cur.uid,
        authorName: cur.displayName || cur.email?.split("@")[0] || tn("member"),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        number: 0,
        viewCount: 0,
      });

      try {
        localStorage.removeItem(draftKey(cur.uid));
      } catch {
        /* */
      }

      setMyPostsRefresh((n) => n + 1);

      if (isAdminPoster) {
        alert(t("alertPublished"));
        router.push(publicPageForPostType(postType).href);
      } else {
        alert(t("alertPending"));
        setTitle("");
        setDestination("");
        setDestQuery("");
        setPostType("");
        setTravelTime("");
        setTagsRaw("");
        setDocHtml("");
        initialHtmlRef.current = "";
        setFiles((prev) => {
          prev.forEach((x) => URL.revokeObjectURL(x.preview));
          return [];
        });
      }
    } catch (err) {
      console.error(err);
      setBanner({ kind: "err", text: describeSubmitError(err) });
    } finally {
      setBusy(false);
    }
  };

  const removeExistingUrl = (url: string) => {
    setEditMeta((prev) =>
      prev ? { ...prev, existingUrls: prev.existingUrls.filter((u) => u !== url) } : null,
    );
  };

  const editorKey = editMeta ? `edit-${editMeta.id}` : `new-${user?.uid ?? "guest"}`;
  const coverPreview = files[0]?.preview ?? editMeta?.existingUrls[0] ?? null;

  if (loading || !user) {
    return (
      <div className="relative flex min-h-[50vh] items-center justify-center pt-24 text-white">
        <Loader2 className="size-8 animate-spin text-violet-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 pt-24 text-white">
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
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{t("menu")}</p>
          <nav className="mt-3 space-y-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/10"
            >
              <Bookmark className="size-4 opacity-80" />
              {t("saved")}
            </Link>
            <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/35">
              <History className="size-4 opacity-80" />
              {t("viewed")}
            </span>
            <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/35">
              <Star className="size-4 opacity-80" />
              {t("reviews")}
            </span>
            <Link
              href="/explore"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/10"
            >
              <Compass className="size-4" />
              {tn("explore")}
            </Link>
            <div className="flex items-center gap-3 rounded-xl bg-violet-600/35 px-3 py-2.5 text-sm font-bold text-white ring-1 ring-violet-400/40">
              <Plane className="size-4" />
              {t("publish")}
            </div>
          </nav>
          <div className={`${glass} relative mt-4 overflow-hidden border-white/10 p-4`}>
            <Sparkles className="absolute right-2 top-2 size-7 text-violet-400/30" aria-hidden />
            <p className="text-sm font-bold">{t("shareJourney")}</p>
            <p className="mt-2 text-xs text-white/55">{t("shareDesc")}</p>
            <Link
              href="/explore"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-500"
            >
              {t("exploreNow")}
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/70">
            {editMeta ? t("editMode") : t("title")}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {editMeta ? t("editMode") : t("headline")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            {t("intro")}
          </p>

          <form onSubmit={submitPost} className="mt-8 space-y-6">
            <div className={`${glass} space-y-6 p-5 sm:p-7`}>
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-white/80">
                  {t("fieldTitle")}
                  <span className={`text-xs font-medium ${title.length > TITLE_MAX ? "text-amber-400" : "text-white/45"}`}>
                    {title.length}/{TITLE_MAX}
                  </span>
                </label>
                <input
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30"
                  placeholder={t("titlePlaceholder")}
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
                <label className="text-sm font-semibold text-white/80">{t("fieldDest")}</label>
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
                    placeholder={t("destSearch")}
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
                      <li className="px-4 py-3 text-white/45">{t("noResults")}</li>
                    ) : null}
                  </ul>
                ) : null}
                {destination ? <p className="mt-1.5 text-xs text-violet-300/80">{t("destSelected", { name: destination })}</p> : null}
              </div>

              <PostTypePicker value={postType} onChange={setPostType} />

              <div>
                <label className="text-sm font-semibold text-white/80">{t("travelTime")}</label>
                <select
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  required
                >
                  <option value="">{t("select")}</option>
                  {travelTimes.map(({ value: c, label }) => (
                    <option key={c} value={c}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">{t("fieldContent")}</label>
                <p className="mb-2 mt-1 text-xs text-white/45">
                  {t("contentHint")}
                </p>
                {loadingEdit ? (
                  <div className="flex h-64 items-center justify-center rounded-2xl bg-white/5">
                    <Loader2 className="size-6 animate-spin text-violet-400" aria-hidden />
                  </div>
                ) : hydrated ? (
                  <CreatePostRichEditor
                    key={editorKey}
                    initialHtml={initialHtmlRef.current}
                    onDocChange={onDocChange}
                    onUploadImage={uploadInlineImage}
                  />
                ) : (
                  <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">{t("fieldImages")}</label>
                <p className="mt-1 text-xs text-white/45">
                  {t("imagesHint", { maxMb: IMG_MAX_MB, maxFiles: IMG_MAX_FILES })}
                </p>
                <label
                  htmlFor="post-images"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void onFilesChosen(e.dataTransfer.files);
                  }}
                  className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/35 bg-violet-500/[0.07] px-4 py-10 transition hover:border-violet-400/55 hover:bg-violet-500/10"
                >
                  <ImagePlus className="size-10 text-violet-300/80" />
                  <span className="mt-2 text-sm font-medium text-white/70">
                    {compressingImages ? t("compressing") : t("addImages")}
                  </span>
                  <input
                    id="post-images"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void onFilesChosen(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {(editMeta?.existingUrls.length ?? 0) > 0 || files.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {editMeta?.existingUrls.map((url) => (
                      <div
                        key={url}
                        className="relative size-24 overflow-hidden rounded-xl border border-white/15 sm:size-28"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingUrl(url)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                          aria-label={t("removeImage")}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {files.map((f) => (
                      <div key={f.id} className="relative size-24 overflow-hidden rounded-xl border border-white/15 sm:size-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.preview} alt="" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                          aria-label={t("removeImage")}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">{t("fieldTags")}</label>
                <input
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-500/50"
                  placeholder={t("tagsPlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                {!editMeta ? (
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <FolderOpen className="size-4" />
                    {t("saveDraft")}
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={busy || loadingEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {editMeta ? t("saveChanges") : t("publish")}
                </button>
              </div>
            </div>
          </form>
        </div>

        <aside className="mt-10 w-full shrink-0 space-y-6 lg:mt-0 lg:w-72 xl:w-80">
          <div className={`${glass} p-5`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300/90">{t("tipsTitle")}</h3>
            <ul className="mt-4 list-inside space-y-3 text-sm text-white/65">
              <li>{t("tip1")}</li>
              <li>{t("tip2")}</li>
              <li>{t("tip3")}</li>
              <li>{t("tip4")}</li>
            </ul>
          </div>

          <div className={`${glass} overflow-hidden`}>
            <h3 className="border-b border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-wider text-violet-300/90">
              {t("preview")}
            </h3>
            <div className="p-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {coverPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/35">{t("noCover")}</div>
                )}
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/45">
                {destination || t("destFallback")} · {postType ? labelForPostType(postType) : t("postTypeFallback")}
              </p>
              {postType ? (
                <p className="mt-2 text-xs text-violet-300/90">
                  {t("afterApprove")} →{" "}
                  <Link href={publicPageForPostType(postType).href} className="underline hover:text-violet-200">
                    {sectionLabel(sectionForPostType(postType))}
                  </Link>
                </p>
              ) : null}
              <p className="mt-2 line-clamp-2 text-lg font-bold leading-snug">{title || t("previewTitle")}</p>
              <p className="mt-2 line-clamp-3 text-sm text-white/55">{excerptPlain || t("previewExcerpt")}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                <span>👁 0</span>
                <span>💬 0</span>
              </div>
              <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                {t("draft")}
              </p>
            </div>
          </div>

          <MyPostsPanel authorId={user.uid} refreshKey={myPostsRefresh} />
        </aside>
      </div>
    </div>
  );
}
