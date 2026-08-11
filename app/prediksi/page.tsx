"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bird,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Info,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { db } from "@/lib/firebase";

type DailyData = {
  dateKey: string;
  date: Date;
  besar: number;
  sedang: number;
  kecil: number;
  total: number;
};

type CategoryEvaluation = {
  available: boolean;
  message: string;
  trainDays: number;
  testDays: number;
  trainStart?: string;
  trainEnd?: string;
  testStart?: string;
  testEnd?: string;
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    samples: number;
  };
  testData: Array<{
    date: string;
    actual: number;
    predicted: number;
  }>;
};

type Prediction = {
  model: string;
  historyDays: number;
  forecastDays: number;
  training: {
    method: string;
    trainRatio: number;
    testRatio: number;
    note: string;
  };
  evaluation: {
    overall: {
      mae: number;
      rmse: number;
      mape: number;
    };
    categories: {
      besar: CategoryEvaluation;
      sedang: CategoryEvaluation;
      kecil: CategoryEvaluation;
    };
  };
  predictions: {
    besar: number;
    sedang: number;
    kecil: number;
    total: number;
  };
  dailyPredictions: Array<{
    date: string;
    besar: number;
    sedang: number;
    kecil: number;
    total: number;
  }>;
};

type Stock = {
  besar: number;
  sedang: number;
  kecil: number;
  total: number;
};

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("id-ID");
}

