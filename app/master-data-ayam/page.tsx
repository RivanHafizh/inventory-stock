"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import ChickenTable from "@/components/chickentable";

export default function MasterDataAyamPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <Header />

        <main className="p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Master Data Ayam
              </h1>

              <p className="text-gray-500 mt-2">
                Kelola seluruh data ayam yang tersedia.
              </p>
            </div>

            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition">
              <Plus size={20} />
              Tambah Data
            </button>

          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm p-6">

            {/* Search */}
            <div className="relative mb-6 w-full md:w-80">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Cari nama ayam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

            <ChickenTable />

          </div>

        </main>

      </div>

    </div>
  );
}