"use client";

import Image from "next/image";
import { User, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // ==========================
      // LOGIN OWNER
      // ==========================
      try {
        const ownerCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        localStorage.setItem("role", "owner");
        localStorage.setItem("userName", "Owner");
        localStorage.setItem(
          "userEmail",
          ownerCredential.user.email || ""
        );

        router.push("/dashboard");
        return;
      } catch {
        // Bukan owner, lanjut cek admin.
      }

      // ==========================
      // LOGIN ADMIN
      // ==========================
      const q = query(
        collection(db, "users"),
        where("email", "==", email),
        where("password", "==", password)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const admin = snapshot.docs[0].data();

        localStorage.setItem("role", "admin");
        localStorage.setItem("userName", admin.nama);
        localStorage.setItem("userEmail", admin.email);

        router.push("/dashboard");
        return;
      }

      setError("Email atau password yang Anda masukkan salah.");
    } catch (err) {
      console.error(err);
      setError(
        "Terjadi kesalahan saat login. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7f5] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl min-h-[680px] bg-white rounded-[28px] overflow-hidden shadow-[0_25px_80px_rgba(15,23,42,0.12)] border border-gray-100 flex flex-col lg:flex-row">

        {/* LEFT PANEL */}
        <section className="relative hidden lg:flex lg:w-[54%] overflow-hidden bg-[#123b2a] p-12 xl:p-16 flex-col justify-between">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-green-300/10 blur-3xl" />
          <div className="absolute top-1/2 right-[-120px] w-[300px] h-[300px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 right-[-70px] w-[200px] h-[200px] rounded-full border border-white/5" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-lg">🐔</span>
              </div>
              <span className="text-sm font-semibold tracking-wide text-white">
                SIMBOLON INVENTORY
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center -mt-8">
            <div className="relative w-[280px] h-[280px] xl:w-[330px] xl:h-[330px]">
              <div className="absolute inset-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm" />

              <Image
                src="/ayam2.png"
                alt="Simbolon Inventory"
                fill
                priority
                className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] relative z-10"
              />
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white mt-2">
              Simbolon Inventory
            </h1>

            <p className="text-sm xl:text-base text-emerald-100/75 max-w-md mt-4 leading-relaxed">
              Sistem informasi inventory ayam yang membantu
              pengelolaan stok, distribusi, dan monitoring
              peternakan secara lebih terstruktur.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <p className="text-xl xl:text-2xl font-bold text-white">
                500+
              </p>
              <p className="text-xs text-emerald-100/60 mt-1">
                Data Ayam
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <p className="text-xl xl:text-2xl font-bold text-white">
                12
              </p>
              <p className="text-xs text-emerald-100/60 mt-1">
                Kandang
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <p className="text-xl xl:text-2xl font-bold text-white">
                24/7
              </p>
              <p className="text-xs text-emerald-100/60 mt-1">
                Monitoring
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="w-full lg:w-[46%] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-white">
          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                🐔
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">
                  Simbolon Inventory
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Inventory Management System
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-9">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                <Lock size={21} className="text-emerald-700" />
              </div>

              <p className="text-sm font-semibold text-emerald-700 mb-2">
                ADMINISTRATOR ACCESS
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Selamat Datang
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Masuk ke sistem untuk mengelola inventory
                dan memantau aktivitas peternakan Anda.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full h-14 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full h-14 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="w-5 h-5 shrink-0 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold">
                    !
                  </div>

                  <p className="leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-14 rounded-xl bg-[#14532d] hover:bg-[#166534] active:scale-[0.99] text-white font-semibold text-sm shadow-[0_8px_25px_rgba(20,83,45,0.20)] hover:shadow-[0_10px_30px_rgba(20,83,45,0.28)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
              <ShieldCheck size={16} className="text-emerald-600" />
              <p className="text-xs text-gray-400">
                Akses aman untuk pengguna terdaftar
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}