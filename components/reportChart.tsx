"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const data = [
  {
    bulan: "Jan",
    masuk: 420,
    keluar: 300,
  },
  {
    bulan: "Feb",
    masuk: 520,
    keluar: 400,
  },
  {
    bulan: "Mar",
    masuk: 610,
    keluar: 450,
  },
  {
    bulan: "Apr",
    masuk: 700,
    keluar: 520,
  },
  {
    bulan: "Mei",
    masuk: 830,
    keluar: 620,
  },
  {
    bulan: "Jun",
    masuk: 920,
    keluar: 700,
  },
];

export default function ReportChart() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Grafik Transaksi Ayam
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Statistik Ayam Masuk dan Ayam Keluar
          </p>
        </div>

      </div>

      {/* Chart */}

      <div className="h-[400px]">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >

            <defs>

              <linearGradient
                id="colorMasuk"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#16A34A"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#16A34A"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="colorKeluar"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#EF4444"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#EF4444"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis dataKey="bulan" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Area
              type="monotone"
              dataKey="masuk"
              stroke="#16A34A"
              fillOpacity={1}
              fill="url(#colorMasuk)"
              strokeWidth={3}
              name="Ayam Masuk"
            />

            <Area
              type="monotone"
              dataKey="keluar"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorKeluar)"
              strokeWidth={3}
              name="Ayam Keluar"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}