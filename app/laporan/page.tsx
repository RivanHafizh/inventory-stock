"use client";

import { useState } from "react";
import {
  Search,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import ReportCards from "@/components/reportCards";
import ReportChart from "@/components/reportChart";
import ReportTable from "@/components/reportTable";

export default function LaporanPage() {
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [ayam, setAyam] = useState("");

  const handleFilter = () => {
    console.log({
      tanggalAwal,
      tanggalAkhir,
      ayam,
    });
  };

  const handleReset = () => {
    setTanggalAwal("");
    setTanggalAkhir("");
    setAyam("");
  };

  const handleExport = () => {
    alert("Export Excel");
  };

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div className="flex-1">

        <Header />

        <main className="p-8">

          {/* Heading */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">
              Laporan Inventory Ayam
            </h1>

            <p className="text-gray-500 mt-2">
              Ringkasan transaksi ayam masuk, ayam keluar
              serta total stok.
            </p>

          </div>

          {/* Filter */}

          <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

              {/* Tanggal Awal */}

              <div>

                <label className="text-sm text-gray-600">
                  Tanggal Awal
                </label>

                <input
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) =>
                    setTanggalAwal(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

              {/* Tanggal Akhir */}

              <div>

                <label className="text-sm text-gray-600">
                  Tanggal Akhir
                </label>

                <input
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) =>
                    setTanggalAkhir(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

              {/* Master Data Ayam */}

              <div>

                <label className="text-sm text-gray-600">
                  Nama Ayam
                </label>

                <select
                  value={ayam}
                  onChange={(e) =>
                    setAyam(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">
                    Semua Ayam
                  </option>

                  <option value="ayam kecil">
                    ayam-kecil
                  </option>

                  <option value="ayam sedang">
                    ayam-sedang
                  </option>

                  <option value="ayam besar">
                    ayam-besar
                  </option>

                </select>

              </div>

              {/* Filter */}

              <div className="flex items-end">

                <button
                  onClick={handleFilter}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition"
                >
                  <Search size={18} />
                  Filter
                </button>

              </div>

              {/* Reset */}

              <div className="flex items-end gap-3">

                <button
                  onClick={handleReset}
                  className="flex-1 border border-gray-300 rounded-xl py-3 flex justify-center items-center gap-2 hover:bg-gray-100 transition"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={handleExport}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 flex justify-center items-center gap-2 transition"
                >
                  <FileSpreadsheet size={18} />
                  Excel
                </button>

              </div>

            </div>

          </div>

          {/* Statistik */}

          <ReportCards />

          {/* Grafik */}

          <div className="mt-8">
            <ReportChart />
          </div>

          {/* Table */}

          <div className="mt-8">
            <ReportTable />
          </div>

        </main>

      </div>

    </div>
  );
}