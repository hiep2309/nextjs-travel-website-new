/**
 * Resize + nén ảnh trước khi upload Firebase Storage (giảm bandwidth, tải nhanh hơn).
 * Ưu tiên WebP nếu trình duyệt hỗ trợ `toBlob('image/webp')`, không thì JPEG.
 */
const MAX_EDGE = 1920;
const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.86;

function stripExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    let w = bitmap.width;
    let h = bitmap.height;
    const max = Math.max(w, h);
    const scale = max > MAX_EDGE ? MAX_EDGE / max : 1;
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, tw, th);
    bitmap.close();

    const tryWebp = canvas.toDataURL("image/webp", 0.5).startsWith("data:image/webp");
    if (tryWebp) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY),
      );
      if (blob && blob.size > 0 && blob.size < file.size * 1.15) {
        return new File([blob], `${stripExt(file.name) || "image"}.webp`, { type: "image/webp" });
      }
    }

    const jpegBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY),
    );
    if (jpegBlob && jpegBlob.size > 0 && jpegBlob.size < file.size * 1.15) {
      return new File([jpegBlob], `${stripExt(file.name) || "image"}.jpg`, { type: "image/jpeg" });
    }
    return file;
  } catch {
    return file;
  }
}