function formatDecimal(value: number) {
  return Number(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDate(value: unknown, createdAt: any): Date | null {
  if (typeof value === "string" && value.trim()) {
    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }

  if (createdAt?.toDate) return createdAt.toDate();

  return null;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PrediksiPage() {
  const [transactions, setTransactions] = useState<DailyData[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [forecastDays, setForecastDays] = useState(7);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(
      collection(db, "ayamKeluar"),
      (snapshot) => {
        const raw: DailyData[] = [];

        snapshot.forEach((document) => {
          const data = document.data();
          const date = parseDate(data.tanggal, data.createdAt);

          if (!date) return;

          raw.push({
            dateKey: dateKey(date),
            date,
            besar: Number(data.ayamBesar) || 0,
            sedang: Number(data.ayamSedang) || 0,
            kecil: Number(data.ayamKecil) || 0,
            total: Number(data.total) || 0,
          });
        });

        const grouped = new Map<string, DailyData>();

        raw.forEach((item) => {
          const existing = grouped.get(item.dateKey);

          if (existing) {
            existing.besar += item.besar;
            existing.sedang += item.sedang;
            existing.kecil += item.kecil;
            existing.total += item.total;
          } else {
            grouped.set(item.dateKey, { ...item });
          }
        });

        const result = Array.from(grouped.values()).sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );

        setTransactions(result);

        if (result.length) {
          setStartDate((value) => value || result[0].dateKey);
          setEndDate(
            (value) => value || result[result.length - 1].dateKey
          );
        }

        setLoading(false);
      },
      (firebaseError) => {
        console.error(firebaseError);
        setLoading(false);
        setError("Data ayam keluar gagal dimuat dari Firebase.");
      }
    );
  }, []);

  const filteredData = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return [];

    return transactions.filter(
      (item) =>
        item.dateKey >= startDate &&
        item.dateKey <= endDate
    );
  }, [transactions, startDate, endDate]);

  const summary = useMemo(
    () =>
      filteredData.reduce(
        (result, item) => ({
          besar: result.besar + item.besar,
          sedang: result.sedang + item.sedang,
          kecil: result.kecil + item.kecil,
          total: result.total + item.total,
        }),
        { besar: 0, sedang: 0, kecil: 0, total: 0 }
      ),
    [filteredData]
  );

  const runPrediction = useCallback(async () => {
    if (startDate > endDate) {
      setError("Tanggal mulai tidak boleh melewati tanggal akhir.");
      return;
    }

    if (!filteredData.length) {
      setPrediction(null);
      setError("Tidak ada data pada rentang tanggal yang dipilih.");
      return;
    }

    setPredicting(true);
    setError("");

    try {
      const response = await fetch("/api/prediksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: filteredData.map((item) => ({
            date: item.dateKey,
            besar: item.besar,
            sedang: item.sedang,
            kecil: item.kecil,
            total: item.total,
          })),
          forecastDays,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Prediksi Prophet gagal dibuat."
        );
      }

      setPrediction(result);
    } catch (predictionError) {
      console.error(predictionError);
      setPrediction(null);
      setError(
        predictionError instanceof Error
          ? predictionError.message
          : "Prediksi Prophet gagal dibuat."
      );
    } finally {
      setPredicting(false);
    }
  }, [filteredData, startDate, endDate, forecastDays]);

  useEffect(() => {
    if (!filteredData.length) return;
    runPrediction();
  }, [filteredData, forecastDays, runPrediction]);

  const stock = useRealtimeStock();

  const recommendation = useMemo(() => {
    if (!prediction) {
      return { besar: 0, sedang: 0, kecil: 0, total: 0 };
    }

    const besar = Math.max(
      0,
      Math.ceil(
        prediction.predictions.besar +
          Math.ceil(Math.max(stock.besar, 0) * 0.1) -
          stock.besar
      )
    );

    const sedang = Math.max(
      0,
      Math.ceil(
        prediction.predictions.sedang +
          Math.ceil(Math.max(stock.sedang, 0) * 0.1) -
          stock.sedang
      )
    );

    const kecil = Math.max(
      0,
      Math.ceil(
        prediction.predictions.kecil +
          Math.ceil(Math.max(stock.kecil, 0) * 0.1) -
          stock.kecil
      )
    );

    return {
      besar,
      sedang,
      kecil,
      total: besar + sedang + kecil,
    };
  }, [prediction, stock]);

  const applyQuickRange = (days: number) => {
    if (!transactions.length) return;

    const end = transactions[transactions.length - 1].date;
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);

    setStartDate(dateKey(start));
    setEndDate(dateKey(end));
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <span>Inventory</span>
                <ChevronRight size={13} />
                <span className="text-emerald-600">Prediksi</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Sparkles size={21} className="text-emerald-600" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Prediksi Kebutuhan Ayam
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Training, evaluasi, dan forecasting menggunakan Prophet.
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-gray-600">
                Firebase Live
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
              <AlertTriangle size={17} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Perhatian
                </p>
                <p className="text-xs text-amber-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-emerald-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Periode Training & Forecasting
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Data ayam keluar pada periode ini akan dipakai untuk training,
                  evaluasi, lalu model final digunakan untuk forecast.
                </p>
              </div>

              <button
                type="button"
                onClick={runPrediction}
                disabled={predicting || loading || !filteredData.length}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold transition"
              >
                <RefreshCw size={15} className={predicting ? "animate-spin" : ""} />
                {predicting ? "Training & Evaluasi..." : "Jalankan Training"}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <DateField label="Tanggal Mulai" value={startDate} onChange={setStartDate} />
              <DateField label="Tanggal Akhir" value={endDate} onChange={setEndDate} />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Forecast Ke Depan
                </label>
                <select
                  value={forecastDays}
                  onChange={(event) => setForecastDays(Number(event.target.value))}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value={7}>7 hari</option>
                  <option value={14}>14 hari</option>
                  <option value={30}>30 hari</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <QuickButton label="7 Hari" onClick={() => applyQuickRange(7)} />
              <QuickButton label="14 Hari" onClick={() => applyQuickRange(14)} />
              <QuickButton label="30 Hari" onClick={() => applyQuickRange(30)} />
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              title="Data Training"
              value={prediction?.evaluation.categories.besar.trainDays || 0}
              suffix="hari"
              description="80% data awal"
              icon={<Target size={19} />}
              color="sky"
            />
            <KpiCard
              title="Data Testing"
              value={prediction?.evaluation.categories.besar.testDays || 0}
              suffix="hari"
              description="20% data terbaru"
              icon={<BarChart3 size={19} />}
              color="violet"
            />
            <KpiCard
              title="MAPE Rata-rata"
              value={prediction?.evaluation.overall.mape || 0}
              suffix="%"
              description="Semakin kecil semakin baik"
              icon={<TrendingUp size={19} />}
              color="emerald"
            />
            <KpiCard
              title="Forecast"
              value={prediction?.predictions.total || 0}
              suffix="ekor"
              description={`${forecastDays} hari ke depan`}
              icon={<Sparkles size={19} />}
              color="amber"
            />
          </section>

          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<Target size={18} />}
              title="Training Data & Evaluasi Model"
              description="Model diuji menggunakan chronological holdout agar data masa depan tidak masuk ke training."
            />

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EvaluationCard
                  title="MAE"
                  value={prediction?.evaluation.overall.mae || 0}
                  unit="ekor"
                  description="Rata-rata selisih absolut prediksi terhadap aktual."
                />
                <EvaluationCard
                  title="RMSE"
                  value={prediction?.evaluation.overall.rmse || 0}
                  unit="ekor"
                  description="Memberi penalti lebih besar pada error yang besar."
                />
                <EvaluationCard
                  title="MAPE"
                  value={prediction?.evaluation.overall.mape || 0}
                  unit="%"
                  description="Persentase error absolut rata-rata."
                />
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <Info size={17} className="text-sky-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Skema evaluasi
                    </p>
                    <p className="text-xs leading-5 text-gray-500 mt-1">
                      Data diurutkan berdasarkan tanggal. 80% data paling awal
                      digunakan sebagai training, sedangkan 20% data terbaru
                      digunakan sebagai testing. Setelah evaluasi selesai,
                      model Prophet dilatih kembali menggunakan seluruh data
                      untuk membuat forecast ke depan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-100">
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500">
                        Training
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500">
                        Testing
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500">
                        MAE
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500">
                        RMSE
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500">
                        MAPE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["besar", "sedang", "kecil"] as const).map((category) => {
                      const item = prediction?.evaluation.categories[category];

                      return (
                        <tr key={category} className="border-b border-gray-50">
                          <td className="px-4 py-3.5 font-semibold text-gray-800">
                            Ayam {category[0].toUpperCase() + category.slice(1)}
                          </td>
                          <td className="px-4 py-3.5 text-center text-gray-600">
                            {item?.trainDays || 0} hari
                          </td>
                          <td className="px-4 py-3.5 text-center text-gray-600">
                            {item?.testDays || 0} hari
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold">
                            {formatDecimal(item?.metrics.mae || 0)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold">
                            {formatDecimal(item?.metrics.rmse || 0)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-emerald-700">
                            {formatDecimal(item?.metrics.mape || 0)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PredictionCard
              title="Ayam Besar"
              actual={summary.besar}
              prediction={prediction?.predictions.besar || 0}
              stock={stock.besar}
              recommendation={recommendation.besar}
            />
            <PredictionCard
              title="Ayam Sedang"
              actual={summary.sedang}
              prediction={prediction?.predictions.sedang || 0}
              stock={stock.sedang}
              recommendation={recommendation.sedang}
            />
            <PredictionCard
              title="Ayam Kecil"
              actual={summary.kecil}
              prediction={prediction?.predictions.kecil || 0}
              stock={stock.kecil}
              recommendation={recommendation.kecil}
            />
          </section>

          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<BarChart3 size={18} />}
              title="Data Testing: Aktual vs Prediksi"
              description="Bagian ini menunjukkan bagaimana model bekerja pada data yang tidak digunakan saat training."
            />

            <div className="p-5 sm:p-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
              {(["besar", "sedang", "kecil"] as const).map((category) => {
                const item = prediction?.evaluation.categories[category];

                return (
                  <div key={category} className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">
                        Ayam {category[0].toUpperCase() + category.slice(1)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Data testing
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2 text-left text-gray-400">
                              Tanggal
                            </th>
                            <th className="px-3 py-2 text-right text-gray-400">
                              Aktual
                            </th>
                            <th className="px-3 py-2 text-right text-gray-400">
                              Prediksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(item?.testData || []).map((row) => (
                            <tr key={row.date} className="border-b border-gray-50">
                              <td className="px-3 py-2.5 text-gray-600">
                                {row.date}
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold">
                                {formatDecimal(row.actual)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-violet-700 font-semibold">
                                {formatDecimal(row.predicted)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={<Sparkles size={18} />}
              title="Forecast Kebutuhan"
              description="Setelah evaluasi, model dilatih menggunakan seluruh data periode untuk memprediksi kebutuhan ke depan."
            />

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <ForecastMetric
                  title="Ayam Besar"
                  value={prediction?.predictions.besar || 0}
                />
                <ForecastMetric
                  title="Ayam Sedang"
                  value={prediction?.predictions.sedang || 0}
                />
                <ForecastMetric
                  title="Ayam Kecil"
                  value={prediction?.predictions.kecil || 0}
                />
                <ForecastMetric
                  title="Total"
                  value={prediction?.predictions.total || 0}
                  highlighted
                />
              </div>

              <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Model: {prediction?.model || "Prophet"}
                  </p>
                  <p className="text-xs leading-5 text-emerald-700 mt-1">
                    Forecast dihitung setelah training dan evaluasi. Data
                    aktual tetap berasal dari transaksi ayam keluar realtime.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function useRealtimeStock(): Stock {
  const [stock, setStock] = useState<Stock>({
    besar: 0,
    sedang: 0,
    kecil: 0,
    total: 0,
  });

  useEffect(() => {
    let incoming = { besar: 0, sedang: 0, kecil: 0 };
    let outgoing = { besar: 0, sedang: 0, kecil: 0 };

    const update = () => {
      const besar = incoming.besar - outgoing.besar;
      const sedang = incoming.sedang - outgoing.sedang;
      const kecil = incoming.kecil - outgoing.kecil;

      setStock({
        besar,
        sedang,
        kecil,
        total: besar + sedang + kecil,
      });
    };

    const unsubIncoming = onSnapshot(
      collection(db, "ayamMasuk"),
      (snapshot) => {
        incoming = { besar: 0, sedang: 0, kecil: 0 };

        snapshot.forEach((document) => {
          const data = document.data();
          incoming.besar += Number(data.ayamBesar) || 0;
          incoming.sedang += Number(data.ayamSedang) || 0;
          incoming.kecil += Number(data.ayamKecil) || 0;
        });

        update();
      }
    );

    const unsubOutgoing = onSnapshot(
      collection(db, "ayamKeluar"),
      (snapshot) => {
        outgoing = { besar: 0, sedang: 0, kecil: 0 };

        snapshot.forEach((document) => {
          const data = document.data();
          outgoing.besar += Number(data.ayamBesar) || 0;
          outgoing.sedang += Number(data.ayamSedang) || 0;
          outgoing.kecil += Number(data.ayamKecil) || 0;
        });

        update();
      }
    );

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, []);

  return stock;
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}

function QuickButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 px-3.5 rounded-lg border border-emerald-100 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
    >
      {label}
    </button>
  );
}

function KpiCard({
  title,
  value,
  suffix,
  description,
  icon,
  color,
}: {
  title: string;
  value: number;
  suffix: string;
  description: string;
  icon: React.ReactNode;
  color: "sky" | "violet" | "emerald" | "amber";
}) {
  const colors = {
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              {formatDecimal(value)}
            </span>
            <span className="text-[11px] text-gray-400">{suffix}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{description}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function EvaluationCard({
  title,
  value,
  unit,
  description,
}: {
  title: string;
  value: number;
  unit: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-bold text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {formatDecimal(value)}
        <span className="text-xs font-medium text-gray-400 ml-1">{unit}</span>
      </p>
      <p className="text-[11px] leading-5 text-gray-400 mt-1.5">{description}</p>
    </div>
  );
}

function PredictionCard({
  title,
  actual,
  prediction,
  stock,
  recommendation,
}: {
  title: string;
  actual: number;
  prediction: number;
  stock: number;
  recommendation: number;
}) {
  const enough = stock >= prediction;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Bird size={17} className="text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${
          enough ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}>
          {enough ? "Cukup" : "Perlu Tambahan"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMetric label="Aktual Periode" value={actual} />
        <MiniMetric label="Forecast" value={prediction} />
        <MiniMetric label="Stok Saat Ini" value={stock} />
        <MiniMetric label="Disediakan" value={recommendation} />
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-gray-800">
        {formatDecimal(value)}
      </p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ForecastMetric({
  title,
  value,
  highlighted = false,
}: {
  title: string;
  value: number;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${
      highlighted
        ? "bg-emerald-50 border-emerald-100"
        : "bg-gray-50 border-gray-100"
    }`}>
      <p className="text-xs font-semibold text-gray-400">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${
        highlighted ? "text-emerald-700" : "text-gray-900"
      }`}>
        {formatNumber(value)}
      </p>
      <p className="text-[11px] text-gray-400 mt-1">ekor</p>
    </div>
  );
}