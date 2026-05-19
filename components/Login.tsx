/**
 * Form đăng nhập — email/mật khẩu và đăng nhập Google (`signInWithPopup`).
 *
 * Sau khi thành công chuyển hướng về trang chủ (`/`).
 */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";

const Login = () => {
  const t = useTranslations("Auth");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert(t("loginSuccess"));
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(`${t("loginError")}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:p-6">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl md:h-[min(85vh,880px)] md:flex-row md:rounded-[40px]">
        
        {/* LEFT SIDE: FORM (Đồng bộ UI VietNam Insight) */}
        <div className="flex w-full flex-col justify-center overflow-y-auto md:w-1/2 md:min-h-0 p-6 sm:p-10 md:p-12 lg:p-16">
          
          {/* Logo Section */}
          <div className="mb-8 flex items-center gap-3 sm:mb-10">
            <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
  <Image
    src="/VN_insight_logo.png"          // Đường dẫn ảnh trong thư mục public
    alt="VietNam Insight Logo"
    fill                     // Để ảnh lấp đầy khung div cha
    className="object-contain" // Giúp logo giữ đúng tỷ lệ, không bị kéo dãn
    priority                 // Ưu tiên tải logo trước
  />
</div>
            <span className="text-lg font-bold text-slate-900 sm:text-xl">VietNam Insight.</span>
          </div>

          {/* Header Section */}
          <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 sm:text-sm">{t("welcomeBack")}</p>
          <h1 className="mb-4 text-3xl font-bold text-slate-950 sm:text-4xl lg:text-5xl">
            {t("loginTitle")}<span className="text-blue-500">.</span>
          </h1>
          <p className="mb-8 text-sm text-gray-400 sm:mb-10">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              {t("signUp")}
            </Link>
          </p>

          <form onSubmit={handleLogin} className="flex max-w-md flex-col gap-4 sm:gap-5">
            
            {/* Email Field (Dùng background gray nhạt giống mẫu) */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 sm:left-4 sm:size-5" />
              <input
                type="email" placeholder={t("email")} required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-none bg-gray-100 p-3 pl-11 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-300 sm:p-4 sm:pl-12"
              />
            </div>

            {/* Password Field (Dùng background trắng, viền xanh đè bóng như mẫu) */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 sm:left-4 sm:size-5" />
              <input
                type={show ? "text" : "password"}
                placeholder={t("password")} required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border-2 border-blue-400 bg-white p-3 pl-11 pr-11 text-sm shadow-lg shadow-blue-50 outline-none sm:p-4 sm:pl-12 sm:pr-12"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-4"
              >
                {show ? <EyeOff className="size-[18px] sm:size-5" /> : <Eye className="size-[18px] sm:size-5" />}
              </button>
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-2 my-2">
              <div className="h-[1px] bg-gray-100 flex-1"></div>
              <span className="text-xs text-gray-400 uppercase">{t("orWith")}</span>
              <div className="h-[1px] bg-gray-100 flex-1"></div>
            </div>

            {/* BUTTONS (Dồng bộ giao diện VietNam Insight) */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <button 
                type="button" 
                onClick={handleGoogle}
                className="flex w-full flex-1 items-center justify-center gap-2 rounded-full border-2 border-gray-200 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95 sm:w-auto"
              >
                <Chrome className="size-5 text-red-500" />
                {t("google")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex-1 rounded-full bg-blue-600 py-3 text-sm font-bold text-white shadow-xl shadow-blue-100 transition hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 sm:w-auto"
              >
                {loading ? t("processing") : t("login")}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: IMAGE (Đồng bộ hoàn toàn với Register - Hoi An Night) */}
        <div className="relative hidden min-h-0 overflow-hidden bg-slate-100 md:block md:h-full md:w-1/2 md:rounded-r-[40px]">
          <Image
            src="/login_pic.jpg" // Đảm bảo bạn có ảnh này trong folder public
            alt="SonDoong Cave"
            fill
            priority
            className="object-cover z-0" 
          />
          {/* Lớp cong màu trắng (S shape) - z-10 để đè lên ảnh */}
          <div className="absolute left-[-60px] top-0 h-[110%] w-48 bg-white rounded-r-[200px] z-10" />
          
          <div className="absolute bottom-12 right-12 z-20">
             <span className="text-white text-5xl font-black opacity-80 decoration-blue-500">AW.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;