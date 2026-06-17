"use client";

import Image from "next/image";
import { User, Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        "Email atau Password yang Anda masukkan salah."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 overflow-hidden">

      {/* Blur Effect */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative">

        <div className="text-center z-10">

          <div className="animate-float">
            <Image
              src="/ayam2.png"
              alt="Chicken"
              width={250}
              height={250}
              priority
              className="drop-shadow-2xl mx-auto"
            />
          </div>

          <h1 className="text-5xl font-bold text-white mt-6">
            Simbolon Inventory
          </h1>

          <p className="text-green-100 text-lg mt-4 max-w-lg mx-auto">
            Sistem Informasi Inventory Ayam Masuk dan Keluar
            untuk membantu monitoring stok, distribusi,
            dan laporan peternakan secara real-time.
          </p>

          <div className="flex justify-center gap-6 mt-8">

            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl">
              <h3 className="text-2xl font-bold text-white">
                500+
              </h3>
              <p className="text-green-100 text-sm">
                Data Ayam
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl">
              <h3 className="text-2xl font-bold text-white">
                12
              </h3>
              <p className="text-green-100 text-sm">
                Kandang
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl">
              <h3 className="text-2xl font-bold text-white">
                24/7
              </h3>
              <p className="text-green-100 text-sm">
                Monitoring
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">

        <div className="w-full max-w-md backdrop-blur-xl bg-white/90 rounded-[32px] shadow-2xl p-10">

          <div className="text-center mb-8">

            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-3xl">
              🐔
            </div>

            <h2 className="text-4xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Login untuk mengakses dashboard inventory
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>
              <label className="text-sm font-medium text-gray-600">
                Email
              </label>

              <div className="relative mt-2">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  placeholder="admin@simbolon.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 text-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                />

              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <div className="relative mt-2">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 text-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                />

              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" />
                Remember Me
              </label>

              <button
                type="button"
                className="text-green-600 hover:text-green-700"
              >
                Lupa Password?
              </button>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Sign In"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}