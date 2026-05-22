/**
 * Editor rich text (TipTap) dùng trong đăng bài — đậm, nghiêng, list, link, trích dẫn, ảnh inline.
 *
 * Giới hạn độ dài nội dung thuần `MAX_CHARS`; đồng bộ HTML ra parent qua `onDocChange`.
 * Ảnh chèn tại con trỏ: link http(s), upload Storage (`onUploadImage`), dán/kéo file.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  ImagePlus,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { looksLikeImageUrl, parseImageUrl } from "@/lib/parseImageUrl";
import { POST_CONTENT_PLAIN_MAX } from "@/lib/postContentLimits";

const MAX_CHARS = POST_CONTENT_PLAIN_MAX;
const INLINE_IMG_MAX_MB = 10;

type Props = {
  initialHtml?: string;
  onDocChange: (payload: { html: string; plain: string; plainLength: number }) => void;
  onUploadImage?: (file: File) => Promise<string>;
};

export function CreatePostRichEditor({ initialHtml, onDocChange, onUploadImage }: Props) {
  const te = useTranslations("Editor");
  const [uploadingInline, setUploadingInline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadRef = useRef(onUploadImage);
  onUploadRef.current = onUploadImage;

  const insertImageRef = useRef<(file: File, pos?: number) => Promise<void>>(async () => {});
  const insertImageUrlRef = useRef<(url: string) => void>(() => {});

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          bulletList: { HTMLAttributes: { class: "list-disc pl-5 my-2" } },
          orderedList: { HTMLAttributes: { class: "list-decimal pl-5 my-2" } },
          blockquote: {
            HTMLAttributes: { class: "border-l-4 border-violet-500/60 pl-4 italic text-white/85 my-2" },
          },
          heading: false,
        }),
        Placeholder.configure({
          placeholder: te("placeholder"),
        }),
        Underline,
        Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: "post-inline-image",
          },
        }),
      ],
      content: initialHtml || "",
      editorProps: {
        attributes: {
          class:
            "min-h-[220px] px-4 py-3 text-sm text-white/90 outline-none focus:outline-none sm:min-h-[280px] sm:text-[15px]",
        },
        handleDrop: (view, event, _slice, moved) => {
          if (moved || !onUploadRef.current) return false;
          const file = event.dataTransfer?.files?.[0];
          if (!file?.type.startsWith("image/")) return false;
          event.preventDefault();
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          void insertImageRef.current(file, coords?.pos);
          return true;
        },
        handlePaste: (_view, event) => {
          const text = event.clipboardData?.getData("text/plain")?.trim();
          if (text && !text.includes("\n") && looksLikeImageUrl(text)) {
            const parsed = parseImageUrl(text);
            if (parsed) {
              event.preventDefault();
              insertImageUrlRef.current(parsed);
              return true;
            }
          }
          if (!onUploadRef.current) return false;
          const file = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
          if (!file) return false;
          event.preventDefault();
          void insertImageRef.current(file);
          return true;
        },
      },
      onCreate: ({ editor: ed }) => {
        const plain = ed.getText();
        onDocChange({ html: ed.getHTML(), plain, plainLength: plain.length });
      },
      onUpdate: ({ editor: ed }) => {
        const plain = ed.getText();
        onDocChange({ html: ed.getHTML(), plain, plainLength: plain.length });
      },
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    insertImageUrlRef.current = (url: string) => {
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
    };
    insertImageRef.current = async (file: File, pos?: number) => {
      const upload = onUploadRef.current;
      if (!upload) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > INLINE_IMG_MAX_MB * 1024 * 1024) {
        window.alert(te("imageTooBig", { maxMb: INLINE_IMG_MAX_MB }));
        return;
      }
      setUploadingInline(true);
      try {
        const url = await upload(file);
        const chain = editor.chain().focus();
        if (pos != null) chain.setTextSelection(pos);
        chain.setImage({ src: url, alt: "" }).run();
      } catch {
        window.alert(te("imageUploadFail"));
      } finally {
        setUploadingInline(false);
      }
    };
  }, [editor, te]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(te("linkPrompt"), prev || "https://");
    if (url === null) return;
    const href = url.trim();
    if (href === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const insertImageUrl = () => {
    if (!editor) return;
    const url = window.prompt(te("imageUrlPrompt"), "https://");
    if (url === null) return;
    const parsed = parseImageUrl(url);
    if (!parsed) {
      window.alert(te("imageUrlInvalid"));
      return;
    }
    editor.chain().focus().setImage({ src: parsed, alt: "" }).run();
  };

  const onInlineImageChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await insertImageRef.current(file);
  };

  const tb = "rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-35";
  const tbActive = "bg-violet-500/25 text-white";

  const plainLen = editor ? editor.getText().length : 0;

  return (
    <div className="create-post-editor overflow-hidden rounded-2xl border border-white/10 bg-black/35">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => void onInlineImageChosen(e)}
      />
      {editor ? (
        <div className="flex flex-wrap gap-1 border-b border-white/10 bg-black/25 px-2 py-2">
          <button
            type="button"
            className={`${tb} ${editor.isActive("bold") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label={te("bold")}
          >
            <Bold className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("italic") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label={te("italic")}
          >
            <Italic className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("underline") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label={te("underline")}
          >
            <UnderlineIcon className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("strike") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label={te("strike")}
          >
            <Strikethrough className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("bulletList") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label={te("bullet")}
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("orderedList") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label={te("ordered")}
          >
            <ListOrdered className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("blockquote") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label={te("quote")}
          >
            <Quote className="size-4" />
          </button>
          <button type="button" className={`${tb} ${editor.isActive("link") ? tbActive : ""}`} onClick={setLink} aria-label={te("link")}>
            <Link2 className="size-4" />
          </button>
          <button
            type="button"
            className={tb}
            onClick={insertImageUrl}
            aria-label={te("imageUrl")}
            title={te("imageUrlTitle")}
          >
            <ImageIcon className="size-4" />
          </button>
          {onUploadImage ? (
            <button
              type="button"
              className={`${tb} ${uploadingInline ? "opacity-60" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingInline}
              aria-label={te("image")}
              title={te("imageTitle")}
            >
              {uploadingInline ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            </button>
          ) : null}
        </div>
      ) : null}
      <EditorContent editor={editor} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-xs text-white/45">
        <span className="text-white/40">{te("imageHint")}</span>
        <span className={plainLen > MAX_CHARS ? "font-semibold text-amber-400" : ""}>
          {plainLen}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

export { MAX_CHARS };
