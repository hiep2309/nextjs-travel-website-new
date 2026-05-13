/**
 * Component destinations (legacy/demo) — có thể nhận props hoặc fallback danh sách tĩnh.
 *
 * Định nghĩa kiểu `DestinationItem` để đồng bộ slug/link với trang địa điểm.
 */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/** Một địa điểm trong danh sách (slug khớp `/destinations/[slug]`). */
export interface DestinationItem {
  slug: string;
  name: string;
  region: string;
  country: string;
  description: string;
  image: string;
  thumb: string;
  reviewCount: string;
  /** Thứ tự hiển thị / sort */
  number: number;
  authorRole?: string;
}

/** Props do container truyền xuống sau khi fetch Firestore. */
interface DestinationsProps {
  destinations: DestinationItem[];
  loading: boolean;
  error: string | null;
}

export default function Destinations({ destinations, loading, error }: DestinationsProps) {
  const [active, setActive] = useState(0);

  if (loading) return <div className="h-screen bg-black flexCenter text-white">Đang tải dữ liệu...</div>;

  if (error) return <div className="h-screen bg-black flexCenter text-red-500">{error}</div>;

  return (
    <section className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">
      {/* TODO: hoàn thiện nền + carousel thumbnail địa điểm */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-4">
      </div>
    </section>
  );
}