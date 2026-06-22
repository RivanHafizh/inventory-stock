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

interface AyamKeluar {
  id: string;
  namaKlien: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

export default function AyamKeluarPage() {
  const [namaKlien, setNamaKlien] = useState("");

  const [ayamBesar, setAyamBesar] = useState("");
  const [ayamSedang, setAyamSedang] = useState("");
  const [ayamKecil, setAyamKecil] = useState("");

  const [stokBesar, setStokBesar] = useState(0);
  const [stokSedang, setStokSedang] = useState(0);
  const [stokKecil, setStokKecil] = useState(0);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [showDetail, setShowDetail] =
    useState(false);

  const [selectedData, setSelectedData] =
    useState<AyamKeluar | null>(null);

  const [data, setData] = useState<
    AyamKeluar[]
  >([]);

  const clearForm = () => {
    setNamaKlien("");
    setAyamBesar("");
    setAyamSedang("");
    setAyamKecil("");
    setEditingId(null);
  };

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

        snapshot.forEach((doc) => {
          const data = doc.data();

          masukBesar +=
            data.ayamBesar || 0;

          masukSedang +=
            data.ayamSedang || 0;

          masukKecil +=
            data.ayamKecil || 0;
        });

        setStokBesar(
          masukBesar - keluarBesar
        );

        setStokSedang(
          masukSedang - keluarSedang
        );

        setStokKecil(
          masukKecil - keluarKecil
        );
      }
    );

    const unsubKeluar = onSnapshot(
      collection(db, "ayamKeluar"),
      (snapshot) => {
        keluarBesar = 0;
        keluarSedang = 0;
        keluarKecil = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();

          keluarBesar +=
            data.ayamBesar || 0;

          keluarSedang +=
            data.ayamSedang || 0;

          keluarKecil +=
            data.ayamKecil || 0;
        });

        setStokBesar(
          masukBesar - keluarBesar
        );

        setStokSedang(
          masukSedang - keluarSedang
        );

        setStokKecil(
          masukKecil - keluarKecil
        );
      }
    );

    return () => {
      unsubMasuk();
      unsubKeluar();
    };
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "ayamKeluar"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        const result =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          ) as AyamKeluar[];

        setData(result);
      });

    return () => unsubscribe();
  }, []);

