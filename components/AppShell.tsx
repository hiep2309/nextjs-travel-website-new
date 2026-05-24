"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { usePathname } from "@/lib/i18n/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <>
      {!isDashboard ? (
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
        </>
      ) : null}
      <Navbar />
      <main className="relative z-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      {!isDashboard ? <Footer /> : null}
    </>
  );
}
