"use client";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  X,
  Save,
} from "lucide-react";

interface UserData {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: string;
}

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  editingUser: UserData | null;
}

export default function UserModal({
  open,
  onClose,
  editingUser,
}: UserModalProps) {
  const [nama, setNama] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (editingUser) {
      setNama(
        editingUser.nama
      );

      setEmail(
        editingUser.email
      );

      setPassword(
        editingUser.password
      );
    } else {
      setNama("");
      setEmail("");
      setPassword("");
    }
  }, [editingUser]);

  if (!open) return null;

  const handleSubmit =
    async () => {

      if (
        !nama ||
        !email ||
        !password
      ) {
        alert(
          "Lengkapi seluruh data"
        );
        return;
      }

      try {

        setLoading(true);

        if (editingUser) {

          await updateDoc(
            doc(
              db,
              "users",
              editingUser.id
            ),
            {
              nama,
              email,
              password,
            }
          );

          alert(
            "Data admin berhasil diperbarui"
          );

        } else {

          await addDoc(
            collection(
              db,
              "users"
            ),
            {
              nama,
              email,
              password,
              role: "admin",
              createdAt:
                serverTimestamp(),
            }
          );

          alert(
            "Admin berhasil ditambahkan"
          );

        }

        onClose();

      } catch (error) {

        console.error(error);

        alert(
          "Terjadi kesalahan"
        );

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-[32px] w-full max-w-lg p-8">

        {/* Header */}

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-2xl font-bold text-black">

            {editingUser
              ? "Edit Admin"
              : "Tambah Admin"}

          </h2>

          <button
            onClick={onClose}
            className="
            w-10
            h-10
            rounded-xl
            hover:bg-gray-100
            flex
            items-center
            justify-center
          "
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}

        <div className="space-y-5">

          {/* Nama */}

          <div>

            <label className="text-sm font-medium text-black">
              Nama Lengkap
            </label>

            <input
              type="text"
              value={nama}
              onChange={(e) =>
                setNama(
                  e.target.value
                )
              }
              placeholder="Masukkan nama admin"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-2xl
                px-4
                py-3
                text-black
                outline-none
                focus:border-green-500
              "
            />

          </div>

          {/* Email */}

          <div>

            <label className="text-sm font-medium text-black">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Masukkan email"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-2xl
                px-4
                py-3
                text-black
                outline-none
                focus:border-green-500
              "
            />

          </div>

          {/* Password */}

          <div>

            <label className="text-sm font-medium text-black">
              Password
            </label>

            <input
              type="text"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Masukkan password"
              className="
                mt-2
                w-full
                border
                border-gray-200
                rounded-2xl
                px-4
                py-3
                text-black
                outline-none
                focus:border-green-500
              "
            />

          </div>

          {/* Button */}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              py-4
              rounded-2xl
              flex
              items-center
              justify-center
              gap-2
              font-semibold
            "
          >
            <Save size={18} />

            {loading
              ? "Menyimpan..."
              : editingUser
              ? "Update Admin"
              : "Simpan Admin"}

          </button>

        </div>

      </div>

    </div>
  );
}