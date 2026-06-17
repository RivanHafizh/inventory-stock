"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import StatCard from "@/components/statcard";

import {
  Bird,
  ArrowDownCircle,
  ArrowUpCircle,
  Tags,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <main className="flex-1 p-8">

        <Header />

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

          <StatCard
            title="Total Ayam"
            value="4,352"
            growth="8% minggu ini"
            icon={
              <Bird
                size={28}
                className="text-green-700"
              />
            }
          />

          <StatCard
            title="Ayam Masuk"
            value="1,500"
            growth="12% bulan ini"
            icon={
              <ArrowDownCircle
                size={28}
                className="text-green-700"
              />
            }
          />

          <StatCard
            title="Ayam Keluar"
            value="1,430"
            growth="8% bulan ini"
            icon={
              <ArrowUpCircle
                size={28}
                className="text-green-700"
              />
            }
          />

          <StatCard
            title="Kategori Ayam"
            value="15"
            growth="3 kategori baru"
            icon={
              <Tags
                size={28}
                className="text-green-700"
              />
            }
          />

        </div>

        {/* Chart + Monitor */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

          {/* Chart */}
          <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Grafik Ayam Masuk & Keluar
                </h2>

                <p className="text-gray-400 text-sm">
                  Statistik transaksi bulanan
                </p>
              </div>

              <select className="border border-gray-200 rounded-xl px-4 py-2">
                <option>Bulanan</option>
                <option>Tahunan</option>
              </select>
            </div>

            {/* Placeholder Chart */}
            <div className="h-[320px] flex items-end justify-between gap-4">

              {[40, 60, 90, 50, 80, 120, 160, 230, 170, 140, 110, 180].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-green-500 rounded-t-xl"
                    style={{
                      height: `${height}px`,
                    }}
                  />
                )
              )}

            </div>
          </div>

          {/* Monitor */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

            <h2 className="text-xl font-bold">
              Monitoring Stok
            </h2>

            <p className="text-gray-400 text-sm mb-8">
              Total stok ayam tersedia
            </p>

            <div className="flex justify-center">

              <div className="relative w-52 h-52">

                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full"
                >
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />

                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="3"
                    strokeDasharray="80, 100"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-4xl font-bold">
                    80%
                  </h2>

                  <p className="text-gray-500">
                    Stok Tersedia
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Tabel Aktivitas */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-8">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Aktivitas Terbaru
            </h2>

            <button className="text-green-600">
              Lihat Semua
            </button>
          </div>

          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th className="text-left py-4">
                  Tanggal
                </th>

                <th className="text-left py-4">
                  Aktivitas
                </th>

                <th className="text-left py-4">
                  Jumlah
                </th>

                <th className="text-left py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b">
                <td className="py-4">
                  18 Juni 2026
                </td>

                <td>Ayam Masuk</td>

                <td>250 Ekor</td>

                <td>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Selesai
                  </span>
                </td>
              </tr>

              <tr className="border-b">
                <td className="py-4">
                  17 Juni 2026
                </td>

                <td>Ayam Keluar</td>

                <td>180 Ekor</td>

                <td>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Diproses
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">
                  16 Juni 2026
                </td>

                <td>Tambah Kategori</td>

                <td>Broiler</td>

                <td>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    Pending
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </main>
    </div>
  );
}