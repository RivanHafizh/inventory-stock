"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Bird,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Package,
  RefreshCw,
  Tags,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface Transaction {
  id: string;
  jenis: "Masuk" | "Keluar";
  tanggal: Date;
  tanggalKey: string;
  namaKlien: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

function getDateInfo(
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
    key: `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

export default function DashboardPage() {
  const [dataMasuk, setDataMasuk] = useState<Transaction[]>([]);
  const [dataKeluar, setDataKeluar] = useState<Transaction[]>([]);

  const [kategori, setKategori] = useState(0);
  const [admin, setAdmin] = useState(0);

  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  useEffect(() => {
    let masuk: Transaction[] = [];
    let keluar: Transaction[] = [];

    const syncTransactions = () => {
      setDataMasuk(masuk);
      setDataKeluar(keluar);
      setLoading(false);
    };

    const unsubMasuk = onSnapshot(
      collection(db, "ayamMasuk"),
      (snapshot) => {
        masuk = snapshot.docs.map((item) => {
          const data = item.data();
          const dateInfo = getDateInfo(
            data.tanggal,
            data.createdAt
          );

          return {
            id: item.id,
            jenis: "Masuk",
            tanggal: dateInfo.date,
            tanggalKey: dateInfo.key,
            namaKlien: "-",
            ayamBesar: Number(data.ayamBesar) || 0,
            ayamSedang: Number(data.ayamSedang) || 0,
            ayamKecil: Number(data.ayamKecil) || 0,
            total: Number(data.total) || 0,
          };
        });

        syncTransactions();
      },
      (error) => {
        console.error("Gagal mengambil ayamMasuk:", error);
        setFirebaseError(true);
        setLoading(false);
      }
    );

    const unsubKeluar = onSnapshot(
      collection(db, "ayamKeluar"),
      (snapshot) => {
        keluar = snapshot.docs.map((item) => {
          const data = item.data();
          const dateInfo = getDateInfo(
            data.tanggal,
            data.createdAt
          );

          return {
            id: item.id,
            jenis: "Keluar",
            tanggal: dateInfo.date,
            tanggalKey: dateInfo.key,
            namaKlien: String(data.namaKlien || "-"),
            ayamBesar: Number(data.ayamBesar) || 0,
            ayamSedang: Number(data.ayamSedang) || 0,
            ayamKecil: Number(data.ayamKecil) || 0,
            total: Number(data.total) || 0,
          };
        });

        syncTransactions();
      },
      (error) => {
        console.error("Gagal mengambil ayamKeluar:", error);
        setFirebaseError(true);
        setLoading(false);
      }
    );

    const unsubKategori = onSnapshot(
      collection(db, "kategoriAyam"),
      (snapshot) => {
        setKategori(snapshot.size);
      },
      (error) => {
        console.error(
          "Gagal mengambil kategoriAyam:",
          error
        );
        setFirebaseError(true);
      }
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setAdmin(snapshot.size);
      },
      (error) => {
        console.error("Gagal mengambil users:", error);
        setFirebaseError(true);
      }
    );

    return () => {
      unsubMasuk();
      unsubKeluar();
      unsubKategori();
      unsubUsers();
    };
  }, []);

  const semuaTransaksi = useMemo(
    () =>
      [...dataMasuk, ...dataKeluar].sort(
        (a, b) =>
          b.tanggal.getTime() -
          a.tanggal.getTime()
      ),
    [dataMasuk, dataKeluar]
  );

  const totalMasuk = useMemo(
    () =>
      dataMasuk.reduce(
        (sum, item) => sum + item.total,
        0
      ),
    [dataMasuk]
  );

  const totalKeluar = useMemo(
    () =>
      dataKeluar.reduce(
        (sum, item) => sum + item.total,
        0
      ),
    [dataKeluar]
  );

  const stok = totalMasuk - totalKeluar;

  const transaksiTerbaru = semuaTransaksi.slice(0, 6);

  const transaksiMasukCount = dataMasuk.length;
  const transaksiKeluarCount = dataKeluar.length;

  const hariIniKey = (() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
  })();

  const masukHariIni = dataMasuk
    .filter((item) => item.tanggalKey === hariIniKey)
    .reduce((sum, item) => sum + item.total, 0);

  const keluarHariIni = dataKeluar
    .filter((item) => item.tanggalKey === hariIniKey)
    .reduce((sum, item) => sum + item.total, 0);

  const chartData = useMemo(() => {
    const map = new Map<
      string,
      {
        date: Date;
        masuk: number;
        keluar: number;
      }
    >();

    semuaTransaksi.forEach((item) => {
      const current = map.get(item.tanggalKey);

      if (current) {
        if (item.jenis === "Masuk") {
          current.masuk += item.total;
        } else {
          current.keluar += item.total;
        }
      } else {
        map.set(item.tanggalKey, {
          date: item.tanggal,
          masuk:
            item.jenis === "Masuk" ? item.total : 0,
          keluar:
            item.jenis === "Keluar" ? item.total : 0,
        });
      }
    });

    return Array.from(map.values())
      .sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime()
      )
      .slice(-7);
  }, [semuaTransaksi]);

  const chartMax = Math.max(
    ...chartData.flatMap((item) => [
      item.masuk,
      item.keluar,
    ]),
    1
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
                  Dashboard
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                    Dashboard
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Ringkasan kondisi inventory dan aktivitas
                    ayam secara real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start xl:self-auto px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>

              <span className="text-xs font-semibold text-gray-600">
                Data Live
              </span>
            </div>
          </section>

          {firebaseError && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <RefreshCw
                size={17}
                className="text-amber-600 mt-0.5"
              />

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Sebagian data tidak dapat dimuat
                </p>

                <p className="text-xs text-amber-700 mt-0.5">
                  Periksa koneksi Firebase atau aturan akses
                  Firestore.
                </p>
              </div>
            </div>
          )}

          {/* KPI */}
          <section className="mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <DashboardKpi
              title="Total Stok"
              value={stok}
              suffix="ekor"
              description="Stok bersih saat ini"
              icon={<Bird size={20} />}
              iconClass="bg-emerald-50 text-emerald-600"
              valueClass="text-emerald-700"
            />

            <DashboardKpi
              title="Ayam Masuk"
              value={totalMasuk}
              suffix="ekor"
              description={`${transaksiMasukCount} transaksi`}
              icon={<ArrowDownCircle size={20} />}
              iconClass="bg-sky-50 text-sky-600"
              valueClass="text-sky-700"
            />

            <DashboardKpi
              title="Ayam Keluar"
              value={totalKeluar}
              suffix="ekor"
              description={`${transaksiKeluarCount} transaksi`}
              icon={<ArrowUpCircle size={20} />}
              iconClass="bg-amber-50 text-amber-600"
              valueClass="text-amber-700"
            />

            <DashboardKpi
              title="Kategori Ayam"
              value={kategori}
              suffix="kategori"
              description="Master data aktif"
              icon={<Tags size={20} />}
              iconClass="bg-violet-50 text-violet-600"
              valueClass="text-violet-700"
            />

            <DashboardKpi
              title="Admin"
              value={admin}
              suffix="akun"
              description="Pengguna terdaftar"
              icon={<Users size={20} />}
              iconClass="bg-rose-50 text-rose-600"
              valueClass="text-rose-700"
            />
          </section>

          {/* TODAY SUMMARY */}
          <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <TodayCard
              title="Masuk Hari Ini"
              value={masukHariIni}
              icon={<TrendingUp size={18} />}
              className="text-emerald-700"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <TodayCard
              title="Keluar Hari Ini"
              value={keluarHariIni}
              icon={<TrendingDown size={18} />}
              className="text-amber-700"
              iconClass="bg-amber-50 text-amber-600"
            />

            <TodayCard
              title="Perubahan Hari Ini"
              value={masukHariIni - keluarHariIni}
              icon={<Package size={18} />}
              className={
                masukHariIni - keluarHariIni >= 0
                  ? "text-sky-700"
                  : "text-red-700"
              }
              iconClass={
                masukHariIni - keluarHariIni >= 0
                  ? "bg-sky-50 text-sky-600"
                  : "bg-red-50 text-red-600"
              }
            />
          </section>

          {/* CHART + SYSTEM */}
          <section className="mt-6 grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
            {/* MOVEMENT */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <SectionHeader
                icon={<BarChart3 size={18} />}
                title="Pergerakan Inventory"
                description="Aktivitas ayam masuk dan keluar dalam 7 tanggal transaksi terakhir."
              />

              <div className="p-5 sm:p-6">
                {loading ? (
                  <ChartSkeleton />
                ) : chartData.length > 0 ? (
                  <div className="space-y-5">
                    <div className="flex items-end justify-between gap-2 h-56">
                      {chartData.map((item) => {
                        const masukHeight =
                          Math.max(
                            item.masuk > 0 ? 5 : 0,
                            (item.masuk /
                              chartMax) *
                              100
                          );

                        const keluarHeight =
                          Math.max(
                            item.keluar > 0 ? 5 : 0,
                            (item.keluar /
                              chartMax) *
                              100
                          );

                        return (
                          <div
                            key={item.date.toISOString()}
                            className="flex-1 h-full flex flex-col justify-end items-center gap-2 min-w-0"
                          >
                            <div className="w-full max-w-[58px] h-full flex items-end justify-center gap-1.5">
                              <div
                                className="w-1/2 rounded-t-lg bg-emerald-400 transition-all duration-500"
                                style={{
                                  height: `${masukHeight}%`,
                                }}
                                title={`Masuk: ${item.masuk} ekor`}
                              />

                              <div
                                className="w-1/2 rounded-t-lg bg-amber-400 transition-all duration-500"
                                style={{
                                  height: `${keluarHeight}%`,
                                }}
                                title={`Keluar: ${item.keluar} ekor`}
                              />
                            </div>

                            <span className="text-[10px] font-medium text-gray-400 truncate max-w-full">
                              {formatShortDate(
                                item.date
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-5 pt-3 border-t border-gray-100">
                      <Legend
                        label="Ayam Masuk"
                        className="bg-emerald-400"
                      />

                      <Legend
                        label="Ayam Keluar"
                        className="bg-amber-400"
                      />
                    </div>
                  </div>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </div>

            {/* SYSTEM OVERVIEW */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <SectionHeader
                icon={<Activity size={18} />}
                title="Ringkasan Sistem"
                description="Kondisi data inventory saat ini."
              />

              <div className="p-5 sm:p-6">
                <div className="space-y-3">
                  <SystemRow
                    label="Stok Bersih"
                    value={`${stok.toLocaleString(
                      "id-ID"
                    )} ekor`}
                    valueClass="text-emerald-700"
                  />

                  <SystemRow
                    label="Total Ayam Masuk"
                    value={`${totalMasuk.toLocaleString(
                      "id-ID"
                    )} ekor`}
                  />

                  <SystemRow
                    label="Total Ayam Keluar"
                    value={`${totalKeluar.toLocaleString(
                      "id-ID"
                    )} ekor`}
                  />

                  <SystemRow
                    label="Total Kategori"
                    value={`${kategori} kategori`}
                  />

                  <SystemRow
                    label="Total Admin"
                    value={`${admin} akun`}
                  />
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Activity
                          size={16}
                          className="text-emerald-600"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-700">
                          Status Database
                        </p>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Sinkronisasi real-time
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                        firebaseError
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          firebaseError
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />

                      {firebaseError
                        ? "Periksa koneksi"
                        : "Online"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS */}
          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<ClipboardList size={18} />}
              title="Transaksi Terbaru"
              description="Aktivitas transaksi terbaru dari ayam masuk dan ayam keluar."
              right={
                <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                  {semuaTransaksi.length} total
                </span>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="table-head px-5 py-3.5 text-left">
                      Tanggal
                    </th>
                    <th className="table-head px-4 py-3.5 text-left">
                      Jenis
                    </th>
                    <th className="table-head px-4 py-3.5 text-left">
                      Klien
                    </th>
                    <th className="table-head px-4 py-3.5 text-center">
                      Besar
                    </th>
                    <th className="table-head px-4 py-3.5 text-center">
                      Sedang
                    </th>
                    <th className="table-head px-4 py-3.5 text-center">
                      Kecil
                    </th>
                    <th className="table-head px-4 py-3.5 text-center">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {transaksiTerbaru.length > 0 ? (
                    transaksiTerbaru.map((item) => (
                      <tr
                        key={`${item.jenis}-${item.id}`}
                        className="hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <CalendarDays
                                size={14}
                                className="text-gray-500"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatDate(
                                  item.tanggal
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1.5 rounded-lg text-xs font-bold ${
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
                          <span className="text-sm font-semibold text-gray-700">
                            {item.namaKlien}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                          {item.ayamBesar.toLocaleString(
                            "id-ID"
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                          {item.ayamSedang.toLocaleString(
                            "id-ID"
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                          {item.ayamKecil.toLocaleString(
                            "id-ID"
                          )}
                        </td>

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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-14 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <ClipboardList
                              size={21}
                              className="text-gray-400"
                            />
                          </div>

                          <p className="mt-3 text-sm font-bold text-gray-700">
                            Belum ada transaksi
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Transaksi ayam masuk dan keluar
                            akan muncul di sini.
                          </p>
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

function DashboardKpi({
  title,
  value,
  suffix,
  description,
  icon,
  iconClass,
  valueClass,
}: {
  title: string;
  value: number;
  suffix: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span
              className={`text-2xl font-bold tracking-tight ${valueClass}`}
            >
              {value.toLocaleString("id-ID")}
            </span>

            <span className="text-[11px] font-medium text-gray-400">
              {suffix}
            </span>
          </div>

          <p className="text-[11px] text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-current opacity-60" />
      </div>
    </div>
  );
}

function TodayCard({
  title,
  value,
  icon,
  className,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
  iconClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500">
            {title}
          </p>

          <p
            className={`mt-0.5 text-xl font-bold ${className}`}
          >
            {value.toLocaleString("id-ID")}
            <span className="ml-1 text-xs font-medium text-gray-400">
              ekor
            </span>
          </p>
        </div>
      </div>

      <CalendarDays
        size={16}
        className="text-gray-300"
      />
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
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900">
            {title}
          </h2>

          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {description}
          </p>
        </div>
      </div>

      {right}
    </div>
  );
}

function SystemRow({
  label,
  value,
  valueClass = "text-gray-800",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function Legend({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${className}`}
      />

      <span className="text-xs font-medium text-gray-500">
        {label}
      </span>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-56 flex items-end justify-between gap-3">
      {[35, 60, 45, 75, 50, 68, 40].map(
        (height, index) => (
          <div
            key={index}
            className="flex-1 flex items-end justify-center gap-1.5 h-full"
          >
            <div
              className="w-1/3 rounded-t-lg bg-gray-100 animate-pulse"
              style={{ height: `${height}%` }}
            />

            <div
              className="w-1/3 rounded-t-lg bg-gray-100 animate-pulse"
              style={{
                height: `${Math.max(
                  20,
                  height - 15
                )}%`,
              }}
            />
          </div>
        )
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-56 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
        <BarChart3
          size={22}
          className="text-gray-400"
        />
      </div>

      <p className="mt-3 text-sm font-bold text-gray-700">
        Belum ada data grafik
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Grafik akan muncul setelah terdapat transaksi.
      </p>
    </div>
  );
}