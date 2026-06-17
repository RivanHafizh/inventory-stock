"use client";

import {
  Bell,
  Search,
} from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm">

      {/* Left */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Overview aktivitas inventory ayam
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Cari..."
            className="w-72 bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-green-500"
          />
        </div>

        {/* Notification */}
        <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50">
          <Bell size={20} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">

          <img
            src="https://i.pravatar.cc/100"
            alt="Admin"
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <h4 className="font-semibold">
              Admin
            </h4>

            <p className="text-sm text-gray-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}