# Static assets

| Folder | Purpose | Examples |
|--------|---------|----------|
| `icons/` | Logos & UI glyphs | `logo.png`, `VN_Insight_logo.png` |
| `heroes/` | Full-page backgrounds | `signup_pic.jpg`, `login_pic.jpg` |
| `destinations/` | Province photos (34 tỉnh) | `Đà Nẵng.jpg`, `Hà Nội.png`, `Thành phố Hồ Chí Minh.jpg` |
| `foods/` | Dish photos (AI Food Explorer) | `Phở bò.jpg`, `Bún chả.jpg`, `Hải sản.jpg` |

Use `getProvinceDestinationImage("Đà Nẵng")` from `lib/provinceDestinationImages.ts` (maps tên tỉnh → file).
Use `getDishFoodImage("pho-bo")` from `lib/food/dishImages.ts` (maps dish id → file trong `foods/`).
