"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Tags,
  Users,
  LogOut,
  Menu,
  X,
  Bird,
} from "lucide-react";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";

import {
  useEffect,
  useState,
} from "react";

interface MenuItem {
  name: string;
  icon: any;
  href: string;
}

export default function Sidebar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [role, setRole] =
    useState("");

  useEffect(() => {
    const userRole =
      localStorage.getItem(
        "role"
      ) || "";

    setRole(userRole);
  }, []);

  const menus: MenuItem[] = [
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
      name: "Master Ayam",
      icon: Tags,
      href: "/master",
    },
  ];

  if (role === "owner") {
    menus.push({
      name: "Management User",
      icon: Users,
      href: "/users",
    });
  }

  const handleLogout =
    async () => {
      localStorage.clear();

      try {
        await signOut(auth);
      } catch {}

      router.push("/");
    };

  return (
    <>
      {/* Mobile Button */}

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-xl"
      >
        {open ? (
          <X size={20} />
        ) : (
          <Menu size={20} />
        )}
      </button>

      {/* Overlay */}

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
        fixed lg:static z-40
        h-screen
        w-72
        bg-white
        border-r
        border-gray-100
        flex
        flex-col
        transition-all
        duration-300

        ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Logo */}

        <div className="p-6 border-b">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center">

              <Bird
                size={24}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-xl font-bold text-gray-800">
                Poultry Stock
              </h1>

              <p className="text-xs text-gray-500">
                Inventory System
              </p>

            </div>

          </div>

        </div>

        {/* User Role */}

        <div className="px-5 py-4">

          <div className="bg-green-50 rounded-2xl p-4">

            <h3 className="font-semibold text-gray-800 capitalize">
              {role || "User"}
            </h3>

            <p className="text-sm text-gray-500">
              Sistem Inventory
            </p>

          </div>

        </div>

        {/* Menu */}

        <nav className="flex-1 px-4">

          <ul className="space-y-2">

            {menus.map((menu) => {
              const Icon =
                menu.icon;

              const active =
                pathname ===
                menu.href;

              return (
                <li
                  key={
                    menu.name
                  }
                >
                  <Link
                    href={
                      menu.href
                    }
                    className={`
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-2xl
                    transition-all

                    ${
                      active
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                    }
                  `}
                  >
                    <Icon
                      size={20}
                    />

                    <span>
                      {menu.name}
                    </span>

                  </Link>

                </li>
              );
            })}

          </ul>

        </nav>

        {/* Logout */}

        <div className="p-4 border-t">

          <button
            onClick={
              handleLogout
            }
            className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-3
            rounded-2xl
            bg-red-50
            text-red-600
            hover:bg-red-100
            transition
          "
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

    </>
  );
}