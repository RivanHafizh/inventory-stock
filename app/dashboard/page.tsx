"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import StatCard from "@/components/statcard";

import ReportChart, {
  ReportItem,
} from "@/components/reportChart";

import {
  Bird,
  ArrowDownCircle,
  ArrowUpCircle,
  Tags,
  Users,
} from "lucide-react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const [totalMasuk, setTotalMasuk] =
    useState(0);

  const [totalKeluar, setTotalKeluar] =
    useState(0);

  const [stok, setStok] =
    useState(0);

  const [kategori, setKategori] =
    useState(0);

  const [admin, setAdmin] =
    useState(0);

  const [laporan, setLaporan] =
    useState<ReportItem[]>([]);

  useEffect(() => {
    let dataMasuk: ReportItem[] =
      [];

    let dataKeluar: ReportItem[] =
      [];

    const unsubMasuk =
      onSnapshot(
        collection(
          db,
          "ayamMasuk"
        ),
        (snapshot) => {
          let total = 0;

          dataMasuk =
            snapshot.docs.map(
              (doc) => {
                const data =
                  doc.data();

                total +=
                  data.total || 0;

                return {
                  id: doc.id,
                  jenis:
                    "Masuk",
                  tanggal:
                    data.createdAt?.toDate?.() ||
                    new Date(),
                  total:
                    data.total || 0,
                };
              }
            );

          setTotalMasuk(
            total
          );

          setLaporan([
            ...dataMasuk,
            ...dataKeluar,
          ]);
        }
      );

    const unsubKeluar =
      onSnapshot(
        collection(
          db,
          "ayamKeluar"
        ),
        (snapshot) => {
          let total = 0;

          dataKeluar =
            snapshot.docs.map(
              (doc) => {
                const data =
                  doc.data();

                total +=
                  data.total || 0;

                return {
                  id: doc.id,
                  jenis:
                    "Keluar",
                  tanggal:
                    data.createdAt?.toDate?.() ||
                    new Date(),
                  total:
                    data.total || 0,
                };
              }
            );

          setTotalKeluar(
            total
          );

          setLaporan([
            ...dataMasuk,
            ...dataKeluar,
          ]);
        }
      );

    const unsubKategori =
      onSnapshot(
        collection(
          db,
          "masterAyam"
        ),
        (snapshot) => {
          setKategori(
            snapshot.size
          );
        }
      );

    const unsubUsers =
      onSnapshot(
        collection(
          db,
          "users"
        ),
        (snapshot) => {
          setAdmin(
            snapshot.size
          );
        }
      );

    return () => {
      unsubMasuk();
      unsubKeluar();
      unsubKategori();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    setStok(
      totalMasuk -
        totalKeluar
    );
  }, [
    totalMasuk,
    totalKeluar,
  ]);

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <div className="p-6">

          <Header />

          <main className="mt-6">

            {/* Heading */}

            <div className="mb-8">

              <h1 className="text-3xl font-bold text-black">
                Dashboard
              </h1>

              <p className="text-gray-500 mt-2">
                Ringkasan aktivitas
                inventory ayam
              </p>

            </div>

            {/* Stat Card */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">

              <StatCard
                title="Total Stok"
                value={stok}
                icon={
                  <Bird
                    size={26}
                  />
                }
                color="bg-blue-600"
              />

              <StatCard
                title="Ayam Masuk"
                value={
                  totalMasuk
                }
                icon={
                  <ArrowDownCircle
                    size={26}
                  />
                }
                color="bg-green-600"
              />

              <StatCard
                title="Ayam Keluar"
                value={
                  totalKeluar
                }
                icon={
                  <ArrowUpCircle
                    size={26}
                  />
                }
                color="bg-red-600"
              />

              <StatCard
                title="Kategori"
                value={
                  kategori
                }
                icon={
                  <Tags
                    size={26}
                  />
                }
                color="bg-orange-500"
              />

              <StatCard
                title="Admin"
                value={admin}
                icon={
                  <Users
                    size={26}
                  />
                }
                color="bg-purple-600"
              />

            </div>

            {/* Chart */}

            <div className="mt-8">

              <ReportChart
                laporan={
                  laporan
                }
              />

            </div>

            {/* Bottom Card */}

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

              {/* Informasi */}

              <div className="bg-white rounded-3xl p-6 shadow-sm">

                <h2 className="text-xl font-bold text-black mb-5">
                  Informasi Sistem
                </h2>

                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Total Ayam
                      Masuk
                    </span>

                    <span className="font-semibold text-black">
                      {
                        totalMasuk
                      }
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Total Ayam
                      Keluar
                    </span>

                    <span className="font-semibold text-black">
                      {
                        totalKeluar
                      }
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Stok Saat Ini
                    </span>

                    <span className="font-semibold text-green-600">
                      {stok}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Total Kategori
                    </span>

                    <span className="font-semibold text-black">
                      {
                        kategori
                      }
                    </span>

                  </div>

                </div>

              </div>

              {/* Status */}

              <div className="bg-white rounded-3xl p-6 shadow-sm">

                <h2 className="text-xl font-bold text-black mb-5">
                  Status Sistem
                </h2>

                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Firebase
                    </span>

                    <span className="text-green-600 font-semibold">
                      Connected
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Firestore
                    </span>

                    <span className="text-green-600 font-semibold">
                      Online
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Monitoring
                    </span>

                    <span className="text-green-600 font-semibold">
                      Active
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Total Admin
                    </span>

                    <span className="font-semibold text-black">
                      {admin}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}