/**
 * Form đăng ký — tạo tài khoản Firebase Auth + document `users/{uid}` qua `createUserProfile`.
 *
 * Hiển thị modal chào mừng sau khi đăng ký thành công.
 */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, Check, Gift, X } from "lucide-react";
import { createUserProfile } from "@/lib/user";

function RegisterSuccessModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-success-title"
    >
      <div className="relative w-full max-w-[420px] overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-[32px] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Đóng"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center pt-2 text-center">
          <div className="relative mb-6 mt-4">
            <span className="absolute -left-1 top-0 size-2.5 rounded-sm bg-amber-400 rotate-12" />
            <span className="absolute -right-2 top-2 size-2 rounded-full bg-violet-500" />
            <span className="absolute -left-3 bottom-4 size-2 rounded-sm bg-blue-400 -rotate-12" />
            <span className="absolute -right-1 bottom-1 size-2 rounded-sm bg-pink-400 rotate-45" />
            <span className="absolute left-8 -top-1 size-1.5 rounded-full bg-emerald-400" />
            <div className="flex size-[88px] items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-400/35 sm:size-[100px]">
              <Check className="size-11 text-white stroke-[3] sm:size-12" aria-hidden />
            </div>
          </div>

          <h2
            id="register-success-title"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]"
          >
            Chào mừng bạn! 👋
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Tài khoản của bạn đã được tạo thành công.
          </p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Cảm ơn bạn đã gia nhập{" "}
            <span className="font-semibold text-slate-800">VN Insight</span>.
          </p>

          <div className="mt-6 flex w-full gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Gift className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Khám phá ngay!</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                Nhận ngay gợi ý điểm đến và ưu đãi đặc biệt dành riêng cho bạn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-200/70 transition hover:bg-blue-700 active:scale-[0.98] sm:py-4 sm:text-[15px]"
          >
            Bắt đầu khám phá
            <ArrowRight className="size-5 shrink-0" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // Thêm state để lấy tên
  const [lastName, setLastName] = useState("");   // Thêm state để lấy tên
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const goAfterSuccess = () => {
    setSuccessOpen(false);
    router.push("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Tạo tài khoản trên Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Tạo Profile trong Firestore (Sẽ có role: "user" mặc định)
      // Lưu ý: Chúng ta có thể truyền thêm tên vào nếu muốn
      await createUserProfile(user);

      setSuccessOpen(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:p-6">
      {successOpen ? <RegisterSuccessModal onClose={goAfterSuccess} /> : null}
      <div className="flex h-auto w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl md:h-[min(85vh,880px)] md:flex-row md:rounded-[40px]">
        
        {/* BÊN TRÁI: FORM */}
        <div className="flex w-full flex-col justify-between overflow-y-auto p-6 sm:p-10 md:w-1/2 md:p-12 lg:p-16">
          <div>
            <div className="mb-8 flex items-center gap-2 sm:mb-12">
             <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
  <Image
    src="/VN_insight_logo.png"          // Đường dẫn ảnh trong thư mục public
    alt="VietNam Insight Logo"
    fill                     // Để ảnh lấp đầy khung div cha
    className="object-contain" // Giúp logo giữ đúng tỷ lệ, không bị kéo dãn
    priority                 // Ưu tiên tải logo trước
  />
</div>
              <span className="text-lg font-bold sm:text-xl">VietNam Insight</span>
            </div>
            
            <p className="mb-2 text-xs font-bold tracking-widest text-gray-400">START FOR FREE</p>
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">Create new account<span className="text-blue-600">.</span></h1>
            <p className="mb-6 text-sm text-gray-500 sm:mb-8">
              Already A Member? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
            </p>

            <form onSubmit={handleRegister} className="max-w-md space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <input placeholder="First name" className="w-full rounded-2xl border-none bg-white p-3 outline-none focus:ring-2 focus:ring-blue-200 sm:p-4" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input placeholder="Last name" className="w-full rounded-2xl border-none bg-white p-3 outline-none focus:ring-2 focus:ring-blue-200 sm:p-4" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <input 
                type="email" placeholder="Email" 
                className="w-full rounded-2xl border-none bg-white p-3 outline-none focus:ring-2 focus:ring-blue-200 sm:p-4"
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input 
                  type="password" placeholder="Password" 
                  className="w-full rounded-2xl border-2 border-blue-400 bg-white p-3 shadow-lg shadow-blue-100 outline-none sm:p-4"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                <button type="button" className="w-full whitespace-nowrap rounded-full bg-gray-100 px-6 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200 sm:w-auto sm:px-8 sm:py-4">Change method</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex-1 rounded-full bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60 sm:py-4"
                >
                  {submitting ? "Đang tạo…" : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* BÊN PHẢI: ẢNH NÚI */}
        <div className="relative hidden min-h-0 md:block md:h-full md:w-1/2">
          <Image 
            src="/signup_pic.jpg" // Đảm bảo bạn có ảnh này trong folder public
            alt="Mountains" 
            fill 
            className="object-cover"
          />
          {/* Lớp cong màu trắng (S shape) */}
          <div className="absolute inset-y-0 -left-16 w-32 bg-white rounded-r-[150px] transform scale-y-110" />
          
          <div className="absolute bottom-12 right-12">
             <span className="text-white text-4xl font-bold opacity-80">VNI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;