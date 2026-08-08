"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
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

interface AyamKeluar {
  id: string;
  tanggal?: string;
  namaKlien: string;
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

export default function AyamKeluarPage() {
  const [tanggal, setTanggal] = useState(getToday);
  const [namaKlien, setNamaKlien] = useState("");
  const [ayamBesar, setAyamBesar] = useState("");
  const [ayamSedang, setAyamSedang] = useState("");
  const [ayamKecil, setAyamKecil] = useState("");

  const [stokBesar, setStokBesar] = useState(0);
  const [stokSedang, setStokSedang] = useState(0);
  const [stokKecil, setStokKecil] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedData, setSelectedData] =
    useState<AyamKeluar | null>(null);
  const [data, setData] = useState<AyamKeluar[]>([]);
  const [search, setSearch] = useState("");

  const clearForm = () => {
    setTanggal(getToday());
    setNamaKlien("");
    setAyamBesar("");
    setAyamSedang("");
    setAyamKecil("");
    setEditingId(null);
  };

  /*
   * HITUNG STOK TERSEDIA
   *
   * Stok = total ayam masuk - total ayam keluar.
   */
  useEffect(() => {
    let masukBesar = 0;
    let masukSedang = 0;
    let masukKecil = 0;

    let keluarBesar = 0;
    let keluarSedang = 0;
    let keluarKecil = 0;

    const unsubMasuk = onSnapshot(
      collection(db, "ayamMasuk"),
      (snapshot) => {
        masukBesar = 0;
        masukSedang = 0;
        masukKecil = 0;

        snapshot.forEach((item) => {
          const itemData = item.data();

          masukBesar += Number(itemData.ayamBesar) || 0;
          masukSedang += Number(itemData.ayamSedang) || 0;
          masukKecil += Number(itemData.ayamKecil) || 0;
        });

        setStokBesar(
          Math.max(0, masukBesar - keluarBesar)
        );
        setStokSedang(
          Math.max(0, masukSedang - keluarSedang)
        );
        setStokKecil(
          Math.max(0, masukKecil - keluarKecil)
        );
      }
    );

    const unsubKeluar = onSnapshot(
      collection(db, "ayamKeluar"),
      (snapshot) => {
        keluarBesar = 0;
        keluarSedang = 0;
        keluarKecil = 0;

        snapshot.forEach((item) => {
          const itemData = item.data();

          keluarBesar += Number(itemData.ayamBesar) || 0;
          keluarSedang += Number(itemData.ayamSedang) || 0;
          keluarKecil += Number(itemData.ayamKecil) || 0;
        });

        setStokBesar(
          Math.max(0, masukBesar - keluarBesar)
        );
        setStokSedang(
          Math.max(0, masukSedang - keluarSedang)
        );
        setStokKecil(
          Math.max(0, masukKecil - keluarKecil)
        );
      }
    );

    return () => {
      unsubMasuk();
      unsubKeluar();
    };
  }, []);

