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

export interface ReportItem {
  id: string;
  jenis: "Masuk" | "Keluar";
  tanggal: Date;
  total: number;
}

interface ReportChartProps {
  laporan: ReportItem[];
}

export default function ReportChart({
  laporan,
}: ReportChartProps) {

  const monthlyData = Array.from(
    { length: 12 },
    (_, index) => {
      const bulan = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ][index];

      const masuk = laporan
        .filter(
          (item) =>
            item.jenis === "Masuk" &&
            item.tanggal.getMonth() === index
        )
        .reduce(
          (sum, item) =>
            sum + item.total,
          0
        );

      const keluar = laporan
        .filter(
          (item) =>
            item.jenis === "Keluar" &&
            item.tanggal.getMonth() === index
        )
        .reduce(
          (sum, item) =>
            sum + item.total,
          0
        );

      return {
        bulan,
        masuk,
        keluar,
      };
    }
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <h2 className="text-xl font-bold text-black mb-1">
        Grafik Transaksi Ayam
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Statistik ayam masuk dan keluar
      </p>

      <div className="h-[400px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart data={monthlyData}>

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
              fill="url(#colorMasuk)"
              strokeWidth={3}
              name="Ayam Masuk"
            />

            <Area
              type="monotone"
              dataKey="keluar"
              stroke="#EF4444"
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