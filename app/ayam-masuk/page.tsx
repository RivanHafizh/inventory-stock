"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface AyamMasuk {
  id: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

export default function AyamMasukPage() {
  const [ayamBesar, setAyamBesar] = useState("");
  const [ayamSedang, setAyamSedang] = useState("");
  const [ayamKecil, setAyamKecil] = useState("");

  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [data, setData] = useState<
    AyamMasuk[]
  >([]);

  const clearForm = () => {
    setAyamBesar("");
    setAyamSedang("");
    setAyamKecil("");
    setEditingId(null);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const besar =
        Number(ayamBesar) || 0;

      const sedang =
        Number(ayamSedang) || 0;

      const kecil =
        Number(ayamKecil) || 0;

      const payload = {
        ayamBesar: besar,
        ayamSedang: sedang,
        ayamKecil: kecil,
        total:
          besar +
          sedang +
          kecil,
      };

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "ayamMasuk",
            editingId
          ),
          payload
        );
      } else {
        await addDoc(
          collection(
            db,
            "ayamMasuk"
          ),
          {
            ...payload,
            createdAt:
              serverTimestamp(),
          }
        );
      }

      clearForm();
      setShowSuccess(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (
    item: AyamMasuk
  ) => {
    setEditingId(item.id);

    setAyamBesar(
      item.ayamBesar.toString()
    );

    setAyamSedang(
      item.ayamSedang.toString()
    );

    setAyamKecil(
      item.ayamKecil.toString()
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
        "Apakah Anda yakin ingin menghapus data ini?"
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(
          db,
          "ayamMasuk",
          id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "ayamMasuk"),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        const result =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          ) as AyamMasuk[];

        setData(result);
      });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="flex min-h-screen bg-[#F8FAFC]">

        <Sidebar />

        <main className="flex-1 p-8">

          <Header />

          {/* Title */}
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Ayam Masuk
            </h1>

            <p className="text-gray-500 mt-1">
              Kelola data ayam masuk
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">

            <h2 className="text-xl font-semibold mb-6">
              {editingId
                ? "Edit Data Ayam"
                : "Tambah Data Ayam"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-3 gap-6"
            >

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Ayam Besar
                </label>

                <input
                  type="number"
                  value={ayamBesar}
                  onChange={(e) =>
                    setAyamBesar(
                      e.target.value
                    )
                  }
                  placeholder="0"
                  required
                  className="w-full border border-gray-200 rounded-2xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Ayam Sedang
                </label>

                <input
                  type="number"
                  value={ayamSedang}
                  onChange={(e) =>
                    setAyamSedang(
                      e.target.value
                    )
                  }
                  placeholder="0"
                  required
                  className="w-full border border-gray-200 rounded-2xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Ayam Kecil
                </label>

                <input
                  type="number"
                  value={ayamKecil}
                  onChange={(e) =>
                    setAyamKecil(
                      e.target.value
                    )
                  }
                  placeholder="0"
                  required
                  className="w-full border border-gray-200 rounded-2xl p-3"
                />
              </div>

              <div className="md:col-span-3 flex gap-3">

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl"
                >
                  {loading
                    ? "Menyimpan..."
                    : editingId
                    ? "Update Data"
                    : "Simpan Data"}
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-200 hover:bg-gray-300 px-8 py-3 rounded-2xl"
                >
                  Clear
                </button>

              </div>

            </form>

          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-semibold">
                Riwayat Ayam Masuk
              </h2>

              <span className="text-sm text-gray-500">
                Total Data: {data.length}
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4">
                      No
                    </th>

                    <th className="text-left py-4">
                      Besar
                    </th>

                    <th className="text-left py-4">
                      Sedang
                    </th>

                    <th className="text-left py-4">
                      Kecil
                    </th>

                    <th className="text-left py-4">
                      Total
                    </th>

                    <th className="text-left py-4">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {data.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-4">
                          {index + 1}
                        </td>

                        <td>
                          {
                            item.ayamBesar
                          }
                        </td>

                        <td>
                          {
                            item.ayamSedang
                          }
                        </td>

                        <td>
                          {
                            item.ayamKecil
                          }
                        </td>

                        <td>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            {
                              item.total
                            }
                          </span>
                        </td>

                        <td>
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item.id
                                )
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                            >
                              Hapus
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

      {/* Modal Success */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl">

            <div className="flex justify-center mb-4">

              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">

                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>

              </div>

            </div>

            <h2 className="text-2xl font-bold text-center">
              Berhasil
            </h2>

            <p className="text-center text-gray-500 mt-2">
              Data ayam berhasil disimpan
            </p>

            <button
              onClick={() =>
                setShowSuccess(false)
              }
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl"
            >
              OK
            </button>

          </div>

        </div>
      )}
    </>
  );
}