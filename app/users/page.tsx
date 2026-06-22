"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import UserStats from "@/components/users/UserStats";
import UserCard from "@/components/users/UserCard";
import UserModal from "@/components/users/UserModal";
import UserDetailModal from "@/components/users/UserDetailModal";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  Search,
  Plus,
} from "lucide-react";

export interface UserData {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] =
    useState<UserData[]>([]);

  const [search, setSearch] =
    useState("");

  const [openModal, setOpenModal] =
    useState(false);

  const [openDetail, setOpenDetail] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<UserData | null>(
      null
    );

  const [editingUser, setEditingUser] =
    useState<UserData | null>(
      null
    );

  useEffect(() => {
    const unsub =
      onSnapshot(
        collection(
          db,
          "users"
        ),
        (snapshot) => {
          const result =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            ) as UserData[];

          setUsers(result);
        }
      );

    return () => unsub();
  }, []);

  const filteredUsers =
    users.filter(
      (user) =>
        user.nama
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        user.email
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const handleDelete =
    async (id: string) => {
      const confirmDelete =
        confirm(
          "Hapus user ini?"
        );

      if (!confirmDelete)
        return;

      await deleteDoc(
        doc(
          db,
          "users",
          id
        )
      );
    };

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <div className="p-6">

          <Header />

          <main className="mt-6">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

              <div>

                <h1 className="text-3xl font-bold text-black">
                  Management User
                </h1>

                <p className="text-gray-500 mt-1">
                  Kelola akun admin
                  sistem inventory
                </p>

              </div>

              <button
                onClick={() => {
                  setEditingUser(
                    null
                  );

                  setOpenModal(
                    true
                  );
                }}
                className="
                  bg-green-600
                  hover:bg-green-700
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
                Tambah Admin
              </button>

            </div>

            <UserStats
              totalAdmin={
                users.length
              }
            />

            <div className="bg-white rounded-3xl p-5 shadow-sm mt-8 mb-8">

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
                  placeholder="Cari admin..."
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
                    focus:border-green-500
                  "
                />

              </div>

            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

              {filteredUsers.map(
                (user) => (
                  <UserCard
                    key={
                      user.id
                    }
                    user={user}
                    onDetail={() => {
                      setSelectedUser(
                        user
                      );

                      setOpenDetail(
                        true
                      );
                    }}
                    onEdit={() => {
                      setEditingUser(
                        user
                      );

                      setOpenModal(
                        true
                      );
                    }}
                    onDelete={() =>
                      handleDelete(
                        user.id
                      )
                    }
                  />
                )
              )}

            </div>

          </main>

        </div>

      </div>

      <UserModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        editingUser={
          editingUser
        }
      />

      <UserDetailModal
        open={openDetail}
        onClose={() =>
          setOpenDetail(false)
        }
        user={selectedUser}
      />

    </div>
  );
}