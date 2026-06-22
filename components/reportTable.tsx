interface ReportItem {
  id: string;
  jenis: "Masuk" | "Keluar";
  tanggal: Date;
  namaKlien?: string;
  ayamBesar: number;
  ayamSedang: number;
  ayamKecil: number;
  total: number;
}

interface ReportTableProps {
  laporan: ReportItem[];
}

export default function ReportTable({
  laporan,
}: ReportTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">
        Data Laporan
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-4">
                No
              </th>

              <th className="text-left py-4">
                Tanggal
              </th>

              <th className="text-left py-4">
                Jenis
              </th>

              <th className="text-left py-4">
                Klien
              </th>

              <th className="text-left py-4">
                Besar
              </th>

              <th className="text-left py-4">
                Sedang
              </th>

              <th className="text-left py-4">
                Kecil
              </th>

              <th className="text-left py-4">
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {laporan.map(
              (
                item,
                index
              ) => (
                <tr
                  key={item.id}
                  className="border-b"
                >

                  <td className="py-4">
                    {index + 1}
                  </td>

                  <td>
                    {item.tanggal.toLocaleDateString(
                      "id-ID"
                    )}
                  </td>

                  <td>
                    {item.jenis}
                  </td>

                  <td>
                    {item.namaKlien || "-"}
                  </td>

                  <td>
                    {item.ayamBesar}
                  </td>

                  <td>
                    {item.ayamSedang}
                  </td>

                  <td>
                    {item.ayamKecil}
                  </td>

                  <td>
                    {item.total}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}