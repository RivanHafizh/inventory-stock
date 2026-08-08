"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bird,
  Check,
  ClipboardList,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface KategoriAyam {
  id: string;
  namaKategori: string;
  deskripsi: string;
  createdAt?: unknown;
}

export default function MasterPage() {
  const [data, setData] = useState<KategoriAyam[]>([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [namaKategori, setNamaKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoadingData(true);

    const unsub = onSnapshot(
      collection(db, "kategoriAyam"),
      (snapshot) => {
        const result = snapshot.docs
          .map((item) => {
            const raw = item.data();

            return {
              id: item.id,
              namaKategori: String(raw.namaKategori ?? ""),
              deskripsi: String(raw.deskripsi ?? ""),
              createdAt: raw.createdAt,
            };
          })
          .sort((a, b) =>
            a.namaKategori.localeCompare(
              b.namaKategori,
              "id-ID"
            )
          );

        setData(result);
        setLoadingData(false);
      },
      (error) => {
        console.error(
          "Gagal mengambil kategori ayam:",
          error
        );
        setErrorMessage(
          "Data kategori ayam gagal dimuat. Periksa koneksi Firebase."
        );
        setLoadingData(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((item) => {
      return (
        item.namaKategori
          .toLowerCase()
          .includes(keyword) ||
        item.deskripsi
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [data, search]);

  const resetForm = () => {
    setEditingId("");
    setNamaKategori("");
    setDeskripsi("");
    setErrorMessage("");
  };

  const closeModal = () => {
    if (loading) return;

    setOpenModal(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    const nama = namaKategori.trim();
    const desc = deskripsi.trim();

    if (!nama) {
      setErrorMessage("Nama kategori wajib diisi.");
      return;
    }

    if (nama.length < 2) {
      setErrorMessage(
        "Nama kategori minimal terdiri dari 2 karakter."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "kategoriAyam", editingId),
          {
            namaKategori: nama,
            deskripsi: desc,
          }
        );
      } else {
        await addDoc(
          collection(db, "kategoriAyam"),
          {
            namaKategori: nama,
            deskripsi: desc,
            createdAt: serverTimestamp(),
          }
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Gagal menyimpan kategori ayam:",
        error
      );

      setErrorMessage(
        "Data gagal disimpan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: KategoriAyam) => {
    setEditingId(item.id);
    setNamaKategori(item.namaKategori);
    setDeskripsi(item.deskripsi);
    setErrorMessage("");
    setOpenModal(true);
  };

  const handleDelete = async (item: KategoriAyam) => {
    const confirmDelete = window.confirm(
      `Hapus kategori "${item.namaKategori}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
    );

    if (!confirmDelete) return;

    try {
      setErrorMessage("");

      await deleteDoc(
        doc(db, "kategoriAyam", item.id)
      );
    } catch (error) {
      console.error(
        "Gagal menghapus kategori ayam:",
        error
      );

      setErrorMessage(
        "Data gagal dihapus. Silakan coba lagi."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* HEADER */}
          <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <span>Master Data</span>
                <span>/</span>
                <span className="text-emerald-600">
                  Ayam
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Bird
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                    Master Data Ayam
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Kelola kategori dan informasi jenis ayam
                    yang digunakan dalam sistem inventory.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-600/20 transition"
            >
              <Plus size={18} />
              Tambah Kategori
            </button>
          </section>

          {/* SUMMARY */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryCard
              title="Total Kategori"
              value={data.length}
              description="Seluruh kategori ayam"
              icon={<Bird size={19} />}
            />

            <SummaryCard
              title="Hasil Pencarian"
              value={filteredData.length}
              description={
                search.trim()
                  ? `Cocok dengan "${search.trim()}"`
                  : "Semua kategori sedang ditampilkan"
              }
              icon={<ClipboardList size={19} />}
            />
          </section>

          {/* SEARCH + TABLE/CARDS */}
          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Daftar Kategori Ayam
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Tambah, ubah, hapus, atau cari kategori
                    ayam.
                  </p>
                </div>

                <div className="relative w-full lg:w-80">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari kategori atau deskripsi..."
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label="Hapus pencarian"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                  {filteredData.length} kategori
                </span>

                {search.trim() && (
                  <span className="text-gray-400">
                    Pencarian aktif
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {errorMessage && !openModal && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {loadingData ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-emerald-600 animate-spin" />

                  <p className="text-sm font-semibold text-gray-700 mt-4">
                    Memuat kategori ayam...
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Mengambil data terbaru dari database.
                  </p>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredData.map((item, index) => (
                    <CategoryCard
                      key={item.id}
                      item={item}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    {search ? (
                      <Search
                        size={23}
                        className="text-gray-400"
                      />
                    ) : (
                      <Bird
                        size={23}
                        className="text-gray-400"
                      />
                    )}
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-gray-800">
                    {search
                      ? "Kategori tidak ditemukan"
                      : "Belum ada kategori ayam"}
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
                    {search
                      ? "Coba gunakan kata kunci pencarian yang berbeda."
                      : "Tambahkan kategori ayam pertama untuk mulai mengelola master data."}
                  </p>

                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
                    >
                      <RefreshCw size={14} />
                      Reset Pencarian
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      <Plus size={14} />
                      Tambah Kategori
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* MODAL */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/45 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {editingId ? (
                    <Edit3
                      size={18}
                      className="text-emerald-600"
                    />
                  ) : (
                    <Plus
                      size={19}
                      className="text-emerald-600"
                    />
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {editingId
                      ? "Edit Kategori Ayam"
                      : "Tambah Kategori Ayam"}
                  </h2>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Lengkapi informasi kategori di bawah.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-50"
                aria-label="Tutup modal"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="namaKategori"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Nama Kategori
                  </label>

                  <input
                    id="namaKategori"
                    type="text"
                    value={namaKategori}
                    onChange={(e) =>
                      setNamaKategori(e.target.value)
                    }
                    placeholder="Contoh: Ayam Besar"
                    maxLength={100}
                    autoFocus
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />

                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Nama yang akan ditampilkan pada seluruh
                    sistem inventory.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="deskripsi"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Deskripsi
                    <span className="font-normal text-gray-400">
                      {" "}
                      (opsional)
                    </span>
                  </label>

                  <textarea
                    id="deskripsi"
                    rows={4}
                    value={deskripsi}
                    onChange={(e) =>
                      setDeskripsi(e.target.value)
                    }
                    placeholder="Jelaskan karakteristik atau keterangan kategori ayam..."
                    maxLength={500}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none resize-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  />

                  <div className="mt-1.5 flex justify-end">
                    <span className="text-[10px] text-gray-400">
                      {deskripsi.length}/500
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="h-11 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingId
                        ? "Simpan Perubahan"
                        : "Simpan Data"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {value.toLocaleString("id-ID")}
            </span>

            <span className="text-xs text-gray-400">
              kategori
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}

function CategoryCard({
  item,
  index,
  onEdit,
  onDelete,
}: {
  item: KategoriAyam;
  index: number;
  onEdit: (item: KategoriAyam) => void;
  onDelete: (item: KategoriAyam) => void;
}) {
  const initial =
    item.namaKategori.trim().charAt(0).toUpperCase() ||
    "A";

  return (
    <article className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Bird size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Kategori {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="mt-0.5 text-base font-bold text-gray-900 truncate">
                {item.namaKategori || "Tanpa Nama"}
              </h3>
            </div>
          </div>

          <div className="w-8 h-8 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
            {initial}
          </div>
        </div>

        <div className="mt-5 min-h-[72px] rounded-xl bg-gray-50 border border-gray-100 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 mb-1">
            Deskripsi
          </p>

          <p className="text-sm leading-5 text-gray-600 line-clamp-3">
            {item.deskripsi?.trim() ||
              "Belum ada deskripsi untuk kategori ini."}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition inline-flex items-center justify-center gap-2"
          >
            <Edit3 size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            className="h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition inline-flex items-center justify-center gap-2"
          >
            <Trash2 size={15} />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}