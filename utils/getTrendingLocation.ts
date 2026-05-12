import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getTrendingLocation() {
  const q = query(collection(db, "posts"), where("status", "==", "approved"));
  const snapshot = await getDocs(q);

  const map: any = {};

  snapshot.forEach((doc) => {
    const data = doc.data();

    const key = data.location;

    if (!map[key]) {
      map[key] = {
        name: key,
        image: data.image,
        views: 0,
        searchCount: 0,
        rating: data.rating || 4.5,
      };
    }

    map[key].views += data.views || 0;
    map[key].searchCount += data.searchCount || 0;
  });

  const ranked = Object.values(map).map((loc: any) => {
    const score =
      loc.views * 0.6 +
      loc.searchCount * 0.3 +
      loc.rating * 10;

    return { ...loc, score };
  });

  ranked.sort((a: any, b: any) => b.score - a.score);

  return ranked[0];
}