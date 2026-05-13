/**
 * Khung trang chung (shell): thanh điều hướng + vùng nội dung + chân trang.
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
      <Navbar />
      <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      <Footer />
    </>
  );
}
