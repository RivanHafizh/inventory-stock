"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import UserModal from "@/components/users/UserModal";
import UserDetailModal from "@/components/users/UserDetailModal";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface UserData {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [selectedUser, setSelectedUser] =
    useState<UserData | null>(null);

  const [editingUser, setEditingUser] =
    useState<UserData | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const result = snapshot.docs
          .map((item) => {
            const data = item.data();

            return {
              id: item.id,
              nama: String(data.nama ?? ""),
              email: String(data.email ?? ""),
              password: String(data.password ?? ""),
              role: String(data.role ?? "admin"),
            };
          })
          .sort((a, b) =>
            a.nama.localeCompare(b.nama, "id-ID")
          );

        setUsers(result);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error("Gagal mengambil users:", error);
        setLoading(false);
        setErrorMessage(
          "Data admin gagal dimuat. Periksa koneksi Firebase."
        );
      }
    );

    return () => unsub();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      return (
        user.nama.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const adminCount = users.filter(
    (user) => user.role.toLowerCase() === "admin"
  ).length;

  const activeResultCount = filteredUsers.length;

  const handleDelete = async (id: string) => {
    const user = users.find((item) => item.id === id);

    const confirmDelete = window.confirm(
      `Hapus akun "${user?.nama || "admin"}"?\n\nData akun yang dihapus tidak dapat dikembalikan.`
    );

    if (!confirmDelete) return;

    try {
      setErrorMessage("");

      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      console.error("Gagal menghapus user:", error);

      setErrorMessage(
        "Akun gagal dihapus. Silakan coba lagi."
      );
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const openDetailModal = (user: UserData) => {
    setSelectedUser(user);
    setOpenDetail(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* HEADER */}
          <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <span>Management</span>
                <ChevronRight size={13} />
                <span className="text-emerald-600">
                  User
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <UserCog
                    size={21}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                    Management User
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Kelola akun admin dan akses pengguna
                    sistem inventory.
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
              Tambah Admin
            </button>
          </section>

          {/* SUMMARY */}
          <section className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Pengguna"
              value={users.length}
              suffix="akun"
              description="Seluruh pengguna terdaftar"
              icon={<Users size={19} />}
              iconClass="bg-emerald-50 text-emerald-600"
              valueClass="text-emerald-700"
            />

            <SummaryCard
              title="Total Admin"
              value={adminCount}
              suffix="akun"
              description="Pengguna dengan role admin"
              icon={<ShieldCheck size={19} />}
              iconClass="bg-sky-50 text-sky-600"
              valueClass="text-sky-700"
            />

            <SummaryCard
              title="Hasil Pencarian"
              value={activeResultCount}
              suffix="akun"
              description={
                search.trim()
                  ? `Cocok dengan "${search.trim()}"`
                  : "Semua pengguna ditampilkan"
              }
              icon={<Search size={19} />}
              iconClass="bg-violet-50 text-violet-600"
              valueClass="text-violet-700"
            />
          </section>

          {/* CONTENT */}
          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Daftar Pengguna
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Kelola informasi akun, lihat detail, edit,
                    atau hapus pengguna.
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
                    placeholder="Cari nama, email, atau role..."
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                      aria-label="Hapus pencarian"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {filteredUsers.length} pengguna
                </span>

                {search.trim() && (
                  <span className="text-xs text-gray-400">
                    Pencarian aktif
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {loading ? (
                <LoadingState />
              ) : filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredUsers.map((user, index) => (
                    <UserProfessionalCard
                      key={user.id}
                      user={user}
                      index={index}
                      onDetail={() =>
                        openDetailModal(user)
                      }
                      onEdit={() =>
                        openEditModal(user)
                      }
                      onDelete={() =>
                        handleDelete(user.id)
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  search={Boolean(search.trim())}
                  onReset={() => setSearch("")}
                  onAdd={openCreateModal}
                />
              )}
            </div>
          </section>
        </main>
      </div>

      <UserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        editingUser={editingUser}
      />

      <UserDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        user={selectedUser}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  suffix,
  description,
  icon,
  iconClass,
  valueClass,
}: {
  title: string;
  value: number;
  suffix: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span
              className={`text-2xl font-bold tracking-tight ${valueClass}`}
            >
              {value.toLocaleString("id-ID")}
            </span>

            <span className="text-[11px] font-medium text-gray-400">
              {suffix}
            </span>
          </div>

          <p className="text-[11px] text-gray-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full w-2/3 rounded-full ${valueClass.replace(
            "text-",
            "bg-"
          )}`}
        />
      </div>
    </div>
  );
}

function UserProfessionalCard({
  user,
  index,
  onDetail,
  onEdit,
  onDelete,
}: {
  user: UserData;
  index: number;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initial =
    user.nama.trim().charAt(0).toUpperCase() || "U";

  const role = user.role?.trim() || "admin";

  return (
    <article className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Pengguna {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="mt-0.5 text-base font-bold text-gray-900 truncate">
                {user.nama || "Tanpa Nama"}
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wide font-bold shrink-0">
            <CheckCircle2 size={12} />
            Aktif
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <InfoRow
            icon={<Users size={14} />}
            label="Nama"
            value={user.nama || "-"}
          />

          <InfoRow
            icon={<KeyRound size={14} />}
            label="Email"
            value={user.email || "-"}
          />

          <InfoRow
            icon={<ShieldCheck size={14} />}
            label="Role"
            value={role}
            valueClass="text-emerald-700 capitalize"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onDetail}
            className="h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition inline-flex items-center justify-center gap-1.5"
          >
            <Eye size={14} />
            Detail
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition inline-flex items-center justify-center gap-1.5"
          >
            <Pencil size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition inline-flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClass = "text-gray-700",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
          {label}
        </p>

        <p
          className={`text-xs font-semibold truncate mt-0.5 ${valueClass}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100" />

            <div className="flex-1">
              <div className="w-20 h-2 rounded bg-gray-100" />
              <div className="w-32 h-4 rounded bg-gray-100 mt-2" />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4 space-y-4">
            <div className="w-full h-3 rounded bg-gray-100" />
            <div className="w-4/5 h-3 rounded bg-gray-100" />
            <div className="w-3/5 h-3 rounded bg-gray-100" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="h-10 rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  search,
  onReset,
  onAdd,
}: {
  search: boolean;
  onReset: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        {search ? (
          <Search size={23} className="text-gray-400" />
        ) : (
          <Users size={23} className="text-gray-400" />
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-gray-800">
        {search
          ? "Pengguna tidak ditemukan"
          : "Belum ada pengguna"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
        {search
          ? "Coba gunakan kata kunci nama, email, atau role yang berbeda."
          : "Tambahkan akun admin pertama untuk mulai mengelola pengguna."}
      </p>

      {search ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
        >
          <X size={14} />
          Reset Pencarian
        </button>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
        >
          <Plus size={14} />
          Tambah Admin
        </button>
      )}
    </div>
  );
}