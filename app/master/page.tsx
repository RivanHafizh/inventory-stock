"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Bird,
} from "lucide-react";

interface KategoriAyam {
  id: string;
  namaKategori: string;
  deskripsi: string;
}

export default function MasterPage() {
  const [data, setData] = useState<KategoriAyam[]>([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState("");

  const [namaKategori, setNamaKategori] =
    useState("");

  const [deskripsi, setDeskripsi] =
    useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(
        db,
        "kategoriAyam"
      ),
      (snapshot) => {
        const result =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          ) as KategoriAyam[];

        setData(result);
      }
    );

    return () => unsub();
  }, []);

  const filteredData =
    data.filter((item) =>
      item.namaKategori
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const resetForm = () => {
    setEditingId("");
    setNamaKategori("");
    setDeskripsi("");
  };

  const handleSubmit =
    async () => {
      if (!namaKategori) return;

      try {
        if (editingId) {
          await updateDoc(
            doc(
              db,
              "kategoriAyam",
              editingId
            ),
            {
              namaKategori,
              deskripsi,
            }
          );
        } else {
          await addDoc(
            collection(
              db,
              "kategoriAyam"
            ),
            {
              namaKategori,
              deskripsi,
              createdAt:
                serverTimestamp(),
            }
          );
        }

        resetForm();
        setOpenModal(false);

      } catch (error) {
        console.log(error);
      }
    };

  const handleEdit = (
    item: KategoriAyam
  ) => {
    setEditingId(item.id);
    setNamaKategori(
      item.namaKategori
    );
    setDeskripsi(
      item.deskripsi
    );

    setOpenModal(true);
  };

  const handleDelete =
    async (id: string) => {
      const confirmDelete =
        confirm(
          "Hapus kategori ini?"
        );

      if (!confirmDelete)
        return;

      await deleteDoc(
        doc(
          db,
          "kategoriAyam",
          id
        )
      );
    };

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <Header />

        <main className="p-8">

          <div className="flex justify-between items-center mb-8">

            <div>

              <h1 className="text-3xl font-bold text-black">
                Master Data Ayam
              </h1>

              <p className="text-gray-500 mt-2">
                Kelola kategori ayam
              </p>

            </div>

            <button
              onClick={() =>
                setOpenModal(true)
              }
              className="
                bg-green-600
                text-white
                px-5
                py-3
                rounded-2xl
                flex
                items-center
                gap-2
              "
            >
              <Plus size={18} />
              Tambah Data
            </button>

          </div>

          {/* Search */}

          <div className="bg-white rounded-3xl p-5 shadow-sm mb-8">

            <div className="relative">

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                placeholder="Cari kategori ayam..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  border-gray-200
                  rounded-2xl
                  py-3
                  pl-11
                  pr-4
                  text-black
                  outline-none
                "
              />

            </div>

          </div>

          {/* Cards */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {filteredData.map(
              (item) => (
                <div
                  key={item.id}
                  className="
                    bg-white
                    rounded-3xl
                    p-6
                    shadow-sm
                    hover:shadow-lg
                    transition
                  "
                >

                  <div className="flex items-center gap-3 mb-4">

                    <div
                      className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-green-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Bird
                        size={28}
                        className="
                          text-green-700
                        "
                      />
                    </div>

                    <div>

                      <h3 className="font-bold text-black text-lg">
                        {
                          item.namaKategori
                        }
                      </h3>

                    </div>

                  </div>

                  <p className="text-gray-600 min-h-[60px]">
                    {item.deskripsi}
                  </p>

                  <div className="flex gap-3 mt-6">

                    <button
                      onClick={() =>
                        handleEdit(
                          item
                        )
                      }
                      className="
                        flex-1
                        bg-yellow-100
                        text-black
                        py-3
                        rounded-xl
                        flex
                        justify-center
                        items-center
                        gap-2
                      "
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          item.id
                        )
                      }
                      className="
                        flex-1
                        bg-red-100
                        text-black
                        py-3
                        rounded-xl
                        flex
                        justify-center
                        items-center
                        gap-2
                      "
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        </main>

      </div>

      {/* Modal */}

      {openModal && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-black">

                {editingId
                  ? "Edit Kategori"
                  : "Tambah Kategori"}

              </h2>

              <button
                onClick={() =>
                  setOpenModal(false)
                }
              >
                <X />
              </button>

            </div>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nama Kategori"
                value={namaKategori}
                onChange={(e) =>
                  setNamaKategori(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded-2xl
                  p-4
                  text-black
                "
              />

              <textarea
                rows={4}
                placeholder="Deskripsi"
                value={deskripsi}
                onChange={(e) =>
                  setDeskripsi(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded-2xl
                  p-4
                  text-black
                "
              />

              <button
                onClick={handleSubmit}
                className="
                  w-full
                  bg-green-600
                  text-white
                  py-4
                  rounded-2xl
                  font-semibold
                "
              >
                Simpan Data
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}