const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  const besar =
    Number(ayamBesar) || 0;

  const sedang =
    Number(ayamSedang) || 0;

  const kecil =
    Number(ayamKecil) || 0;

  let availableBesar =
    stokBesar;

  let availableSedang =
    stokSedang;

  let availableKecil =
    stokKecil;

  // Jika edit, kembalikan dulu stok lama
  if (editingId) {

    const oldData =
      data.find(
        (item) =>
          item.id ===
          editingId
      );

    if (oldData) {

      availableBesar +=
        oldData.ayamBesar;

      availableSedang +=
        oldData.ayamSedang;

      availableKecil +=
        oldData.ayamKecil;
    }
  }

  // Validasi stok
  if (
    besar >
      availableBesar ||
    sedang >
      availableSedang ||
    kecil >
      availableKecil
  ) {
    alert(
      "Jumlah ayam keluar melebihi stok tersedia"
    );

    return;
  }

  const payload = {
    namaKlien,
    ayamBesar: besar,
    ayamSedang: sedang,
    ayamKecil: kecil,
    total:
      besar +
      sedang +
      kecil,
  };

  try {

    setLoading(true);

    if (editingId) {

      await updateDoc(
        doc(
          db,
          "ayamKeluar",
          editingId
        ),
        payload
      );

    } else {

      await addDoc(
        collection(
          db,
          "ayamKeluar"
        ),
        {
          ...payload,
          createdAt:
            serverTimestamp(),
        }
      );

    }

    clearForm();

    setShowSuccess(
      true
    );

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }
};

  const handleEdit = (
    item: AyamKeluar
  ) => {
    setEditingId(item.id);

    setNamaKlien(item.namaKlien);

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
        "Hapus data ini?"
      );

    if (!confirmDelete) return;

    await deleteDoc(
      doc(
        db,
        "ayamKeluar",
        id
      )
    );
  };

  const handleDetail = (
    item: AyamKeluar
  ) => {
    setSelectedData(item);
    setShowDetail(true);
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#F8FAFC]">

        <Sidebar />

        <main className="flex-1 p-8">

          <Header />

          <div className="mt-8">
            <h1 className="text-3xl font-bold">
              Ayam Keluar
            </h1>

            <p className="text-gray-500">
              Kelola data ayam keluar
            </p>
          </div>

          {/* CARD STOK */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">

  <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-100">

    <p className="text-gray-500">
      Stok Ayam Besar
    </p>

    <h2 className="text-5xl font-bold text-green-600 mt-3">
      {stokBesar}
    </h2>

  </div>

  <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100">

    <p className="text-gray-500">
      Stok Ayam Sedang
    </p>

    <h2 className="text-5xl font-bold text-yellow-500 mt-3">
      {stokSedang}
    </h2>

  </div>

  <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">

    <p className="text-gray-500">
      Stok Ayam Kecil
    </p>

    <h2 className="text-5xl font-bold text-blue-600 mt-3">
      {stokKecil}
    </h2>

  </div>

</div>

          {/* FORM */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border mt-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <input
                value={namaKlien}
                onChange={(e) =>
                  setNamaKlien(
                    e.target.value
                  )
                }
                placeholder="Nama Klien"
                className="w-full border rounded-2xl p-3"
                required
              />

              <div className="grid md:grid-cols-3 gap-4">

                <input
                  type="number"
                  value={ayamBesar}
                  onChange={(e) =>
                    setAyamBesar(
                      e.target.value
                    )
                  }
                  placeholder="Ayam Besar"
                  className="border rounded-2xl p-3"
                />

                <input
                  type="number"
                  value={ayamSedang}
                  onChange={(e) =>
                    setAyamSedang(
                      e.target.value
                    )
                  }
                  placeholder="Ayam Sedang"
                  className="border rounded-2xl p-3"
                />

                <input
                  type="number"
                  value={ayamKecil}
                  onChange={(e) =>
                    setAyamKecil(
                      e.target.value
                    )
                  }
                  placeholder="Ayam Kecil"
                  className="border rounded-2xl p-3"
                />

              </div>

              <div className="flex gap-3">

                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-3 rounded-2xl"
                >
                  {editingId
                    ? "Update Data"
                    : "Simpan Data"}
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-200 px-8 py-3 rounded-2xl"
                >
                  Clear
                </button>

              </div>

            </form>

          </div>

          {/* TABLE */}
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">

  <div className="flex items-center justify-between mb-6">

    <div>

      <h2 className="text-2xl font-bold text-black">
        Riwayat Ayam Keluar
      </h2>

      <p className="text-gray-500 text-sm">
        Total Data: {data.length}
      </p>

    </div>

  </div>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>

        <tr className="border-b bg-gray-50">

          <th className="py-4 px-3 text-left text-black">
            No
          </th>

          <th className="py-4 px-3 text-left text-black">
            Nama Klien
          </th>

          <th className="py-4 px-3 text-center text-black">
            Besar
          </th>

          <th className="py-4 px-3 text-center text-black">
            Sedang
          </th>

          <th className="py-4 px-3 text-center text-black">
            Kecil
          </th>

          <th className="py-4 px-3 text-center text-black">
            Total
          </th>

          <th className="py-4 px-3 text-center text-black">
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
              className="
                border-b
                hover:bg-green-50
                transition
              "
            >

              <td className="py-4 px-3 text-black">
                {index + 1}
              </td>

              <td className="py-4 px-3 font-medium text-black">
                {item.namaKlien}
              </td>

              <td className="text-center text-black">
                {item.ayamBesar}
              </td>

              <td className="text-center text-black">
                {item.ayamSedang}
              </td>

              <td className="text-center text-black">
                {item.ayamKecil}
              </td>

              <td className="text-center">

                <span
                  className="
                    bg-green-100
                    text-green-700
                    px-3
                    py-1
                    rounded-full
                    font-medium
                  "
                >
                  {item.total}
                </span>

              </td>

              <td>

                <div className="flex justify-center gap-2">

                  <button
                    onClick={() =>
                      handleDetail(item)
                    }
                    className="
                      bg-green-500
                      hover:bg-green-600
                      text-white
                      px-3
                      py-2
                      rounded-xl
                    "
                  >
                    Detail
                  </button>

                  <button
                    onClick={() =>
                      handleEdit(item)
                    }
                    className="
                      bg-blue-500
                      hover:bg-blue-600
                      text-white
                      px-3
                      py-2
                      rounded-xl
                    "
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(item.id)
                    }
                    className="
                      bg-red-500
                      hover:bg-red-600
                      text-white
                      px-3
                      py-2
                      rounded-xl
                    "
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

      {/* Modal Detail */}
      {showDetail &&
        selectedData && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-8 rounded-3xl w-[450px]">

              <h2 className="text-2xl font-bold mb-6">
                Detail Ayam Keluar
              </h2>

              <div className="space-y-3">

                <p>
                  Klien:
                  {" "}
                  {
                    selectedData.namaKlien
                  }
                </p>

                <p>
                  Besar:
                  {" "}
                  {
                    selectedData.ayamBesar
                  }
                </p>

                <p>
                  Sedang:
                  {" "}
                  {
                    selectedData.ayamSedang
                  }
                </p>

                <p>
                  Kecil:
                  {" "}
                  {
                    selectedData.ayamKecil
                  }
                </p>

                <p>
                  Total:
                  {" "}
                  {
                    selectedData.total
                  }
                </p>

              </div>

              <button
                onClick={() =>
                  setShowDetail(false)
                }
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-2xl"
              >
                Tutup
              </button>

            </div>

          </div>
        )}

      {/* Modal Success */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-[400px] text-center">
            <h2 className="text-2xl font-bold">
              Berhasil
            </h2>

            <p className="mt-2 text-gray-500">
              Data berhasil disimpan
            </p>

            <button
              onClick={() =>
                setShowSuccess(false)
              }
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-2xl"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}