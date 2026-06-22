"use client";

import {
  Bell,
  Search,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

export default function Header() {
  const [nama, setNama] =
    useState("User");

  const [role, setRole] =
    useState("");

  useEffect(() => {
    setNama(
      localStorage.getItem(
        "userName"
      ) || "Owner"
    );

    setRole(
      localStorage.getItem(
        "role"
      ) || ""
    );
  }, []);

  const today =
    new Date().toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  return (
    <header className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        {/* Left */}

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Poultry Dashboard
          </h1>

          <div className="flex items-center gap-2 mt-2 text-gray-500">

            <CalendarDays size={16} />

            <span className="text-sm">
              {today}
            </span>

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-4">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Cari data..."
              className="
              w-64
              bg-gray-50
              border
              border-gray-200
              rounded-2xl
              py-3
              pl-11
              pr-4
              outline-none
              focus:border-green-500
              focus:ring-2
              focus:ring-green-100
            "
            />

          </div>

          <button
            className="
            relative
            w-12
            h-12
            rounded-2xl
            border
            border-gray-200
            flex
            items-center
            justify-center
            hover:bg-gray-50
          "
          >
            <Bell size={20} />

            <span
              className="
              absolute
              top-2
              right-2
              w-2.5
              h-2.5
              rounded-full
              bg-red-500
            "
            />
          </button>

          <button
            className="
            flex
            items-center
            gap-3
            bg-gray-50
            hover:bg-gray-100
            px-3
            py-2
            rounded-2xl
          "
          >

            <img
              src="https://i.pravatar.cc/150"
              alt="Profile"
              className="
              w-11
              h-11
              rounded-full
              object-cover
            "
            />

            <div className="text-left hidden sm:block">

              <h4 className="font-semibold text-gray-800 capitalize">
                {nama}
              </h4>

              <p className="text-xs text-gray-500 capitalize">
                {role}
              </p>

            </div>

            <ChevronDown
              size={16}
              className="text-gray-400"
            />

          </button>

        </div>

      </div>

    </header>
  );
}