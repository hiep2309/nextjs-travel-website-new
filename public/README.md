# Static assets

| Folder | Purpose | Examples |
|--------|---------|----------|
| `icons/` | Logos & UI glyphs | `logo.png`, `VN_Insight_logo.png` |
| `heroes/` | Full-page backgrounds | `signup_pic.jpg`, `login_pic.jpg` |
| `destinations/` | Province photos (34 tỉnh) | `Đà Nẵng.jpg`, `Hà Nội.png`, `Thành phố Hồ Chí Minh.jpg` |
| `foods/` | Dish photos (optional local) | — (Food Explorer may use CDN) |

Use `getProvinceDestinationImage("Đà Nẵng")` from `lib/provinceDestinationImages.ts` (maps tên tỉnh → file).
