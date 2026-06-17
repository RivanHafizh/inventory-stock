"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Tags,
  Users,
  LogOut,
} from "lucide-react";

const menus = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Ayam Masuk",
    icon: ArrowDownCircle,
    href: "/ayam-masuk",
  },
  {
    name: "Ayam Keluar",
    icon: ArrowUpCircle,
    href: "/ayam-keluar",
  },
  {
    name: "Laporan",
    icon: FileText,
    href: "/laporan",
  },
  {
    name: "Kategori Ayam",
    icon: Tags,
    href: "/kategori",
  },
  {
    name: "Management User",
    icon: Users,
    href: "/users",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-green-700">
          Poultry<span className="text-gray-700">Stock</span>
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4">
        <ul className="space-y-3">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <li key={menu.name}>
                <Link
                  href={menu.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-green-600 hover:text-white transition-all"
                >
                  <Icon size={20} />
                  <span>{menu.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-500 hover:bg-red-50 transition">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}