  /*
   * AMBIL RIWAYAT AYAM KELUAR
   */
  useEffect(() => {
    const q = query(
      collection(db, "ayamKeluar"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as AyamKeluar[];

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
      alert("Tanggal keluar wajib diisi.");
      return;
    }

    if (!namaKlien.trim()) {
      alert("Nama klien wajib diisi.");
      return;
    }

    if (besar + sedang + kecil <= 0) {
      alert("Masukkan minimal satu jumlah ayam.");
      return;
    }

    let availableBesar = stokBesar;
    let availableSedang = stokSedang;
    let availableKecil = stokKecil;

    /*
     * Saat edit, kembalikan stok transaksi lama
     * terlebih dahulu agar validasi tetap akurat.
     */
    if (editingId) {
      const oldData = data.find(
        (item) => item.id === editingId
      );

      if (oldData) {
        availableBesar += oldData.ayamBesar;
        availableSedang += oldData.ayamSedang;
        availableKecil += oldData.ayamKecil;
      }
    }

    if (
      besar > availableBesar ||
      sedang > availableSedang ||
      kecil > availableKecil
    ) {
      alert(
        "Jumlah ayam keluar melebihi stok tersedia."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        tanggal,
        namaKlien: namaKlien.trim(),
        ayamBesar: besar,
        ayamSedang: sedang,
        ayamKecil: kecil,
        total: besar + sedang + kecil,
      };

      if (editingId) {
        await updateDoc(
          doc(db, "ayamKeluar", editingId),
          payload
        );
      } else {
        await addDoc(collection(db, "ayamKeluar"), {
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

  const handleEdit = (item: AyamKeluar) => {
    setEditingId(item.id);
    setTanggal(item.tanggal || getToday());
    setNamaKlien(item.namaKlien);
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
      "Apakah Anda yakin ingin menghapus data ayam keluar ini?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "ayamKeluar", id));
    } catch (error) {
      console.error(error);
      alert("Data gagal dihapus.");
    }
  };

  const handleDetail = (item: AyamKeluar) => {
    setSelectedData(item);
    setShowDetail(true);
  };

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((item) => {
      const dateText = formatDate(item.tanggal).toLowerCase();

      return (
        item.namaKlien.toLowerCase().includes(keyword) ||
        dateText.includes(keyword) ||
        item.tanggal?.toLowerCase().includes(keyword) ||
        String(item.ayamBesar).includes(keyword) ||
        String(item.ayamSedang).includes(keyword) ||
        String(item.ayamKecil).includes(keyword) ||
        String(item.total).includes(keyword)
      );
    });
  }, [data, search]);

  const totalStok =
    stokBesar + stokSedang + stokKecil;

  const totalKeluar = data.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const totalInput =
    (Number(ayamBesar) || 0) +
    (Number(ayamSedang) || 0) +
    (Number(ayamKecil) || 0);

  const statCards = [
    {
      title: "Ayam Besar",
      value: stokBesar,
      description: "Stok tersedia",
      icon: Package,
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-700",
      barClass: "bg-emerald-500",
    },
    {
      title: "Ayam Sedang",
      value: stokSedang,
      description: "Stok tersedia",
      icon: ClipboardList,
      iconClass: "bg-amber-50 text-amber-600",
      valueClass: "text-amber-700",
      barClass: "bg-amber-500",
    },
    {
      title: "Ayam Kecil",
      value: stokKecil,
      description: "Stok tersedia",
      icon: Users,
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
                    Ayam Keluar
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  Ayam Keluar
                </h1>

                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                  Kelola pencatatan distribusi ayam keluar
                  berdasarkan tanggal, klien, dan kategori ukuran.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                    Total Stok
                  </p>

                  <p className="mt-0.5 text-lg font-bold text-gray-900">
                    {totalStok.toLocaleString("id-ID")}
                    <span className="ml-1 text-xs font-medium text-gray-400">
                      ekor
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-600 px-4 py-3 shadow-sm shadow-emerald-600/20">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-100">
                    Total Keluar
                  </p>

                  <p className="mt-0.5 text-lg font-bold text-white">
                    {totalKeluar.toLocaleString("id-ID")}
                    <span className="ml-1 text-xs font-medium text-emerald-100">
                      ekor
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {/* STOCK CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
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
                        <Icon size={20} />
                      </div>
                    </div>

                    <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full w-2/3 rounded-full ${card.barClass}`}
                      />
                    </div>
                  </div>
                );
              })}
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
                        ? "Edit Data Ayam Keluar"
                        : "Catat Ayam Keluar"}
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Masukkan tanggal, klien, dan jumlah ayam yang
                      didistribusikan.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                  {/* DATE */}
                  <div>
                    <label
                      htmlFor="tanggal"
                      className="block text-xs font-semibold text-gray-700 mb-2"
                    >
                      Tanggal Keluar
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
                      Tanggal transaksi distribusi.
                    </p>
                  </div>

                  {/* CLIENT */}
                  <div>
                    <label
                      htmlFor="namaKlien"
                      className="block text-xs font-semibold text-gray-700 mb-2"
                    >
                      Nama Klien
                    </label>

                    <input
                      id="namaKlien"
                      value={namaKlien}
                      onChange={(e) =>
                        setNamaKlien(e.target.value)
                      }
                      placeholder="Nama klien"
                      required
                      className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    />

                    <p className="text-[10px] text-gray-400 mt-2">
                      Tujuan atau penerima ayam.
                    </p>
                  </div>

                  <NumberField
                    id="ayamBesar"
                    label="Ayam Besar"
                    value={ayamBesar}
                    stock={stokBesar}
                    onChange={setAyamBesar}
                  />

                  <NumberField
                    id="ayamSedang"
                    label="Ayam Sedang"
                    value={ayamSedang}
                    stock={stokSedang}
                    onChange={setAyamSedang}
                  />

                  <NumberField
                    id="ayamKecil"
                    label="Ayam Kecil"
                    value={ayamKecil}
                    stock={stokKecil}
                    onChange={setAyamKecil}
                  />
                </div>

                {/* FORM FOOTER */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                      Total Keluar
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
                        Riwayat Ayam Keluar
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
                      placeholder="Cari tanggal, klien, atau jumlah..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        No
                      </th>

                      <th className="px-4 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Tanggal
                      </th>

                      <th className="px-4 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        Nama Klien
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
                                  Tanggal distribusi
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                {item.namaKlien
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {item.namaKlien}
                                </p>

                                <p className="text-[11px] text-gray-400">
                                  Penerima ayam
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
                                title="Detail"
                                onClick={() =>
                                  handleDetail(item)
                                }
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                              >
                                <Eye size={15} />
                              </ActionButton>

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
                          colSpan={8}
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
                              Belum ada transaksi ayam keluar yang sesuai.
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

      {/* DETAIL MODAL */}
      {showDetail && selectedData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Detail Transaksi
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Ayam Keluar
                </h2>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Tanggal
                  </p>

                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formatDate(selectedData.tanggal)}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Klien
                  </p>

                  <p className="text-sm font-bold text-gray-900 mt-1 truncate">
                    {selectedData.namaKlien}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <DetailStat
                  label="Besar"
                  value={selectedData.ayamBesar}
                />

                <DetailStat
                  label="Sedang"
                  value={selectedData.ayamSedang}
                />

                <DetailStat
                  label="Kecil"
                  value={selectedData.ayamKecil}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-emerald-600 px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-100">
                  Total Ayam
                </span>

                <span className="text-2xl font-bold text-white">
                  {selectedData.total}
                </span>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="w-full mt-5 h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
              Data ayam keluar berhasil disimpan dan stok telah diperbarui.
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
  stock,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  stock: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-gray-700"
        >
          {label}
        </label>

        <span className="text-[10px] font-semibold text-gray-400">
          Stok: {stock.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="relative">
        <input
          id={id}
          type="number"
          min="0"
          max={stock}
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

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
        {label}
      </p>

      <p className="text-xl font-bold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
}