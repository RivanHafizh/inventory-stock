"use client";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [nama, setNama] = useState("Owner");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("role");

    setNama(storedName?.trim() || "Owner");
    setRole(storedRole?.trim() || "Admin");
  }, []);

  const today = new Date().toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const initial =
    nama.trim().charAt(0).toUpperCase() || "O";

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* BRAND / DATE */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CalendarDays
                  size={19}
                  className="text-emerald-600"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 truncate">
                  SIMBOLON Inventory
                </h1>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400">
                    {today}
                  </span>

                  <span className="w-1 h-1 rounded-full bg-gray-300" />

                  <span className="text-xs font-medium text-emerald-600">
                    Inventory System
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
           
            {/* PROFILE */}
            <button
              type="button"
              aria-label="Menu profil"
              className="flex items-center gap-2.5 h-10 pl-1.5 pr-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initial}
              </div>

              <div className="hidden sm:block text-left min-w-0 max-w-[130px]">
                <p className="text-xs font-bold text-gray-800 truncate capitalize">
                  {nama}
                </p>

                <p className="text-[10px] text-gray-400 truncate capitalize mt-0.5">
                  {role}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}