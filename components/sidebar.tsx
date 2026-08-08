"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bird,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Tags,
  Users,
  X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";

import { auth } from "@/lib/firebase";

interface MenuItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
  }, []);

  const menus = useMemo<MenuItem[]>(() => {
    const baseMenus: MenuItem[] = [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
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
        name: "Master Ayam",
        icon: Tags,
        href: "/masterayam",
      },
    ];

    if (role.toLowerCase() === "owner") {
      baseMenus.push({
        name: "Management User",
        icon: Users,
        href: "/users",
      });
    }

    return baseMenus;
  }, [role]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const handleNavigation = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Gagal logout Firebase:", error);
    } finally {
      localStorage.clear();
      router.push("/");
    }
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          open ? "Tutup navigasi" : "Buka navigasi"
        }
        aria-expanded={open}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>

      {/* MOBILE OVERLAY */}
      {open && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-gray-950/35 backdrop-blur-[1px]"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-[260px] shrink-0
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300 ease-out
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* BRAND */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-600/20">
              <Bird size={20} className="text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-gray-900 truncate">
                Simbolon Inventory
              </h1>

              <p className="text-[11px] text-gray-400 mt-0.5">
                Inventory Management System
              </p>
            </div>
          </div>
        </div>

        {/* USER / ROLE */}
        <div className="px-4 py-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Users size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                  Role
                </p>

                <p className="text-sm font-bold text-gray-800 capitalize truncate mt-0.5">
                  {role || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
            Menu Utama
          </p>

          <ul className="space-y-1">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const active = isActive(menu.href);

              return (
                <li key={menu.name}>
                  <Link
                    href={menu.href}
                    onClick={handleNavigation}
                    className={`
                      group relative flex items-center gap-3
                      min-h-10 px-3.5 py-2.5
                      rounded-xl text-sm font-semibold
                      transition-all duration-200
                      ${
                        active
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/90" />
                    )}

                    <Icon
                      size={18}
                      strokeWidth={active ? 2.3 : 2}
                      className={
                        active
                          ? "text-white"
                          : "text-gray-400 group-hover:text-emerald-600"
                      }
                    />

                    <span className="truncate">
                      {menu.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 min-h-10 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>

          <p className="px-3.5 mt-3 text-[10px] text-gray-400">
            Simbolon Inventory System
          </p>
        </div>
      </aside>
    </>
  );
}