/**
 * Ảnh món trong `public/foods/` — tên file theo tên món (tiếng Việt).
 * Cập nhật `DISH_FOOD_FILE` khi thêm file mới vào thư mục.
 */
import { foodImage } from "@/lib/publicAssets";

/** `Dish.id` → tên file trong `public/foods/`. */
export const DISH_FOOD_FILE: Record<string, string> = {
  "pho-bo": "Phở bò.jpg",
  "banh-mi": "Bánh mì.jpg",
  "bun-cha": "Bún chả.jpg",
  "cao-lau": "Cao lầu.jpg",
  "hai-san-nha-trang": "Hải sản.jpg",
  "com-chay-hue": "cơm chay.jpg",
  "lau-mam": "lẩu mắm miền tây.jpg",
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/** CDN fallback khi chưa có ảnh local (vd. fine dining). */
const DISH_UNSPLASH_FALLBACK: Record<string, string> = {
  "fine-dining-saigon": "photo-1414235077428-338989a2e8c0",
};

export function getDishFoodImage(dishId: string): string {
  const file = DISH_FOOD_FILE[dishId];
  if (file) return foodImage(file);
  const fallback = DISH_UNSPLASH_FALLBACK[dishId];
  if (fallback) return unsplash(fallback);
  return unsplash("photo-1582878826629-29b7ad1cdc43");
}
