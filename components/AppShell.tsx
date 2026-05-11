import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

/**
 * Server Component: không `"use client"`.
 * Giữ shell layout tách khỏi layout.tsx; navbar/footer vẫn là client islands bên trong.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative min-h-0 flex-1 overflow-hidden">{children}</main>
      <Footer />
    </>
  );
}
