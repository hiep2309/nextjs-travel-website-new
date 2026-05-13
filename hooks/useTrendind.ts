/**
 * Hook trả về một “địa điểm hot” — đọc `getTrendingLocation()` (Firestore posts đã duyệt).
 *
 * Dùng cho widget gợi ý trên dashboard/trang chủ (điểm số minh họa từ views/searchCount/rating).
 */
import { useEffect, useState } from "react";
import { getTrendingLocation } from "@/utils/getTrendingLocation";

export function useTrending() {
  const [place, setPlace] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getTrendingLocation();
      setPlace(data);
    };

    load();
  }, []);

  return place;
}