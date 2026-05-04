"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, googleProvider } from "@/lib/firebase"; // Đảm bảo googleProvider đã được export ở lib/firebase
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react"; // Dùng icons hiện đại

const Login = () => {
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
      alert("Đăng nhập thành công!");
      router.replace("/dashboard");
    } catch (err: any) {
      alert("Lỗi đăng nhập: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="flex w-full max-w-6xl rounded-[40px] overflow-hidden shadow-2xl bg-white h-[85vh]">
        
        {/* LEFT SIDE: FORM (Đồng bộ UI VietNam Insight) */}
        <div className="w-full md:w-1/2 p-16 flex flex-col justify-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10">
            <div className="relative w-14 h-14"> {/* Bạn có thể chỉnh w-12 h-12 nếu muốn logo to hơn */}
  <Image
    src="/VN_insight_logo.png"          // Đường dẫn ảnh trong thư mục public
    alt="VietNam Insight Logo"
    fill                     // Để ảnh lấp đầy khung div cha
    className="object-contain" // Giúp logo giữ đúng tỷ lệ, không bị kéo dãn
    priority                 // Ưu tiên tải logo trước
  />
</div>
            <span className="font-bold text-xl text-slate-900">VietNam Insight.</span>
          </div>

          {/* Header Section */}
          <p className="text-sm text-gray-400 mb-2 font-medium tracking-wide">WELCOME BACK</p>
          <h1 className="text-5xl font-bold mb-4 text-slate-950">
            Login to account<span className="text-blue-500">.</span>
          </h1>
          <p className="text-sm text-gray-400 mb-10">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Sign Up
            </Link>
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5 max-w-md">
            
            {/* Email Field (Dùng background gray nhạt giống mẫu) */}
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={20}/>
              <input
                type="email" placeholder="Email" required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 p-4 bg-gray-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm"
              />
            </div>

            {/* Password Field (Dùng background trắng, viền xanh đè bóng như mẫu) */}
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={20}/>
              <input
                type={show ? "text" : "password"}
                placeholder="Password" required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 p-4 bg-white border-2 border-blue-400 rounded-2xl outline-none shadow-lg shadow-blue-50 text-sm"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-2 my-2">
              <div className="h-[1px] bg-gray-100 flex-1"></div>
              <span className="text-xs text-gray-400 uppercase">Or login with</span>
              <div className="h-[1px] bg-gray-100 flex-1"></div>
            </div>

            {/* BUTTONS (Dồng bộ giao diện VietNam Insight) */}
            <div className="flex gap-4 pt-2">
              <button 
                type="button" 
                onClick={handleGoogle}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition active:scale-95"
              >
                <Chrome size={20} className="text-red-500" />
                Google
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-full font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition disabled:bg-gray-300 active:scale-95"
              >
                {loading ? "Processing..." : "Login"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: IMAGE (Đồng bộ hoàn toàn với Register - Hoi An Night) */}
        <div className="relative w-1/2 hidden md:block rounded-r-[40px] overflow-hidden bg-slate-100">
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