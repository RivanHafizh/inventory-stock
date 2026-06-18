"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const reports = [
  {
    id: 1,
    tanggal: "18 Juni 2026",
    kode: "AYM001",
    nama: "ayam kecil",
    masuk: 100,
    keluar: 30,
    stok: 70,
  },
  {
    id: 2,
    tanggal: "18 Juni 2026",
    kode: "AYM002",
    nama: "ayam sedang",
    masuk: 80,
    keluar: 15,
    stok: 65,
  },
  {
    id: 3,
    tanggal: "19 Juni 2026",
    kode: "AYM003",
    nama: "ayam besar",
    masuk: 120,
    keluar: 40,
    stok: 80,
  },
  {
    id: 4,
    tanggal: "20 Juni 2026",
    kode: "AYM004",
    nama: "Broiler Premium",
    masuk: 90,
    keluar: 20,
    stok: 70,
  },
];

export default function ReportTable() {
  const [search, setSearch] = useState("");

  const filteredData = reports.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Data Laporan
          </h2>

          <p className="text-gray-500 text-sm">
            Daftar transaksi inventory ayam
          </p>
        </div>

        {/* Search */}

        <div className="relative w-full md:w-72">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Cari nama ayam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="bg-gray-50 text-gray-600">

              <th className="px-4 py-4 text-left">No</th>

              <th className="px-4 py-4 text-left">
                Tanggal
              </th>

              <th className="px-4 py-4 text-left">
                Kode Ayam
              </th>

              <th className="px-4 py-4 text-left">
                Nama Ayam
              </th>

              <th className="px-4 py-4 text-center">
                Ayam Masuk
              </th>

              <th className="px-4 py-4 text-center">
                Ayam Keluar
              </th>

              <th className="px-4 py-4 text-center">
                Total Stok
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-green-50 transition"
                >
                  <td className="px-4 py-4">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4">
                    {item.tanggal}
                  </td>

                  <td className="px-4 py-4 font-medium text-green-700">
                    {item.kode}
                  </td>

                  <td className="px-4 py-4">
                    {item.nama}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {item.masuk}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                      {item.keluar}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-blue-600">
                    {item.stok}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}