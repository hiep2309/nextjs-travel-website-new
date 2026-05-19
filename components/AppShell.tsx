/**
 * Khung trang chung (shell): nền cố định giống trang chủ + thanh điều hướng + vùng nội dung + chân trang.
 *
 * Chức năng:
 * - Server Component — không `use client`; Navbar/Footer bên trong có thể là client.
 * - `main` cuộn độc lập, chiếm phần còn lại giữa header và footer.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/signup_pic.jpg')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/35 to-black/70"
        aria-hidden
      />
      <Navbar />
      <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      <Footer />
    </>
  );
}
