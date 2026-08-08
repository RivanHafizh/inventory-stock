"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

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
  tanggal?: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AyamMasukPage() {
  const [tanggal, setTanggal] = useState(getToday);
  const [ayamBesar, setAyamBesar] = useState("");
  const [ayamSedang, setAyamSedang] = useState("");
  const [ayamKecil, setAyamKecil] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [data, setData] = useState<AyamMasuk[]>([]);
  const [search, setSearch] = useState("");

  const clearForm = () => {
    setTanggal(getToday());
    setAyamBesar("");
    setAyamSedang("");
    setAyamKecil("");
    setEditingId(null);
  };

  useEffect(() => {
    const q = query(
      collection(db, "ayamMasuk"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as AyamMasuk[];

      setData(result);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const besar = Math.max(0, Number(ayamBesar) || 0);
    const sedang = Math.max(0, Number(ayamSedang) || 0);
    const kecil = Math.max(0, Number(ayamKecil) || 0);

    if (!tanggal) {
      alert("Tanggal masuk wajib diisi.");
      return;
    }

    if (besar + sedang + kecil <= 0) {
      alert("Masukkan minimal satu jumlah ayam.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        tanggal,
        ayamBesar: besar,
        ayamSedang: sedang,
        ayamKecil: kecil,
        total: besar + sedang + kecil,
      };

      if (editingId) {
        await updateDoc(
          doc(db, "ayamMasuk", editingId),
          payload
        );
      } else {
        await addDoc(collection(db, "ayamMasuk"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      clearForm();
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Data gagal disimpan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: AyamMasuk) => {
    setEditingId(item.id);
    setTanggal(item.tanggal || getToday());
    setAyamBesar(String(item.ayamBesar));
    setAyamSedang(String(item.ayamSedang));
    setAyamKecil(String(item.ayamKecil));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus data ayam masuk ini?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "ayamMasuk", id));
    } catch (error) {
      console.error(error);
      alert("Data gagal dihapus.");
    }
  };

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((item) => {
      const dateText = formatDate(item.tanggal).toLowerCase();

      return (
        dateText.includes(keyword) ||
        item.tanggal?.toLowerCase().includes(keyword) ||
        String(item.ayamBesar).includes(keyword) ||
        String(item.ayamSedang).includes(keyword) ||
        String(item.ayamKecil).includes(keyword) ||
        String(item.total).includes(keyword)
      );
    });
  }, [data, search]);

  const totalAyamMasuk = data.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const totalBesar = data.reduce(
    (sum, item) => sum + item.ayamBesar,
    0
  );

  const totalSedang = data.reduce(
    (sum, item) => sum + item.ayamSedang,
    0
  );

  const totalKecil = data.reduce(
    (sum, item) => sum + item.ayamKecil,
    0
  );

  const totalInput =
    (Number(ayamBesar) || 0) +
    (Number(ayamSedang) || 0) +
    (Number(ayamKecil) || 0);

  const statCards = [
    {
      title: "Ayam Besar",
      value: totalBesar,
      description: "Total ayam masuk",
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-700",
      barClass: "bg-emerald-500",
    },
    {
      title: "Ayam Sedang",
      value: totalSedang,
      description: "Total ayam masuk",
      iconClass: "bg-amber-50 text-amber-600",
      valueClass: "text-amber-700",
      barClass: "bg-amber-500",
    },
    {
      title: "Ayam Kecil",
      value: totalKecil,
      description: "Total ayam masuk",
      iconClass: "bg-sky-50 text-sky-600",
      valueClass: "text-sky-700",
      barClass: "bg-sky-500",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#f5f7f6] flex">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Header />

            {/* PAGE HEADER */}
            <section className="mt-7 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                  <span>Inventory</span>
                  <ChevronRight size={13} />
                  <span className="text-emerald-600">
                    Ayam Masuk
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  Ayam Masuk
                </h1>

                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                  Catat penerimaan ayam ke dalam inventory
                  berdasarkan tanggal dan kategori ukuran.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-600 px-5 py-3.5 shadow-sm shadow-emerald-600/20">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-100">
                  Total Ayam Masuk
                </p>

                <p className="mt-0.5 text-xl font-bold text-white">
                  {totalAyamMasuk.toLocaleString("id-ID")}
                  <span className="ml-1 text-xs font-medium text-emerald-100">
                    ekor
                  </span>
                </p>
              </div>
            </section>

            {/* SUMMARY CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span
                          className={`text-3xl font-bold tracking-tight ${card.valueClass}`}
                        >
                          {card.value.toLocaleString("id-ID")}
                        </span>

                        <span className="text-xs font-medium text-gray-400">
                          ekor
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconClass}`}
                    >
                      <PackagePlus size={20} />
                    </div>
                  </div>

                  <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full w-2/3 rounded-full ${card.barClass}`}
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* FORM */}
            <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ArrowDownToLine
                      size={19}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {editingId
                        ? "Edit Data Ayam"
                        : "Tambah Data Ayam"}
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Masukkan tanggal dan jumlah ayam yang diterima.
                    </p>
                  </div>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <X size={14} />
                    Batal Edit
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* DATE */}
                  <div>
                    <label
                      htmlFor="tanggal"
                      className="block text-xs font-semibold text-gray-700 mb-2"
                    >
                      Tanggal Masuk
                    </label>

                    <input
                      id="tanggal"
                      type="date"
                      value={tanggal}
                      onChange={(e) =>
                        setTanggal(e.target.value)
                      }
                      required
                      className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    />

                    <p className="text-[10px] text-gray-400 mt-2">
                      Tanggal transaksi ayam diterima.
                    </p>
                  </div>

                  <NumberField
                    id="ayamBesar"
                    label="Ayam Besar"
                    value={ayamBesar}
                    onChange={setAyamBesar}
                  />

                  <NumberField
                    id="ayamSedang"
                    label="Ayam Sedang"
                    value={ayamSedang}
                    onChange={setAyamSedang}
                  />

                  <NumberField
                    id="ayamKecil"
                    label="Ayam Kecil"
                    value={ayamKecil}
                    onChange={setAyamKecil}
                  />
                </div>

                {/* FORM FOOTER */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                      Total Input
                    </p>

                    <p className="text-lg font-bold text-emerald-800 mt-0.5">
                      {totalInput.toLocaleString("id-ID")}{" "}
                      <span className="text-xs font-medium text-emerald-600">
                        ekor
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={clearForm}
                      className="h-11 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition"
                    >
                      Reset
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Menyimpan...
                        </>
                      ) : editingId ? (
                        <>
                          <Edit3 size={16} />
                          Update Data
                        </>
                      ) : (
                        <>
                          <Plus size={17} />
                          Simpan Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* TABLE */}
            <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ClipboardList
                        size={18}
                        className="text-emerald-600"
                      />

                      <h2 className="text-base font-bold text-gray-900">
                        Riwayat Ayam Masuk
                      </h2>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Menampilkan {filteredData.length} dari{" "}
                      {data.length} data transaksi.
                    </p>
                  </div>

                  <div className="relative w-full lg:w-80">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari tanggal atau jumlah..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        No
                      </th>

                      <th className="px-4 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Tanggal
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Besar
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Sedang
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Kecil
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Total
                      </th>

                      <th className="px-5 py-3.5 text-right text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <ClipboardList
                                  size={15}
                                  className="text-emerald-600"
                                />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {formatDate(item.tanggal)}
                                </p>

                                <p className="text-[11px] text-gray-400">
                                  Tanggal penerimaan
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-medium text-gray-700">
                              {item.ayamBesar}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-medium text-gray-700">
                              {item.ayamSedang}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-medium text-gray-700">
                              {item.ayamKecil}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                              {item.total} ekor
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                title="Edit"
                                onClick={() =>
                                  handleEdit(item)
                                }
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                              >
                                <Edit3 size={15} />
                              </ActionButton>

                              <ActionButton
                                title="Hapus"
                                onClick={() =>
                                  handleDelete(item.id)
                                }
                                className="bg-red-50 hover:bg-red-100 text-red-600"
                              >
                                <Trash2 size={15} />
                              </ActionButton>
                            </div>
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
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                              <ClipboardList
                                size={21}
                                className="text-gray-400"
                              />
                            </div>

                            <p className="text-sm font-semibold text-gray-700">
                              Tidak ada data ditemukan
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              Belum ada data ayam masuk yang sesuai.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2
                size={28}
                className="text-emerald-600"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-4">
              Berhasil Disimpan
            </h2>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Data ayam masuk berhasil disimpan ke inventory.
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full mt-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          required
          className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 pr-14 text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">
          ekor
        </span>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  className,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${className}`}
    >
      {children}
    </button>
  );
}