"use client";

import { Pencil, Trash2 } from "lucide-react";

const chickens = [
  {
    id: 1,
    kode: "AYM001",
    nama: "Ayam Potong",
    ukuran: "Ayam Kecil",
    harga: 32000,
    stok: 120,
  },
  {
    id: 2,
    kode: "AYM002",
    nama: "Ayam Potong",
    ukuran: "Ayam Sedang",
    harga: 45000,
    stok: 90,
  },
  {
    id: 3,
    kode: "AYM003",
    nama: "Ayam Potong",
    ukuran: "Ayam Besar",
    harga: 60000,
    stok: 75,
  },
];

export default function ChickenTable() {
  return (
    <div className="overflow-x-auto">

      <table className="w-full">

        <thead>

          <tr className="bg-gray-50">

            <th className="text-left px-5 py-4">No</th>

            <th className="text-left px-5 py-4">
              Kode Ayam
            </th>

            <th className="text-left px-5 py-4">
              Nama Ayam
            </th>

            <th className="text-left px-5 py-4">
              Ukuran Ayam
            </th>

            <th className="text-center px-5 py-4">
              Harga
            </th>

            <th className="text-center px-5 py-4">
              Stok
            </th>

            <th className="text-center px-5 py-4">
              Aksi
            </th>

          </tr>

        </thead>

        <tbody>

          {chickens.map((item, index) => (

            <tr
              key={item.id}
              className="border-b hover:bg-green-50 transition"
            >

              <td className="px-5 py-4">
                {index + 1}
              </td>

              <td className="px-5 py-4 font-semibold text-green-700">
                {item.kode}
              </td>

              <td className="px-5 py-4">
                {item.nama}
              </td>

              <td className="px-5 py-4">

                {item.ukuran === "Ayam Kecil" && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Ayam Kecil
                  </span>
                )}

                {item.ukuran === "Ayam Sedang" && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Ayam Sedang
                  </span>
                )}

                {item.ukuran === "Ayam Besar" && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    Ayam Besar
                  </span>
                )}

              </td>

              <td className="text-center px-5 py-4">
                Rp {item.harga.toLocaleString("id-ID")}
              </td>

              <td className="text-center px-5 py-4">

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {item.stok}
                </span>

              </td>

              <td className="px-5 py-4">

                <div className="flex justify-center gap-3">

                  <button className="w-10 h-10 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center">

                    <Pencil
                      size={18}
                      className="text-yellow-700"
                    />

                  </button>

                  <button className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center">

                    <Trash2
                      size={18}
                      className="text-red-600"
                    />

                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}