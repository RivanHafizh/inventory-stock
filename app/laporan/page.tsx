"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Filter,
  Package,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type JenisTransaksi = "Masuk" | "Keluar";
type KategoriAyam =
  | ""
  | "ayam besar"
  | "ayam sedang"
  | "ayam kecil";

interface ReportItem {
  id: string;
  jenis: JenisTransaksi;
  tanggal: Date;
  tanggalKey: string;
  namaKlien: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(
    2,
    "0"
  )}`;
}

function parseDate(
  tanggal: unknown,
  createdAt: any
): { date: Date; key: string } {
  if (typeof tanggal === "string" && tanggal.trim()) {
    const date = new Date(`${tanggal}T00:00:00`);

    if (!Number.isNaN(date.getTime())) {
      return {
        date,
        key: tanggal,
      };
    }
  }

  if (createdAt?.toDate) {
    const date = createdAt.toDate();

    return {
      date,
      key: `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`,
    };
  }

  const date = new Date();

  return {
    date,
    key: getTodayKey(),
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCategoryValue(
  item: ReportItem,
  category: KategoriAyam
) {
  if (category === "ayam besar") return item.ayamBesar;
  if (category === "ayam sedang") return item.ayamSedang;
  if (category === "ayam kecil") return item.ayamKecil;

  return item.total;
}

export default function LaporanPage() {
  const [laporan, setLaporan] = useState<ReportItem[]>([]);

  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [ayam, setAyam] =
    useState<KategoriAyam>("");
  const [jenis, setJenis] = useState<
    "" | JenisTransaksi
  >("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    let masuk: ReportItem[] = [];
    let keluar: ReportItem[] = [];

    const updateData = () => {
      setLaporan(
        [...masuk, ...keluar].sort(
          (a, b) =>
            b.tanggal.getTime() -
            a.tanggal.getTime()
        )
      );
    };

    const unsubMasuk = onSnapshot(
      collection(db, "ayamMasuk"),
      (snapshot) => {
        masuk = snapshot.docs.map((item) => {
          const data = item.data();
          const dateInfo = parseDate(
            data.tanggal,
            data.createdAt
          );

          return {
            id: item.id,
            jenis: "Masuk",
            tanggal: dateInfo.date,
            tanggalKey: dateInfo.key,
            namaKlien: "-",
            ayamBesar:
              Number(data.ayamBesar) || 0,
            ayamSedang:
              Number(data.ayamSedang) || 0,
            ayamKecil:
              Number(data.ayamKecil) || 0,
            total: Number(data.total) || 0,
          };
        });

        updateData();
      },
      (error) => {
        console.error(
          "Gagal mengambil ayamMasuk:",
          error
        );
      }
    );

    const unsubKeluar = onSnapshot(
      collection(db, "ayamKeluar"),
      (snapshot) => {
        keluar = snapshot.docs.map((item) => {
          const data = item.data();
          const dateInfo = parseDate(
            data.tanggal,
            data.createdAt
          );

          return {
            id: item.id,
            jenis: "Keluar",
            tanggal: dateInfo.date,
            tanggalKey: dateInfo.key,
            namaKlien:
              data.namaKlien || "-",
            ayamBesar:
              Number(data.ayamBesar) || 0,
            ayamSedang:
              Number(data.ayamSedang) || 0,
            ayamKecil:
              Number(data.ayamKecil) || 0,
            total: Number(data.total) || 0,
          };
        });

        updateData();
      },
      (error) => {
        console.error(
          "Gagal mengambil ayamKeluar:",
          error
        );
      }
    );

    return () => {
      unsubMasuk();
      unsubKeluar();
    };
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return laporan.filter((item) => {
      const cocokTanggalAwal =
        !tanggalAwal ||
        item.tanggalKey >= tanggalAwal;

      const cocokTanggalAkhir =
        !tanggalAkhir ||
        item.tanggalKey <= tanggalAkhir;

      const cocokKategori =
        !ayam ||
        getCategoryValue(item, ayam) > 0;

      const cocokJenis =
        !jenis || item.jenis === jenis;

      const cocokSearch =
        !keyword ||
        item.namaKlien
          .toLowerCase()
          .includes(keyword) ||
        item.jenis
          .toLowerCase()
          .includes(keyword) ||
        formatDate(item.tanggal)
          .toLowerCase()
          .includes(keyword) ||
        String(item.total).includes(keyword);

      return (
        cocokTanggalAwal &&
        cocokTanggalAkhir &&
        cocokKategori &&
        cocokJenis &&
        cocokSearch
      );
    });
  }, [
    laporan,
    tanggalAwal,
    tanggalAkhir,
    ayam,
    jenis,
    search,
  ]);

  const totalMasuk = filteredData
    .filter((item) => item.jenis === "Masuk")
    .reduce(
      (sum, item) => sum + item.total,
      0
    );

  const totalKeluar = filteredData
    .filter((item) => item.jenis === "Keluar")
    .reduce(
      (sum, item) => sum + item.total,
      0
    );

  const totalStok = totalMasuk - totalKeluar;

  const jumlahMasuk = filteredData.filter(
    (item) => item.jenis === "Masuk"
  ).length;

  const jumlahKeluar = filteredData.filter(
    (item) => item.jenis === "Keluar"
  ).length;

  const categoryTotal = filteredData.reduce(
    (sum, item) =>
      sum + getCategoryValue(item, ayam),
    0
  );

  const resetFilter = () => {
    setTanggalAwal("");
    setTanggalAkhir("");
    setAyam("");
    setJenis("");
    setSearch("");
  };

  const hasFilter =
    Boolean(
      tanggalAwal ||
        tanggalAkhir ||
        ayam ||
        jenis ||
        search
    );

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* HEADER */}
          <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <span>Inventory</span>
                <ChevronRight size={13} />
                <span className="text-emerald-600">
                  Laporan
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BarChart3
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                    Laporan Inventory Ayam
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Pantau transaksi masuk, keluar, dan
                    perubahan stok dengan filter yang lebih
                    terarah.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SummaryMini
                label="Transaksi"
                value={filteredData.length}
                suffix="data"
              />

              <SummaryMini
                label="Perubahan Stok"
                value={totalStok}
                suffix="ekor"
                primary
              />
            </div>
          </section>

          {/* FILTER */}
          <section className="mt-7 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Filter
                    size={18}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Filter Laporan
                  </h2>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Filter langsung berdasarkan tanggal,
                    kategori, jenis transaksi, atau pencarian.
                  </p>
                </div>
              </div>

              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilter}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  <X size={14} />
                  Reset Filter
                </button>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <FilterField
                  label="Tanggal Mulai"
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    value={tanggalAwal}
                    max={tanggalAkhir || undefined}
                    onChange={(e) =>
                      setTanggalAwal(e.target.value)
                    }
                    className="filter-input"
                  />
                </FilterField>

                <FilterField
                  label="Tanggal Akhir"
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    value={tanggalAkhir}
                    min={tanggalAwal || undefined}
                    onChange={(e) =>
                      setTanggalAkhir(e.target.value)
                    }
                    className="filter-input"
                  />
                </FilterField>

                <FilterField
                  label="Kategori Ayam"
                  icon={<Package size={15} />}
                >
                  <select
                    value={ayam}
                    onChange={(e) =>
                      setAyam(
                        e.target.value as KategoriAyam
                      )
                    }
                    className="filter-input"
                  >
                    <option value="">
                      Semua Kategori
                    </option>
                    <option value="ayam besar">
                      Ayam Besar
                    </option>
                    <option value="ayam sedang">
                      Ayam Sedang
                    </option>
                    <option value="ayam kecil">
                      Ayam Kecil
                    </option>
                  </select>
                </FilterField>

                <FilterField
                  label="Jenis Transaksi"
                  icon={<ClipboardList size={15} />}
                >
                  <select
                    value={jenis}
                    onChange={(e) =>
                      setJenis(
                        e.target.value as
                          | ""
                          | JenisTransaksi
                      )
                    }
                    className="filter-input"
                  >
                    <option value="">
                      Semua Transaksi
                    </option>
                    <option value="Masuk">
                      Ayam Masuk
                    </option>
                    <option value="Keluar">
                      Ayam Keluar
                    </option>
                  </select>
                </FilterField>

                <FilterField
                  label="Pencarian"
                  icon={<Search size={15} />}
                >
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari klien, tanggal..."
                      className="filter-input pl-10"
                    />
                  </div>
                </FilterField>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-500">
                    Menampilkan:
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                    {filteredData.length} transaksi
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">
                    Masuk: {jumlahMasuk}
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">
                    Keluar: {jumlahKeluar}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Total kategori terpilih:{" "}
                  <span className="font-bold text-gray-700">
                    {categoryTotal.toLocaleString(
                      "id-ID"
                    )}{" "}
                    ekor
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* KPI */}
          <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              title="Total Ayam Masuk"
              value={totalMasuk}
              description="Sesuai filter laporan"
              icon={<TrendingUp size={20} />}
              iconClass="bg-emerald-50 text-emerald-600"
              valueClass="text-emerald-700"
              barClass="bg-emerald-500"
            />

            <KpiCard
              title="Total Ayam Keluar"
              value={totalKeluar}
              description="Sesuai filter laporan"
              icon={<TrendingDown size={20} />}
              iconClass="bg-amber-50 text-amber-600"
              valueClass="text-amber-700"
              barClass="bg-amber-500"
            />

            <KpiCard
              title="Stok Bersih"
              value={totalStok}
              description="Masuk dikurangi keluar"
              icon={<Package size={20} />}
              iconClass="bg-sky-50 text-sky-600"
              valueClass="text-sky-700"
              barClass="bg-sky-500"
            />
          </section>

          {/* CHART */}
          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<BarChart3 size={18} />}
              title="Ringkasan Pergerakan"
              description="Perbandingan jumlah ayam masuk dan keluar berdasarkan filter aktif."
            />

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MovementBar
                  label="Ayam Masuk"
                  value={totalMasuk}
                  max={Math.max(
                    totalMasuk,
                    totalKeluar,
                    1
                  )}
                  valueClass="text-emerald-700"
                  barClass="bg-emerald-500"
                />

                <MovementBar
                  label="Ayam Keluar"
                  value={totalKeluar}
                  max={Math.max(
                    totalMasuk,
                    totalKeluar,
                    1
                  )}
                  valueClass="text-amber-700"
                  barClass="bg-amber-500"
                />
              </div>
            </div>
          </section>

          {/* DETAIL TRANSAKSI */}
          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<ClipboardList size={18} />}
              title="Detail Transaksi"
              description="Daftar transaksi yang sesuai dengan filter laporan."
              right={
                <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                  {filteredData.length} data
                </span>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left table-head">
                      No
                    </th>

                    <th className="px-4 py-3.5 text-left table-head">
                      Tanggal
                    </th>

                    <th className="px-4 py-3.5 text-left table-head">
                      Jenis
                    </th>

                    <th className="px-4 py-3.5 text-left table-head">
                      Klien
                    </th>

                    <th className="px-4 py-3.5 text-center table-head">
                      Besar
                    </th>

                    <th className="px-4 py-3.5 text-center table-head">
                      Sedang
                    </th>

                    <th className="px-4 py-3.5 text-center table-head">
                      Kecil
                    </th>

                    <th className="px-4 py-3.5 text-center table-head">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredData.length > 0 ? (
                    filteredData.map(
                      (item, index) => (
                        <tr
                          key={`${item.jenis}-${item.id}`}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                <CalendarDays
                                  size={15}
                                  className="text-gray-500"
                                />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {formatDate(
                                    item.tanggal
                                  )}
                                </p>

                                <p className="text-[11px] text-gray-400">
                                  {item.tanggalKey}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                                item.jenis ===
                                "Masuk"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.jenis}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {item.jenis ===
                            "Keluar" ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                  {item.namaKlien
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <span className="text-sm font-semibold text-gray-800">
                                  {item.namaKlien}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                -
                              </span>
                            )}
                          </td>

                          <QuantityCell
                            value={item.ayamBesar}
                            selected={
                              ayam === "ayam besar"
                            }
                          />

                          <QuantityCell
                            value={item.ayamSedang}
                            selected={
                              ayam === "ayam sedang"
                            }
                          />

                          <QuantityCell
                            value={item.ayamKecil}
                            selected={
                              ayam === "ayam kecil"
                            }
                          />

                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex min-w-[72px] justify-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                                item.jenis ===
                                "Masuk"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.total.toLocaleString(
                                "id-ID"
                              )}{" "}
                              ekor
                            </span>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-16 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <ClipboardList
                              size={23}
                              className="text-gray-400"
                            />
                          </div>

                          <p className="text-sm font-bold text-gray-700">
                            Tidak ada transaksi
                          </p>

                          <p className="text-xs text-gray-400 mt-1 max-w-sm">
                            Tidak ada data yang cocok dengan
                            filter yang sedang digunakan.
                          </p>

                          <button
                            type="button"
                            onClick={resetFilter}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                          >
                            <RefreshCw size={14} />
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .filter-input {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          outline: none;
          transition: all 0.2s ease;
        }

        .filter-input:focus {
          background: #ffffff;
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .table-head {
          font-size: 11px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

function SummaryMini({
  label,
  value,
  suffix,
  primary = false,
}: {
  label: string;
  value: number;
  suffix: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 shadow-sm ${
        primary
          ? "bg-emerald-600 shadow-emerald-600/20"
          : "bg-white border border-gray-200"
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-wider font-semibold ${
          primary
            ? "text-emerald-100"
            : "text-gray-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-0.5 text-lg font-bold ${
          primary ? "text-white" : "text-gray-900"
        }`}
      >
        {value.toLocaleString("id-ID")}
        <span
          className={`ml-1 text-xs font-medium ${
            primary
              ? "text-emerald-100"
              : "text-gray-400"
          }`}
        >
          {suffix}
        </span>
      </p>
    </div>
  );
}

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-700">
        <span className="text-gray-400">
          {icon}
        </span>

        {label}
      </div>

      {children}
    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon,
  iconClass,
  valueClass,
  barClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
  barClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-3xl font-bold tracking-tight ${valueClass}`}
            >
              {value.toLocaleString("id-ID")}
            </span>

            <span className="text-xs font-medium text-gray-400">
              ekor
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full w-2/3 rounded-full ${barClass}`}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          {icon}
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900">
            {title}
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {right}
    </div>
  );
}

function MovementBar({
  label,
  value,
  max,
  valueClass,
  barClass,
}: {
  label: string;
  value: number;
  max: number;
  valueClass: string;
  barClass: string;
}) {
  const width =
    max > 0
      ? Math.max(
          value > 0 ? 4 : 0,
          Math.min((value / max) * 100, 100)
        )
      : 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-gray-700">
          {label}
        </p>

        <p
          className={`text-lg font-bold ${valueClass}`}
        >
          {value.toLocaleString("id-ID")} ekor
        </p>
      </div>

      <div className="mt-4 h-3 rounded-full bg-white border border-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function QuantityCell({
  value,
  selected,
}: {
  value: number;
  selected: boolean;
}) {
  return (
    <td className="px-4 py-4 text-center">
      <span
        className={`inline-flex min-w-[42px] justify-center px-2.5 py-1.5 rounded-lg text-sm font-semibold ${
          selected
            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
            : "text-gray-700"
        }`}
      >
        {value.toLocaleString("id-ID")}
      </span>
    </td>
  );
}