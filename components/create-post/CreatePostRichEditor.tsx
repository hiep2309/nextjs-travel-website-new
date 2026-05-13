/**
 * Editor rich text (TipTap) dùng trong đăng bài — đậm, nghiêng, list, link, trích dẫn.
 *
 * Giới hạn độ dài nội dung thuần `MAX_CHARS`; đồng bộ HTML ra parent qua `onDocChange` / `onCreate`.
 */
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";

const MAX_CHARS = 5000;

type Props = {
  initialHtml?: string;
  onDocChange: (payload: { html: string; plain: string; plainLength: number }) => void;
};

export function CreatePostRichEditor({ initialHtml, onDocChange }: Props) {
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
          placeholder: "Chia sẻ hành trình, gợi ý lịch trình, chi phí và trải nghiệm của bạn…",
        }),
        Underline,
        Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      ],
      content: initialHtml || "",
      editorProps: {
        attributes: {
          class:
            "min-h-[220px] px-4 py-3 text-sm text-white/90 outline-none focus:outline-none sm:min-h-[280px] sm:text-[15px]",
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

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Đường dẫn (URL)", prev || "https://");
    if (url === null) return;
    const t = url.trim();
    if (t === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
  };

  const tb = "rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-35";
  const tbActive = "bg-violet-500/25 text-white";

  const plainLen = editor ? editor.getText().length : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
      {editor ? (
        <div className="flex flex-wrap gap-1 border-b border-white/10 bg-black/25 px-2 py-2">
          <button
            type="button"
            className={`${tb} ${editor.isActive("bold") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Đậm"
          >
            <Bold className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("italic") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Nghiêng"
          >
            <Italic className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("underline") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Gạch chân"
          >
            <UnderlineIcon className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("strike") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Gạch ngang"
          >
            <Strikethrough className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("bulletList") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Danh sách bullet"
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("orderedList") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Danh sách số"
          >
            <ListOrdered className="size-4" />
          </button>
          <button
            type="button"
            className={`${tb} ${editor.isActive("blockquote") ? tbActive : ""}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Trích dẫn"
          >
            <Quote className="size-4" />
          </button>
          <button type="button" className={`${tb} ${editor.isActive("link") ? tbActive : ""}`} onClick={setLink} aria-label="Liên kết">
            <Link2 className="size-4" />
          </button>
        </div>
      ) : null}
      <EditorContent editor={editor} />
      <div className="flex justify-end border-t border-white/10 px-3 py-2 text-xs text-white/45">
        <span className={plainLen > MAX_CHARS ? "font-semibold text-amber-400" : ""}>
          {plainLen}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

export { MAX_CHARS };
