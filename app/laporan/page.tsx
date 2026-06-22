"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import ReportCards from "@/components/reportCards";
import ReportChart from "@/components/reportChart";
import ReportTable from "@/components/reportTable";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface ReportItem {
  id: string;
  jenis: "Masuk" | "Keluar";
  tanggal: Date;
  namaKlien?: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

export default function LaporanPage() {
  const [tanggalAwal, setTanggalAwal] =
    useState("");

  const [tanggalAkhir, setTanggalAkhir] =
    useState("");

  const [ayam, setAyam] =
    useState("");

  const [laporan, setLaporan] =
    useState<ReportItem[]>([]);

  useEffect(() => {
    let masuk: ReportItem[] = [];
    let keluar: ReportItem[] = [];

    const updateData = () => {
      setLaporan([
        ...masuk,
        ...keluar,
      ]);
    };

    const unsubMasuk =
      onSnapshot(
        collection(
          db,
          "ayamMasuk"
        ),
        (snapshot) => {
          masuk =
            snapshot.docs.map(
              (doc) => {
                const data =
                  doc.data();

                return {
                  id: doc.id,
                  jenis: "Masuk",

                  tanggal:
                    data.createdAt?.toDate() ||
                    new Date(),

                  ayamBesar:
                    data.ayamBesar || 0,

                  ayamSedang:
                    data.ayamSedang || 0,

                  ayamKecil:
                    data.ayamKecil || 0,

                  total:
                    data.total || 0,
                };
              }
            );

          updateData();
        }
      );

    const unsubKeluar =
      onSnapshot(
        collection(
          db,
          "ayamKeluar"
        ),
        (snapshot) => {
          keluar =
            snapshot.docs.map(
              (doc) => {
                const data =
                  doc.data();

                return {
                  id: doc.id,
                  jenis:
                    "Keluar",

                  tanggal:
                    data.createdAt?.toDate() ||
                    new Date(),

                  namaKlien:
                    data.namaKlien ||
                    "-",

                  ayamBesar:
                    data.ayamBesar || 0,

                  ayamSedang:
                    data.ayamSedang || 0,

                  ayamKecil:
                    data.ayamKecil || 0,

                  total:
                    data.total || 0,
                };
              }
            );

          updateData();
        }
      );

    return () => {
      unsubMasuk();
      unsubKeluar();
    };
  }, []);

  const filteredData =
    useMemo(() => {
      return laporan.filter(
        (item) => {
          const cocokAyam =
            !ayam ||
            (ayam ===
              "ayam besar" &&
              item.ayamBesar > 0) ||
            (ayam ===
              "ayam sedang" &&
              item.ayamSedang > 0) ||
            (ayam ===
              "ayam kecil" &&
              item.ayamKecil > 0);

          const cocokAwal =
            !tanggalAwal ||
            item.tanggal >=
              new Date(
                tanggalAwal
              );

          const cocokAkhir =
            !tanggalAkhir ||
            item.tanggal <=
              new Date(
                tanggalAkhir +
                  "T23:59:59"
              );

          return (
            cocokAyam &&
            cocokAwal &&
            cocokAkhir
          );
        }
      );
    }, [
      laporan,
      ayam,
      tanggalAwal,
      tanggalAkhir,
    ]);

  const totalMasuk =
    filteredData
      .filter(
        (item) =>
          item.jenis ===
          "Masuk"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.total,
        0
      );

  const totalKeluar =
    filteredData
      .filter(
        (item) =>
          item.jenis ===
          "Keluar"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.total,
        0
      );

  const totalStok =
    totalMasuk -
    totalKeluar;

  const handleReset =
    () => {
      setTanggalAwal("");
      setTanggalAkhir("");
      setAyam("");
    };

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <Header />

        <main className="p-8">

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">
              Laporan Inventory Ayam
            </h1>

            <p className="text-gray-500 mt-2">
              Ringkasan transaksi
              ayam masuk dan
              ayam keluar.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">

            <div className="grid md:grid-cols-4 gap-4">

              <input
                type="date"
                value={
                  tanggalAwal
                }
                onChange={(e) =>
                  setTanggalAwal(
                    e.target.value
                  )
                }
                className="border rounded-xl p-3"
              />

              <input
                type="date"
                value={
                  tanggalAkhir
                }
                onChange={(e) =>
                  setTanggalAkhir(
                    e.target.value
                  )
                }
                className="border rounded-xl p-3"
              />

              <select
                value={ayam}
                onChange={(e) =>
                  setAyam(
                    e.target.value
                  )
                }
                className="border rounded-xl p-3"
              >
                <option value="">
                  Semua Ayam
                </option>

                <option value="ayam kecil">
                  Ayam Kecil
                </option>

                <option value="ayam sedang">
                  Ayam Sedang
                </option>

                <option value="ayam besar">
                  Ayam Besar
                </option>
              </select>

              <button
                onClick={
                  handleReset
                }
                className="bg-gray-200 rounded-xl"
              >
                Reset
              </button>

            </div>

          </div>

          <ReportCards
            totalMasuk={
              totalMasuk
            }
            totalKeluar={
              totalKeluar
            }
            totalStok={
              totalStok
            }
          />

          <div className="mt-8">
            <ReportChart
              laporan={
                filteredData
              }
            />
          </div>

          <div className="mt-8">
            <ReportTable
              laporan={
                filteredData
              }
            />
          </div>

        </main>

      </div>

    </div>
  );
}