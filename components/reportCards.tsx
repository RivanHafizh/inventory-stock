interface ReportCardsProps {
  totalMasuk: number;
  totalKeluar: number;
  totalStok: number;
}

export default function ReportCards({
  totalMasuk,
  totalKeluar,
  totalStok,
}: ReportCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <p className="text-gray-500">
          Total Ayam Masuk
        </p>

        <h2 className="text-4xl font-bold text-green-600 mt-3">
          {totalMasuk}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <p className="text-gray-500">
          Total Ayam Keluar
        </p>

        <h2 className="text-4xl font-bold text-red-500 mt-3">
          {totalKeluar}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <p className="text-gray-500">
          Stok Saat Ini
        </p>

        <h2 className="text-4xl font-bold text-blue-600 mt-3">
          {totalStok}
        </h2>
      </div>

    </div>
  );
}